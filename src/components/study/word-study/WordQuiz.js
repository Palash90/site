import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Alert } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { useSpeechRecognition } from "./useSpeechRecognition";
import ScorePanel from "../ScorePanel";
import Score from "../IndividualScoreElement";

export default function WordQuiz(props) {
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);

  const { transcript, isListening, error, startListening, stopListening } = useSpeechRecognition();

  // Generate quiz words based on props
  useEffect(() => {
    const generateWords = () => {
      let newWords = [];
      // Example: Generate words from a list
      const wordList = props.words || ['apple', 'banana', 'cherry', 'dog', 'elephant'];
      newWords = wordList.sort(() => 0.5 - Math.random()).slice(0, 10);
      setWords(newWords);
      if (newWords.length > 0) {
        setCurrentWord(newWords[0]);
      }
    };
    generateWords();
  }, [props.words]);

  const checkAnswer = (skip = false, end = false) => {
    let isCorrect = false;

    if (!skip && !end) {
      // Compare normalized answers
      isCorrect = answer.toLowerCase().trim() === currentWord.toLowerCase().trim();
      
      if (isCorrect) {
        setScore(score + 1);
        setCorrect(correct + 1);
      } else {
        setScore(score - 1);
        setWrong(wrong + 1);
      }
    }

    setTotal(total + 1);
    setAnswer('');

    if (!end && currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentWord(words[currentWordIndex + 1]);
    } else {
      setQuizEnded(true);
    }
  };

  // Auto-update answer when speech recognition captures text
  useEffect(() => {
    if (transcript && !isListening) {
      setAnswer(transcript);
    }
  }, [transcript, isListening]);

  if (quizEnded) {
    return <Container className="justify-content-md-center">
      <Row>
        <Col>
          <h2>Quiz Complete!</h2>
          <p>Score: {score}/{total}</p>
          <p>Correct: {correct}</p>
          <p>Wrong: {wrong}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={() => props.setScreen(1)}>Back to Setup</Button>
        </Col>
      </Row>
    </Container>;
  }

  return <Container className="justify-content-md-center">
    <Row>
      <Col>
        <Score elem='Total' score={total} correct={correct} wrong={wrong} />
      </Col>
      <Col>
        <ScorePanel score={score} />
      </Col>
    </Row>

    <Row className="mt-4">
      <Col>
        <h1>Spell: {currentWord}</h1>
      </Col>
    </Row>

    {error && <Row><Col><Alert variant="danger">{error}</Alert></Col></Row>}

    <Row>
      <Col>
        <Form.Control
          type="text"
          placeholder="Type or speak your answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </Col>
      <Col>
        <Button
          variant={isListening ? "danger" : "primary"}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? "Stop Listening" : "🎤 Listen"}
        </Button>
      </Col>
      <Col>
        <Button onClick={() => checkAnswer()} disabled={!answer}>
          Check
        </Button>
      </Col>
    </Row>

    <Row className="mt-2">
      <Col>
        <Button variant="warning" onClick={() => checkAnswer(true)}>
          Skip
        </Button>
      </Col>
      <Col>
        <Button variant="danger" onClick={() => checkAnswer(false, true)}>
          End Quiz
        </Button>
      </Col>
    </Row>
  </Container>;
}