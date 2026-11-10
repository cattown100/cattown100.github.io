/* write.js — 글쓰기 도우미: 마크다운 작성 + 사진/파일 첨부 + zip 내보내기 */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = MD.esc;

  /* ----- 초기값 ----- */
  $("f-cat").innerHTML = CATEGORIES.map((c) => '<option value="' + c.id + '">' + esc(c.name) + "</option>").join("");
  const today = new Date(); const pad = (n) => String(n).padStart(2, "0");
  $("f-date").value = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());

  const images = [];   // { name, file, url }
  const files = [];    // { name, file, orig }
  let slugTouched = false, lastSlug = "";

  /* ----- 유틸 ----- */
  const safeName = (n) => n.trim().replace(/\s+/g, "-").replace(/[^\w.\-가-힣]/g, "") || "file";
  const uniqueName = (n, list) => {
    let name = safeName(n), k = 2; const dot = name.lastIndexOf("."); const base = dot > 0 ? name.slice(0, dot) : name, ext = dot > 0 ? name.slice(dot) : "";
    while (list.some((x) => x.name === name)) name = base + "-" + k++ + ext;
    return name;
  };
  const asciiSlug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const slugOk = (s) => /^[a-z0-9][a-z0-9-]*$/.test(s);
  const slug = () => $("f-slug").value.trim();
  const tags = () => $("f-tags").value.split(",").map((t) => t.trim()).filter(Boolean);

  function autoSlug() {
    if (slugTouched) return;
    const s = $("f-date").value + "-" + (asciiSlug($("f-title").value) || "post");
    setSlug(s);
  }
  function setSlug(next) {
    const prev = lastSlug;
    $("f-slug").value = next;
    if (prev && prev !== next) $("f-md").value = $("f-md").value.split("images/" + prev + "/").join("images/" + next + "/");
    lastSlug = next;
  }

  /* ----- 미리보기 ----- */
  function preview() {
    $("pv-title").textContent = $("f-title").value || "제목을 입력하세요";
    const pv = $("pv");
    pv.innerHTML = MD.render($("f-md").value || "_본문을 쓰면 여기에 미리 보여요._");
    MD.enhance(pv);
    pv.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "", pre = "images/" + slug() + "/";
      if (src.startsWith(pre)) {
        let nm = src.slice(pre.length); try { nm = decodeURIComponent(nm); } catch (e) {}
        const hit = images.find((x) => x.name === nm); if (hit) img.src = hit.url;
      }
    });
    const w = $("slug-warn"), s = slug();
    let msg = "";
    if (s && !slugOk(s)) msg = "파일 이름은 영문 소문자, 숫자, - 만 쓸 수 있어요.";
    else if (s && POSTS.some((p) => p.slug === s)) msg = "이미 있는 파일 이름이에요. 다른 이름으로 바꿔 주세요.";
    w.textContent = msg; w.style.display = msg ? "" : "none";
    $("snippet").textContent = snippet();
    try { localStorage.setItem("draft", JSON.stringify({ c: $("f-cat").value, d: $("f-date").value, t: $("f-title").value, s: $("f-summary").value, g: $("f-tags").value, m: $("f-md").value, sl: slug(), st: slugTouched })); } catch (e) {}
  }

  /* ----- 첨부 목록 ----- */
  function drawLists() {
    $("list-img").innerHTML = images.map((x, i) => '<li><span>images/' + esc(slug()) + "/" + esc(x.name) + '</span><button type="button" class="btn sm" data-rm-img="' + i + '">삭제</button></li>').join("");
    $("list-file").innerHTML = files.map((x, i) => '<li><span>files/' + esc(slug()) + "/" + esc(x.name) + '</span><button type="button" class="btn sm" data-rm-file="' + i + '">삭제</button></li>').join("");
  }
  $("f-img").addEventListener("change", (e) => {
    const ta = $("f-md"); let add = "";
    [...e.target.files].forEach((f) => {
      const name = uniqueName(f.name, images);
      images.push({ name, file: f, url: URL.createObjectURL(f) });
      add += "\n![" + name.replace(/\.[^.]+$/, "") + "](images/" + slug() + "/" + name + ")\n";
    });
    insertAtCursor(ta, add); e.target.value = ""; drawLists(); preview();
  });
  $("f-file").addEventListener("change", (e) => {
    [...e.target.files].forEach((f) => files.push({ name: uniqueName(f.name, files), file: f, orig: f.name }));
    e.target.value = ""; drawLists(); preview();
  });
  document.addEventListener("click", (e) => {
    const bi = e.target.closest && e.target.closest("[data-rm-img]"), bf = e.target.closest && e.target.closest("[data-rm-file]");
    if (bi) { const x = images.splice(+bi.dataset.rmImg, 1)[0]; URL.revokeObjectURL(x.url); drawLists(); preview(); }
    if (bf) { files.splice(+bf.dataset.rmFile, 1); drawLists(); preview(); }
  });

  /* ----- 툴바 ----- */
  function insertAtCursor(ta, text) {
    const s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    ta.selectionStart = ta.selectionEnd = s + text.length; ta.focus();
  }
  $("toolbar").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const ta = $("f-md"), s = ta.selectionStart, en = ta.selectionEnd, sel = ta.value.slice(s, en);
    if (b.dataset.ins) insertAtCursor(ta, "\n" + b.dataset.ins + (sel || "내용") + "\n");
    else if (b.dataset.wrap) insertAtCursor(ta, b.dataset.wrap + (sel || "내용") + b.dataset.wrap);
    else if (b.dataset.link) insertAtCursor(ta, "[" + (sel || "링크 이름") + "](https://)");
    preview();
  });
  $("ins-code").addEventListener("click", () => {
    const ta = $("f-md"), sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
    insertAtCursor(ta, "\n```" + $("code-lang").value + "\n" + (sel || "# 코드를 여기에 붙여넣으세요") + "\n```\n"); preview();
  });

  /* ----- 내보내기 ----- */
  function snippet() {
    const s = slug() || "slug";
    const lines = ["  {",
      "    slug: " + JSON.stringify(s) + ",",
      "    title: " + JSON.stringify($("f-title").value.trim() || "제목") + ",",
      "    date: " + JSON.stringify($("f-date").value) + ",",
      "    category: " + JSON.stringify($("f-cat").value) + ",",
      "    tags: " + JSON.stringify(tags()) + ","];
    lines.push("    summary: " + JSON.stringify($("f-summary").value.trim()) + (images.length || files.length ? "," : ""));
    if (images.length) lines.push("    cover: " + JSON.stringify("images/" + s + "/" + images[0].name) + (files.length ? "," : ""));
    if (files.length) lines.push("    files: [" + files.map((f) => "{ name: " + JSON.stringify(f.orig) + ", path: " + JSON.stringify("files/" + s + "/" + f.name) + " }").join(", ") + "]");
    lines.push("  },");
    return lines.join("\n");
  }
  function download(name, blobParts, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(blobParts, { type })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function guard() {
    const s = slug();
    if (!$("f-title").value.trim()) { alert("제목을 입력해 주세요."); return false; }
    if (!slugOk(s)) { alert("파일 이름은 영문 소문자, 숫자, - 만 쓸 수 있어요."); return false; }
    return true;
  }
  $("dl-md").addEventListener("click", () => { if (guard()) download(slug() + ".md", [$("f-md").value], "text/markdown"); });
  $("dl-zip").addEventListener("click", async () => {
    if (!guard()) return;
    const s = slug(), enc = new TextEncoder();
    const entries = [{ name: "posts/" + s + ".md", data: enc.encode($("f-md").value) }];
    for (const x of images) entries.push({ name: "images/" + s + "/" + x.name, data: new Uint8Array(await x.file.arrayBuffer()) });
    for (const x of files) entries.push({ name: "files/" + s + "/" + x.name, data: new Uint8Array(await x.file.arrayBuffer()) });
    entries.push({ name: "posts.js에-붙일-내용.txt", data: enc.encode("posts.js 의 'const POSTS = [' 바로 아래 줄에 붙여넣으세요.\n\n" + snippet() + "\n") });
    download(s + ".zip", [ZIP.build(entries)], "application/zip");
  });
  $("copy-snippet").addEventListener("click", () => {
    const t = snippet(), b = $("copy-snippet"), done = () => { b.textContent = "복사됨"; setTimeout(() => (b.textContent = "posts.js에 붙일 덩어리 복사"), 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done); else done();
  });

  /* ----- 등록: GitHub 저장소에 한 번에 커밋 ----- */
  const { bytesToB64, b64ToBytes, friendly } = GH;
  const gh = GH.api;
  const status = (msg, kind, html) => { const el = $("post-status"); el.className = "status" + (kind ? " " + kind : ""); if (html) el.innerHTML = msg; else el.textContent = msg; };
  GH.initUI();

  $("btn-post").addEventListener("click", async () => {
    if (!guard()) return;
    const token = $("f-token").value.trim(), repo = $("f-repo").value.trim(), branch = $("f-branch").value.trim() || "main", s = slug();
    if (!token) { status("GitHub 토큰을 먼저 입력해 주세요. (토큰 만드는 방법을 눌러 보세요)", "err"); return; }
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { status("저장소는 '아이디/이름' 형태로 써 주세요.", "err"); return; }
    if (!$("f-md").value.trim()) { status("본문을 입력해 주세요.", "err"); return; }
    const btn = $("btn-post"); btn.disabled = true;
    GH.saveToken(token, $("f-remember").checked);
    try {
      status("저장소를 확인하는 중…");
      const base = "/repos/" + repo;
      const ref = await gh(token, base + "/git/ref/heads/" + encodeURIComponent(branch));
      const baseSha = ref.object.sha;
      const baseCommit = await gh(token, base + "/git/commits/" + baseSha);
      status("최신 글 목록을 불러오는 중…");
      const pj = await gh(token, base + "/contents/posts.js?ref=" + encodeURIComponent(branch));
      const text = new TextDecoder().decode(b64ToBytes(String(pj.content).replace(/\s/g, "")));
      if (new RegExp("slug:\\s*[\"']" + s + "[\"']").test(text)) throw new Error("이미 같은 파일 이름(" + s + ")의 글이 있어요. 파일 이름을 바꿔 주세요.");
      const re = /const POSTS = \[\r?\n/;
      if (!re.test(text)) throw new Error("posts.js에서 글 목록(const POSTS = [)을 찾지 못했어요.");
      const nextJs = text.replace(re, (m) => m + snippet() + "\n");

      const items = [
        { path: "posts/" + s + ".md", data: new TextEncoder().encode($("f-md").value) },
        { path: "posts.js", data: new TextEncoder().encode(nextJs) }
      ];
      for (const x of images) items.push({ path: "images/" + s + "/" + x.name, data: new Uint8Array(await x.file.arrayBuffer()) });
      for (const x of files) items.push({ path: "files/" + s + "/" + x.name, data: new Uint8Array(await x.file.arrayBuffer()) });

      const tree = [];
      for (let i = 0; i < items.length; i++) {
        status("올리는 중… (" + (i + 1) + "/" + items.length + ")");
        const blob = await gh(token, base + "/git/blobs", { method: "POST", body: { content: bytesToB64(items[i].data), encoding: "base64" } });
        tree.push({ path: items[i].path, mode: "100644", type: "blob", sha: blob.sha });
      }
      status("등록하는 중…");
      const newTree = await gh(token, base + "/git/trees", { method: "POST", body: { base_tree: baseCommit.tree.sha, tree } });
      const title = $("f-title").value.trim();
      const commit = await gh(token, base + "/git/commits", { method: "POST", body: { message: "새 글: " + title, tree: newTree.sha, parents: [baseSha] } });
      await gh(token, base + "/git/refs/heads/" + encodeURIComponent(branch), { method: "PATCH", body: { sha: commit.sha } });

      try { localStorage.removeItem("draft"); } catch (e) {}
      const url = "post.html?p=" + encodeURIComponent(s);
      status("등록됐어요! 사이트에 반영되는 데 1~2분 걸려요. <a href=\"" + url + "\">글 보러 가기 →</a> (아직 안 보이면 잠시 뒤 새로고침)", "ok", true);
    } catch (e) {
      status(friendly(e), "err");
    } finally {
      btn.disabled = false;
    }
  });

  /* ----- 입력 이벤트 / 임시저장 복원 ----- */
  try {
    const d = JSON.parse(localStorage.getItem("draft") || "null");
    if (d) {
      $("f-cat").value = d.c || $("f-cat").value; $("f-date").value = d.d || $("f-date").value; $("f-title").value = d.t || ""; $("f-summary").value = d.s || "";
      $("f-tags").value = d.g || ""; $("f-md").value = d.m || ""; slugTouched = !!d.st; if (d.sl) { $("f-slug").value = d.sl; lastSlug = d.sl; }
    }
  } catch (e) {}
  if (!$("f-slug").value) autoSlug();
  lastSlug = slug();

  ["f-title", "f-date"].forEach((id) => $(id).addEventListener("input", () => { autoSlug(); drawLists(); preview(); }));
  ["f-cat", "f-summary", "f-tags", "f-md"].forEach((id) => $(id).addEventListener("input", preview));
  $("f-slug").addEventListener("input", () => { slugTouched = true; setSlug($("f-slug").value.trim()); drawLists(); preview(); });
  drawLists(); preview();
})();
