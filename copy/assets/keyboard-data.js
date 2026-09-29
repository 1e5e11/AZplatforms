/* 可直接输入的键盘字符。行格式：[字符，中文名称，英文名称，分类]。 */
const KEYBOARD_CATEGORY_NAMES = {
  ascii: '英文半角符号',
  alphanumeric: '字母与数字',
  fullwidth: '中文全角符号',
  cjk: '中文标点与排版'
};

const ASCII_PUNCTUATION = [
  [' ', '空格', 'space'],
  ['!', '感叹号', 'exclamation mark'],
  ['"', '双引号', 'double quotation mark'],
  ['#', '井号', 'number sign / hash'],
  ['$', '美元符号', 'dollar sign'],
  ['%', '百分号', 'percent sign'],
  ['&', '与号', 'ampersand'],
  ["'", '单引号', 'apostrophe / single quote'],
  ['(', '左圆括号', 'left parenthesis'],
  [')', '右圆括号', 'right parenthesis'],
  ['*', '星号', 'asterisk'],
  ['+', '加号', 'plus sign'],
  [',', '逗号', 'comma'],
  ['-', '连字符或减号', 'hyphen-minus'],
  ['.', '句点', 'period / full stop'],
  ['/', '斜杠', 'slash'],
  [':', '冒号', 'colon'],
  [';', '分号', 'semicolon'],
  ['<', '小于号', 'less-than sign'],
  ['=', '等号', 'equals sign'],
  ['>', '大于号', 'greater-than sign'],
  ['?', '问号', 'question mark'],
  ['@', '艾特符号', 'at sign'],
  ['[', '左方括号', 'left square bracket'],
  ['\\', '反斜杠', 'backslash'],
  [']', '右方括号', 'right square bracket'],
  ['^', '脱字符', 'caret'],
  ['_', '下划线', 'underscore'],
  ['`', '反引号', 'backtick / grave accent'],
  ['{', '左花括号', 'left curly brace'],
  ['|', '竖线', 'vertical bar / pipe'],
  ['}', '右花括号', 'right curly brace'],
  ['~', '波浪号', 'tilde']
];

const CHINESE_PUNCTUATION = [
  ['，', '中文逗号', 'Chinese comma'],
  ['。', '中文句号', 'ideographic full stop'],
  ['、', '顿号', 'ideographic comma'],
  ['；', '中文分号', 'Chinese semicolon'],
  ['：', '中文冒号', 'Chinese colon'],
  ['？', '中文问号', 'Chinese question mark'],
  ['！', '中文感叹号', 'Chinese exclamation mark'],
  ['“', '左双引号', 'left double quotation mark'],
  ['”', '右双引号', 'right double quotation mark'],
  ['‘', '左单引号', 'left single quotation mark'],
  ['’', '右单引号', 'right single quotation mark'],
  ['（', '左中文圆括号', 'left fullwidth parenthesis'],
  ['）', '右中文圆括号', 'right fullwidth parenthesis'],
  ['【', '左方头括号', 'left black lenticular bracket'],
  ['】', '右方头括号', 'right black lenticular bracket'],
  ['《', '左书名号', 'left double angle bracket'],
  ['》', '右书名号', 'right double angle bracket'],
  ['〈', '左单书名号', 'left angle bracket'],
  ['〉', '右单书名号', 'right angle bracket'],
  ['「', '左直角引号', 'left corner bracket'],
  ['」', '右直角引号', 'right corner bracket'],
  ['『', '左双直角引号', 'left white corner bracket'],
  ['』', '右双直角引号', 'right white corner bracket'],
  ['〔', '左六角括号', 'left tortoise shell bracket'],
  ['〕', '右六角括号', 'right tortoise shell bracket'],
  ['〖', '左白方头括号', 'left white lenticular bracket'],
  ['〗', '右白方头括号', 'right white lenticular bracket'],
  ['〘', '左白六角括号', 'left white tortoise shell bracket'],
  ['〙', '右白六角括号', 'right white tortoise shell bracket'],
  ['〚', '左白方括号', 'left white square bracket'],
  ['〛', '右白方括号', 'right white square bracket'],
  ['—', '破折号', 'em dash'],
  ['——', '双破折号', 'double em dash'],
  ['…', '省略号', 'ellipsis'],
  ['……', '双省略号', 'double ellipsis'],
  ['·', '间隔号', 'middle dot'],
  ['￥', '人民币符号', 'yuan sign'],
  ['﹏', '波浪下划线', 'wavy low line'],
  ['﹑', '小顿号', 'small ideographic comma'],
  ['‧', '连字点', 'hyphenation point'],
  ['〝', '左双撇引号', 'reversed double prime quotation mark'],
  ['〞', '右双撇引号', 'double prime quotation mark'],
  ['﹃', '竖排左双引号', 'vertical left double quotation mark'],
  ['﹄', '竖排右双引号', 'vertical right double quotation mark'],
  ['﹁', '竖排左引号', 'vertical left quotation mark'],
  ['﹂', '竖排右引号', 'vertical right quotation mark']
];

const KEYBOARD_DATA = [];
ASCII_PUNCTUATION.forEach(function(item) {
  KEYBOARD_DATA.push([item[0], item[1], item[2], 'ascii']);
});
for (const digit of '0123456789') KEYBOARD_DATA.push([digit, '数字 ' + digit, 'digit ' + digit, 'alphanumeric']);
for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') KEYBOARD_DATA.push([letter, '大写字母 ' + letter, 'uppercase letter ' + letter, 'alphanumeric']);
for (const letter of 'abcdefghijklmnopqrstuvwxyz') KEYBOARD_DATA.push([letter, '小写字母 ' + letter, 'lowercase letter ' + letter, 'alphanumeric']);
ASCII_PUNCTUATION.filter(function(item) { return item[0] !== ' '; }).forEach(function(item) {
  KEYBOARD_DATA.push([String.fromCodePoint(item[0].codePointAt(0) + 0xFEE0), '全角' + item[1], 'fullwidth ' + item[2], 'fullwidth']);
});
CHINESE_PUNCTUATION.forEach(function(item) {
  KEYBOARD_DATA.push([item[0], item[1], item[2], 'cjk']);
});
