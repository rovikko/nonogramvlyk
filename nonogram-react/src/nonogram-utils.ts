import type { Grid } from "./nonogram";

export function createGrid(width: number, height: number) {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 0),
  );
}

export function gridGetRow(grid: Grid, rowIdx: number) {
  return grid.map((row) => row[rowIdx]);
}

export function gridGetColumn(grid: Grid, colIdx: number) {
  return grid[colIdx];
}

export function gridIsSolved(grid: Grid): boolean {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === 0) {
        return false;
      }
    }
  }
  return true;
}

export function gridsEqual(g1: Grid, g2: Grid) {
  return JSON.stringify(g1) === JSON.stringify(g2);
}
