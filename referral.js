/* Bible Trivia Master — Referral module.
   Self-contained: own CSS, own HTML, own JS. Registers itself on
   window.TRIVIA_MODULES.referral. Does NOT reference series1.js, series2.js,
   or series3.js. If this file is removed, the app simply skips the
   "Referral Link" menu item — nothing else breaks. */
(function () {
  "use strict";

  if (!document.getElementById("referral-module-style")) {
    var style = document.createElement("style");
    style.id = "referral-module-style";
    style.textContent =
      '.referral-row{display:flex;gap:8px;margin-bottom:6px;}' +
      '.referral-input{flex:1;min-width:0;padding:14px;border-radius:12px;border:1px solid var(--border);font-size:19px;color:var(--text);background:var(--surface);}';
    document.head.appendChild(style);
  }

  function currentShareUrl() {
    return window.location.href.split("?")[0];
  }

  window.TRIVIA_MODULES = window.TRIVIA_MODULES || {};

  window.TRIVIA_MODULES.referral = {
    label: "Referral Link",
    icon: '<path d="M9.5 14.5L14.5 9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M11 7.5L12.6 5.9C14 4.5 16.3 4.5 17.7 5.9C19.1 7.3 19.1 9.6 17.7 11L16.1 12.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M13 16.5L11.4 18.1C10 19.5 7.7 19.5 6.3 18.1C4.9 16.7 4.9 14.4 6.3 13L7.9 11.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    renderPanel: function () {
      return (
        '<p class="util-desc" style="margin:0 0 10px;">Copy your link and invite others to play.</p>' +
        '<div class="referral-row">' +
          '<input type="text" class="referral-input" id="referral-input" readonly>' +
          '<button class="btn btn-primary btn-sm" id="referral-copy-btn">Copy</button>' +
        '</div>'
      );
    },
    init: function (showToastFn) {
      var input = document.getElementById("referral-input");
      var btn = document.getElementById("referral-copy-btn");
      if (!input || !btn) return;
      input.value = currentShareUrl() + "?ref=friend";
      btn.addEventListener("click", function () {
        input.select();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(input.value).then(function () {
            if (showToastFn) showToastFn("Referral link copied!");
          });
        } else {
          try {
            document.execCommand("copy");
            if (showToastFn) showToastFn("Referral link copied!");
          } catch (e) {
            if (showToastFn) showToastFn("Copy failed — select and copy manually.");
          }
        }
      });
    }
  };
})();
