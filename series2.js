/* Bible Trivia Master — Series 2 module.
   Self-contained: own CSS, own card HTML, own question data.
   Registers itself on window.TRIVIA_SERIES. Does NOT reference series1.js,
   series3.js, or referral.js. Deleting this file simply removes Series 2
   from the home screen — nothing else breaks. */
(function () {
  "use strict";

  if (!document.getElementById("series2-module-style")) {
    var style = document.createElement("style");
    style.id = "series2-module-style";
    style.textContent =
      '.s2-badge{background:rgba(201,162,39,0.14);color:#9C7A1C;}';
    document.head.appendChild(style);
  }

  window.TRIVIA_SERIES = window.TRIVIA_SERIES || {};

  window.TRIVIA_SERIES.series2 = {
    key: "series2",
    order: 2,
    title: "The Gospels",
    subtitle: "The life, miracles & parables of Jesus",
    categories: ["Birth & Ministry", "Miracles", "Parables"],
    reflection: "Series 2 walked through the life of Jesus: His birth, His miracles, and His parables. Reflect on John 1:14, which says the Word became flesh and dwelt among us.",
    questions: [
      { cat: "Birth & Ministry", diff: "easy", text: "In which city was Jesus born?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Bethany"], correct: 2, verse: "Luke 2:4-7 — Jesus was born in the town of Bethlehem." },
      { cat: "Birth & Ministry", diff: "hard", text: "Who baptized Jesus in the Jordan River?", options: ["Peter", "John the Baptist", "Andrew", "Philip"], correct: 1, verse: "Matthew 3:13-17 — John baptized Jesus in the Jordan." },
      { cat: "Birth & Ministry", diff: "easy", text: "How many disciples did Jesus choose?", options: ["10", "12", "7", "14"], correct: 1, verse: "Mark 3:14 — Jesus appointed twelve to be with him." },
      { cat: "Birth & Ministry", diff: "medium", text: "On what day of the week did Jesus rise from the dead?", options: ["Friday", "Saturday", "Sunday", "Monday"], correct: 2, verse: "Luke 24:1 — On the first day of the week, the tomb was found empty." },
      { cat: "Miracles", diff: "medium", text: "What was Jesus' first recorded miracle?", options: ["Walking on water", "Turning water into wine", "Feeding 5000", "Healing a blind man"], correct: 1, verse: "John 2:1-11 — At a wedding in Cana, Jesus turned water into wine." },
      { cat: "Miracles", diff: "medium", text: "How many loaves and fish fed the 5,000?", options: ["2 loaves, 3 fish", "5 loaves, 2 fish", "7 loaves, 1 fish", "3 loaves, 5 fish"], correct: 1, verse: "John 6:9 — A boy had five barley loaves and two small fish." },
      { cat: "Miracles", diff: "hard", text: "Whom did Jesus raise from the dead after four days in the tomb?", options: ["Jairus' daughter", "Lazarus", "The widow's son", "Tabitha"], correct: 1, verse: "John 11:39-44 — Jesus called Lazarus out of the tomb after four days." },
      { cat: "Miracles", diff: "easy", text: "On what body of water did Jesus walk?", options: ["The Jordan River", "The Dead Sea", "The Sea of Galilee", "The Red Sea"], correct: 2, verse: "Matthew 14:25 — Jesus walked on the Sea of Galilee toward His disciples." },
      { cat: "Parables", diff: "easy", text: "In the parable of the lost sheep, how many sheep did the shepherd have?", options: ["10", "50", "100", "1000"], correct: 2, verse: "Luke 15:4 — A man with a hundred sheep loses one." },
      { cat: "Parables", diff: "medium", text: "In the Parable of the Prodigal Son, what did the younger son ask for?", options: ["Forgiveness", "His inheritance early", "A new robe", "A job"], correct: 1, verse: "Luke 15:12 — The younger son asked for his share of the estate." },
      { cat: "Parables", diff: "hard", text: "In the Parable of the Talents, how many talents did the servant with the most receive?", options: ["Two", "Three", "Five", "Ten"], correct: 2, verse: "Matthew 25:15 — One servant received five talents." },
      { cat: "Parables", diff: "easy", text: "In the Parable of the Good Samaritan, who stopped to help the injured man after a priest and a Levite passed by?", options: ["A Pharisee", "A Roman soldier", "A Samaritan", "A tax collector"], correct: 2, verse: "Luke 10:33-34 — A Samaritan had compassion and helped the man." }
    ],
    renderCard: function (indexNumber) {
      var s = window.TRIVIA_SERIES.series2;
      return (
        '<button class="series-card" data-series-key="series2">' +
          '<div class="series-card-top"><span class="series-num">' + indexNumber + '</span><span class="series-badge s2-badge">12 Questions</span></div>' +
          '<h3>Series ' + indexNumber + ' — ' + s.title + '</h3>' +
          '<p>' + s.subtitle + '</p>' +
          '<div class="series-cats">' + s.categories.join(" • ") + '</div>' +
        '</button>'
      );
    }
  };
})();
