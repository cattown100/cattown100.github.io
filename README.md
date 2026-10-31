# 내 블로그 (GitHub Pages)

순수 HTML/CSS/JS. 빌드 과정 없이 저장소 루트에 올리면 바로 동작합니다.

## 구조
- `posts.js`  : 내 정보 / 카테고리 / 글 목록 (여기만 고치면 됨)
- `posts/`    : 글 본문 (`슬러그.md`, 마크다운)
- `images/`   : 사진 (`images/슬러그/파일`)
- `files/`    : 첨부 파일 (`files/슬러그/파일`)
- `write.html`: 글쓰기 도우미 (zip과 posts.js 덩어리를 만들어 줌)

## 새 글 쓰기
1. `https://아이디.github.io/write.html` 에서 글 작성 → zip 받기
2. 압축을 풀어 `posts/ images/ files/` 폴더를 저장소에 업로드
3. `posts.js`의 `const POSTS = [` 아래에 도우미가 만든 덩어리 붙여넣기

## 마크다운 팁
- 코드: ```` ```python ```` 처럼 언어 지정 (python, bash, javascript, c, cpp, java, sql, html, json, diff)
- 사진: `![설명](images/슬러그/파일.png)`
- 표, 인용(`>`), 체크박스(`- [ ]`) 사용 가능
- 글 아래 사진 모음: posts.js 글 항목에 `gallery: [{ src: "images/슬러그/a.png", caption: "설명" }]`

## 참고
- 글 본문은 `fetch`로 불러오므로 파일을 더블클릭해 열면 안 보입니다. GitHub Pages 주소(또는 로컬 서버)에서 확인하세요.
- 본문에 쓴 HTML 태그는 안전을 위해 그대로 글자로 표시됩니다.
