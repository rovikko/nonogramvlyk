import { type Grid } from "./nonogram";
import { NonogramTile } from "./nonogram-tile";

export function createGrid(width: number, height: number): Grid {
  return new Array(height)
    .fill(null)
    .map(() => new Array(width).fill(NonogramTile.Empty));
}

export function gridGetColumn(grid: Grid, idx: number) {
  return grid.map((row) => row[idx]);
}

export function gridGetRow(grid: Grid, idx: number) {
  return grid[idx];
}

export function gridIsSolved(grid: Grid): boolean {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === NonogramTile.Empty) {
        return false;
      }
    }
  }
  return true;
}

export function gridsEqual(g1: Grid, g2: Grid) {
  return JSON.stringify(g1) === JSON.stringify(g2);
}
