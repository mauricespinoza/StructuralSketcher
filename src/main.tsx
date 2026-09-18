import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initAutosave } from './persistence/localStore';
import './styles/app.css';

initAutosave();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
