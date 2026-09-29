const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/emoji-test-18.0.txt'), 'utf8');
const pastedPath = process.argv[2] || path.join(root, 'assets/user-emoji-list.txt');
const pasted = fs.readFileSync(pastedPath, 'utf8');
const cldrBase = JSON.parse(fs.readFileSync(path.join(root, 'assets/cldr-zh-annotations.json'), 'utf8')).annotations.annotations;
const cldrDerived = fs.readFileSync(path.join(root, 'assets/cldr-zh-derived.xml'), 'utf8');
const oldPage = fs.existsSync(path.join(root, 'index.html')) ? fs.readFileSync(path.join(root, 'index.html'), 'utf8') : '';
const oldScript = fs.existsSync(path.join(root, 'app.js')) ? fs.readFileSync(path.join(root, 'app.js'), 'utf8') : '';
const oldEmojiSection = (oldPage + oldScript).match(/emoji:\s*\[([\s\S]*?)\],\s*roman:/);
const chineseNames = new Map();
if (oldEmojiSection) {
  for (const match of oldEmojiSection[1].matchAll(/\["([^"]+)","([^"]+)"\]/g)) {
    chineseNames.set(match[1].replace(/\uFE0F/g, ''), match[2]);
  }
}
const chineseAnnotations = new Map();
for (const [glyph, annotation] of Object.entries(cldrBase)) {
  chineseAnnotations.set(glyph.replace(/\uFE0F/g, ''), {
    title: (annotation.tts || [])[0] || '',
    keywords: (annotation.default || []).join(' ')
  });
}
function decodeXml(text) {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, function(_, entity) {
    if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
    return {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"}[entity.toLowerCase()];
  });
}
for (const match of cldrDerived.matchAll(/<annotation cp="([^"]+)"([^>]*)>([^<]*)<\/annotation>/g)) {
  const glyph = decodeXml(match[1]).replace(/\uFE0F/g, '');
  const annotation = chineseAnnotations.get(glyph) || {title: '', keywords: ''};
  if (/type="tts"/.test(match[2])) annotation.title = decodeXml(match[3]);
  else annotation.keywords = decodeXml(match[3]).replace(/\s*\|\s*/g, ' ');
  chineseAnnotations.set(glyph, annotation);
}
function rowFor(glyph, englishName, group) {
  const key = glyph.replace(/\uFE0F/g, '');
  const annotation = chineseAnnotations.get(key) || {title: '', keywords: ''};
  const legacyName = chineseNames.get(key) || '';
  return [glyph, englishName, group, annotation.title || legacyName, [annotation.keywords, legacyName].filter(Boolean).join(' ')];
}

const categoryNames = {
  'Smileys & Emotion': '笑脸和情感',
  'People & Body': '人类和身体',
  'Component': '组成部分',
  'Animals & Nature': '动物和自然',
  'Food & Drink': '食物和饮料',
  'Travel & Places': '旅行和地点',
  'Activities': '活动',
  'Objects': '物品',
  'Symbols': '符号',
  'Flags': '旗帜'
};
const rows = [];
const seen = new Set();
let group = '';
for (const line of source.split(/\r?\n/)) {
  const heading = line.match(/^# group: (.+)$/);
  if (heading) { group = heading[1]; continue; }
  const item = line.match(/^([0-9A-F ]+)\s*;\s*(fully-qualified|component)\s*#\s*(\S+)\s+E[0-9.]+\s+(.+)$/);
  if (!item || !categoryNames[group]) continue;
  const [, , , glyph, englishName] = item;
  const key = glyph.replace(/\uFE0F/g, '');
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push(rowFor(glyph, englishName, group));
}

// Supplement Unicode's fully-qualified list with unique entries from the user's list.
const pastedGroups = new Set(Object.values(categoryNames));
let pastedGroup = '';
for (const raw of pasted.split(/\r?\n/)) {
  const line = raw.trim();
  if (pastedGroups.has(line)) { pastedGroup = line; continue; }
  if (line === '深入探索') { pastedGroup = ''; continue; }
  if (!pastedGroup || !line || /\s/.test(line)) continue;
  if (!/[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3]/u.test(line)) continue;
  const key = line.replace(/\uFE0F/g, '');
  if (seen.has(key)) continue;
  const englishGroup = Object.keys(categoryNames).find(name => categoryNames[name] === pastedGroup);
  seen.add(key);
  rows.push(rowFor(line, '', englishGroup));
}

const output = '/* Unicode Emoji 18.0, plus unique entries from the supplied list.\n' +
  ' * Source: https://www.unicode.org/Public/18.0.0/emoji/emoji-test.txt\n' +
  ' * See https://www.unicode.org/terms_of_use.html\n' +
  ' * Chinese annotations: Unicode CLDR (https://github.com/unicode-org/cldr).\n' +
  ' * Row: [emoji, English name, Unicode group, Chinese name, Chinese keywords]. */\n' +
  'const EMOJI_CATEGORY_NAMES = ' + JSON.stringify(categoryNames) + ';\n' +
  'const EMOJI_DATA = ' + JSON.stringify(rows) + ';\n';
fs.writeFileSync(path.join(root, 'assets/emoji-data.js'), output, 'utf8');
console.log(`${rows.length} emoji written.`);
