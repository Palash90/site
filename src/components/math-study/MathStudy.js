import { useState } from "react";
import MathQuiz from "./MathQuiz";
import Form from 'react-bootstrap/Form';
import { Button, Col, Container, Row } from "react-bootstrap";

export default function MathStudy() {
    const [screen, setScreen] = useState(1);

    const [allowNegative, setAllowNegative] = useState(false);
    const [min1, setMin1] = useState(0)
    const [max1, setMax1] = useState(1)
    const [min2, setMin2] = useState(0)
    const [max2, setMax2] = useState(1)

    if (screen === 2) {
        return <MathQuiz
            min1={min1}
            max1={max1}
            min2={min2}
            max2={max2}
            allowDecimal={false}
            decimalPlace={0}
            allowNegative={allowNegative}
            operations={['add', 'subtract', 'multiply', 'divide']}
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
                    disabled={true}
                    onChange={(e) => {
                        //Todo --- Have to check why this is not working
                        console.log(e.target.value)
                        if (!e.target.value) {
                            setMin1(0);
                            setMin2(0);
                        }
                        setAllowNegative(e.target.value)
                    }}
                />
            </Col>
        </Row>

        <Row>
            <Col>
                <Form.Label>Range of First Number</Form.Label>
            </Col>
            <Col>
                <Form.Label>{min1}</Form.Label>
            </Col>
            <Col>
                <Form.Label>{max1}</Form.Label>
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
                        min={1}
                        max={100}
                    />
                </Col>
            </Row>
        </Row>

        <Row>
            <Col>
                <Form.Label>Range of Second Number</Form.Label>
            </Col>
            <Col>
                <Form.Label>{min2}</Form.Label>
            </Col>
            <Col>
                <Form.Label>{max2}</Form.Label>
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
                        min={1}
                        max={100}
                    />
                </Col>
            </Row>
        </Row>


        <Button onClick={() => setScreen(2)}>Start Quiz</Button>
    </Container>
}