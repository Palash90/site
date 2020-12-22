function toggleAll() {
    if (document.getElementById("all").checked) {
        document.getElementById("comparison").checked = true;
        document.getElementById("comparison").checked = true;
        document.getElementById("comparisonBengali").checked = true;
        document.getElementById("comparisonHindi").checked = true;
        document.getElementById("beforeAfter").checked = true;
        document.getElementById("beforeAfterBengali").checked = true;
        document.getElementById("beforeAfterHindi").checked = true;
        document.getElementById("between").checked = true;
        document.getElementById("betweenBengali").checked = true;
        document.getElementById("betweenHindi").checked = true;
        document.getElementById("plus").checked = true;
        document.getElementById("plusBengali").checked = true;
        document.getElementById("plusHindi").checked = true;
        document.getElementById("minus").checked = true;
        document.getElementById("minusBengali").checked = true;
        document.getElementById("minusHindi").checked = true;
        document.getElementById("bn-alpha").checked = true;
        document.getElementById("hi-alpha").checked = true;
        document.getElementById("en-alpha").checked = true;
        document.getElementById("shapes").checked = true;
        document.getElementById("colors").checked = true;
    } else {
        document.getElementById("comparison").checked = false;
        document.getElementById("comparison").checked = false;
        document.getElementById("comparisonBengali").checked = false;
        document.getElementById("comparisonHindi").checked = false;
        document.getElementById("beforeAfter").checked = false;
        document.getElementById("beforeAfterBengali").checked = false;
        document.getElementById("beforeAfterHindi").checked = false;
        document.getElementById("between").checked = false;
        document.getElementById("betweenBengali").checked = false;
        document.getElementById("betweenHindi").checked = false;
        document.getElementById("plus").checked = false;
        document.getElementById("plusBengali").checked = false;
        document.getElementById("plusHindi").checked = false;
        document.getElementById("minus").checked = false;
        document.getElementById("minusBengali").checked = false;
        document.getElementById("minusHindi").checked = false;
        document.getElementById("bn-alpha").checked = false;
        document.getElementById("hi-alpha").checked = false;
        document.getElementById("en-alpha").checked = false;
        document.getElementById("shapes").checked = false;
        document.getElementById("colors").checked = false;
    }

    changeSelection();
}

function changeSelection() {
    contents = []
    if (document.getElementById("comparison").checked) {
        contents = contents.concat(comparisons);
    }
    if (document.getElementById("comparisonBengali").checked) {
        contents = contents.concat(comparisonsBengali);
    }
    if (document.getElementById("comparisonHindi").checked) {
        contents = contents.concat(comparisonsHindi);
    }
    if (document.getElementById("beforeAfter").checked) {
        contents = contents.concat(beforeAfter);
    }
    if (document.getElementById("beforeAfterBengali").checked) {
        contents = contents.concat(beforeAfterBengali);
    }
    if (document.getElementById("beforeAfterHindi").checked) {
        contents = contents.concat(beforeAfterHindi);
    }
    if (document.getElementById("between").checked) {
        contents = contents.concat(between);
    }
    if (document.getElementById("betweenBengali").checked) {
        contents = contents.concat(betweenBengali);
    }
    if (document.getElementById("betweenHindi").checked) {
        contents = contents.concat(betweenHindi);
    }
    if (document.getElementById("plus").checked) {
        contents = contents.concat(plus);
    }
    if (document.getElementById("plusBengali").checked) {
        contents = contents.concat(plusBengali);
    }
    if (document.getElementById("plusHindi").checked) {
        contents = contents.concat(plusHindi);
    }
    if (document.getElementById("minus").checked) {
        contents = contents.concat(minus);
    }
    if (document.getElementById("minusBengali").checked) {
        contents = contents.concat(minusBengali);
    }
    if (document.getElementById("minusHindi").checked) {
        contents = contents.concat(minusHindi);
    }
    if (document.getElementById("bn-alpha").checked) {
        contents = contents.concat(bengaliAlphabets).concat(bengaliWords).concat(bengaliSentences);
    }
    if (document.getElementById("hi-alpha").checked) {
        contents = contents.concat(hindiAlphabets).concat(hindiWords).concat(hindiSentences);
    }
    if (document.getElementById("en-alpha").checked) {
        contents = contents.concat(englishAlphabets).concat(englishWords).concat(englishSentences);
    }
    if (document.getElementById("shapes").checked) {
        contents = contents.concat(shapes);
    }
    if (document.getElementById("colors").checked) {
        contents = contents.concat(colors);
    }

    document.getElementById("all").checked = document.getElementById("comparison").checked &&
        document.getElementById("comparison").checked &&
        document.getElementById("comparisonBengali").checked &&
        document.getElementById("comparisonHindi").checked &&
        document.getElementById("beforeAfter").checked &&
        document.getElementById("beforeAfterBengali").checked &&
        document.getElementById("beforeAfterHindi").checked &&
        document.getElementById("between").checked &&
        document.getElementById("betweenBengali").checked &&
        document.getElementById("betweenHindi").checked &&
        document.getElementById("plus").checked &&
        document.getElementById("plusBengali").checked &&
        document.getElementById("plusHindi").checked &&
        document.getElementById("minus").checked &&
        document.getElementById("minusBengali").checked &&
        document.getElementById("minusHindi").checked &&
        document.getElementById("bn-alpha").checked &&
        document.getElementById("hi-alpha").checked &&
        document.getElementById("en-alpha").checked &&
        document.getElementById("shapes").checked &&
        document.getElementById("colors").checked;

    if (document.getElementById("all").checked) {
        contents = [].concat(comparisons).concat(comparisonsBengali).concat(comparisonsHindi)
            .concat(beforeAfter).concat(beforeAfterBengali).concat(beforeAfterHindi)
            .concat(between).concat(betweenBengali).concat(betweenHindi)
            .concat(plus).concat(plusBengali).concat(plusHindi)
            .concat(minus).concat(minusBengali).concat(minusHindi)
            .concat(bengaliAlphabets).concat(bengaliWords).concat(bengaliSentences)
            .concat(hindiAlphabets).concat(hindiWords).concat(hindiSentences)
            .concat(englishAlphabets).concat(englishWords).concat(englishSentences)
            .concat(shapes).concat(colors)
    }


    if (contents.length == 0) {
        contents.push({ content: "" })
    }
    changeContent();
}