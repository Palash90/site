import { Col, Container, Row } from "react-bootstrap";
import Blog from "./Blog";
import Socials from "./Socials";

export default function About() {
    return <>
        <Container>
            <Row>
                <Col>
                    <Blog mdUrl={window.findProp("pages.about.mdUrl")} />
                </Col>
            </Row>
            <Row>
                <Col>
                    Let's Connect: <Socials />
                </Col>
            </Row>
        </Container>
    </>
}