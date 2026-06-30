import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IconContext } from 'react-icons';

// Safe wrapper for window.findProp — script.js from GitHub Pages may be blocked
const _origFindProp = window.findProp;
window.findProp = function safeFindProp(path) {
  try {
    if (typeof _origFindProp !== 'function') {
      console.warn(`findProp: script.js not available (GitHub Pages blocked?), cannot resolve "${path}"`);
      return undefined;
    }
    return _origFindProp(path);
  } catch (e) {
    console.warn(`findProp: error resolving "${path}"`, e);
    return undefined;
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <IconContext.Provider value={{ size: "2em" }}>
        <App />
      </IconContext.Provider>
  </React.StrictMode>
);

