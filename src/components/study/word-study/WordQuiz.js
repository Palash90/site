import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Alert, Card } from "react-bootstrap";
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

  const cardThemes = [
    {
      start: "#E8A7A1",
      end: "#9A7BB5",
      front: "#331E43"
    },

    {
      start: "#E39A77",
      end: "#E0C368",
      front: "#2B2214"
    },

    {
      start: "#88C9A1",
      end: "#65A6A3",
      front: "#152D2C"
    },
    {
      start: "#ECA191",
      end: "#D496A7",
      front: "#251216"
    },

    {
      start: "#9FA8DA",
      end: "#80DEEA",
      front: "#0D1B2A"
    }
  ];


  const random = Math.floor(Math.random() * cardThemes.length);

  const chosenTheme = cardThemes[random];


  const activeLangCode = currentWord ? currentWord.langCode : 'en-US';

  const { transcript, isListening, error, startListening, stopListening } = useSpeechRecognition(activeLangCode);

  // Generate quiz words based on props (No 10-word limit!)
  useEffect(() => {
    const generateWords = () => {
      const wordList = props.words || ['apple', 'banana', 'cherry', 'dog', 'elephant'];
      // Shuffle all words completely without slicing it to a specific limit
      const shuffledWords = [...wordList].sort(() => 0.5 - Math.random());
      setWords(shuffledWords);
      if (shuffledWords.length > 0) {
        setCurrentWord(shuffledWords[0]);
      }
    };
    generateWords();
  }, [props.words]);

  const checkAnswer = (skip = false, end = false) => {
    let isCorrect = false;
    
    if (!skip && !end) {
      isCorrect = answer.toLowerCase().trim() === currentWord.text.toLowerCase().trim();

      if (isCorrect) {
        setScore(score + 1);
        setCorrect(correct + 1);
      } else {
        // Kids don't like losing points! Optional: change to score - 0 to keep it positive
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

  useEffect(() => {
    if (transcript && transcript.trim() !== "") {
      setAnswer(transcript);
    }
  }, [transcript]);

  if (quizEnded) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: '600px' }}>
        <Card className="shadow-lg border-0 bg-gradient text-white p-4" style={{ background: `linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)`, borderRadius: '24px' }}>
          <Card.Body>
            <h2 className="display-4 mb-4 fw-bold">🌟 Super Job! 🌟</h2>
            <p className="fs-4">You practice so hard!</p>
            <hr className="border-white opacity-25" />
            <Row className="my-4">
              <Col><h3>⭐ Stars</h3><p className="display-4 fw-bold text-warning">{score}</p></Col>
              <Col><h3>✅ Correct</h3><p className="display-4 fw-bold text-light">{correct}</p></Col>
            </Row>
            <Button variant="light" size="lg" className="rounded-pill fw-bold text-danger px-4 py-2" onClick={() => props.setScreen(1)}>
              Play Again! 🚀
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '650px' }}>
      {/* Top Header stats with friendly layout */}
      <Row className="align-items-center mb-4">
        <Col xs={6}>
          <Score elem='Total' score={total} correct={correct} wrong={wrong} />
        </Col>
        <Col xs={6} className="d-flex justify-content-end">
          <ScorePanel score={score} />
        </Col>
      </Row>

      {/* The Flashy Kid-Friendly Word Card */}
      <Card
        className="text-center shadow-lg border-0 mb-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${chosenTheme.start} 0%, ${chosenTheme.end}  100%)`,
          borderRadius: '30px'
        }}
      >
        <Card.Body className="py-5 position-relative">
          <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-warning text-dark shadow px-4 py-2 border border-white fw-bold fs-6">
            Word {currentWordIndex + 1} of {words.length} 🎉
          </span>
          <p className="text-uppercase fw-bold text-white mb-2 mt-2" style={{ letterSpacing: '1.5px', opacity: 0.9, fontSize: '1.1rem' }}>
            Can you say or spell:
          </p>
          <h1 className="display-2 my-2" style={{ color: chosenTheme.front, wordBreak: 'break-word', textShadow: '2px 4px 0px rgba(0,0,0,0.15)', fontWeight: '900' }}>
            {currentWord.text}
          </h1>
        </Card.Body>
      </Card>

      {error && <Row className="mb-3"><Col><Alert variant="warning" className="text-center rounded-pill fw-bold">{error}</Alert></Col></Row>}

      {/* Interactive Controls Panel */}
      <Card className="shadow border-0 bg-dark p-3 mb-4" style={{ borderRadius: '20px' }}>
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col xs={12} md={6}>
              <Form.Control
                size="lg"
                type="text"
                placeholder={isListening ? "Listening... Speak now!" : "Click Speak 🎤"}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="border-3 text-center fw-bold text-success"
                readOnly // Changed from disabled to readOnly
                style={{ borderRadius: '15px', fontSize: '1.3rem', backgroundColor: '#fff' }}
              />
            </Col>

            <Col xs={6} md={3}>
              <Button
                size="lg"
                className="w-100 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-pill py-2 shadow-sm"
                variant={isListening ? "danger" : "primary"}
                style={{ backgroundColor: isListening ? '#ff4757' : '#54a0ff', borderColor: 'transparent' }}
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? (
                  <>
                    <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                    Listening
                  </>
                ) : "🎤 Speak"}
              </Button>
            </Col>

            <Col xs={6} md={3}>
              <Button
                size="lg"
                className="w-100 fw-bold rounded-pill py-2 shadow-sm"
                variant="warning"
                style={{ backgroundColor: '#ff9f43', borderColor: 'transparent', color: 'white' }}
                onClick={() => checkAnswer()}
                disabled={!answer.trim()}
              >
                Check ✨
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Action Controls for skip / ending quiz */}
      <Row className="g-3">
        <Col xs={6}>
          <Button variant="outline-secondary" size="md" className="w-100 rounded-pill fw-bold" onClick={() => checkAnswer(true)}>
            Next Word ⏭️
          </Button>
        </Col>
        <Col xs={6}>
          <Button variant="outline-danger" size="md" className="w-100 rounded-pill fw-bold" onClick={() => checkAnswer(false, true)}>
            Stop Playing 🛑
          </Button>
        </Col>
      </Row>
    </Container>
  );
}