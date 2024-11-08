import findProp from "./data"
import { Col, Container, Row } from "react-bootstrap"


export default function Blogs() {
    return <>
        <h1>{findProp("labels.blogs")}</h1>
        <Container>
            <Row>
                <Col><h2>{findProp("labels.swe")}</h2></Col>
                <Col><h2>{findProp("labels.music")}</h2></Col>
            </Row>
            <Row>
                <Col>
                    <ul>
                        {findProp("blogs.swe").map(b => <li>{b.publishDate ? b.publishDate + " - " : ""} <a href={"/blog/" + b.id}>{b.title}</a></li>)}
                    </ul>
                </Col>
                <Col>
                    <ul>
                        {findProp("blogs.music").map(b => <li>{b.publishDate ? b.publishDate + " - " : ""} <a href={"/blog/" + b.id}>{b.title}</a></li>)}
                    </ul>
                </Col>
            </Row>
        </Container>

    </>

}