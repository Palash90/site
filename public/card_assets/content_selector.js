function changeContent() {
    contents = []
    if (document.getElementById("comparison").checked) {
        contents = contents.concat(comparisons);
    }
    if (document.getElementById("beforeAfter").checked) {
        contents = contents.concat(beforeAfter);
    }
    if (document.getElementById("between").checked) {
        contents = contents.concat(between);
    }
    if (document.getElementById("plus").checked) {
        contents = contents.concat(plus);
    }
    if (document.getElementById("minus").checked) {
        contents = contents.concat(minus);
    }
    if (document.getElementById("bn-alpha").checked) {
        contents = contents.concat(bengaliAlphabets);
    }
    if (document.getElementById("hi-alpha").checked) {
        contents = contents.concat(hindiAlphabets);
    }
    if (document.getElementById("shapes").checked) {
        contents = contents.concat(shapes);
    }
    if (document.getElementById("colors").checked) {
        contents = contents.concat(colors);
    }
    if (document.getElementById("all").checked) {
        contents = plus.concat(minus).concat(bengaliAlphabets).concat(hindiAlphabets).concat(shapes)
            .concat(colors).concat(comparisons).concat(beforeAfter).concat(between)
    }
    if (contents.length == 0) {
        contents.push({ content: "" })
    }
    changeLetter();
}