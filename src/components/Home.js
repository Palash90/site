import { Col, Container, Image, Row } from "react-bootstrap";

export default function Home() {
    return <>
        <h1 style={{ color: 'tomato' }}>{window.findProp('pages.home.greeting') + window.findProp('shortName')}</h1>
        <p style={{ color: 'aqua' }}>{window.findProp('pages.home.tag')}</p>
        <Container fluid>
            <Row>
                <Col>
                    <div style={{ whiteSpace: "pre-line" }}>
                        {window.findProp('pages.home.desc')}
                    </div>
                    <br />
                    <h3>{window.findProp('pages.home.moto')}</h3>
                </Col>
                <Col>
                    <Image fluid src="https://palash90.github.io/site-assets/profile.jpg" style={{ background: 'transparent' }} />
                </Col>
            </Row>
        </Container>
    </>
}