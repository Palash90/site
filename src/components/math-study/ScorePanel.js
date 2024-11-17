import { Col, Row } from "react-bootstrap"
import { BiAngry } from "react-icons/bi"
import { FaStar } from "react-icons/fa"

export default function ScorePanel(props) {
    if (props.score === 0) {
        return <></>
    } else if (props.score > 0) {
        return <Row xs="auto">
            <Col><FaStar style={{ color: 'yellow' }} size={50} /></Col>
            <Col>
                <span style={{
                    position: 'absolute',
                    color: "lightgreen",
                    fontWeight: 'bold',
                    fontSize: '20px'
                }}>
                    {props.score}
                </span>
            </Col>
        </Row>
    } else {
        return <Row xs="auto">
            <Col><BiAngry style={{ color: 'red' }} size={50} /></Col>
            <Col>
                <span style={{
                    position: 'absolute',
                    color: "lightgreen",
                    fontWeight: 'bold',
                    fontSize: '20px'
                }}>
                    {Math.abs(props.score)}
                </span>
            </Col>
        </Row>
    }
}