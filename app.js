/* app.js — 공통 헤더/푸터, 홈, 카테고리, 글 상세, 소개 페이지 */
(function () {
  "use strict";
  if (typeof PROFILE !== "undefined") Object.assign(SITE, PROFILE);
  const root = document.documentElement;
  try { const s = localStorage.getItem("theme"); if (s) root.dataset.theme = s; } catch (e) {}

  const page = document.body.dataset.page || "";
  const params = new URLSearchParams(location.search);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cat = (id) => CATEGORIES.find((c) => c.id === id);
  const catName = (id) => (cat(id) || {}).name || id;
  const sorted = (list) => [...(list || POSTS)].sort((a, b) => b.date.localeCompare(a.date));
  const postHref = (p) => "post.html?p=" + encodeURIComponent(p.slug);
  const $ = (id) => document.getElementById(id);

  /* ----- 현재 위치(탭 강조용) ----- */
  let active = "";
  if (page === "home") active = "home";
  if (page === "category") active = params.get("c") || "all";
  if (page === "post") { const cp = POSTS.find((x) => x.slug === params.get("p")); active = cp ? cp.category : ""; }

  /* ----- 헤더 (맨 위 카테고리 탭 포함) ----- */
  const cnt = (id) => POSTS.filter((p) => p.category === id).length;
  const tabs = '<a class="tab' + (active === "home" ? " on" : "") + '" href="index.html">홈</a>' +
    CATEGORIES.map((c) => '<a class="tab' + (active === c.id ? " on" : "") + '" href="category.html?c=' + c.id + '">' + esc(c.name) + "<small>" + cnt(c.id) + "</small></a>").join("");
  $("header").innerHTML =
    '<header class="site"><div class="wrap">' +
    '<div class="bar"><a class="logo" href="index.html">' + esc(SITE.name) + "<i>.</i></a>" +
    '<nav class="nav">' +
    '<a href="category.html?c=all"' + (page === "category" && active === "all" ? ' class="on"' : "") + '>전체 글</a>' +
    '<a href="about.html"' + (page === "about" ? ' class="on"' : "") + '>소개</a>' +
    '<button id="theme" type="button" title="테마 전환" aria-label="테마 전환">◐</button></nav></div>' +
    '<nav class="tabs" aria-label="카테고리">' + tabs + "</nav></div></header>";
  $("theme").onclick = () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    const uf = document.querySelector("iframe.utterances-frame");
    if (uf && uf.contentWindow) uf.contentWindow.postMessage({ type: "set-theme", theme: next === "dark" ? "github-dark" : "github-light" }, "https://utteranc.es");
  };

  /* ----- 푸터 ----- */
  $("footer").innerHTML =
    '<footer class="site"><div class="wrap"><span>© ' + new Date().getFullYear() + " " + esc(SITE.name) + " · GitHub Pages</span>" +
    '<span><a href="' + esc(SITE.github) + '">GitHub</a> · <a href="mailto:' + esc(SITE.email) + '">Contact</a></span></div></footer>';

  /* ----- 글 목록 ----- */
  function postRow(p) {
    const thumb = p.cover ? '<img class="thumb" src="' + esc(p.cover) + '" alt="" loading="lazy">' : "";
    const tags = (p.tags || []).map((t) => '<a class="tag" href="category.html?c=all&t=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>").join("");
    const att = (p.files && p.files.length) ? "<span>첨부 " + p.files.length + "</span>" : "";
    return '<article class="post"><div class="post-main"><div class="post-meta"><span class="pill">' + esc(catName(p.category)) + "</span><time>" + esc(p.date) + "</time>" + att + "</div>" +
      '<h3><a class="post-link" href="' + postHref(p) + '">' + esc(p.title) + "</a></h3>" +
      "<p>" + esc(p.summary || "") + '</p><div class="tags">' + tags + "</div></div>" + thumb + "</article>";
  }
  window.renderPosts = function (el, list, msg) {
    el.innerHTML = list.length ? list.map(postRow).join("") : '<div class="empty">' + esc(msg || "아직 글이 없어요.") + "</div>";
  };

  /* ----- 사이드바 (태그 / 최근 글) ----- */
  const sideEl = $("side");
  if (sideEl) {
    const allTags = [...new Set(POSTS.flatMap((p) => p.tags || []))].sort();
    const recent = sorted().slice(0, 5).map((p) => '<li><a href="' + postHref(p) + '">' + esc(p.title) + "<small>" + esc(p.date) + "</small></a></li>").join("");
    sideEl.innerHTML =
      (allTags.length ? '<div><h4>태그</h4><div class="tags">' + allTags.map((x) => '<a class="tag" href="category.html?c=all&t=' + encodeURIComponent(x) + '">#' + esc(x) + "</a>").join("") + "</div></div>" : "") +
      (recent ? '<div><h4>최근 글</h4><ul class="recent">' + recent + "</ul></div>" : "");
  }

  /* ----- 소개 카드 (홈 / 수정 화면 미리보기 공용) ----- */
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
  window.renderProfile = function (el, d, withEdit) {
    const nl = (s) => esc(s).replace(/\n/g, "<br>");
    const tags = (d.tags || []).map((t) => '<a class="tag" href="category.html?c=all&t=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>").join("");
    const links = [];
    if (safeUrl(d.github)) links.push('<a href="' + esc(safeUrl(d.github)) + '">GitHub</a>');
    if (d.email) links.push('<a href="mailto:' + esc(d.email) + '">' + esc(d.email) + "</a>");
    el.innerHTML =
      '<div class="avatar" aria-hidden="true">' + esc((d.name || "?").trim().charAt(0) || "?") + "</div>" +
      '<div class="profile-body"><div class="profile-top"><h1>' + esc(d.name || "이름") + "</h1>" +
      "</div>" +
      (d.tagline ? '<p class="tagline">' + esc(d.tagline) + "</p>" : "") +
      (d.intro ? '<p class="intro">' + nl(d.intro) + "</p>" : "") +
      (tags ? '<div class="tags">' + tags + "</div>" : "") +
      (links.length ? '<div class="links">' + links.join("") + "</div>" : "") + "</div>";
  };

  /* ----- 홈 ----- */
  if ($("profile")) window.renderProfile($("profile"), SITE, true);
  if ($("recent")) window.renderPosts($("recent"), sorted().slice(0, 6));
  const sf = $("search-form");
  if (sf) sf.addEventListener("submit", (e) => { e.preventDefault(); location.href = "category.html?c=all&q=" + encodeURIComponent($("search-q").value.trim()); });

  /* ----- 카테고리 / 전체 글 ----- */
  const box = $("cat-posts");
  if (box) {
    const id = params.get("c") || "all";
    const c = cat(id);
    const scope = sorted(c ? POSTS.filter((p) => p.category === c.id) : POSTS);
    $("cat-title").textContent = c ? c.name : "전체 글";
    $("cat-desc").textContent = c ? c.desc : "지금까지 쓴 모든 글을 모아 봤어요.";
    document.title = (c ? c.name : "전체 글") + " · " + SITE.name;
    let q = params.get("q") || "", tag = params.get("t") || "";
    $("q").value = q;
    const counts = {};
    scope.forEach((p) => (p.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    const tagBox = $("tag-filter");
    const renderTags = () => {
      const names = Object.keys(counts).sort();
      tagBox.innerHTML = names.map((t) => '<button type="button" class="chip' + (t === tag ? " on" : "") + '" data-t="' + esc(t) + '">#' + esc(t) + "<small>" + counts[t] + "</small></button>").join("");
      tagBox.style.display = names.length ? "" : "none";
    };
    const draw = () => {
      const needle = q.toLowerCase();
      const list = scope.filter((p) => (!tag || (p.tags || []).includes(tag)) &&
        (!needle || (p.title + " " + (p.summary || "") + " " + (p.tags || []).join(" ")).toLowerCase().includes(needle)));
      $("count").textContent = list.length + "개의 글" + (tag ? " · #" + tag : "");
      window.renderPosts(box, list, q || tag ? "조건에 맞는 글이 없어요." : "아직 이 카테고리에 글이 없어요. 첫 글을 써 보세요!");
    };
    tagBox.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-t]"); if (!b) return;
      tag = tag === b.dataset.t ? "" : b.dataset.t; renderTags(); draw();
    });
    $("q").addEventListener("input", (e) => { q = e.target.value.trim(); draw(); });
    renderTags(); draw();
  }

  /* ----- 소개 ----- */
  const about = $("about");
  if (about) {
    const A = { lead: SITE.intro, interests: SITE.interests, goals: SITE.goals, activities: SITE.activities, certs: SITE.certs };
    const list = (title, arr) => (arr && arr.length) ? '<div class="box"><h3>' + esc(title) + "</h3><ul>" + arr.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul></div>" : "";
    about.innerHTML =
      '<div class="profile-top"><h1>안녕하세요, ' + esc(SITE.name) + '입니다.</h1></div>' +
      '<p class="lead">' + esc(A.lead || "").replace(/\n/g, "<br>") + "</p>" +
      '<div class="about-grid">' + list("관심 분야", A.interests) + list("목표", A.goals) + list("활동", A.activities) + list("수상 · 자격증", A.certs) +
      '<div class="box"><h3>연락</h3><ul><li><a href="' + esc(safeUrl(SITE.github) || "#") + '">GitHub</a></li><li><a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a></li></ul></div></div>";
  }

  /* ----- 글 상세 ----- */
  const art = $("article");
  if (art) loadPost();

  function loadComments(slug) {
    const box = $("comments"); if (!box) return;
    const s = document.createElement("script");
    s.src = "https://utteranc.es/client.js"; s.async = true; s.crossOrigin = "anonymous";
    s.setAttribute("repo", SITE.repo);
    s.setAttribute("issue-term", "post: " + slug);
    s.setAttribute("label", "comment");
    s.setAttribute("theme", root.dataset.theme === "dark" ? "github-dark" : "github-light");
    box.appendChild(s);
  }

  async function loadPost() {
    const slug = params.get("p");
    const p = POSTS.find((x) => x.slug === slug);
    if (!p) { art.innerHTML = '<div class="empty">글을 찾을 수 없어요.</div><a class="back" href="category.html?c=all">← 전체 글</a>'; return; }
    document.title = p.title + " · " + SITE.name;
    const tags = (p.tags || []).map((t) => '<a class="tag" href="category.html?c=all&t=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>").join("");
    art.innerHTML =
      '<div class="head"><a class="pill" href="category.html?c=' + esc(p.category) + '">' + esc(catName(p.category)) + "</a>" +
      '<h1 class="title">' + esc(p.title) + '</h1><div class="by">' + esc(SITE.name) + " · " + esc(p.date) + '</div><div class="tags">' + tags + "</div></div>" +
      '<nav class="toc" id="toc" style="display:none"></nav><div class="prose" id="prose"><p style="color:var(--muted)">불러오는 중…</p></div><div id="extras"></div>';

    let md = "";
    try {
      const r = await fetch("posts/" + encodeURIComponent(p.slug) + ".md", { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      md = await r.text();
    } catch (e) {
      $("prose").innerHTML = '<div class="empty">본문 파일(<code>posts/' + esc(p.slug) + '.md</code>)을 불러오지 못했어요.<br>파일 이름이 slug와 같은지, 올라가 있는지 확인해 주세요.</div>';
    }
    if (md) {
      $("prose").innerHTML = MD.render(md);
      MD.enhance($("prose"), { tocEl: $("toc") });
    }

    let extra = "";
    if (p.gallery && p.gallery.length) {
      extra += '<section class="attach"><h2>사진</h2><div class="gallery" id="gallery">' +
        p.gallery.map((g) => '<figure><img src="' + esc(g.src) + '" alt="' + esc(g.caption || "") + '" loading="lazy">' + (g.caption ? "<figcaption>" + esc(g.caption) + "</figcaption>" : "") + "</figure>").join("") + "</div></section>";
    }
    if (p.files && p.files.length) {
      extra += '<section class="attach"><h2>첨부 파일</h2><div class="files">' +
        p.files.map((f) => {
          const ext = ((f.path.split("?")[0].match(/\.([A-Za-z0-9]+)$/) || [])[1] || "file").slice(0, 4);
          return '<a class="file" href="' + esc(f.path) + '" download="' + esc(f.name) + '"><span class="ext">' + esc(ext) + '</span><span class="nm"><b>' + esc(f.name) + "</b><span>다운로드</span></span></a>";
        }).join("") + "</div></section>";
    }
    const same = sorted(POSTS.filter((x) => x.category === p.category));
    const idx = same.findIndex((x) => x.slug === p.slug);
    const newer = same[idx - 1], older = same[idx + 1];
    if (newer || older) {
      extra += '<div class="pager">' +
        (older ? '<a href="' + postHref(older) + '"><small>← 이전 글</small>' + esc(older.title) + "</a>" : "<span></span>") +
        (newer ? '<a class="next" href="' + postHref(newer) + '"><small>다음 글 →</small>' + esc(newer.title) + "</a>" : "") + "</div>";
    }
    if (same.length > 1) {
      const start = Math.max(0, Math.min(idx - 2, same.length - 5));
      extra += '<section class="others"><h2><b>' + esc(catName(p.category)) + "</b>의 다른 글</h2><ul>" +
        same.slice(start, start + 5).map((x) => '<li><a class="' + (x.slug === p.slug ? "now" : "") + '" href="' + postHref(x) + '"><span>' + esc(x.title) + "</span><time>" + esc(x.date) + "</time></a></li>").join("") + "</ul></section>";
    }
    extra += '<div class="foot-actions"><a class="back" href="category.html?c=' + esc(p.category) + '">← ' + esc(catName(p.category)) + ' 목록으로</a><button class="totop" type="button" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">맨 위로 ↑</button></div>';
    if (SITE.comments && SITE.repo) {
      extra += '<section class="comments"><h2>댓글</h2><p class="note">GitHub 계정으로 로그인해서 댓글을 남길 수 있어요.</p><div id="comments"></div></section>';
    }
    $("extras").innerHTML = extra;
    if (SITE.comments && SITE.repo) loadComments(p.slug);
    if ($("gallery")) MD.enhance($("extras"));
  }
})();
