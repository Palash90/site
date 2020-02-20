function changeLetter() {
  var synth = window.speechSynthesis;
  console.log(synth);

  var cardClasses = document.querySelector(".card").classList;

  if (cardClasses.value.includes("is-flipped")) {
    cardClasses.toggle("is-flipped");
  }

  var contentIndex = parseInt(contents.length * Math.random());
  var styleIndex = parseInt(styles.length * Math.random());
  var frontBgIndex = parseInt(lightColors.length * Math.random());
  var backBgIndex = parseInt(lightColors.length * Math.random());

  document.getElementById("front").innerHTML = contents[contentIndex].content;

  if (
    contents[contentIndex].type &&
    contents[contentIndex].type === "calculation"
  ) {
    document.getElementById("back").innerHTML = eval(
      contents[contentIndex].content
    );
  } else if (
    contents[contentIndex].type &&
    contents[contentIndex].type === "alphabet"
  ) {
    document.getElementById("back").innerHTML = contents[contentIndex].content;
  }

  var frontClass = "card__face card__face--front content " + styles[styleIndex];
  var backClass = "card__face card__face--back content " + styles[styleIndex];

  document
    .getElementById("refresh")
    .setAttribute("class", "button " + styles[styleIndex]);

  document.getElementById("front").setAttribute("class", frontClass);
  document.getElementById("back").setAttribute("class", backClass);

  document
    .getElementById("front")
    .setAttribute("style", "background:" + lightColors[frontBgIndex] + ";");
  document
    .getElementById("back")
    .setAttribute("style", "background:" + lightColors[backBgIndex] + ";");
}

function addListener() {
  var card = document.querySelector(".card");
  card.addEventListener("click", function() {
    card.classList.toggle("is-flipped");
  });
}
