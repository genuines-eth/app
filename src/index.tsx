import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './app/store';
import { Provider } from 'react-redux';

import './index.css';
import RequireAuth from './features/requireAuth/RequireAuth';
import App from './App';
import OEMs from "./routes/oems";
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="OEMs"
            element={
              <RequireAuth redirectTo="/connect">
                <OEMs />
              </RequireAuth>
            }
          />
          <Route path="*" element={
            < main style={{ padding: "1rem" }}>
              <p>There's nothing here for '{window.location.pathname}'!</p>
            </main>
          } />
        </Routes>
    </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
