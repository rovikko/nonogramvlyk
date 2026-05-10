import { createGrid } from "./nonogram-utils";

export const enum NonogramTile {
  Crossed = -1,
  Empty = 0,
  Filled = 1,
}

export type Grid = NonogramTile[][];
export type Clues = number[][];

export class Nonogram {
  field: Grid;
  rowSize: number;
  columnSize: number;

  rows: Clues;
  columns: Clues;

  constructor(n: Partial<Nonogram>) {
    this.rowSize = n.rowSize ?? 0;
    this.columnSize = n.columnSize ?? 0;
    this.rows = n.rows ?? [];
    this.columns = n.columns ?? [];
    this.field = n.field ?? createGrid(this.rowSize, this.columnSize);
  }

  isNonogramModelValid() {
    const fieldRowSize = this.field.length;
    const fieldColumnSize = this.field[0].length;

    const valid =
      fieldRowSize === this.rowSize &&
      fieldColumnSize === this.columnSize &&
      this.rows.length === this.rowSize &&
      this.columns.length === this.columnSize;

    return valid;
  }

  getCluesData() {
    const longestColumn = Math.max(...this.columns.map((col) => col.length));
    const longestRow = Math.max(...this.rows.map((row) => row.length));
    return { longestColumn, longestRow };
  }
}
