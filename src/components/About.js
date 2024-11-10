import { Col, Container, Row } from "react-bootstrap";
import Blog from "./Blog";
import Socials from "./Socials";

export default function About() {
    return <>
        <h1>About</h1>
        <Container>
            <Row>
                <Col>
                    <Blog mdUrl={window.findProp("pages.about.mdUrl")} />
                </Col>
            </Row>
            <Row>
                <Col>
                    Let's Connect:
                </Col>
                <Col>
                    <Socials />
                </Col>
            </Row>
        </Container>
    </>
}