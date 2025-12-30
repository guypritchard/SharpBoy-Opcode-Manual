import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './components/app';
import 'nes.css/css/nes.min.css';
import './index.css';

createRoot(document.getElementById('container')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

