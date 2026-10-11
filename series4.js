/* Bible Trivia Master — Series 4 module.
   Self-contained: own CSS, own card HTML, own question data.
   Registers itself on window.TRIVIA_SERIES. Does NOT reference series1.js,
   series2.js, series3.js, or referral.js. */
(function () {
  "use strict";

  if (!document.getElementById("series4-module-style")) {
    var style = document.createElement("style");
    style.id = "series4-module-style";
    style.textContent = '.s4-badge{background:rgba(201,162,39,0.14);color:#9C7A1C;}';
    document.head.appendChild(style);
  }

  window.TRIVIA_SERIES = window.TRIVIA_SERIES || {};

  window.TRIVIA_SERIES.series4 = {
    key: "series4",
    order: 4,
    title: "Faith & the Early Letters",
    subtitle: "Women of faith, covenants & the epistles",
    categories: ["Women of Faith", "Covenants & Promises", "The Epistles"],
    reflection: "Series 4 traced faith across generations — in women who trusted God, in His covenant promises, and in the letters written to strengthen the church. Consider Hebrews 11:1: faith is the substance of things hoped for.",
    questions: [
      { cat: "Women of Faith", diff: "easy", text: "Who was the mother of Samuel, who prayed earnestly for a son?", options: ["Hannah", "Ruth", "Esther", "Deborah"], correct: 0, verse: "1 Samuel 1:27 — \"For this child I prayed; and the LORD hath given me my petition which I asked of him.\"" },
      { cat: "Women of Faith", diff: "medium", text: "Which Moabite woman left her homeland and said, 'Whither thou goest, I will go'?", options: ["Naomi", "Ruth", "Orpah", "Rahab"], correct: 1, verse: "Ruth 1:16 — \"For whither thou goest, I will go; and where thou lodgest, I will lodge: thy people shall be my people, and thy God my God.\"" },
      { cat: "Women of Faith", diff: "medium", text: "Which queen risked her life to save her people, saying 'if I perish, I perish'?", options: ["Esther", "Vashti", "Jezebel", "Athaliah"], correct: 0, verse: "Esther 4:16 — \"...so will I go in unto the king, which is not according to the law: and if I perish, I perish.\"" },
      { cat: "Women of Faith", diff: "hard", text: "Which judge and prophetess led Israel and sat under a palm tree to render judgment?", options: ["Miriam", "Huldah", "Deborah", "Jael"], correct: 2, verse: "Judges 4:4-5 — \"...she dwelt under the palm tree... and the children of Israel came up to her for judgment.\"" },
      { cat: "Covenants & Promises", diff: "easy", text: "What sign did God give Noah as a covenant never to flood the whole earth again?", options: ["A dove", "A rainbow", "An olive branch", "A star"], correct: 1, verse: "Genesis 9:13 — \"I do set my bow in the cloud, and it shall be for a token of a covenant between me and the earth.\"" },
      { cat: "Covenants & Promises", diff: "medium", text: "God promised Abraham his descendants would be as numerous as what two things?", options: ["Sand and rivers", "Stars and sand", "Mountains and valleys", "Clouds and rain"], correct: 1, verse: "Genesis 22:17 — \"...I will multiply thy seed as the stars of the heaven, and as the sand which is upon the sea shore.\"" },
      { cat: "Covenants & Promises", diff: "medium", text: "Through which prophet did God promise a 'new covenant' written on the heart?", options: ["Isaiah", "Jeremiah", "Ezekiel", "Joel"], correct: 1, verse: "Jeremiah 31:33 — \"...I will put my law in their inward parts, and write it in their hearts...\"" },
      { cat: "Covenants & Promises", diff: "hard", text: "What did God promise to David concerning his throne?", options: ["It would end with Solomon", "It would be established forever", "It would move to Egypt", "It would be given to a prophet"], correct: 1, verse: "2 Samuel 7:16 — \"And thine house and thy kingdom shall be established for ever before thee: thy throne shall be established for ever.\"" },
      { cat: "The Epistles", diff: "easy", text: "Who wrote most of the New Testament epistles?", options: ["Peter", "John", "Paul", "James"], correct: 2, verse: "Romans 1:1 — \"Paul, a servant of Jesus Christ, called to be an apostle, separated unto the gospel of God.\"" },
      { cat: "The Epistles", diff: "medium", text: "According to 1 Corinthians 13, which is the greatest of these three?", options: ["Faith", "Hope", "Charity (Love)", "Wisdom"], correct: 2, verse: "1 Corinthians 13:13 — \"And now abideth faith, hope, charity, these three; but the greatest of these is charity.\"" },
      { cat: "The Epistles", diff: "medium", text: "Which epistle says 'faith without works is dead'?", options: ["Romans", "Galatians", "James", "1 Peter"], correct: 2, verse: "James 2:26 — \"For as the body without the spirit is dead, so faith without works is dead also.\"" },
      { cat: "The Epistles", diff: "hard", text: "Which epistle was written by Paul from prison and says 'I can do all things through Christ'?", options: ["Ephesians", "Philippians", "Colossians", "1 Timothy"], correct: 1, verse: "Philippians 4:13 — \"I can do all things through Christ which strengtheneth me.\"" }
    ],
    renderCard: function (indexNumber) {
      var s = window.TRIVIA_SERIES.series4;
      return (
        '<button class="series-card" data-series-key="series4">' +
          '<div class="series-card-top"><span class="series-num">' + indexNumber + '</span><span class="series-badge s4-badge">12 Questions</span></div>' +
          '<h3>Series ' + indexNumber + ' — ' + s.title + '</h3>' +
          '<p>' + s.subtitle + '</p>' +
          '<div class="series-cats">' + s.categories.join(" • ") + '</div>' +
        '</button>'
      );
    }
  };
})();
