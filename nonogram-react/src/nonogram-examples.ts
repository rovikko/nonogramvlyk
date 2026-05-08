import type { Nonogram } from "./nonogram";

export const N1Example: Partial<Nonogram> = {
  rowSize: 15,
  columnSize: 15,
  columns: [
    [9],
    [9, 5],
    [5, 2, 6],
    [3, 2, 3],
    [2, 1, 2, 2],

    [3, 1, 3, 1],
    [5, 3, 1],
    [1, 2, 1],
    [2, 2, 1, 1],
    [2, 2, 1, 1, 1],

    [2, 1, 2, 1, 1],
    [2, 1, 2, 1],
    [4, 4, 1],
    [11, 1],
    [7, 3],
  ],
  rows: [
    [5],
    [6],
    [4, 1, 4],
    [3, 2, 6],
    [3, 1, 1, 2, 3],

    [2, 1, 1, 1, 3],
    [3, 2, 1, 2],
    [3, 1, 1, 2],
    [2, 3, 5],
    [7, 1, 3],

    [2, 2, 2, 2],
    [2, 2, 3],
    [3, 5, 2],
    [4, 1],
    [14],
  ],
};

export const N2Example: Partial<Nonogram> = {
  rowSize: 5,
  columnSize: 5,
  columns: [[1, 2], [3], [4], [3], [1, 2]],
  rows: [[1], [5], [3], [5], [1, 1]],
};
