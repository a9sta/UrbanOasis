import { esc, hash, shuffle, km2, won, josa } from './util.mjs';
import { plot, telBtn } from './html.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ── 예약 문의 띠 ─────────────────────────────────────────────────
   번호가 본문 어디에 나오든 '예약 문의'가 붙은 버튼으로만 나온다. */
export function telCta(cfg, place, seedKey) {
  const h = hash(seedKey, 'cta');
  const lines = [
    `${place}이라고만 말씀하셔도 됩니다. 나머지 주소는 저희가 되읊으며 맞춰 드립니다.`,
    `${place}까지 지금 닿을 수 있는지 통화에서 그 자리에 확인해 드립니다.`,
    `${place} 방문은 코스와 시각, 주소 셋이면 더 여쭐 것이 없습니다.`,
    `${place} 연락은 이 번호 하나로만 들어옵니다. 다른 통로를 열어 두지 않았습니다.`,
  ];
  return `<section class="ring2" aria-label="${esc(place)} 예약 문의">
  <p class="ring2-p">${esc(at(h, lines))}</p>
  ${telBtn(cfg, { size: 'l' })}
  <p class="ring2-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 ─────────────────────────────────────────────────────── */
export function courseGrid(courses, seedKey, place, num = '01') {
  const h = hash(seedKey, 'cg');
  // 여덟 설명을 다 달면 어느 쪽이든 같은 여덟 문장이 깔린다. 둘만 시드로 골라 단다.
  const withText = new Set(shuffle(courses.map((c) => c.slug), h).slice(0, 2));
  const list = courses.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/">
      <span class="m-k">${esc(c.ko)}</span>
      <span class="m-v">${won(c.price)}원<span class="m-p">${c.min}분 · 세기 ${esc(c.pressure)}${c.oil ? ' · 기름 씀' : ' · 기름 안 씀'}</span></span>
    </a>
    ${withText.has(c.slug) ? `<p class="m-d">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  return plot('course', 'courses', `${esc(place)}에 가져가는 여덟 가지`,
    `<ul class="menu">\n${list}\n</ul>
     <p class="plot-tail">${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 ────────────────────────────────────────────────── */
export function stepList(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return plot('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="order">\n${steps.map((s) => `<li><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 장부 ─────────────────────────────────────────────────────── */
export function factTable(rows) {
  return `<table class="note"><tbody>\n${rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${r[1]}</td></tr>`).join('\n')}\n</tbody></table>`;
}

/* ── 자주 묻는 것 ────────────────────────────────────────────────
   ★질문은 **h3 소제목**으로 낸다. AI 가 답을 찾을 때 먼저 보는 자리라
     dl/dt 로 두면 소제목으로 세어지지 않는다. 순번은 h3 **밖에** 둔다. */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'faq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = plot('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="quiz">\n${qa.map((x, i) => `<div><span class="qn" aria-hidden="true">${i + 1}번</span><h3>${esc(x.q)}</h3><p>${esc(x.a)}</p></div>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return plot('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="care">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return plot('longtail', label, heading, `<ul class="chips">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 이름이 닮거나 다른 자리 ───────────────────────────────────
   ★이 사이트의 성격을 가장 잘 보여 주는 칸이다. 거리순 '가까운 동'이 아니라
     **같은 줄기를 쓰는 칸과 겹이름이 양끝인 칸**을 건다. */
export function nameKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const pick = [];
  const seen = new Set();
  const add = (x, why) => { if (x && !seen.has(x.slug)) { seen.add(x.slug); pick.push({ x, why }); } };
  for (const x of pool) if (x.stem === s.stem) add(x, `같은 줄기 '${x.stem}'`);
  const byTwin = pool.slice().sort((a, b) => b.twin - a.twin);
  add(byTwin[0], `전국 ${byTwin[0].twin}곳`);
  add(byTwin[byTwin.length - 1], byTwin[byTwin.length - 1].twin > 1 ? `전국 ${byTwin[byTwin.length - 1].twin}곳` : '여기뿐인 이름');
  for (const x of pool) if (x.name[0] === s.name[0]) add(x, `첫 글자 '${x.name[0]}'`);
  for (const x of pool) add(x, x.twin > 1 ? `전국 ${x.twin}곳` : '여기뿐인 이름');
  return plot('kin', 'names', `${esc(g.name)} 안에서 이름으로 견주기`,
    `<ul class="roll">\n${pick.slice(0, 8).map(({ x, why }) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/"><span class="o-n">${esc(x.name)}</span><span class="o-m">${esc(why)}</span></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'kn'), SEC.nameKinSub)), num);
}

/* ── 구 안의 자리 목록 ──────────────────────────────────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const items = g.spots.map((s) => `<li${s.slug === currentSlug ? ' class="cur"' : ''}><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}><span class="o-n">${esc(s.name)}</span><span class="o-m">${s.twin > 1 ? `전국 ${s.twin}` : '하나뿐'}</span></a></li>`).join('\n');
  return plot('spotidx', 'places', `${esc(g.name)}에서 쪽을 낸 ${g.spotCount}칸`,
    `<ul class="roll">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 면 목록 ───────────────────────────────────────── */
export function myeonList(g, seedKey, num) {
  if (!g.myeonCount) return '';
  return plot('myeon', 'myeon', `${esc(g.name)}에 딸린 면 ${g.myeonCount}칸`,
    `<ul class="flat">\n${g.myeon.map((m) => `<li>${esc(m)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'my'), SEC.myeonSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ─────────────────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  return plot('dongidx', 'dong', `${esc(g.name)}에 속한 동 ${g.dongNames.length}칸`,
    `<ul class="flat">\n${g.dongNames.map((d) => `<li>${esc(d)}</li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ────────────────────────────────────── */
export function guIndex(sd, seedKey, currentSlug, num) {
  const items = sd.gu.map((g) => `<li${g.slug === currentSlug ? ' class="cur"' : ''}><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}><span class="o-n">${esc(g.name)}</span><span class="o-m">동 ${g.dongCount}${g.myeonCount ? `+면 ${g.myeonCount}` : ''}</span></a></li>`).join('\n');
  return plot('guidx', 'districts', `${esc(sd.name)}${josa(sd.name, '을/를')} 이루는 시군구 ${sd.gu.length}곳`,
    `<ul class="roll">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 옆 시군구 (길을 거는 용도) ──────────────────────────────── */
export function nearList(sd, g, seedKey, num) {
  if (!g.nearCount) return '';
  const items = g.near.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/"><span class="o-n">${esc(t.gu)}</span><span class="o-m">${t.same ? esc(sd.name) : '시도 밖'}</span></a></li>`).join('\n');
  return plot('near', 'next', `${esc(g.name)} 옆에 붙은 시군구 ${g.nearCount}곳`,
    `<ul class="roll">\n${items}\n</ul>`,
    '구 경계에 붙은 주소라면 옆 시군구 쪽에서 들어가는 편이 나을 때가 있습니다.', num);
}

/* ── 아래쪽 안내 링크 (글·약관 등 얕은 쪽용) ─────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return plot('also', 'more', '이어서 볼 곳',
    `<ul class="chips">
      <li><a href="/area/">받는 자리 전부</a></li>
      <li><a href="/guide/">이용안내</a></li>
      <li><a href="/price/">금액</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">수첩</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '층은 시도에서 시군구로 내려가고 수도권과 부산에만 동·읍이 한 겹 더 있습니다. 면과 서브 지역의 동은 이름만 목록에 올라 있습니다.');
}
