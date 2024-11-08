import { Col, Container, Image, Row } from "react-bootstrap";

export default function Home() {
    return <>
        <h1 style={{ color: 'tomato' }}>{window.findProp('contents.home.greeting') + window.findProp('shortName')}</h1>
        <p style={{ color: 'aqua' }}>{window.findProp('contents.home.tag')}</p>
        <Container fluid>
            <Row>
                <Col>
                    <div style={{ whiteSpace: "pre-line" }}>
                        {window.findProp('contents.home.desc')}
                    </div>
                    <br />
                    <h3>{window.findProp('contents.home.moto')}</h3>
                </Col>
                <Col>
                    <Image fluid src="https://palash90.github.io/site-assets/Man.png" style={{ background: 'transparent' }} />
                </Col>
            </Row>
        </Container>
    </>
}