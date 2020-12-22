var styles = [
  "textBlue",
  "textGreen",
  "textRed",
  "textSlate",
  "textBrown",
  "textMaroon"
];
var lightColors = [
  "AliceBlue",
  "Azure",
  "Beige",
  "FloralWhite",
  "GhostWhite",
  "HoneyDew",
  "Ivory",
  "LightCyan",
  "MintCream",
  "Linen",
  "OldLace",
  "SeaShell",
  "Snow",
  "WhiteSmoke"
];

var plus = [];
var minus = [];
var plusBengali = [];
var plusHindi = [];
var minusBengali = [];
var minusHindi = [];

for (var i = 1; i <= 99; i++) {
  for (var j = 1; j <= 20; j++) {

    plus.push({
      content: i + " + " + j,
      type: "calculation",
      answer: eval(i + j)
    });

    plusBengali.push({
      content: convertToBengaliNumber(i) + " + " + convertToBengaliNumber(j),
      type: "calculation",
      answer: convertToBengaliNumber(eval(i + j))
    });

    plusHindi.push({
      content: convertToHindiNumber(i) + " + " + convertToHindiNumber(j),
      type: "calculation",
      answer: convertToHindiNumber(eval(i + j))
    });

    if (j < i) {
      minus.push({
        content: i + " - " + j,
        type: "calculation",
        answer: eval(i - j)
      });

      minusBengali.push({
        content: convertToBengaliNumber(i) + " - " + convertToBengaliNumber(j),
        type: "calculation",
        answer: convertToBengaliNumber(eval(i - j))
      });

      minusHindi.push({
        content: convertToHindiNumber(i) + " - " + convertToHindiNumber(j),
        type: "calculation",
        answer: convertToHindiNumber(eval(i - j))
      });
    }

  }
}

var comparisons = []
var comparisonsBengali = []
var comparisonsHindi = []
for (var i = 1; i <= 100; i++) {
  for (var j = 1; j <= 100; j++) {
    var answer;
    if (i < j) {
      answer = "<"
    } else if (i > j) {
      answer = ">"
    } else {
      answer = "="
    }

    comparisons.push({
      content: i + " __ " + j,
      type: "comparison",
      answer: answer
    });

    comparisonsBengali.push({
      content: convertToBengaliNumber(i) + " __ " + convertToBengaliNumber(j),
      type: "comparison",
      answer: answer
    });

    comparisonsHindi.push({
      content: convertToHindiNumber(i) + " __ " + convertToHindiNumber(j),
      type: "comparison",
      answer: answer
    })
  }
}

var beforeAfter = []
var beforeAfterBengali = []
var beforeAfterHindi = []
var between = []
var betweenBengali = []
var betweenHindi = []
for (var i = 1; i <= 150; i++) {
  beforeAfter.push({
    content: i + " __ ",
    type: "comparison",
    answer: i + 1
  })
  beforeAfter.push({
    content: " __ " + i,
    type: "comparison",
    answer: i - 1
  })
  between.push({
    content: i + " |__| " + (i + 2),
    type: "comparison",
    answer: i + 1
  })

  beforeAfterBengali.push({
    content: convertToBengaliNumber(i) + " __ ",
    type: "comparison",
    answer: convertToBengaliNumber(i + 1)
  })
  beforeAfterBengali.push({
    content: " __ " + convertToBengaliNumber(i),
    type: "comparison",
    answer: convertToBengaliNumber(i - 1)
  })
  betweenBengali.push({
    content: convertToBengaliNumber(i) + " |__| " + convertToBengaliNumber(i + 2),
    type: "comparison",
    answer: convertToBengaliNumber(i + 1)
  })

  beforeAfterHindi.push({
    content: convertToHindiNumber(i) + " __ ",
    type: "comparison",
    answer: convertToHindiNumber(i + 1)
  })
  beforeAfterHindi.push({
    content: " __ " + convertToHindiNumber(i),
    type: "comparison",
    answer: convertToHindiNumber(i - 1)
  })
  betweenHindi.push({
    content: convertToHindiNumber(i) + " |__| " + convertToHindiNumber(i + 2),
    type: "comparison",
    answer: convertToHindiNumber(i + 1)
  })
}

var shapes = [{
  content: "Circle",
  type: "shape",
  desc: "Circle/বৃত্ত/वृत्त"
}, {
  content: "Rectangle",
  type: "shape",
  desc: "Rectangle/আয়তক্ষেত্র/आयत"
}, {
  content: "Square",
  type: "shape",
  desc: "Square/বর্গক্ষেত্র"

}, {
  content: "Triangle",
  type: "shape",
  desc: "Triangle/ত্রিভুজ/त्रिकोण"

}, {
  content: "Semi Circle",
  type: "shape",
  desc: "Semi Circle/অর্ধ বৃত্ত/अर्द्धवृत्त"

}, {
  content: "Oval",
  type: "shape",
  desc: "Oval/ডিম্বাকৃতি/अंडाकार"

}, {
  content: "Diamond",
  type: "shape",
  desc: "Diamond/ডায়মন্ড/हीरे"

}, {
  content: "Heart",
  type: "shape",

}, {
  content: "Star",
  type: "shape",
  desc: "Star/তারা/सितारा"
}]

var colors = [{
  content: "darkred",
  type: "color",
  name: "Deep Red"
}, {
  content: "deeppink",
  type: "color",
  name: "Deep Pink"

}, {
  content: "orange",
  type: "color",
  name: "Orange"

}, {
  content: "purple",
  type: "color",
  name: "Purple"

}, {
  content: "lightgreen",
  type: "color",
  name: "Light Green"

}, {
  content: "lightpink",
  type: "color",
  name: "Light Pink"

}, {
  content: "lightblue",
  type: "color",
  name: "Light Blue"

}, {
  content: "red",
  type: "color",
  name: "Red"

}]

var contents = [{ content: "", type: "" }];
