import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IconContext } from 'react-icons';
import { findProp, loadContents } from './config/findProp';

// Provide findProp globally (local function; contents fetched async from GitHub Pages)
window.findProp = findProp;

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render immediately — base config is bundled, only contents load async
root.render(
  <React.StrictMode>
      <IconContext.Provider value={{ size: "2em" }}>
        <App />
      </IconContext.Provider>
  </React.StrictMode>
);

// Fetch blog contents in background — findProp resolves all other paths immediately
loadContents();
