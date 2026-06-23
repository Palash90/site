// WordStudy.js
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import WordQuiz from "./WordQuiz";
import SUPPORTED_LANGUAGES from "./vocab";
import { useP2P } from "../P2PContext";

export default function WordStudy() {
  const { quizState, sendStateUpdate } = useP2P();

  const screen = quizState.wordScreen;
  const words = quizState.words;
  const selectedLangs = quizState.selectedLangs;

  const handleLanguageChange = (langName, isChecked) => {
    const updatedLangs = { ...selectedLangs, [langName]: isChecked };

    let defaultWords = [];
    Object.keys(updatedLangs).forEach((lang) => {
      if (updatedLangs[lang]) {
        defaultWords = [
          ...defaultWords,
          ...SUPPORTED_LANGUAGES[lang].vocabs.map((word) => ({
            text: word,
            langCode: SUPPORTED_LANGUAGES[lang].code
          }))
        ];
      }
    });

    sendStateUpdate({
      selectedLangs: updatedLangs,
      words: defaultWords
    });
  };

  const startQuizEngine = () => {
    // Completely shuffle the words right here when hitting start
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());

    sendStateUpdate({
      wordScreen: 2,
      words: shuffledWords,
      currentWordIndex: 0,
      score: 0,
      total: 0,
      correct: 0,
      wrong: 0,
      quizEnded: false,
      status: 'In Progress',
      answer: ''
    });
  };

  if (screen === 2) {
    return <WordQuiz />;
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h2>Word Quiz Setup</h2>
        </Col>
      </Row>

      {/* Language Selection Checkboxes */}
      <Row className="mt-3">
        <Col>
          <h5>Select Practice Languages:</h5>
          <div className="d-flex gap-3 my-2">
            {Object.keys(SUPPORTED_LANGUAGES).map((langName) => (
              <Form.Check
                type="checkbox"
                id={`lang-${langName}`}
                key={langName}
                label={langName}
                checked={!!selectedLangs[langName]}
                onChange={(e) => handleLanguageChange(langName, e.target.checked)}
              />
            ))}
          </div>
          <small className="text-muted">Checking a language adds its core characters to your test pool.</small>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <h4>Target Test Pool ({words.length} items):</h4>
          <div className="border p-2 rounded bg-transparent" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {words.length === 0 ? <span className="text-muted">No items added yet.</span> : (
              <div className="d-flex flex-wrap gap-2">
                {words.map((word, i) => (
                  <span key={i} className="badge border bg-dark text-light p-8 d-flex align-items-center gap-1">
                    {word.text}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.6rem' }}
                      onClick={() => sendStateUpdate({
                        words: words.filter((_, idx) => idx !== i)
                      })}
                    ></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Button
            variant="success"
            size="lg"
            onClick={startQuizEngine}
            disabled={words.length === 0}
          >
            Start Quiz
          </Button>
        </Col>
      </Row>
    </Container>
  );
}