import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './react/primary/App';
import ThemeContext from "./ThemeContext";

ReactDOM.render(
  <React.StrictMode>
      <ThemeContext props = <App />/>
  </React.StrictMode>,
  document.getElementById('root')
);

