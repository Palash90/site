// P2PContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';

const P2PContext = createContext();

export function P2PProvider({ children }) {
    const [peerId, setPeerId] = useState('');
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Dynamic shared quiz state
    const [quizState, setQuizState] = useState({
        activeApp: 'menu',

        wordScreen: 1,
        words: [],
        selectedLangs: {},

        // Lifted WordQuiz states
        currentWordIndex: 0,
        score: 0,
        total: 0,
        correct: 0,
        wrong: 0,
        quizEnded: false,
        status: 'Not Started',
        answer: ''
    });

    const peerRef = useRef(null);

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
            const urlParams = new URLSearchParams(window.location.search);
            const pairId = urlParams.get('pairWith');
            if (pairId) {
                const conn = peer.connect(pairId);
                handleConnection(conn);
            }
        });

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
            setQuizState(incomingData);
        });

        conn.on('close', () => {
            setIsConnected(false);
            setConnection(null);
        });
    };

    const sendStateUpdate = (updatedState) => {
        setQuizState((prevState) => {
            const mergedState = { ...prevState, ...updatedState };
            if (connection && isConnected) {
                connection.send(mergedState); 
            }

            console.log("Merged state", mergedState);
            return mergedState; 
        });
    };

    return (
        <P2PContext.Provider value={{ peerId, isConnected, quizState, sendStateUpdate, getPairingUrl }}>
            {children}
        </P2PContext.Provider>
    );
}

export const useP2P = () => useContext(P2PContext);