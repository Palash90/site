import { useState } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import WordQuiz from "./WordQuiz";

// Language configuration data
const SUPPORTED_LANGUAGES = {
  English: {
    code: 'en-US',
    vocabs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  },
  Hindi: {
    code: 'hi-IN',
    vocabs: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ']
  },
  Kannada: {
    code: 'kn-IN',
    vocabs: ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ']
  },
  Bengali: {
    code: 'bn-IN',
    vocabs: ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ', 'ক', 'খ', 'গ', 'घ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ']
  }
};

export default function WordStudy() {
  const [screen, setScreen] = useState(1);
  const [words, setWords] = useState([]);
  const [wordInput, setWordInput] = useState('');
  
  // Track selected languages and current active locale code
  const [selectedLangs, setSelectedLangs] = useState({});
  const [activeLangCode, setActiveLangCode] = useState('en-US');

  const handleLanguageChange = (langName, isChecked) => {
    // Update checkbox state
    const updatedLangs = { ...selectedLangs, [langName]: isChecked };
    setSelectedLangs(updatedLangs);

    // If checked, update active langCode for the speech recognition hook
    if (isChecked) {
      setActiveLangCode(SUPPORTED_LANGUAGES[langName].code);
    }

    // Recalculate default alphabet word list based on checked languages
    let defaultWords = [];
    Object.keys(updatedLangs).forEach((lang) => {
      if (updatedLangs[lang]) {
        defaultWords = [...defaultWords, ...SUPPORTED_LANGUAGES[lang].vocabs];
      }
    });

    setWords(defaultWords);
  };

  const handleAddWord = () => {
    if (wordInput.trim()) {
      setWords([...words, wordInput.trim()]);
      setWordInput('');
    }
  };

  if (screen === 2) {
    // Pass both the generated words and the active language code to the Quiz
    return <WordQuiz words={words} langCode={activeLangCode} setScreen={setScreen} />;
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
          <Form.Label><strong>Add Custom Words to Practice:</strong></Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Enter a custom word/character"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
            />
            <Button onClick={handleAddWord}>Add</Button>
          </div>
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
                    {word}
                    <button 
                      type="button" 
                      className="btn-close btn-close-white ms-1" 
                      style={{ fontSize: '0.6rem' }} 
                      onClick={() => setWords(words.filter((_, idx) => idx !== i))}
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
          <Button variant="success" size="lg" onClick={() => setScreen(2)} disabled={words.length === 0}>
            Start Quiz
          </Button>
        </Col>
      </Row>
    </Container>
  );
}