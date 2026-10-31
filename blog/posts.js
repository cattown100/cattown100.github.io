/* ============================================================
   여기만 고치면 블로그 내용이 바뀝니다.
   1) SITE: 내 정보
   2) CATEGORIES: 6개 카테고리 (id는 바꾸지 마세요)
   3) POSTS: 글 목록. 새 글을 쓰면 맨 위에 한 줄 추가!
   ============================================================ */

const SITE = {
  name: "내이름",                       // TODO: 본인 이름/닉네임
  handle: "cattown100",
  tagline: "배우고, 부수고, 기록합니다.",
  intro: "보안과 개발을 공부하며 학습 과정과 활동 기록을 꾸준히 남기는 공간입니다.",
  github: "https://github.com/cattown100",
  email: "me@example.com",              // TODO
  tags: ["Security", "Web", "CTF", "Bug Bounty"] // TODO: 관심 키워드
};

const CATEGORIES = [
  { id: "dev",       name: "개발",            ico: "</>", desc: "만들고 고치며 배운 것들. 프로젝트와 코드 기록." },
  { id: "ctf",       name: "CTF/Wargame",     ico: "{F}", desc: "문제 풀이 라이트업과 접근 방식 정리." },
  { id: "bugbounty", name: "Bug Bounty",      ico: "!",   desc: "취약점 분석, 리포트 작성, 헌팅 노트." },
  { id: "docs",      name: "블로그/기술문서", ico: "¶",   desc: "개념 정리와 기술 문서, 학습 노트." },
  { id: "papers",    name: "논문/컨퍼런스",   ico: "§",   desc: "읽은 논문과 참석한 컨퍼런스 후기." },
  { id: "contests",  name: "공모전/자격증",   ico: "★",   desc: "공모전 도전기와 자격증 준비 기록." }
];

const POSTS = [
  {
    title: "블로그를 시작합니다",
    date: "2026-10-31",
    category: "docs",
    summary: "GitHub Pages로 개인 블로그를 만든 과정과 앞으로의 계획.",
    url: "posts/hello.html"
  }
  // 새 글 예시 (위에 추가):
  // { title: "제목", date: "2026-11-01", category: "ctf", summary: "한 줄 요약", url: "posts/글파일.html" },
];
