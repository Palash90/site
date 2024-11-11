import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IconContext } from 'react-icons';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <IconContext.Provider value={{ size: "2em" }}>
        <App />
      </IconContext.Provider>
  </React.StrictMode>
);

