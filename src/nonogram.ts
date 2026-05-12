import { NonogramTile } from "./nonogram-tile";
import { createGrid, gridGetColumn, gridGetRow } from "./nonogram-utils";

export type Grid = NonogramTile[][];
export type Clues = number[][];

export class Nonogram {
  field: Grid;
  width: number;
  height: number;

  clueRows: Clues;
  clueColumns: Clues;

  constructor(n?: Partial<Nonogram>) {
    this.width = n?.width ?? 0;
    this.height = n?.height ?? 0;
    this.clueRows = n?.clueRows ?? [];
    this.clueColumns = n?.clueColumns ?? [];
    this.field = n?.field ?? createGrid(this.width, this.height);
  }

  initGrid(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.field = createGrid(this.width, this.height);
  }

  isNonogramModelValid() {
    const fieldRowSize = this.field.length;
    const fieldColumnSize = this.field[0].length;

    const valid =
      fieldRowSize === this.width &&
      fieldColumnSize === this.height &&
      this.clueRows.length === this.width &&
      this.clueColumns.length === this.height;

    return valid;
  }

  getCluesData() {
    const longestColumn = Math.max(
      ...this.clueColumns.map((col) => col.length),
    );
    const longestRow = Math.max(...this.clueRows.map((row) => row.length));
    return { longestColumn, longestRow };
  }

  clearOutByTile(tile: NonogramTile) {
    for (let i = 0; i < this.field.length; i++) {
      for (let j = 0; j < this.field[i].length; j++) {
        const elem = this.field[i][j];
        if (elem === tile) {
          this.field[i][j] = NonogramTile.Empty;
        }
      }
    }
  }

  computeClues() {
    const grid = this.field;
    this.clueRows = [];
    // convert drawing to clues
    for (let i = 0; i < grid.length; i++) {
      const row = gridGetRow(grid, i);
      const rowClues = [];
      let counter = 0;
      for (let j = 0; j < row.length; j++) {
        const element = row[j];
        if (element === NonogramTile.Filled) {
          counter++;
        } else {
          if (counter > 0) {
            rowClues.push(counter);
          }
          counter = 0;
        }
      }
      if (counter > 0) {
        rowClues.push(counter);
      }
      this.clueRows.push(rowClues);
    }

    this.clueColumns = [];
    for (let i = 0; i < grid[0].length; i++) {
      const row = gridGetColumn(grid, i);
      const columnClues = [];
      let counter = 0;
      for (let j = 0; j < row.length; j++) {
        const element = row[j];
        if (element === NonogramTile.Filled) {
          counter++;
        } else {
          if (counter > 0) {
            columnClues.push(counter);
          }
          counter = 0;
        }
      }
      if (counter > 0) {
        columnClues.push(counter);
      }

      this.clueColumns.push(columnClues);
    }
  }
}
