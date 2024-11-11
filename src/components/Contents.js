import { Col, Container, Row } from "react-bootstrap"
import PageIntro from "./PageIntro"
import { useParams } from "react-router";

export default function Contents() {
    const type = useParams().type;
    var intro, header, h1Color;
    var itemsPerPage = window.findProp("pages.contents.itemsPerPage");

    switch (type) {
        case "tech":
            header = window.findProp("pages.contents.techHeader");
            intro = window.findProp("pages.contents.techIntro");
            h1Color = window.findProp("pages.contents.sweHeadColor")
            break;
        case "music":
            header = window.findProp("pages.contents.musicHeader");
            intro = window.findProp("pages.contents.musicIntro");
            h1Color = window.findProp("pages.contents.musicHeadColor")
            break;
        default:
            header = window.findProp("pages.contents.header");
            intro = window.findProp("pages.contents.intro");
            h1Color = window.findProp("pages.contents.h1Color")
            break;
    }

    return <>
        <Container fluid>
            <PageIntro
                h1={header}
                p={intro}
                h1Color={h1Color}
                pColor={window.findProp("pages.contents.pColor")}
            />

            <Row>
                {
                    !type ?
                        <Col>
                            <h2 style={{ color: window.findProp("pages.contents.sweHeadColor") }}>
                                {window.findProp("labels.swe")}
                            </h2>
                        </Col>
                        : <></>
                }
                {
                    !type ?
                        <Col>
                            <h2 style={{ color: window.findProp("pages.contents.musicHeadColor") }}>
                                {window.findProp("labels.music")}
                            </h2>
                        </Col>
                        : <></>
                }
            </Row>
            <Row>
                {!type || type === "tech" ? getContentColumn("contents.swe") : <></>}
                {!type || type === "music" ? getContentColumn("contents.music") : <></>}
            </Row>
        </Container >

    </>

    function getContentColumn(type) {
        var allContents = window.findProp(type);
        var numColumns = Math.ceil(allContents.length / itemsPerPage);
        var columns = []

        for (var i = 0; i < numColumns; i++) {
            var items = []
            for (var j = 0; j < itemsPerPage; j++) {
                var currentItemIndex = i * itemsPerPage + j;

                if (currentItemIndex < allContents.length) {
                    items.push(getContentLink(allContents[currentItemIndex]))
                }

            }
            columns.push(<Col><ul >{items}</ul></Col>);
        }

        return columns;
    }

    function getContentLink(b) {
        var link = process.env.PUBLIC_URL + "#/content/" + b.id;
        return <li key={b.id}>
            <pre className={window.findProp("pages.contents.linkClass")}>
                {b.publishDate ? b.publishDate + " - " : ""}
                <a href={link}>{b.title}</a>
            </pre>
        </li>
    }
}