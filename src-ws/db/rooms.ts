export interface RoomUser {
  name: string;
  userId: number;
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

  public createRoom(user: RoomUser): RoomDataDTO {
    const roomId = this.rooms.push({ users: [user] }) - 1;

    return { roomId, roomUsers: this.rooms[roomId].users };
  }

  public getEmptyRooms(): RoomDataDTO[] {
    return this.rooms
      .map((room, index) => ({ roomId: index, roomUsers: room.users }))
      .filter(({ roomUsers }) => roomUsers.length === 1);
  }
}
