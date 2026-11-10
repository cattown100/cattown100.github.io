/* gh.js — GitHub 저장소에 쓰기 위한 공용 함수. 토큰은 이 브라우저에서 GitHub(api.github.com)로만 전송돼요. */
(function (g) {
  "use strict";
  const KEY = "gh_token";
  const load = () => { try { return sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || ""; } catch (e) { return ""; } };
  const saveToken = (val, keep) => {
    try {
      if (!val) { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); return; }
      (keep ? localStorage : sessionStorage).setItem(KEY, val);
      (keep ? sessionStorage : localStorage).removeItem(KEY);
    } catch (e) {}
  };
  const bytesToB64 = (u8) => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  async function api(token, path, opt) {
    opt = opt || {};
    const r = await fetch("https://api.github.com" + path, {
      method: opt.method || "GET",
      headers: Object.assign({ Accept: "application/vnd.github+json", Authorization: "Bearer " + token, "X-GitHub-Api-Version": "2022-11-28" }, opt.body ? { "Content-Type": "application/json" } : {}),
      body: opt.body ? JSON.stringify(opt.body) : undefined,
      cache: "no-store"
    });
    if (!r.ok) {
      let m = ""; try { m = (await r.json()).message || ""; } catch (e) {}
      const err = new Error(m || "HTTP " + r.status); err.status = r.status; throw err;
    }
    return r.json();
  }

  function friendly(e) {
    if (e.status === 401) return "토큰이 올바르지 않거나 만료됐어요. 새로 만들어서 다시 붙여넣어 주세요.";
    if (e.status === 403 || e.status === 404) return "이 저장소에 쓸 수 없어요. 저장소 이름, 그리고 토큰의 저장소 선택과 Contents 'Read and write' 권한을 확인해 주세요. (" + e.message + ")";
    if (e.status === 409 || e.status === 422) return "GitHub에서 거절했어요. 잠시 뒤 다시 눌러 주세요. (" + e.message + ")";
    if (e instanceof TypeError) return "GitHub에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.";
    return e.message || "저장하지 못했어요.";
  }

  /* 토큰/저장소 입력칸(#f-token, #f-remember, #f-repo, #f-branch, #token-help, #token-steps) 초기화 */
  function initUI() {
    const $ = (id) => document.getElementById(id);
    $("f-repo").value = (typeof SITE !== "undefined" && SITE.repo) || "";
    $("f-branch").value = (typeof SITE !== "undefined" && SITE.branch) || "main";
    $("f-token").value = load();
    try { $("f-remember").checked = !!localStorage.getItem(KEY); } catch (e) {}
    $("token-help").addEventListener("click", (e) => { e.preventDefault(); const s = $("token-steps"); s.hidden = !s.hidden; });
    $("f-remember").addEventListener("change", () => { const v = $("f-token").value.trim(); if (v) saveToken(v, $("f-remember").checked); });
  }

  g.GH = { api, friendly, bytesToB64, b64ToBytes, saveToken, initUI };
})(window);
