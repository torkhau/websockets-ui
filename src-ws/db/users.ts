interface User {
  name: string;
  password: string;
}

interface UserData extends User {
  userId: number;
}

export class Users {
  private readonly users: User[] = [];

  private getUser(name: string): UserData | undefined {
    let userId = -1;
    const user = this.users.find(({ name: userName }, index) => {
      if (userName === name) {
        userId = index;
        return true;
      }

      return false;
    });

    if (user) {
      return { ...user, userId };
    }

    return undefined;
  }

  public createUser({ name, password }: User): Omit<UserData, 'password'> {
    const user = this.getUser(name);

    if (user) {
      if (user.password === password) return { userId: user.userId, name: user.name };

      throw new Error('Please check password! Or create new user.');
    }

    const userId = this.users.push({ name, password });

    return { userId, name };
  }
}
