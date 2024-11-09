import { useParams } from "react-router-dom";
import Home from "./Home";
import GridApp from "./tic-tac-slide/App"
import { Col, Container, Row } from "react-bootstrap";


export default function CustomComponent() {
    const componentMap = {
        hdlEmulator: <Home />,
        hdlEmulator: <GridApp />
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