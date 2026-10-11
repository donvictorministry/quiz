/* Bible Trivia Master — Series 1 module.
   Self-contained: own CSS, own card HTML, own question data.
   Registers itself on window.TRIVIA_SERIES. Does NOT reference series2.js,
   series3.js, or referral.js. Deleting this file simply removes Series 1
   from the home screen — nothing else breaks. */
(function () {
  "use strict";

  if (!document.getElementById("series1-module-style")) {
    var style = document.createElement("style");
    style.id = "series1-module-style";
    style.textContent =
      '.s1-badge{background:rgba(201,162,39,0.14);color:#9C7A1C;}';
    document.head.appendChild(style);
  }

  window.TRIVIA_SERIES = window.TRIVIA_SERIES || {};

  window.TRIVIA_SERIES.series1 = {
    key: "series1",
    order: 1,
    title: "Foundations",
    subtitle: "Creation, Exodus & the Kings of Israel",
    categories: ["Creation & Patriarchs", "Exodus & Law", "Judges & Kings"],
    reflection: "Series 1 traced the foundations of faith, from creation to the kings of Israel. Consider Psalm 145:4, which speaks of one generation declaring God's works to the next.",
    questions: [
      { cat: "Creation & Patriarchs", diff: "easy", text: "Who built the ark to survive the great flood?", options: ["Moses", "Noah", "Abraham", "Isaac"], correct: 1, verse: "Genesis 6:14 — \"Make thee an ark of gopher wood; rooms shalt thou make in the ark, and shalt pitch it within and without with pitch.\"" },
      { cat: "Creation & Patriarchs", diff: "medium", text: "What did God create on the first day?", options: ["Animals", "Light", "Man", "Plants"], correct: 1, verse: "Genesis 1:3 — \"And God said, Let there be light: and there was light.\"" },
      { cat: "Creation & Patriarchs", diff: "medium", text: "What did God ask Abraham to sacrifice?", options: ["A lamb", "His servant", "His son Isaac", "A dove"], correct: 2, verse: "Genesis 22:2 — \"Take now thy son, thine only son Isaac, whom thou lovest... and offer him there for a burnt offering.\"" },
      { cat: "Creation & Patriarchs", diff: "easy", text: "What was the first thing God created according to Genesis 1:1?", options: ["Man", "The heavens and the earth", "Light", "The sea"], correct: 1, verse: "Genesis 1:1 — \"In the beginning God created the heaven and the earth.\"" },
      { cat: "Exodus & Law", diff: "hard", text: "How many years did the Israelites wander in the wilderness?", options: ["10 years", "20 years", "40 years", "70 years"], correct: 2, verse: "Numbers 14:33 — \"And your children shall wander in the wilderness forty years, and bear your whoredoms, until your carcases be wasted in the wilderness.\"" },
      { cat: "Exodus & Law", diff: "easy", text: "Who led the Israelites out of Egypt?", options: ["Aaron", "Moses", "Joshua", "Joseph"], correct: 1, verse: "Exodus 3:10 — \"Come now therefore, and I will send thee unto Pharaoh, that thou mayest bring forth my people the children of Israel out of Egypt.\"" },
      { cat: "Exodus & Law", diff: "easy", text: "How many commandments did Moses receive from God?", options: ["Seven", "Ten", "Twelve", "Five"], correct: 1, verse: "Exodus 34:28 — \"And he wrote upon the tables the words of the covenant, the ten commandments.\"" },
      { cat: "Exodus & Law", diff: "easy", text: "What sea did God part so the Israelites could cross?", options: ["Dead Sea", "Sea of Galilee", "Red Sea", "Mediterranean Sea"], correct: 2, verse: "Exodus 14:21 — \"...and the LORD caused the sea to go back by a strong east wind all that night, and made the sea dry land, and the waters were divided.\"" },
      { cat: "Judges & Kings", diff: "medium", text: "Who defeated the giant Goliath?", options: ["Samson", "Solomon", "David", "Saul"], correct: 2, verse: "1 Samuel 17:50 — \"So David prevailed over the Philistine with a sling and with a stone, and smote the Philistine, and slew him.\"" },
      { cat: "Judges & Kings", diff: "medium", text: "Who was the first king of Israel?", options: ["David", "Solomon", "Saul", "Samuel"], correct: 2, verse: "1 Samuel 10:1 — \"Then Samuel took a vial of oil, and poured it upon his head, and kissed him, and said, Is it not because the LORD hath anointed thee to be captain over his inheritance?\"" },
      { cat: "Judges & Kings", diff: "hard", text: "Which prophet was swallowed by a great fish?", options: ["Elijah", "Jonah", "Ezekiel", "Amos"], correct: 1, verse: "Jonah 1:17 — \"Now the LORD had prepared a great fish to swallow up Jonah. And Jonah was in the belly of the fish three days and three nights.\"" },
      { cat: "Judges & Kings", diff: "easy", text: "Which judge of Israel was known for his great strength, tied to his uncut hair?", options: ["Gideon", "Samson", "Ehud", "Barak"], correct: 1, verse: "Judges 16:17 — \"...for I have been a Nazarite unto God from my mother's womb: if I be shaven, then my strength will go from me.\"" }
    ],
    renderCard: function (indexNumber) {
      var s = window.TRIVIA_SERIES.series1;
      return (
        '<button class="series-card" data-series-key="series1">' +
          '<div class="series-card-top"><span class="series-num">' + indexNumber + '</span><span class="series-badge s1-badge">12 Questions</span></div>' +
          '<h3>Series ' + indexNumber + ' — ' + s.title + '</h3>' +
          '<p>' + s.subtitle + '</p>' +
          '<div class="series-cats">' + s.categories.join(" • ") + '</div>' +
        '</button>'
      );
    }
  };
})();
