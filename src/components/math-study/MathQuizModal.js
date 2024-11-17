import { Container, Modal, Row, Col, Button } from "react-bootstrap";
import IndividualScoreElement from "./IndividualScoreElement";

export default function MathQuizModal(props) {
    return (
        <>
            <Modal show={props.detailsRow}
                onHide={() => props.setDetailsRow(false)}
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
                                props.operations.indexOf('add') >= 0 ? <Col>
                                    <IndividualScoreElement
                                        elem='Addition'
                                        score={props.addition}
                                        correct={props.additionCorrect}
                                        wrong={props.additionWrong} />
                                </Col> : <></>
                            }

                            {
                                props.operations.indexOf('subtract') >= 0 ? <Col>
                                    <IndividualScoreElement
                                        elem='Subtraction'
                                        score={props.subtraction}
                                        correct={props.subtractionCorrect}
                                        wrong={props.subtractionWrong} />
                                </Col> : <></>
                            }

                            {
                                props.operations.indexOf('multiply') >= 0 ? <Col>
                                    <IndividualScoreElement
                                        elem='Multiplication'
                                        score={props.multiplication}
                                        correct={props.multiplicationCorrect}
                                        wrong={props.multiplicationWrong} />
                                </Col> : <></>
                            }

                            {
                                props.operations.indexOf('divide') >= 0 ? <Col>
                                    <IndividualScoreElement
                                        elem='Division'
                                        score={props.division}
                                        correct={props.divisionCorrect}
                                        wrong={props.divisionWrong} />
                                </Col> : <></>
                            }
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => props.setDetailsRow(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}