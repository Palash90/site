import { useEffect, useRef, useState } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech Recognition not supported in this browser');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Configurable

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(transcript.toLowerCase().trim());
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setError('Microphone access blocked. Please enable microphone permissions in your browser settings.');
          break;
        case 'no-speech':
          setError('No speech was detected. Please try again.');
          break;
        case 'network':
          setError('Network error occurred during speech recognition.');
          break;
        default:
          setError(`Speech Recognition Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return { transcript, isListening, error, startListening, stopListening };
};