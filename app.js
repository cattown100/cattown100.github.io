/* 공통 렌더링: 헤더/푸터/카테고리/글 목록 */
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;

  // posts/ 하위 페이지에서도 경로가 맞도록 base 계산
  const base = document.body.dataset.base || "";
  const here = document.body.dataset.page || "";

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;
  const sorted = () => [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  // header
  const links = CATEGORIES.map(
    (c) => `<a href="${base}category.html?c=${c.id}" class="${here === c.id ? "active" : ""}">${esc(c.name)}</a>`
  ).join("");
  document.getElementById("header").innerHTML = `
    <header class="site"><div class="wrap">
      <a class="logo" href="${base}index.html">~/<span>${esc(SITE.handle)}</span>.log</a>
      <nav class="menu">${links}
        <a href="${base}about.html" class="${here === "about" ? "active" : ""}">About</a>
        <button id="theme" title="테마 전환">◐</button>
      </nav>
    </div></header>`;
  document.getElementById("theme").onclick = () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  // footer
  document.getElementById("footer").innerHTML = `
    <footer class="site"><div class="wrap">
      © ${new Date().getFullYear()} ${esc(SITE.name)} · built with GitHub Pages ·
      <a href="${esc(SITE.github)}">GitHub</a> · <a href="mailto:${esc(SITE.email)}">Contact</a>
    </div></footer>`;

  // 글 목록 렌더
  window.renderPosts = function (el, list) {
    if (!list.length) { el.innerHTML = `<div class="empty">$ ls ./posts → (아직 글이 없어요)</div>`; return; }
    el.innerHTML = `<ul class="posts">` + list.map((p) => `
      <li><a href="${base}${esc(p.url)}">
        <time>${esc(p.date)}</time>
        <span class="t">${esc(p.title)}<span class="s">${esc(p.summary || "")}</span></span>
        <span class="c">${esc(catName(p.category))}</span>
      </a></li>`).join("") + `</ul>`;
  };

  // 홈
  const grid = document.getElementById("cat-grid");
  if (grid) {
    grid.innerHTML = CATEGORIES.map((c) => {
      const n = POSTS.filter((p) => p.category === c.id).length;
      return `<a class="card" href="category.html?c=${c.id}">
        <div class="ico">${esc(c.ico)}</div><h3>${esc(c.name)}</h3>
        <p>${esc(c.desc)}</p><span class="count">${n} posts</span></a>`;
    }).join("");
  }
  const recent = document.getElementById("recent");
  if (recent) renderPosts(recent, sorted().slice(0, 8));

  // 카테고리 페이지
  const catBox = document.getElementById("cat-posts");
  if (catBox) {
    const id = new URLSearchParams(location.search).get("c");
    const cat = CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
    document.title = `${cat.name} · ${SITE.name}`;
    document.getElementById("cat-title").textContent = cat.name;
    document.getElementById("cat-desc").textContent = cat.desc;
    renderPosts(catBox, sorted().filter((p) => p.category === cat.id));
  }

  // 사이트 텍스트 치환
  document.querySelectorAll("[data-site]").forEach((el) => (el.textContent = SITE[el.dataset.site]));
  const tags = document.getElementById("tags");
  if (tags) tags.innerHTML = SITE.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join("");
})();
