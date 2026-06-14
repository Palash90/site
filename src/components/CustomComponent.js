import { useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import GridApp from "./tic-tac-slide/App";
import MathStudy from "./math-study/MathStudy";
import WordStudy from "./word-study/WordStudy";

export default function CustomComponent() {
    const componentMap = {
        "tic-tac-slide": <GridApp />,
        "math-study": <MathStudy />,
        "word-study": <WordStudy />
    }
    let params = useParams()

    return <Container>
        <Row>
            <Col>
                {componentMap[params.componentId]}
            </Col>
        </Row>
    </Container>
}