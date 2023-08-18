import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // react Strictmode rerenders twice to catch bugs
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
  <App/>
);
