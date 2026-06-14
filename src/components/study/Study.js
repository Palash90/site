import { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import MathStudy from "./math-study/MathStudy"
import WordStudy from "./word-study/WordStudy";

export default function StudyApp() {
  // States: 'menu' (shows choices), 'math', 'word'
  const [activeApp, setActiveApp] = useState('menu');

  // Render the Math Study Application
  if (activeApp === 'math') {
    return (
      // Replace with your actual Math Study component wrapper
      <div>
        <div className="p-3 bg-dark border-bottom d-flex justify-content-between align-items-center">
          <h4 className="m-0 text-primary">🔢 Math Practice Mode</h4>
          <Button variant="outline-secondary" size="sm" onClick={() => setActiveApp('menu')}>
            ← Study App Menu
          </Button>
        </div>
        {/* <MathStudy /> */}
        <Container className="text-center mt-5">
          <MathStudy />
        </Container>
      </div>
    );
  }

  // Render the Word Study Application
  if (activeApp === 'word') {
    return (
      <div>
        <div className="p-3 bg-dark border-bottom d-flex justify-content-between align-items-center">
          <h4 className="m-0 text-success">🗣️ Language & Word Practice</h4>
          <Button variant="outline-secondary" size="sm" onClick={() => setActiveApp('menu')}>
            ← Study App Menu
          </Button>
        </div>
        <WordStudy />
      </div>
    );
  }

  // Render the Selection Hub Menu Dashboard
  return (
    <Container className="py-5">
      <Row className="mb-5 text-center">
        <Col>
          <h1 className="display-4 fw-bold bg-dark text-muted">🎯 Interactive Learning Hub</h1>
          <p className="text-muted fs-5">Select a mode below to start practicing.</p>
        </Col>
      </Row>

      <Row className="justify-content-center g-4 bg-dark">
        {/* Math Study Card */}
        <Col md={5} sm={12}>
          <Card className="h-100 shadow-sm border-0 transition-hover bg-dark text-muted">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="display-3 my-3 text-primary">📐</div>
              <Card.Title className="fs-3 fw-semibold text-primary">Math Study</Card.Title>
              <Card.Text className="text-muted my-3 flex-grow-1">
                Sharpen your mathematical intuition!
              </Card.Text>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 mt-auto py-2 shadow-sm"
                onClick={() => setActiveApp('math')}
              >
                Start Math App
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Word Study Card */}
        <Col md={5} sm={12}>
          <Card className="h-100 shadow-sm border-0 transition-hover bg-dark text-muted">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="display-3 my-3 text-success">📚</div>
              <Card.Title className="fs-3 fw-semibold text-success">Word Study</Card.Title>
              <div className="my-2 d-flex flex-wrap justify-content-center gap-1">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">English</span>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Hindi (हिंदी)</span>
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Kannada (ಕನ್ನಡ)</span>
                <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">Bengali (বাংলা)</span>
              </div>
              <Card.Text className="text-muted my-3 flex-grow-1">
                Improve spelling and speech accuracy.
              </Card.Text>
              <Button 
                variant="success" 
                size="lg" 
                className="w-100 mt-auto py-2 shadow-sm"
                onClick={() => setActiveApp('word')}
              >
                Start Word App
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}