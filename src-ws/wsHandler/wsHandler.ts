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

    this.on('broadcast_rooms', () => {
      this.sendResult(this.wsForBroadcast(), 'update_room', JSON.stringify(this.rooms.getEmptyRooms()));
    });

    this.on('reg', (userId: string, data: string) => {
      const joinedUser = this.joined.get(userId);

      if (!joinedUser) return;

      const userData = JSON.parse(data) as User;
      joinedUser['user'] = userData;

      this.sendResult(
        joinedUser,
        'reg',
        JSON.stringify({ name: userData.name, index: userId, error: false, errorText: '' })
      );
      this.sendResult(joinedUser, 'update_room', JSON.stringify(this.rooms.getEmptyRooms()));
      this.sendResult(joinedUser, 'update_winners', JSON.stringify(this.winners.winners));
    });

    this.on('create_room', (userId: string, _data: string) => {
      const joinedUser = this.joined.get(userId);

      if (!(joinedUser && joinedUser.user)) return;

      this.rooms.createRoom({ name: joinedUser.user.name, userId });
      this.emit('broadcast_rooms');
    });

    this.on('add_user_to_room', (userId: string, data: string) => {
      const joinedUser = this.joined.get(userId);

      if (!(joinedUser && joinedUser.user)) return;

      const { indexRoom } = JSON.parse(data) as { indexRoom: number };
      const { roomId, roomUsers } = this.rooms.addUserToRoom({ name: joinedUser.user.name, userId }, indexRoom);
      const [{userId: enemyUserId}] = roomUsers.filter(({ userId: id }) => id !== userId);
      
      const enemyUser = this.joined.get(enemyUserId);
      if (!enemyUser) return;

      this.emit('broadcast_rooms');
      this.sendResult(joinedUser, 'create_game', JSON.stringify({ idGame: roomId, idPlayer: userId }));
      this.sendResult(enemyUser, 'create_game', JSON.stringify({ idGame: roomId, idPlayer: enemyUserId }));
    });
  }

  private sendResult(users: Joined | Joined[], type: TypeMessages, data: string) {
    if (Array.isArray(users)) {
      users.forEach(({ ws }) => {
        console.log(`Send message: ${type} => ${data}`);
        ws.send(JSON.stringify({ type, data, id: 0 }));
      });
    } else {
      console.log(`Send message: ${type} => ${data}`);
      users.ws.send(JSON.stringify({ type, data, id: 0 }));
    }
  }

  private wsForBroadcast(): Joined[] {
    return Array.from(this.joined.values()).filter(({ ws }) => ws && ws.OPEN);
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
