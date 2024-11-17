import { useEffect, useState } from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { IoRefreshCircleOutline } from "react-icons/io5";
import ScorePanel from "./ScorePanel";
import Score from "./IndividualScoreElement";
import MathQuizModal from "./MathQuizModal";

export default function MathQuiz(props) {
    const [questionAnswers, setQuestionAnswers] = useState([]);
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
            case 'a':
                setQuestion(`What is the value of ${num1} + ${num2}?`);
                setCorrectAnswer(num1 + num2);
                setAddition(addition + 1)
                break;
            case 's':
                if (!props.allowNegative && num1 < num2) {
                    [num1, num2] = [num2, num1]
                }
                setQuestion(`What is the value of ${num1} - ${num2}?`);
                setCorrectAnswer(num1 - num2);
                setSubtraction(subtraction + 1)
                break;
            case 'm':
                setQuestion(`What is the value of ${num1} * ${num2}?`);
                setCorrectAnswer(num1 * num2);
                setMultiplication(multiplication + 1)
                break;
            case 'd':
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

    const checkAnswer = (skip, end) => {
        var correct = false;
        if (!skip || !end) {
            if (operation === 'd') {
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
                case 'a':
                    if (correct) {
                        setAdditionCorrect(additionCorrect + 1)
                    } else {
                        setAdditionWrong(additionWrong + 1)
                    }
                    break;
                case 's':
                    if (correct) {
                        setSubtractionCorrect(subtractionCorrect + 1)
                    } else {
                        setSubtractionWrong(subtractionWrong + 1)
                    }
                    break;
                case 'm':
                    if (correct) {
                        setMultiplicationCorrect(multiplicationCorrect + 1)
                    } else {
                        setMultiplicationWrong(multiplicationWrong + 1)
                    }
                    break;
                case 'd':
                    if (correct) {
                        setDivisionCorrect(divisionCorrect + 1)
                    } else {
                        setDivisionWrong(divisionWrong + 1)
                    }
                    break;
                default:
                    break;
            }
        }

        var newQA = [...questionAnswers,
        {
            question: question,
            answer: operation === 'd' ? `Q: ${answer} R: ${remainder}` : answer,
            correctAnswer: operation === 'd' ? `Q: ${correctAnswer[0]} R: ${correctAnswer[1]}` : correctAnswer,
            operation: operation,
            correct: correct,
            skipped: skip || end
        }];
        setQuestionAnswers(newQA);

        if (!(skip || end)) {
            setScore(correct ? score + 1 : score - 1);
        }

        setAnswer('');
        setRemainder('');

        if (!end) {
            generateQA();
        } else {
            setDetailsRow(true);
        }
    }

    return <Container className="justify-content-md-center">
        <Row >
            <Col>
                <Score elem='Total'
                    score={total}
                    correct={totalCorrect}
                    wrong={totalWrong} />
            </Col>
            <Col>
                <ScorePanel score={score} />
            </Col>
        </Row>

        <Row className="mt-4">
            <Col>
                <h1>{question}</h1>
            </Col>
        </Row>
        <Row>
            <Col>
                <Form.Control
                    type="number"
                    placeholder={operation === 'd' ? "Quotient" : "Answer"}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)} />
            </Col>
            {
                operation === 'd' ? <Col>
                    <Form.Control
                        type="number"
                        placeholder={operation === 'd' ? "Remainder" : ""}
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
            <Col>
                <Button
                    onClick={() => checkAnswer(true)}
                >
                    Skip
                </Button>
            </Col>
        </Row>
        <br />
        <Row>
            <Col>
                <Button
                    onClick={() => checkAnswer(true, true)}
                >
                    End
                </Button>
            </Col>
        </Row>
        <MathQuizModal
            operations={props.operations}

            addition={addition}
            additionCorrect={additionCorrect}
            additionWrong={additionWrong}

            subtraction={subtraction}
            subtractionCorrect={subtractionCorrect}
            subtractionWrong={subtractionWrong}

            multiplication={multiplication}
            multiplicationCorrect={multiplicationCorrect}
            multiplicationWrong={multiplicationWrong}

            division={division}
            divisionCorrect={divisionCorrect}
            divisionWrong={divisionWrong}

            detailsRow={detailsRow}
            setDetailsRow={setDetailsRow}

            questionAnswers={questionAnswers}

            setScreen={props.setScreen}
        />
    </Container>
}