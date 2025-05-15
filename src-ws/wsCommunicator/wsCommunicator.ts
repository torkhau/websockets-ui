import WebSocket from 'ws';
import { DB } from '../db/index.js';
import { Message, PlayerTypeCommands } from './types.js';

export class WSCommunicator {
  private ws: WebSocket;
  private db: DB;

  constructor(ws: WebSocket, db: DB) {
    this.ws = ws;
    this.db = db;

    ws.on('message', this.readerMessages.bind(this));
  }

  private readerMessages(message: string): void {
    const msg: Message = JSON.parse(message);

    switch (msg.type) {
      case PlayerTypeCommands.Registration:
        this.regType(msg.data);
        break;
      default:
        break;
    }
  }

  private senderMessages(messageType: Message['type'], message: object): void {
    this.ws.send(JSON.stringify({ type: messageType, data: JSON.stringify(message), id: 0 }));
  }

  private regType(data: Message['data']) {
    const message = { name: '', index: -1, error: false, errorText: '' };
    const regData = JSON.parse(data);

    if (
      'name' in regData &&
      typeof regData.name === 'string' &&
      'password' in regData &&
      typeof regData.password === 'string'
    ) {
      try {
        const { name, userId } = this.db.users.createUser(regData);
        message.name = name;
        message.index = userId;
      } catch (error) {
        message.error = true;
        message.errorText = (error as Error)?.message;
      }
    } else {
      message.error = true;
      message.errorText = 'Invalid registration data';
    }

    this.senderMessages(PlayerTypeCommands.Registration, message);
  }
}
