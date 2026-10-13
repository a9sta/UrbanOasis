import { layout, plot } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock, longtail,
  nameKin, spotIndex, myeonList, dongNameList, guIndex, nearList, telCta,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_A_EUP, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC, twinWord, famWord, riskWord, pathWord,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 행정동 자료를 세어 나온 사실이다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, kind: s.kind,
    area: km2(s.area), stem: s.stem, head: s.head,
    twin: s.twin, twinRank: s.twinRank, stemTwin: s.stemTwin, stemSido: s.stemSido,
    fam: s.fam, guHead: s.guHead, syl: s.syl, num: s.num, abc: s.abc, headN: s.headN,
    twinAt: s.twinAt.length ? s.twinAt.slice(0, 3).join(', ') : '',
    stemAt: s.stemAt.length ? s.stemAt.slice(0, 3).join(', ') : '',
    twinNote: twinWord(s.twin), famNote: famWord(s.fam),
    riskNote: riskWord(s.twin, s.fam, s.guHead), path: pathWord(s.area),
    longName: g.longName, longNameSyl: g.longNameSyl, shortName: g.shortName,
    guTwinCount: g.twinCount, guAlone: g.aloneCount,
    guSpotCount: g.spotCount, allSpots: counts.spot,
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동·읍 쪽 — 메인 네 시도에서만 낸다 ────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const poolA = s.kind === '읍' ? SPOT_LEAD_A_EUP : SPOT_LEAD_A;
  const lead = `<div class="say">
  <p>${at(h, poolA, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = plot('fact', 'counted', `${esc(s.name)}${josa(s.name, '이라/라')}는 이름`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['갈래', s.kind === '읍' ? '읍 — 군에서 집과 가게가 가장 모인 자리' : '행정동'],
      ['전국 겹이름', s.twin > 1 ? `${s.twin}곳${s.twinAt.length ? ` · ${esc(s.twinAt.slice(0, 3).join(' · '))}` : ''}` : '없음 — 전국에 이 이름은 여기뿐'],
      ['이름 줄기', `'${esc(s.stem)}' — 전국 ${s.stemTwin}곳 · ${s.stemSido}개 시도`],
      [`${esc(g.name)} 안 한 줄기`, `${s.fam}칸 · ${esc(famWord(s.fam))}`],
      ['첫 글자', `'${esc(s.head)}' — ${esc(g.name)} 안 ${s.guHead}칸 · 전체 ${s.headN}칸`],
      ['글자 수', `${s.syl}자${s.num ? ' · 숫자가 붙은 이름' : ''}`],
      ['땅', `${km2(s.area)} — ${esc(pathWord(s.area))}`],
      ['여는 시각', `${esc(cfg.hours)} · 셈 ${esc(cfg.pay)} · 문 앞까지 ${esc(cfg.arrive)}`],
    ]),
    esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, '01'),
    nameKin(sd, g, s, seed, '02'),
    spotIndex(sd, g, seed, s.slug, '03'),
    stepList(seed, '04'),
    guIndex(sd, seed, g.slug, '05'),
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 24, 'elsewhere', esc(at(h, SEC.crossHead, 8)), null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="head-s">출장마사지 홈타이 / ${s.twin > 1 ? `전국에 같은 이름이 ${s.twin}곳` : '전국에 하나뿐인 이름'}</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main,
    unitW: g.main ? '동·읍' : '행정동',
    unitN: g.main ? g.spotCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount, myeonCount: g.myeonCount,
    area: km2(g.area),
    stemCount: g.stemCount, numCount: g.numCount, famMax: g.famMax, famName: g.famName,
    twinCount: g.twinCount, aloneCount: g.aloneCount,
    mostTwin: g.mostTwin || '', mostTwinN: g.mostTwinN || 0,
    longName: g.longName || '', longNameSyl: g.longNameSyl || 0, shortName: g.shortName || '',
    headTop: g.headTop || '', headTopN: g.headTopN || 0, headKinds: g.headKinds || 0,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const lead = `<div class="say">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}칸`],
    g.main ? ['쪽을 낸 동·읍', `${g.spotCount}칸`] : ['쪽을 낸 층', '시군구까지 · 동 이름은 아래 목록에'],
    ['면', g.myeonCount ? `${g.myeonCount}칸 — 이름만 적음` : '없음'],
    ['이름 줄기', `${g.stemCount}가지 · 가장 많이 쓰이는 줄기는 '${esc(g.famName)}'(${g.famMax}칸)`],
    ['숫자가 붙은 이름', g.numCount ? `${g.numCount}칸` : '없음'],
    ['전국 겹이름을 가진 칸', `${g.twinCount}칸 · 전국에 하나뿐인 이름 ${g.aloneCount}칸`],
    ['땅', km2(g.area)],
    ['여는 시각', `${esc(cfg.hours)} / 결제 ${esc(cfg.pay)}`],
  ];
  if (g.main && g.mostTwin) {
    rows.splice(7, 0,
      ['이름이 가장 흔한 칸', `<a href="/${sd.slug}/${g.slug}/${g.mostTwinSlug}/">${esc(g.mostTwin)}</a> 전국 ${g.mostTwinN}곳`],
      ['이름이 가장 긴 칸', `<a href="/${sd.slug}/${g.slug}/${g.longNameSlug}/">${esc(g.longName)}</a> ${g.longNameSyl}자`],
      ['첫 글자가 가장 겹치는 쪽', `'${esc(g.headTop)}' ${g.headTopN}칸 · 첫 글자 가짓수 ${g.headKinds}`]);
  }
  const facts = plot('fact', 'counted', `${esc(g.name)} 이름으로 보기`, factTable(rows), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '05');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${g.name}`, seed),
    g.main ? spotIndex(sd, g, seed, null, '01') : dongNameList(g, seed, '01'),
    myeonList(g, seed, '02'),
    courseGrid(courses, seed, g.name, '03'),
    nearList(sd, g, seed, '04'),
    faqHtml,
    stepList(seed, '06'),
    noticeBlock(seed, '07'),
    guIndex(sd, seed, g.slug, '08'),
    longtail(pool, seed, 20, 'districts', '옆 시군구에서 받는 자리', null, '09'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="head-s">출장마사지 홈타이 / ${g.main ? `동·읍 ${g.spotCount}칸에 쪽을 냈습니다` : `행정동 ${g.dongCount}칸 모두 갑니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.main && g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동·읍`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, myeonCount: sd.myeonCount,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lead = `<div class="say"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = plot('fact', 'counted', `${esc(sd.name)} 이름으로 보기`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 낸 층', sd.main ? '시군구 → 동·읍' : '시군구까지'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}칸`],
      sd.main ? ['쪽을 낸 동·읍', `${sd.spotCount}칸`] : ['동 이름', '시군구 쪽 목록 안에'],
      ['면', sd.myeonCount ? `${sd.myeonCount}칸 · 시군구 쪽에 이름만 올림` : '없음'],
      ['전국 겹이름을 가진 칸', `${sd.twinSum}칸`],
      ['숫자가 붙은 이름', `${sd.numSum}칸`],
      sd.topTwin ? ['가장 흔한 이름', `${esc(sd.topTwin)} — 전국 ${sd.topTwinN}곳`] : ['가장 흔한 이름', '동 쪽을 내지 않은 지역'],
      ['받는 땅', km2(sd.area)],
      ['여는 시각', `${esc(cfg.hours)} / 결제 ${esc(cfg.pay)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '05');

  const csLinks = plot('sidocourse', 'courses', `${esc(sd.name)}에서 고를 수 있는 코스`,
    `<ul class="chips">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스마다 손이 오래 머무는 자리가 다릅니다. 금액은 ${esc(sd.name)} 전역이 같습니다.`, '03');

  let pickBlock = '';
  if (sd.main) {
    const tw = [];
    for (const g of sd.gu) for (const s of g.spots) tw.push({ g, s });
    tw.sort((a, b) => b.s.twin - a.s.twin || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = plot('twinpick', 'shared', `${esc(sd.name)}에서 이름이 가장 흔한 동·읍`,
      `<ul class="chips">\n${tw.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} 전국 ${x.s.twin}</a></li>`).join('\n')}\n</ul>`,
      `동 이름만 말씀하시면 다른 도시로 갈 수 있는 칸입니다. 통화에서 시군구를 함께 여쭙는 자리이기도 합니다. 나머지 ${sd.spotCount}칸은 시군구를 눌러 들어가십시오.`, '02');
  } else {
    pickBlock = plot('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="chips">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 동 ${g.dongCount}칸</a></li>`).join('\n')}\n</ul>`,
      '행정동이 많다는 것은 같은 땅에 이름을 더 잘게 붙였다는 뜻입니다.', '02');
  }

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, sd.name, seed),
    guIndex(sd, seed, null, '01'),
    pickBlock,
    csLinks,
    courseGrid(courses, seed, sd.name, '04'),
    faqHtml,
    stepList(seed, '06'),
    longtail(pool, seed, 20, 'provinces', '다른 시도에서 받는 자리', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="head-s">출장마사지 홈타이 / ${sd.main ? `동·읍 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}
