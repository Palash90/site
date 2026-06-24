import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { parseShorthandText } from "./parseShorthandUtils";
import GuitaleleViewer from "./GuitaleleViewer";
import { Col, Container, Row, Button, Alert, Spinner } from "react-bootstrap";
import slugify from "../../utils/slugify";

export default function TabShorthandParser() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [existingScores, setExistingScores] = useState([]);
  const [selectedScoreId, setSelectedScoreId] = useState("");
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [shorthandText, setShorthandText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [instrument, setInstrument] = useState("Guitalele");
  const [capo, setCapo] = useState(0);
  const [desc, setDesc] = useState("");
  const [published, setPublished] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [fullScore, setFullScore] = useState("");

  const instruments = ["Guitalele"];
  const timeSignatures = ["4/4", "3/4", "6/8", "2/4", "2/2"];

  const [username, setUsername] = useState("");

  const scoresRef = collection(db, "scores");

  const loadScores = useCallback(async () => {
    if (!user) return;
    setLoadingScores(true);
    setLoadError("");
    try {
      const q = query(scoresRef, where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setExistingScores(list);
    } catch (e) {
      setLoadError(`Firestore error: ${e.code || e.message}`);
      console.error("Failed to load scores", e);
    } finally {
      setLoadingScores(false);
    }
  }, [user]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const getUserName = useCallback(async () => {
    if (!user) return "";
    try {
      const snap = await getDoc(doc(db, "profiles", user.uid));
      if (snap.exists()) return snap.data().username || "";
    } catch (e) {
      console.error("Failed to get username", e);
    }
    return "";
  }, [user]);

  useEffect(() => {
    if (loadingScores || existingScores.length === 0) return;
    const editId = searchParams.get("edit");
    if (!editId) return;
    const score = existingScores.find((s) => s.id === editId);
    if (score) {
      setSelectedScoreId(score.id);
      setName(score.name || "");
      setTimeSignature(score.timeSignature || "4/4");
      setInstrument(score.instrument || "Guitalele");
      setCapo(score.capo || 0);
      setDesc(score.desc || "");
      setPublished(score.published || false);
      setShorthandText(score.rawShorthand || "");
      setUsername(score.username || "");
      window.history.replaceState(null, "", "/tab-parser");
    }
  }, [loadingScores, existingScores, searchParams]);

  const makeScoreDocId = (uname, instr, title) => {
    const s = slugify(title);
    return `${uname}:${slugify(instr)}:${s}`;
  };

  const handleParse = async () => {
    try {
      setError(null);
      if (!name.trim()) {
        throw new Error("Score name is required.");
      }

      let scoreText = "=".repeat(80);
      scoreText += "\nScore: " + name;
      scoreText += "\nTime Signature: " + timeSignature;
      scoreText += "\nInstrument: " + instrument;
      scoreText += "\nCapo: " + capo;
      scoreText += "\nDescription: " + desc;
      scoreText += "\n" + "=".repeat(80);
      scoreText += "\n" + shorthandText;

      setFullScore(scoreText);
      const parsed = parseShorthandText(scoreText);
      console.log("Parsed Scores:", parsed);
      setParsedData(parsed);

      if (!parsed || parsed.length === 0 || !parsed[0].measures || parsed[0].measures.length === 0) {
        throw new Error("Score must contain at least one measure with notes.");
      }

      setSaving(true);

      const trimmedName = name.trim();
      const uname = username || (await getUserName());
      if (!uname) {
        throw new Error("You must set a username before saving scores. Go to your profile to set one.");
      }
      setUsername(uname);

      const instr = instrument.trim();
      const slug = slugify(trimmedName);
      const newDocId = makeScoreDocId(uname, instr, trimmedName);

      const existing = await getDoc(doc(db, "scores", newDocId));
      if (existing.exists()) {
        if (existing.data().userId !== user.uid || (selectedScoreId && selectedScoreId !== newDocId)) {
          throw new Error(`A score named "${trimmedName}" for ${instrument} already exists.`);
        }
      }

      if (selectedScoreId && selectedScoreId !== newDocId) {
        await deleteDoc(doc(db, "scores", selectedScoreId));
      }

      await setDoc(doc(db, "scores", newDocId), {
        userId: user.uid,
        name: trimmedName,
        timeSignature,
        instrument: instr,
        capo: Number(capo),
        desc,
        published,
        rawShorthand: shorthandText,
        username: uname,
        slug,
        createdAt: existing.exists() ? existing.data().createdAt || Date.now() : Date.now(),
        updatedAt: Date.now(),
      });

      await loadScores();
      setSelectedScoreId(newDocId);
    } catch (err) {
      console.error("Failed to save score", err.code, err.message);
      if (err.code === "permission-denied") {
        setError("Please verify your email before creating or editing scores. Check your inbox for a verification link.");
      } else {
        setError(err.message || "An error occurred during parsing.");
      }
      setParsedData(null);
    } finally {
      setSaving(false);
    }
  };

  const loadExistingScore = (e) => {
    const id = e.target.value;
    setSelectedScoreId(id);
    if (!id) {
      setName("");
      setTimeSignature("4/4");
      setInstrument("Guitalele");
      setCapo(0);
      setDesc("");
      setPublished(false);
      setCapo(0);
      setParsedData(null);
      setUsername("");
      return;
    }
    const score = existingScores.find((s) => s.id === id);
    if (score) {
      setName(score.name || "");
      setTimeSignature(score.timeSignature || "4/4");
      setInstrument(score.instrument || "Guitalele");
      setCapo(score.capo || 0);
      setDesc(score.desc || "");
      setPublished(score.published || false);
      setShorthandText(score.rawShorthand || "");
      setUsername(score.username || "");
    }
  };

  const handleDelete = async () => {
    if (!selectedScoreId) return;
    if (!window.confirm("Delete this score?")) return;
    try {
      await deleteDoc(doc(db, "scores", selectedScoreId));
      setSelectedScoreId("");
      setName("");
      setTimeSignature("4/4");
      setInstrument("Guitalele");
      setCapo(0);
      setDesc("");
      setPublished(false);
      setShorthandText("");
      setParsedData(null);
      await loadScores();
    } catch (e) {
      console.error("Failed to delete score", e.code, e.message);
      setError(e.message);
    }
  };

  if (loadingScores) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="light" />
      </Container>
    );
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <Container>
        {loadError && <Alert variant="warning" className="py-2">{loadError}</Alert>}
        <Row>
          <Col>
            <h2>Tab Shorthand Parser</h2>
          </Col>
        </Row>
        <Row className="flex-nowrap">
          <Col>
            <label>Existing Scores</label>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={selectedScoreId}
                onChange={loadExistingScore}
              >
                <option value="">-- New Score --</option>
                {existingScores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </Col>
          <Col>
            <label>Name:</label>
            <input
              className="form-control"
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </Col>
          <Col>
            <label>Time Signature</label>
            <select
              className="form-select"
              value={timeSignature}
              onChange={(e) => setTimeSignature(e.target.value)}
            >
              {timeSignatures.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Col>
          <Col>
            <label>Instrument</label>
            <select
              className="form-select"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
            >
              {instruments.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </Col>
          <Col>
            <label>Capo:</label>
            <input
              className="form-control"
              type="number"
              min={0}
              max={12}
              value={capo}
              onChange={(e) => setCapo(e.target.value)}
            />
          </Col>
          <Col>
            <label>Description</label>
            <input
              className="form-control"
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
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
              className="form-control"
              rows={12}
              style={{ fontFamily: "monospace" }}
              placeholder="Paste your scores_shorthand.txt content here..."
              value={shorthandText}
              onChange={(e) => {
                setShorthandText(e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row className="mt-2">
          <Col xs="auto">
            <Button variant="outline-primary" onClick={handleParse} disabled={!name || saving}>
              {saving ? "Saving..." : selectedScoreId ? "Update" : "Save & Parse"}
            </Button>
          </Col>
          {selectedScoreId && username && (
            <Col xs="auto">
              <Button variant="outline-info" onClick={() => navigate(`/content/${username}/${slugify(instrument)}/${slugify(name)}`)}>
                Preview
              </Button>
            </Col>
          )}
          <Col xs="auto">
            <Button variant={published ? "outline-warning" : "outline-success"} onClick={() => setPublished(!published)}>
              {published ? "Mark as Draft" : "Publish"}
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" onClick={() => {
              setShorthandText("");
              setParsedData(null);
              setError(null);
              setName("");
              setDesc("");
              setPublished(false);
              setCapo(0);
              setSelectedScoreId("");
              setUsername("");
            }}>
              Clear
            </Button>
          </Col>
          {selectedScoreId && (
            <Col xs="auto">
              <Button variant="outline-danger" onClick={handleDelete}>Delete</Button>
            </Col>
          )}
        </Row>
        {error && (
          <Row className="mt-2">
            <Col>
              <Alert variant="danger" className="py-2">{error}</Alert>
            </Col>
          </Row>
        )}
        <Row className="mt-3">
          <Col xs="auto">
            <label>Show Fully Constructed Score:</label>
          </Col>
          <Col xs="auto">
            <input
              type="checkbox"
              checked={showFull}
              onChange={(e) => setShowFull(e.target.checked)}
            />
          </Col>
          <Col>{showFull ? "Showing" : "Hidden"}</Col>
        </Row>
        {showFull && parsedData && (
          <>
            <Row className="mt-2">
              <Col>
                <textarea
                  className="form-control"
                  readOnly
                  rows={12}
                  style={{ fontFamily: "monospace" }}
                  value={fullScore}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <textarea
                  className="form-control"
                  readOnly
                  rows={12}
                  style={{ fontFamily: "monospace" }}
                  value={JSON.stringify(parsedData, null, 2)}
                />
              </Col>
            </Row>
          </>
        )}
        <Row className="mt-3">
          <Col>
            <GuitaleleViewer
              scoreData={
                parsedData && parsedData.length > 0
                  ? parsedData[0]
                  : Array.isArray(parsedData) ? null : parsedData
              }
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};


