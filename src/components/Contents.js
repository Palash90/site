import { Col, Container, Row } from "react-bootstrap"
import PageIntro from "./PageIntro"

export default function Contents() {
    return <>
        <Container fluid>
            <PageIntro
                h1={window.findProp("labels.contents")}
                p={window.findProp("pages.contents.intro")}
                h1Color={window.findProp("pages.contents.h1Color")}
                pColor={window.findProp("pages.contents.pColor")}
            />
            <Row>
                <Col><h2 style={{ color: 'turquoise' }}>{window.findProp("labels.swe")}</h2></Col>
                <Col><h2 style={{ color: 'turquoise' }}>{window.findProp("labels.music")}</h2></Col>
            </Row>
            <Row>
                <Col>
                    <ul>
                        {window.findProp("contents.swe").map(b => getContentLink(b))}
                    </ul>
                </Col>
                <Col>
                    <ul>
                        {window.findProp("contents.music").map(b => getContentLink(b))}
                    </ul>
                </Col>
            </Row>
        </Container>

    </>


    function getContentLink(b) {
        var link = process.env.PUBLIC_URL + "#/content/" + b.id;
        console.log("Making new type of links " + link)
        return <li key={b.id}>{b.publishDate ? b.publishDate + " - " : ""}
            <a href={link}>{b.title}</a>
        </li>
    }
}