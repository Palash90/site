import { Col, Container, Row } from "react-bootstrap"
import PageIntro from "./PageIntro"
import { useParams } from "react-router";

export default function Contents() {
    const type = useParams().type;
    var intro, header, h1Color;

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
                {
                    !type || type === "tech" ? <Col >
                        <ul>
                            {window.findProp("contents.swe").map(b => getContentLink(b))}
                        </ul>
                    </Col> : <></>
                }
                {
                    !type || type === "music" ?
                        <Col>
                            <ul>
                                {window.findProp("contents.music").map(b => getContentLink(b))}
                            </ul>
                        </Col> : <></>
                }
            </Row>
        </Container >

    </>


    function getContentLink(b) {
        var link = process.env.PUBLIC_URL + "#/content/" + b.id;
        return <li key={b.id}>{b.publishDate ? b.publishDate + " - " : ""}
            <a href={link}>{b.title}</a>
        </li>
    }
}