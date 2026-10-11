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
      { cat: "Birth & Ministry", diff: "easy", text: "In which city was Jesus born?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Bethany"], correct: 2, verse: "Luke 2:4 — \"And Joseph also went up from Galilee, out of the city of Nazareth, into Judaea, unto the city of David, which is called Bethlehem.\"" },
      { cat: "Birth & Ministry", diff: "hard", text: "Who baptized Jesus in the Jordan River?", options: ["Peter", "John the Baptist", "Andrew", "Philip"], correct: 1, verse: "Matthew 3:13 — \"Then cometh Jesus from Galilee to Jordan unto John, to be baptized of him.\"" },
      { cat: "Birth & Ministry", diff: "easy", text: "How many disciples did Jesus choose?", options: ["10", "12", "7", "14"], correct: 1, verse: "Mark 3:14 — \"And he ordained twelve, that they should be with him, and that he might send them forth to preach.\"" },
      { cat: "Birth & Ministry", diff: "medium", text: "On what day of the week did Jesus rise from the dead?", options: ["Friday", "Saturday", "Sunday", "Monday"], correct: 2, verse: "Luke 24:1 — \"Now upon the first day of the week, very early in the morning, they came unto the sepulchre...\"" },
      { cat: "Miracles", diff: "medium", text: "What was Jesus' first recorded miracle?", options: ["Walking on water", "Turning water into wine", "Feeding 5000", "Healing a blind man"], correct: 1, verse: "John 2:11 — \"This beginning of miracles did Jesus in Cana of Galilee, and manifested forth his glory.\"" },
      { cat: "Miracles", diff: "medium", text: "How many loaves and fish fed the 5,000?", options: ["2 loaves, 3 fish", "5 loaves, 2 fish", "7 loaves, 1 fish", "3 loaves, 5 fish"], correct: 1, verse: "John 6:9 — \"There is a lad here, which hath five barley loaves, and two small fishes: but what are they among so many?\"" },
      { cat: "Miracles", diff: "hard", text: "Whom did Jesus raise from the dead after four days in the tomb?", options: ["Jairus' daughter", "Lazarus", "The widow's son", "Tabitha"], correct: 1, verse: "John 11:43-44 — \"...he cried with a loud voice, Lazarus, come forth. And he that was dead came forth...\"" },
      { cat: "Miracles", diff: "easy", text: "On what body of water did Jesus walk?", options: ["The Jordan River", "The Dead Sea", "The Sea of Galilee", "The Red Sea"], correct: 2, verse: "Matthew 14:25 — \"And in the fourth watch of the night Jesus went unto them, walking on the sea.\"" },
      { cat: "Parables", diff: "easy", text: "In the parable of the lost sheep, how many sheep did the shepherd have?", options: ["10", "50", "100", "1000"], correct: 2, verse: "Luke 15:4 — \"What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine... and go after that which is lost?\"" },
      { cat: "Parables", diff: "medium", text: "In the Parable of the Prodigal Son, what did the younger son ask for?", options: ["Forgiveness", "His inheritance early", "A new robe", "A job"], correct: 1, verse: "Luke 15:12 — \"Father, give me the portion of goods that falleth to me. And he divided unto them his living.\"" },
      { cat: "Parables", diff: "hard", text: "In the Parable of the Talents, how many talents did the servant with the most receive?", options: ["Two", "Three", "Five", "Ten"], correct: 2, verse: "Matthew 25:15 — \"And unto one he gave five talents, to another two, and to another one; to every man according to his several ability.\"" },
      { cat: "Parables", diff: "easy", text: "In the Parable of the Good Samaritan, who stopped to help the injured man after a priest and a Levite passed by?", options: ["A Pharisee", "A Roman soldier", "A Samaritan", "A tax collector"], correct: 2, verse: "Luke 10:33 — \"But a certain Samaritan, as he journeyed, came where he was: and when he saw him, he had compassion on him.\"" }
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
