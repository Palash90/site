import { useContext } from "react";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "./AppContext";
import I18nLabel from "./I18nLabel";
import Markdown from "react-markdown";
import rules from "./game_rules.js";
import { Col, Row } from "react-bootstrap";

export default function (props) {
    const { showRules, handleCloseRule } = useContext(AppContext);

    return <Modal size="lg" style={{ color: "black" }} show={showRules} onHide={handleCloseRule} backdrop="static" keyboard={false}>
        <Modal.Header closeButton />
        <Modal.Body>
            <Row>
                <Col>
                    <Markdown>{rules()}</Markdown>
                </Col>
            </Row>
            <Row>
                <Col>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/BZtUD-71Hqk?si=ReJgJphVwk2gLhx4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            <I18nLabel msg="REOPEN_RULES_INSTRUCTION" />
        </Modal.Footer>
    </Modal>
}