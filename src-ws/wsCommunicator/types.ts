export enum PlayerTypeCommands {
  Registration = 'reg',
  UpdateWinners = 'update_winners'
}

export enum RoomTypeCommand {
  Create = 'create_room',
  AddUser = 'add_user_to_room',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room'
}

export enum ShipsTypeCommand {
  AddShip = 'add_ship',
  StartGame = 'start_game'
}

export enum GameTypeCommand {
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  Finish = 'finish'
}

export interface Message {
  type: PlayerTypeCommands | RoomTypeCommand | ShipsTypeCommand | GameTypeCommand;
  data: string;
  id: 0;
}