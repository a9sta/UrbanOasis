import { layout, plot } from '../lib/html.mjs';
import { esc, hash, won, josa, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factTable, faqBlock, stepList, noticeBlock, longtail, telCta, courseGrid } from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동·읍 × 코스는 만들지 않는다. 1,275 × 8 = 1만 쪽이 되는데 자리가 바뀌어도
   코스 설명이 같아 전부 얇은 조합 쪽이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름을 바릅니다. 끝나고 씻을 수 있는 시각인지만 한 번 보고 고르십시오.',
  false: '기름이 없습니다. 입은 채로 받으시고 마치면 그대로 나가셔도 됩니다.',
};
const PRESSURE_NOTE = [
  '세기는 중간에 조절합니다. 십 분쯤이면 어느 정도가 맞는지 서로 감이 잡힙니다.',
  '표의 등급은 시작점일 뿐입니다. 아프면 참지 말고 그때 말씀해 주시는 편이 낫습니다.',
  '같은 힘이라도 사람마다 다르게 느낍니다. 적힌 글자보다 그날 컨디션이 먼저입니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 고르시는 분은 거의 ${c.for} 연락을 주십니다.`,
  (c) => `${c.for} 알맞은 코스입니다. 사정이 다르시면 통화에서 바꿔 드립니다.`,
  (c) => `${c.for} 이쪽이 낫습니다. 정하신 다음에 바꾸셔도 되고, 값은 마지막에 받으신 코스로 셉니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '사시는 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lead = `<div class="say">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = plot('fact', 'course', `${esc(c.ko)} 한눈에 보기`,
    factTable([
      ['기본 시간', `${c.min}분`],
      ['금액', `${won(c.price)}원 — 지역을 가리지 않음`],
      ['세기', esc(c.pressure)],
      ['손 쓰는 결', esc(c.tempo)],
      ['주로 다루는 자리', esc(c.focus)],
      ['기름', c.oil ? '바릅니다' : '안 바릅니다'],
      ['준비물', c.oil ? '수건 두 장, 그리고 누울 자리' : '누울 자리 하나 — 수건은 한 장으로 충분합니다'],
      ['여는 시각', `${esc(cfg.hours)} · 셈 ${esc(cfg.pay)} · 문 앞까지 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = plot('cmp', 'compare', `다른 코스와 견주면`,
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">시간</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="cur"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '오래 받는다고 세게 받는 것이 아닙니다. 두 가지를 따로 보십시오.', '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '03');

  const pool = [];
  for (const r of regions) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  for (const r of regions) {
    if (!r.main) continue;
    for (const g of r.gu) pool.push({ label: `${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, c.ko, seed),
    compare,
    stepList(seed, '02'),
    faqHtml,
    noticeBlock(seed, '04'),
    longtail(pool, seed, 22, 'regions', `${c.ko}${josa(c.ko, '을/를')} 지역에서 찾기`, '시도를 누르시면 그 지역 쪽이 열립니다.', '05'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="head-s">${c.min}분 ${won(c.price)}원 / 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = [
    `${c.ko}${josa(c.ko, '은/는')} ${sd.name} 어디에서 부르셔도 ${c.min}분 ${won(c.price)}원입니다. 거리를 이유로 값을 손대지 않습니다.`,
    `${sd.name} 어느 칸에서 부르셔도 ${c.ko} 구성이 그대로입니다. 달라지는 것은 닿기까지의 시간 하나입니다.`,
    `${sd.name}에서 들어오는 ${c.ko} 문의도 같은 번호에서 받습니다. ${c.min}분 ${won(c.price)}원입니다.`,
  ];
  const second = sd.main
    ? `${sd.name}에는 동·읍 ${sd.spotCount}칸에 쪽이 있습니다. 사시는 칸을 누르면 그 이름이 전국에 몇 곳인지 함께 뜨는데, 통화에서 무엇을 더 말씀해 주셔야 하는지가 거기 적혀 있습니다.`
    : `${sd.name}에는 시군구 ${sd.gu.length}곳에 쪽이 있습니다. 동 이름은 그 안에 목록으로 넣어 두었으니 전화에서 그대로 말씀해 주십시오.`;

  const lead = `<div class="say">
  <p>${esc(at(h, open, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = plot('fact', 'course', `${esc(sd.name)} ${esc(c.ko)} 한눈에 보기`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['쪽을 낸 단위', sd.main ? `시군구 ${sd.gu.length} → 동·읍 ${sd.spotCount}` : `시군구 ${sd.gu.length}`],
      ['기본 시간', `${c.min}분`],
      ['금액', `${won(c.price)}원 — ${esc(sd.name)} 전역 같은 값`],
      ['세기와 결', `${esc(c.pressure)} · ${esc(c.tempo)}`],
      ['주로 다루는 자리', esc(c.focus)],
      ['기름', c.oil ? '바릅니다' : '안 바릅니다'],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '02');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 쪽을 함께 걸어 얇은 쪽이 생기지 않게 한다. */
  const pool = [];
  for (const g of sd.gu) pool.push({ label: `${g.name} ${c.ko}`, href: `/${sd.slug}/${g.slug}/` });
  for (const x of courses) {
    if (x.slug === c.slug) continue;
    pool.push({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` });
  }
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${c.ko}`, seed),
    courseGrid(courses, seed, sd.name, '01'),
    faqHtml,
    stepList(seed, '03'),
    longtail(pool, seed, 20, 'nearby', `${sd.name} 안에서 더 보기`, null, '04'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="head-s">출장마사지 홈타이 / ${c.min}분 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}
