/* ITストラテジスト脳：6つのコア思考を科目横断で反射練習する */
(() => {
  'use strict';
  const data = window.ST_DATA;
  if (!data || !Array.isArray(data.questions)) return;

  const CORES = [
    {id:'purpose',no:'01',title:'目的思考',lead:'何のためか？ 経営目標は何か？',flow:'環境変化 → 経営課題 → KGI → IT活用',keywords:['経営戦略','KGI','KPI','CSF','経営課題','事業環境','システム企画','目標','PPM','SWOT','PEST','VRIO','バリューチェーン']},
    {id:'structure',no:'02',title:'構造化思考',lead:'現状を分解し、どこで何が起きているかを見る。',flow:'現状 → 業務プロセス → 重複・待ち・手戻り → 構造',keywords:['業務改革','本文探索','データ活用','BPR','As-Is','To-Be','標準化','業務プロセス','再入力','転記','ボトルネック']},
    {id:'cause',no:'03',title:'因果思考',lead:'問題・原因・真因を混ぜずに掘り下げる。',flow:'問題 → 直接原因 → 真因 → 解くべき課題',keywords:['真因','原因','課題分析','根拠抽出','なぜ','理由','再発','Root Cause','問題管理','因果']},
    {id:'judge',no:'04',title:'判断思考',lead:'全部やらない。効果・コスト・リスク・制約で選ぶ。',flow:'選択肢 → 効果 → コスト → リスク → 制約 → 優先順位',keywords:['投資評価','ROI','NPV','TCO','リスク管理','調達','優先順位','実現可能性','費用','回収期間','RFP','PoC','段階導入']},
    {id:'execute',no:'05',title:'実行思考',lead:'関係者を動かし、実行可能な状態へ持っていく。',flow:'利害関係者 → 懸念 → 根拠 → 調整 → 合意 → 移行',keywords:['合意形成','関係者調整','ステークホルダー','移行','リスク対応','受入','UAT','教育','反対','懸念','運用','段階導入']},
    {id:'evaluate',no:'06',title:'評価・改善思考',lead:'導入して終わらず、同じ物差しで測り改善する。',flow:'KPI → 測定方法 → 実績 → 差異 → 原因 → 改善',keywords:['評価','成果確認','KPI','KGI','SLA','SLM','改善','効果','PDCA','測定','サービス管理','EVM']}
  ];

  const style = document.createElement('style');
  style.textContent = `
    .brain-block{margin:0 0 34px}.brain-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:14px}.brain-head p{margin:5px 0 0}.brain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.brain-card{border:1px solid var(--line);background:#fff;border-radius:18px;padding:18px;text-align:left;box-shadow:0 6px 20px rgba(15,35,70,.04)}.brain-card:hover{border-color:#8bb1ff;box-shadow:var(--shadow)}.brain-card .brain-no{font-size:12px;font-weight:900;color:var(--blue);letter-spacing:.08em}.brain-card b{display:block;font-size:18px;margin:5px 0}.brain-card p{font-size:14px;color:var(--muted);line-height:1.6;margin:0 0 10px}.brain-flow{display:block;background:#f5f8fd;border-radius:10px;padding:9px 10px;font-size:12px;line-height:1.55;color:#41506a}.brain-start{display:inline-block;margin-top:11px;color:var(--blue);font-weight:900;font-size:13px}.brain-map{background:linear-gradient(120deg,#f7f9fc,#eef4ff);border:1px solid var(--line);border-radius:16px;padding:13px 15px;margin-bottom:13px;font-size:14px;line-height:1.7}.brain-result{font-size:13px;color:var(--muted);margin-top:10px}@media(max-width:850px){.brain-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.brain-grid{grid-template-columns:1fr}.brain-head{align-items:stretch;flex-direction:column}}
  `;
  document.head.appendChild(style);

  const metric = document.querySelector('#view-home .metric-grid');
  if (!metric) return;
  const block = document.createElement('section');
  block.className = 'brain-block';
  block.innerHTML = `<div class="brain-head"><div><p class="eyebrow">ITストラテジスト脳</p><h2>6つの思考回路を反射化する</h2><p class="muted">用語から入るのではなく、状況を見た瞬間に必要な思考と道具が出る状態を作ります。</p></div></div><div class="brain-grid">${CORES.map(c=>`<button class="brain-card" data-thinking="${c.id}"><span class="brain-no">CORE ${c.no}</span><b>${c.title}</b><p>${c.lead}</p><span class="brain-flow">${c.flow}</span><span class="brain-start">この思考を鍛える →</span></button>`).join('')}</div>`;
  metric.insertAdjacentElement('afterend', block);

  const shuffle = a => {const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
  const esc = v => String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let run = null;

  function matches(q, core){
    const text=[q.stage,q.topic,q.prompt,q.structure,q.explain,...(q.terms||[])].join(' ').toLowerCase();
    return core.keywords.some(k=>text.includes(k.toLowerCase()));
  }
  function pool(core){
    let list=data.questions.filter(q=>matches(q,core));
    if(list.length<5){
      const fallback=core.id==='execute'||core.id==='cause'||core.id==='structure'?data.questions.filter(q=>q.section==='b1'||q.section==='b2'):data.questions.filter(q=>q.section==='a2'||q.section==='b2');
      list=[...new Map([...list,...fallback].map(q=>[q.id,q])).values()];
    }
    return shuffle(list).slice(0,7);
  }
  function showStudy(){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-study').classList.add('active');
    document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.remove('active'));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function start(core){
    const items=pool(core); if(!items.length) return;
    run={core,items,index:0,correct:0}; showStudy(); render();
  }
  function render(){
    const q=run.items[run.index], mapped=shuffle(q.choices.map((text,index)=>({text,index})));
    document.getElementById('sessionTitle').textContent=`${run.core.title}トレーニング`;
    document.getElementById('questionCounter').textContent=`${run.index+1} / ${run.items.length}`;
    document.getElementById('progressBar').style.width=`${run.index/run.items.length*100}%`;
    document.getElementById('answerTimer').textContent='思考軸';
    const card=document.getElementById('questionCard');
    card.innerHTML=`<div class="q-meta"><span class="tag">${esc(run.core.title)}</span><span class="stage">科目横断</span></div><div class="brain-map"><b>今の思考回路</b><br>${esc(run.core.flow)}</div>${q.context?`<div class="q-context">${esc(q.context)}</div>`:''}<div class="q-prompt">${esc(q.prompt)}</div><div class="choices">${mapped.map((c,i)=>`<button class="choice" data-brain-answer="${c.index}"><span class="choice-key">${'アイウエ'[i]}</span><span>${esc(c.text)}</span></button>`).join('')}</div><div id="brainFeedback"></div>`;
    card.querySelectorAll('[data-brain-answer]').forEach(b=>b.addEventListener('click',()=>answer(q,Number(b.dataset.brainAnswer),b)));
  }
  function answer(q,value,button){
    const ok=value===q.answer;if(ok)run.correct++;
    document.querySelectorAll('[data-brain-answer]').forEach(b=>{b.disabled=true;if(Number(b.dataset.brainAnswer)===q.answer)b.classList.add('correct')});
    if(!ok)button.classList.add('wrong');
    const box=document.getElementById('brainFeedback');
    box.innerHTML=`<div class="feedback"><div class="result ${ok?'good':'bad'}">${ok?'正解':'不正解'}${ok?'':`　正解：${esc(q.choices[q.answer])}`}</div><div class="explain-box"><b>この場面で回す思考</b>${esc(q.structure||run.core.flow)}</div><div class="explain-box"><b>解説</b>${esc(q.explain)}</div><button id="brainNext" class="btn primary">${run.index===run.items.length-1?'結果を見る':'次へ'}</button></div>`;
    document.getElementById('brainNext').addEventListener('click',()=>{run.index++;if(run.index>=run.items.length)finish();else render()});
  }
  function finish(){
    const pct=Math.round(run.correct/run.items.length*100);document.getElementById('progressBar').style.width='100%';
    document.getElementById('questionCard').innerHTML=`<div class="q-meta"><span class="tag">思考回路トレーニング終了</span></div><div class="q-prompt">${esc(run.core.title)}：${run.correct} / ${run.items.length}問正解</div><div class="brain-map"><b>頭に残す順序</b><br>${esc(run.core.flow)}</div><div class="explain-box">${pct>=80?'知識ではなく、この順序で判断できる状態を維持しましょう。':'答えそのものより、どの順序で考えるかをもう一度確認しましょう。'}</div><div class="question-actions"><button class="btn secondary" id="brainHome">ホームへ</button><button class="btn primary" id="brainRetry">もう一度</button></div>`;
    document.getElementById('brainHome').addEventListener('click',()=>document.querySelector('[data-nav="home"]').click());
    document.getElementById('brainRetry').addEventListener('click',()=>start(run.core));
  }

  document.addEventListener('click',e=>{const b=e.target.closest('[data-thinking]');if(!b)return;const core=CORES.find(c=>c.id===b.dataset.thinking);if(core)start(core)});
})();
