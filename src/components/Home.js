import { Col, Container, Image, Row } from "react-bootstrap";
import PageIntro from "./PageIntro";
import Socials from "./Socials";

export default function Home() {
    return <>
        <Container fluid>
            <PageIntro h1={window.findProp('pages.home.greeting') + window.findProp('shortName')}
                p={window.findProp('pages.home.tag')}
            />
            <Row>
                <Col>
                    <Row>
                        <Col>
                            <div style={{ whiteSpace: "pre-line" }}>
                                {window.findProp('pages.home.desc')}
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <Row >
                        <Col>
                            <Socials />
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Image fluid src={window.findProp('pages.home.profilePicUrl')} style={{ background: 'transparent' }} />
                </Col>
            </Row>
        </Container>
    </>
}