import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **여백과 둥근 모서리**다. 테두리 선을 거의 쓰지 않고 빈칸과 크게 둥근
 *   덩어리로만 칸을 가른다. 목록은 알약 모양 칩으로 흩어 놓는다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *   ★여기는 **선이 거의 없다**. 민트빛 종이에 자홍 한 가지로만 강약을 준다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#EFF6F4', card: '#FFFFFF', soft: '#E0EDE9',
  ink: '#1B2A28', dim: '#5A6D6A',
  acc: '#A8246F', accDk: '#7E1A53', accSoft: '#FAE8F2',
  line: '#D3E2DE', warn: '#A8562A',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--warn:${t.warn};
  --w:1040px;--r:18px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.84;font-size:16px;letter-spacing:-.006em;padding-bottom:88px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--accDk)}
.leap{position:absolute;left:-9999px}
.leap:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:#fff;padding:10px 18px;border-radius:999px}

/* ── 머리 ──────────────────────────────────────────── */
.cap{background:var(--paper)}
.cap-in{max-width:var(--w);margin:0 auto;padding:18px 20px 12px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.sign{display:inline-flex;align-items:center;gap:11px;color:var(--ink)}
.sign:hover{text-decoration:none}
.omk{width:30px;height:30px;fill:none;stroke:var(--acc)}
.sign-t b{display:block;font-size:19px;font-weight:800;letter-spacing:-.025em;line-height:1.1}
.sign-t i{display:block;font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--dim)}
.cap-r{display:flex;align-items:center;gap:13px;flex-wrap:wrap}
.cap-run{margin:0;font-size:11px;color:var(--dim);text-align:right;line-height:1.5}
.cap-run span{display:block}
.tab{max-width:var(--w);margin:0 auto;padding:0 20px 14px}
.tab ul{list-style:none;margin:0;padding:0;display:flex;gap:7px;overflow-x:auto}
.tab a{display:block;padding:7px 15px;font-size:14px;font-weight:700;color:var(--dim);white-space:nowrap;
  background:var(--card);border-radius:999px}
.tab a:hover{color:var(--accDk);text-decoration:none}
.tab a[aria-current]{background:var(--acc);color:#fff}

/* ── 빵부스러기 ────────────────────────────────────── */
.crumbs{max-width:var(--w);margin:0 auto;padding:4px 20px 0}
.crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:7px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.crumbs li+li::before{content:"·";margin-right:7px;color:var(--acc)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:16px 20px 60px}
.head{font-size:28px;font-weight:800;letter-spacing:-.035em;line-height:1.28;margin:10px 0 18px}
@media (min-width:720px){.head{font-size:36px}}
.head-s{display:block;margin-top:10px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.01em}
.say{margin:0 0 30px;max-width:52rem}
.say p{margin:0 0 .9em}
.say p:last-child{margin-bottom:0}

/* ── 섹션 = 둥근 덩어리 ────────────────────────────── */
.plot{background:var(--card);border-radius:var(--r);padding:24px 20px;margin:0 0 16px}
.plot-h{margin:0 0 16px}
.plot-no{margin:0 0 6px;display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.2em;
  color:var(--acc);background:var(--accSoft);padding:3px 11px;border-radius:999px;text-transform:uppercase}
.plot h2{margin:0;font-size:19px;font-weight:800;letter-spacing:-.025em;line-height:1.38}
@media (min-width:720px){.plot h2{font-size:22px}}
.plot-sb{margin:9px 0 0;font-size:14px;color:var(--dim)}
.plot-tail{margin:15px 0 0;font-size:13px;color:var(--dim)}

/* ── 장부 ──────────────────────────────────────────── */
.note{width:100%;border-collapse:separate;border-spacing:0 6px;font-size:14.5px}
.note th,.note td{padding:9px 13px;text-align:left;vertical-align:top;background:var(--paper)}
.note th{width:40%;font-weight:700;color:var(--dim);font-size:13px;border-radius:10px 0 0 10px}
.note td{border-radius:0 10px 10px 0}
@media (min-width:600px){.note th{width:27%}}

/* ── 코스 ──────────────────────────────────────────── */
.menu{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:640px){.menu{grid-template-columns:1fr 1fr}}
.menu>li{background:var(--paper);border-radius:14px;padding:14px 16px}
.menu a{display:block;color:var(--ink)}
.menu a:hover{text-decoration:none;color:var(--accDk)}
.m-k{display:block;font-size:16px;font-weight:800;letter-spacing:-.02em}
.m-v{display:block;margin-top:4px;font-family:var(--mono);font-size:15px;color:var(--accDk);font-weight:700}
.m-p{display:block;margin-top:3px;font-size:12.5px;color:var(--dim)}
.m-d{margin:10px 0 0;font-size:13px;color:var(--dim)}

/* ── 차례 ──────────────────────────────────────────── */
.order{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.order li{background:var(--paper);border-radius:14px;padding:14px 16px 14px 56px;position:relative}
.order li::before{content:counter(oi);counter-increment:oi;position:absolute;left:16px;top:14px;
  width:26px;height:26px;border-radius:999px;background:var(--acc);color:#fff;
  display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:12px;font-weight:700}
.order{counter-reset:oi}
.order h3{margin:0 0 4px;font-size:15px;font-weight:800}
.order p{margin:0;font-size:14px;color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.quiz{display:grid;gap:12px}
.quiz>div{background:var(--paper);border-radius:14px;padding:15px 17px}
.quiz .qn{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--acc);margin-bottom:5px}
.quiz h3{margin:0 0 7px;font-size:16px;font-weight:800;letter-spacing:-.02em}
.quiz p{margin:0;font-size:14.5px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.care{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.care li{background:var(--paper);border-radius:999px;padding:10px 18px;font-size:14px;color:var(--dim)}

/* ── 목록·링크 ─────────────────────────────────────── */
.chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px}
.chips a{display:block;background:var(--paper);border-radius:999px;padding:7px 15px;font-size:13.5px;color:var(--ink)}
.chips a:hover{background:var(--accSoft);color:var(--accDk);text-decoration:none}
.roll{list-style:none;margin:0;padding:0;display:grid;gap:7px}
@media (min-width:560px){.roll{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.roll{grid-template-columns:1fr 1fr 1fr}}
.roll a{display:flex;justify-content:space-between;align-items:baseline;gap:9px;background:var(--paper);
  border-radius:12px;padding:9px 14px;color:var(--ink)}
.roll a:hover{background:var(--accSoft);text-decoration:none}
.roll .cur a,.roll a[aria-current]{background:var(--acc);color:#fff}
.roll .cur a .o-m,.roll a[aria-current] .o-m{color:rgba(255,255,255,.8)}
.o-n{font-weight:700;font-size:14.5px}
.o-m{font-family:var(--mono);font-size:11px;color:var(--dim);white-space:nowrap}
.flat{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:5px 7px}
.flat li{font-size:13px;color:var(--dim);background:var(--paper);padding:4px 12px;border-radius:999px}

/* ── 견주기 ────────────────────────────────────────── */
.vs{width:100%;border-collapse:separate;border-spacing:0 5px;font-size:14px}
.vs th,.vs td{padding:9px 12px;text-align:left;background:var(--paper)}
.vs thead th{background:transparent;font-size:12px;color:var(--dim);font-weight:700;padding-bottom:0}
.vs tbody th{border-radius:10px 0 0 10px;font-weight:700}
.vs tbody td:last-child{border-radius:0 10px 10px 0}
.vs tbody tr.cur th,.vs tbody tr.cur td{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.ob{display:inline-flex;align-items:center;gap:12px;background:var(--acc);color:#fff;
  padding:10px 20px;border-radius:999px;text-decoration:none}
.ob:hover{background:var(--accDk);text-decoration:none}
.ob-dot{flex:none;width:9px;height:9px;border-radius:999px;background:#fff;opacity:.85}
.ob-t{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.ob-lb{font-size:10px;letter-spacing:.18em;opacity:.85;font-family:var(--mono)}
.ob-nm{font-family:var(--mono);font-weight:700;white-space:nowrap}
.ob-s .ob-nm{font-size:15px}
.ob-m .ob-nm{font-size:18px}
.ob-l .ob-nm{font-size:21px}
.ob-l{padding:12px 24px}
.ob-w{display:flex;width:100%;justify-content:center}
.ring2{background:var(--accSoft);border-radius:var(--r);padding:22px 20px;margin:0 0 16px}
.ring2-p{margin:0 0 14px;font-size:15px;max-width:48rem}
.ring2-s{margin:12px 0 0;font-size:12.5px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.front{background:var(--card);border-radius:var(--r);padding:30px 22px;margin:0 0 16px}
.front-sl{margin:0 0 14px;font-size:21px;font-weight:800;letter-spacing:-.035em;color:var(--accDk);max-width:22em}
@media (min-width:720px){.front-sl{font-size:27px}}
.front-p{margin:0 0 20px;color:var(--dim);font-size:15px;max-width:46rem}
.front-f{display:grid;gap:9px;margin:22px 0 0}
@media (min-width:640px){.front-f{grid-template-columns:1fr 1fr 1fr 1fr}}
.front-f div{background:var(--paper);border-radius:14px;padding:13px 15px}
.front-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--accDk)}
.front-f dd{margin:3px 0 0;font-size:12.5px;color:var(--dim)}
.duo{display:grid;gap:18px}
@media (min-width:760px){.duo{grid-template-columns:1fr 1fr}}
.duo-h{margin:0 0 11px;font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--accDk);font-family:var(--mono)}
.duo ul{list-style:none;margin:0;padding:0;display:grid;gap:7px}
.duo a{display:flex;justify-content:space-between;gap:10px;align-items:baseline;background:var(--paper);
  border-radius:12px;padding:11px 15px;color:var(--ink)}
.duo a:hover{background:var(--accSoft);text-decoration:none}
.duo b{font-size:15px}
.duo span{font-size:11px;color:var(--dim);font-family:var(--mono)}

/* ── 글 ────────────────────────────────────────────── */
.piece{max-width:46rem}
.piece h2{margin:30px 0 12px;font-size:19px;font-weight:800;color:var(--accDk)}
.piece p{margin:0 0 1em}
.piece ul{margin:0 0 1em;padding-left:1.1em;color:var(--dim)}
.shelf{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.shelf a{display:block;background:var(--paper);border-radius:14px;padding:15px 17px;color:var(--ink)}
.shelf a:hover{background:var(--accSoft);text-decoration:none}
.shelf b{display:block;font-size:16px;font-weight:800;margin-bottom:5px}
.shelf p{margin:0;font-size:13.5px;color:var(--dim)}
.shelf time{display:block;margin-top:7px;font-family:var(--mono);font-size:11px;color:var(--acc)}
.file h2{margin:26px 0 9px;font-size:17px;font-weight:800;color:var(--accDk)}
.file p,.file li{font-size:14.5px;color:var(--dim)}
.file ul,.file ol{padding-left:1.2em;margin:0 0 1em}
.when{margin:0 0 14px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.base{background:var(--card);border-radius:var(--r) var(--r) 0 0;margin-top:20px}
.base-in{max-width:var(--w);margin:0 auto;padding:30px 20px 22px;display:grid;gap:24px}
@media (min-width:860px){.base-in{grid-template-columns:1.3fr 1fr 1fr}}
.bs-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--acc)}
.bs-nm{margin:0 0 8px;font-size:18px;font-weight:800}
.bs-say{margin:0 0 14px;font-size:13.5px;color:var(--dim)}
.bs-run{margin:12px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.bs-ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:13.5px}
.bs-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.bs-sm{margin:10px 0 0;font-size:12px;color:var(--dim)}
.base-end{background:var(--card)}
.base-end div{max-width:var(--w);margin:0 auto;padding:0 20px 22px;border-top:1px solid var(--line);padding-top:18px}
.bs-biz{margin:0 0 8px;font-size:12px;color:var(--dim)}
.bs-dim{opacity:.7}
.bs-ai{margin:0 0 8px;font-size:12px;color:var(--dim);line-height:1.7}
.bs-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 고정 ─────────────────────────────────────── */
.perch{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);
  padding:9px 16px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;
  box-shadow:0 -2px 14px rgba(27,42,40,.1);transition:transform .2s}
.perch.off{transform:translateY(130%)}
.perch-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.perch{display:none}}
@media print{.perch,.tab,.ring2{display:none}}
`;

const JS = `(function(){
  /* 발이 보이면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.perch'),ft=document.querySelector('.base');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('off',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 물웅덩이에 번지는 테두리 — 겹친 둥근 선 셋 */
const RINGS = (c, w) => `<g fill="none" stroke="${c}" stroke-width="${w}"><circle cx="16" cy="16" r="4"/><circle cx="16" cy="16" r="8.5"/><circle cx="16" cy="16" r="13"/></g>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="10" fill="${t.accSoft}"/>${RINGS(t.acc, 2.4)}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 48"><rect width="250" height="48" rx="12" fill="${t.card}"/><g transform="translate(8,8)">${RINGS(t.acc, 2.4)}</g><text x="52" y="27" font-family="system-ui,sans-serif" font-size="19" font-weight="800" fill="${t.ink}">어반오아시스</text><text x="52" y="39" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.dim}">URBANOASIS</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<rect x="56" y="56" width="1088" height="518" rx="42" fill="${t.card}"/>
<g transform="translate(96,118) scale(3.4)">${RINGS(t.acc, 2.2)}</g>
<text x="104" y="330" font-family="system-ui,sans-serif" font-size="54" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="104" y="394" font-family="system-ui,sans-serif" font-size="29" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="104" y="440" font-family="ui-monospace,monospace" font-size="23" fill="${t.accDk}">서울 · 인천 · 경기 · 부산 동읍까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="104" y="474" width="438" height="70" rx="35" fill="${t.acc}"/>
<text x="142" y="502" font-family="ui-monospace,monospace" font-size="15" letter-spacing="4" fill="#FAE8F2">${cfg.telLabel}</text>
<text x="142" y="532" font-family="ui-monospace,monospace" font-size="27" font-weight="700" fill="#FFFFFF">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'oasis.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'oasis.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
