import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { RiMailSendFill } from "react-icons/ri";
import { Col, Row } from "react-bootstrap";

export default function SocialRow() {
  return (
    <Row>
      <Col>
        <a
          className="m-3 ms-0"
          href="https://linkedin.com/in/palash90"
          target="_blank"
          rel="noreferrer"
        >
          <FaLinkedin />
        </a>
        <a
          className="m-3 ms-0"
          href="https://www.youtube.com/@GuitaleleTutorials"
          target="_blank"
          rel="noreferrer"
        >
          <FaYoutube />
        </a>
        <a
          className="m-3 ms-0"
          href="https://github.com/palash90"
          target="_blank"
          rel="noreferrer"
        >
          <FaGithub />
        </a>
        <a
          className="button m-3 ms-0"
          href="mailto:connect@palashkantikundu.in"
          target="_blank"
          rel="noreferrer"
        >
          <RiMailSendFill />
        </a>
      </Col>
    </Row>
  );
}
