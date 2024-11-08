import { Col, Container, Row } from "react-bootstrap"

export default function Blogs() {
    return <>
        <h1>{window.findProp("labels.blogs")}</h1>
        <Container>
            <Row>
                <Col><h2>{window.findProp("labels.swe")}</h2></Col>
                <Col><h2>{window.findProp("labels.music")}</h2></Col>
            </Row>
            <Row>
                <Col>
                    <ul>
                        {window.findProp("blogs.swe").map(b => <li>{b.publishDate ? b.publishDate + " - " : ""} <a href={"/blog/" + b.id}>{b.title}</a></li>)}
                    </ul>
                </Col>
                <Col>
                    <ul>
                        {window.findProp("blogs.music").map(b => <li>{b.publishDate ? b.publishDate + " - " : ""} <a href={"/blog/" + b.id}>{b.title}</a></li>)}
                    </ul>
                </Col>
            </Row>
        </Container>

    </>

}