/* Browser file saving: a handle is adopted only after a successful write. */
(() => {
  'use strict';
  const types = [{ description:'Markdown 文档', accept:{ 'text/markdown':['.md', '.markdown'] } }];
  function download(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  class FileSession {
    constructor({ getText, onChange, onStatus }) {
      this.getText = getText; this.onChange = onChange; this.onStatus = onStatus;
      this.version = 0; this.busy = false;
    }
    reset(text, name = '未命名.md', handle = null) {
      this.version++; this.name = name; this.handle = handle; this.savedText = text; this.changed();
    }
    get dirty() { return this.getText() !== this.savedText; }
    changed() { this.onChange(this); }
    async save(asNew = false) {
      if (this.busy) return;
      this.busy = true; this.changed();
      const text = this.getText(), version = this.version;
      let writable;
      try {
        let handle = asNew ? null : this.handle;
        if (!handle && typeof window.showSaveFilePicker !== 'function') {
          download(new Blob([text], { type:'text/markdown;charset=utf-8' }), this.name);
          this.onStatus('已下载 Markdown 副本。当前浏览器无法覆盖原文件，请使用 Chrome / Edge 的打开文件与保存功能。');
          return;
        }
        if (!handle) handle = await window.showSaveFilePicker({ suggestedName:this.name, types });
        writable = await handle.createWritable();
        await writable.write(text); await writable.close(); writable = null;
        // A different document may have been opened while the picker/write was pending.
        if (version !== this.version) return;
        this.handle = handle; this.name = handle.name; this.savedText = text;
        this.onStatus(`已保存 · ${handle.name}${this.dirty ? ' · 仍有新修改未保存' : ''}`);
      } catch (error) {
        if (writable) { try { await writable.abort(); } catch { /* Keep the original error. */ } }
        if (version === this.version) this.onStatus(error.name === 'AbortError' ? '已取消保存' : `保存失败：${error.message}。可尝试另存为。`);
      } finally { this.busy = false; this.changed(); }
    }
  }
  window.MoyeFiles = { FileSession, download, types };
})();
