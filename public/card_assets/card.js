
// Create a new utterance for the specified text and add it to
// the queue.
function speak(text) {
  // Create a new instance of SpeechSynthesisUtterance.
  var msg = new SpeechSynthesisUtterance();

  // Set the text.
  msg.text = text;

  // Set the attributes.
  msg.volume = parseFloat(1);
  msg.rate = parseFloat(0.2);
  msg.pitch = parseFloat(0.3);

  // If a voice has been selected, find the voice and set the
  // utterance instance's voice attribute.

  msg.voice = speechSynthesis.getVoices()[0];

  console.log("Trying to Speak aloud");
  // Queue this utterance.
  window.speechSynthesis.speak(msg);
}

function changeLetter() {
  var cardClasses = document.querySelector(".card").classList;

  if (cardClasses.value.includes("is-flipped")) {
    cardClasses.toggle("is-flipped");
  }

  var contentIndex = parseInt(contents.length * Math.random());
  var styleIndex = parseInt(styles.length * Math.random());
  var frontBgIndex = parseInt(lightColors.length * Math.random());
  var backBgIndex = parseInt(lightColors.length * Math.random());

  var content = contents[contentIndex];
  document.getElementById("front").innerHTML = content.content;

  if (content.type && content.type === "calculation") {
    document.getElementById("back").innerHTML = eval(content.content);
  } else if (content.type && content.type === "alphabet") {
    var desc = content.desc ? content.desc : {};
    var language = desc.language ? desc.language : "";
    var html =
      "\
    <label>Language: " +
      language +
      "</label>\
    <obj id='objct' data =" +
      JSON.stringify(content) +
      " />";

    document.getElementById("back").innerHTML = html;
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

    var synth = window.speechSynthesis;
    console.log(synth);

    if (synth && document.getElementById("objct")) {
      var content = JSON.parse(
        document.getElementById("objct").getAttribute("data")
      );
      console.log(content);
      if (content.type === "alphabet") speak(content.content);
    }
  });
}
