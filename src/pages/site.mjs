import { layout, plot, telBtn } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, telCta, siteLinks,
} from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="front" aria-label="처음 안내">
  <p class="front-sl">${esc(cfg.brand.slogan)}</p>
  <p class="front-p">찾아오실 가게가 없습니다. 전화를 주시면 관리사가 그 주소로 갑니다. 수도권과 부산은 동과 읍을 한 칸씩 적어 두었고, 대전·대구·울산과 지정한 시·군은 시군구에서 끊었습니다.</p>
  ${telBtn(cfg, { size: 'l' })}
  <dl class="front-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>밤이든 새벽이든</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>지갑은 마지막에</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>대개 이 안에 닿습니다</dd></div>
    <div><dt>동·읍 ${counts.spot}칸</dt><dd>시군구 ${counts.gu}곳 아래</dd></div>
  </dl>
</section>`;

  const areaBlock = plot('area', 'where', '어느 지역에서 부르시나요',
    `<div class="duo">
      <div>
        <p class="duo-h">동과 읍까지</p>
        <ul class="">${main.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>${r.gu.length}곳 · ${r.spotCount}칸</span></a></li>`).join('\n')}</ul>
      </div>
      <div>
        <p class="duo-h">시군구에서 멈춤</p>
        <ul class="">${sub.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length}</span></a></li>`).join('\n')}</ul>
      </div>
    </div>
    <p class="plot-tail">층이 달라도 번호 하나, 값 하나입니다. <a href="/area/">받는 자리를 한 장에</a> 펼쳐 두었습니다.</p>`,
    '층이 둘인 것은 적어 둔 깊이가 다를 뿐입니다. 가는 지역을 추린 것이 아닙니다.', '01');

  const whyBlock = plot('why', 'method', '왜 이름부터 세나요?',
    `<div class="say">
      <p>동 쪽을 열면 그 이름이 <strong>전국에 몇 곳이나 있는지</strong>가 적혀 있습니다. 중앙동은 서른한 곳, 신흥동은 다섯 곳입니다. 전국 행정동 3,558곳이 쓰는 이름은 3,204가지뿐이라 이런 겹침이 흔합니다.</p>
      <p>전화로 주소를 받아 적는 쪽에서는 이게 실제로 문제가 됩니다. 동 이름만 들으면 다른 도시로 갈 수 있고, 숫자가 붙은 동은 숫자를 빼면 어디인지 알 수 없습니다. 그래서 <strong>겹이름이 많은 칸일수록 통화에서 한 번 더 짚습니다</strong>.</p>
      <p>모두 공개된 행정동 목록을 세어 나온 값이고, 같은 자료로 다시 세면 같은 값이 나옵니다. 세는 방법은 <a href="/magazine/same-name-everywhere/">수첩에 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = plot('note', 'notes', '부르기 전에 읽어 둘 글',
    `<ul class="shelf">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="plot-tail"><a href="/magazine/">수첩 전부 보기</a></p>`,
    '체험담이 아닙니다. 미리 읽어 두면 접수 통화가 짧아지는 것만 모았습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, '06');

  const pool = [];
  for (const r of regions) {
    if (r.main) for (const g of r.gu) for (const s of g.spots) pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
    else for (const g of r.gu) pool.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseGrid(courses, seed, '부르시는 자리', '03'),
    stepList(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 30, 'popular', '문의가 많은 자리', null, '08'),
    telCta(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="head-s">서울·인천·경기·부산 동읍 ${counts.spot}곳 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const lead = `<div class="say">
  <p>쪽을 낸 자리를 한 화면에 모았습니다. 시군구 ${counts.gu}곳, 동·읍 ${counts.spot}칸입니다. 면 ${counts.myeon}칸은 쪽이 없을 뿐 똑같이 받고 똑같이 갑니다.</p>
  <p>수도권과 부산에서는 동·읍을 하나씩 눌러 보실 수 있고, 나머지는 시군구 쪽 안에 동 이름을 적어 두었습니다. 깊이를 달리한 것은 문의가 몰리는 쪽을 더 잘게 나눈 결과입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => plot(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동·읍 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="roll">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="o-n">${esc(g.name)}</span><span class="o-m">동 ${g.dongCount}${g.myeonCount ? `+면 ${g.myeonCount}` : ''}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}에서 시군구를 누르시면 그 아래 동·읍이 나옵니다. 행정동을 전부 세면 ${r.dongCount}칸입니다.`
      : `${r.name}은 시군구가 끝입니다. 행정동 ${r.dongCount}칸의 이름은 해당 시군구 쪽에 적혀 있습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '98');

  const body = [lead, telCta(cfg, '사시는 곳', seed), blocks, faqHtml, stepList(seed, '99')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `받는 자리 <span class="head-s">시군구 ${counts.gu}곳과 동·읍 ${counts.spot}칸을 한 화면에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '받는 자리', url: `${siteUrl}/area/` }],
      jsonld: [
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/area/`, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const lead = `<div class="say">
  <p>모두 ${courses.length}가지입니다. 고르실 것은 셋뿐입니다 — 얼마나 세게, 몇 분, 기름을 쓸지. 나머지는 통화에서 맞춰 드립니다.</p>
  <p>가장 짧은 것이 ${esc(shortest.ko)} ${shortest.min}분, 가장 긴 것이 ${esc(longest.ko)} ${longest.min}분입니다. 오래 받는다고 세게 받는 것이 아니고, 비싸다고 더 좋은 것도 아닙니다.</p>
</div>`;

  const table = plot('all', 'table', `${courses.length}가지를 나란히 놓고`,
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">속도</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '싼 쪽부터 차례로 적었습니다. 어디서 부르시든 숫자가 같습니다.', '01');

  const pickBy = plot('bycase', 'choose', '어떤 날 무엇을 고르나요?',
    `<ul class="shelf">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '정하신 다음에 바꾸셔도 됩니다. 값은 마지막에 받으신 코스로 셉니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [lead, table, pickBy, telCta(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾아보기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 시간, 기름 여부로 나란히 놓았습니다. ${won(sorted[0].price)}원부터이고 지역을 가리지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="head-s">세기 · 시간 · 기름 여부로 견주기</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 금액 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const lead = `<div class="say">
  <p>표 하나가 전부입니다. 여기 적히지 않은 돈은 받지 않습니다.</p>
  <p>가까운 동네든 한참 떨어진 읍내든 같은 코스면 같은 값입니다. 멀리 가는 날의 부담을 손님께 돌리지 않기로 했습니다.</p>
</div>`;

  const table = plot('tbl', 'prices', '코스별 기본 시간과 값',
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">금액</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 숫자는 비교용으로 붙였습니다. 실제로 분 단위로 쪼개 받지 않습니다.', '01');

  const noExtra = plot('nox', 'never', '붙지 않는 것들',
    `<ul class="care">
      <li>차비 — 아무리 멀어도 따로 청구하지 않습니다.</li>
      <li>심야 할증 — 새벽에 부르셔도 표 그대로입니다.</li>
      <li>명절·휴일 할증 — 날짜로 값이 오르지 않습니다.</li>
      <li>미리 보내는 돈 — 예약금도 보증금도 없습니다.</li>
      <li>취소 수수료 — 미루셔도 접으셔도 받지 않습니다.</li>
      <li>주차비 — 저희 쪽에서 냅니다.</li>
    </ul>`,
    '입금을 먼저 요구하는 연락은 저희가 아닙니다.', '02');

  const pay = plot('how', 'payment', '값은 어떻게 내나요?',
    factTable([
      ['내는 때', '관리가 끝난 그 자리에서'],
      ['수단', '현금과 카드 둘 다 — 값이 같습니다'],
      ['영수증', '요청하시면 드립니다'],
      ['시간을 늘릴 때', '통화에서 먼저 정하시면 늘린 만큼만 더합니다'],
      ['두 분이 받을 때', '사람마다 따로 셉니다. 묶음 할인이 없습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '04');

  const body = [lead, table, noExtra, pay, telCta(cfg, '금액 확인', seed), faqHtml, siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`금액표 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스별 기본 시간과 값입니다. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없습니다. 관리가 끝난 뒤 현금이나 카드로 받습니다.`),
      h1: `금액 <span class="head-s">${won(sorted[0].price)}원부터 · 표에 없는 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '금액', url: `${siteUrl}/price/` }],
      jsonld: [S.faqPage(`${siteUrl}/price/`, qa)],
    }),
  };
}

/* ── 이용안내 ─────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const lead = `<div class="say">
  <p>처음 부르시는 분을 생각하고 적었습니다. 전화 한 통으로 끝나는 일이니 오래 붙잡고 계실 것이 없습니다.</p>
</div>`;

  const what = plot('need', 'ready', '무엇을 준비해 두나요?',
    `<ul class="care">
      <li>누울 자리 하나 — 바닥도 침대도 됩니다.</li>
      <li>수건 두 장 — 쓰시던 것이면 되고, 기름 없는 코스는 한 장으로 충분합니다.</li>
      <li>문이 달린 방 하나 — 다른 식구가 계셔도 괜찮습니다.</li>
    </ul>
    <p class="plot-tail">깔개와 기름, 접이식 베드는 관리사 쪽에서 챙깁니다. 따로 장만하실 것이 없습니다.</p>`,
    null, '01');

  const timing = plot('when', 'hours', '언제 부를 수 있나요?',
    factTable([
      ['접수', `${esc(cfg.hours)} — 몇 시든 같은 번호`],
      ['도착', `대개 ${esc(cfg.arrive)}, 골목 안쪽이면 더 걸립니다`],
      ['시간 변경', '언제 하셔도 되고 돈이 붙지 않습니다'],
      ['취소', '관리사가 문 앞에 왔다면 그것만 알려 주십시오'],
      ['붐비는 때', '금요일과 토요일 밤'],
      ['여유 있는 때', '주중 낮 — 거의 기다리지 않으셔도 됩니다'],
    ]), null, '02');

  const refuse = plot('no', 'declined', '못 받는 경우도 있나요?',
    `<ul class="care">
      <li>성적인 요구가 섞일 때 — 그 자리에서 통화를 끊습니다.</li>
      <li>열이 나거나 상처가 부었을 때 — 날짜를 옮겨 드립니다.</li>
      <li>주소를 끝까지 주지 않으실 때 — 보낼 사람과 갈 곳을 정할 수 없습니다.</li>
      <li>관리사에게 따로 연락할 방법을 요구하실 때.</li>
      <li>병원 진료가 먼저로 보일 때 — 그쪽을 권해 드립니다.</li>
      <li>만 열아홉 살이 안 되셨을 때.</li>
    </ul>`,
    '못 받는 경우에도 돈을 받지 않습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, '05');

  const body = [lead, what, timing, stepList(seed, '04'), refuse, telCta(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('이용안내 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 부르실 때 필요한 것만 추렸습니다. 준비물, 접수 시각, 못 받는 경우, 값 내는 법을 차례로 적었습니다.'),
      h1: `이용안내 <span class="head-s">전화 한 통에서 끝까지</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용안내', url: `${siteUrl}/guide/` }],
      jsonld: [S.faqPage(`${siteUrl}/guide/`, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data, regions } = ctx;
  const seed = 'company';

  const lead = `<div class="say">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 건 자리 없이 방문만 하는 곳입니다. 여러 업소를 늘어놓는 중개 사이트가 아니라 저희가 직접 받고 직접 갑니다.</p>
  <p>이름은 도시(urban)와 오아시스(oasis)를 붙여 지었습니다. 복잡한 동네 한가운데에도 쉬어 갈 자리를 만든다는 뜻입니다.</p>
</div>`;

  const line = plot('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="care">
      <li>합니다 — 손으로 뭉친 근육을 푸는 일.</li>
      <li>안 합니다 — 성적인 서비스. 어떤 방식으로도 없습니다.</li>
      <li>안 합니다 — 진단과 치료. 그것은 의료기관의 몫입니다.</li>
      <li>안 받습니다 — 만 열아홉 살이 안 되신 분.</li>
      <li>안 싣습니다 — 후기와 별점. 진짜인지 가려낼 수 없습니다.</li>
      <li>안 올립니다 — 사람 사진. 실제와 다른 경우가 너무 많습니다.</li>
      <li>안 받습니다 — 선입금. 예약금도 보증금도 없습니다.</li>
    </ul>`, null, '01');

  const how = plot('data', 'sources', '이 숫자들은 어디서 나왔나요?',
    `<div class="say">
      <p>지역 쪽의 이름 숫자는 모두 공개된 행정동 목록을 세어 뽑았습니다. 겹이름은 글자까지 똑같은 행정동을 전국에서 센 값이고, 줄기는 끝의 동·읍·면을 떼고 숫자와 가운뎃점을 털어 낸 글자입니다.</p>
      <p>개포1동의 줄기는 '개포'이고 면목3·8동도 '면목'입니다. 같은 줄기를 쓰는 칸이 한 시군구 안에 여럿이면 숫자를 빠뜨렸을 때 자리가 흐려집니다. 그래서 그 수를 칸마다 적어 두었습니다.</p>
      <p>첫 글자가 겹치는 칸 수도 함께 셉니다. 전화로 이름을 들을 때 앞 글자만으로는 갈리지 않는 자리가 어디인지 알 수 있기 때문입니다.</p>
      <p>원자료가 새로 나오면 다시 세고 화면의 숫자도 함께 바뀝니다. 사람이 직접 입력한 칸은 하나도 없습니다.</p>
    </div>
    ${factTable([
      ['밑자료', esc(data.source)],
      ['자료 판 이름', esc(data.version)],
      ['세는 값', esc(data.axis)],
      ['쪽을 내는 기준', esc(data.coverageFrom)],
      ['쪽을 낸 단위', `시도 ${counts.sido} / 시군구 ${counts.gu} / 동읍 ${counts.spot}`],
      ['쪽이 없는 단위', `면 ${counts.myeon}칸 — 목록에 이름만`],
      ['전국 이름 통계', `행정동 ${counts.featAll}곳이 쓰는 이름 ${counts.nameAll}가지 · 우리 칸 가운데 겹이름 ${counts.twinSpots}개`],
    ])}`, null, '02');

  const body = [lead, line, how, telCta(cfg, '문의', seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 쪽 이름 숫자를 어떤 자료로 어떻게 세었는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="head-s">하는 일의 끝과 자료 출처</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (목적)', '이 약관은 어반오아시스(이하 "회사")가 제공하는 출장 방문 관리 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무를 정함을 목적으로 합니다.'],
  ['제2조 (접수 방법)', '접수는 사이트에 표기된 번호로의 통화로만 받습니다. 이 번호는 중계 번호이므로 이용자의 전화번호가 관리사에게 그대로 전달되지 않습니다. 메신저, 게시판, 전자우편을 통한 접수는 받지 않습니다.'],
  ['제3조 (서비스의 내용)', '회사는 이용자가 지정한 장소로 관리사를 보내 손으로 근육을 이완시키는 관리를 제공합니다. 질병의 진단과 치료는 제공하지 않으며, 성적 서비스 또한 제공하지 않습니다.'],
  ['제4조 (이용 자격)', '만 19세 이상인 분만 이용할 수 있습니다. 그 미만인 분의 접수는 받지 않습니다.'],
  ['제5조 (지역 정보의 성격)', '사이트에 표기된 겹이름 수, 이름 줄기, 면적 등은 공개된 행정동 자료를 집계한 값입니다. 도로 사정이나 실제 이동 시간을 보장하는 수치가 아니며 참고 자료입니다.'],
  ['제6조 (요금과 결제)', '요금은 금액표와 동일하며 지역에 따라 달라지지 않습니다. 관리 종료 후 현장에서 현금 또는 카드로 결제하며, 예약금·보증금 등 사전 입금은 어떤 명목으로도 받지 않습니다.'],
  ['제7조 (변경과 취소)', '방문 전에는 언제든 시간 변경과 취소가 가능하며 위약금이 없습니다. 다만 관리사가 현장에 도착한 뒤 취소하시는 경우에는 즉시 알려 주셔야 합니다.'],
  ['제8조 (회사의 거절·중단)', '다음 각 호에 해당하면 회사는 접수를 거절하거나 진행 중인 관리를 중단할 수 있습니다. 1. 성적 서비스를 요구하는 경우. 2. 관리사에게 폭언이나 물리력을 행사하거나 개인 연락처를 요구하는 경우. 3. 방문지 주소를 끝까지 알려 주지 않는 경우. 4. 발열이나 개방 창상 등 관리가 적절하지 않은 상태인 경우.'],
  ['제9조 (이용자의 협조)', '이용자는 관리를 받을 공간과 수건을 준비하고, 관리에 영향을 줄 수 있는 건강 상태를 접수 시 알려 주셔야 합니다.'],
  ['제10조 (후기·평점 미운영)', '회사는 후기나 평점을 수집하지도 게시하지도 않습니다. 이 사이트의 어떤 문장도 특정 이용자의 경험을 옮긴 것이 아닙니다.'],
  ['제11조 (관리 중단 시 요금)', '이용자의 요청이나 건강 상태를 이유로 중단한 경우에는 진행된 시간에 해당하는 금액만 받습니다. 시작 후 10분 이내에 중단한 경우에는 받지 않습니다. 다만 제8조 제1호에 해당하여 중단한 경우에는 중단 시점까지의 금액을 받습니다.'],
  ['제12조 (책임의 범위)', '관리 중 회사의 과실로 발생한 손해는 회사가 배상합니다. 다만 사전에 고지하지 않은 건강 상태에서 비롯한 손해, 천재지변이나 통신 장애로 인한 지연에는 책임을 지지 않습니다.'],
  ['제13조 (약관의 변경)', '약관을 변경하는 경우 사이트에 먼저 게시하고 게시한 날부터 적용합니다. 변경 후 접수하시면 변경된 약관에 동의한 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="say"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 통화를 주시는 시점에 이 내용에 동의하신 것으로 봅니다.</p></div>`,
    plot('terms', 'terms', '전문', `<div class="file">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '약관 문의', 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수 방법과 서비스 내용, 요금과 결제, 변경·취소를 ${TERMS.length}개 조문으로 정했습니다.`),
      h1: `이용약관 <span class="head-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 수집하는 항목', '접수 통화에서 받아 적는 것은 네 가지입니다 — 방문할 주소, 연락 가능한 번호, 선택하신 코스, 희망 시각. 성명과 생년월일, 주민등록번호는 수집하지 않습니다.'],
  ['2. 이용 목적', '수집한 내용은 관리사 배정과 출발·도착 안내에만 씁니다. 이후 광고성 문자를 발송하거나 먼저 연락드리는 일이 없습니다.'],
  ['3. 전화번호 처리', '사이트에 표기된 번호는 중계 번호입니다. 따라서 이용자의 전화번호가 관리사에게 그대로 전달되지 않습니다.'],
  ['4. 보유 기간', '방문이 정상적으로 종료되면 당일 파기합니다. 분쟁이 발생한 건에 한해 처리가 완료될 때까지 별도로 보관합니다.'],
  ['5. 제3자 제공과 위탁', '어떤 사업자에게도 제공하거나 위탁하지 않습니다. 법령에 따른 수사기관의 적법한 요청이 있는 경우에만 예외로 합니다.'],
  ['6. 자동 수집 장치', '이 사이트는 미리 생성한 파일만 전송합니다. 로그인, 장바구니, 댓글 기능이 없고 광고 추적이나 방문자 분석 스크립트를 삽입하지 않았습니다. 쿠키도 사용하지 않습니다.'],
  ['7. 이용자의 권리', '보유 내용의 열람과 삭제를 요구하실 수 있습니다. 동일한 번호로 연락 주시면 해당 통화에서 처리합니다.'],
  ['8. 개인정보 책임자', '사업자 정보가 확정되는 대로 이 항목과 화면 아래에 함께 표기합니다. 그 전까지는 사이트에 표기된 번호가 접수 창구 역할을 합니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="say"><p>내용이 짧습니다. 수집하는 항목 자체가 네 가지뿐이기 때문입니다.</p></div>`,
    plot('pp', 'privacy', '전문', `<div class="file">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '개인정보 문의', 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 수집하는 항목과 이용 목적, 보유 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="head-s">수집 항목 네 가지</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 노트 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="say"><p>받기 전에 알아 두면 통화가 짧아지는 것만 적습니다. 체험담이나 소감은 올리지 않습니다.</p></div>`,
    plot('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="shelf">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새로 적으면 RSS 로도 나갑니다.', '01'),
    telCta(cfg, '접수', 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('이름 수첩'),
      desc: clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 적었습니다. 후기와 체험담은 두지 않습니다.`),
      h1: `이름 수첩 <span class="head-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '수첩', url: `${siteUrl}/magazine/` }],
      jsonld: [S.itemList(`${siteUrl}/magazine/#list`, '이름 수첩', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="when"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 이름 수첩</p>`,
    `<article class="piece">${html}</article>`,
    telCta(cfg, '접수', p.slug),
    plot('more', 'next', '함께 읽을 글',
      `<ul class="shelf">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '수첩', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="say"><p>그 주소에는 쪽이 없습니다. 자리를 옮겼거나 애초에 만들지 않은 쪽입니다. 아래에서 다시 골라 주십시오.</p></div>`,
    plot('back', 'back', '여기서 다시',
      `<ul class="chips">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">받는 자리</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">금액</a></li>
        <li><a href="/guide/">이용안내</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    telCta(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '그 주소로 만든 쪽이 없습니다. 아래에서 다시 골라 주십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
