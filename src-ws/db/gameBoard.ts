type Cell = undefined | 'ship' | 'shot' | 'miss' | 'killed';

export type Coordinates = { x: number; y: number };

export interface ShipData {
  position: Coordinates;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

interface Ship {
  positions: Coordinates[];
  hits: Set<string>;
}

interface Board {
  cells: Cell[][];
  ships: Ship[];
  rawShips?: ShipData[];
}

const LENGTH = 10;

export class GameBoard {
  private readonly board: Board = {
    cells: Array.from({ length: LENGTH }, () => Array.from({ length: LENGTH }, () => undefined)),
    ships: [],
  };

  private placeShip(initPosition: Coordinates, direction: boolean, length: number): void {
    const ship: Ship = {
      positions: [],
      hits: new Set(),
    };

    for (let i = 0; i < length; i += 1) {
      const x = direction ? initPosition.x : initPosition.x + i;
      const y = direction ? initPosition.y + i : initPosition.y;

      this.board.cells[y][x] = 'ship';
      ship.positions.push({ x, y });
    }

    this.board.ships.push(ship);
  }

  public addShips(ships: ShipData[]) {
    this.board.rawShips = [...ships];
    ships.forEach(({ position, direction, length }) => this.placeShip(position, direction, length));
  }

  public getRawShips(): ShipData[] {
    return this.board.rawShips ? [...this.board.rawShips] : [];
  }

  public shoot({ x, y }: Coordinates): 'miss' | 'shot' | 'killed' {
    const cell = this.board.cells[y][x];

    if (cell === undefined) {
      this.board.cells[y][x] = 'miss';
      return 'miss';
    }

    if (cell === 'ship') {
      this.board.cells[y][x] = 'shot';

      const key = `${x},${y}`;
      const ship = this.board.ships.find((s) => s.positions.some((p) => p.x === x && p.y === y));

      if (ship) {
        ship.hits.add(key);

        if (ship.hits.size === ship.positions.length) {
          ship.positions.forEach(({ x, y }) => {
            this.board.cells[y][x] = 'killed';
          });
          return 'killed';
        }

        return 'shot';
      }
    }

    if (cell === 'shot' || cell === 'killed' || cell === 'miss') {
      return cell;
    }

    return 'miss';
  }

  public markKilledShip({ x, y }: Coordinates): Coordinates[] {
    const ship = this.board.ships.find((s) => s.positions.some((p) => p.x === x && p.y === y));

    if (!ship) return [];

    const directions = [-1, 0, 1];
    const result: Coordinates[] = [];

    const isShipPosition = (x: number, y: number) => ship.positions.some((p) => p.x === x && p.y === y);

    for (const { x: sx, y: sy } of ship.positions) {
      for (const dx of directions) {
        for (const dy of directions) {
          const nx = sx + dx;
          const ny = sy + dy;

          if (dx === 0 && dy === 0) continue;

          if (nx < 0 || ny < 0 || nx >= LENGTH || ny >= LENGTH) continue;

          if (isShipPosition(nx, ny)) continue;

          if (this.board.cells[ny][nx] !== undefined) continue;

          this.board.cells[ny][nx] = 'miss';
          result.push({ x: nx, y: ny });
        }
      }
    }

    return result;
  }

  public randomAttack(): Coordinates {
    const emptyCells: Coordinates[] = [];

    for (let y = 0; y < LENGTH; y += 1)
      for (let x = 0; x < LENGTH; x += 1) if (this.board.cells[y][x] === undefined) emptyCells.push({ x, y });

    if (emptyCells.length === 0) return { x: 0, y: 0 };

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
}
