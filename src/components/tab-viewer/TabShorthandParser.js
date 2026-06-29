import React, { useState, useEffect, useCallback, useRef } from "react";
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
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { parseShorthandText } from "./parseShorthandUtils";
import GuitaleleViewer from "./GuitaleleViewer";
import { Col, Container, Row, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import slugify from "../../utils/slugify";

const MANUAL_MD = `
## Writing Notes

The basic format: **Fret:String@Duration**

\`\`\`
3:1@q      Fret 3, string 1, quarter note
0:6@w      Open string 6, whole note
5:3@h.     Fret 5, string 3, dotted half note
\`\`\`

**Strings:** 1 = thinnest (highest pitch), 6 = thickest (lowest pitch).

### Duration Letters

| Letter | Duration | Beats (in 4/4) |
| --- | --- | --- |
| \`s\` | 1/16 note | 1/4 beat |
| \`e\` | 1/8 note | 1/2 beat |
| \`q\` | 1/4 note | 1 beat |
| \`h\` | 1/2 note | 2 beats |
| \`w\` | whole note | 4 beats |

Add \`.\` for dotted notes (e.g., \`h.\` = dotted half = 3 beats).

### Compact Notation

Shorter form: **fret** + \`f\` + **string** + \`s\` + **duration**

\`\`\`
3f1sq      Same as 3:1@q
0f6sw      Same as 0:6@w
\`\`\`

---

## Open Strings and Muted Strings

| Symbol | Meaning |
| --- | --- |
| \`O\` or \`0\` | Open string |
| \`X\` or \`x\` | Muted / dead string |

---

## Rests

Use \`-\` for silence: \`-@q\` (quarter rest), \`-@h\` (half rest), etc.
You can also write \`-q\`, \`-h\` (without the \`@\`).

---

## Chords

Wrap simultaneous notes in square brackets:

\`\`\`
[0:6 | 2:5 | 2:4 | 1:3 | 0:2 | 0:1]@q   G major chord, quarter note
[3:1 | 5:2]@h                              Two-note chord, half note
[0f6s | 2f5s | 2f4s]@q                    Compact form inside chords
[0:6 | 2:5]w                               Trailing duration (no @ needed)
\`\`\`

---

## Two Voices (Polyphony)

For melody + bass playing simultaneously, use \`v1\` (upper/melody) and \`v2\` (lower/bass). Each voice fills the bar independently.

\`\`\`
M1: 3f3sqv1 | 3f3sqv1 | 4f3sqv1 | 5f3sqv1
M1: 0f6hwv2 | 0f6hwv2
\`\`\`

---

## Ties

Add \`t\` after duration to hold a note into the next beat without re-plucking:

\`\`\`
3:2@ht       Half note, tied
[0:6 | 2:5]@wt   Whole chord, tied
\`\`\`

---

## Annotations

Add \`d:text\` for notes to the readers (doesn't affect sound):

\`\`\`
3:1@qd:Melody_starts_here
[0:6 | 2:5]@qd:C_major_chord
\`\`\`

The parser stops at spaces, so use \`_\` as a stand-in:
\`\`\`
3:1@qd:slide_to_fret_7
\`\`\`
renders as "slide to fret 7"

---

## Measure Numbers

- **Explicit:** \`Measure 1: ...\` or \`M 1: ...\` or \`M1: ...\`
- **Implicit:** Just write a line of notes — the system counts them in order.

---

## Quick Reference

| What You Write | What It Means |
| --- | --- |
| \`3:1@q\` | Fret 3, string 1, quarter note |
| \`3f1sq\` | Same thing, compact form |
| \`-@q\` | Quarter rest |
| \`[0:6 \\| 2:5]@q\` | Two-note chord, quarter note |
| \`t\` (after duration) | Tie — hold through next beat |
| \`v1\`, \`v2\` | Voice 1 (melody) or Voice 2 (bass) |
| \`d:text\` | Annotation (doesn't affect sound) |
| \`O:3@q\` | Open string 3 |
| \`X:6@h\` | Muted string 6 |
| \`M1:\` or \`Measure 1:\` | Measure number label |

---

## Tips

- Each measure must total exactly one bar (e.g., 4 beats in 4/4).
- Use \`v1\`/\`v2\` when two independent lines happen at the same time.
- Inside chords \`[...]\`, separate notes with \` | \`. Inside measures, also separate with \` | \`.
- Strings: **1** (highest) to **6** (lowest).
- Descriptions are just for your own reference.
`;

function ShorthandManualModal() {
  const [show, setShow] = useState(false);

  return (
    <>
      <FaInfoCircle
        style={{ cursor: "pointer", fontSize: "0.85rem", verticalAlign: "middle" }}
        onClick={() => setShow(true)}
        title="Shorthand notation guide"
      />
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="xl"
        aria-labelledby="shorthand-manual-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="shorthand-manual-modal">Shorthand Tab Notation Guide</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}>
          <Markdown remarkPlugins={[remarkGfm]}>{MANUAL_MD}</Markdown>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const COLOR_SCHEME = {
  separator: '#334155',
  headerLabel: '#67e8f9',
  headerValue: '#e2e8f0',
  measureLabel: '#c084fc',
  pipe: '#475569',
  bracket: '#fbbf24',
  chordContent: '#fde68a',
  duration: '#4ade80',
  voice: '#22d3ee',
  tie: '#f87171',
  annotation: '#fb923c',
  open: '#22d3ee',
  muted: '#f87171',
  rest: '#6b7280',
  fretNum: '#e2e8f0',
  stringNum: '#94a3b8',
  colon: '#64748b',
  compactF: '#fbbf24',
  compactS: '#22d3ee',
  comment: '#475569',
};

function highlightShorthand(text) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = escaped.split('\n');
  const coloredLines = lines.map((line) => {
    if (/^={2,}|^---+/.test(line)) {
      return `<span style="color:${COLOR_SCHEME.separator}">${line}</span>`;
    }
    if (/^(Score|Time Signature|Instrument|Capo|Description|ID):/.test(line)) {
      return line.replace(
        /^(Score|Time Signature|Instrument|Capo|Description|ID):(.*)$/,
        (_, label, val) =>
          `<span style="color:${COLOR_SCHEME.headerLabel}">${label}</span><span style="color:${COLOR_SCHEME.headerValue}">:${val}</span>`
      );
    }
    if (/^(M(?:easure)?\s*\d+):/i.test(line)) {
      let rest = line.replace(/^(M(?:easure)?\s*\d+):/i, '');
      let label = line.match(/^(M(?:easure)?\s*\d+:)/i)[0];
      rest = colorizeTokens(rest);
      return `<span style="color:${COLOR_SCHEME.measureLabel}">${label}</span>${rest}`;
    }
    return colorizeTokens(line);
  });
  return coloredLines.join('\n');
}

function colorizeTokens(line) {
  return line
    .replace(/(\|)/g, `<span style="color:${COLOR_SCHEME.pipe}">$1</span>`)
    .replace(
      /(\[)([^\]]*)(\])/g,
      (_, open, inner, close) => {
        const coloredInner = inner
          .replace(/(\d+|[OXox])f(\d+)s?/gi,
            (_, fret, str) => `<span style="color:${COLOR_SCHEME.compactF}">${fret}</span><span style="color:${COLOR_SCHEME.compactS}">f</span><span style="color:${COLOR_SCHEME.stringNum}">${str}</span><span style="color:${COLOR_SCHEME.compactS}">s</span>`
          )
          .replace(/([OXox])(:)/g,
            (_, o, c) => (o === 'O' || o === 'o'
              ? `<span style="color:${COLOR_SCHEME.open}">${o}</span><span style="color:${COLOR_SCHEME.colon}">${c}</span>`
              : `<span style="color:${COLOR_SCHEME.muted}">${o}</span><span style="color:${COLOR_SCHEME.colon}">${c}</span>`)
          )
          .replace(/(\d+)(:)(\d+)/g,
            (_, f, c, s) => `<span style="color:${COLOR_SCHEME.fretNum}">${f}</span><span style="color:${COLOR_SCHEME.colon}">${c}</span><span style="color:${COLOR_SCHEME.stringNum}">${s}</span>`
          );
        return `<span style="color:${COLOR_SCHEME.bracket}">${open}</span>${coloredInner}<span style="color:${COLOR_SCHEME.bracket}">${close}</span>`;
      }
    )
    .replace(/(-)(@?(?:w|h|q|e|s)\.?)/g, (_, rest, dur) =>
      `<span style="color:${COLOR_SCHEME.rest}">${rest}</span><span style="color:${COLOR_SCHEME.duration}">${dur}</span>`
    )
    .replace(/(\d+|[OXox])f(\d+)s([whqes]\.?)/gi, (_, fret, str, dur) => {
      const fretSpan = (fret === 'O' || fret === 'o')
        ? `<span style="color:${COLOR_SCHEME.open}">${fret}</span>`
        : (fret === 'X' || fret === 'x')
          ? `<span style="color:${COLOR_SCHEME.muted}">${fret}</span>`
          : `<span style="color:${COLOR_SCHEME.compactF}">${fret}</span>`;
      return `${fretSpan}<span style="color:${COLOR_SCHEME.compactS}">f</span><span style="color:${COLOR_SCHEME.stringNum}">${str}</span><span style="color:${COLOR_SCHEME.compactS}">s</span><span style="color:${COLOR_SCHEME.duration}">${dur}</span>`;
    })
    .replace(/(\d+|[OXox])(:)(\d+)/g, (_, f, c, s) => {
      const fretSpan = (f === 'O' || f === 'o')
        ? `<span style="color:${COLOR_SCHEME.open}">${f}</span>`
        : (f === 'X' || f === 'x')
          ? `<span style="color:${COLOR_SCHEME.muted}">${f}</span>`
          : `<span style="color:${COLOR_SCHEME.fretNum}">${f}</span>`;
      return `${fretSpan}<span style="color:${COLOR_SCHEME.colon}">${c}</span><span style="color:${COLOR_SCHEME.stringNum}">${s}</span>`;
    })
    .replace(/(@(?:w|h|q|e|s)\.?)/g, (_, d) => `<span style="color:${COLOR_SCHEME.duration}">${d}</span>`)
    .replace(/\b(v[12])\b/g, (_, v) => `<span style="color:${COLOR_SCHEME.voice}">${v}</span>`)
    .replace(/\b(t)\b(?!\w)/g, (_, t) => `<span style="color:${COLOR_SCHEME.tie}">${t}</span>`)
    .replace(/(d:[^\s|]+)/g, (_, a) => `<span style="color:${COLOR_SCHEME.annotation}">${a}</span>`);
}

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
  const [validationErrors, setValidationErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [togglingPublish, setTogglingPublish] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [shorthandText]);

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
      const batch = writeBatch(db);
      let needsCommit = false;
      snap.forEach((d) => {
        const data = d.data();
        list.push({ id: d.id, ...data });
        if (!data.nameLower && data.name) {
          batch.update(doc(db, "scores", d.id), { nameLower: data.name.toLowerCase() });
          needsCommit = true;
        }
      });
      if (needsCommit) {
        await batch.commit();
      }
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
      navigate("/tab-parser", { replace: true });

      const scoreText = "=".repeat(80) +
        "\nScore: " + (score.name || "") +
        "\nTime Signature: " + (score.timeSignature || "4/4") +
        "\nInstrument: " + (score.instrument || "Guitalele") +
        "\nCapo: " + (score.capo || 0) +
        "\nDescription: " + (score.desc || "") +
        "\n" + "=".repeat(80) +
        "\n" + (score.rawShorthand || "");
      setFullScore(scoreText);
      const { scores, errors: parseErrors } = parseShorthandText(scoreText);
      setParsedData(scores);
      setValidationErrors(parseErrors);
    }
  }, [loadingScores, existingScores, searchParams]);

  const makeScoreDocId = (uname, instr, title) => {
    const s = slugify(title);
    return `${uname}:${slugify(instr)}:${s}`;
  };

  const handleParse = async () => {
    try {
      setError(null);
      setValidationErrors([]);
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
      const { scores, errors: parseErrors } = parseShorthandText(scoreText);
      console.log("Parsed Scores:", scores);
      setParsedData(scores);
      setValidationErrors(parseErrors);

      if (!scores || scores.length === 0 || !scores[0].measures || scores[0].measures.length === 0) {
        throw new Error("Score must contain at least one measure with notes.");
      }

      if (parseErrors.length > 0) {
        return;
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
        nameLower: trimmedName.toLowerCase(),
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
    setError(null);
    if (!id) {
      setName("");
      setTimeSignature("4/4");
      setInstrument("Guitalele");
      setCapo(0);
      setDesc("");
      setPublished(false);
      setCapo(0);
      setParsedData(null);
      setValidationErrors([]);
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
      const scoreText = "=".repeat(80) +
        "\nScore: " + (score.name || "") +
        "\nTime Signature: " + (score.timeSignature || "4/4") +
        "\nInstrument: " + (score.instrument || "Guitalele") +
        "\nCapo: " + (score.capo || 0) +
        "\nDescription: " + (score.desc || "") +
        "\n" + "=".repeat(80) +
        "\n" + (score.rawShorthand || "");
      setFullScore(scoreText);
      const { scores, errors: parseErrors } = parseShorthandText(scoreText);
      setParsedData(scores);
      setValidationErrors(parseErrors);
    }
  };

  const handleTogglePublished = async () => {
    if (!selectedScoreId) {
      setPublished((prev) => !prev);
      return;
    }
    setTogglingPublish(true);
    const prevPublished = published;
    try {
      const newPublished = !published;
      setPublished(newPublished);
      await updateDoc(doc(db, "scores", selectedScoreId), {
        published: newPublished,
        updatedAt: Date.now(),
      });
    } catch (e) {
      setPublished(prevPublished);
      setError(`Failed to update published state: ${e.message}`);
    } finally {
      setTogglingPublish(false);
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
        <Row className="align-items-center">
          <Col>
            <h2 className="mb-0">Tab Shorthand Parser</h2>
          </Col>
          <Col xs="auto">
            <ShorthandManualModal />
          </Col>
        </Row>
        <Row xs={1} sm={2} md={3} lg={5} className="g-2">
          <Col>
            <label>Existing Scores</label>
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
        </Row>

        <Row>
          <Col>
            <div style={{ display: 'flex', minHeight: '300px', maxHeight: '600px', overflow: 'auto', background: '#0a0e17', borderRadius: '4px', fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace", fontSize: '12px', lineHeight: 1.5 }}>
              <div style={{ flex: '0 0 auto', width: '48px', borderRight: '1px solid #1e293b', userSelect: 'none', pointerEvents: 'none', padding: '6px 0', alignSelf: 'stretch' }}>
                <pre style={{ margin: 0, padding: '0 8px', textAlign: 'right', fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', color: '#475569', whiteSpace: 'pre', tabSize: 2, minHeight: '100%' }}>{(shorthandText || '').split('\n').map((_, i) => `${i + 1}\n`).join('').replace(/\n$/, '')}</pre>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'grid', alignSelf: 'stretch' }}>
                <pre aria-hidden="true" style={{ gridArea: '1 / 1', margin: 0, padding: '6px 12px', fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#94a3b8', pointerEvents: 'none', tabSize: 2 }} dangerouslySetInnerHTML={{ __html: shorthandText ? highlightShorthand(shorthandText) : '' }} />
                <textarea
                  ref={textareaRef}
                  className="form-control border-0"
                  style={{
                    gridArea: '1 / 1', width: '100%',
                    fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit',
                    background: 'transparent', color: 'transparent', caretColor: '#f1f5f9',
                    resize: 'vertical', tabSize: 2, overflow: 'hidden',
                    WebkitTextFillColor: 'transparent',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowWrap: 'break-word',
                  }}
                  placeholder="Paste your scores_shorthand.txt content here..."
                  value={shorthandText}
                  onChange={(e) => {
                    setShorthandText(e.target.value);
                    const ta = textareaRef.current;
                    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
        <Row className="mt-2 g-1">
          <Col xs="auto">
            <Button variant="primary" onClick={handleParse} disabled={!name || saving}>
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
            <Button variant={published ? "outline-warning" : "outline-success"} onClick={handleTogglePublished} disabled={togglingPublish}>
              {togglingPublish ? "Updating..." : published ? "Mark as Draft" : "Publish"}
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" disabled={saving || togglingPublish} onClick={() => {
              setShorthandText("");
      setParsedData(null);
      setValidationErrors([]);
              setError(null);
              setValidationErrors([]);
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
              <Button variant="outline-danger" onClick={handleDelete} disabled={saving || togglingPublish}>Delete</Button>
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
        {validationErrors.length > 0 && (
          <Row className="mt-2">
            <Col>
              <Alert variant="warning" className="py-2">
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                  {validationErrors.join("\n")}
                </pre>
              </Alert>
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
          <Row className="mt-2">
            <Col md={6}>
              <div className="rounded border" style={{ background: '#0f172a', borderColor: '#334155' }}>
                <div className="d-flex align-items-center px-2 py-1 border-bottom" style={{ borderColor: '#334155' }}>
                  <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>ASCII Preview</span>
                </div>
                <pre style={{ margin: 0, padding: '8px', fontSize: '10px', lineHeight: 1.4, color: '#94a3b8', maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: highlightShorthand(fullScore) }} />
              </div>
            </Col>
            <Col md={6}>
              <div className="rounded border" style={{ background: '#0a0e17', borderColor: '#334155' }}>
                <div className="d-flex align-items-center px-2 py-1 border-bottom" style={{ borderColor: '#334155' }}>
                  <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>JSON Output</span>
                </div>
                <pre style={{ margin: 0, padding: '8px', fontSize: '10px', lineHeight: 1.4, maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify(parsedData, null, 2)
                      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                      .replace(/"([^"]+)":/g, '<span style="color:#7dd3fc">"$1"</span>:')
                      .replace(/: "([^"]+)"/g, ': <span style="color:#a5d6a7">"$1"</span>')
                      .replace(/: (\d+\.?\d*)/g, ': <span style="color:#f9a825">$1</span>')
                      .replace(/: (true|false)/g, ': <span style="color:#ce93d8">$1</span>')
                      .replace(/: (null)/g, ': <span style="color:#ef9a9a">$1</span>')
                  }}
                />
              </div>
            </Col>
          </Row>
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


