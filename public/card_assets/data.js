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

for (var i = 1; i <= 99; i++) {
  for (var j = 1; j <= 20; j++) {

    plus.push({
      content: i + " + " + j,
      type: "calculation"
    });
    if (j < i)
      minus.push({
        content: i + " - " + j,
        type: "calculation"
      });
  }
}

var comparisons = []
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
    })
  }
}

var beforeAfter = []
var between = []
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
}

var shapes = [{
  content: "Circle",
  type: "shape"

}, {
  content: "Rectangle",
  type: "shape"

}, {
  content: "Square",
  type: "shape"

}, {
  content: "Triangle",
  type: "shape"

}, {
  content: "Semi Circle",
  type: "shape"

}, {
  content: "Oval",
  type: "shape"

}, {
  content: "Diamond",
  type: "shape"

}, {
  content: "Heart",
  type: "shape"

}, {
  content: "Star",
  type: "shape"

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
