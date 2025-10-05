require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  window.htmlEditor = monaco.editor.create(document.getElementById('htmlEditor'), {
    value: '',
    language: 'html',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false }
  });

  window.cssEditor = monaco.editor.create(document.getElementById('cssEditor'), {
    value: '',
    language: 'css',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false }
  });

  window.jsEditor = monaco.editor.create(document.getElementById('jsEditor'), {
    value: '',
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false }
  });

  initEditorLogic();
});

function initEditorLogic() {
  const preview = document.getElementById('preview');
  const runBtn = document.getElementById('runBtn');
  const autoUpdate = document.getElementById('autoUpdate');
  const insertBtn = document.getElementById('insertSkeleton');
  const clearAll = document.getElementById('clearAll');
  const downloadHtml = document.getElementById('downloadHtml');

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.editor;
      document.querySelectorAll('.editor-wrap').forEach(w => {
        w.classList.toggle('hidden', w.dataset.name !== name);
      });
    });
  });

  const skeleton = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`;

  function buildPreview() {
    const htmlVal = htmlEditor.getValue();
    const cssVal = cssEditor.getValue();
    const jsVal = jsEditor.getValue();

    let full;
    const looksLikeFullDoc = /<!doctype|<html/i.test(htmlVal);
    if (looksLikeFullDoc && htmlVal.length > 0) {
      full = htmlVal;
      if (cssVal && !/<style[\s>]/i.test(full)) {
        full = full.replace(/<\/head>/i, `<style>\n${cssVal}\n</style>\n</head>`);
      }
      if (jsVal && !/<script[\s>]/i.test(full)) {
        if (/<\/body>/i.test(full)) {
          full = full.replace(/<\/body>/i, `<script>\n${jsVal}\n</script>\n</body>`);
        } else {
          full += `\n<script>\n${jsVal}\n</script>\n`;
        }
      }
    } else {
      full = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Preview</title>
  <style>\n${cssVal}\n</style>
</head>
<body>
${htmlVal}
<script>\n${jsVal}\n</script>
</body>
</html>`;
    }

    preview.srcdoc = full;
  }

  [htmlEditor, cssEditor, jsEditor].forEach(editor => {
    editor.onDidChangeModelContent(() => {
      if (autoUpdate.checked) buildPreview();
    });
  });

  runBtn.addEventListener('click', buildPreview);

  insertBtn.addEventListener('click', () => {
    htmlEditor.setValue(skeleton);
    document.querySelector('.tab[data-editor="html"]').click();
    buildPreview();
  });

  clearAll.addEventListener('click', () => {
    if (!confirm('Na pewno wyczyścić wszystkie edytory?')) return;
    htmlEditor.setValue('');
    cssEditor.setValue('');
    jsEditor.setValue('');
    buildPreview();
  });

  downloadHtml.addEventListener('click', () => {
    const blob = new Blob([preview.srcdoc || ''], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  (function () {
    const gutter = document.getElementById('gutter');
    const left = document.querySelector('.left-panel');
    let dragging = false;
    let startX, startWidth;
    gutter.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX;
      startWidth = left.getBoundingClientRect().width;
      document.body.style.userSelect = 'none';
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      let newW = startWidth + dx;
      const min = 300, max = window.innerWidth - 300;
      newW = Math.max(min, Math.min(max, newW));
      left.style.width = newW + 'px';
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.userSelect = '';
    });
  })();

  buildPreview();
}
