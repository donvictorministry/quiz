/* Bible Trivia Master — Series 3 module.
   Self-contained: own CSS, own card HTML, own question data.
   Registers itself on window.TRIVIA_SERIES. Does NOT reference series1.js,
   series2.js, or referral.js. Deleting this file simply removes Series 3
   from the home screen — nothing else breaks. */
(function () {
  "use strict";

  if (!document.getElementById("series3-module-style")) {
    var style = document.createElement("style");
    style.id = "series3-module-style";
    style.textContent =
      '.s3-badge{background:rgba(201,162,39,0.14);color:#9C7A1C;}';
    document.head.appendChild(style);
  }

  window.TRIVIA_SERIES = window.TRIVIA_SERIES || {};

  window.TRIVIA_SERIES.series3 = {
    key: "series3",
    order: 3,
    title: "Prophets & the Church",
    subtitle: "Prophets, Acts, Revelation & Wisdom",
    categories: ["Prophets", "Acts & Early Church", "Revelation & Wisdom"],
    reflection: "Series 3 explored the prophets and the early church. Reflect on 2 Timothy 3:16, which says all Scripture is God-breathed and useful for teaching.",
    questions: [
      { cat: "Prophets", diff: "hard", text: "Which king had a dream interpreted by Daniel, of a statue with a head of gold?", options: ["Nebuchadnezzar", "Belshazzar", "Darius", "Cyrus"], correct: 0, verse: "Daniel 2:31-32 — Nebuchadnezzar dreamed of a great statue." },
      { cat: "Prophets", diff: "medium", text: "Which prophet was taken up to heaven in a chariot of fire?", options: ["Elisha", "Elijah", "Isaiah", "Jeremiah"], correct: 1, verse: "2 Kings 2:11 — Elijah was taken up by a whirlwind and chariot of fire." },
      { cat: "Prophets", diff: "easy", text: "Which prophet was thrown into a den of lions?", options: ["Daniel", "Ezekiel", "Amos", "Hosea"], correct: 0, verse: "Daniel 6:16 — Daniel was cast into the den of lions." },
      { cat: "Prophets", diff: "medium", text: "Which prophet anointed both Saul and David as king of Israel?", options: ["Nathan", "Samuel", "Gad", "Ahijah"], correct: 1, verse: "1 Samuel 10:1; 16:13 — Samuel anointed both Saul and David." },
      { cat: "Acts & Early Church", diff: "hard", text: "Who is recorded as the first Christian martyr?", options: ["James", "Stephen", "Timothy", "Barnabas"], correct: 1, verse: "Acts 7:59-60 — Stephen was stoned for his faith." },
      { cat: "Acts & Early Church", diff: "medium", text: "On what day did the Holy Spirit come upon the believers, marking the birth of the church?", options: ["Passover", "Pentecost", "Sabbath", "Purim"], correct: 1, verse: "Acts 2:1-4 — The Holy Spirit came upon them at Pentecost." },
      { cat: "Acts & Early Church", diff: "easy", text: "Who was blinded by a light on the road to Damascus and later became an apostle?", options: ["Peter", "Saul (Paul)", "Barnabas", "Silas"], correct: 1, verse: "Acts 9:3-4 — Saul was confronted by a light on the road to Damascus." },
      { cat: "Acts & Early Church", diff: "easy", text: "Which apostle denied knowing Jesus three times?", options: ["John", "Peter", "Andrew", "Thomas"], correct: 1, verse: "Luke 22:61-62 — Peter remembered Jesus' word after denying Him three times." },
      { cat: "Revelation & Wisdom", diff: "easy", text: "Who wrote most of the Book of Proverbs?", options: ["David", "Solomon", "Moses", "Ezra"], correct: 1, verse: "Proverbs 1:1 — The proverbs of Solomon, son of David." },
      { cat: "Revelation & Wisdom", diff: "easy", text: "What is the last book of the Bible?", options: ["Jude", "Revelation", "Acts", "Malachi"], correct: 1, verse: "Revelation 1:1 — The revelation given to John." },
      { cat: "Revelation & Wisdom", diff: "medium", text: "Which book explores the meaning of life and repeatedly calls much of it 'vanity'?", options: ["Ecclesiastes", "Job", "Lamentations", "Song of Solomon"], correct: 0, verse: "Ecclesiastes 1:2 — Vanity of vanities, says the Preacher." },
      { cat: "Revelation & Wisdom", diff: "hard", text: "In the Book of Revelation, John wrote to how many churches?", options: ["Three", "Five", "Seven", "Twelve"], correct: 2, verse: "Revelation 1:4 — John wrote to the seven churches." }
    ],
    renderCard: function (indexNumber) {
      var s = window.TRIVIA_SERIES.series3;
      return (
        '<button class="series-card" data-series-key="series3">' +
          '<div class="series-card-top"><span class="series-num">' + indexNumber + '</span><span class="series-badge s3-badge">12 Questions</span></div>' +
          '<h3>Series ' + indexNumber + ' — ' + s.title + '</h3>' +
          '<p>' + s.subtitle + '</p>' +
          '<div class="series-cats">' + s.categories.join(" • ") + '</div>' +
        '</button>'
      );
    }
  };
})();
