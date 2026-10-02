/* Local images are kept in memory and exported as self-contained data URLs. */
((global) => {
  'use strict';
  const TYPES = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', webp:'image/webp', avif:'image/avif', bmp:'image/bmp', ico:'image/x-icon', svg:'image/svg+xml' };
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
  const DATA_IMAGE = /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon|svg\+xml);base64,[a-z0-9+/]+={0,2}$/i;

  function imageType(file) { return TYPES[file.name.split('.').pop().toLowerCase()] || ''; }
  function imageURL(path, baseURL) { return new URL(path.replace(/\\/g, '/'), baseURL).href; }
  function fileURL(path, baseURL) { return imageURL(path.split(/[\\/]/).map(encodeURIComponent).join('/'), baseURL); }
  async function readImages(files, baseURL, existing = new Map()) {
    const images = new Map(existing);
    let total = [...images.values()].reduce((sum, data) => sum + data.length * 3 / 4, 0);
    for (const file of files) {
      const type = imageType(file);
      if (!type) continue;
      if (file.size > MAX_IMAGE_BYTES) throw new Error(`图片 ${file.name} 超过 10 MiB，请压缩后导入。`);
      const key = fileURL(file.webkitRelativePath || file.name, baseURL);
      total += file.size - (images.get(key)?.length || 0) * 3 / 4;
      if (total > MAX_TOTAL_BYTES) throw new Error('图片总大小超过 20 MiB，请压缩后导入。');
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(`data:${type};base64,${reader.result.split(',')[1]}`);
        reader.onerror = () => reject(new Error(`无法读取图片 ${file.name}。`));
        reader.readAsDataURL(file);
      });
      images.set(key, data);
    }
    return images;
  }
  function decodeImages(value) {
    if (!value) return new Map();
    try {
      if (value.length > MAX_TOTAL_BYTES * 4 / 3 + 65536) throw new Error();
      const entries = JSON.parse(value);
      if (!Array.isArray(entries) || entries.some(entry => !Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || typeof entry[1] !== 'string' || !DATA_IMAGE.test(entry[1]))) throw new Error();
      if (entries.some(([key]) => !['http:', 'https:', 'file:'].includes(new URL(key).protocol))) throw new Error();
      return new Map(entries);
    } catch { throw new Error('阅读链接中的图片数据无效或过大。'); }
  }
  global.MoyeImages = { imageType, imageURL, fileURL, readImages, decodeImages };
})(window);
