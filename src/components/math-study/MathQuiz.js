import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { BiAngry } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { IoRefreshCircleOutline } from "react-icons/io5";

export default function MathQuiz(props) {
    const [question, setQuestion] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');

    const [operation, setOperation] = useState('');

    const [answer, setAnswer] = useState('');
    const [remainder, setRemainder] = useState('');

    const [total, setTotal] = useState(0);
    const [score, setScore] = useState(0);

    const generateQA = () => {
        const getRandomNumber = (min, max, allowDecimal, decimalPlace) => {
            var rand = Math.random() * (max - min + 1) + min;
            console.log(rand)
            if (allowDecimal) {
                return rand.toFixed(decimalPlace)
            } else {
                return Math.floor(rand)
            }
        }

        var num1 = getRandomNumber(props.min1, props.max1, props.allowDecimal, props.decimalPlace);
        var num2 = getRandomNumber(props.min2, props.max2, props.allowDecimal, props.decimalPlace);

        const randomOperation = props.operations[Math.floor(Math.random() * props.operations.length)];

        setOperation(randomOperation)

        switch (randomOperation) {
            case 'add':
                setQuestion(`What is the value of ${num1} + ${num2}?`);
                setCorrectAnswer(num1 + num2);
                break;
            case 'subtract':
                if (!props.allowNegative && num1 < num2) {
                    [num1, num2] = [num2, num1]
                }
                setQuestion(`What is the value of ${num1} - ${num2}?`);
                setCorrectAnswer(num1 - num2);
                break;
            case 'multiply':
                setQuestion(`What is the value of ${num1} * ${num2}?`);
                setCorrectAnswer(num1 * num2);
                break;
            case 'divide':
                num2 = num2 === 0 ? 5 : num2
                setQuestion(`What is the value of ${num1} / ${num2}?`);
                setCorrectAnswer([Math.floor(num1 / num2), num1 % num2]);
                break;
            default:
                setQuestion(`No operations`);
                break;
        }
        setTotal(total + 1)
    }

    useEffect(() => {
        generateQA();
    }, [])

    const scorePanel = () => {
        if (score === 0) {
            return <></>
        } else if (score > 0) {
            return <Row xs="auto">
                <Col><FaStar style={{ color: 'yellow' }} size={50} /></Col>
                <Col>
                    <span style={{
                        position: 'absolute',
                        color: "lightgreen",
                        fontWeight: 'bold',
                        fontSize: '20px'
                    }}>
                        {score}
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
                        {Math.abs(score)}
                    </span>
                </Col>
            </Row>
        }
    }

    const checkAnswer = () => {
        var correct = false;
        if (operation === 'divide') {
            correct = parseInt(answer) === correctAnswer[0] && parseInt(remainder) === correctAnswer[1]
        } else {
            correct = parseInt(answer) === correctAnswer
        }

        setScore(correct ? score + 1 : score - 1);
        setAnswer('');
        setRemainder('');
        generateQA();
    }

    return <Container className="justify-content-md-center">
        <Row >
            <Col>
                <span>Total: {total}</span>
            </Col>
            <Col>
                {scorePanel()}
            </Col>
            <Col>
                <Button onClick={() => props.setScreen(1)}>
                    <IoRefreshCircleOutline />
                </Button>
            </Col>
        </Row>
        <Row>
            <Col>
                <h1>{question}</h1>
            </Col>
        </Row>
        <Row>
            <Col>
                <Form.Control
                    type="text"
                    placeholder={operation === 'divide' ? "Quotient" : "Answer"}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)} />
            </Col>
            {
                operation === 'divide' ? <Col>
                    <Form.Control
                        type="text"
                        placeholder={operation === 'divide' ? "Remainder" : ""}
                        value={remainder}
                        onChange={(e) => setRemainder(e.target.value)} />
                </Col> : <></>
            }
            <Col>
                <Button onClick={() => checkAnswer()}>
                    Check
                </Button>
            </Col>
        </Row>
    </Container>
}