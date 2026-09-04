(() => {
  'use strict';
  const DATA = window.ST_DATA;
  const QUESTIONS = DATA.questions;
  const GLOSSARY = DATA.glossary;
  const KEY = 'st-reflex-2026-v1';
  const DAY = 86400000;
  const INTERVALS = [0, 1, 3, 7, 14, 30];
  const LABELS = {a1:'科目A-1',a2:'科目A-2',b1:'科目B-1',b2:'科目B-2'};
  const REASONS = ['用語を知らない','似た用語と混同','設問要求を読み違えた','根拠を見落とした','言い換えられない','計算・手順を忘れた','時間をかけすぎた'];

  const fresh = () => ({version:1,createdAt:Date.now(),answered:0,correct:0,totalSeconds:0,byQ:{},reasons:{},history:{},cases:[],drafts:{},recall:{}});
  let state = load();
  let session = null;
  let tick = null;
  let deferredInstall = null;
  let mock = null;

  function load(){
    try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return fresh()}
  }
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
  function formatTime(sec){sec=Math.max(0,Math.floor(sec));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
  function todayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200)}
  function linkTerms(text){
    let out=esc(text);
    Object.keys(GLOSSARY).sort((a,b)=>b.length-a.length).forEach(term=>{
      const safe=esc(term).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      out=out.replace(new RegExp(safe,'g'),`<button class="term-link" data-term="${esc(term)}">${esc(term)}</button>`);
    });
    return out;
  }

  function nav(name){
    clearInterval(tick);tick=null;
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById(`view-${name}`).classList.add('active');
    document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));
    if(name==='home')updateDashboard();
    if(name==='glossary')renderGlossary();
    if(name==='cases')renderCases();
    if(name==='progress')renderProgress();
    if(name==='mock'){document.getElementById('mockSetup').classList.remove('hidden');document.getElementById('mockExam').classList.add('hidden')}
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function qStat(id){return state.byQ[id]||{seen:0,correct:0,wrong:0,slow:0,level:0,due:0,times:[]}}
  function isDue(q){const s=qStat(q.id);return s.seen>0 && (s.due||0)<=Date.now()}
  function masteryFor(section){
    const list=QUESTIONS.filter(q=>q.section===section);if(!list.length)return 0;
    const points=list.reduce((n,q)=>{const s=qStat(q.id);return n+Math.min(1,(s.level||0)/4)},0);
    return Math.round(points/list.length*100);
  }
  function streak(){
    let n=0;for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);if((state.history[todayKey(d)]?.answered||0)>0)n++;else if(i>0)break;else if(i===0)continue}return n;
  }
  function updateDashboard(){
    const all=Object.values(state.byQ), seen=all.filter(x=>x.seen).length, due=QUESTIONS.filter(isDue).length;
    const overall=Math.round(['a1','a2','b1','b2'].reduce((n,s)=>n+masteryFor(s),0)/4);
    document.getElementById('metricMastery').textContent=`${overall}%`;
    document.getElementById('metricDue').textContent=`${due}問`;
    document.getElementById('metricSeen').textContent=`${seen}問`;
    document.getElementById('metricTime').textContent=state.answered?`${(state.totalSeconds/state.answered).toFixed(1)}秒`:'--';
    document.getElementById('streakBadge').textContent=`${streak()}日継続`;
    ['a1','a2','b1','b2'].forEach(s=>document.getElementById(`${s}Rate`).textContent=`${masteryFor(s)}%`);
    document.getElementById('todayMessage').textContent=due?`復習期限の問題が${due}問あります。迷った正解も優先します。`:'新しい問題と弱点から、今日の学習を組みます。';
  }

  function startSection(section){
    const due=QUESTIONS.filter(q=>q.section===section&&isDue(q));
    const weak=QUESTIONS.filter(q=>q.section===section&&!due.includes(q)).sort((a,b)=>(qStat(a.id).level||0)-(qStat(b.id).level||0));
    startSession([...shuffle(due),...shuffle(weak)].slice(0,10),LABELS[section]);
  }
  function startToday(){
    const due=shuffle(QUESTIONS.filter(isDue));
    const unseen=shuffle(QUESTIONS.filter(q=>!qStat(q.id).seen));
    const weak=QUESTIONS.filter(q=>qStat(q.id).seen&&!isDue(q)).sort((a,b)=>(qStat(a.id).level||0)-(qStat(b.id).level||0));
    const unique=[];[...due,...unseen,...weak].forEach(q=>{if(!unique.includes(q))unique.push(q)});
    startSession(unique.slice(0,20),'今日の学習');
  }
  function startZero(){
    const order=['a1-01','a1-02','a1-05','a2-01','a2-02','a2-07','b1-01','b1-02','b1-03','b2-01','b2-02','b2-03'];
    startSession(order.map(id=>QUESTIONS.find(q=>q.id===id)).filter(Boolean),'はじめの12問');
  }
  function startSession(items,title){
    if(!items.length){toast('対象問題はありません');return}
    session={items,index:0,title,correct:0,started:Date.now(),answered:false,choiceMap:[]};
    nav('study');renderQuestion();
  }
  function preparedChoices(q){
    return shuffle(q.choices.map((text,index)=>({text,index})));
  }
  function renderQuestion(){
    clearInterval(tick);
    const q=session.items[session.index];session.answered=false;session.startedQ=Date.now();session.choiceMap=preparedChoices(q);
    document.getElementById('sessionTitle').textContent=session.title;
    document.getElementById('questionCounter').textContent=`${session.index+1} / ${session.items.length}`;
    document.getElementById('progressBar').style.width=`${session.index/session.items.length*100}%`;
    document.getElementById('answerTimer').textContent='00:00';
    const card=document.getElementById('questionCard');
    card.innerHTML=`<div class="q-meta"><span class="tag">${esc(LABELS[q.section])}</span><span class="stage">${esc(q.stage)} ・ ${esc(q.topic)}</span></div>
      ${q.context?`<div class="q-context">${linkTerms(q.context)}</div>`:''}
      <div class="q-prompt">${linkTerms(q.prompt)}</div>
      <div class="choices">${session.choiceMap.map((c,i)=>`<button class="choice" data-original="${c.index}"><span class="choice-key">${'アイウエ'[i]}</span><span>${linkTerms(c.text)}</span></button>`).join('')}</div>
      <div class="question-actions"><div><button id="showHint" class="btn text">考え方を見る</button><button id="dontKnow" class="btn secondary">わからない</button></div><button id="nextQuestion" class="btn primary hidden">次へ</button></div><div id="hintBox" class="explain-box hidden"><b>答えを選ぶ前の考え方</b>${linkTerms(q.structure)}</div><div id="feedback"></div>`;
    card.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>answer(q,Number(b.dataset.original),b)));
    document.getElementById('dontKnow').addEventListener('click',()=>answer(q,-1,null,true));
    document.getElementById('showHint').addEventListener('click',()=>document.getElementById('hintBox').classList.remove('hidden'));
    document.getElementById('nextQuestion').addEventListener('click',nextQuestion);
    tick=setInterval(()=>document.getElementById('answerTimer').textContent=formatTime((Date.now()-session.startedQ)/1000),500);
  }
  function answer(q,value,button,dont=false){
    if(session.answered)return;session.answered=true;clearInterval(tick);
    const sec=(Date.now()-session.startedQ)/1000, ok=value===q.answer;
    if(ok)session.correct++;
    recordResult(q,ok,sec,dont);
    document.querySelectorAll('.choice').forEach(b=>{b.disabled=true;if(Number(b.dataset.original)===q.answer)b.classList.add('correct')});
    if(button&&!ok)button.classList.add('wrong');
    document.getElementById('dontKnow').classList.add('hidden');
    document.getElementById('nextQuestion').classList.remove('hidden');
    const feedback=document.getElementById('feedback');feedback.className='feedback';
    feedback.innerHTML=`<div class="result ${ok?'good':'bad'}">${ok?'正解':'不正解'}　${!ok?`正解：${esc(q.choices[q.answer])}`:''}</div>
      <div class="explain-box"><b>解答の型</b>${linkTerms(q.structure)}</div>
      <div class="explain-box"><b>解説</b>${linkTerms(q.explain)}</div>
      ${!ok?`<div class="reason-title">どこで止まりましたか</div><div class="reason-row">${REASONS.map(r=>`<button class="reason-btn" data-reason="${esc(r)}">${esc(r)}</button>`).join('')}</div>`:''}`;
    feedback.querySelectorAll('[data-reason]').forEach(b=>b.addEventListener('click',()=>{feedback.querySelectorAll('[data-reason]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.reasons[b.dataset.reason]=(state.reasons[b.dataset.reason]||0)+1;save()}));
  }
  function recordResult(q,ok,sec,dont){
    const s=state.byQ[q.id]||{seen:0,correct:0,wrong:0,slow:0,level:0,due:0,times:[]};
    s.seen++;s.last=Date.now();s.times=[...(s.times||[]),Math.round(sec)].slice(-10);
    const limit=q.section.startsWith('a')?15:35;
    if(ok){s.correct++;if(sec>limit)s.slow++;s.level=Math.min(5,(s.level||0)+(sec<=limit?1:.5))}else{s.wrong++;s.level=Math.max(0,(s.level||0)-1)}
    const interval=ok?INTERVALS[Math.min(INTERVALS.length-1,Math.floor(s.level))]:0;
    s.due=Date.now()+interval*DAY;state.byQ[q.id]=s;
    state.answered++;if(ok)state.correct++;state.totalSeconds+=sec;
    const h=state.history[todayKey()]||(state.history[todayKey()]={answered:0,correct:0,seconds:0});h.answered++;if(ok)h.correct++;h.seconds+=sec;
    save();
  }
  function nextQuestion(){
    if(!session.answered)return;session.index++;
    if(session.index>=session.items.length)return finishSession();renderQuestion();window.scrollTo({top:0,behavior:'smooth'});
  }
  function finishSession(){
    clearInterval(tick);const pct=Math.round(session.correct/session.items.length*100);
    document.getElementById('progressBar').style.width='100%';
    document.getElementById('questionCard').innerHTML=`<div class="q-meta"><span class="tag">学習終了</span></div><div class="q-prompt">${session.correct} / ${session.items.length}問正解</div><div class="metric-grid"><article class="metric"><span>正答率</span><strong>${pct}%</strong></article><article class="metric"><span>所要時間</span><strong>${formatTime((Date.now()-session.started)/1000)}</strong></article></div><div class="explain-box">${pct>=90?'この回は目標水準です。日を空けた類似問題でも再現できれば定着です。':pct>=70?'迷った問題が復習対象になりました。解答の型を確認して再挑戦してください。':'用語直結と二択へ戻り、判断単位を小さくして固めましょう。'}</div><div class="question-actions"><button class="btn secondary" data-home>ホームへ</button><button class="btn primary" data-retry>もう一度</button></div>`;
    document.querySelector('[data-home]').addEventListener('click',()=>nav('home'));
    document.querySelector('[data-retry]').addEventListener('click',()=>startSession(shuffle(session.items),session.title));
  }

  function startRecall(){
    const learned=Object.keys(GLOSSARY).filter(term=>QUESTIONS.some(q=>q.terms?.includes(term)&&qStat(q.id).seen));
    const terms=shuffle(learned.length?learned:Object.keys(GLOSSARY)).slice(0,10);
    session={type:'recall',terms,index:0,started:Date.now()};nav('study');renderRecall();
  }
  function renderRecall(){
    clearInterval(tick);const term=session.terms[session.index],g=GLOSSARY[term];session.startedQ=Date.now();
    document.getElementById('sessionTitle').textContent='何も見ずに思い出す';document.getElementById('questionCounter').textContent=`${session.index+1} / ${session.terms.length}`;document.getElementById('progressBar').style.width=`${session.index/session.terms.length*100}%`;document.getElementById('answerTimer').textContent='00:00';
    document.getElementById('questionCard').innerHTML=`<div class="q-meta"><span class="tag">想起練習</span><span class="stage">補助輪なし</span></div><div class="q-prompt">「${esc(term)}」とは何ですか。意味・見分け方・使い方を頭の中で説明してください。</div><textarea id="recallMemo" class="essay-editor" style="min-height:130px" placeholder="入力しても、頭の中だけで答えても構いません"></textarea><div class="question-actions"><button id="revealRecall" class="btn primary">答えを確認</button></div><div id="recallAnswer" class="hidden"><div class="explain-box"><b>一言で</b>${esc(g.short)}</div><div class="explain-box"><b>見分け方</b>${esc(g.distinguish)}</div><div class="explain-box"><b>使い方</b>${esc(g.use)}</div><div class="reason-title">どの程度思い出せましたか</div><div class="reason-row"><button class="reason-btn" data-recall="2">説明できた</button><button class="reason-btn" data-recall="1">あいまい</button><button class="reason-btn" data-recall="0">出なかった</button></div></div>`;
    document.getElementById('revealRecall').addEventListener('click',()=>{document.getElementById('recallAnswer').classList.remove('hidden');document.getElementById('revealRecall').classList.add('hidden')});
    document.querySelectorAll('[data-recall]').forEach(b=>b.addEventListener('click',()=>rateRecall(term,Number(b.dataset.recall))));
    tick=setInterval(()=>document.getElementById('answerTimer').textContent=formatTime((Date.now()-session.startedQ)/1000),500);
  }
  function rateRecall(term,score){
    const r=state.recall[term]||{seen:0,score:0};r.seen++;r.score=score;r.last=Date.now();r.due=Date.now()+(score===2?3:score===1?1:0)*DAY;state.recall[term]=r;save();session.index++;
    if(session.index>=session.terms.length){clearInterval(tick);document.getElementById('questionCard').innerHTML='<div class="q-meta"><span class="tag">想起練習終了</span></div><div class="q-prompt">頭から取り出す練習が終わりました。</div><div class="explain-box">出なかった用語は、今日また表示されます。説明できた用語は間隔を空けて確認します。</div><button class="btn primary" data-home>ホームへ</button>';document.querySelector('[data-home]').addEventListener('click',()=>nav('home'));return}renderRecall();
  }

  function renderGlossary(){
    const query=(document.getElementById('glossarySearch').value||'').trim().toLowerCase();
    const list=Object.entries(GLOSSARY).filter(([k,v])=>!query||`${k} ${v.cat} ${v.short} ${v.detail}`.toLowerCase().includes(query));
    document.getElementById('glossaryList').innerHTML=list.map(([term,g])=>`<button class="term-card" data-term="${esc(term)}"><span class="tag">${esc(g.cat)}</span><b>${esc(term)}</b><p>${esc(g.short)}</p></button>`).join('')||'<div class="panel">該当する用語はありません。</div>';
  }
  function openTerm(term){
    const g=GLOSSARY[term];if(!g)return;const d=document.getElementById('termDialog');
    document.getElementById('termContent').innerHTML=`<span class="tag">${esc(g.cat)}</span><h1>${esc(term)}</h1><p class="q-prompt">${esc(g.short)}</p><div class="explain-box"><b>意味</b>${esc(g.detail)}</div><div class="term-route"><div>${esc(g.distinguish)}</div><span>→</span><div>${esc(g.use)}</div></div>`;
    d.showModal();
  }

  const caseFields=['caseTitle','caseBackground','caseProblem','caseGoal','caseRoot','caseAction','caseStakeholder','caseRisk','caseResult'];
  function clearCaseForm(){document.getElementById('caseId').value='';caseFields.forEach(id=>document.getElementById(id).value='')}
  function formCase(){const c={id:document.getElementById('caseId').value||`case-${Date.now()}`,updatedAt:Date.now()};caseFields.forEach(id=>c[id.replace('case','').toLowerCase()]=document.getElementById(id).value.trim());return c}
  function renderCases(){
    const box=document.getElementById('caseList');box.innerHTML=state.cases.length?state.cases.map(c=>`<article class="case-item"><h3>${esc(c.title||'名称未設定')}</h3><p>${esc(c.problem||c.background||'')}</p><div class="case-item-actions"><button class="btn secondary compact" data-edit-case="${c.id}">編集</button><button class="btn secondary compact" data-outline-case="${c.id}">骨子を見る</button><button class="btn text compact" data-delete-case="${c.id}">削除</button></div></article>`).join(''):'<div class="panel"><b>まだ経験カードがありません。</b><p class="muted">まず一つ、実際に担当した取組を登録してください。</p></div>';
  }
  function editCase(id){const c=state.cases.find(x=>x.id===id);if(!c)return;document.getElementById('caseId').value=c.id;caseFields.forEach(fid=>document.getElementById(fid).value=c[fid.replace('case','').toLowerCase()]||'');window.scrollTo({top:0,behavior:'smooth'})}
  function showOutline(id){const c=state.cases.find(x=>x.id===id);if(!c)return;const box=document.getElementById('outlinePreview');box.classList.remove('hidden');box.innerHTML=`<p class="eyebrow">骨子シート</p><h2>${esc(c.title)}</h2>${[['第1章：事業と課題',`${c.background}\n${c.problem}\n目標：${c.goal}`],['第2章：調査・真因・調整',`${c.root}\n${c.stakeholder}`],['第3章：施策・評価',`${c.action}\nリスク：${c.risk}\n成果：${c.result}`]].map(([h,p])=>`<h3>${h}</h3><p>${esc(p)}</p>`).join('')}`;box.scrollIntoView({behavior:'smooth',block:'start'})}

  function startMock(type){
    nav('mock');document.getElementById('mockSetup').classList.add('hidden');document.getElementById('mockExam').classList.remove('hidden');
    if(type==='b2')return renderEssayMock();
    const minutes={a1:50,a2:40,b1:90}[type], list=shuffle(QUESTIONS.filter(q=>q.section===type));
    mock={type,list,index:0,answers:{},started:Date.now(),ends:Date.now()+minutes*60000};renderMockQuestion();startMockClock();
  }
  function startMockClock(){clearInterval(tick);const run=()=>{const left=Math.max(0,(mock.ends-Date.now())/1000);const el=document.getElementById('mockClock');if(el)el.textContent=formatTime(left);if(left<=0){clearInterval(tick);finishMock()}};run();tick=setInterval(run,1000)}
  function renderMockQuestion(){
    const q=mock.list[mock.index], isB1=mock.type==='b1', saved=mock.answers[q.id]??'';
    document.getElementById('mockExam').innerHTML=`<div class="cbt-top"><b>${LABELS[mock.type]}　CBT練習</b><span id="mockClock" class="cbt-timer">--:--</span></div><div class="cbt-body"><main class="cbt-main"><p>問${mock.index+1}</p>${q.context?`<div class="essay-prompt">${esc(q.context)}</div>`:''}<div class="q-prompt">${esc(q.prompt)}</div>${isB1?`<textarea id="b1Input" class="essay-editor" style="min-height:150px" placeholder="本文の根拠を使い、設問に対応する表現で入力">${esc(saved)}</textarea><div class="char-count"><span id="b1Chars">${String(saved).length}</span>字</div>`:`<div class="choices">${q.choices.map((c,i)=>`<label class="choice"><input type="radio" name="mockChoice" value="${i}" ${Number(saved)===i?'checked':''}><span class="choice-key">${'アイウエ'[i]}</span><span>${esc(c)}</span></label>`).join('')}</div>`}<div class="cbt-actions"><button id="mockPrev" class="btn secondary" ${mock.index===0?'disabled':''}>前へ</button><button id="mockNext" class="btn primary">${mock.index===mock.list.length-1?'採点へ':'次へ'}</button></div></main><aside class="cbt-side"><b>問題一覧</b><div class="number-grid">${mock.list.map((x,i)=>`<button data-mock-index="${i}" class="${i===mock.index?'current':''} ${mock.answers[x.id]!==undefined?'done':''}">${i+1}</button>`).join('')}</div><p class="muted">本番に近い画面で操作と時間配分を確認します。</p></aside></div>`;
    if(isB1){const area=document.getElementById('b1Input');area.addEventListener('input',()=>{mock.answers[q.id]=area.value;document.getElementById('b1Chars').textContent=area.value.length})}
    else document.querySelectorAll('[name=mockChoice]').forEach(x=>x.addEventListener('change',()=>mock.answers[q.id]=Number(x.value)));
    document.getElementById('mockPrev').addEventListener('click',()=>{mock.index--;renderMockQuestion();startMockClock()});
    document.getElementById('mockNext').addEventListener('click',()=>{if(mock.index===mock.list.length-1)finishMock();else{mock.index++;renderMockQuestion();startMockClock()}});
    document.querySelectorAll('[data-mock-index]').forEach(b=>b.addEventListener('click',()=>{mock.index=Number(b.dataset.mockIndex);renderMockQuestion();startMockClock()}));
  }
  function finishMock(){
    clearInterval(tick);const isB1=mock.type==='b1';let body='';
    if(isB1){body=mock.list.map((q,i)=>`<div class="explain-box"><b>問${i+1}　模範要素</b>${esc(q.choices[q.answer])}<br><span class="muted">あなたの回答：${esc(mock.answers[q.id]||'未回答')}</span></div>`).join('')}
    else{const correct=mock.list.filter(q=>mock.answers[q.id]===q.answer).length,pct=Math.round(correct/mock.list.length*100);body=`<div class="q-prompt">${correct} / ${mock.list.length}問正解（${pct}%）</div><div class="explain-box">${pct>=90?'目標水準です。翌日以降にも再現できるか確認してください。':'誤答と未回答を学習モードで復習してください。'}</div>`}
    document.getElementById('mockExam').innerHTML=`<div class="cbt-top"><b>${LABELS[mock.type]}　結果</b></div><div class="cbt-main">${body}<button class="btn primary" data-back-mock>本番形式へ戻る</button></div>`;
    document.querySelector('[data-back-mock]').addEventListener('click',()=>nav('mock'));
  }
  function renderEssayMock(){
    const saved=state.drafts.b2||{outline:['','',''],essay:''};mock={type:'b2',started:Date.now(),ends:Date.now()+120*60000};
    document.getElementById('mockExam').innerHTML=`<div class="cbt-top"><b>科目B-2　120分論述練習</b><span id="mockClock" class="cbt-timer">120:00</span></div><div class="cbt-main"><div class="essay-prompt"><b>練習課題</b><br>あなたが携わった業務改革について、事業環境と経営課題、調査で明らかにした真因、策定した業務・IT施策、関係者との調整、リスクへの対応及び効果評価を一貫して述べなさい。</div><div class="essay-outline"><textarea data-outline="0" rows="6" placeholder="第1章：事業・課題・目標">${esc(saved.outline?.[0]||'')}</textarea><textarea data-outline="1" rows="6" placeholder="第2章：調査・真因・調整">${esc(saved.outline?.[1]||'')}</textarea><textarea data-outline="2" rows="6" placeholder="第3章：施策・評価・改善">${esc(saved.outline?.[2]||'')}</textarea></div><textarea id="essayEditor" class="essay-editor" placeholder="ここに論文を入力">${esc(saved.essay||'')}</textarea><div class="char-count"><span id="essayChars">${(saved.essay||'').length}</span>字</div><div class="checklist">${['設問の全要求に答えた','環境変化から施策まで因果がつながる','自分の判断と工夫を書いた','数値・期間・規模を入れた','リスクと評価方法を書いた'].map(x=>`<label><input type="checkbox"> ${x}</label>`).join('')}</div><div class="cbt-actions"><button id="saveEssay" class="btn secondary">下書きを保存</button><button id="finishEssay" class="btn primary">練習を終了</button></div></div>`;
    const persist=()=>{state.drafts.b2={outline:[...document.querySelectorAll('[data-outline]')].map(x=>x.value),essay:document.getElementById('essayEditor').value,updatedAt:Date.now()};save()};
    document.getElementById('essayEditor').addEventListener('input',e=>{document.getElementById('essayChars').textContent=e.target.value.length;persist()});document.querySelectorAll('[data-outline]').forEach(x=>x.addEventListener('input',persist));
    document.getElementById('saveEssay').addEventListener('click',()=>{persist();toast('下書きを端末に保存しました')});document.getElementById('finishEssay').addEventListener('click',()=>{persist();clearInterval(tick);toast('下書きを保存しました');nav('mock')});startMockClock();
  }

  function renderProgress(){
    document.getElementById('progressSummary').innerHTML=['a1','a2','b1','b2'].map(s=>`<article class="report-card"><span>${LABELS[s]}</span><strong>${masteryFor(s)}%</strong></article>`).join('');
    const reasons=Object.entries(state.reasons).sort((a,b)=>b[1]-a[1]);document.getElementById('reasonReport').innerHTML=reasons.length?reasons.map(([r,n])=>`<div class="report-row"><span>${esc(r)}</span><b>${n}回</b></div>`).join(''):'<p class="muted">まだ記録がありません。</p>';
  }
  function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`st-reflex-backup-${todayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  document.addEventListener('click',e=>{
    const navBtn=e.target.closest('[data-nav]');if(navBtn){nav(navBtn.dataset.nav);return}
    const start=e.target.closest('[data-start]');if(start){startSection(start.dataset.start);return}
    const mockBtn=e.target.closest('[data-mock]');if(mockBtn){startMock(mockBtn.dataset.mock);return}
    const runMock=e.target.closest('[data-run-mock]');if(runMock){startMock(runMock.dataset.runMock);return}
    const term=e.target.closest('[data-term]');if(term){openTerm(term.dataset.term);return}
    const edit=e.target.closest('[data-edit-case]');if(edit){editCase(edit.dataset.editCase);return}
    const outline=e.target.closest('[data-outline-case]');if(outline){showOutline(outline.dataset.outlineCase);return}
    const del=e.target.closest('[data-delete-case]');if(del&&confirm('この経験カードを削除しますか？')){state.cases=state.cases.filter(c=>c.id!==del.dataset.deleteCase);save();renderCases()}
  });
  document.getElementById('startToday').addEventListener('click',startToday);
  document.getElementById('startZero').addEventListener('click',startZero);
  document.getElementById('startRecall').addEventListener('click',startRecall);
  document.getElementById('exitSession').addEventListener('click',()=>{if(confirm('学習記録を保存して終了しますか？'))nav('home')});
  document.getElementById('glossarySearch').addEventListener('input',renderGlossary);
  document.querySelector('.dialog-close').addEventListener('click',()=>document.getElementById('termDialog').close());
  document.getElementById('termDialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close()});
  document.getElementById('caseForm').addEventListener('submit',e=>{e.preventDefault();const c=formCase(),i=state.cases.findIndex(x=>x.id===c.id);if(i>=0)state.cases[i]=c;else state.cases.unshift(c);save();clearCaseForm();renderCases();toast('経験カードを保存しました')});
  document.getElementById('clearCase').addEventListener('click',clearCaseForm);document.getElementById('newCase').addEventListener('click',()=>{clearCaseForm();document.getElementById('caseTitle').focus()});
  document.getElementById('exportData').addEventListener('click',exportData);
  document.getElementById('importData').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state={...fresh(),...JSON.parse(r.result)};save();renderProgress();toast('学習記録を読み込みました')}catch{toast('読み込めないファイルです')}};r.readAsText(f)});
  document.getElementById('resetData').addEventListener('click',()=>{if(confirm('この端末の学習記録をすべて削除しますか？')){state=fresh();save();renderProgress();toast('学習記録を初期化しました')}});

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;document.getElementById('installBtn').classList.remove('hidden')});
  document.getElementById('installBtn').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null}else alert('ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選んでください。')});
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  updateDashboard();
})();
