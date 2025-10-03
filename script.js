// Elements
const htmlEditor = document.getElementById('htmlEditor');
const cssEditor = document.getElementById('cssEditor');
const jsEditor = document.getElementById('jsEditor');
const preview = document.getElementById('preview');
const runBtn = document.getElementById('runBtn');
const autoUpdate = document.getElementById('autoUpdate');
const insertBtn = document.getElementById('insertSkeleton');
const clearAll = document.getElementById('clearAll');
const downloadHtml = document.getElementById('downloadHtml');

// Tabs
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const name = tab.dataset.editor;
    document.querySelectorAll('.editor-wrap').forEach(w=>{
      w.classList.toggle('hidden', w.dataset.name !== name);
    });
  });
});

// Insert basic HTML5 skeleton (minimalny)
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

// start empty as requested
htmlEditor.value = '';
cssEditor.value = '';
jsEditor.value = '';

// Build combined document and set iframe srcdoc
function buildPreview() {
  const htmlVal = htmlEditor.value.trim();
  const cssVal = cssEditor.value;
  const jsVal = jsEditor.value;

  let full;
  const looksLikeFullDoc = /<!doctype|<html/i.test(htmlVal);
  if (looksLikeFullDoc && htmlVal.length>0) {
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

// Live update handlers
[htmlEditor, cssEditor, jsEditor].forEach(el=>{
  el.addEventListener('input', ()=>{
    if (autoUpdate.checked) buildPreview();
  });
});

// Run button when autoUpdate off
runBtn.addEventListener('click', buildPreview);

// Insert skeleton
insertBtn.addEventListener('click', ()=>{
  htmlEditor.value = skeleton;
  document.querySelector('.tab[data-editor="html"]').click();
  buildPreview();
});

// Clear all editors
clearAll.addEventListener('click', ()=>{
  if (!confirm('Na pewno wyczyścić wszystkie edytory?')) return;
  htmlEditor.value = '';
  cssEditor.value = '';
  jsEditor.value = '';
  buildPreview();
});

// Download HTML (constructed)
downloadHtml.addEventListener('click', ()=>{
  const blob = new Blob([preview.srcdoc || ''], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Resizable gutter
(function(){
  const gutter = document.getElementById('gutter');
  const left = document.querySelector('.left-panel');
  let dragging = false;
  let startX, startWidth;
  gutter.addEventListener('mousedown', e=>{
    dragging = true;
    startX = e.clientX;
    startWidth = left.getBoundingClientRect().width;
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', e=>{
    if (!dragging) return;
    const dx = e.clientX - startX;
    let newW = startWidth + dx;
    const min = 300, max = window.innerWidth - 300;
    newW = Math.max(min, Math.min(max, newW));
    left.style.width = newW + 'px';
  });
  window.addEventListener('mouseup', ()=>{
    dragging = false;
    document.body.style.userSelect = '';
  });
})();

// initial preview blank
buildPreview();
