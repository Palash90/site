
function changeLetter() {
    var synth = window.speechSynthesis;
    console.log(synth);

    var contentIndex = parseInt(contents.length * Math.random());
    var styleIndex = parseInt(styles.length * Math.random());

    document.getElementById("front").innerHTML = contents[contentIndex].content;

    if (contents[contentIndex].type && contents[contentIndex].type === 'calculation') {
        document.getElementById("back").innerHTML = eval(contents[contentIndex].content);
    } else if (contents[contentIndex].type && contents[contentIndex].type === 'alphabet') {
        document.getElementById("back").innerHTML = contents[contentIndex].content;
    }

    var frontClass = "card__face card__face--front content " + styles[styleIndex];
    var backClass = "card__face card__face--back content " + styles[styleIndex];

    document.getElementById("refresh").setAttribute("class", "button " + styles[styleIndex]);

    document.getElementById("front").setAttribute("class", frontClass);
    document.getElementById("back").setAttribute("class", backClass);
}

function addListener() {
    var card = document.querySelector('.card');
    card.addEventListener('click', function () {
        card.classList.toggle('is-flipped');
    });
}

