const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'images');
const OUT_DIR = path.join(ROOT, 'tmp');
const REPORT_JSON = path.join(OUT_DIR, 'image-asset-audit.json');
const REPORT_MD = path.join(OUT_DIR, 'image-asset-audit.md');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);
const MEDIA_EXTS = new Set(['.mp4', '.webm']);
const ASSET_EXTS = new Set([...IMAGE_EXTS, ...MEDIA_EXTS]);
const SOURCE_EXTS = new Set(['.html', '.css', '.js', '.json']);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tmp']);

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function rel(filePath) {
  return toPosix(path.relative(ROOT, filePath));
}

function walk(dir, includeFile) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(path.join(dir, entry.name), includeFile));
      continue;
    }
    const full = path.join(dir, entry.name);
    if (!includeFile || includeFile(full)) out.push(full);
  }
  return out;
}

function isAuditSource(file) {
  const relative = rel(file);
  return !relative.startsWith('scripts/');
}

function isArchiveAsset(asset) {
  return asset.toLowerCase().split('/').includes('_archive');
}

function isSourceAsset(asset) {
  const lower = asset.toLowerCase();
  const name = path.posix.basename(lower);
  const segments = lower.split('/');
  return name.includes('source') || segments.includes('_source') || segments.includes('manual-source');
}

function siblingWebp(asset, assetSet) {
  const parsed = path.posix.parse(asset);
  const candidate = `${parsed.dir}/${parsed.name}.webp`;
  return assetSet.has(candidate) ? candidate : '';
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function lineRanges(text, startNeedle, endNeedle) {
  const start = text.indexOf(startNeedle);
  if (start < 0) return [];
  const end = endNeedle ? text.indexOf(endNeedle, start + startNeedle.length) : text.length;
  const before = text.slice(0, start).split(/\r?\n/).length;
  const inside = text.slice(start, end > start ? end : text.length).split(/\r?\n/).length;
  return [{ start: before, end: before + inside - 1 }];
}

function inRanges(lineNumber, ranges) {
  return ranges.some(range => lineNumber >= range.start && lineNumber <= range.end);
}

function classifyReference(source, lineNumber, lineText, ranges) {
  const trimmed = lineText.trim();
  if (source === 'js/core/state.js' && inRanges(lineNumber, ranges.assetGroups)) return 'preload-only';
  if (source.endsWith('.css')) return 'css-runtime';
  if (source.endsWith('.html')) {
    if (/<(?:img|source|link)\b/i.test(trimmed)) return 'html-runtime';
    return 'html-reference';
  }
  if (/\|\||fallback|default|placeholder/i.test(trimmed)) return 'fallback-like';
  return 'js-runtime';
}

function addUse(uses, rawAsset, source, lineNumber, reason, lineText) {
  const normalized = rawAsset.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '').replace(/[?#].*$/, '');
  if (!normalized.startsWith('images/')) return;
  if (!uses.has(normalized)) uses.set(normalized, []);
  uses.get(normalized).push({
    source,
    line: lineNumber,
    reason,
    context: lineText.trim().slice(0, 180),
  });
}

function scanDirectReferences(sourceFiles, uses) {
  const imageRefPattern = /(?:\.\.\/|\.\/)?images\/[^"'`\s)]+/g;
  for (const file of sourceFiles) {
    const source = rel(file);
    const text = fs.readFileSync(file, 'utf8');
    const ranges = {
      assetGroups: source === 'js/core/state.js' ? lineRanges(text, 'const GAME_ASSET_GROUPS', 'const assetImageCache') : [],
    };
    text.split(/\r?\n/).forEach((lineText, index) => {
      const lineNumber = index + 1;
      for (const match of lineText.matchAll(imageRefPattern)) {
        const reason = classifyReference(source, lineNumber, lineText, ranges);
        addUse(uses, match[0], source, lineNumber, reason, lineText);
      }
    });
  }
}

function markDynamicReferences(imageAssets, uses) {
  const craftingPath = path.join(ROOT, 'js', 'data', 'crafting.js');
  const craftingText = fs.existsSync(craftingPath) ? fs.readFileSync(craftingPath, 'utf8') : '';
  const craftIds = new Set();
  const defsStart = craftingText.indexOf('const CRAFT_ITEM_DEFS');
  const defsEnd = craftingText.indexOf('const CRAFT_ITEM_EFFECT_UPGRADES');
  if (defsStart >= 0 && defsEnd > defsStart) {
    const defsText = craftingText.slice(defsStart, defsEnd);
    for (const match of defsText.matchAll(/^\s{2}([a-zA-Z0-9_]+):\{/gm)) craftIds.add(match[1]);
  }

  for (const asset of imageAssets) {
    const parsed = path.posix.parse(asset);
    if (asset.startsWith('images/workbench/items/') && craftIds.has(parsed.name)) {
      addUse(uses, asset, 'js/ui/workbench.js', 3, 'dynamic-runtime', 'craftItemIconSrc(itemId)');
    }
    if (/^images\/ore-nodes\/.+-[0-5]\.png$/.test(asset)) {
      addUse(uses, asset, 'js/core/state.js', 231, 'dynamic-runtime', 'images/ore-nodes/${spritePrefix}-${stage}.png');
    }
    if (/^images\/tavern\/gambling\/dice\/dice-[1-6]\.png$/.test(asset)) {
      addUse(uses, asset, 'js/tavern.js', 1326, 'dynamic-runtime', 'images/tavern/gambling/dice/dice-${value}.png');
    }
    if (/^images\/tavern\/gambling\/dice\/dice-cup-(normal|hover|raised|shake-1|shake-2)\.png$/.test(asset)) {
      addUse(uses, asset, 'js/tavern.js', 1360, 'dynamic-runtime', 'images/tavern/gambling/dice/dice-cup-${cup}.png');
    }
  }
}

function uniqueUses(entries) {
  const seen = new Set();
  return entries.filter(entry => {
    const key = `${entry.source}|${entry.line}|${entry.reason}|${entry.context}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function hasOnlyReasons(asset, uses, allowedReasons) {
  const entries = uses.get(asset) || [];
  return entries.length > 0 && entries.every(entry => allowedReasons.has(entry.reason));
}

function hasRuntimeReason(asset, uses) {
  const entries = uses.get(asset) || [];
  return entries.some(entry => !['preload-only', 'fallback-like', 'html-reference'].includes(entry.reason));
}

function buildDuplicateGroups(assets) {
  const byHash = new Map();
  for (const asset of assets) {
    const full = path.join(ROOT, asset);
    if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full);
    const hash = hashFile(full);
    if (!byHash.has(hash)) byHash.set(hash, []);
    byHash.get(hash).push({ asset, bytes: stat.size });
  }
  return Array.from(byHash.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([hash, entries]) => ({ hash, bytes: entries[0].bytes, assets: entries.map(entry => entry.asset).sort() }))
    .sort((a, b) => b.bytes - a.bytes);
}

function buildSameNameGroups(assets) {
  const byName = new Map();
  for (const asset of assets) {
    const name = path.posix.basename(asset).toLowerCase();
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(asset);
  }
  return Array.from(byName.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([name, entries]) => ({ name, assets: entries.sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderList(lines, title, items, mapper = item => `- ${item}`) {
  lines.push(`## ${title}`);
  lines.push('');
  if (items.length) items.forEach(item => lines.push(mapper(item)));
  else lines.push('- None');
  lines.push('');
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Image Asset Audit');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total image/media assets: ${report.summary.totalAssets}`);
  lines.push(`- Active assets outside _archive: ${report.summary.activeAssets}`);
  lines.push(`- Runtime-scope assets outside _archive/_source: ${report.summary.runtimeScopeAssets}`);
  lines.push(`- Source/reference assets outside _archive: ${report.summary.sourceAssets}`);
  lines.push(`- Archived assets: ${report.summary.archivedAssets}`);
  lines.push(`- Used active assets: ${report.summary.usedAssets}`);
  lines.push(`- True runtime used assets: ${report.summary.runtimeUsedAssets}`);
  lines.push(`- Referenced only by preload: ${report.summary.preloadOnlyAssets}`);
  lines.push(`- Referenced only by fallback/reference code: ${report.summary.referenceOnlyAssets}`);
  lines.push(`- Unused runtime candidates: ${report.summary.unusedRuntimeCandidates}`);
  lines.push(`- Missing referenced image paths: ${report.summary.missingReferences}`);
  lines.push(`- Duplicate runtime file groups: ${report.summary.runtimeDuplicateGroups}`);
  lines.push(`- Duplicate source/reference file groups: ${report.summary.sourceDuplicateGroups}`);
  lines.push(`- Duplicate active/archive file groups: ${report.summary.activeArchiveDuplicateGroups}`);
  lines.push(`- Used PNG/JPG assets without WebP sibling: ${report.summary.usedRasterWithoutWebp}`);
  lines.push('');

  renderList(lines, 'Missing References To Fix First', report.missingReferences, item => `- ${item.asset} (${item.uses.map(use => `${use.source}:${use.line} ${use.reason}`).join(', ')})`);
  renderList(lines, 'Referenced Only By Preload', report.preloadOnlyAssets);
  renderList(lines, 'Referenced Only By Fallback Or Reference Code', report.referenceOnlyAssets);
  renderList(lines, 'Unused Runtime Candidates', report.unusedRuntimeCandidates);
  renderList(lines, 'WebP Conversion Candidates', report.webpCandidates);
  renderList(lines, 'Used PNG/JPG With Existing WebP Sibling', report.usedAssetsWithWebpSibling, item => `- ${item.asset} -> ${item.webp}`);
  renderList(lines, 'Duplicate Runtime Files By Content', report.runtimeDuplicateGroups, group => `- ${group.bytes} bytes: ${group.assets.join(' | ')}`);
  renderList(lines, 'Duplicate Source/Reference Files By Content', report.sourceDuplicateGroups, group => `- ${group.bytes} bytes: ${group.assets.join(' | ')}`);
  renderList(lines, 'Duplicate Active And Archive Files By Content', report.activeArchiveDuplicateGroups, group => `- ${group.bytes} bytes: ${group.assets.join(' | ')}`);
  renderList(lines, 'Same Filename In Multiple Locations', report.sameNameGroups, group => `- ${group.name}: ${group.assets.join(' | ')}`);
  renderList(lines, 'Unused Source Or Reference Assets', report.unusedSourceAssets);

  lines.push('## Notes');
  lines.push('');
  lines.push('- Fix missing references before moving more images.');
  lines.push('- Delete nothing directly from the first report. Move uncertain files to `_archive/` first, then run the game and audit again.');
  lines.push('- `preload-only` means the file is listed in `GAME_ASSET_GROUPS` but not otherwise found in runtime markup, CSS, or JS.');
  lines.push('- `fallback-like` means the reference appears in fallback/default code and may only load when primary data is missing.');
  lines.push('- Dynamic craft item icons are marked used when their file name matches a `CRAFT_ITEM_DEFS` id.');
  lines.push('- Ore node stage sprites are marked used because they are loaded from generated `round-<ore>-<stage>.png` paths.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  const imageAssets = walk(IMAGE_DIR, file => ASSET_EXTS.has(path.extname(file).toLowerCase())).map(rel).sort();
  const imageAssetSet = new Set(imageAssets);
  const sourceFiles = walk(ROOT, file => SOURCE_EXTS.has(path.extname(file).toLowerCase()) && isAuditSource(file));
  const uses = new Map();

  scanDirectReferences(sourceFiles, uses);
  markDynamicReferences(imageAssets, uses);

  const activeAssets = imageAssets.filter(asset => !isArchiveAsset(asset));
  const sourceAssets = activeAssets.filter(isSourceAsset);
  const runtimeScopeAssets = activeAssets.filter(asset => !isSourceAsset(asset));
  const archivedAssets = imageAssets.filter(isArchiveAsset);
  const activeAssetSet = new Set(activeAssets);
  const referencedAssets = Array.from(uses.keys()).sort();
  const missingReferences = referencedAssets
    .filter(asset => !asset.includes('${') && !asset.includes('{') && !asset.includes('...'))
    .filter(asset => !imageAssetSet.has(asset))
    .map(asset => ({ asset, uses: uniqueUses(uses.get(asset) || []) }));

  const usedAssets = activeAssets.filter(asset => uses.has(asset));
  const runtimeUsedAssets = runtimeScopeAssets.filter(asset => uses.has(asset) && hasRuntimeReason(asset, uses));
  const preloadOnlyAssets = runtimeScopeAssets.filter(asset => uses.has(asset) && hasOnlyReasons(asset, uses, new Set(['preload-only'])));
  const referenceOnlyAssets = usedAssets.filter(asset => {
    if (preloadOnlyAssets.includes(asset) || isSourceAsset(asset)) return false;
    return !hasRuntimeReason(asset, uses);
  });
  const unusedAssets = activeAssets.filter(asset => !uses.has(asset));
  const unusedSourceAssets = sourceAssets.filter(asset => !uses.has(asset));
  const unusedRuntimeCandidates = runtimeScopeAssets.filter(asset => !uses.has(asset));
  const webpCandidates = runtimeUsedAssets.filter(asset => {
    const ext = path.posix.extname(asset).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext) && !siblingWebp(asset, activeAssetSet) && !isSourceAsset(asset);
  });
  const usedAssetsWithWebpSibling = runtimeUsedAssets
    .map(asset => ({ asset, webp: siblingWebp(asset, activeAssetSet) }))
    .filter(entry => entry.webp && entry.asset !== entry.webp);
  const duplicateGroups = buildDuplicateGroups(imageAssets);
  const runtimeDuplicateGroups = buildDuplicateGroups(runtimeScopeAssets);
  const sourceDuplicateGroups = buildDuplicateGroups(sourceAssets);
  const activeArchiveDuplicateGroups = duplicateGroups.filter(group => {
    const hasActive = group.assets.some(asset => !isArchiveAsset(asset));
    const hasArchive = group.assets.some(isArchiveAsset);
    return hasActive && hasArchive;
  });
  const sameNameGroups = buildSameNameGroups(imageAssets);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalAssets: imageAssets.length,
      activeAssets: activeAssets.length,
      runtimeScopeAssets: runtimeScopeAssets.length,
      archivedAssets: archivedAssets.length,
      usedAssets: usedAssets.length,
      runtimeUsedAssets: runtimeUsedAssets.length,
      preloadOnlyAssets: preloadOnlyAssets.length,
      referenceOnlyAssets: referenceOnlyAssets.length,
      unusedAssets: unusedAssets.length,
      unusedRuntimeCandidates: unusedRuntimeCandidates.length,
      sourceAssets: sourceAssets.length,
      missingReferences: missingReferences.length,
      runtimeDuplicateGroups: runtimeDuplicateGroups.length,
      sourceDuplicateGroups: sourceDuplicateGroups.length,
      activeArchiveDuplicateGroups: activeArchiveDuplicateGroups.length,
      usedRasterWithoutWebp: webpCandidates.length,
    },
    missingReferences,
    preloadOnlyAssets,
    referenceOnlyAssets,
    unusedRuntimeCandidates,
    unusedSourceAssets,
    webpCandidates,
    usedAssetsWithWebpSibling,
    runtimeDuplicateGroups,
    sourceDuplicateGroups,
    activeArchiveDuplicateGroups,
    sameNameGroups,
    archivedAssets,
    usedAssets: usedAssets.map(asset => ({ asset, uses: uniqueUses(uses.get(asset) || []) })),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(REPORT_MD, renderMarkdown(report));

  console.log(`Image asset audit written to ${rel(REPORT_MD)} and ${rel(REPORT_JSON)}`);
  console.log(`Runtime scope: ${report.summary.runtimeScopeAssets} | Source: ${report.summary.sourceAssets} | Archived: ${report.summary.archivedAssets} | Total: ${report.summary.totalAssets}`);
  console.log(`Runtime used: ${report.summary.runtimeUsedAssets} | Preload-only: ${report.summary.preloadOnlyAssets} | Reference-only: ${report.summary.referenceOnlyAssets}`);
  console.log(`Missing references: ${report.summary.missingReferences}`);
  console.log(`Unused runtime candidates: ${report.summary.unusedRuntimeCandidates}`);
  console.log(`Duplicate runtime groups: ${report.summary.runtimeDuplicateGroups}`);
  console.log(`WebP candidates: ${report.summary.usedRasterWithoutWebp}`);
}

main();
