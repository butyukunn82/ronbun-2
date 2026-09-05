/* ITストラテジスト脳：6つのコア思考 × 7反射構文 */
(() => {
  'use strict';
  const data = window.ST_DATA;
  if (!data || !Array.isArray(data.questions)) return;

  const CORES = [
    {id:'purpose',no:'01',title:'目的思考',lead:'何のためか？ 経営目標は何か？',flow:'環境変化 → 経営課題 → KGI → IT活用',keywords:['経営戦略','KGI','KPI','CSF','経営課題','事業環境','システム企画','目標','PPM','SWOT','PEST','VRIO','バリューチェーン'],patterns:[
      {id:'p1',name:'環境変化から課題へ',cue:'市場・制度・顧客・技術が変化した',reflex:'変化 → 経営への影響 → 解くべき経営課題',trap:'「新技術を導入する」を最初に置かない',tools:'PEST・5Forces・SWOT'},
      {id:'p2',name:'KGIから逆算',cue:'売上・利益・シェアなどの目標が示された',reflex:'KGI → 現状との差 → 差を生む要因 → 優先課題',trap:'目標値だけ見て施策へ飛ばない',tools:'KGI・KPI・ギャップ分析'},
      {id:'p3',name:'顧客価値から考える',cue:'業務改善やDXを検討する',reflex:'誰に → 何の価値を → どの業務で → ITをどう使う',trap:'社内効率だけで事業価値を見失わない',tools:'バリューチェーン・顧客価値'},
      {id:'p4',name:'CSFをKPIに落とす',cue:'成功の鍵は分かったが進捗を測れない',reflex:'CSF → 観測可能な行動・成果 → KPI',trap:'測りやすいだけの数字をKPIにしない',tools:'CSF・KPI'},
      {id:'p5',name:'ビジネスモデルを分解',cue:'事業の仕組みを理解したい',reflex:'誰に → 何を → どう届ける → どこで収益・価値が生まれる',trap:'製品機能だけを見ない',tools:'ビジネスモデル・VRIO'},
      {id:'p6',name:'戦略からIT目標へ',cue:'経営戦略をシステム化方針へ落とす',reflex:'経営戦略 → 業務目標 → 必要能力 → IT目標',trap:'製品名から要件を逆算しない',tools:'IT戦略・システム化構想'},
      {id:'p7',name:'ITは手段と確認',cue:'AI・クラウドなど魅力的な技術案が出た',reflex:'その技術で何の経営課題を、どの指標で改善するのかを確認',trap:'「新しいから使う」を採用理由にしない',tools:'PoC・KPI・ROI'}
    ]},
    {id:'structure',no:'02',title:'構造化思考',lead:'現状を分解し、どこで何が起きているかを見る。',flow:'現状 → 業務プロセス → 重複・待ち・手戻り → 構造',keywords:['業務改革','本文探索','データ活用','BPR','As-Is','To-Be','標準化','業務プロセス','再入力','転記','ボトルネック'],patterns:[
      {id:'s1',name:'As-Isを流れで見る',cue:'現行業務が複雑で問題箇所が分からない',reflex:'入力 → 処理 → 判断 → 出力の順に現状を並べる',trap:'担当者の印象だけで現状を決めない',tools:'As-Is・業務フロー'},
      {id:'s2',name:'切り口を分ける',cue:'情報がごちゃごちゃしている',reflex:'人・組織・業務・データ・システム・ルールに分ける',trap:'異なる種類の問題を一つの原因で説明しない',tools:'構造化・MECE'},
      {id:'s3',name:'ムダの発生点を探す',cue:'処理時間や工数が大きい',reflex:'重複 → 待ち → 手戻り → 転記 → 照合を探す',trap:'単純に人員不足と結論づけない',tools:'BPR・業務分析'},
      {id:'s4',name:'標準と例外を分ける',cue:'部署ごとにやり方が違う',reflex:'共通部分 → 真に必要な例外 → 標準化可能範囲',trap:'全ての現行差異をそのままシステム要件にしない',tools:'標準化・To-Be'},
      {id:'s5',name:'ボトルネックを見る',cue:'全体処理が遅い',reflex:'工程別の処理能力を比較 → 全体を制約する工程を特定',trap:'全工程を同じ強さで改善しない',tools:'TOC・ボトルネック'},
      {id:'s6',name:'データの流れを見る',cue:'二重入力・照合・不整合が多い',reflex:'発生源 → 保管 → 転記 → 利用先を追い、重複管理を特定',trap:'画面だけ変えてデータ分断を残さない',tools:'データフロー・一元管理・API'},
      {id:'s7',name:'To-Beへ再構成',cue:'現状分析が終わった',reflex:'残す → 廃止 → 統合 → 自動化 → 標準化の順で再設計',trap:'As-Isをそのまま電子化しない',tools:'BPR・To-Be'}
    ]},
    {id:'cause',no:'03',title:'因果思考',lead:'問題・原因・真因を混ぜずに掘り下げる。',flow:'問題 → 直接原因 → 真因 → 解くべき課題',keywords:['真因','原因','課題分析','根拠抽出','なぜ','理由','再発','Root Cause','問題管理','因果'],patterns:[
      {id:'c1',name:'現象と問題を分ける',cue:'「遅い」「ミスが多い」などの声が出た',reflex:'観測事実 → 目標との差 → 問題として定義',trap:'感想をそのまま問題名にしない',tools:'KPI・ギャップ'},
      {id:'c2',name:'直接原因を特定',cue:'問題が起きる工程を特定した',reflex:'問題の直前で何が発生しているかを確認',trap:'遠い背景要因を直接原因として書かない',tools:'業務フロー・根拠抽出'},
      {id:'c3',name:'真因まで掘る',cue:'直接原因が「再入力」「確認作業」だった',reflex:'なぜ必要か → なぜ発生するか → 構造・制度・データの真因へ',trap:'「担当者が忙しい」で止めない',tools:'なぜなぜ分析・Root Cause'},
      {id:'c4',name:'相関と因果を分ける',cue:'二つの事象が同時に起きている',reflex:'Aが変わるとBが変わる仕組み・経路が説明できるか確認',trap:'同時発生だけで原因と決めない',tools:'因果関係・仮説検証'},
      {id:'c5',name:'根拠で裏付ける',cue:'原因仮説を立てた',reflex:'ログ・時間・件数・ヒアリング・本文事実で確認する',trap:'経験則だけで真因と断定しない',tools:'定量分析・ヒアリング'},
      {id:'c6',name:'課題へ変換する',cue:'真因が分かった',reflex:'真因を除去・緩和するために「何を実現すべきか」で課題化',trap:'課題を「システム導入」にしない',tools:'課題設定・BPR'},
      {id:'c7',name:'再発防止まで考える',cue:'障害・ミスを一度復旧した',reflex:'暫定対応 → 根本原因 → 恒久対策 → 再発監視',trap:'復旧＝解決と考えない',tools:'インシデント管理・問題管理'}
    ]},
    {id:'judge',no:'04',title:'判断思考',lead:'全部やらない。効果・コスト・リスク・制約で選ぶ。',flow:'選択肢 → 効果 → コスト → リスク → 制約 → 優先順位',keywords:['投資評価','ROI','NPV','TCO','リスク管理','調達','優先順位','実現可能性','費用','回収期間','RFP','PoC','段階導入'],patterns:[
      {id:'j1',name:'選択肢を並べる',cue:'解決策を決める必要がある',reflex:'現状維持を含む複数案を作り、比較可能にする',trap:'最初に思いついた案を前提にしない',tools:'代替案・RFI・RFP'},
      {id:'j2',name:'効果を数字にする',cue:'施策のメリットを比較する',reflex:'売上・工数・時間・品質・リスク低減を測定可能にする',trap:'「便利になる」だけで評価しない',tools:'KPI・ROI'},
      {id:'j3',name:'総コストを見る',cue:'初期費用の安い案がある',reflex:'初期費用 + 運用 + 保守 + 教育 + 移行 + 終了まで見る',trap:'導入価格だけで決めない',tools:'TCO'},
      {id:'j4',name:'実現可能性を分解',cue:'効果は高いが本当に実行できるか不明',reflex:'人・金・時間・技術・運用・移行・法規制で成立性を確認',trap:'「実現可能」と一語で済ませない',tools:'実現可能性・制約条件'},
      {id:'j5',name:'リスクを天秤に乗せる',cue:'高効果だが不確実性がある',reflex:'発生可能性 × 影響度 → 対応コスト → 残存リスクで判断',trap:'リスクゼロを目指して過剰投資しない',tools:'リスク評価'},
      {id:'j6',name:'優先順位を決める',cue:'全部は同時にできない',reflex:'重要度 × 緊急度 × 効果 × 実現性 × 依存関係で順序化',trap:'声の大きい部門から着手しない',tools:'優先順位・ロードマップ'},
      {id:'j7',name:'小さく検証して決める',cue:'不確実性が高く机上比較だけでは決めにくい',reflex:'仮説 → PoC → 判定基準 → 継続・修正・中止',trap:'PoCを導入前提のデモにしない',tools:'PoC・段階導入'}
    ]},
    {id:'execute',no:'05',title:'実行思考',lead:'関係者を動かし、実行可能な状態へ持っていく。',flow:'利害関係者 → 懸念 → 根拠 → 調整 → 合意 → 移行',keywords:['合意形成','関係者調整','ステークホルダー','移行','リスク対応','受入','UAT','教育','反対','懸念','運用','段階導入'],patterns:[
      {id:'e1',name:'関係者を洗い出す',cue:'施策を実行に移す',reflex:'意思決定者・利用者・運用者・影響を受ける人を特定',trap:'システム部門だけで進めない',tools:'ステークホルダー分析'},
      {id:'e2',name:'反対の理由を分解',cue:'現場から反対・不安が出た',reflex:'負担・権限・雇用・品質・安全・習熟など懸念の中身を特定',trap:'「抵抗勢力」と一括りにしない',tools:'チェンジマネジメント'},
      {id:'e3',name:'相手別に根拠を示す',cue:'合意を得たい',reflex:'経営層には効果、現場には負担と使い勝手、運用には安定性を示す',trap:'同じ説明資料だけで全員を説得しない',tools:'合意形成・KPI'},
      {id:'e4',name:'参加させて修正する',cue:'机上設計と現場運用に差がある',reflex:'キーマン参加 → 試行 → 意見収集 → 運用案修正',trap:'説明会だけで定着したと考えない',tools:'PoC・UAT'},
      {id:'e5',name:'移行を設計する',cue:'新システムへ切り替える',reflex:'データ → 業務 → 人 → 権限 → 教育 → 切替手順を準備',trap:'本番切替日だけを移行計画にしない',tools:'移行計画・教育'},
      {id:'e6',name:'切戻し条件を決める',cue:'本番移行に失敗する可能性がある',reflex:'中止基準 → 判断者 → ロールバック手順 → 復旧確認',trap:'問題発生後に戻すか考え始めない',tools:'ロールバック・リスク対応'},
      {id:'e7',name:'定着まで追う',cue:'システムは稼働した',reflex:'利用率 → 問合せ → エラー → 教育 → 運用改善を追跡',trap:'稼働開始をプロジェクト成功と同一視しない',tools:'定着化・サービス管理'}
    ]},
    {id:'evaluate',no:'06',title:'評価・改善思考',lead:'導入して終わらず、同じ物差しで測り改善する。',flow:'KPI → 測定方法 → 実績 → 差異 → 原因 → 改善',keywords:['評価','成果確認','KPI','KGI','SLA','SLM','改善','効果','PDCA','測定','サービス管理','EVM'],patterns:[
      {id:'v1',name:'先に物差しを決める',cue:'施策を始める前',reflex:'目標値・測定方法・測定時点・責任者を先に決める',trap:'導入後に都合のよい指標を選ばない',tools:'KPI・KGI'},
      {id:'v2',name:'導入前後を同条件で比べる',cue:'効果を評価する',reflex:'同一定義・同一期間・同一母集団でBefore/After比較',trap:'条件の違う数字を単純比較しない',tools:'ベースライン・KPI'},
      {id:'v3',name:'目標との差を見る',cue:'実績値が出た',reflex:'目標 − 実績 → 差異の大きさ → 重要度を確認',trap:'改善しただけで目標達成とみなさない',tools:'差異分析'},
      {id:'v4',name:'差異の原因を掘る',cue:'目標未達だった',reflex:'利用・業務・システム・外部環境に分けて未達原因を分析',trap:'すぐ追加投資で解決しようとしない',tools:'原因分析・KPI'},
      {id:'v5',name:'SLAを運用に結びつける',cue:'サービス品質を継続管理する',reflex:'SLA → 実績測定 → 報告 → 未達分析 → 改善',trap:'SLAを契約書に書いて終わりにしない',tools:'SLA・SLM'},
      {id:'v6',name:'改善を回す',cue:'一度改善したが環境は変化する',reflex:'計画 → 実行 → 評価 → 改善を定期的に回す',trap:'一回の改善活動で完成と考えない',tools:'PDCA・CSI'},
      {id:'v7',name:'次の意思決定へ戻す',cue:'評価結果がまとまった',reflex:'成果・未達・学び → 継続・拡大・修正・中止の判断へ反映',trap:'報告書を作って終了しない',tools:'投資評価・ポートフォリオ'}
    ]}
  ];

  const BRAIN_KEY='st-thinking-2026-v1';
  let brainState={};
  try{brainState=JSON.parse(localStorage.getItem(BRAIN_KEY)||'{}')}catch{brainState={}}
  const saveBrain=()=>localStorage.setItem(BRAIN_KEY,JSON.stringify(brainState));
  const levelOf=id=>brainState[id]?.level||0;
  const coreMastery=core=>Math.round(core.patterns.reduce((n,p)=>n+Math.min(3,levelOf(p.id)),0)/(core.patterns.length*3)*100);

  const style = document.createElement('style');
  style.textContent = `
    .brain-block{margin:0 0 34px}.brain-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:14px}.brain-head p{margin:5px 0 0}.brain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.brain-card{border:1px solid var(--line);background:#fff;border-radius:18px;padding:18px;box-shadow:0 6px 20px rgba(15,35,70,.04)}.brain-card:hover{border-color:#8bb1ff;box-shadow:var(--shadow)}.brain-card .brain-no{font-size:12px;font-weight:900;color:var(--blue);letter-spacing:.08em}.brain-card h3{font-size:18px;margin:5px 0}.brain-card p{font-size:14px;color:var(--muted);line-height:1.6;margin:0 0 10px}.brain-flow{display:block;background:#f5f8fd;border-radius:10px;padding:9px 10px;font-size:12px;line-height:1.55;color:#41506a}.brain-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.brain-actions .btn{min-height:36px;padding:7px 10px;font-size:12px}.brain-rate{float:right;background:#eef4ff;color:var(--blue);border-radius:99px;padding:3px 7px;font-size:11px;font-weight:900}.brain-detail{margin:14px 0 22px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px}.brain-detail-head{display:flex;justify-content:space-between;gap:14px;align-items:start}.brain-patterns{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}.brain-pattern{border:1px solid var(--line);border-radius:14px;padding:14px;background:#fbfcfe}.brain-pattern-top{display:flex;justify-content:space-between;gap:10px}.brain-pattern b{font-size:15px}.brain-pattern small{color:var(--muted)}.brain-pattern dl{margin:10px 0 0;display:grid;grid-template-columns:72px 1fr;gap:6px 8px;font-size:13px;line-height:1.55}.brain-pattern dt{font-weight:900;color:#42506a}.brain-pattern dd{margin:0}.brain-pattern .trap{color:#9a3412}.brain-level{white-space:nowrap;font-size:11px;font-weight:900;color:var(--blue)}.brain-map{background:linear-gradient(120deg,#f7f9fc,#eef4ff);border:1px solid var(--line);border-radius:16px;padding:13px 15px;margin-bottom:13px;font-size:14px;line-height:1.7}.brain-cue{background:#fff8e8;border:1px solid #f1d399;border-radius:14px;padding:14px 16px;margin-bottom:16px}.brain-cue b{display:block;margin-bottom:5px}.brain-choice-note{display:block;font-size:12px;color:var(--muted);margin-top:4px}@media(max-width:850px){.brain-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.brain-patterns{grid-template-columns:1fr}}@media(max-width:600px){.brain-grid{grid-template-columns:1fr}.brain-head,.brain-detail-head{align-items:stretch;flex-direction:column}}
  `;
  document.head.appendChild(style);

  const metric = document.querySelector('#view-home .metric-grid');
  if (!metric) return;
  const block = document.createElement('section');
  block.className = 'brain-block';
  block.innerHTML = `<div class="brain-head"><div><p class="eyebrow">ITストラテジスト脳</p><h2>6つの思考回路 × 42の反射構文</h2><p class="muted">状況を見た瞬間に「次に何を考えるか」が出るまで細分化して反復します。</p></div></div><div class="brain-grid" id="brainGrid"></div><div id="brainDetail"></div>`;
  metric.insertAdjacentElement('afterend', block);

  const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let run=null;

  function renderGrid(){
    document.getElementById('brainGrid').innerHTML=CORES.map(c=>`<article class="brain-card"><span class="brain-no">CORE ${c.no}</span><span class="brain-rate">構文習熟 ${coreMastery(c)}%</span><h3>${c.title}</h3><p>${c.lead}</p><span class="brain-flow">${c.flow}</span><div class="brain-actions"><button class="btn secondary" data-thinking-patterns="${c.id}">7構文を見る</button><button class="btn primary" data-thinking-flash="${c.id}">構文反射</button><button class="btn text" data-thinking="${c.id}">問題で鍛える</button></div></article>`).join('');
  }
  renderGrid();

  function showPatterns(core){
    const box=document.getElementById('brainDetail');
    box.innerHTML=`<section class="brain-detail"><div class="brain-detail-head"><div><p class="eyebrow">CORE ${core.no}</p><h2>${core.title}：7つの反射構文</h2><p class="muted">「きっかけ」を見たら「反射」がそのまま頭に出る状態を目指します。</p></div><button class="btn primary" data-thinking-flash="${core.id}">この7構文を反射練習</button></div><div class="brain-patterns">${core.patterns.map((p,i)=>`<article class="brain-pattern"><div class="brain-pattern-top"><b>${i+1}. ${esc(p.name)}</b><span class="brain-level">Lv ${levelOf(p.id)}/3</span></div><dl><dt>きっかけ</dt><dd>${esc(p.cue)}</dd><dt>反射</dt><dd><strong>${esc(p.reflex)}</strong></dd><dt>ひっかけ</dt><dd class="trap">${esc(p.trap)}</dd><dt>道具</dt><dd>${esc(p.tools)}</dd></dl></article>`).join('')}</div></section>`;
    box.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function showStudy(){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-study').classList.add('active');
    document.querySelectorAll('.bottom-nav [data-nav]').forEach(b=>b.classList.remove('active'));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function patternChoices(core,pattern){
    const wrong=shuffle(core.patterns.filter(p=>p.id!==pattern.id)).slice(0,3).map(p=>p.reflex);
    return shuffle([{text:pattern.reflex,ok:true},...wrong.map(text=>({text,ok:false}))]);
  }
  function startPatternDrill(core){
    run={type:'pattern',core,items:shuffle(core.patterns),index:0,correct:0};showStudy();renderPatternDrill();
  }
  function renderPatternDrill(){
    const p=run.items[run.index],choices=patternChoices(run.core,p);
    document.getElementById('sessionTitle').textContent=`${run.core.title}・構文反射`;
    document.getElementById('questionCounter').textContent=`${run.index+1} / ${run.items.length}`;
    document.getElementById('progressBar').style.width=`${run.index/run.items.length*100}%`;
    document.getElementById('answerTimer').textContent='反射';
    document.getElementById('questionCard').innerHTML=`<div class="q-meta"><span class="tag">${esc(run.core.title)}</span><span class="stage">反射構文 ${run.index+1}</span></div><div class="brain-cue"><b>この状況を見た瞬間、次に何を考える？</b>${esc(p.cue)}</div><div class="choices">${choices.map((c,i)=>`<button class="choice" data-pattern-answer="${c.ok?'1':'0'}"><span class="choice-key">${'アイウエ'[i]}</span><span>${esc(c.text)}</span></button>`).join('')}</div><div id="brainFeedback"></div>`;
    document.querySelectorAll('[data-pattern-answer]').forEach(b=>b.addEventListener('click',()=>answerPattern(p,b.dataset.patternAnswer==='1',b)));
  }
  function answerPattern(p,ok,button){
    if(ok)run.correct++;
    document.querySelectorAll('[data-pattern-answer]').forEach(b=>{b.disabled=true;if(b.dataset.patternAnswer==='1')b.classList.add('correct')});
    if(!ok)button.classList.add('wrong');
    const st=brainState[p.id]||{seen:0,correct:0,level:0};st.seen++;if(ok){st.correct++;st.level=Math.min(3,(st.level||0)+1)}else{st.level=Math.max(0,(st.level||0)-1)}brainState[p.id]=st;saveBrain();
    document.getElementById('brainFeedback').innerHTML=`<div class="feedback"><div class="result ${ok?'good':'bad'}">${ok?'反射できた':'ここを反射化する'}</div><div class="explain-box"><b>頭に残す一行</b>${esc(p.reflex)}</div><div class="explain-box"><b>ひっかけ</b>${esc(p.trap)}</div><div class="explain-box"><b>使える道具</b>${esc(p.tools)}</div><button id="brainNext" class="btn primary">${run.index===run.items.length-1?'結果を見る':'次へ'}</button></div>`;
    document.getElementById('brainNext').addEventListener('click',()=>{run.index++;if(run.index>=run.items.length)finishPattern();else renderPatternDrill()});
  }
  function finishPattern(){
    const pct=Math.round(run.correct/run.items.length*100);document.getElementById('progressBar').style.width='100%';renderGrid();
    document.getElementById('questionCard').innerHTML=`<div class="q-meta"><span class="tag">構文反射終了</span></div><div class="q-prompt">${esc(run.core.title)}：${run.correct} / ${run.items.length}本を反射</div><div class="brain-map"><b>このコアの基本順序</b><br>${esc(run.core.flow)}</div><div class="explain-box">${pct>=85?'かなり自動化されています。次は実際の問題文からこの思考を起動させましょう。':'正解暗記ではなく「きっかけ→次に考えること」の結び付きを繰り返してください。'}</div><div class="question-actions"><button class="btn secondary" id="brainHome">ホームへ</button><button class="btn primary" id="brainRetry">もう一度</button></div>`;
    document.getElementById('brainHome').addEventListener('click',()=>document.querySelector('[data-nav="home"]').click());
    document.getElementById('brainRetry').addEventListener('click',()=>startPatternDrill(run.core));
  }

  function matches(q,core){
    const text=[q.stage,q.topic,q.prompt,q.structure,q.explain,...(q.terms||[])].join(' ').toLowerCase();
    return core.keywords.some(k=>text.includes(k.toLowerCase()));
  }
  function pool(core){
    let list=data.questions.filter(q=>matches(q,core));
    if(list.length<5){const fallback=core.id==='execute'||core.id==='cause'||core.id==='structure'?data.questions.filter(q=>q.section==='b1'||q.section==='b2'):data.questions.filter(q=>q.section==='a2'||q.section==='b2');list=[...new Map([...list,...fallback].map(q=>[q.id,q])).values()]}
    return shuffle(list).slice(0,7);
  }
  function startQuestionDrill(core){
    const items=pool(core);if(!items.length)return;run={type:'question',core,items,index:0,correct:0};showStudy();renderQuestionDrill();
  }
  function renderQuestionDrill(){
    const q=run.items[run.index],mapped=shuffle(q.choices.map((text,index)=>({text,index})));
    document.getElementById('sessionTitle').textContent=`${run.core.title}・問題演習`;
    document.getElementById('questionCounter').textContent=`${run.index+1} / ${run.items.length}`;
    document.getElementById('progressBar').style.width=`${run.index/run.items.length*100}%`;
    document.getElementById('answerTimer').textContent='思考軸';
    document.getElementById('questionCard').innerHTML=`<div class="q-meta"><span class="tag">${esc(run.core.title)}</span><span class="stage">科目横断</span></div><div class="brain-map"><b>今の思考回路</b><br>${esc(run.core.flow)}</div>${q.context?`<div class="q-context">${esc(q.context)}</div>`:''}<div class="q-prompt">${esc(q.prompt)}</div><div class="choices">${mapped.map((c,i)=>`<button class="choice" data-brain-answer="${c.index}"><span class="choice-key">${'アイウエ'[i]}</span><span>${esc(c.text)}</span></button>`).join('')}</div><div id="brainFeedback"></div>`;
    document.querySelectorAll('[data-brain-answer]').forEach(b=>b.addEventListener('click',()=>answerQuestion(q,Number(b.dataset.brainAnswer),b)));
  }
  function answerQuestion(q,value,button){
    const ok=value===q.answer;if(ok)run.correct++;
    document.querySelectorAll('[data-brain-answer]').forEach(b=>{b.disabled=true;if(Number(b.dataset.brainAnswer)===q.answer)b.classList.add('correct')});if(!ok)button.classList.add('wrong');
    document.getElementById('brainFeedback').innerHTML=`<div class="feedback"><div class="result ${ok?'good':'bad'}">${ok?'正解':'不正解'}${ok?'':`　正解：${esc(q.choices[q.answer])}`}</div><div class="explain-box"><b>この場面で回す思考</b>${esc(q.structure||run.core.flow)}</div><div class="explain-box"><b>解説</b>${esc(q.explain)}</div><button id="brainNext" class="btn primary">${run.index===run.items.length-1?'結果を見る':'次へ'}</button></div>`;
    document.getElementById('brainNext').addEventListener('click',()=>{run.index++;if(run.index>=run.items.length)finishQuestion();else renderQuestionDrill()});
  }
  function finishQuestion(){
    const pct=Math.round(run.correct/run.items.length*100);document.getElementById('progressBar').style.width='100%';
    document.getElementById('questionCard').innerHTML=`<div class="q-meta"><span class="tag">思考回路トレーニング終了</span></div><div class="q-prompt">${esc(run.core.title)}：${run.correct} / ${run.items.length}問正解</div><div class="brain-map"><b>頭に残す順序</b><br>${esc(run.core.flow)}</div><div class="explain-box">${pct>=80?'この順序で判断できています。構文反射と実問題を往復すると定着します。':'答えそのものより、どの順序で考えるかをもう一度確認しましょう。'}</div><div class="question-actions"><button class="btn secondary" id="brainHome">ホームへ</button><button class="btn primary" id="brainRetry">もう一度</button></div>`;
    document.getElementById('brainHome').addEventListener('click',()=>document.querySelector('[data-nav="home"]').click());document.getElementById('brainRetry').addEventListener('click',()=>startQuestionDrill(run.core));
  }

  document.addEventListener('click',e=>{
    const detail=e.target.closest('[data-thinking-patterns]');if(detail){const core=CORES.find(c=>c.id===detail.dataset.thinkingPatterns);if(core)showPatterns(core);return}
    const flash=e.target.closest('[data-thinking-flash]');if(flash){const core=CORES.find(c=>c.id===flash.dataset.thinkingFlash);if(core)startPatternDrill(core);return}
    const q=e.target.closest('[data-thinking]');if(q){const core=CORES.find(c=>c.id===q.dataset.thinking);if(core)startQuestionDrill(core)}
  });
})();
