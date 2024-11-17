import { Container, Modal, Row, Col, Button, Table } from "react-bootstrap";
import Score from "./IndividualScoreElement";

export default function MathQuizModal(props) {
    var operation = '';
    switch (props.operation) {
        case 'a':
            operation = "Addition"
            break;
        case 's':
             operation = "Subtraction"
            break;
        case 'm':
             operation = "Multiplication"
            break;
        case 'd':
             operation = "Division"
            break;
        default:
            operation='';
            break;
    }
    return (
        <>
            <Modal show={props.detailsRow}
                backdrop="static"
                onHide={() => {
                    props.setDetailsRow(false)
                    props.setScreen(1)
                }}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header closeButton>
                    <Modal.Title>Score</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{
                    maxHeight: 'calc(100vh - 210px)',
                    overflowY: 'auto'
                }}>
                    <Container>
                        <Row className="mt-4 mb-4">
                            {
                                props.operations.indexOf('a') >= 0 ? <Col>
                                    <Score
                                        elem='Addition'
                                        score={props.addition}
                                        correct={props.additionCorrect}
                                        wrong={props.additionWrong} />
                                </Col> : <></>
                            }

                            {
                                props.operations.indexOf('s') >= 0 ? <Col>
                                    <Score
                                        elem='Subtraction'
                                        score={props.subtraction}
                                        correct={props.subtractionCorrect}
                                        wrong={props.subtractionWrong} />
                                </Col> : <></>
                            }

                            {
                                props.operations.indexOf('m') >= 0 ? <Col>
                                    <Score
                                        elem='Multiplication'
                                        score={props.multiplication}
                                        correct={props.multiplicationCorrect}
                                        wrong={props.multiplicationWrong} />
                                </Col> : <></>
                            }

                            {
                                props.operations.indexOf('d') >= 0 ? <Col>
                                    <Score
                                        elem='Division'
                                        score={props.division}
                                        correct={props.divisionCorrect}
                                        wrong={props.divisionWrong} />
                                </Col> : <></>
                            }
                        </Row>
                        <Row>
                            <Col>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Question</th>
                                            <th>Operation</th>
                                            <th>Answer</th>
                                            <th>Correct Answer</th>
                                            <th>Skipped</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            props.questionAnswers.map((qa) => {
                                                return <tr key={qa.question + qa.answer + qa.operation}>
                                                    <td>{qa.question}</td>
                                                    <td>{operation}</td>
                                                    <td style={{ color: qa.correct ? "green" : "red", fontSize: "1.2em" }}>{qa.answer}</td>
                                                    <td style={{ fontSize: "1.2em" }}>{qa.correctAnswer}</td>
                                                    <td>{qa.skipped ? 'Skipped' : ''}</td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        props.setDetailsRow(false)
                        props.setScreen(1)
                    }}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}