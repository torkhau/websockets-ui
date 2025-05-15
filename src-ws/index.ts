import { WebSocketServer, WebSocket } from 'ws';
import { WSCommunicator } from './wsCommunicator/index.js';
import { DB } from './db/index.js';

const PORT = 3000;
const db = new DB();

export function startWSServer() {
  const wss = new WebSocketServer({ port: PORT });

  wss.on('connection', (ws: WebSocket) => {
    new WSCommunicator(ws, db);
  });

  return PORT;
}