/* 用語解説UI：略語読み・英語表記・英語読みを表示 */
(() => {
  'use strict';
  const glossary = window.ST_DATA?.glossary;
  if (!glossary) return;

  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const style = document.createElement('style');
  style.textContent = `
    .term-pron{display:block;margin:-1px 0 7px;color:#52627b;font-size:12px;font-weight:700;line-height:1.5}
    .pron-panel{margin:14px 0 18px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fbfcff}
    .pron-row{display:grid;grid-template-columns:155px minmax(0,1fr);gap:12px;padding:11px 14px;border-bottom:1px solid var(--line);align-items:start}
    .pron-row:last-child{border-bottom:0}.pron-label{font-size:12px;font-weight:900;color:var(--muted)}.pron-value{font-weight:800;line-height:1.65;overflow-wrap:anywhere}
    .pron-value.english{font-family:Inter,system-ui,sans-serif;font-weight:700}
    .term-sections{display:grid;gap:10px}.term-section{background:#f7f9fc;border-radius:14px;padding:15px 17px;line-height:1.75}.term-section b{display:block;margin-bottom:5px}
    @media(max-width:600px){.pron-row{grid-template-columns:1fr;gap:3px}.pron-panel{margin-top:10px}}
  `;
  document.head.appendChild(style);

  function pronunciationBlock(g){
    if (!g.abbrRead && !g.english && !g.englishRead) return '';
    return `<div class="pron-panel">
      ${g.abbrRead?`<div class="pron-row"><span class="pron-label">略語の読み</span><span class="pron-value">${esc(g.abbrRead)}</span></div>`:''}
      ${g.english?`<div class="pron-row"><span class="pron-label">英語表記</span><span class="pron-value english">${esc(g.english)}</span></div>`:''}
      ${g.englishRead?`<div class="pron-row"><span class="pron-label">英語表記のカタカナ読み</span><span class="pron-value">${esc(g.englishRead)}</span></div>`:''}
    </div>`;
  }

  function openEnhancedTerm(term){
    const g = glossary[term];
    const dialog = document.getElementById('termDialog');
    const content = document.getElementById('termContent');
    if (!g || !dialog || !content) return false;
    content.innerHTML = `<span class="tag">${esc(g.cat)}</span><h1>${esc(term)}</h1>
      ${pronunciationBlock(g)}
      <p class="q-prompt">${esc(g.short)}</p>
      <div class="term-sections">
        <div class="term-section"><b>意味</b>${esc(g.detail)}</div>
        <div class="term-section"><b>見分け方・間違えやすい点</b>${esc(g.distinguish)}</div>
        <div class="term-section"><b>何の論点で・どう使うか</b>${esc(g.use)}</div>
      </div>`;
    if (!dialog.open) dialog.showModal();
    return true;
  }

  document.addEventListener('click', e => {
    const el = e.target.closest?.('[data-term]');
    if (!el) return;
    const term = el.dataset.term;
    if (!glossary[term]) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openEnhancedTerm(term);
  }, true);

  function enhanceCards(){
    const list = document.getElementById('glossaryList');
    if (!list) return;
    list.querySelectorAll('.term-card[data-term]').forEach(card => {
      if (card.dataset.pronEnhanced === '1') return;
      const g = glossary[card.dataset.term];
      if (!g?.abbrRead) return;
      const title = card.querySelector('b');
      if (!title) return;
      title.insertAdjacentHTML('afterend', `<span class="term-pron">読み：${esc(g.abbrRead)}</span>`);
      card.dataset.pronEnhanced = '1';
    });
  }

  const list = document.getElementById('glossaryList');
  if (list) new MutationObserver(enhanceCards).observe(list,{childList:true,subtree:true});
  enhanceCards();
})();
