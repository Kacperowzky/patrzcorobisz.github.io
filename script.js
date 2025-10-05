require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  // --- Edytory z kolorami i podpowiedziami ---
  window.htmlEditor = monaco.editor.create(document.getElementById('htmlEditor'), {
    value: '',
    language: 'html',
    theme: 'vs-dark',
    fontSize: 15,
    fontFamily: 'JetBrains Mono',
    automaticLayout: true,
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoClosingTags: true,
    minimap: { enabled: false }
  });

  window.cssEditor = monaco.editor.create(document.getElementById('cssEditor'), {
    value: '',
    language: 'css',
    theme: 'vs-dark',
    fontSize: 15,
    fontFamily: 'JetBrains Mono',
    automaticLayout: true,
    minimap: { enabled: false }
  });

  window.jsEditor = monaco.editor.create(document.getElementById('jsEditor'), {
    value: '',
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 15,
    fontFamily: 'JetBrains Mono',
    automaticLayout: true,
    minimap: { enabled: false }
  });

  initLogic();
});

function initLogic() {
  const preview = document.getElementById('preview');
  const runBtn = document.getElementById('runBtn');
  const autoUpdate = document.getElementById('autoUpdate');
  const insertBtn = document.getElementById('insertSkeleton');
  const clearAll = document.getElementById('clearAll');

  // --- Przełączanie zakładek ---
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

  // --- Automatyczne domykanie tagów HTML ---
  htmlEditor.onKeyDown(e => {
    if (e.code === "Enter") {
      const pos = htmlEditor.getPosition();
      const model = htmlEditor.getModel();
      const line = model.getLineContent(pos.lineNumber).trim();

      const tagMatch = /^([a-zA-Z0-9]+)$/.exec(line);
      if (tagMatch) {
        const tag = tagMatch[1];
        model.applyEdits([{
          range: new monaco.Range(pos.lineNumber, 1, pos.lineNumber, line.length + 1),
          text: `<${tag}></${tag}>`
        }]);
        htmlEditor.setPosition({ lineNumber: pos.lineNumber, column: tag.length + 3 });
        e.preventDefault();
      }
    }
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
    preview.srcdoc = `
<!DOCTYPE html>
<html>
<head>
<style>${cssVal}</style>
</head>
<body>
${htmlVal}
<script>${jsVal}<\/script>
</body>
</html>`;
  }

  [htmlEditor, cssEditor, jsEditor].forEach(ed => {
    ed.onDidChangeModelContent(() => {
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
    if (!confirm('Wyczyścić wszystko?')) return;
    htmlEditor.setValue('');
    cssEditor.setValue('');
    jsEditor.setValue('');
    buildPreview();
  });

  // --- Przeciągany pasek ---
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
    newW = Math.max(300, Math.min(window.innerWidth - 300, newW));
    left.style.width = newW + 'px';
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });

  buildPreview();
}
