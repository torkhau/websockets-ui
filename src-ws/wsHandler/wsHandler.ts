import { EventEmitter } from 'node:events';
import { WebSocket } from 'ws';
import { Rooms } from '../db/rooms.js';
import { Winners } from '../db/winners.js';

export const typeMessages = [
  'reg',
  'update_winners',
  'create_room',
  'add_user_to_room',
  'create_game',
  'update_room',
  'add_ships',
  'start_game',
  'attack',
  'randomAttack',
  'turn',
  'finish',
] as const;

type TypeMessages = (typeof typeMessages)[number];

export interface MessageData {
  type: TypeMessages;
  data: string;
}

interface User {
  name: string;
  password: string;
}

export interface Joined {
  ws: WebSocket;
  user?: User;
}

export class WSHandlerBattleship extends EventEmitter {
  private winners = new Winners();
  private rooms = new Rooms();
  private joined: Map<string, Joined> = new Map();

  constructor() {
    super();
    this.on('reg', (userId: string, data: string) => {
      const user = JSON.parse(data) as User;
      const ws = this.joined.get(userId)!.ws;

      this.joined.get(userId)!.user = user;

      this.sendResult(ws, 'reg', JSON.stringify({ name: user.name, index: userId, error: false, errorText: '' }));
      this.sendResult(ws, 'update_room', JSON.stringify(this.rooms.getEmptyRooms()));
      this.sendResult(ws, 'update_winners', JSON.stringify(this.winners.winners));
    });

    this.on('create_room', (userId: string, _data: string) => {
      const user = this.joined.get(userId)!.user!;
      this.rooms.createRoom({ name: user.name, userId });

      this.sendResult(this.wsForBroadcast(), 'update_room', JSON.stringify(this.rooms.getEmptyRooms()));
    });

    this.on('create_room', (userId: string, _data: string) => {
      const user = this.joined.get(userId)!.user!;
      this.rooms.createRoom({ name: user.name, userId });

      this.sendResult(this.wsForBroadcast(), 'update_room', JSON.stringify(this.rooms.getEmptyRooms()));
    });
  }

  private sendResult(ws: WebSocket | WebSocket[], type: TypeMessages, data: string) {
    if (Array.isArray(ws)) {
      ws.forEach((w) => {
        console.log(`Send message: ${type} => ${data}`);
        w.send(JSON.stringify({ type, data, id: 0 }));
      });
    } else {
      console.log(`Send message: ${type} => ${data}`);
      ws.send(JSON.stringify({ type, data, id: 0 }));
    }
  }

  private wsForBroadcast(): WebSocket[] {
    return Array.from(this.joined.values())
      .map(({ ws }) => (ws.readyState === WebSocket.OPEN ? ws : null))
      .filter(Boolean) as WebSocket[];
  }

  public addUser(userId: string, ws: WebSocket) {
    this.joined.set(userId, { ws });
  }

  public deleteUser(userId: string) {
    this.joined.delete(userId);
  }

  public handleMessage(userId: string, { type, data }: MessageData) {
    this.emit(type, userId, data);
  }
}
