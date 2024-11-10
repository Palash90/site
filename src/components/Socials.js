import { Card, Col, Container, Row } from "react-bootstrap";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { RiMailSendFill } from "react-icons/ri";

export default function Socials() {
    return <>
        <Container>
            <Row>
                <Col>
                    <Card.Link href="https://linkedin.com/in/palash90" target='_blank'>
                        <FaLinkedin />
                    </Card.Link>
                </Col>
                <Col>
                    <Card.Link href="https://www.youtube.com/@GuitaleleTutorials" target='_blank'>
                        <FaYoutube />
                    </Card.Link>
                </Col>
                <Col>
                    <Card.Link href="https://github.com/palash90" target='_blank'>
                        <FaGithub />
                    </Card.Link>
                </Col>
                <Col>
                    <Card.Link className="button" href="mailto:connect@palashkantikundu.in" target='_blank'>
                        <RiMailSendFill />
                    </Card.Link>
                </Col>
            </Row>
        </Container>
    </>
}