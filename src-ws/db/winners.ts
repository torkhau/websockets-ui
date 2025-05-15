interface Winner {
  name: string;
  wins: number;
}

export class Winners {
  private readonly arrWinners: Winner[] = [];

  get winners(): Winner[] {
    return this.arrWinners;
  }

  set winners (winner: Winner['name']) {
    const index = this.arrWinners.findIndex(({ name }) => name === winner);

    if (index === -1) {
      this.arrWinners.push({ name: winner, wins: 1 });
    } else {
      this.arrWinners[index].wins += 1;
    }
  }
}
