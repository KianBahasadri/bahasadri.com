import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import SMSMessenger from './pages/tools/sms-messenger/sms-messenger';
import Calculator from './pages/tools/calculator/calculator';

export default function App(): React.JSX.Element {
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
                <Link to="/sms-messenger">SMS messenger</Link>
              </li>
              <li>
                <Link to="/calculator">Calculator</Link>
              </li>
              <li>Video call</li>
            </ul>
            <p>Next big step: rebuild from scratch. stay tuned.</p>
          </main>
        }
      />
      <Route path="/sms-messenger" element={<SMSMessenger />} />
      <Route path="/calculator" element={<Calculator />} />
    </Routes>
  );
}
