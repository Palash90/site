import { Col, Row } from "react-bootstrap"

export default function IndividualScoreElement(props) {
    return <><Row>
        <Col><span>{props.elem}: {props.score}</span></Col>
    </Row>
        <Row xs={2}>
            <Col><span style={{ color: 'lightgreen' }}>Correct: {props.correct}</span></Col>
            <Col><span style={{ color: 'red' }}>Wrong: {props.wrong}</span></Col>
        </Row>
    </>
}