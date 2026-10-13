# 어반오아시스 (UrbanOasis)

출장마사지·홈타이 **방문 안내** 정적 사이트. 의존성 없이 Node 20 표준 라이브러리만 쓴다.

```
npm run regions   # 행정동 경계(geojson) → data/regions.json   ※원자료가 바뀔 때만
npm run build     # dist/ 생성
npm run check     # 빌드 결과 자체 검사 14종
npm run simil     # 동·읍 쪽끼리 본문 겹침 비율
npm run serve     # 로컬에서 dist/ 띄우기
```

## 구조
| 경로 | 하는 일 |
|---|---|
| `data/site.config.json` | 상호·번호·운영 조건·커버리지·소유확인 코드 |
| `data/courses.json` | 코스와 금액 |
| `data/regions.json` | 경계 자료에서 뽑은 지역 값(빌드 산출물, 커밋함) |
| `data/lastmod.json` | 쪽별 본문 해시와 '진짜 수정일' — **반드시 커밋** |
| `scripts/build-regions.mjs` | geojson → regions.json |
| `src/content/copy.mjs` | 화면 문구 묶음(여러 벌) |
| `src/content/posts.mjs` | 글 |
| `src/lib/` | 뼈대·블록·SEO·구조화 데이터 |
| `src/pages/` | 지역·코스·정적 문서 |
| `src/assets.mjs` | CSS·JS·SVG(손으로 씀) |

## 지켜야 하는 것
- 전화번호는 `telBtn()` 으로만 찍는다. 버튼에 '안심번호' 글자는 넣지 않는다.
- 후기·체험담·평점·사람 사진을 싣지 않는다.
- 같은 주소면 같은 HTML 이 나와야 한다(무작위 금지·시드 고정).
- `data/lastmod.json` 을 커밋하지 않으면 깃 빌드에서 전 쪽 수정일이 매번 밀린다.
