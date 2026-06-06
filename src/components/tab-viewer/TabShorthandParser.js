import React, { useState, useEffect } from "react";
import { parseShorthandText } from "./parseShorthandUtils";
import GuitaleleViewer from "./GuitaleleViewer";
import { Col, Container, Row } from "react-bootstrap";

export const TabShorthandParser = () => {
    const [existingScores, setExistingScores] = useState([]);
    const [shorthandText, setShorthandText] = useState("");
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState(null);

    const [name, setName] = useState("");
    const [timeSignature, setTimeSignature] = useState("4/4");
    const [instrument, setInstrument] = useState("Guitalele");
    const [capo, setCapo] = useState(0);
    const [desc, setDesc] = useState("");
    const [showFull, setShowFull] = useState(false);
    const [fullScore, setFullScore] = useState("");

    const instruments = ["Guitalele"];
    const timeSignatures = ["4/4", "3/4", "6/8", "2/4", "2/2"];
    const handleParse = () => {
        try {
            setError(null);
            var scoreText = "=".repeat(80);
            scoreText += "\nScore: " + name;
            scoreText += "\nTime Signature: " + timeSignature;
            scoreText += "\nInstrument: " + instrument;
            scoreText += "\nCapo: " + capo;
            scoreText += "\nDescription: " + desc;
            scoreText += "\n" + "=".repeat(80);
            scoreText += "\n" + shorthandText;

            setFullScore(scoreText);
            const scores = parseShorthandText(scoreText);
            console.log("Parsed Scores:", scores);

            setParsedData(scores);
        } catch (err) {
            setError(err.message || "An error occurred during parsing.");
            setParsedData(null);
        }
    };

    useEffect(() => {
        if (window.localStorage.scores) {
            setExistingScores(window.localStorage.scores);
        }
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <Container>
                <Row>
                    <Col>
                        <h2>Tab Shorthand Parser</h2>
                    </Col>
                </Row>
                <Row className="flex-nowrap">
                    <Col>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            required
                            onChange={e => setName(e.target.value)}
                        />
                    </Col>
                    <Col>
                        <label>Time Signature</label>
                        <select
                            onChange={e => setTimeSignature(e.target.value)}
                        >
                            {timeSignatures.map(t => (
                                <option value={t}>{t}</option>
                            ))}
                        </select>
                    </Col>
                    <Col>
                        <label>Instrument</label>
                        <select onChange={e => setInstrument(e.target.value)}>
                            {instruments.map(i => (
                                <option value={i}>{i}</option>
                            ))}
                        </select>
                    </Col>
                    <Col>
                        <label>Capo:</label>
                        <input
                            type="number"
                            min={0}
                            max={12}
                            value={capo}
                            onChange={e => setCapo(e.target.value)}
                        />
                    </Col>
                    <Col>
                        <label>Description</label>
                        <input
                            type="text"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <br />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <textarea
                            rows={12}
                            style={{
                                width: "100%",
                                fontFamily: "monospace",
                                padding: "10px"
                            }}
                            placeholder="Paste your scores_shorthand.txt content here..."
                            value={shorthandText}
                            onChange={e => {
                                setShorthandText(e.target.value);
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <button
                            onClick={handleParse}
                            style={{
                                padding: "10px 20px",
                                marginTop: "10px",
                                cursor: "pointer",
                                background: name ? "#0070f3" : "#555555",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px"
                            }}
                            disabled={!name}
                        >
                            Parse
                        </button>
                    </Col>
                    <Col>
                        <button
                            onClick={() => {
                                setShorthandText("");
                                setParsedData(null);
                                setError(null);
                            }}
                            style={{
                                padding: "10px 20px",
                                marginTop: "10px",
                                cursor: "pointer",
                                background: "#0070f3",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px"
                            }}
                        >
                            Clear
                        </button>
                    </Col>
                </Row>
                {error && (
                    <Row>
                        <Col>
                            <p style={{ color: "red", marginTop: "10px" }}>
                                {error}
                            </p>
                        </Col>
                    </Row>
                )}
                <Row>
                    <br />
                </Row>
                <Row>
                    <Col>
                        <label>Show Fully Constructed Score:</label>
                    </Col>
                    <Col>
                        <input
                            type="checkbox"
                            onChange={e => setShowFull(e.target.checked)}
                        />
                    </Col>
                    <Col>{showFull}</Col>
                </Row>
                {showFull && (
                    <>
                        <Row>
                            <Col>
                                <textarea
                                    rows={12}
                                    style={{
                                        width: "100%",
                                        fontFamily: "monospace",
                                        padding: "10px"
                                    }}
                                    value={fullScore}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <textarea
                                    rows={12}
                                    style={{
                                        width: "100%",
                                        fontFamily: "monospace",
                                        padding: "10px"
                                    }}
                                    value={JSON.stringify(parsedData[0])}
                                />
                            </Col>
                        </Row>
                    </>
                )}
                <Row>
                    <Col>
                        <GuitaleleViewer
                            scoreData={
                                parsedData && parsedData.length > 0
                                    ? parsedData[0]
                                    : null
                            }
                            editorMode={false}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TabShorthandParser;
