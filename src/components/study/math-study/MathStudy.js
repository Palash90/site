import { useEffect, useState } from "react";
import MathQuiz from "./MathQuiz";
import Form from 'react-bootstrap/Form';
import { Alert, Button, Col, Container, Row } from "react-bootstrap";

export default function MathStudy() {
    const [screen, setScreen] = useState(1);

    const [operations, setOperations] = useState([]);

    const [allowNegative, setAllowNegative] = useState(false);
    const [min1, setMin1] = useState(0)
    const [max1, setMax1] = useState(5)
    const [min2, setMin2] = useState(0)
    const [max2, setMax2] = useState(5)

    const [addSelected, setAddSelected] = useState(false)
    const [subSelected, setSubSelected] = useState(false)
    const [mulSelected, setMulSelected] = useState(false)
    const [divSelected, setDivSelected] = useState(false)

    const [error, setError] = useState('')

    useEffect(() => {
        if (screen === 1) {
            setOperations([]);
            setAllowNegative(false);
            setMin1(0);
            setMax1(5);
            setMin2(0);
            setMax2(5);
            setAddSelected(false);
            setSubSelected(false);
            setMulSelected(false);
            setDivSelected(false);
            setError('');
        }
    }, [screen])


    if (screen === 2) {
        return <MathQuiz
            min1={min1}
            max1={max1}
            min2={min2}
            max2={max2}
            allowDecimal={false}
            decimalPlace={0}
            allowNegative={allowNegative}
            operations={operations}
            setScreen={setScreen}
        />
    }

    return <Container>
        <Row>
            <Col>
                <Form.Check
                    type="switch"
                    id="custom-switch"
                    label="Allow Negative Values"
                    value={allowNegative}
                    onChange={(e) => {
                        var newAllowNegative = !allowNegative

                        if (!newAllowNegative) {
                            setMin1(0);
                            setMin2(0);
                        }

                        setAllowNegative(newAllowNegative)
                    }}
                />
            </Col>
        </Row>

        <Row>
            <Col>
                <Form.Label>Range of First Number: {min1} - {max1}</Form.Label>
            </Col>
            <Row>
                <Col>
                    <Form.Range
                        value={min1}
                        onChange={(e) => setMin1(e.target.value)}
                        min={-100}
                        max={0}
                        disabled={!allowNegative}
                    />
                </Col>
                <Col>
                    <Form.Range
                        value={max1}
                        onChange={(e) => setMax1(e.target.value)}
                        min={5}
                        max={100}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Label>Range of Second Number: {min2} - {max2}</Form.Label>
                </Col>
                <Row>
                    <Col>
                        <Form.Range
                            value={min2}
                            onChange={(e) => setMin2(e.target.value)}
                            min={-100}
                            max={0}
                            disabled={!allowNegative}
                        />
                    </Col>
                    <Col>
                        <Form.Range
                            value={max2}
                            onChange={(e) => setMax2(e.target.value)}
                            min={5}
                            max={100}
                        />
                    </Col>
                </Row>
            </Row>

            <Row>
                <Col>
                    Select Operations:
                </Col>
                <Col>
                    <Form.Check
                        type='checkbox'
                        label={`Addition`}
                        value={addSelected}
                        onChange={(e) => setAddSelected(e.target.checked)}
                    />
                </Col>
                <Col>
                    <Form.Check
                        type='checkbox'
                        label={`Subtraction`}
                        value={subSelected}
                        onChange={(e) => setSubSelected(e.target.checked)}
                    />
                </Col>
                <Col>
                    <Form.Check
                        type='checkbox'
                        label={`Multiplication`}
                        value={mulSelected}
                        onChange={(e) => setMulSelected(e.target.checked)}
                    />
                </Col>
                <Col>
                    <Form.Check
                        type='checkbox'
                        label={`Division`}
                        value={divSelected}
                        onChange={(e) => setDivSelected(e.target.checked)}
                    />
                </Col>
            </Row>

        </Row>

        {
            error.length > 0 ? <Alert variant='danger'>
                {error}
            </Alert> : <></>
        }

        <Button onClick={() => {
            var newOperations = [];
            if (addSelected) {
                newOperations.push('a');
            }
            if (subSelected) {
                newOperations.push('s');
            }
            if (mulSelected) {
                newOperations.push('m');
            }
            if (divSelected) {
                newOperations.push('d');
            }
            if (newOperations.length > 0) {
                setOperations(newOperations);
                setScreen(2);
                setError('');
            } else {
                setError('Please select at least one operation')
            }

        }}>Start Quiz</Button>
    </Container>
}