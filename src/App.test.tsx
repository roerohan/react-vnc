import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('contains input box for entering VNC URL', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/wss:\/\/your-vnc-url/i);
  expect(inputElement).toBeInTheDocument();
});

test('check if SSL disclaimer is present', () => {
  render(<App />);
  const disclaimerElement = screen.getByText(/Since the site is loaded over HTTPS, only `wss:\/\/` URLs \(SSL encrypted websockets URLs\) are supported./i);
  expect(disclaimerElement).toBeInTheDocument();
});
