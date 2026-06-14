import { useState, useEffect } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import WordQuiz from "./WordQuiz";

export default function WordStudy() {
  const [screen, setScreen] = useState(1);
  const [words, setWords] = useState(['apple', 'banana', 'cherry', 'dog', 'elephant']);
  const [wordInput, setWordInput] = useState('');

  const handleAddWord = () => {
    if (wordInput.trim()) {
      setWords([...words, wordInput.trim()]);
      setWordInput('');
    }
  };

  if (screen === 2) {
    return <WordQuiz words={words} setScreen={setScreen} />;
  }

  return <Container>
    <Row>
      <Col>
        <h2>Word Quiz Setup</h2>
      </Col>
    </Row>

    <Row className="mt-3">
      <Col>
        <Form.Label>Add Words to Practice:</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter a word"
          value={wordInput}
          onChange={(e) => setWordInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
        />
        <Button className="mt-2" onClick={handleAddWord}>
          Add Word
        </Button>
      </Col>
    </Row>

    <Row className="mt-3">
      <Col>
        <h4>Words in Quiz ({words.length}):</h4>
        <ul>
          {words.map((word, i) => (
            <li key={i}>
              {word}
              <Button
                variant="danger"
                size="sm"
                className="ms-2"
                onClick={() => setWords(words.filter((_, idx) => idx !== i))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Col>
    </Row>

    <Row className="mt-3">
      <Col>
        <Button onClick={() => setScreen(2)} disabled={words.length === 0}>
          Start Quiz
        </Button>
      </Col>
    </Row>
  </Container>;
}