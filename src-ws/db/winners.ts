interface Winner {
  userId: string;
  name: string;
  wins: number;
}

type WinnersDTO = Omit<Winner, 'userId'>[];

export class Winners {
  private readonly arrWinners: Winner[] = [];

  public get winners(): WinnersDTO {
    return this.arrWinners.map(({ name, wins }) => ({ name, wins }));
  }

  public updateWinner({ userId, name }: Omit<Winner, 'wins'>): WinnersDTO {
    const index = this.arrWinners.findIndex((winner) => userId === winner.userId);

    if (index === -1) {
      this.arrWinners.push({ userId, name, wins: 1 });
    } else {
      this.arrWinners[index].wins += 1;
    }

    return this.winners;
  }
}
