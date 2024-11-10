import { Col, Container, Row } from "react-bootstrap";
import Blog from "./Blog";
import Socials from "./Socials";
import { Link } from "react-router-dom";

export default function About() {
    return <>
        <Container>
            <Row>
                <Col>
                    <Blog mdUrl={window.findProp("pages.about.mdUrl")} />
                </Col>
            </Row>
            <br />
            <Row>
                <Col>
                    Download my profile:
                    <a href={window.findProp("pages.about.resume")}
                        download={window.findProp("pages.about.resumeName")}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {window.findProp("pages.about.resumeName")}
                    </a>
                </Col>
            </Row>
            <br />
            <Row>
                <Col>
                    Let's Connect:<br /> <Socials />
                </Col>
            </Row>
        </Container>
    </>
}