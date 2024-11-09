import { Card, Col, Container, Row } from "react-bootstrap";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Socials() {
    return <>
        <Container>
            <Row>
                <Col  >
                    <Card.Link style={{ border: "1px solid", padding: "15px", borderRadius: "5px" }} href="https://linkedin.com/in/palash90" target='_blank'>
                        <FaLinkedin size={40} />
                    </Card.Link>
                </Col>
                <Col  >
                    <Card.Link style={{ border: "1px solid", padding: "15px", borderRadius: "5px" }} href="https://www.youtube.com/@GuitaleleTutorials" target='_blank'>
                        <FaYoutube size={40} />
                    </Card.Link>
                </Col>
                <Col  >
                    <Card.Link style={{ border: "1px solid", padding: "15px", borderRadius: "5px" }} href="https://github.com/palash90" target='_blank'>
                        <FaGithub size={40} />
                    </Card.Link>
                </Col>
            </Row>
        </Container>
    </>
}