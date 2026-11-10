(function () {
  const D = window.COE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tech = (id) => D.techniques.find((t) => t.id === id);
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  const tcode = (id, add) => `<button class="tcode${add ? " add" : ""}" data-open="${id}" title="${esc(tech(id)?.name || id)}">${id}</button>`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme & nav ---------- */
  const root = document.documentElement;
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
  const nav = $("#nav");
  $("#menuBtn").addEventListener("click", () => nav.classList.toggle("open"));
  nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });

  const navLinks = $$("#nav a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach((s) => spy.observe(s));

  /* ---------- Hero demo ---------- */
  const KW = /\b(SELECT|FROM|JOIN|ON|WHERE|AND|GROUP|BY|ORDER|LIMIT|AS|DESC|DATE|FALSE|TRUE|COUNT|SUM)\b/g;
  function highlight(sql) {
    return sql.split("\n").map((line) => {
      let code = line, cm = "";
      const i = line.indexOf("--");
      if (i >= 0) { code = line.slice(0, i); cm = line.slice(i); }
      code = esc(code)
        .replace(/(&#39;[^&]*?&#39;)/g, '<span class="str">$1</span>')
        .replace(/\b(\d+)\b(?![^<]*<\/span>)/g, '<span class="num">$1</span>')
        .replace(KW, (m) => (m === "COUNT" || m === "SUM" ? `<span class="fn">${m}</span>` : `<span class="kw">${m}</span>`));
      return code + (cm ? `<span class="cm">${esc(cm)}</span>` : "");
    }).join("\n");
  }
  const typedEl = $("#typed"), sqlEl = $("#demoSql"), footEl = $("#demoFoot");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function runDemo() {
    let i = 0;
    while (true) {
      const d = D.demos[i % D.demos.length];
      typedEl.textContent = ""; sqlEl.innerHTML = ""; footEl.innerHTML = "";
      if (reduceMotion) {
        typedEl.textContent = d.q; sqlEl.innerHTML = highlight(d.sql);
        footEl.innerHTML = d.foot.map((f) => `<span>${esc(f)}</span>`).join("");
        return;
      }
      for (const ch of d.q) { typedEl.textContent += ch; await sleep(28); }
      await sleep(350);
      const lines = d.sql.split("\n");
      for (let n = 1; n <= lines.length; n++) { sqlEl.innerHTML = highlight(lines.slice(0, n).join("\n")); await sleep(110); }
      for (const f of d.foot) { footEl.insertAdjacentHTML("beforeend", `<span>${esc(f)}</span>`); await sleep(350); }
      await sleep(4200);
      i++;
    }
  }
  runDemo();

  /* ---------- Challenges ---------- */
  $("#challenges").innerHTML = D.challenges.map((c) => `
    <div class="card challenge reveal${c.danger ? " danger" : ""}">
      <div class="ic">${c.icon}</div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.what)}</p>
      <div class="ex">${esc(c.ex)}</div>
    </div>`).join("");

  /* ---------- Techniques ---------- */
  $("#techGrid").innerHTML = D.techniques.map((t) => `
    <article class="card tech reveal" data-cat="${t.cat}" data-open="${t.id}" id="card-${t.id}" tabindex="0" role="button" aria-label="Open ${esc(t.id)} ${esc(t.name)}">
      <div class="tech-top"><span class="tech-id">${t.id}</span>${t.badge ? `<span class="badge">${esc(t.badge)}</span>` : ""}<span class="tech-icon">${t.icon}</span></div>
      <h3>${esc(t.name)}</h3>
      <p>${esc(t.what)}</p>
      <div class="proscons">
        <div class="pc good"><b>Shines when</b>${esc(t.shines)}</div>
        <div class="pc bad"><b>Falls short</b>${esc(t.falls)}</div>
      </div>
      <div class="more">Details, links &amp; use cases →</div>
    </article>`).join("");

  function bindFilter(barSel, itemsSel, match) {
    const bar = $(barSel);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      $$(".chip", bar).forEach((c) => c.classList.toggle("active", c === b));
      $$(itemsSel).forEach((el) => el.classList.toggle("hidden", !match(el, b.dataset.f)));
    });
  }
  bindFilter("#techFilters", ".tech", (el, f) => f === "all" || el.dataset.cat === f);

  /* ---------- Drawer ---------- */
  const drawer = $("#drawer"), bg = $("#drawerBg"), body = $("#drawerBody");
  let lastFocus = null;
  function openTech(id, push = true) {
    const t = tech(id); if (!t) return;
    const idx = D.techniques.indexOf(t);
    const prev = D.techniques[idx - 1], next = D.techniques[idx + 1];
    const res = D.resources.filter((r) => r.t.includes(id));
    const ucs = D.useCases.filter((u) => u.go.includes(id) || u.add.includes(id));
    body.innerHTML = `
      <div class="tech-top" style="--c: var(--c-${t.cat})"><span class="tech-id" style="color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)">${t.id}</span>${t.badge ? `<span class="badge">${esc(t.badge)}</span>` : ""}<span class="badge">${esc(t.cat)}</span></div>
      <h2 id="drawerTitle">${t.icon} ${esc(t.name)}</h2>
      <p class="lead-sm">${esc(t.what)}</p>
      ${t.note ? `<div class="note">${esc(t.note)}</div>` : ""}
      <h4>When to use it</h4>
      <div class="proscons">
        <div class="pc good"><b>Shines when</b>${esc(t.shines)}</div>
        <div class="pc bad"><b>Falls short</b>${esc(t.falls)}</div>
      </div>
      ${t.stages ? `<h4>How it works</h4><div class="stages">${t.stages.map((s) => `<div class="stage"><b>${esc(s.t)}</b><ul>${s.d.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div><p class="muted small" style="margin-top:10px">${esc(t.stagesNote)}</p>` : ""}
      ${ucs.length ? `<h4>Use cases where it appears</h4><div class="uc-mini">${ucs.map((u) => `<div>${u.go.includes(id) ? "<b>Go-to</b>" : "Add-on"} · ${esc(u.uc)}</div>`).join("")}</div>` : ""}
      ${res.length ? `<h4>Resources</h4><div class="res-list">${res.map((r) => `<a class="res-item" href="${esc(r.url)}" target="_blank" rel="noopener"><span><b>${esc(r.name)}</b><small>${esc(r.d)}</small></span><span class="kind">${esc(r.kind)}</span></a>`).join("")}</div>` : ""}
      <h4>In the repo</h4>
      <p><code>text2sql-coe/techniques/${esc(t.folder)}/</code><br><span class="muted small">README · runnable notebook or app · config · latest golden-set scores</span></p>
      <div class="drawer-nav">
        ${prev ? `<button class="btn ghost" data-open="${prev.id}">← ${prev.id} ${esc(prev.short)}</button>` : "<span></span>"}
        ${next ? `<button class="btn ghost" data-open="${next.id}">${next.id} ${esc(next.short)} →</button>` : ""}
      </div>`;
    if (!drawer.classList.contains("open")) lastFocus = document.activeElement;
    bg.hidden = false; drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
    drawer.scrollTop = 0; document.body.style.overflow = "hidden";
    $("#drawerClose").focus();
    if (push) history.replaceState(null, "", "#t-" + id);
  }
  function closeTech() {
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); bg.hidden = true;
    document.body.style.overflow = "";
    if (location.hash.startsWith("#t-")) history.replaceState(null, "", "#techniques");
    if (lastFocus) lastFocus.focus();
  }
  $("#drawerClose").addEventListener("click", closeTech);
  bg.addEventListener("click", closeTech);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeTech();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".tech")) { e.preventDefault(); openTech(e.target.dataset.open); }
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#t-"]');
    if (a) { e.preventDefault(); openTech(a.getAttribute("href").slice(3)); return; }
    const el = e.target.closest("[data-open], .pl-chip, button.pl-step");
    if (el) openTech(el.dataset.open || el.dataset.t);
  });
  const openFromHash = () => { if (location.hash.startsWith("#t-")) openTech(location.hash.slice(3), false); };
  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  /* ---------- Wizard ---------- */
  const wiz = $("#wizard");
  let step = 0, answers = [];
  function renderWizard() {
    const prog = D.wizard.map((_, i) => `<span class="${i < step || answers.result ? "done" : ""}"></span>`).join("");
    const path = answers.map((a, i) => `<div class="${a ? "yes" : "no"}">${a ? "✓ Yes" : "✗ No"} · ${esc(D.wizard[i].q)}</div>`).join("");
    if (answers.result) {
      const r = answers.result;
      wiz.innerHTML = `<div class="wz-progress">${prog}</div>
        <div class="wz-result">
          <h4>Your starting stack</h4>
          <div class="title">${esc(r.title)}</div>
          <p class="subt">${esc(r.sub)}</p>
          <div class="stack-pills">${r.stack.map((id) => `<button class="tpill" data-open="${id}"><code>${id}</code>${esc(tech(id).short)}</button>`).join("")}</div>
          <button class="btn ghost" id="wzReset">↺ Start over</button>
        </div>
        <div class="wz-path">${path}</div>
        <p class="muted small" style="margin:14px 0 0">A starting point, not a rulebook.</p>`;
      $("#wzReset").addEventListener("click", () => { step = 0; answers = []; renderWizard(); highlightUC(null); });
      highlightUC(r.stack[0]);
      return;
    }
    const s = D.wizard[step];
    wiz.innerHTML = `<div class="wz-progress">${prog}</div>
      <div class="wz-step">Question ${step + 1} of ${D.wizard.length}</div>
      <div class="wz-q">${esc(s.q)}</div>
      <p class="wz-hint">${esc(s.hint)}</p>
      <div class="wz-btns"><button class="btn primary" data-a="yes">Yes</button><button class="btn ghost" data-a="no">No</button></div>
      ${path ? `<div class="wz-path">${path}</div>` : ""}`;
  }
  wiz.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const yes = b.dataset.a === "yes";
    answers.push(yes);
    if (yes) answers.result = D.wizard[step].yes;
    else if (++step >= D.wizard.length) answers.result = D.wizardDefault;
    renderWizard();
  });
  renderWizard();

  /* ---------- Use cases ---------- */
  const tbody = $("#ucTable tbody");
  tbody.innerHTML = D.useCases.map((u) => `
    <tr data-go="${u.go.join(" ")}" data-text="${esc((u.uc + " " + u.why + " " + u.go.join(" ") + " " + u.add.join(" ")).toLowerCase())}">
      <td><b>${esc(u.uc)}</b></td>
      <td>${u.go.map((id) => tcode(id)).join("")}</td>
      <td>${u.add.map((id) => tcode(id, true)).join("")}</td>
      <td class="muted">${esc(u.why)}</td>
    </tr>`).join("");
  $("#ucSearch").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("tr", tbody).forEach((tr) => { tr.style.display = !q || tr.dataset.text.includes(q) ? "" : "none"; });
  });
  function highlightUC(id) { $$("tr", tbody).forEach((tr) => tr.classList.toggle("hl", !!id && tr.dataset.go.split(" ")[0] === id)); }

  /* ---------- Evaluate ---------- */
  $("#qsets").innerHTML = D.questionSets.map((q) => `
    <div class="card qset reveal"><div class="ic">${q.icon}</div><div><b>${esc(q.title)}</b><p>${esc(q.d)}${q.link ? ` <a href="${q.link}">See datasets →</a>` : ""}</p></div></div>`).join("");
  $("#metrics").innerHTML = D.metrics.map((m) => `
    <div class="card metric reveal${m.main ? " main" : ""}"><b>${esc(m.m)}</b><p>${esc(m.d)}</p></div>`).join("");

  /* ---------- Datasets ---------- */
  const catLabel = { benchmark: "Benchmark", warehouse: "Sample DW", conversational: "Conversational" };
  $("#dsGrid").innerHTML = D.datasets.map((d) => `
    <a class="card lcard reveal" data-cat="${d.cat}" href="${esc(d.url)}" target="_blank" rel="noopener">
      <div class="lcard-top"><h3>${esc(d.name)}</h3><span class="kind ${d.cat}">${catLabel[d.cat]}</span></div>
      <div class="tagline">${esc(d.tag)}</div>
      <p>${esc(d.d)}</p>
      <div class="lcard-foot"><span class="host">${esc(host(d.url))} ↗</span>${(d.extra || []).map(([l, u]) => `<span class="xlink" data-href="${esc(u)}">${esc(l)}</span>`).join("")}</div>
    </a>`).join("");
  // Secondary links inside a card link: open them separately.
  document.addEventListener("click", (e) => {
    const x = e.target.closest(".xlink"); if (!x) return;
    e.preventDefault(); e.stopPropagation(); window.open(x.dataset.href, "_blank", "noopener");
  }, true);
  bindFilter("#dsFilters", "#dsGrid .lcard", (el, f) => f === "all" || el.dataset.cat === f);

  /* ---------- Resources ---------- */
  const resTags = ["all", ...D.techniques.map((t) => t.id).filter((id) => D.resources.some((r) => r.t.includes(id))), "eval"];
  $("#resFilters").innerHTML = resTags.map((t, i) => `<button class="chip${i === 0 ? " active" : ""}" data-f="${t}">${t === "all" ? "All" : t === "eval" ? "Evaluation" : t + " · " + esc(tech(t).short)}</button>`).join("");
  $("#resGrid").innerHTML = D.resources.map((r) => `
    <a class="card lcard reveal" data-t="${r.t.join(" ")}" href="${esc(r.url)}" target="_blank" rel="noopener">
      <div class="lcard-top"><h3>${esc(r.name)}</h3><span class="kind">${esc(r.kind)}</span></div>
      <p style="margin-top:8px">${esc(r.d)}</p>
      <div class="lcard-foot"><span class="host">${esc(host(r.url))} ↗</span>${r.t.filter((x) => x !== "eval").map((id) => `<span class="tcode">${id}</span>`).join("")}</div>
    </a>`).join("");
  bindFilter("#resFilters", "#resGrid .lcard", (el, f) => f === "all" || el.dataset.t.split(" ").includes(f));

  /* ---------- Repo tree & risks ---------- */
  $("#tree").innerHTML = D.tree.map(([p, c, id]) => {
    const name = id ? `<a href="#t-${id}">${esc(p)}</a>` : `<span class="dir">${esc(p)}</span>`;
    const comment = c ? `<span class="cmt"># ${esc(c)}</span>` : id ? `<span class="cmt"># ${esc(tech(id).short)}</span>` : "";
    return `<div class="row">${name}${comment}</div>`;
  }).join("");
  $("#risks").innerHTML = D.risks.map((r) => `<div class="card risk reveal"><div class="r">${esc(r.r)}</div><div class="m">${esc(r.m)}</div></div>`).join("");

  /* ---------- Reveal on scroll ---------- */
  const rev = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); rev.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 60 + "ms"; rev.observe(el); });
})();
