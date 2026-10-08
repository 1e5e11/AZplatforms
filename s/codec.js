/**
 * S/Link v3 — browser-only reversible URL compression.
 * Wire format: [one-byte mode, payload, CRC16-CCITT(mode+payload)] -> custom URL-transport Base85.
 * Dictionary v3 is fixed for all v3 codes; old links are intentionally unsupported.
 * 00-CF=one-byte popular site/page prefix + raw tail; E1=URL dictionary, E2=dictionary+Huffman, E3=raw, E4=DEFLATE.
 * Copyright (c) 2026. MIT license.
 */
(function (root) {
  'use strict';
  const DICTIONARY = root.SLINK_DICTIONARY_V3;
  if (!Array.isArray(DICTIONARY) || DICTIONARY.length !== 5434) {
    throw new Error('字典文件缺失或与编码器版本不兼容。');
  }
  // 82 URL-query ASCII symbols, PLUS %, # and apostrophe = true Base85.
  // In a link, ONLY % and # are percent-escaped, because both alter URL parsing.
  const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._~!$&()*+,;=:@/?[]%#'";
  if (ALPHABET.length !== 85 || new Set(ALPHABET).size !== 85) throw new Error('Base85 字母表不正确。');
  const DIGITS = new Map([...ALPHABET].map((s, i) => [s, i]));
  const BYTE_LIMIT = 4096;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const tokenBytes = DICTIONARY.map(s => encoder.encode(s));
  const HUFF_LENGTHS = Uint8Array.from(atob('DQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0MDAwMDAwMCAwMCAYGDAgICAgIBgYGBgYGBgYGBgYGBgYGBgYIDAYMBggICAgICAgICAgICAgICAgICAgICAgICAgICAgMCAwFDAUFBQUFBQYGBgYGBgYGBgYGBgYGBgYGDAwMCAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=='), c => c.charCodeAt(0));

  function makeHuffman(lengths) {
    const max = Math.max(...lengths);
    if (max > 15) throw new Error('不受支持的 Huffman 编码。');
    const counts = new Uint16Array(max + 1);
    for (const len of lengths) if (len) counts[len]++;
    let code = 0;
    const next = new Uint16Array(max + 1);
    for (let bits = 1; bits <= max; bits++) {
      code = (code + (counts[bits - 1] || 0)) << 1;
      next[bits] = code;
    }
    const codes = new Uint16Array(lengths.length);
    const lookup = new Map();
    for (let symbol = 0; symbol < lengths.length; symbol++) {
      const len = lengths[symbol];
      if (len) {
        const c = next[len]++;
        codes[symbol] = c;
        lookup.set((1 << len) | c, symbol);
      }
    }
    return { codes, lengths, lookup, max };
  }
  const HUFF = makeHuffman(HUFF_LENGTHS);

  function normalizeURL(input) {
    const value = String(input).trim();
    if (!value) throw new Error('请输入目标网址。');
    let candidate = value;
    if (value.startsWith('//')) candidate = 'https:' + value;
    else if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
      if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^[^/:]+:\d+(?:[/?#]|$)/.test(value)) {
        throw new Error('只支持 HTTP/HTTPS 网址。');
      }
      candidate = 'https://' + value;
    }
    let url;
    try { url = new URL(candidate); } catch { throw new Error('目标网址格式无效。'); }
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) {
      throw new Error('只支持 HTTP/HTTPS 网址。');
    }
    if (url.username || url.password) throw new Error('不支持含用户名或密码的网址。');
    if (encoder.encode(url.href).length > BYTE_LIMIT) {
      throw new Error(`网址不能超过 ${BYTE_LIMIT} 个 UTF-8 字节。`);
    }
    return url.href;
  }

  function crc16(bytes) {
    let crc = 0xffff;
    for (const b of bytes) {
      crc ^= b << 8;
      for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc;
  }
  function wrap(mode, body) {
    const out = new Uint8Array(body.length + 3);
    out[0] = mode;
    out.set(body, 1);
    const sum = crc16(out.subarray(0, out.length - 2));
    out[out.length - 2] = sum >> 8;
    out[out.length - 1] = sum & 255;
    return out;
  }
  function unwrap(bytes) {
    if (bytes.length < 3) throw new Error('数据过短。');
    const check = (bytes[bytes.length - 2] << 8) | bytes[bytes.length - 1];
    if (crc16(bytes.subarray(0, bytes.length - 2)) !== check) throw new Error('CRC 校验失败，短链接可能被损坏。');
    return { mode: bytes[0], body: bytes.subarray(1, bytes.length - 2) };
  }

  // 4 bytes -> 5 base-85 symbols; final 1/2/3 bytes -> 2/3/4 symbols.
  // No BigInt, no binary length overhead, and zero bytes survive round-trips.
  function toBase85(bytes) {
    let text = '';
    for (let p = 0; p < bytes.length; p += 4) {
      const take = Math.min(4, bytes.length - p);
      let number = 0;
      for (let j = 0; j < take; j++) number = number * 256 + bytes[p + j];
      let chunk = '';
      for (let j = 0; j < take + 1; j++) {
        chunk = ALPHABET[number % 85] + chunk;
        number = Math.floor(number / 85);
      }
      if (number) throw new Error('Base85 编码发生溢出。');
      text += chunk;
    }
    return text;
  }
  function fromBase85(text) {
    if (text.length < 2 || text.length > 10000 || text.length % 5 === 1) throw new Error('Base85 编码长度无效。');
    const bytes = [];
    for (let p = 0; p < text.length;) {
      const remain = text.length - p;
      const digits = Math.min(5, remain);
      const take = digits - 1;
      let number = 0;
      for (let j = 0; j < digits; j++) {
        const digit = DIGITS.get(text[p + j]);
        if (digit === undefined) throw new Error('Base85 编码中存在非法字符。');
        number = number * 85 + digit;
      }
      if (number >= Math.pow(256, take)) throw new Error('Base85 编码数值溢出。');
      const block = new Array(take);
      for (let j = take - 1; j >= 0; j--) {
        block[j] = number % 256;
        number = Math.floor(number / 256);
      }
      bytes.push(...block);
      if (bytes.length > BYTE_LIMIT * 2 + 64) throw new Error('压缩数据超过长度限制。');
      p += digits;
    }
    return Uint8Array.from(bytes);
  }

  class Writer {
    constructor() { this.data = []; this.bits = 0; this.byte = 0; }
    put(value, n) {
      for (let i = n - 1; i >= 0; i--) {
        this.byte = (this.byte << 1) | ((value >>> i) & 1);
        if (++this.bits === 8) { this.data.push(this.byte); this.bits = 0; this.byte = 0; }
      }
    }
    done() {
      if (this.bits) this.data.push(this.byte << (8 - this.bits));
      return Uint8Array.from(this.data);
    }
  }
  class Reader {
    constructor(bytes) { this.data = bytes; this.pos = 0; this.end = bytes.length * 8; }
    read(n) {
      if (this.pos + n > this.end) throw new Error('压缩数据不完整。');
      let x = 0;
      for (let i = 0; i < n; i++, this.pos++) x = (x << 1) | ((this.data[this.pos >> 3] >> (7 - (this.pos & 7))) & 1);
      return x;
    }
    zeroPadding() {
      if (this.end - this.pos >= 8) return false;
      while (this.pos < this.end) if (this.read(1)) return false;
      return true;
    }
  }
  function huffRead(reader, tree) {
    let code = 0;
    for (let len = 1; len <= tree.max; len++) {
      code = (code << 1) | reader.read(1);
      const match = tree.lookup.get((1 << len) | code);
      if (match !== undefined) return match;
    }
    throw new Error('Huffman 数据无效。');
  }
  function makeTrie() {
    const root = { next: new Map(), id: -1 };
    tokenBytes.forEach((bytes, id) => {
      let cur = root;
      for (const b of bytes) {
        if (!cur.next.has(b)) cur.next.set(b, { next: new Map(), id: -1 });
        cur = cur.next.get(b);
      }
      cur.id = id;
    });
    return root;
  }
  let trie;
  function backrefs(bytes) {
    const refs = new Array(bytes.length);
    const history = new Map();
    for (let i = 0; i < bytes.length - 2; i++) {
      const key = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      const entries = history.get(key) || [];
      let longest = 3;
      let distance = 0;
      for (let k = entries.length - 1; k >= 0; k--) {
        const p = entries[k];
        if (i - p > 4096) continue;
        const cap = Math.min(259, bytes.length - i);
        let len = 3;
        while (len < cap && bytes[p + len] === bytes[i + len]) len++;
        if (len > longest) { longest = len; distance = i - p; }
        if (len === cap) break;
      }
      if (longest >= 4) refs[i] = [longest, distance];
      entries.push(i);
      if (entries.length > 10) entries.shift();
      history.set(key, entries);
    }
    return refs;
  }

  function dictionaryCompress(bytes, useHuffman) {
    trie ||= makeTrie();
    const n = bytes.length, refs = backrefs(bytes);
    const dp = new Float64Array(n + 1);
    const choices = new Array(n);
    dp[n] = 6; // End marker.
    for (let i = n - 1; i >= 0; i--) {
      let best = 1 + (useHuffman ? HUFF_LENGTHS[bytes[i]] : 8) + dp[i + 1];
      let choice = ['literal', 1, bytes[i]];
      const improve = (cost, type, length, value) => {
        if (cost < best || (cost === best && length > choice[1])) {
          best = cost; choice = [type, length, value];
        }
      };
      let node = trie;
      for (let j = i; j < Math.min(n, i + 160); j++) {
        node = node.next.get(bytes[j]);
        if (!node) break;
        if (node.id >= 0) {
          const id = node.id;
          improve((id < 64 ? 8 : id < 576 ? 12 : 17) + dp[j + 1], 'dictionary', j + 1 - i, id);
        }
      }
      for (let len = 2; len <= Math.min(32, n - i); len++) {
        improve(10 + 8 * len + dp[i + len], 'run', len, 0);
      }
      if (refs[i]) {
        const [length, distance] = refs[i];
        for (let len = 4; len <= length; len++) improve(26 + dp[i + len], 'backref', len, distance);
      }
      dp[i] = best;
      choices[i] = choice;
    }
    const writer = new Writer();
    for (let p = 0; p < n;) {
      const [type, len, value] = choices[p];
      if (type === 'literal') {
        writer.put(0, 1);
        if (useHuffman) writer.put(HUFF.codes[value], HUFF_LENGTHS[value]);
        else writer.put(value, 8);
      } else if (type === 'dictionary') {
        if (value < 64) { writer.put(0b10, 2); writer.put(value, 6); }
        else if (value < 576) { writer.put(0b110, 3); writer.put(value - 64, 9); }
        else { writer.put(0b1110, 4); writer.put(value - 576, 13); }
      } else if (type === 'run') {
        writer.put(0b11110, 5); writer.put(len - 1, 5);
        for (let k = 0; k < len; k++) writer.put(bytes[p + k], 8);
      } else {
        writer.put(0b111110, 6); writer.put(value - 1, 12); writer.put(len - 4, 8);
      }
      p += len;
    }
    writer.put(0b111111, 6);
    return writer.done();
  }
  function dictionaryDecompress(bytes, useHuffman) {
    const reader = new Reader(bytes), out = [];
    while (reader.pos < reader.end) {
      if (reader.read(1) === 0) out.push(useHuffman ? huffRead(reader, HUFF) : reader.read(8));
      else if (reader.read(1) === 0) out.push(...tokenBytes[reader.read(6)]);
      else if (reader.read(1) === 0) out.push(...tokenBytes[64 + reader.read(9)]);
      else if (reader.read(1) === 0) {
        const token = tokenBytes[576 + reader.read(13)];
        if (!token) throw new Error('字典索引无效。');
        out.push(...token);
      } else if (reader.read(1) === 0) {
        const len = reader.read(5) + 1;
        for (let i = 0; i < len; i++) out.push(reader.read(8));
      } else if (reader.read(1) === 0) {
        const dist = reader.read(12) + 1, len = reader.read(8) + 4;
        if (dist > out.length) throw new Error('非法回溯距离。');
        for (let i = 0; i < len; i++) out.push(out[out.length - dist]);
      } else {
        if (!reader.zeroPadding()) throw new Error('尾部存在非零数据。');
        return Uint8Array.from(out);
      }
      if (out.length > BYTE_LIMIT) throw new Error('解压结果超过长度限制。');
    }
    throw new Error('压缩数据缺少结束标记。');
  }

  // Tiny, self-contained raw DEFLATE decoder. Bounds output to BYTE_LIMIT.
  // This makes codes generated on modern browsers readable even where
  // DecompressionStream("deflate-raw") is unsupported.
  const LEN_BASE = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const LEN_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const DIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  function inflateRaw(input) {
    let bitpos = 0;
    const read = n => {
      if (bitpos + n > input.length * 8) throw new Error('DEFLATE 数据已截断。');
      let nval = 0;
      for (let k = 0; k < n; k++, bitpos++) nval |= ((input[bitpos >> 3] >> (bitpos & 7)) & 1) << k;
      return nval;
    };
    // Huffman *codes* are emitted most-significant-bit first in RFC 1951.
    const readSymbol = tree => {
      let code = 0;
      for (let len = 1; len <= tree.max; len++) {
        code = (code << 1) | read(1);
        const symbol = tree.lookup.get((1 << len) | code);
        if (symbol !== undefined) return symbol;
      }
      throw new Error('DEFLATE Huffman 数据无效。');
    };
    const fixedLit = makeHuffman(Array.from({ length: 288 }, (_, i) => i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8));
    const fixedDist = makeHuffman(new Array(32).fill(5));
    const out = [];
    let final = false;
    while (!final) {
      final = !!read(1);
      const mode = read(2);
      if (mode === 0) {
        bitpos = (bitpos + 7) & ~7;
        const len = read(16), complement = read(16);
        if ((len ^ complement) !== 0xffff) throw new Error('DEFLATE 无压缩块校验失败。');
        for (let i = 0; i < len; i++) {
          out.push(read(8));
          if (out.length > BYTE_LIMIT) throw new Error('DEFLATE 解压长度超出限制。');
        }
        continue;
      }
      if (mode === 3) throw new Error('DEFLATE 保留块类型。');
      let literalTree = fixedLit, distanceTree = fixedDist;
      if (mode === 2) {
        const nl = read(5) + 257, nd = read(5) + 1, nc = read(4) + 4;
        const order = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
        const codeLengths = new Array(19).fill(0);
        for (let i = 0; i < nc; i++) codeLengths[order[i]] = read(3);
        const codeTree = makeHuffman(codeLengths);
        const lengths = [];
        while (lengths.length < nl + nd) {
          const c = readSymbol(codeTree);
          if (c <= 15) lengths.push(c);
          else {
            const count = c === 16 ? read(2) + 3 : c === 17 ? read(3) + 3 : read(7) + 11;
            if (c === 16 && !lengths.length) throw new Error('非法 DEFLATE 重复符号。');
            const repeat = c === 16 ? lengths[lengths.length - 1] : 0;
            if (lengths.length + count > nl + nd) throw new Error('DEFLATE 码表长度溢出。');
            for (let j = 0; j < count; j++) lengths.push(repeat);
          }
        }
        literalTree = makeHuffman(lengths.slice(0, nl));
        distanceTree = makeHuffman(lengths.slice(nl));
      }
      while (true) {
        const sym = readSymbol(literalTree);
        if (sym < 256) out.push(sym);
        else if (sym === 256) break;
        else {
          const lengthIndex = sym - 257;
          if (lengthIndex < 0 || lengthIndex >= LEN_BASE.length) throw new Error('DEFLATE 长度码无效。');
          const size = LEN_BASE[lengthIndex] + read(LEN_EXTRA[lengthIndex]);
          const distSymbol = readSymbol(distanceTree);
          if (distSymbol >= DIST_BASE.length) throw new Error('DEFLATE 距离码无效。');
          const dist = DIST_BASE[distSymbol] + read(DIST_EXTRA[distSymbol]);
          if (dist > out.length || out.length + size > BYTE_LIMIT) throw new Error('DEFLATE 回溯超出范围。');
          for (let i = 0; i < size; i++) out.push(out[out.length - dist]);
        }
        if (out.length > BYTE_LIMIT) throw new Error('DEFLATE 解压长度超出限制。');
      }
    }
    return Uint8Array.from(out);
  }
  async function deflateRaw(bytes) {
    if (typeof CompressionStream !== 'function') return null;
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      const result = new Uint8Array(await new Response(stream).arrayBuffer());
      return result;
    } catch { return null; }
  }

  function uriTransport(text) {
    // Note: '+' '&' '=' and '?' remain LITERAL query characters, as we NEVER use URLSearchParams.
    // '#' would begin a fragment and '%' would be parsed as a percent escape.
    return text.replace(/%/g, '%25').replace(/#/g, '%23');
  }
  function codeFromLocation(locationObject = root.location) {
    const raw = locationObject?.search?.slice(1);
    if (!raw) return null;
    if (raw.length > 12000) throw new Error('短链接参数过长。');
    let code;
    try { code = decodeURIComponent(raw); } catch { throw new Error('URL 百分号编码无效。'); }
    return code;
  }
  function makeLink(code, base = 'https://ssssssss.eu.org/s/') {
    return base.replace(/[?#].*$/, '').replace(/\/?$/, '/') + '?' + uriTransport(code);
  }

  const MODE_NAMES = { 0xe1: '全球 URL 字典 v3', 0xe2: '全球 URL 字典 + Huffman', 0xe3: '原始数据', 0xe4: 'DEFLATE' };
  async function encodeDetailed(input) {
    const href = normalizeURL(input);
    const original = encoder.encode(href);
    const candidates = [
      wrap(0xe2, dictionaryCompress(original, true)),
      wrap(0xe3, original),
      wrap(0xe1, dictionaryCompress(original, false))
    ];
    // 208 most frequent fixed full URL/page prefixes are represented directly
    // by the mode byte; no token separator or end marker is required.
    // For high-entropy suffixes (video IDs, hashes), this often beats Huffman.
    for (let i = 0; i < 208 && i < DICTIONARY.length; i++) {
      const p = DICTIONARY[i];
      if (href.startsWith(p)) {
        candidates.push(wrap(i, original.subarray(tokenBytes[i].length)));
      }
    }
    // Browser-supported deflate is only an OPTIONAL encoder; the pure-JS
    // decoder above works in any current browser with standard JavaScript.
    if (original.length >= 28) {
      const deflated = await deflateRaw(original);
      if (deflated?.length) candidates.push(wrap(0xe4, deflated));
    }
    let winner;
    for (const data of candidates) {
      const code = toBase85(data);
      const serialized = uriTransport(code);
      if (!winner || serialized.length < winner.serialized.length ||
          (serialized.length === winner.serialized.length && data.length < winner.data.length)) {
        winner = { data, code, serialized, mode: data[0] };
      }
    }
    return {
      code: winner.code, href, mode: winner.mode,
      algorithm: winner.mode < 0xd0 ? '高频网页前缀直编' : MODE_NAMES[winner.mode],
      originalBytes: original.length, compressedBytes: winner.data.length,
      payloadCharacters: winner.serialized.length,
      link: makeLink(winner.code)
    };
  }
  async function encodeUrl(input) { return (await encodeDetailed(input)).code; }
  function decodeCode(code) {
    const { mode, body } = unwrap(fromBase85(String(code)));
    let result;
    if (mode < 0xd0) {
      const prefix = tokenBytes[mode];
      if (!prefix || !DICTIONARY[mode].startsWith('https://')) throw new Error('前缀索引无效。');
      const merged = new Uint8Array(prefix.length + body.length);
      merged.set(prefix);
      merged.set(body, prefix.length);
      result = merged;
    }
    else if (mode === 0xe1 || mode === 0xe2) result = dictionaryDecompress(body, mode === 0xe2);
    else if (mode === 0xe3) result = body;
    else if (mode === 0xe4) result = inflateRaw(body);
    else throw new Error('未知压缩版本，可能需要更新网站。');
    if (result.length > BYTE_LIMIT) throw new Error('解码网址过长。');
    return normalizeURL(decoder.decode(result));
  }
  root.SLinkCodec = Object.freeze({
    alphabet: ALPHABET, dictionarySize: DICTIONARY.length,
    normalizeURL, encodeUrl, encodeDetailed, decodeCode, makeLink, codeFromLocation,
    _debug: Object.freeze({ toBase85, fromBase85, wrap, unwrap, crc16, dictionaryCompress, dictionaryDecompress, inflateRaw })
  });
})(typeof window !== 'undefined' ? window : globalThis);
