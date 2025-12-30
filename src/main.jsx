import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/app';
import './index.css';

createRoot(document.getElementById('container')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

