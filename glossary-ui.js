/* 用語解説UI：略語読み・英語表記・英語読み + ST用語3秒反射 */
(() => {
  'use strict';
  const glossary = window.ST_DATA?.glossary;
  const questions = window.ST_DATA?.questions || [];
  if (!glossary) return;

  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const shuffle = a => {
    const x = [...a];
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [x[i], x[j]] = [x[j], x[i]];
    }
    return x;
  };
  const STORE_KEY = 'st-reflex-2026-v1';

  const style = document.createElement('style');
  style.textContent = `
    .term-pron{display:block;margin:-1px 0 7px;color:#52627b;font-size:12px;font-weight:700;line-height:1.5}
    .pron-panel{margin:14px 0 18px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fbfcff}
    .pron-row{display:grid;grid-template-columns:155px minmax(0,1fr);gap:12px;padding:11px 14px;border-bottom:1px solid var(--line);align-items:start}
    .pron-row:last-child{border-bottom:0}.pron-label{font-size:12px;font-weight:900;color:var(--muted)}.pron-value{font-weight:800;line-height:1.65;overflow-wrap:anywhere}
    .pron-value.english{font-family:Inter,system-ui,sans-serif;font-weight:700}
    .term-sections{display:grid;gap:10px}.term-section{background:#f7f9fc;border-radius:14px;padding:15px 17px;line-height:1.75}.term-section b{display:block;margin-bottom:5px}
    .st-reflex-panel{margin:0 0 22px;padding:20px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(135deg,#f8fbff,#fff);box-shadow:0 8px 28px rgba(15,34,68,.06)}
    .st-reflex-panel h2{margin:3px 0 8px;font-size:clamp(20px,4vw,28px)}
    .st-reflex-panel p{margin:0;color:var(--muted);line-height:1.75}
    .st-reflex-panel .reflex-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px;align-items:center}
    .st-reflex-note{font-size:12px;font-weight:800;color:var(--muted)}
    .st-term-badge{display:inline-flex;align-items:center;margin-left:7px;padding:2px 7px;border-radius:999px;background:#eaf1ff;color:#234ea0;font-size:10px;font-weight:900;vertical-align:middle}
    .reflex-dialog{width:min(680px,calc(100vw - 24px));max-height:calc(100vh - 24px);padding:0;border:0;border-radius:22px;box-shadow:0 24px 70px rgba(0,0,0,.28);overflow:hidden}
    .reflex-dialog::backdrop{background:rgba(4,13,30,.62)}
    .reflex-head{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:15px 18px;border-bottom:1px solid var(--line);background:#fff}
    .reflex-head b{font-size:14px}.reflex-head small{display:block;color:var(--muted);margin-top:2px}
    .reflex-body{padding:22px;background:#fbfcff;min-height:360px}
    .reflex-meter{height:7px;border-radius:999px;background:#e6ebf3;overflow:hidden;margin-bottom:24px}.reflex-meter span{display:block;height:100%;background:currentColor;width:0;transition:width .25s ease}
    .reflex-mode{display:inline-flex;padding:5px 10px;border-radius:999px;background:#edf3ff;color:#214b96;font-size:12px;font-weight:900}
    .reflex-question{margin:18px 0 10px;font-size:clamp(26px,7vw,42px);font-weight:950;line-height:1.25;letter-spacing:.01em;overflow-wrap:anywhere}
    .reflex-sub{font-weight:800;color:var(--muted);line-height:1.6}
    .reflex-count{display:flex;align-items:center;justify-content:center;width:74px;height:74px;margin:26px auto 18px;border:5px solid #dbe5f7;border-radius:50%;font-size:30px;font-weight:950;color:#234ea0}
    .reflex-answer{margin-top:20px;padding:18px;border-radius:16px;background:#fff;border:1px solid var(--line);line-height:1.75}
    .reflex-answer b{display:block;margin-bottom:5px;color:#234ea0}
    .reflex-rate{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:18px}
    .reflex-rate button{min-height:48px;border:1px solid var(--line);border-radius:13px;background:#fff;font-weight:900;cursor:pointer}
    .reflex-rate button:hover{background:#f1f5fb}.reflex-rate .good{border-color:#9ad7b0}.reflex-rate .mid{border-color:#e7c66f}.reflex-rate .bad{border-color:#eba2a2}
    .reflex-result{text-align:center;padding:24px 4px}.reflex-result strong{display:block;font-size:52px;margin:12px 0}.reflex-result p{color:var(--muted);line-height:1.7}
    @media(max-width:600px){.pron-row{grid-template-columns:1fr;gap:3px}.pron-panel{margin-top:10px}.reflex-body{padding:18px}.reflex-rate{grid-template-columns:1fr}.reflex-question{font-size:30px}}
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

  const linkedTerms = [...new Set(questions.flatMap(q => q.terms || []))].filter(term => glossary[term]);
  const linkedSet = new Set(linkedTerms);

  function enhanceCards(){
    const list = document.getElementById('glossaryList');
    if (!list) return;
    list.querySelectorAll('.term-card[data-term]').forEach(card => {
      const g = glossary[card.dataset.term];
      const title = card.querySelector('b');
      if (g?.abbrRead && title && card.dataset.pronEnhanced !== '1') {
        title.insertAdjacentHTML('afterend', `<span class="term-pron">読み：${esc(g.abbrRead)}</span>`);
        card.dataset.pronEnhanced = '1';
      }
      if (title && linkedSet.has(card.dataset.term) && card.dataset.stBadge !== '1') {
        title.insertAdjacentHTML('beforeend', '<span class="st-term-badge">ST演習対象</span>');
        card.dataset.stBadge = '1';
      }
    });
  }

  function loadState(){
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }
  function saveReflex(term, rating){
    const state = loadState();
    state.termReflex ||= {};
    const s = state.termReflex[term] || {good:0,mid:0,bad:0,last:0};
    s[rating] = (s[rating] || 0) + 1;
    s.last = Date.now();
    state.termReflex[term] = s;
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }
  function termWeakness(term){
    const state = loadState();
    const t = state.termReflex?.[term] || {};
    let score = (t.bad || 0) * 7 + (t.mid || 0) * 3 - (t.good || 0) * 1.5;
    questions.filter(q => q.terms?.includes(term)).forEach(q => {
      const s = state.byQ?.[q.id];
      if (!s?.seen) score += 2;
      else score += (s.wrong || 0) * 4 + Math.max(0, 3 - (s.level || 0));
    });
    return score + Math.random();
  }
  function trainingTerms(){
    const source = linkedTerms.length ? linkedTerms : Object.keys(glossary);
    return [...source].sort((a,b) => termWeakness(b) - termWeakness(a)).slice(0, Math.min(10, source.length));
  }

  const modes = [
    {key:'one',label:'一言反射',ask:(term,g)=>({main:term,sub:'一言でいうと？',answerLabel:'一言で',answer:g.short})},
    {key:'reverse',label:'逆引き',ask:(term,g)=>({main:g.short,sub:'この説明に当てはまる用語は？',answerLabel:'用語',answer:term})},
    {key:'category',label:'分類反射',ask:(term,g)=>({main:term,sub:'何の仲間・論点？',answerLabel:'分類',answer:g.cat})},
    {key:'distinguish',label:'混同分離',ask:(term,g)=>({main:term,sub:'何と間違えやすい？どう違う？',answerLabel:'見分け方',answer:g.distinguish})},
    {key:'use',label:'使いどころ',ask:(term,g)=>({main:term,sub:'どんな論点・場面で使う？',answerLabel:'使い方',answer:g.use})}
  ];
  let reflex = null;
  let countdownTimer = null;

  function ensureReflexDialog(){
    if (document.getElementById('reflexDialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'reflexDialog';
    dialog.className = 'reflex-dialog';
    dialog.innerHTML = `<div class="reflex-head"><div><b>ST用語 3秒反射</b><small>考え込まず、まず意味の骨格を出す</small></div><button class="btn secondary compact" id="closeReflex">終了</button></div><div class="reflex-body" id="reflexBody"></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('#closeReflex').addEventListener('click', () => { clearInterval(countdownTimer); dialog.close(); });
  }

  function injectReflexPanel(){
    const view = document.getElementById('view-glossary');
    const head = view?.querySelector('.page-head');
    if (!view || !head || document.getElementById('stReflexPanel')) return;
    const panel = document.createElement('section');
    panel.id = 'stReflexPanel';
    panel.className = 'st-reflex-panel';
    panel.innerHTML = `<p class="eyebrow">ST対策・過去問起点</p><h2>辞書を覚えない。出た用語だけ3秒反射。</h2><p>このアプリの演習問題で実際に使う用語だけを対象に、<b>用語→一言／意味→用語／分類／混同分離／使いどころ</b>を高速で回します。弱点の用語ほど先に出ます。</p><div class="reflex-actions"><button id="startTermReflex" class="btn primary">弱点10語を3秒反射</button><span class="st-reflex-note">対象：${linkedTerms.length || Object.keys(glossary).length}語</span></div>`;
    head.insertAdjacentElement('afterend', panel);
    panel.querySelector('#startTermReflex').addEventListener('click', startReflex);
  }

  function startReflex(){
    ensureReflexDialog();
    const terms = trainingTerms();
    if (!terms.length) return;
    reflex = {terms,index:0,good:0,mid:0,bad:0,modes:shuffle(modes)};
    const dialog = document.getElementById('reflexDialog');
    if (!dialog.open) dialog.showModal();
    renderReflexCard();
  }

  function renderReflexCard(){
    clearInterval(countdownTimer);
    const body = document.getElementById('reflexBody');
    if (!body || !reflex) return;
    if (reflex.index >= reflex.terms.length) return renderReflexResult();
    const term = reflex.terms[reflex.index];
    const g = glossary[term];
    const mode = reflex.modes[reflex.index % reflex.modes.length];
    const card = mode.ask(term,g);
    const pct = Math.round(reflex.index / reflex.terms.length * 100);
    body.innerHTML = `<div class="reflex-meter"><span style="width:${pct}%"></span></div><span class="reflex-mode">${esc(mode.label)}</span><div class="reflex-question">${esc(card.main)}</div><div class="reflex-sub">${esc(card.sub)}</div><div id="reflexCount" class="reflex-count">3</div><div id="reflexAnswer" class="reflex-answer" hidden><b>${esc(card.answerLabel)}</b>${esc(card.answer)}</div><div id="reflexRate" class="reflex-rate" hidden><button class="good" data-rating="good">出た</button><button class="mid" data-rating="mid">あやしい</button><button class="bad" data-rating="bad">出なかった</button></div>`;
    let count = 3;
    countdownTimer = setInterval(() => {
      count -= 1;
      const countEl = document.getElementById('reflexCount');
      if (countEl) countEl.textContent = Math.max(0,count);
      if (count <= 0) {
        clearInterval(countdownTimer);
        if (countEl) countEl.hidden = true;
        const ans = document.getElementById('reflexAnswer');
        const rate = document.getElementById('reflexRate');
        if (ans) ans.hidden = false;
        if (rate) rate.hidden = false;
      }
    },1000);
    body.querySelectorAll('[data-rating]').forEach(btn => btn.addEventListener('click', () => {
      const rating = btn.dataset.rating;
      reflex[rating] += 1;
      saveReflex(term,rating);
      reflex.index += 1;
      reflex.modes = shuffle(modes);
      renderReflexCard();
    }));
  }

  function renderReflexResult(){
    clearInterval(countdownTimer);
    const body = document.getElementById('reflexBody');
    const total = reflex.good + reflex.mid + reflex.bad;
    const rate = total ? Math.round(reflex.good / total * 100) : 0;
    body.innerHTML = `<div class="reflex-meter"><span style="width:100%"></span></div><div class="reflex-result"><span class="tag">10語終了</span><strong>${rate}%</strong><p>「3秒以内に意味の骨格が出た」割合です。<br>あやしい・出なかった用語は次回、弱点として優先されます。</p><div class="reflex-rate"><button class="good" id="retryReflex">もう10語</button><button id="openGlossary">用語一覧へ戻る</button><button id="finishReflex">終了</button></div></div>`;
    body.querySelector('#retryReflex').addEventListener('click', startReflex);
    body.querySelector('#openGlossary').addEventListener('click', () => document.getElementById('reflexDialog').close());
    body.querySelector('#finishReflex').addEventListener('click', () => document.getElementById('reflexDialog').close());
  }

  const list = document.getElementById('glossaryList');
  if (list) new MutationObserver(enhanceCards).observe(list,{childList:true,subtree:true});
  injectReflexPanel();
  ensureReflexDialog();
  enhanceCards();
})();
