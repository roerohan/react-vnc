import React from 'react';
import logo from './logo.svg';
import './App.css';
import { VncScreen } from './lib';

const {
  REACT_APP_VNC_URL = '',
} = process.env;

function App() {
  return (
    <VncScreen
      url={REACT_APP_VNC_URL}
      scaleViewport
      background="#000000"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}

export default App;
