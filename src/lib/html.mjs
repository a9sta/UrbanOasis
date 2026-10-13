import { esc } from './util.mjs';
import * as S from './schema.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   발    — 네이버 C랭크 네 신호(출처·최신성·수집 경로·정보량) + AI 활용 고지
 *
 * ★전화번호는 **telBtn() 으로만** 찍는다. 번호가 맨몸으로 적힌 자리가 생기면 안 된다.
 *   버튼에 '안심번호'라는 말은 넣지 않는다 — 라벨은 '예약 문의' 하나다.
 *   번호의 성격은 이용약관과 개인정보처리방침에 적어 둔다.
 * ★테두리 선을 쓰지 않는다. 둥근 흰 덩어리와 빈칸만으로 칸을 가른다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#A8246F">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/oasis.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="leap" href="#main">본문으로 건너뛰기</a>
${header(ctx, path)}
${crumbs.length > 1 ? crumbHtml(crumbs) : ''}
<main id="main">
<h1 class="head">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${pinBar(cfg)}
<script src="/assets/oasis.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/* ── 예약 문의 버튼 ────────────────────────────────────────────────
   겉은 알약이지만 `<a href="tel:">` 이다. <button> 이면 스크립트 없이는
   아무 일도 안 일어나고, 누르는 즉시 통화로 넘어가야 하기 때문이다.
   size: s(머리) · m(본문) · l(대문·아래 줄) */
export function telBtn(cfg, { size = 'm', block = false } = {}) {
  return `<a class="ob pb-${size}${block ? ' pb-w' : ''}" href="tel:${cfg.telRaw}">
  <span class="ob-bar" aria-hidden="true"><i></i><i></i><i></i></span>
  <span class="ob-t"><span class="ob-lb">${esc(cfg.telLabel)}</span><span class="ob-nm">${esc(cfg.tel)}</span></span>
</a>`;
}

/** 머리 — 짙은 올리브 띠 안에 상호와 버튼, 메뉴는 그 아래 흰 줄로 */
function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '받는 자리'], ['/course/', '코스'], ['/price/', '금액'], ['/guide/', '이용안내'], ['/magazine/', '수첩']];
  return `<header class="cap">
  <div class="cap-in">
    <a class="sign" href="/" aria-label="${esc(cfg.brand.ko)} 처음으로">
      ${ringMark()}<span class="sign-t"><b>${esc(cfg.brand.ko)}</b><i>${esc(cfg.brand.en)}</i></span>
    </a>
    <div class="cap-r">
      <p class="cap-run"><span>${esc(cfg.hours)}</span><span>${esc(cfg.pay)}</span></p>
      ${telBtn(cfg, { size: 's' })}
    </div>
  </div>
  <nav class="tab" aria-label="주요 메뉴"><ul>${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
</header>`;
}

function crumbHtml(crumbs) {
  return `<nav class="crumbs" aria-label="현재 위치"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 = 출처·최신성·수집 경로·정보량 네 신호 + AI 고지. **흰 덩어리 3열**. */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business;
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 책임자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="base">
  <div class="base-in">
    <section>
      <p class="bs-nm">${esc(cfg.brand.ko)}</p>
      <p class="bs-say">머무는 가게가 없습니다. 연락을 주시면 관리사가 그 주소로 찾아갑니다. 쪽을 둔 층은 시군구 ${counts.gu}곳과 동·읍 ${counts.spot}칸, 받는 번호는 아래 하나입니다.</p>
      ${telBtn(cfg, { size: 'm' })}
      <p class="bs-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 앞서 내는 돈 없음</p>
    </section>
    <nav aria-label="지역 바로가기">
      <p class="bs-h">동읍 한 칸까지</p>
      <ul class="chips">${main.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
      <p class="bs-h">시군구 선까지</p>
      <ul class="chips">${sub.map((r) => `<li><a href="/${r.slug}/">${r.name}</a></li>`).join('')}</ul>
      <p class="bs-sm"><a href="/area/">받는 자리 전부 펼치기</a> · 면 ${counts.myeon}칸은 이름만 적었습니다</p>
    </nav>
    <div>
      <p class="bs-h">문서</p>
      <ul class="bs-ul">
        <li><a href="/guide/">이용안내</a></li>
        <li><a href="/price/">금액</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="bs-h" style="margin-top:18px">최근 수첩</p>
      <ul class="bs-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <p class="bs-h" style="margin-top:18px">수집 경로</p>
      <ul class="chips"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="bs-sm">마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="base-end"><div>
    ${biz ? `<p class="bs-biz">${biz}</p>` : '<p class="bs-biz bs-dim">사업자 정보는 확정되는 대로 이 자리에 적습니다.</p>'}
    <p class="bs-ai">지역 쪽의 겹이름 수와 한 줄기 형제 수는 공개된 행정동 자료를 세어 뽑은 값이고, 문장은 <strong>AI 도구의 도움을 받아 쓴 뒤</strong> 사람이 다시 읽어 손봤습니다. 후기와 체험담, 별점을 싣지 않고 인물 사진도 쓰지 않습니다. 자료 출처: ${esc(data.source)}</p>
    <p class="bs-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 병을 다루는 의료 행위가 아니며 성적인 서비스를 하지 않습니다.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 붙는 줄 */
function pinBar(cfg) {
  return `<div class="perch">
  ${telBtn(cfg, { size: 'l', block: true })}
  <span class="perch-s">문 앞까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/** 상호 표시 — 물에 번지는 테두리 셋. 앞선 여덟 사이트의 어느 모양과도 겹치지 않는다. */
export function ringMark() {
  return `<svg class="omk" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="4" stroke-width="2.4"/><circle cx="16" cy="16" r="8.5" stroke-width="2.4"/><circle cx="16" cy="16" r="13" stroke-width="2.4"/></svg>`;
}

/**
 * 섹션 틀 — 테두리 없는 **둥근 흰 덩어리**. 라벨은 알약으로 띄운다.
 *   ( LABEL 03 )
 *     큰 제목
 */
export function plot(id, label, h2, inner, sub, n) {
  return `<section class="plot" id="${id}" aria-labelledby="${id}-h">
  <header class="plot-h">
    <p class="plot-no" aria-hidden="true">${esc(label)}${n ? ` ${n}` : ''}</p>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="plot-sb">${sub}</p>` : ''}
  </header>
  <div class="plot-b">${inner}</div>
</section>`;
}
