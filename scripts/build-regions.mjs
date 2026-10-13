/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동·읍마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   면(面)은 어느 층에서도 쪽을 내지 않는다. 이름만 적고 접수는 받는다.
 *
 * ★★이 사이트가 쓰는 사실은 **이름**이다. 경계를 재는 대신 이름을 센다.
 *   - 겹이름 : 전국 행정동 가운데 **글자까지 똑같은 이름**이 몇 곳인가
 *   - 한 줄기 : 숫자와 가운뎃점을 떼어 낸 줄기(개포1동→개포)를 같은 시군구에서
 *               몇 곳이 나눠 쓰는가
 *   - 첫 글자 : 같은 글자로 시작하는 동이 우리 커버리지에 몇 곳인가
 *   - 글자 수 : 이름이 몇 자인가
 *
 *   전화로 주소를 받아 적는 일에서 이 숫자들이 실제로 쓸모가 있다.
 *   겹이름이 많은 동은 시군구를 함께 말씀해 주셔야 하고, 한 줄기가 여럿인 동은
 *   숫자를 빠뜨리면 엉뚱한 쪽으로 간다.
 *
 *   앞서 만든 일곱 사이트는 전부 **경계를 잰 값**(거리·방위·면적순위·동 수·
 *   끝과 끝·맞닿음·가로세로·둘레·뭉침·안쪽 깊이·매듭·바깥선)을 썼다.
 *   이름을 세는 축은 여기서 처음 쓴다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하(이름 축이라도 좌표와 넓이는 필요하다) ──────────── */
const rad = (d) => (d * Math.PI) / 180;
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const st = ringStats(ring, lat0);
      if (!st.area) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
    });
  }
  if (!A) return null;
  return { area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky };
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 이름 다루기 ──────────────────────────────────────────
   줄기 = 끝의 동·읍·면·가를 떼고, 숫자와 가운뎃점·점을 털어 낸 글자.
     개포1동 → 개포 · 면목3·8동 → 면목 · 신사동 → 신사 · 양지읍 → 양지 */
function stemOf(name) {
  return String(name)
    .replace(/[동읍면가]$/, '')
    .replace(/[0-9·.\s]/g, '');
}
/** 이름에 숫자가 섞여 있는가 */
const hasNum = (n) => /[0-9]/.test(n);
/** 한글 글자 수(숫자·가운뎃점 제외) */
const sylOf = (n) => (String(n).match(/[가-힣]/g) || []).length;

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* 1차 — 전국 이름 세기. 커버리지 밖까지 세어야 '겹이름'이 정직해진다. */
const nameAll = new Map();                  // 이름 → [{시도, 시군구}]
const stemAll = new Map();                  // 줄기 → 개수(전국)
const stemSido = new Map();                 // 줄기 → Set(시도이름) — 몇 개 시도에 퍼졌나
const stemWhere = new Map();                // 줄기 → [{시도, 시군구}]
for (const ft of geo.features) {
  const p = ft.properties;
  const nm = String(p.adm_nm).trim().split(/\s+/).pop();
  if (!nameAll.has(nm)) nameAll.set(nm, []);
  nameAll.get(nm).push({ sido: p.sidonm, gu: p.sggnm });
  const st = stemOf(nm);
  stemAll.set(st, (stemAll.get(st) || 0) + 1);
  if (!stemSido.has(st)) stemSido.set(st, new Set());
  stemSido.get(st).add(p.sidonm);
  if (!stemWhere.has(st)) stemWhere.set(st, []);
  stemWhere.get(st).push({ sido: p.sidonm, gu: p.sggnm });
}
/** 시도 이름을 짧게 — '서울특별시' → '서울' · '경상북도' → '경북' */
const SIDO_SHORT = {
  서울특별시: '서울', 부산광역시: '부산', 대구광역시: '대구', 인천광역시: '인천',
  대전광역시: '대전', 울산광역시: '울산', 세종특별자치시: '세종', 경기도: '경기',
  강원특별자치도: '강원', 충청북도: '충북', 충청남도: '충남',
  전북특별자치도: '전북', 전라남도: '전남', 전남광주통합특별시: '전남·광주',
  경상북도: '경북', 경상남도: '경남', 제주특별자치도: '제주',
};
const shortSido = (s) => SIDO_SHORT[s] || String(s).replace(/(특별자치도|특별자치시|광역시|특별시|도)$/, '');

/* 2차 — 레코드 */
const byCode = new Map();
const buckets = new Map();
const vertex = new Map();                   // 길 걸기용 이웃 판정에만 쓴다
const vkey = (c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
for (const ft of geo.features) {
  const p = ft.properties;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
  const vs = new Set();
  for (const poly of polys) for (const ring of poly) for (const c of ring) vs.add(vkey(c));
  for (const k of vs) {
    if (!vertex.has(k)) vertex.set(k, new Set());
    vertex.get(k).add(code);
  }
  const [sidoKey, meta, isMain] = sidoOf(p);
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
  };
  byCode.set(code, rec);
  if (!sidoKey) continue;
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const spots = list.filter((d) => d.kind !== '면');
  const myeon = list.filter((d) => d.kind === '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko'));
  /* 이 시군구 안 줄기 세기 — 숫자만 다른 형제 동이 몇인가 */
  const stemCount = new Map();
  for (const d of list) stemCount.set(stemOf(d.name), (stemCount.get(stemOf(d.name)) || 0) + 1);
  /* 같은 시군구 안에서 첫 글자가 겹치는 이름 — 전화로 가장 자주 헷갈리는 자리다 */
  const headIn = new Map();
  for (const d of list) if (d.kind !== '면') headIn.set(d.name[0], (headIn.get(d.name[0]) || 0) + 1);
  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: list.length, myeon, myeonCount: myeon.length,
    spots: [],
    dongNames: isMain ? [] : list.filter((d) => d.kind !== '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    codes: list.map((d) => d.code),
    stemCount: stemCount.size,                                   // 줄기 가짓수
    numCount: list.filter((d) => hasNum(d.name)).length,         // 숫자가 붙은 이름 수
    famMax: Math.max(...[...stemCount.values()]),                // 한 줄기를 가장 많이 나눠 쓴 수
    famName: [...stemCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))[0][0],
    twinCount: list.filter((d) => (nameAll.get(d.name) || []).length > 1).length,
    /* ★시군구만 내는 서브 지역에도 있어야 한다. 아래 '쪽이 있는 구' 블록에서만
       채우면 서브 지역 장부에 undefined 가 찍힌다. */
    aloneCount: list.filter((d) => (nameAll.get(d.name) || []).length === 1).length,
  };
  if (isMain) {
    const used = new Set();
    for (const d of spots) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const hits = nameAll.get(d.name) || [];
      const elsewhere = hits.filter((x) => !(x.sido === d.sidonm && x.gu === d.sggnm));
      const stem = stemOf(d.name);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        stem,
        twin: hits.length,                                      // 전국 같은 이름(자기 포함)
        twinAt: [...new Set(elsewhere.map((x) => `${shortSido(x.sido)} ${pretty(x.gu)}`))].slice(0, 4),
        syl: sylOf(d.name),
        len: d.name.length,
        num: hasNum(d.name) ? 1 : 0,
        fam: stemCount.get(stem) || 1,                          // 같은 시군구 안 형제 수
        stemTwin: stemAll.get(stem) || 1,                       // 전국에서 이 줄기를 쓰는 수
        stemSido: (stemSido.get(stem) || new Set()).size,       // 이 줄기가 퍼진 시도 수
        guHead: headIn.get(d.name[0]) || 1,                     // 같은 시군구 안 첫 글자 겹침
        stemAt: [...new Set((stemWhere.get(stem) || [])
          .filter((x) => !(x.sido === d.sidonm && x.gu === d.sggnm))
          .map((x) => `${shortSido(x.sido)} ${pretty(x.gu)}`))].slice(0, 4),
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  guAll.push(g);
}

/* 길 걸기용 이웃 — 문장에서 숫자로 내세우지 않는다(맞닿음은 다른 사이트의 축이다). */
const touchPair = new Map();
for (const set of vertex.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    for (const [a, b] of [[arr[i], arr[j]], [arr[j], arr[i]]]) {
      if (!touchPair.has(a)) touchPair.set(a, new Map());
      touchPair.get(a).set(b, (touchPair.get(a).get(b) || 0) + 1);
    }
  }
}
const neighborsOf = (code) => {
  const m = touchPair.get(code);
  return m ? [...m.entries()].filter(([, n]) => n >= 2).map(([c]) => c) : [];
};
const codeGu = new Map();
for (const g of guAll) for (const c of g.codes) codeGu.set(c, g);
for (const g of guAll) {
  const set = new Set();
  for (const c of g.codes) for (const n of neighborsOf(c)) {
    const o = codeGu.get(n);
    if (o && o !== g) set.add(o);
  }
  g.near = [...set].map((o) => ({ sidoSlug: (MAIN[o.sidoKey] || SUB[o.sidoKey]).slug, gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey }));
  g.nearCount = g.near.length;
}

/* ── 커버리지 안 첫 글자 세기 ─────────────────────────────── */
const headCount = new Map();
for (const s of spotAll) headCount.set(s.name[0], (headCount.get(s.name[0]) || 0) + 1);
for (const s of spotAll) s.head = s.name[0], s.headN = headCount.get(s.name[0]);

/* 시군구 안에서 이름이 극단인 자리 */
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byTwin = g.spots.slice().sort((a, b) => b.twin - a.twin || a.name.localeCompare(b.name, 'ko'));
  g.mostTwin = byTwin[0].name; g.mostTwinN = byTwin[0].twin; g.mostTwinSlug = byTwin[0].slug;
  const bySyl = g.spots.slice().sort((a, b) => b.syl - a.syl || a.name.localeCompare(b.name, 'ko'));
  g.longName = bySyl[0].name; g.longNameSyl = bySyl[0].syl; g.longNameSlug = bySyl[0].slug;
  g.shortName = bySyl[bySyl.length - 1].name; g.shortNameSyl = bySyl[bySyl.length - 1].syl;
  g.shortNameSlug = bySyl[bySyl.length - 1].slug;
  byTwin.forEach((s, i) => { s.twinRank = i + 1; });
  g.spots.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko')).forEach((s, i) => { s.abc = i + 1; });
  g.aloneSpot = g.spots.filter((s) => s.twin === 1).length;    // 쪽을 낸 칸 가운데 하나뿐인 이름
  const byHead = g.spots.slice().sort((a, b) => b.guHead - a.guHead || a.name.localeCompare(b.name, 'ko'));
  g.headTop = byHead[0].name[0]; g.headTopN = byHead[0].guHead;
  g.headKinds = new Set(g.spots.map((s) => s.name[0])).size;
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  const topTwin = allSpots.slice().sort((a, b) => b.twin - a.twin)[0];
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.codes;
  }
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    numSum: gus.reduce((s, g) => s + g.numCount, 0),
    twinSum: gus.reduce((s, g) => s + g.twinCount, 0),
    topTwin: topTwin ? topTwin.name : '', topTwinN: topTwin ? topTwin.twin : 0,
    gu: gus,
  });
}

const out = {
  version: VERSION,
  source: 'admdongkor (https://github.com/vuski/admdongkor) · CC BY 4.0 · 원자료 국가공간정보포털 행정동 경계',
  built: new Date().toISOString().slice(0, 10),
  axis: '이름 — 전국 겹이름·한 줄기 형제·첫 글자·글자 수',
  coverageFrom: '서울·인천·경기·부산은 동과 읍 한 칸마다 쪽을 내고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구까지만 낸다. 면에는 쪽을 만들지 않고 이름만 목록에 올린다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    dong: spotAll.filter((s) => s.kind === '동').length,
    eup: spotAll.filter((s) => s.kind === '읍').length,
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    nameAll: nameAll.size,
    featAll: geo.features.length,
    twinSpots: spotAll.filter((s) => s.twin > 1).length,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점 ${C.spot} = 동 ${C.dong} + 읍 ${C.eup} · 면 ${C.myeon}`);
console.log(`전국 행정동 ${C.featAll}곳이 쓰는 이름은 ${C.nameAll}가지 · 우리 거점 중 겹이름 ${C.twinSpots}곳`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 거점 ${String(s.spotCount).padStart(4)} · 겹이름 ${String(s.twinSum).padStart(3)} · 숫자이름 ${String(s.numSum).padStart(3)} · 최다겹 ${s.topTwin}(${s.topTwinN})`);
const tw = spotAll.map((s) => s.twin).sort((a, b) => a - b);
console.log(`겹이름 수 min ${tw[0]} · 중앙 ${tw[tw.length >> 1]} · max ${tw[tw.length - 1]}`);
