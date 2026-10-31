/* ============================================================
   여기만 고치면 사이트 내용이 바뀝니다.
   1) SITE        : 내 정보 / 소개
   2) CATEGORIES  : 6개 카테고리 (id는 바꾸지 마세요)
   3) POSTS       : 글 목록. 새 글은 맨 위에 한 덩어리 추가!
      (write.html '글쓰기 도우미'가 이 덩어리를 만들어 줍니다)
   ============================================================ */

const SITE = {
  name: "김지우",
  handle: "cattamer",
  tagline: "배우고, 부수고, 기록합니다.",
  intro: "보안과 개발을 공부하며 학습 과정과 활동 기록을 꾸준히 남기는 공간입니다.",
  github: "https://github.com/cattown100",
  email: "jiwoo061006@gmail.com",
  tags: ["Security", "Web", "CTF", "Bug Bounty"],

  about: {
    lead: "보안에 관심을 갖고 공부하고 있습니다. 문제를 풀고, 취약점을 분석하고, 배운 것을 글로 남기며 성장하는 것을 목표로 합니다. 이 블로그는 그 모든 과정을 꾸준히 기록하는 공간입니다.",
    interests: ["웹 보안 / 취약점 분석", "CTF · Wargame", "Bug Bounty"],
    goals: ["매주 1개 이상 기록 남기기", "라이트업 꾸준히 작성", "첫 버그 리포트 제출"],
    activities: [],   // 예: ["OO 동아리 활동 (2026~)", "OO 교육 과정 수료"]
    certs: []         // 예: ["정보처리기사", "OO 대회 장려상"]
  }
};

const CATEGORIES = [
  { id: "dev",       name: "개발",            ico: "</>", desc: "만들고 고치며 배운 것들. 프로젝트와 코드 기록." },
  { id: "ctf",       name: "CTF/Wargame",     ico: "{F}", desc: "문제 풀이 라이트업과 접근 방식 정리." },
  { id: "bugbounty", name: "Bug Bounty",      ico: "!",   desc: "취약점 분석, 리포트 작성, 헌팅 노트." },
  { id: "docs",      name: "블로그/기술문서", ico: "¶",   desc: "개념 정리와 기술 문서, 학습 노트." },
  { id: "papers",    name: "논문/컨퍼런스",   ico: "§",   desc: "읽은 논문과 참석한 컨퍼런스 후기." },
  { id: "contests",  name: "공모전/자격증",   ico: "★",   desc: "공모전 도전기와 자격증 준비 기록." }
];

/* 글 하나 = 아래 형태의 덩어리 하나. 본문은 posts/<slug>.md 파일에 씁니다.
   - cover   : (선택) 목록에 보이는 대표 사진
   - files   : (선택) 글 아래에 붙는 첨부 파일
   - gallery : (선택) 글 아래에 붙는 사진 모음
*/
const POSTS = [
  {
    slug: "hello",
    title: "블로그를 시작합니다",
    date: "2026-10-31",
    category: "docs",
    tags: ["GitHub Pages", "시작", "사용법"],
    summary: "블로그를 만든 이유와, 글·코드·사진·파일을 올리는 방법을 정리했어요.",
    cover: "images/hello/cover.svg",
    files: [
      { name: "작성 체크리스트.txt", path: "files/hello/checklist.txt" },
      { name: "hello.py", path: "files/hello/hello.py" }
    ],
    gallery: [
      { src: "images/hello/shot.svg", caption: "갤러리 예시 — 사진을 여러 장 모아 보여줄 수 있어요" }
    ]
  }
  // 새 글은 이 위에 `{ ... },` 형태로 추가하세요.
];
