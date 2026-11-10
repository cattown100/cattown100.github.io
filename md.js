/* md.js — 마크다운 렌더링 + 코드 하이라이트 + 이미지 확대 (외부 서비스 없이 동작) */
(function (global) {
  "use strict";

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

  /* ---------- 코드 하이라이트 ---------- */
  const CLIKE_KW = set("auto break case char class const continue default do double else enum extern float for goto if inline int long namespace new null nullptr operator private protected public register return short signed sizeof static struct switch template this throw try typedef union unsigned using virtual void volatile while true false bool byte final import package interface implements extends instanceof boolean func fn let mut pub use mod impl trait match var defer go chan range select fallthrough map type function echo foreach as abstract override val fun object when is in def lambda");
  const CLIKE_BI = set("printf scanf malloc free memcpy strlen strcpy puts main System String Integer fmt println Vec Option Result Some None Ok Err NULL size_t uint8_t uint32_t");

  const LANGS = {
    python: { kw: set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield"),
      bi: set("print len range int str float list dict set tuple open input type isinstance enumerate zip map filter sum min max abs sorted bytes bytearray hex bin ord chr self cls super"),
      line: ["#"], str: ['"""', "'''", '"', "'"] },
    javascript: { kw: set("break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return static super switch this throw try typeof var void while with yield async await null undefined true false interface type enum implements public private protected readonly from as"),
      bi: set("console window document Math JSON Object Array String Number Promise Map Set fetch require module process Buffer"),
      line: ["//"], block: [["/*", "*/"]], str: ['"', "'", "`"] },
    clike: { kw: CLIKE_KW, bi: CLIKE_BI, line: ["//"], block: [["/*", "*/"]], str: ['"', "'", "`"], pre: true },
    bash: { kw: set("if then else elif fi for while until do done case esac in function select time return exit break continue export local readonly declare unset source alias"),
      bi: set("echo cd ls cat grep sed awk curl wget chmod chown sudo apt pip pip3 npm git python python3 node make cp mv rm mkdir touch tar ssh scp nc nmap gcc docker"),
      line: ["#"], boundary: true, str: ['"', "'"], dollar: true },
    sql: { kw: set("select from where insert into values update set delete create table drop alter add join left right inner outer on group by order having limit offset union all distinct as and or not null is in like between exists case when then else end primary key foreign references index database use"),
      bi: set("count sum avg min max now concat substring"), ci: true, line: ["--"], block: [["/*", "*/"]], str: ["'", '"'] },
    json: { kw: set("true false null"), bi: set(""), str: ['"'], json: true },
    css: { kw: set(""), bi: set(""), block: [["/*", "*/"]], str: ['"', "'"], css: true }
  };
  const ALIAS = {
    py: "python", python3: "python", js: "javascript", jsx: "javascript", ts: "javascript", tsx: "javascript", typescript: "javascript", node: "javascript", mjs: "javascript",
    c: "clike", cpp: "clike", "c++": "clike", h: "clike", hpp: "clike", java: "clike", cs: "clike", csharp: "clike", go: "clike", golang: "clike", rust: "clike", rs: "clike", php: "clike", kotlin: "clike", swift: "clike",
    sh: "bash", shell: "bash", zsh: "bash", console: "bash", bash: "bash", mysql: "sql", postgres: "sql", sqlite: "sql", scss: "css"
  };

  function scan(code, cfg) {
    let out = "", i = 0;
    const n = code.length;
    const wordRe = /[A-Za-z_$À-￿][\w$À-￿]*/y;
    const numRe = /(?:0[xX][0-9a-fA-F]+|0[bB][01]+|\d+\.?\d*(?:[eE][+-]?\d+)?)/y;
    const push = (cls, t) => { out += cls ? '<span class="' + cls + '">' + esc(t) + "</span>" : esc(t); };
    const isLineStart = (p) => { for (let k = p - 1; k >= 0; k--) { if (code[k] === "\n") return true; if (code[k] !== " " && code[k] !== "\t") return false; } return true; };
    outer: while (i < n) {
      const ch = code[i];
      for (const [s, e] of cfg.block || []) {
        if (code.startsWith(s, i)) { let j = code.indexOf(e, i + s.length); j = j < 0 ? n : j + e.length; push("tok-c", code.slice(i, j)); i = j; continue outer; }
      }
      for (const s of cfg.line || []) {
        if (code.startsWith(s, i) && (!cfg.boundary || i === 0 || /\s/.test(code[i - 1]))) {
          let j = code.indexOf("\n", i); if (j < 0) j = n; push("tok-c", code.slice(i, j)); i = j; continue outer;
        }
      }
      if (cfg.pre && ch === "#" && isLineStart(i)) {
        const m = /#\s*\w+/y; m.lastIndex = i; const r = m.exec(code);
        if (r) { push("tok-k", r[0]); i += r[0].length; continue; }
      }
      for (const q of cfg.str || []) {
        if (code.startsWith(q, i)) {
          let j = i + q.length;
          while (j < n) {
            if (code[j] === "\\") { j += 2; continue; }
            if (code.startsWith(q, j)) { j += q.length; break; }
            if (q.length === 1 && q !== "`" && code[j] === "\n") break;
            j++;
          }
          if (j > n) j = n;
          let cls = "tok-s";
          if (cfg.json) { let k = j; while (code[k] === " " || code[k] === "\t") k++; if (code[k] === ":") cls = "tok-p"; }
          push(cls, code.slice(i, j)); i = j; continue outer;
        }
      }
      if (cfg.dollar && ch === "$") {
        const m = /\$(?:\{[^}]*\}|[A-Za-z_]\w*|[0-9@#?!*$-])/y; m.lastIndex = i; const r = m.exec(code);
        if (r) { push("tok-v", r[0]); i += r[0].length; continue; }
      }
      if (cfg.css && ch === "@") { const m = /@[\w-]+/y; m.lastIndex = i; const r = m.exec(code); if (r) { push("tok-k", r[0]); i += r[0].length; continue; } }
      if (cfg.css && ch === "#") { const m = /#[0-9a-fA-F]{3,8}\b/y; m.lastIndex = i; const r = m.exec(code); if (r) { push("tok-n", r[0]); i += r[0].length; continue; } }
      if (/\d/.test(ch) && (i === 0 || !/[\w$]/.test(code[i - 1]))) {
        numRe.lastIndex = i; const r = numRe.exec(code);
        if (r) { push("tok-n", r[0]); i += r[0].length; continue; }
      }
      wordRe.lastIndex = i;
      const w = wordRe.exec(code);
      if (w) {
        const word = w[0], key = cfg.ci ? word.toLowerCase() : word;
        let cls = "";
        if (cfg.kw.has(key)) cls = "tok-k";
        else if (cfg.bi.has(word)) cls = "tok-f";
        else {
          let k = i + word.length; while (code[k] === " ") k++;
          if (cfg.css) { if (code[k] === ":" ) cls = "tok-p"; }
          else if (code[i + word.length] === "(") cls = "tok-f";
        }
        push(cls, word); i += word.length; continue;
      }
      push("", ch); i++;
    }
    return out;
  }

  function markup(code) {
    let out = "", i = 0; const n = code.length;
    while (i < n) {
      if (code.startsWith("<!--", i)) { let j = code.indexOf("-->", i); j = j < 0 ? n : j + 3; out += '<span class="tok-c">' + esc(code.slice(i, j)) + "</span>"; i = j; continue; }
      if (code[i] === "<" && /[A-Za-z\/!?]/.test(code[i + 1] || "")) {
        const m = /<[\/!?]?[\w:-]*/y; m.lastIndex = i; const r = m.exec(code);
        out += '<span class="tok-k">' + esc(r[0]) + "</span>"; i += r[0].length;
        while (i < n && code[i] !== ">") {
          if (/\s/.test(code[i])) { out += code[i]; i++; continue; }
          if (code[i] === '"' || code[i] === "'") { const q = code[i]; let j = code.indexOf(q, i + 1); j = j < 0 ? n : j + 1; out += '<span class="tok-s">' + esc(code.slice(i, j)) + "</span>"; i = j; continue; }
          const a = /[^\s=>"'\/]+/y; a.lastIndex = i; const ar = a.exec(code);
          if (ar) { out += '<span class="tok-f">' + esc(ar[0]) + "</span>"; i += ar[0].length; continue; }
          out += esc(code[i]); i++;
        }
        if (i < n) { out += '<span class="tok-k">&gt;</span>'; i++; }
        continue;
      }
      out += esc(code[i]); i++;
    }
    return out;
  }

  function diff(code) {
    return code.split("\n").map((l) => {
      const c = l.startsWith("+") && !l.startsWith("+++") ? "tok-add" : l.startsWith("-") && !l.startsWith("---") ? "tok-del" : l.startsWith("@@") ? "tok-k" : "";
      return c ? '<span class="' + c + '">' + esc(l) + "</span>" : esc(l);
    }).join("\n");
  }

  function highlight(code, lang) {
    const l = (lang || "").toLowerCase();
    const key = ALIAS[l] || l;
    try {
      if (key === "html" || key === "xml" || key === "svg") return markup(code);
      if (key === "diff" || key === "patch") return diff(code);
      if (LANGS[key]) return scan(code, LANGS[key]);
    } catch (e) { /* 실패하면 일반 텍스트로 */ }
    return esc(code);
  }

  /* ---------- 마크다운 렌더링 ---------- */
  const unsafe = (u) => /^\s*(javascript|data|vbscript):/i.test(u || "");
  let configured = false;
  function configure() {
    if (configured || !global.marked) return;
    configured = true;
    global.marked.use({
      gfm: true,
      renderer: {
        html(token) { return esc(token.text != null ? token.text : token); },
        code(token) {
          const lang = (token.lang || "").trim().split(/\s+/)[0].toLowerCase();
          return '<div class="codeblock"><div class="codebar"><span>' + esc(lang || "text") + '</span><button type="button" class="copy">복사</button></div><pre><code>' + highlight(token.text, lang) + "</code></pre></div>\n";
        },
        link(token) {
          const text = this.parser.parseInline(token.tokens);
          if (unsafe(token.href)) return text;
          const ext = /^https?:/i.test(token.href);
          return '<a href="' + esc(token.href) + '"' + (token.title ? ' title="' + esc(token.title) + '"' : "") + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + text + "</a>";
        },
        image(token) {
          if (unsafe(token.href)) return esc(token.text || "");
          return '<img src="' + esc(token.href) + '" alt="' + esc(token.text || "") + '"' + (token.title ? ' title="' + esc(token.title) + '"' : "") + ' loading="lazy">';
        }
      }
    });
  }

  function render(md) {
    configure();
    if (!global.marked) return "<p>마크다운 렌더러를 불러오지 못했어요.</p>";
    return global.marked.parse(md || "");
  }

  /* ---------- 라이트박스 ---------- */
  function lightbox(src, alt) {
    const o = document.createElement("div");
    o.className = "lightbox";
    o.innerHTML = '<img alt="' + esc(alt || "") + '">';
    o.firstChild.src = src;
    const close = () => { o.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    o.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(o);
  }

  /* ---------- 렌더 후 처리: 복사 버튼, 이미지 확대, 제목 id/목차 ---------- */
  function slugify(t) { return t.trim().toLowerCase().replace(/[^\wㄱ-ㆎ가-힣\s-]/g, "").replace(/\s+/g, "-") || "section"; }

  function enhance(container, opts) {
    opts = opts || {};
    if (!container.__mdBound) {
      container.__mdBound = true;
      container.addEventListener("click", (e) => {
        const b = e.target.closest && e.target.closest("button.copy");
        if (b) {
          const code = b.closest(".codeblock").querySelector("code").textContent;
          const done = () => { b.textContent = "복사됨"; setTimeout(() => (b.textContent = "복사"), 1400); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done);
          else done();
          return;
        }
        const img = e.target.closest && e.target.closest(".prose img, .gallery img");
        if (img) lightbox(img.currentSrc || img.src, img.alt);
      });
    }
    const used = new Set(), heads = [];
    container.querySelectorAll("h2, h3").forEach((h) => {
      let id = slugify(h.textContent), k = 2, base = id;
      while (used.has(id)) id = base + "-" + k++;
      used.add(id); h.id = id; heads.push({ id, text: h.textContent, level: h.tagName === "H2" ? 2 : 3 });
    });
    if (opts.tocEl) {
      opts.tocEl.innerHTML = heads.length >= 3
        ? "<b>목차</b>" + heads.map((h) => '<a class="l' + h.level + '" href="#' + esc(h.id) + '">' + esc(h.text) + "</a>").join("")
        : "";
      opts.tocEl.style.display = heads.length >= 3 ? "" : "none";
    }
    return heads;
  }

  global.MD = { render, enhance, highlight, lightbox, esc };
})(typeof window !== "undefined" ? window : globalThis);
