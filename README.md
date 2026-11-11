# 내 블로그 (GitHub Pages)

순수 HTML/CSS/JS. 빌드 과정 없이 저장소 루트에 올리면 바로 동작합니다.

## 구조
- `posts.js`  : 카테고리 / 글 목록
- `profile.js`: 내 소개 (이름, 소개, 태그, 연락처)
- `posts/`    : 글 본문 (`슬러그.md`, 마크다운)
- `images/`   : 사진 (`images/슬러그/파일`)
- `files/`    : 첨부 파일 (`files/슬러그/파일`)

## 새 글 쓰기
1. `posts/슬러그.md` 에 본문 작성 (사진은 `images/슬러그/`, 파일은 `files/슬러그/`)
2. `posts.js`의 `const POSTS = [` 아래에 글 정보 덩어리 추가
3. 커밋 & 푸시 (`git add .` → `git commit -m "새 글: 제목"` → `git push`)

글 정보 예시:
```js
{
  slug: "슬러그", title: "제목", date: "2026-11-11", category: "ctf",
  tags: ["태그1"], summary: "한 줄 요약"
},
```
소개를 바꾸려면 `profile.js`를 고치고 커밋하세요.

## 마크다운 팁
- 코드: ```` ```python ```` 처럼 언어 지정 (python, bash, javascript, c, cpp, java, sql, html, json, diff)
- 사진: `![설명](images/슬러그/파일.png)`
- 표, 인용(`>`), 체크박스(`- [ ]`) 사용 가능
- 글 아래 사진 모음: posts.js 글 항목에 `gallery: [{ src: "images/슬러그/a.png", caption: "설명" }]`

## 참고
- 글 본문은 `fetch`로 불러오므로 파일을 더블클릭해 열면 안 보입니다. GitHub Pages 주소(또는 로컬 서버)에서 확인하세요.
- 본문에 쓴 HTML 태그는 안전을 위해 그대로 글자로 표시됩니다.
