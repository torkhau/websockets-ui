import { WebSocket, WebSocketServer } from 'ws';
import { MessageData, typeMessages, WSHandler } from './wsHandler/wsHandler.js';

interface Message extends MessageData {
  id: 0;
}

const PORT = 3000;

export function startWSServer() {
  const wss = new WebSocketServer({ port: PORT });
  const wsHandler = new WSHandler();

  wss.on('connection', (ws: WebSocket) => {
    const currentUserId = crypto.randomUUID();

    wsHandler.addUser(currentUserId, ws);

    ws.on('message', (message: string) => {
      const { type, data } = JSON.parse(message) as Message;

      console.log(`Received message: ${type} => ${data}`);
      
      if (typeMessages.includes(type)) wsHandler.handleMessage(currentUserId, { type, data });
    });

    ws.on('close', () => {
      wsHandler.deleteUser(currentUserId);
    });
  });

  console.log(`Start websocket server on the ${PORT} port!`);
}
