import { Users } from './users.js';

export class DB {
  private usersDB = new Users();

  get users() {
    return this.usersDB;
  }
}
