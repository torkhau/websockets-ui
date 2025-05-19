import { GameBoard, ShipData } from './gameBoard.js';

export interface RoomUser {
  name: string;
  userId: string;
  gameBoard?: GameBoard;
  ready?: boolean;
}

interface RoomData {
  users: RoomUser[];
}

interface RoomDataDTO {
  roomId: number;
  roomUsers: RoomUser[];
}

export interface ShipPosition {
  gameId: number;
  indexPlayer: string;
  ships: ShipData[];
}

export class Rooms {
  private readonly rooms: RoomData[] = [];

  public createRoom(user: RoomUser) {
    this.rooms.push({
      users: [{ ...user, gameBoard: new GameBoard() }],
    });
  }

  public addUserToRoom(user: RoomUser, roomId: number): RoomDataDTO {
    const room = this.rooms[roomId];
    room.users.push({ ...user, gameBoard: new GameBoard() });

    return { roomId, roomUsers: room.users };
  }

  public getEmptyRooms(): RoomDataDTO[] {
    return this.rooms
      .map((room, index) => ({ roomId: index, roomUsers: room.users }))
      .filter(({ roomUsers }) => roomUsers.length === 1);
  }

  public setShips({ gameId, indexPlayer, ships }: ShipPosition) {
    const room = this.rooms[gameId];
    const user = room.users.find(({ userId }) => userId === indexPlayer);

    if (!user) return;

    user.gameBoard?.addShips(ships);
    user.ready = true;
  }

  public isRoomReady(gameId: number): boolean {
    const room = this.rooms[gameId];

    if (!room) return false;

    return room.users.every(({ ready }) => ready);
  }

  public getUsersInRoom(gameId: number): RoomUser[] {
    const room = this.rooms[gameId];

    if (!room) return [];

    return room.users;
  }
}
