import { EventEmitter } from 'node:events';
import { WebSocket } from 'ws';
import { Rooms, ShipPosition } from '../db/rooms.js';
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

interface Attack {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: string;
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

      if (!(userData.password && userData.name)) {
        this.sendResult(
          joinedUser,
          'reg',
          JSON.stringify({ name: '', index: -1, error: true, errorText: 'User data is not valid' })
        );
        return;
      }

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
      const [{ userId: enemyUserId }] = roomUsers.filter(({ userId: id }) => id !== userId);

      const enemyUser = this.joined.get(enemyUserId);
      if (!enemyUser) return;

      this.emit('broadcast_rooms');
      this.sendResult(joinedUser, 'create_game', JSON.stringify({ idGame: roomId, idPlayer: userId }));
      this.sendResult(enemyUser, 'create_game', JSON.stringify({ idGame: roomId, idPlayer: enemyUserId }));
    });

    this.on('add_ships', (_userId: string, data: string) => {
      const { gameId, ...rest } = JSON.parse(data) as ShipPosition;

      this.rooms.setShips({ gameId, ...rest });

      if (this.rooms.isRoomReady(gameId)) {
        const {
          users: [user1, user2],
        } = this.rooms.getRoom(gameId);
        const joinedUser1 = this.joined.get(user1.userId);
        const joinedUser2 = this.joined.get(user2.userId);

        if (joinedUser1 && joinedUser2) {
          this.sendResult(
            joinedUser1,
            'start_game',
            JSON.stringify({ ships: user1.gameBoard?.getRawShips(), currentPlayerIndex: user1.userId })
          );
          this.sendResult(
            joinedUser2,
            'start_game',
            JSON.stringify({ ships: user2.gameBoard?.getRawShips(), currentPlayerIndex: user2.userId })
          );

          const currentPlayer = this.rooms.setCurrentPlayer(gameId, Math.random() > 0.5 ? user1.userId : user2.userId);
          this.sendResult(joinedUser1, 'turn', JSON.stringify({ currentPlayer }));
          this.sendResult(joinedUser2, 'turn', JSON.stringify({ currentPlayer }));
        }
      }
    });

    this.on('attack', (_userId: string, data: string) => {
      const { gameId, indexPlayer, ...rest } = JSON.parse(data) as Attack;
      const { currentPlayer, users } = this.rooms.getRoom(gameId);

      if (currentPlayer !== indexPlayer) return;

      const enemyUser = users.find(({ userId }) => userId !== indexPlayer);

      if (!enemyUser) return;

      const status = enemyUser?.gameBoard?.shoot(rest);
      const currentUser = this.joined.get(indexPlayer);
      const enemy = this.joined.get(enemyUser.userId);

      if (!currentUser || !enemy) return;

      this.sendResult(
        currentUser,
        'attack',
        JSON.stringify({ status, position: { ...rest }, currentPlayer: indexPlayer })
      );
      this.sendResult(enemy, 'attack', JSON.stringify({ status, position: { ...rest }, currentPlayer: indexPlayer }));
      let nextPlayer = currentPlayer;

      if (status === 'miss') nextPlayer = this.rooms.setCurrentPlayer(gameId, enemyUser.userId);

      this.sendResult(currentUser, 'turn', JSON.stringify({ currentPlayer: nextPlayer }));
      this.sendResult(enemy, 'turn', JSON.stringify({ currentPlayer: nextPlayer }));
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
