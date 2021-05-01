import React, { useState } from 'react';
import './App.css';
import { VncScreen } from './lib';

function App() {
  const [vncUrl, setVncUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  const isValid = (vncUrl: string) => {
    if (!vncUrl.startsWith('ws://') && !vncUrl.startsWith('wss://')) {
      return false;
    }

    return true;
  };

  const Spacer = () => <div style={{ width: '2rem', display: 'inline-block' }} />;

  return (
    <>
      <div style={{ margin: '1rem' }}>
        <label htmlFor="url">URL for VNC Stream</label>
        <Spacer />

        <input type="text" onChange={({ target: { value } }) => {
          setInputUrl(value);
        }} name="url" placeholder="ws://your-vnc-url" />

        <Spacer />
        <button onClick={() => setVncUrl(inputUrl)}>Go!</button>
      </div>

      <div style={{ margin: '1rem' }}>
        {
          isValid(vncUrl)
            ?
            (
              <VncScreen
                url={vncUrl}
                scaleViewport
                background="#000000"
                style={{
                  width: '75vw',
                  height: '75vh',
                }}
              />
            )
            : <div>VNC URL not provided</div>
        }
      </div>
    </>
  );
}

export default App;
