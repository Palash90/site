import { Col, Container, Row } from "react-bootstrap";
import Blog from "./Blog";
import Socials from "./Socials";
export default function About() {
    return <>
        <Container className="about">
            <Row>
                <Col>
                    <Blog mdUrl={window.findProp("pages.about.mdUrl")} />
                </Col>
            </Row>
            <br />
            <Row>
                <Col>
                    <Socials />
                </Col>
            </Row>
        </Container>
    </>
}