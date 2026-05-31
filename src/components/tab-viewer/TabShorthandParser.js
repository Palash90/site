import React, { useState } from 'react';
import { parseShorthandText } from './parseShorthandUtils';
import GuitaleleViewer from './GuitaleleViewer';

export const TabShorthandParser = () => {
    const [shorthandText, setShorthandText] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState(null);

    const handleParse = () => {
        try {
            setError(null);
            const scores = parseShorthandText(shorthandText);
            setParsedData(scores);
        } catch (err) {
            setError(err.message || 'An error occurred during parsing.');
            setParsedData(null);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Tab Shorthand to JSON Schema Parser</h2>
            <textarea
                rows={12}
                style={{ width: '100%', fontFamily: 'monospace', padding: '10px' }}
                placeholder="Paste your scores_shorthand.txt content here..."
                value={shorthandText}
                onChange={(e) => setShorthandText(e.target.value)}
            />
            <br />
            <button
                onClick={handleParse}
                style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
                Parse to Schema JSON
            </button>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {parsedData && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Valid Output Array (JSON):</h3>
                    <pre style={{ background: '#252525', padding: '15px', borderRadius: '5px', overflowX: 'auto', maxHeight: '400px' }}>
                        {JSON.stringify(parsedData, null, 2)}
                    </pre>
                </div>
            )}
            <GuitaleleViewer scoreData={parsedData && parsedData.length > 0 ? parsedData[0] : null} editorMode={false} />
        </div>
    );
};

export default TabShorthandParser;