import { Col, Container, Image, Row } from "react-bootstrap";
import PageIntro from "./PageIntro";

export default function Home() {
    return <>
        <Container fluid>
            <PageIntro h1={window.findProp('pages.home.greeting') + window.findProp('shortName')}
                p={window.findProp('pages.home.tag')}
            />
            <Row>
                <Col>
                    <div style={{ whiteSpace: "pre-line" }}>
                        {window.findProp('pages.home.desc')}
                    </div>
                    <br />
                </Col>
                <Col>
                    <Image fluid src="https://palash90.github.io/site-assets/profile.jpg" style={{ background: 'transparent' }} />
                </Col>
            </Row>
        </Container>
    </>
}