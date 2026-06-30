import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IconContext } from 'react-icons';
import { findProp } from './config/findProp';

// Provide findProp globally (local function; contents fetched async from GitHub Pages)
window.findProp = findProp;

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <IconContext.Provider value={{ size: "2em" }}>
        <App />
      </IconContext.Provider>
  </React.StrictMode>
);
