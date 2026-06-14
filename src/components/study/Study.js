// Study.js
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import MathStudy from "./math-study/MathStudy";
import WordStudy from "./word-study/WordStudy";
import { P2PProvider, useP2P } from "./P2PContext";
import { QRCodeSVG } from 'qrcode.react';

function StudyAppContent() {
  const { peerId, isConnected, quizState, getPairingUrl, sendStateUpdate } = useP2P();

  const activeApp = quizState.activeApp || 'menu';
  const setActiveApp = (activeApp) => {
    sendStateUpdate({ ...quizState, activeApp: activeApp })
  };

  // Detect URL Role flag
  const urlParams = new URLSearchParams(window.location.search);
  const isParentView = urlParams.get('role') === 'parent';

  // --- PARENT MONITORING SCREEN ROUTE ---
  if (isParentView) {
    return (
      <Container className="py-5 max-width-md">
        <Card className="shadow border-0 bg-dark text-white p-4 text-center">
          <Card.Body>
            <h2 className="mb-2 text-info fw-bold">🛡️ Parent Monitoring Dashboard</h2>
            <p className={`${isConnected ? 'text-success' : 'text-warning'} fw-bold`}>
              {isConnected ? "● Linked Live to Kid's Device" : "⏳ Disconnected. Waiting for child link..."}
            </p>
            <hr className="border-secondary" />

            <Row className="g-3 my-2">
              <Col xs={6}>
                <Card className="bg-secondary text-white border-0 py-3">
                  <h5>Current Status</h5>
                  <Badge bg={quizState.status === 'Completed' ? 'success' : 'primary'} className="fs-6">
                    {quizState.status}
                  </Badge>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="bg-secondary text-white border-0 py-3">
                  <h5>Active Word</h5>
                  <p className="fs-4 fw-bold text-warning m-0">{quizState.currentWord || "N/A"}</p>
                </Card>
              </Col>
              <Col xs={4}>
                <Card className="bg-opacity-10 bg-light text-white border-0 py-2">
                  <h6>Progress</h6>
                  <p className="fs-5 m-0">{quizState.questionNumber} / {quizState.totalWords || 0}</p>
                </Card>
              </Col>
              <Col xs={4}>
                <Card className="bg-opacity-10 bg-light text-white border-0 py-2">
                  <h6>Stars ⭐</h6>
                  <p className="fs-5 m-0 text-warning fw-bold">{quizState.score}</p>
                </Card>
              </Col>
              <Col xs={4}>
                <Card className="bg-opacity-10 bg-light text-white border-0 py-2">
                  <h6>Accuracy</h6>
                  <p className="fs-5 m-0 text-success fw-bold">{quizState.correct}✅ / {quizState.wrong}❌</p>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // --- STANDARD KID APP ROUTES ---
  return (
    <div className="position-relative" style={{ minHeight: '100vh' }}>
      {/* Active Application Render Pipeline */}
      {activeApp === 'math' && (
        <div>
          <div className="p-3 bg-dark border-bottom d-flex justify-content-between align-items-center">
            <h4 className="m-0 text-primary">🔢 Math Practice Mode</h4>
            <Button variant="outline-secondary" size="sm" onClick={() => setActiveApp('menu')}>
              ← Study App Menu
            </Button>
          </div>
          <Container className="text-center mt-5">
            <MathStudy />
          </Container>
        </div>
      )}

      {activeApp === 'word' && (
        <div>
          <div className="p-3 bg-dark border-bottom d-flex justify-content-between align-items-center">
            <h4 className="m-0 text-success">🗣️ Language & Word Practice</h4>
            <Button variant="outline-secondary" size="sm" onClick={() => setActiveApp('menu')}>
              ← Study App Menu
            </Button>
          </div>
          <WordStudy />
        </div>
      )}

      {activeApp === 'menu' && (
        <Container className="py-5">
          <Row className="mb-5 text-center">
            <Col>
              <h1 className="display-4 fw-bold bg-dark text-muted">🎯 Interactive Learning Hub</h1>
              <p className="text-muted fs-5">Select a mode below to start practicing.</p>
            </Col>
          </Row>

          <Row className="justify-content-center g-4 bg-dark">
            <Col md={5} sm={12}>
              <Card className="h-100 shadow-sm border-0 transition-hover bg-dark text-muted">
                <Card.Body className="d-flex flex-column text-center p-4">
                  <div className="display-3 my-3 text-primary">📐</div>
                  <Card.Title className="fs-3 fw-semibold text-primary">Math Study</Card.Title>
                  <Card.Text className="text-muted my-3 flex-grow-1">Sharpen your mathematical intuition!</Card.Text>
                  <Button variant="primary" size="lg" className="w-100 mt-auto py-2 shadow-sm" onClick={() => setActiveApp('math')}>
                    Start Math App
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={5} sm={12}>
              <Card className="h-100 shadow-sm border-0 transition-hover bg-dark text-muted">
                <Card.Body className="d-flex flex-column text-center p-4">
                  <div className="display-3 my-3 text-success">📚</div>
                  <Card.Title className="fs-3 fw-semibold text-success">Word Study</Card.Title>
                  <div className="my-2 d-flex flex-wrap justify-content-center gap-1">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">English</span>
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Hindi</span>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Kannada</span>
                    <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">Bengali</span>
                  </div>
                  <Card.Text className="text-muted my-3 flex-grow-1">Improve spelling and speech accuracy.</Card.Text>
                  <Button variant="success" size="lg" className="w-100 mt-auto py-2 shadow-sm" onClick={() => setActiveApp('word')}>
                    Start Word App
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}

      {/* --- CORNER PARENT SYNC WIDGET (FIXED CLIPPING) --- */}
      <div
        className="position-fixed bottom-0 end-0 m-3 z-3 shadow-lg bg-white text-center"
        style={{
          borderRadius: '16px',
          width: '130px',
          padding: '12px 8px 14px 8px', // Increased bottom padding to prevent cutoff
          border: '2px solid #eaeaea',
          bottom: '10px' // Ensures it sits comfortably above the screen edge
        }}
      >
        {isConnected ? (
          <div className="py-2">
            <span className="d-block text-success fw-bold small">● Monitoring</span>
            <span style={{ fontSize: '10px' }} className="text-muted">Parent Connected</span>
          </div>
        ) : (
          peerId && (
            <div className="d-flex flex-column align-items-center justify-content-center">
              <span className="d-block text-muted fw-bold mb-2" style={{ fontSize: '10px', lineHeight: '1.1' }}>
                Parent Link QR
              </span>
              <div style={{ padding: '4px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <QRCodeSVG value={getPairingUrl(peerId)} size={95} />
              </div>
              <span className="d-block text-danger mt-2 fw-bold" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                SCAN TO WATCH
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Wrap the entry layout context provider cleanly
export default function StudyApp() {
  return (
    <P2PProvider>
      <StudyAppContent />
    </P2PProvider>
  );
}