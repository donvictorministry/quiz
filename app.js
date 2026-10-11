/* ======================================================================
   Bible Trivia Master — app.js
   Core engine. Reads series data from window.TRIVIA_SERIES (populated by
   series1.js / series2.js / series3.js) and the referral panel from
   window.TRIVIA_MODULES.referral (populated by referral.js). Both are
   optional at runtime — if a module file is removed, this file degrades
   gracefully instead of breaking.
   No CDN dependency. No window.alert/confirm/prompt anywhere.
   ====================================================================== */
(function () {
  "use strict";

  var CFG = {
    QUESTION_TIME_MS: 15000,
    NEXT_DELAY_MS: 1800,
    VERSE_BANNER_MS: 8000,
    POINTS: { easy: 10, medium: 15, hard: 20 },
    STREAK_BONUS_EVERY: 3,
    STREAK_BONUS_POINTS: 15,
    FS_MIN: 1.0,   /* floor: never below default — guarantees no text under 19px */
    FS_MAX: 1.5,
    FS_STEP: 0.1,
    CONTACT_EMAIL: "feedback@chrisministries.online",
    CONTACT_PHONE: "+10000000000",
    CONTACT_WHATSAPP_URL: "https://wa.me/10000000000",
    CONTACT_FACEBOOK_URL: "#"
  };

  var els = {
    statbar: document.getElementById("statbar"),
    progressTrack: document.getElementById("progress-track"),
    scoreText: document.getElementById("score-text"),
    streakText: document.getElementById("streak-text"),
    questionCounter: document.getElementById("question-counter"),
    progressFill: document.getElementById("progress-fill"),
    timerFill: document.getElementById("timer-fill"),
    categoryTag: document.getElementById("category-tag"),
    difficultyTag: document.getElementById("difficulty-tag"),
    questionText: document.getElementById("question-text"),
    optionsWrap: document.getElementById("options-wrap"),
    feedbackRow: document.getElementById("feedback-row"),
    homeView: document.getElementById("home-view"),
    quizView: document.getElementById("quiz-view"),
    endView: document.getElementById("end-view"),
    seriesGrid: document.getElementById("series-grid"),
    seal: document.getElementById("seal"),
    playAgainBtn: document.getElementById("play-again-btn"),
    chooseSeriesBtn: document.getElementById("choose-series-btn"),
    finalScore: document.getElementById("final-score"),
    finalAccuracy: document.getElementById("final-accuracy"),
    finalStreak: document.getElementById("final-streak"),
    endTitle: document.getElementById("end-title"),
    endSub: document.getElementById("end-sub"),
    categoryBreakdown: document.getElementById("category-breakdown"),
    quizExitBtn: document.getElementById("quiz-exit-btn"),
    menuToggle: document.getElementById("menu-toggle"),
    moreToggle: document.getElementById("more-toggle"),
    toast: document.getElementById("toast"),
    verseBanner: document.getElementById("verse-banner"),
    verseBannerText: document.getElementById("verse-banner-text"),
    leftMenuContent: document.getElementById("left-menu-content"),
    rightMenuContent: document.getElementById("right-menu-content"),
    teamPageContent: document.getElementById("team-page-content"),
    developerPageContent: document.getElementById("developer-page-content")
  };

  var state = {};
  var lastCompleted = null;

  /* ---------------------------------------------------------------- */
  /* Ripple (Material touch feedback)                                  */
  /* ---------------------------------------------------------------- */
  function attachRipple(el, light) {
    el.addEventListener("pointerdown", function (e) {
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2.2;
      var span = document.createElement("span");
      span.className = "ripple-effect";
      span.style.width = span.style.height = size + "px";
      span.style.left = ((e.clientX || (rect.left + rect.width / 2)) - rect.left - size / 2) + "px";
      span.style.top = ((e.clientY || (rect.top + rect.height / 2)) - rect.top - size / 2) + "px";
      span.style.background = light ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.14)";
      el.appendChild(span);
      setTimeout(function () { span.remove(); }, 550);
    });
  }
  function initRipples(scope) {
    (scope || document).querySelectorAll(".btn-primary,.btn-whatsapp").forEach(function (el) { attachRipple(el, true); });
    (scope || document).querySelectorAll(".option-btn,.btn-secondary,.appbar-icon,.menu-item,.series-card,.quiz-exit,.team-card,.contact-cta").forEach(function (el) { attachRipple(el, false); });
  }

  /* ---------------------------------------------------------------- */
  /* Toast                                                              */
  /* ---------------------------------------------------------------- */
  var toastTimer = null;
  function showToast(msg, ms) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("show"); }, ms || 2600);
  }

  /* ---------------------------------------------------------------- */
  /* Verse banner — pops at the TOP, always, for a fixed 8s             */
  /* ---------------------------------------------------------------- */
  var verseBannerTimer = null;
  function showVerseBanner(text) {
    els.verseBannerText.textContent = text;
    els.verseBanner.classList.add("show");
    clearTimeout(verseBannerTimer);
    verseBannerTimer = setTimeout(function () { els.verseBanner.classList.remove("show"); }, CFG.VERSE_BANNER_MS);
  }
  function hideVerseBanner() {
    clearTimeout(verseBannerTimer);
    els.verseBanner.classList.remove("show");
  }

  /* ---------------------------------------------------------------- */
  /* Fullscreen overlay system — used by every modal/menu/page.        */
  /* 100dvh x 100dvw edge-to-edge. Android back button/gesture closes  */
  /* whatever is on top via browser history.                           */
  /* ---------------------------------------------------------------- */
  var openStack = [];
  function openFullpage(id) {
    var el = document.getElementById(id);
    el.classList.add("open");
    openStack.push(id);
    history.pushState({ fp: true }, "");
  }
  function closeFullpageDirect(id) {
    var el = document.getElementById(id);
    el.classList.remove("open");
    var idx = openStack.indexOf(id);
    if (idx > -1) openStack.splice(idx, 1);
  }
  function closeTopFullpage() {
    if (openStack.length) closeFullpageDirect(openStack[openStack.length - 1]);
  }
  window.addEventListener("popstate", function () { closeTopFullpage(); });
  document.querySelectorAll('.fullpage [id$="-back-btn"]').forEach(function (btn) {
    btn.addEventListener("click", function () { history.back(); });
  });

  /* ---------------------------------------------------------------- */
  /* Font scaling — floor guarantees nothing ever renders below 19px   */
  /* ---------------------------------------------------------------- */
  function setFontScale(v) {
    v = Math.min(CFG.FS_MAX, Math.max(CFG.FS_MIN, Math.round(v * 10) / 10));
    document.documentElement.style.setProperty("--fs-scale", v);
    var pctEl = document.getElementById("fontsize-pct");
    if (pctEl) pctEl.textContent = Math.round(v * 100) + "%";
  }
  function currentFontScale() {
    var val = getComputedStyle(document.documentElement).getPropertyValue("--fs-scale");
    return parseFloat(val) || 1.1;
  }

  /* ---------------------------------------------------------------- */
  /* Home / series select — reads window.TRIVIA_SERIES                 */
  /* ---------------------------------------------------------------- */
  function getSeriesList() {
    var reg = window.TRIVIA_SERIES || {};
    return Object.keys(reg).map(function (k) { return reg[k]; }).sort(function (a, b) { return a.order - b.order; });
  }

  function renderHome() {
    var list = getSeriesList();
    if (!list.length) {
      els.seriesGrid.innerHTML = '<p style="font-size:19px;color:var(--text-muted);">No series modules are loaded.</p>';
      return;
    }
    var html = "";
    list.forEach(function (s, i) { html += s.renderCard(i + 1); });
    els.seriesGrid.innerHTML = html;
    els.seriesGrid.querySelectorAll(".series-card").forEach(function (btn) {
      attachRipple(btn, false);
      btn.addEventListener("click", function () { startSeries(btn.getAttribute("data-series-key")); });
    });
  }

  function showHome() {
    clearTimer();
    hideVerseBanner();
    els.homeView.style.display = "block";
    els.quizView.style.display = "none";
    els.endView.style.display = "none";
    els.statbar.style.display = "none";
    els.progressTrack.style.display = "none";
    els.seal.classList.remove("show");
  }

  /* ---------------------------------------------------------------- */
  /* Quiz engine                                                        */
  /* ---------------------------------------------------------------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function buildRound(seriesKey) {
    var series = window.TRIVIA_SERIES[seriesKey];
    return shuffle(series.questions).map(function (q) {
      var optionObjs = q.options.map(function (text, idx) { return { text: text, isCorrect: idx === q.correct }; });
      var shuffledOpts = shuffle(optionObjs);
      return {
        cat: q.cat, diff: q.diff, text: q.text, verse: q.verse,
        options: shuffledOpts.map(function (o) { return o.text; }),
        correctIndex: shuffledOpts.findIndex(function (o) { return o.isCorrect; })
      };
    });
  }

  function initState(seriesKey) {
    state = {
      seriesKey: seriesKey,
      questions: buildRound(seriesKey),
      index: 0, score: 0, streak: 0, bestStreak: 0, correctCount: 0,
      timerHandle: null, answered: false, catStats: {}
    };
  }

  function letterFor(i) { return ["A", "B", "C", "D"][i]; }

  function renderStats() {
    els.scoreText.textContent = state.score;
    els.streakText.textContent = state.streak;
    els.questionCounter.textContent = (state.index + 1) + " / " + state.questions.length;
    els.progressFill.style.width = ((state.index / state.questions.length) * 100) + "%";
  }

  function startSeries(seriesKey) {
    if (!window.TRIVIA_SERIES || !window.TRIVIA_SERIES[seriesKey]) {
      showToast("That series module is not loaded.");
      return;
    }
    initState(seriesKey);
    els.homeView.style.display = "none";
    els.endView.style.display = "none";
    els.quizView.style.display = "block";
    els.statbar.style.display = "flex";
    els.progressTrack.style.display = "block";
    loadQuestion();
  }

  function loadQuestion() {
    clearTimer();
    els.seal.classList.remove("show");
    state.answered = false;
    var q = state.questions[state.index];

    els.categoryTag.textContent = q.cat;
    els.difficultyTag.textContent = q.diff.toUpperCase();
    els.questionText.textContent = q.text;
    els.feedbackRow.textContent = "";
    els.feedbackRow.className = "feedback-row";

    els.optionsWrap.innerHTML = "";
    q.options.forEach(function (optText, i) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = '<span class="letter">' + letterFor(i) + '</span><span>' + optText + '</span>';
      btn.addEventListener("click", function () { handleAnswer(i); });
      attachRipple(btn, false);
      els.optionsWrap.appendChild(btn);
    });

    renderStats();
    startTimer();
  }

  function startTimer() {
    els.timerFill.style.transition = "none";
    els.timerFill.style.width = "100%";
    requestAnimationFrame(function () {
      els.timerFill.style.transition = "width " + CFG.QUESTION_TIME_MS + "ms linear";
      els.timerFill.style.width = "0%";
    });
    state.timerHandle = setTimeout(function () {
      if (!state.answered) handleAnswer(-1);
    }, CFG.QUESTION_TIME_MS);
  }
  function clearTimer() { if (state.timerHandle) { clearTimeout(state.timerHandle); state.timerHandle = null; } }

  function checkIconSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#1E9E5A"/><path d="M8 12.5L10.5 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function xIconSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#E0453C"/><path d="M9 9L15 15M15 9L9 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function handleAnswer(selectedIndex) {
    if (state.answered) return;
    state.answered = true;
    clearTimer();

    var q = state.questions[state.index];
    var buttons = els.optionsWrap.querySelectorAll(".option-btn");
    buttons.forEach(function (b) { b.disabled = true; });

    var stats = state.catStats[q.cat] || { correct: 0, total: 0 };
    stats.total++;
    var isCorrect = selectedIndex === q.correctIndex;

    if (buttons[q.correctIndex]) buttons[q.correctIndex].classList.add("correct");
    if (selectedIndex >= 0 && selectedIndex !== q.correctIndex && buttons[selectedIndex]) buttons[selectedIndex].classList.add("incorrect");

    if (isCorrect) {
      var pts = CFG.POINTS[q.diff] || 10;
      state.streak++; state.correctCount++; stats.correct++;
      if (state.streak % CFG.STREAK_BONUS_EVERY === 0) pts += CFG.STREAK_BONUS_POINTS;
      state.score += pts;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      els.feedbackRow.className = "feedback-row correct";
      els.feedbackRow.innerHTML = checkIconSVG() + "<span>Correct! +" + pts + " points</span>";
      els.seal.classList.add("show");
    } else {
      state.streak = 0;
      var msg = selectedIndex === -1 ? "Time's up!" : "Not quite.";
      els.feedbackRow.className = "feedback-row incorrect";
      els.feedbackRow.innerHTML = xIconSVG() + "<span>" + msg + "</span>";
    }

    state.catStats[q.cat] = stats;
    showVerseBanner(q.verse);
    renderStats();

    setTimeout(function () {
      state.index++;
      if (state.index >= state.questions.length) showEndScreen();
      else loadQuestion();
    }, CFG.NEXT_DELAY_MS);
  }

  function gradeFor(pct) {
    if (pct >= 90) return { title: "Kingdom Sage", sub: "Your knowledge of the Word runs deep." };
    if (pct >= 75) return { title: "Bible Scholar", sub: "A strong, well-studied performance." };
    if (pct >= 55) return { title: "Faithful Disciple", sub: "Solid grasp — a little more study and you'll master it." };
    if (pct >= 35) return { title: "Growing Believer", sub: "A good start. Keep reading and you'll grow fast." };
    return { title: "Mustard Seed Beginner", sub: "Every scholar starts small — try again!" };
  }

  function showEndScreen() {
    els.progressFill.style.width = "100%";
    els.quizView.style.display = "none";
    els.endView.style.display = "block";
    els.seal.classList.remove("show");

    var total = state.questions.length;
    var pct = Math.round((state.correctCount / total) * 100);
    var grade = gradeFor(pct);

    els.endTitle.textContent = grade.title;
    els.endSub.textContent = grade.sub;
    els.finalScore.textContent = state.score;
    els.finalAccuracy.textContent = pct + "%";
    els.finalStreak.textContent = state.bestStreak;

    els.categoryBreakdown.innerHTML = "";
    var weakestCat = null, weakestPct = 101;
    Object.keys(state.catStats).sort().forEach(function (cat) {
      var s = state.catStats[cat];
      var catPct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
      if (catPct < weakestPct) { weakestPct = catPct; weakestCat = cat; }
      var row = document.createElement("div");
      row.className = "cat-row";
      row.innerHTML = '<span>' + cat + '</span><span class="cat-bar-track"><span class="cat-bar-fill" style="width:' + catPct + '%;"></span></span><span>' + s.correct + '/' + s.total + '</span>';
      els.categoryBreakdown.appendChild(row);
    });

    lastCompleted = { seriesKey: state.seriesKey, weakestCat: weakestCat };
    updateSideReflection();
    fireConfetti(pct >= 75 ? 90 : 55);
  }

  /* ---------------------------------------------------------------- */
  /* Confetti                                                           */
  /* ---------------------------------------------------------------- */
  function fireConfetti(count) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);
    var colors = ["#1877F2", "#C9A227", "#1E9E5A", "#E0453C", "#0F1216"];
    for (var i = 0; i < count; i++) {
      var el = document.createElement("span");
      el.className = "confetti-piece";
      el.style.left = (Math.random() * 100) + "%";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (2 + Math.random() * 1.6) + "s";
      el.style.animationDelay = (Math.random() * 0.5) + "s";
      el.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
      if (Math.random() > 0.5) el.style.borderRadius = "50%";
      container.appendChild(el);
    }
    setTimeout(function () { container.remove(); }, 4200);
  }

  /* ---------------------------------------------------------------- */
  /* Shared avatar + bio helpers (used by Team page and Developer page) */
  /* ---------------------------------------------------------------- */
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function initialsFor(name) {
    var clean = name.replace(/[\[\]]/g, "");
    var parts = clean.split(/[\s\/]+/).filter(Boolean);
    if (!parts.length || clean.indexOf("Team Member") !== -1) return null;
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }
  function personIconSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 20C5.5 16.5 8.3 14.5 12 14.5C15.7 14.5 18.5 16.5 19.5 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }
  function whatsappIconSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:18px;height:18px;flex-shrink:0;"><path d="M12 3.5C7.3 3.5 3.5 7.3 3.5 12C3.5 13.6 3.9 15.1 4.7 16.3L3.7 19.8C3.6 20.2 4 20.6 4.4 20.5L8 19.4C9.2 20.1 10.6 20.5 12 20.5C16.7 20.5 20.5 16.7 20.5 12C20.5 7.3 16.7 3.5 12 3.5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 10.2C9.4 11.7 10.3 12.9 11.8 13.5C12 13.6 12.2 13.5 12.3 13.4L13 12.6C13.2 12.4 13.4 12.4 13.6 12.5C14.1 12.8 14.7 13 15.3 13.2C15.5 13.3 15.6 13.4 15.6 13.6V14.9C15.6 15.2 15.4 15.4 15.1 15.4C11.7 15.6 8.6 12.7 8.4 9.2C8.4 8.9 8.6 8.7 8.9 8.7H10.2C10.4 8.7 10.5 8.8 10.6 9C10.8 9.6 11 10.2 11.3 10.7C11.4 10.9 11.4 11.1 11.2 11.3L9 10.2Z" fill="white"/></svg>';
  }

  /* Renders a static frame + a SEPARATE rotating ring around the border.
     The photo itself (img + fallback) is never animated. gearRing=true
     swaps the smooth halo for a toothed "gear" ring (Developer page). */
  function avatarBlockHtml(name, photoUrl, sizeClass, gearRing) {
    var initials = initialsFor(name);
    var fallbackInner = initials ? initials : personIconSVG();
    return (
      '<div class="avatar-block' + (sizeClass ? ' ' + sizeClass : '') + '">' +
        '<div class="avatar-spin' + (gearRing ? ' gear' : '') + '"></div>' +
        '<div class="avatar-frame">' +
          '<div class="avatar-photo">' +
            '<img class="avatar-img" src="' + escapeHtml(photoUrl || "") + '" alt="' + escapeHtml(name) + '" onload="this.style.opacity=1" onerror="this.style.opacity=0">' +
            '<span class="avatar-fallback">' + fallbackInner + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  var bioIdCounter = 0;
  function bioBlockHtml(bio, extraClass) {
    bioIdCounter++;
    var id = "bio-" + bioIdCounter;
    return (
      '<p class="bio-text' + (extraClass ? ' ' + extraClass : '') + '" id="' + id + '">' + bio + '</p>' +
      '<button class="show-more-btn" data-target="' + id + '">Show more</button>'
    );
  }
  function wireShowMore(container) {
    container.querySelectorAll(".show-more-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-target"));
        var expanded = target.classList.toggle("expanded");
        btn.textContent = expanded ? "Show less" : "Show more";
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Our Team page                                                      */
  /* ---------------------------------------------------------------- */
  var TEAM = {
    founder: {
      name: "Jesus Is Lord",
      photo: "",
      badges: ["Founder", "Lead Developer", "Full Access"],
      bio: "Founder and lead full-stack developer of Chris Ministries Online Community (CEAM), building Android-first PWAs for gospel outreach, Biblical education, and global ministry impact.",
      portfolioUrl: "#",
      whatsappChannelUrl: "#"
    },
    members: [
      { title: "Rev. Dr.", name: "Chris Victor / Johnson, PhD", role: "Ministry Director & Founder of CEAM", photo: "", bio: "Provides spiritual oversight and vision for Chris Ministries Online Community, guiding our educational and outreach programs." },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. UI/UX Designer]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Backend Engineer]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Bible Curriculum Lead]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Outreach Coordinator]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Worship & Media Lead]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Translator / Localization]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Volunteer Coordinator]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Prayer Ministry Lead]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Finance & Operations]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. Social Media Manager]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" },
      { title: "[Title]", name: "[Team Member Name]", role: "[Role — e.g. IT & Systems Support]", photo: "", bio: "[Short bio — 1–2 sentences about this person's role and heart for ministry.]" }
    ]
  };

  function renderTeamPage() {
    var container = els.teamPageContent;
    var f = TEAM.founder;
    bioIdCounter = 0;

    var html = "";
    html += '<div class="founder-hero">';
    html += avatarBlockHtml(f.name, f.photo, "large", false);
    html += '<div class="founder-badge"><svg viewBox="0 0 24 24" fill="none"><path d="M4 17L6 8L9.5 12.5L12 6L14.5 12.5L18 8L20 17H4Z" fill="white"/></svg></div>';
    html += '<p class="founder-name">' + escapeHtml(f.name) + '</p>';
    html += '<div class="founder-badges">' + f.badges.map(function (b) { return '<span class="office-badge">' + escapeHtml(b) + '</span>'; }).join("") + '</div>';
    html += bioBlockHtml(f.bio, "founder-bio");
    html += '<div class="founder-actions">';
    html += '<a class="btn btn-primary btn-sm" href="' + f.portfolioUrl + '" target="_blank" rel="noopener">View Portfolio</a>';
    html += '<a class="btn btn-sm btn-whatsapp" href="' + f.whatsappChannelUrl + '" target="_blank" rel="noopener">' + whatsappIconSVG() + '<span>Follow WhatsApp Channel</span></a>';
    html += '</div></div>';

    html += '<p class="team-section-label">Ministry Team</p><div class="team-grid">';
    TEAM.members.forEach(function (m) {
      html += '<div class="team-card">';
      html += avatarBlockHtml(m.name, m.photo, "", false);
      html += '<p class="team-title">' + escapeHtml(m.title) + '</p>';
      html += '<p class="team-name">' + escapeHtml(m.name) + '</p>';
      html += '<p class="team-role">' + escapeHtml(m.role) + '</p>';
      html += bioBlockHtml(m.bio, "team-bio");
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
    initRipples(container);
    wireShowMore(container);
  }

  /* ---------------------------------------------------------------- */
  /* Developer page — dedicated 160x160 photo, gear ring, img ready    */
  /* ---------------------------------------------------------------- */
  var DEVELOPER = {
    name: "Jesus Is Lord",
    photo: "",
    role: "Founder & Lead Developer",
    bio: "Builds Android-first Progressive Web Apps and Google Apps Script backends for Chris Ministries Online Community (CEAM) — covering ministry tools, education platforms, and community systems.",
    portfolioUrl: "#",
    whatsappChannelUrl: "#"
  };

  function renderDeveloperPage() {
    var container = els.developerPageContent;
    var d = DEVELOPER;
    bioIdCounter = 0;

    var html = '<div class="dev-hero">';
    html += avatarBlockHtml(d.name, d.photo, "dev", true);
    html += '<p class="dev-name">' + escapeHtml(d.name) + '</p>';
    html += '<p class="dev-role">' + escapeHtml(d.role) + '</p>';
    html += bioBlockHtml(d.bio, "founder-bio");
    html += '<div class="founder-actions">';
    html += '<a class="btn btn-primary btn-sm" href="' + d.portfolioUrl + '" target="_blank" rel="noopener">View Portfolio</a>';
    html += '<a class="btn btn-sm btn-whatsapp" href="' + d.whatsappChannelUrl + '" target="_blank" rel="noopener">' + whatsappIconSVG() + '<span>Follow WhatsApp Channel</span></a>';
    html += '</div></div>';

    container.innerHTML = html;
    initRipples(container);
    wireShowMore(container);
  }

  /* ---------------------------------------------------------------- */
  /* Left menu (About Us, Mission, Our Team, Developer, Game, Tech,    */
  /* Support, Contact Us with 4 CTA icons)                              */
  /* ---------------------------------------------------------------- */
  var ICONS = {
    team: '<circle cx="9" cy="8" r="2.6" stroke="currentColor" stroke-width="1.6"/><circle cx="16" cy="9" r="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 19c.6-3 3-5 6-5s5.4 2 6 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M15 14.2c2.4.3 4.2 2 4.7 4.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    aboutus: '<rect x="5" y="3.5" width="14" height="17" rx="1.2" stroke="currentColor" stroke-width="1.6"/><path d="M9 8h1.4M13.6 8H15M9 12h1.4M13.6 12H15M9 16h1.4M13.6 16H15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    mission: '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    developer: '<path d="M9 8L4.5 12L9 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 8L19.5 12L15 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    game: '<circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.6"/><path d="M9.6 9.4c.3-1.1 1.3-1.8 2.5-1.8c1.4 0 2.5 1 2.5 2.2c0 1-.6 1.5-1.5 2.1c-.7.5-1 .9-1 1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="16.6" r="0.9" fill="currentColor"/>',
    tech: '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6M17.7 17.7l-1.6-1.6M7.9 7.9L6.3 6.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    support: '<path d="M12 19.5S3.8 14.6 3.8 8.9C3.8 6 6 4 8.5 4c1.6 0 3 .8 3.5 2.2C12.5 4.8 13.9 4 15.5 4C18 4 20.2 6 20.2 8.9C20.2 14.6 12 19.5 12 19.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    contact: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 6.5L12 12.5L19.5 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    textsize: '<path d="M6 17L9.5 7.5H11L14.5 17M7 14H13.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17V11C16 9.9 16.9 9 18 9C19.1 9 20 9.9 20 11V17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    share: '<circle cx="6" cy="12" r="2.3" stroke="currentColor" stroke-width="1.6"/><circle cx="17.5" cy="6" r="2.3" stroke="currentColor" stroke-width="1.6"/><circle cx="17.5" cy="18" r="2.3" stroke="currentColor" stroke-width="1.6"/><path d="M8 10.8L15.6 7.2M8 13.2L15.6 16.8" stroke="currentColor" stroke-width="1.6"/>',
    install: '<path d="M12 3.5V14.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8 11L12 15L16 11" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 16.5V18C4.5 19.1 5.4 20 6.5 20H17.5C18.6 20 19.5 19.1 19.5 18V16.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    reflection: '<path d="M12 6.5C10.5 5 8 4.5 4.5 4.5V17.5C8 17.5 10.5 18 12 19.5C13.5 18 16 17.5 19.5 17.5V4.5C16 4.5 13.5 5 12 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 6.5V19.5" stroke="currentColor" stroke-width="1.5"/>',
    feedback: '<path d="M4 5.5H20V15.5H9L5.5 18.5V15.5H4V5.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
  };
  function iconSvg(key) { return '<svg class="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' + ICONS[key] + '</svg>'; }
  var CHEVRON = '<svg class="chevron" viewBox="0 0 24 24" fill="none"><path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function phoneIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 4.5L9.5 4.5L11 8.5L8.8 10.2C9.6 12.1 11.1 13.6 13 14.4L14.7 12.2L18.7 13.7V16.7C18.7 18 17.6 19 16.3 18.9C10.4 18.4 5.8 13.8 5.3 7.9C5.2 6.6 6.2 5.5 7.5 5.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function emailIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="white" stroke-width="1.7"/><path d="M4.5 6.5L12 12.5L19.5 6.5" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function facebookIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 21V13.5H17L17.5 10.2H14.5V8.3C14.5 7.4 14.8 6.7 16.1 6.7H17.6V3.8C17.3 3.8 16.3 3.7 15.2 3.7C12.8 3.7 11.2 5.2 11.2 8V10.2H8.5V13.5H11.2V21H14.5Z" fill="white"/></svg>';
  }
  function whatsappIconWhiteSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5C7.3 3.5 3.5 7.3 3.5 12C3.5 13.6 3.9 15.1 4.7 16.3L3.7 19.8C3.6 20.2 4 20.6 4.4 20.5L8 19.4C9.2 20.1 10.6 20.5 12 20.5C16.7 20.5 20.5 16.7 20.5 12C20.5 7.3 16.7 3.5 12 3.5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 10.2C9.4 11.7 10.3 12.9 11.8 13.5C12 13.6 12.2 13.5 12.3 13.4L13 12.6C13.2 12.4 13.4 12.4 13.6 12.5C14.1 12.8 14.7 13 15.3 13.2C15.5 13.3 15.6 13.4 15.6 13.6V14.9C15.6 15.2 15.4 15.4 15.1 15.4C11.7 15.6 8.6 12.7 8.4 9.2C8.4 8.9 8.6 8.7 8.9 8.7H10.2C10.4 8.7 10.5 8.8 10.6 9C10.8 9.6 11 10.2 11.3 10.7C11.4 10.9 11.4 11.1 11.2 11.3L9 10.2Z" fill="white"/></svg>';
  }

  function buildMenuItem(key, label, panelId, panelHtml, navigate) {
    var item = (
      '<button class="menu-item" ' + (navigate ? 'id="' + navigate + '"' : 'data-panel="' + panelId + '"') + '>' +
        '<span class="menu-item-left">' + iconSvg(key) + '<span>' + label + '</span></span>' + CHEVRON +
      '</button>'
    );
    var panel = panelId ? '<div class="menu-panel" id="' + panelId + '">' + (panelHtml || "") + '</div>' : "";
    return item + panel;
  }

  function renderLeftMenu() {
    var html = "";
    html += buildMenuItem("team", "Our Team", null, null, "team-open-btn");
    html += buildMenuItem("developer", "About Developer", null, null, "developer-open-btn");
    html += buildMenuItem("aboutus", "About Us", "p-about-us",
      '<p>Bible Trivia Master is built by <strong>Chris Ministries Online Community (CEAM)</strong>, a ministry dedicated to Christian education and digital gospel outreach, led by Rev. Dr. Chris Victor/Johnson, PhD.</p>');
    html += buildMenuItem("mission", "About Our Mission", "p-mission",
      '<p>Our mission is to make Biblical education accessible to everyone, everywhere, using simple digital tools — helping people grow in their knowledge of God\'s Word.</p>');
    html += buildMenuItem("game", "About This Game", "p-game",
      '<p>Three series, 12 questions each, across three categories. Answer within 15 seconds; correct answers earn points by difficulty, and every third correct answer in a row earns a streak bonus. A scripture reference pops up after every answer.</p>');
    html += buildMenuItem("tech", "About Our Tech Service", "p-tech",
      '<p>Built as a lightweight, modular Android-first PWA — no frameworks, no CDN dependency — hosted free on GitHub Pages.</p>');
    html += buildMenuItem("support", "Support Us", "p-support",
      '<p>Every tool we release is free for ministries, teachers, and learners. <em>[Add your giving link or support email here.]</em></p>');
    html += buildMenuItem("contact", "Contact Us", "p-contact",
      '<div class="contact-row">' +
        '<a class="contact-cta email" href="mailto:' + CFG.CONTACT_EMAIL + '"><span class="contact-cta-circle">' + emailIconSvg() + '</span><span class="contact-cta-label">Email</span></a>' +
        '<a class="contact-cta phone" href="tel:' + CFG.CONTACT_PHONE + '"><span class="contact-cta-circle">' + phoneIconSvg() + '</span><span class="contact-cta-label">Phone</span></a>' +
        '<a class="contact-cta whatsapp" href="' + CFG.CONTACT_WHATSAPP_URL + '" target="_blank" rel="noopener"><span class="contact-cta-circle">' + whatsappIconWhiteSvg() + '</span><span class="contact-cta-label">WhatsApp</span></a>' +
        '<a class="contact-cta facebook" href="' + CFG.CONTACT_FACEBOOK_URL + '" target="_blank" rel="noopener"><span class="contact-cta-circle">' + facebookIconSvg() + '</span><span class="contact-cta-label">Facebook</span></a>' +
      '</div>');

    els.leftMenuContent.innerHTML = html;
    wireMenuAccordion(els.leftMenuContent);
    initRipples(els.leftMenuContent);

    var teamBtn = document.getElementById("team-open-btn");
    if (teamBtn) teamBtn.addEventListener("click", function () {
      closeFullpageDirect("left-menu-page");
      renderTeamPage();
      openFullpage("team-page");
    });
    var devBtn = document.getElementById("developer-open-btn");
    if (devBtn) devBtn.addEventListener("click", function () {
      closeFullpageDirect("left-menu-page");
      renderDeveloperPage();
      openFullpage("developer-page");
    });
  }

  /* ---------------------------------------------------------------- */
  /* Right menu (Text Size, Share, Install, Reflection, Feedback,      */
  /* Referral Link — the last one only if referral.js is present)      */
  /* ---------------------------------------------------------------- */
  function renderRightMenu() {
    var html = "";
    var isDark = document.documentElement.getAttribute("data-mode") === "dark";
    var currentAccent = document.documentElement.getAttribute("data-accent") || "connect";
    var ACCENTS = [
      { key: "connect", label: "Connect Blue", hex: "#1877F2" },
      { key: "clay", label: "Warm Clay", hex: "#CC785C" },
      { key: "tealgreen", label: "Teal Green", hex: "#0B8A5E" },
      { key: "indigo", label: "Indigo", hex: "#5865F2" },
      { key: "graphite", label: "Graphite", hex: "#3A3A3C" },
      { key: "crimson", label: "Crimson", hex: "#E50914" },
      { key: "sunburst", label: "Sunburst", hex: "#C79A00" },
      { key: "skycyan", label: "Sky Cyan", hex: "#1DA1F2" },
      { key: "violet", label: "Violet", hex: "#9146FF" },
      { key: "coral", label: "Coral", hex: "#F0563D" }
    ];
    html += buildMenuItem("textsize", "Appearance", "p-appearance",
      '<div class="appearance-row"><span>Dark Mode</span><button class="switch' + (isDark ? ' on' : '') + '" id="dark-mode-switch"><span class="knob"></span></button></div>' +
      '<div class="appearance-row" style="padding-bottom:0;"><span>Accent Color</span></div>' +
      '<div class="accent-row" id="accent-row">' +
        ACCENTS.map(function (a) {
          return '<button class="accent-item' + (a.key === currentAccent ? ' active' : '') + '" data-accent-key="' + a.key + '">' +
            '<span class="accent-swatch" style="background:' + a.hex + ';"></span><span class="accent-item-label">' + a.label + '</span></button>';
        }).join("") +
      '</div>' +
      '<div class="appearance-row" style="border-top:1px solid var(--border); margin-top:4px;"><span>Text Size</span>' +
      '<div class="fontsize-row" style="margin:0;"><button class="appbar-icon" id="font-dec" aria-label="Decrease text size" style="background:var(--surface);">A−</button>' +
      '<span class="fontsize-pct" id="fontsize-pct">' + Math.round(currentFontScale() * 100) + '%</span>' +
      '<button class="appbar-icon" id="font-inc" aria-label="Increase text size" style="background:var(--surface);">A+</button></div></div>');
    html += buildMenuItem("share", "Share App", "p-share",
      '<p class="util-desc">Send this game to a friend or family member.</p><div style="padding:0 16px;"><button class="btn btn-primary btn-sm" id="share-btn">Share Bible Trivia Master</button></div>');
    html += buildMenuItem("install", "Install App", "p-install",
      '<p class="util-desc">Add Bible Trivia Master to your home screen.</p><div style="padding:0 16px;"><button class="btn btn-primary btn-sm" id="install-btn">Install App</button></div>');
    html += buildMenuItem("reflection", "Reflection", "p-reflection",
      '<div style="padding:0 16px;">' +
        '<p class="bio-text" id="side-reflection-verse" style="-webkit-line-clamp:unset;overflow:visible;display:block;">Complete a series to receive a reflection tailored to it.</p>' +
        '<p class="bio-text" id="side-reflection-note" style="-webkit-line-clamp:unset;overflow:visible;display:block;"></p>' +
        '<label class="reflection-label" for="side-reflection-input">What stood out to you?</label>' +
        '<textarea class="reflection-textarea" id="side-reflection-input" placeholder="Write a thought or a short prayer..."></textarea>' +
        '<div class="reflection-private">Private to this session — not saved or sent anywhere.</div>' +
      '</div>');
    html += buildMenuItem("feedback", "Feedback", "p-feedback",
      '<div style="padding:0 16px;">' +
        '<p class="util-desc" style="margin:0 0 10px;">Tell us what you loved or what could be better.</p>' +
        '<textarea class="feedback-textarea" id="feedback-input" placeholder="Your feedback..."></textarea>' +
        '<button class="btn btn-primary btn-sm" id="feedback-send-btn" style="margin-top:10px;">Send Feedback</button>' +
      '</div>');

    if (window.TRIVIA_MODULES && window.TRIVIA_MODULES.referral) {
      var ref = window.TRIVIA_MODULES.referral;
      html += buildMenuItem("referral", ref.label, "p-referral", '<div style="padding:0 16px;">' + ref.renderPanel() + '</div>');
    }

    els.rightMenuContent.innerHTML = html;
    wireMenuAccordion(els.rightMenuContent);
    initRipples(els.rightMenuContent);

    var darkSwitch = document.getElementById("dark-mode-switch");
    if (darkSwitch) darkSwitch.addEventListener("click", function () {
      var nowDark = document.documentElement.getAttribute("data-mode") === "dark";
      if (nowDark) { document.documentElement.removeAttribute("data-mode"); darkSwitch.classList.remove("on"); }
      else { document.documentElement.setAttribute("data-mode", "dark"); darkSwitch.classList.add("on"); }
    });
    var accentRow = document.getElementById("accent-row");
    if (accentRow) accentRow.querySelectorAll(".accent-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var key = item.getAttribute("data-accent-key");
        if (key === "connect") document.documentElement.removeAttribute("data-accent");
        else document.documentElement.setAttribute("data-accent", key);
        accentRow.querySelectorAll(".accent-item").forEach(function (b) { b.classList.remove("active"); });
        item.classList.add("active");
      });
    });

    var fontDec = document.getElementById("font-dec");
    var fontInc = document.getElementById("font-inc");
    if (fontDec) fontDec.addEventListener("click", function () { setFontScale(currentFontScale() - CFG.FS_STEP); });
    if (fontInc) fontInc.addEventListener("click", function () { setFontScale(currentFontScale() + CFG.FS_STEP); });

    var shareBtn = document.getElementById("share-btn");
    if (shareBtn) shareBtn.addEventListener("click", handleShare);
    var installBtn = document.getElementById("install-btn");
    if (installBtn) installBtn.addEventListener("click", handleInstall);

    var feedbackBtn = document.getElementById("feedback-send-btn");
    if (feedbackBtn) feedbackBtn.addEventListener("click", function () {
      var input = document.getElementById("feedback-input");
      var text = input ? input.value.trim() : "";
      if (!text) { showToast("Write a note before sending."); return; }
      var subject = encodeURIComponent("Bible Trivia Master — Feedback");
      var body = encodeURIComponent(text);
      window.location.href = "mailto:" + CFG.CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    });

    if (window.TRIVIA_MODULES && window.TRIVIA_MODULES.referral) {
      window.TRIVIA_MODULES.referral.init(showToast);
    }

    updateSideReflection();
  }

  function wireMenuAccordion(scope) {
    scope.querySelectorAll(".menu-item[data-panel]").forEach(function (item) {
      item.addEventListener("click", function () {
        var panel = document.getElementById(item.getAttribute("data-panel"));
        var wasOpen = panel.classList.contains("open");
        scope.querySelectorAll(".menu-panel").forEach(function (p) { p.classList.remove("open"); });
        scope.querySelectorAll(".menu-item[data-panel]").forEach(function (b) { b.classList.remove("active"); });
        if (!wasOpen) { panel.classList.add("open"); item.classList.add("active"); }
      });
    });
  }

  function updateSideReflection() {
    var verseEl = document.getElementById("side-reflection-verse");
    var noteEl = document.getElementById("side-reflection-note");
    if (!verseEl) return;
    if (!lastCompleted) {
      verseEl.textContent = "Complete a series to receive a reflection tailored to it. In the meantime — take a moment with James 1:22: be doers of the word, not hearers only.";
      noteEl.textContent = "";
      return;
    }
    var series = window.TRIVIA_SERIES[lastCompleted.seriesKey];
    verseEl.textContent = series ? series.reflection : "";
    noteEl.textContent = lastCompleted.weakestCat ? ("You found " + lastCompleted.weakestCat + " most challenging last round — a good place to spend a little extra time this week.") : "";
  }

  /* ---------------------------------------------------------------- */
  /* Share / Install (no browser alert/confirm/prompt used anywhere)   */
  /* ---------------------------------------------------------------- */
  function currentShareUrl() { return window.location.href.split("?")[0]; }

  function handleShare() {
    var data = { title: "Bible Trivia Master", text: "Test your Bible knowledge with Bible Trivia Master!", url: currentShareUrl() };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(data.url).then(function () { showToast("Link copied — share it anywhere!"); });
    } else {
      showToast("Copy this page's URL to share it.");
    }
  }

  var deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
  function handleInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(function () { deferredInstallPrompt = null; });
    } else {
      showToast("Use your browser menu → 'Add to Home Screen' / 'Install App'.");
    }
  }

  /* ---------------------------------------------------------------- */
  /* Wiring                                                             */
  /* ---------------------------------------------------------------- */
  els.menuToggle.addEventListener("click", function () {
    renderLeftMenu();
    openFullpage("left-menu-page");
  });
  els.moreToggle.addEventListener("click", function () {
    renderRightMenu();
    openFullpage("right-menu-page");
  });

  els.quizExitBtn.addEventListener("click", function () { openFullpage("exit-page"); });
  document.getElementById("exit-cancel-btn").addEventListener("click", function () { history.back(); });
  document.getElementById("exit-confirm-btn").addEventListener("click", function () {
    history.back();
    showHome();
  });

  els.playAgainBtn.addEventListener("click", function () { startSeries(state.seriesKey); });
  els.chooseSeriesBtn.addEventListener("click", function () { showHome(); });

  /* ---------------------------------------------------------------- */
  /* Service worker registration — real file, no CDN                   */
  /* ---------------------------------------------------------------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  /* ---------------------------------------------------------------- */
  /* Boot                                                               */
  /* ---------------------------------------------------------------- */
  renderHome();
  showHome();
  initRipples(document);
})();
