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

    const [addition, setAddition] = useState(0);
    const [subtraction, setSubtraction] = useState(0);
    const [multiplication, setMultiplication] = useState(0);
    const [division, setDivision] = useState(0);

    const [totalCorrect, setTotalCorrect] = useState(0);
    const [additionCorrect, setAdditionCorrect] = useState(0);
    const [subtractionCorrect, setSubtractionCorrect] = useState(0);
    const [multiplicationCorrect, setMultiplicationCorrect] = useState(0);
    const [divisionCorrect, setDivisionCorrect] = useState(0);

    const [totalWrong, setTotalWrong] = useState(0);
    const [additionWrong, setAdditionWrong] = useState(0);
    const [subtractionWrong, setSubtractionWrong] = useState(0);
    const [multiplicationWrong, setMultiplicationWrong] = useState(0);
    const [divisionWrong, setDivisionWrong] = useState(0);

    const [detailsRow, setDetailsRow] = useState(false)

    const generateQA = () => {
        const getRandomNumber = (min, max, allowDecimal, decimalPlace) => {
            var rand = parseFloat(Math.random() * (max - min + 1) + min);
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
                setAddition(addition + 1)
                break;
            case 'subtract':
                if (!props.allowNegative && num1 < num2) {
                    [num1, num2] = [num2, num1]
                }
                setQuestion(`What is the value of ${num1} - ${num2}?`);
                setCorrectAnswer(num1 - num2);
                setSubtraction(subtraction + 1)
                break;
            case 'multiply':
                setQuestion(`What is the value of ${num1} * ${num2}?`);
                setCorrectAnswer(num1 * num2);
                setMultiplication(multiplication + 1)
                break;
            case 'divide':
                num2 = num2 === 0 ? 5 : num2
                setQuestion(`What is the value of ${num1} / ${num2}?`);
                setCorrectAnswer([Math.floor(num1 / num2), num1 % num2]);
                setDivision(division + 1)
                break;
            default:
                setQuestion(`No operations.`);
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

        if (correct) {
            setTotalCorrect(totalCorrect + 1)
        } else {
            setTotalWrong(totalWrong + 1)
        }

        switch (operation) {
            case 'add':
                if (correct) {
                    setAdditionCorrect(additionCorrect + 1)
                } else {
                    setAdditionWrong(additionWrong + 1)
                }
                break;
            case 'subtract':
                if (correct) {
                    setSubtractionCorrect(subtractionCorrect + 1)
                } else {
                    setSubtractionWrong(subtractionWrong + 1)
                }
                break;
            case 'multiply':
                if (correct) {
                    setMultiplicationCorrect(multiplicationCorrect + 1)
                } else {
                    setMultiplicationWrong(multiplicationWrong + 1)
                }
                break;
            case 'divide':
                if (correct) {
                    setDivisionCorrect(divisionCorrect + 1)
                } else {
                    setDivisionWrong(divisionWrong + 1)
                }
                break;
            default:
                break;
        }

        setScore(correct ? score + 1 : score - 1);
        setAnswer('');
        setRemainder('');
        generateQA();
    }

    const individualScoreElement = (props) => {
        return <><Row>
            <Col><span>{props.elem}: {props.score}</span></Col>
        </Row>
            <Row xs={2}>
                <Col><span style={{ color: 'lightgreen' }}>Correct: {props.correct}</span></Col>
                <Col><span style={{ color: 'red' }}>Wrong: {props.wrong}</span></Col>
            </Row>
        </>
    }

    return <Container className="justify-content-md-center">
        <Row >
            <Col>
                {individualScoreElement({ elem: 'Total', score: total, correct: totalCorrect, wrong: totalWrong })}
            </Col>
            <Col>
                {scorePanel()}
            </Col>
            <Col>
                <Button onClick={() => setDetailsRow(!detailsRow)}>
                    {detailsRow ? "Hide Details" : "Show Details"}
                </Button>
            </Col>

            <Col>
                <Button onClick={() => props.setScreen(1)}>
                    <IoRefreshCircleOutline />
                </Button>
            </Col>
        </Row>
        {
            detailsRow ? <Row className="mt-4 mb-4">
                {
                    props.operations.indexOf('add') >= 0 ? <Col>
                        {individualScoreElement({ elem: 'Addition', score: addition, correct: additionCorrect, wrong: additionWrong })}
                    </Col> : <></>
                }

                {
                    props.operations.indexOf('subtract') >= 0 ? <Col>
                        {individualScoreElement({ elem: 'Subtraction', score: subtraction, correct: subtractionCorrect, wrong: subtractionWrong })}
                    </Col> : <></>
                }

                {
                    props.operations.indexOf('multiply') >= 0 ? <Col>
                        {individualScoreElement({ elem: 'Multiplication', score: multiplication, correct: multiplicationCorrect, wrong: multiplicationWrong })}
                    </Col> : <></>
                }

                {
                    props.operations.indexOf('divide') >= 0 ? <Col>
                        {individualScoreElement({ elem: 'Division', score: division, correct: divisionCorrect, wrong: divisionWrong })}
                    </Col> : <></>
                }
            </Row> : <></>
        }
        <Row className="mt-4">
            <Col>
                <h1>{question}</h1>
            </Col>
        </Row>
        <Row>
            <Col>
                <Form.Control
                    type="number"
                    placeholder={operation === 'divide' ? "Quotient" : "Answer"}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)} />
            </Col>
            {
                operation === 'divide' ? <Col>
                    <Form.Control
                        type="number"
                        placeholder={operation === 'divide' ? "Remainder" : ""}
                        value={remainder}
                        onChange={(e) => setRemainder(e.target.value)} />
                </Col> : <></>
            }
            <Col>
                <Button
                    onClick={() => checkAnswer()}
                    disabled={answer.length < 1}
                >
                    Check
                </Button>
            </Col>
        </Row>
    </Container>
}