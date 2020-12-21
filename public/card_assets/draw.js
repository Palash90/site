function draw(shape) {
    var w = document.getElementById("contentRow").offsetWidth
    var h = document.getElementById("contentRow").offsetHeight
    console.log(w, h)
    var svg = "";
    if (shape === "Rectangle") {
        svg = '<svg width="96vw" height="50vh"><rect x="44vw" y="21vh" width="10vw" height="20vh" fill="darkgreen" stroke="blue" stroke-width="2"/></svg>';
    }
    if (shape === "Square") {
        svg = '<svg width="96vw" height="50vh"><rect x="44vw" y="20vh" width="10vh" height="10vh" fill="blue" stroke="blue" stroke-width="2"/></svg>';
    }
    if (shape === "Circle") {
        svg = '<svg width="96vw" height="50vh"><circle cx="48vw" cy="25vh" r="5vw" fill="teal" stroke="none" stroke-width="10"  /></svg>';
    }
    if (shape === "Oval") {
        svg = '<svg width="96vw" height="50vh"><ellipse cx="48vw" cy="23vh" rx="4vw" ry="4vh" fill="maroon"  /></svg>';
    }
    if (shape === "Triangle") {
        svg = '<svg preserveAspectRatio="none" width="90vw" height="40vh" viewBox="0 0 100 100"><polygon points="90,90 90,2 2,90" style="fill:lime;"  opacity="1"></polygon></svg>'
    }
    if (shape === 'Semi Circle') {
        svg = '<svg width="98vw" height="50vh" viewBox="0 0 100 150"> <path d="M0,50 a1,1 0 0,0 100,0" fill="blue" /></svg>'
    }
    if (shape === 'Diamond') {
        svg = '<svg xmlns="http://www.w3.org/2000/svg" xml:lang="en" height="50vh" width="98vw" viewBox="0 0 18 30"> <path fill="red" d="M3,10 L10,0 L17,10 L10,20 L3,10" /></svg>'
    }
    if (shape === 'Heart') {
        svg = '<svg height="50vh" width="98vw" viewBox="0 0 342 315" ><defs>' +
            '< style type = "text/css" >< ![CDATA[.outline { stroke: none; stroke- width: 0 }]]></style >' +
            '<g id="heart">' +
            '<path d="M0 200 v-200 h200 a100,100 90 0,1 0,200 a100,100 90 0,1 -200,0 z" />' +
            '</g></defs >' +
            '<use xlink:href="#heart" class="outline " fill="red" transform="rotate(225,150,121)" /></svg > '
    }
    if (shape === 'Star') {
        svg = '<svg height="50vh" width="98vw" viewBox="0 0 273 285"><polygon points="100,10 40,198 190,78 10,78 160,198" style="fill:yellow;stroke:purple;stroke-width:5;fill-rule:nonzero;" /></svg>'
    }

    return svg;
}

var drawColor = (color) => '<svg width="96vw" height="50vh"><rect x="39vw" y="16vh" width="20vw" height="18vh" fill="' + color + '"/></svg>';