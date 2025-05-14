import { WebSocketServer, WebSocket } from 'ws';
import { WSCommunicator } from './wsCommunicator/index.js';

const PORT = 3000;

export function startWSServer() {
  const wss = new WebSocketServer({ port: PORT });

  wss.on('connection', (ws: WebSocket) => {
    new WSCommunicator(ws);
  });

  return PORT;
}