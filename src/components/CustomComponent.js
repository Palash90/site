import { useParams } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import GridApp from "./tic-tac-slide/App";

export default function CustomComponent() {
    const componentMap = {
        "tic-tac-slide": <GridApp />
    }
    let params = useParams()
    console.log(componentMap, params.componentId, componentMap[params.componentId])
    return <Container>
        <Row>
            <Col>
                {componentMap[params.componentId]}
            </Col>
        </Row>
    </Container>
}