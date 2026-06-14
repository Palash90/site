import { useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import GridApp from "./tic-tac-slide/App";
import StudyApp from "./study/Study";

export default function CustomComponent() {
    const componentMap = {
        "tic-tac-slide": <GridApp />,
        "study": <StudyApp />,
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