import React, { useEffect, useState, useRef } from 'react';
import { Peer } from 'peerjs';
import { QRCodeSVG } from 'qrcode.react';

export default function ParentalSync({ role }) { // role can be 'parent' or 'kid'
  const [peerId, setPeerId] = useState('');
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Example Quiz State to sync
  const [quizState, setQuizState] = useState({
    questionNumber: 1,
    score: 0,
    lastAnswerStatus: 'waiting', // 'correct' or 'wrong'
    currentQuestionText: ''
  });

  const peerRef = useRef(null);

  // Generate the pairing link for the QR code
  const getPairingUrl = (id) => {
    const url = new window.URL(window.location.href);
    url.searchParams.set('pairWith', id);
    return url.toString();
  };

  useEffect(() => {
    const peer = new Peer(undefined, {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      pingInterval: 5000
    });
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);

      // If this device is scanning the QR code
      const urlParams = new URLSearchParams(window.location.search);
      const pairId = urlParams.get('pairWith');
      
      if (pairId) {
        const conn = peer.connect(pairId);
        handleConnection(conn);
      }
    });

    // If this device displayed the QR code and is receiving the connection
    peer.on('connection', (conn) => {
      handleConnection(conn);
    });

    return () => peer.destroy();
  }, []);

  const handleConnection = (conn) => {
    setConnection(conn);
    
    conn.on('open', () => {
      setIsConnected(true);
    });

    conn.on('data', (incomingData) => {
      // Whenever one side sends an update, the other side updates its UI state
      setQuizState(incomingData);
    });

    conn.on('close', () => {
      setIsConnected(false);
      setConnection(null);
    });
  };

  // Call this function whenever the kid answers a question or parent presses a button
  const sendStateUpdate = (updatedState) => {
    if (connection && isConnected) {
      connection.send(updatedState);
      setQuizState(updatedState); // Update local UI too
    }
  };

  // Quick Action Handler for testing
  const handleAnswerSubmit = (isCorrect) => {
    const nextState = {
      ...quizState,
      questionNumber: quizState.questionNumber + 1,
      score: isCorrect ? quizState.score + 1 : quizState.score,
      lastAnswerStatus: isCorrect ? 'correct' : 'wrong'
    };
    sendStateUpdate(nextState);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Learning App Sync ({role})</h2>
      
      {!isConnected ? (
        <div>
          {/* Typically, the Parent's phone shows the QR, and the Kid's phone scans it (or vice-versa) */}
          {peerId && (
            <div style={{ margin: '20px' }}>
              <h3>Scan to Link Devices</h3>
              <QRCodeSVG value={getPairingUrl(peerId)} size={180} />
            </div>
          )}
          <p>Waiting for devices to pair...</p>
        </div>
      ) : (
        <div style={{ border: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
          <p style={{ color: 'green', fontWeight: 'bold' }}>⚡ Devices Successfully Connected!</p>
          
          <div style={{ margin: '20px 0', fontSize: '18px' }}>
            <div><strong>Question Number:</strong> {quizState.questionNumber}</div>
            <div><strong>Current Score:</strong> {quizState.score}</div>
            <div>
              <strong>Last Answer: </strong> 
              <span style={{ color: quizState.lastAnswerStatus === 'correct' ? 'green' : 'red' }}>
                {quizState.lastAnswerStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Test Buttons to see it sync live */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => handleAnswerSubmit(true)} style={{ padding: '10px', background: 'green', color: 'white', border: 'none' }}>
              Simulate Correct Answer
            </button>
            <button onClick={() => handleAnswerSubmit(false)} style={{ padding: '10px', background: 'red', color: 'white', border: 'none' }}>
              Simulate Wrong Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}