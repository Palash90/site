import { Col, Container, Row } from "react-bootstrap"

export default function Contents() {
    return <>
        <h1 style={{color:'tomato'}}>{window.findProp("labels.contents")}</h1>
        <p>{window.findProp("pages.contents.intro")}</p>
        <Container>
            <Row>
                <Col><h2 style={{color:'turquoise'}}>{window.findProp("labels.swe")}</h2></Col>
                <Col><h2 style={{color:'turquoise'}}>{window.findProp("labels.music")}</h2></Col>
            </Row>
            <Row>
                <Col>
                    <ul>
                        {window.findProp("contents.swe").map(b => <li key={b.id}>{b.publishDate ? b.publishDate + " - " : ""} <a href={"/content/" + b.id}>{b.title}</a></li>)}
                    </ul>
                </Col>
                <Col>
                    <ul>
                        {window.findProp("contents.music").map(b => <li key={b.id}>{b.publishDate ? b.publishDate + " - " : ""} <a href={"/content/" + b.id}>{b.title}</a></li>)}
                    </ul>
                </Col>
            </Row>
        </Container>

    </>

}