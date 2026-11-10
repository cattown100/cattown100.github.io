/* profile-edit.js — 프로필 수정 화면: 폼 → profile.js 생성 → GitHub에 저장 */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const lines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const csv = (s) => s.split(",").map((x) => x.trim().replace(/^#/, "")).filter(Boolean);

  /* ----- 현재 값 채우기 ----- */
  $("p-name").value = SITE.name || "";
  $("p-tagline").value = SITE.tagline || "";
  $("p-intro").value = SITE.intro || "";
  $("p-tags").value = (SITE.tags || []).join(", ");
  $("p-interests").value = (SITE.interests || []).join("\n");
  $("p-goals").value = (SITE.goals || []).join("\n");
  $("p-activities").value = (SITE.activities || []).join("\n");
  $("p-certs").value = (SITE.certs || []).join("\n");
  $("p-github").value = SITE.github || "";
  $("p-email").value = SITE.email || "";

  function collect() {
    return {
      name: $("p-name").value.trim(),
      tagline: $("p-tagline").value.trim(),
      intro: $("p-intro").value.trim(),
      tags: csv($("p-tags").value),
      interests: lines($("p-interests").value),
      goals: lines($("p-goals").value),
      activities: lines($("p-activities").value),
      certs: lines($("p-certs").value),
      github: $("p-github").value.trim(),
      email: $("p-email").value.trim()
    };
  }
  const fileText = (d) => "/* 내 소개 데이터 — 사이트의 '수정' 버튼(프로필 수정 화면)에서 저장하면 이 파일이 자동으로 바뀌어요. */\nconst PROFILE = " + JSON.stringify(d, null, 2) + ";\n";

  function refresh() {
    const d = collect();
    window.renderProfile($("pv-profile"), d, false);
    $("snippet").textContent = fileText(d);
  }
  document.querySelectorAll(".panel input, .panel textarea").forEach((el) => el.addEventListener("input", refresh));
  refresh();

  const status = (msg, kind, html) => { const el = $("post-status"); el.className = "status" + (kind ? " " + kind : ""); if (html) el.innerHTML = msg; else el.textContent = msg; };
  GH.initUI();

  $("copy-snippet").addEventListener("click", () => {
    const b = $("copy-snippet"), done = () => { b.textContent = "복사됨"; setTimeout(() => (b.textContent = "내용 복사"), 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(fileText(collect())).then(done, done); else done();
  });

  /* ----- 저장 ----- */
  $("btn-save").addEventListener("click", async () => {
    const d = collect(), token = $("f-token").value.trim(), repo = $("f-repo").value.trim(), branch = $("f-branch").value.trim() || "main";
    if (!d.name) { status("이름을 입력해 주세요.", "err"); return; }
    if (d.github && !/^https:\/\//i.test(d.github)) { status("GitHub 주소는 https:// 로 시작해야 해요.", "err"); return; }
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { status("이메일 형식을 확인해 주세요.", "err"); return; }
    if (!token) { status("GitHub 토큰을 먼저 입력해 주세요. (토큰 만드는 방법을 눌러 보세요)", "err"); return; }
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { status("저장소는 '아이디/이름' 형태로 써 주세요.", "err"); return; }
    const btn = $("btn-save"); btn.disabled = true;
    GH.saveToken(token, $("f-remember").checked);
    try {
      status("저장하는 중…");
      const path = "/repos/" + repo + "/contents/profile.js";
      let sha;
      try { sha = (await GH.api(token, path + "?ref=" + encodeURIComponent(branch))).sha; }
      catch (e) { if (e.status !== 404) throw e; }
      await GH.api(token, path, { method: "PUT", body: { message: "프로필 수정", content: GH.bytesToB64(new TextEncoder().encode(fileText(d))), branch, sha } });
      status('저장됐어요! 사이트에 반영되는 데 1~2분 걸려요. <a href="index.html">첫 화면 보기 →</a> (아직 그대로면 잠시 뒤 새로고침)', "ok", true);
    } catch (e) {
      status(GH.friendly(e), "err");
    } finally {
      btn.disabled = false;
    }
  });
})();
