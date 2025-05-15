import { Users } from './users.js';
import { Winners } from './winners.js';

export class DB {
  private usersDB = new Users();
  private winnersDB = new Winners();

  get users() {
    return this.usersDB;
  }

  get winners() {
    return this.winnersDB;
  }
}
