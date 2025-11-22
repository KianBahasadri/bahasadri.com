import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SMSMessenger from './pages/tools/sms-messenger/SMSMessenger';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="app">
            <h1>bahasadri.com</h1>
            <p>feature planning and specs live in <code>docs/</code>.</p>
            <ul>
              <li>File hosting</li>
              <li>
                <Link to="/tools/sms-messenger">SMS messenger</Link>
              </li>
              <li>Video call</li>
            </ul>
            <p>Next big step: rebuild from scratch. stay tuned.</p>
          </main>
        }
      />
      <Route path="/tools/sms-messenger" element={<SMSMessenger />} />
    </Routes>
  );
}
