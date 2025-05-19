export interface RoomUser {
  name: string;
  userId: string;
}

interface RoomData {
  users: RoomUser[];
}

interface RoomDataDTO {
  roomId: number;
  roomUsers: RoomUser[];
}

export class Rooms {
  private readonly rooms: RoomData[] = [];

  public createRoom(user: RoomUser) {
    this.rooms.push({ users: [user] });
  }

  public addUserToRoom(user: RoomUser, roomId: number): RoomDataDTO {
    const room = this.rooms[roomId];
    room.users.push(user);

    return { roomId, roomUsers: room.users };
  }

  public getEmptyRooms(): RoomDataDTO[] {
    return this.rooms
      .map((room, index) => ({ roomId: index, roomUsers: room.users }))
      .filter(({ roomUsers }) => roomUsers.length === 1);
  }
}
