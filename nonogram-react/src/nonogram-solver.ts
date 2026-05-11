import { combinations } from "combinatorial-generators";
import { type Nonogram, type Grid } from "./nonogram";
import { NonogramTile } from "./nonogram-tile";
import {
  createGrid,
  gridGetRow,
  gridsEqual,
  gridGetColumn,
  gridIsSolved,
} from "./nonogram-utils";

function analyzeRow(
  clues: number[],
  rowSize: number,
  currentGridRow?: number[],
) {
  const cluesSum = clues.reduce((sum, v) => sum + v, 0);

  const n_groups = clues.length;
  const n_spaces = rowSize - (cluesSum + clues.length - 1);

  // https://towardsdatascience.com/solving-nonograms-with-120-lines-of-code-a7c6e0f627e4/
  // [0, 1, 2] -> 111011011111100
  // [0, 1, 3] -> 111011001111110
  // [0, 1, 4] -> 111011000111111
  // [0, 2, 3] -> 111001101111110
  // [0, 2, 4] -> 111001100111111
  // [0, 3, 4] -> 111000110111111
  // [1, 2, 3] -> 011101101111110
  // [1, 2, 4] -> 011101100111111
  // [1, 3, 4] -> 011100110111111
  // [2, 3, 4] -> 001110110111111
  // get all possible combinations
  const sequences = [
    ...combinations(
      new Array(n_groups + n_spaces).fill(0).map((_, i) => i),
      n_groups,
    ),
  ];

  // converting sequences like [0, 1, 2] to grid rows like 111011011111100
  const sequenceToGridRow = (sequence: number[]) => {
    const gridRow = new Array(rowSize).fill(NonogramTile.Empty);
    sequence = sequence.map((v, i) => {
      if (i == 0) {
        return v;
      }
      const sumOfPrevClues = clues.slice(0, i).reduce((s, v) => s + v);
      return v + sumOfPrevClues;
    });
    sequence.forEach((groupStartIdx, i) => {
      const groupSize = clues[i];
      for (let j = 0; j < groupSize; j++) {
        gridRow[groupStartIdx + j] = NonogramTile.Filled;
      }
    });
    return gridRow;
  };

  // console.log(sequences);
  // console.log(
  //   sequences.map((s) => sequenceToGridRow(s)).map((s) => s.join("")),
  // );

  let possibleRows: number[][] = sequences.map((s) => sequenceToGridRow(s));

  if (currentGridRow) {
    // after getting all possible combinations we filter out only those that match with solved tiles
    possibleRows = possibleRows.filter((possibleRow) => {
      for (let i = 0; i < currentGridRow.length; i++) {
        const solvedTile = currentGridRow[i];
        const possibleVal = possibleRow[i];
        if (
          solvedTile === NonogramTile.Filled &&
          possibleVal != NonogramTile.Filled
        ) {
          return false;
        }
        if (
          solvedTile === NonogramTile.Crossed &&
          possibleVal == NonogramTile.Filled
        ) {
          return false;
        }
      }
      return true;
    });
  }
  const possibleRowsCount = possibleRows.length;
  // console.log(possibleRowsCount);

  // explanation:
  // thus we get only possible combinations that match with current state of grid
  // then we count weights for each tile - how many times it is filled in possible combinations
  const weights: number[] = new Array(rowSize)
    .fill(0)
    .map((_, i) =>
      possibleRows.reduce(
        (acc, curr) => acc + (curr[i] === NonogramTile.Filled ? 1 : 0),
        0,
      ),
    );

  const solvedTiles: NonogramTile[] = weights.map((w) => {
    // if weight === possibleRowsCount - it means tile is filled 100%
    if (w === possibleRowsCount) {
      return NonogramTile.Filled;
    }
    // if weight === 0 - it means tile is empty 100%
    if (w === 0) {
      return NonogramTile.Crossed;
    }
    return NonogramTile.Empty;
  });

  // console.log("weights", weights);
  // console.log("solvedTiles", solvedTiles);

  return { possibleRows, weights, solvedTiles };
}

export function solveNonogram(nonogram: Nonogram): {
  solution: Grid;
  animation: Grid[];
  isSolved: boolean;
} {
  const animation: Grid[] = [];

  const g: Grid = createGrid(nonogram.width, nonogram.height);

  let isSolved = false;
  const fallbackMaxIterations = 50;
  let iterations = 0;

  while (!isSolved && iterations < fallbackMaxIterations) {
    // console.log("solving");

    nonogram.clueRows.forEach((row, rowIdx) => {
      const currentSolvedRow = gridGetRow(g, rowIdx); // with already solved tiles
      const { solvedTiles } = analyzeRow(row, nonogram.width, currentSolvedRow);
      solvedTiles.forEach((tile, tileIdx) => {
        const prevGrid = structuredClone(g);
        if (g[rowIdx][tileIdx] === NonogramTile.Empty) {
          g[rowIdx][tileIdx] = tile;
        }
        const newGrid = structuredClone(g);
        if (!gridsEqual(prevGrid, newGrid)) {
          animation.push(structuredClone(g));
        }
      });
    });

    nonogram.clueColumns.forEach((row, colIdx) => {
      const currentSolvedCol = gridGetColumn(g, colIdx); // with already solved tiles
      const { solvedTiles } = analyzeRow(row, nonogram.width, currentSolvedCol);
      solvedTiles.forEach((tile, tileIdx) => {
        const prevGrid = structuredClone(g);
        if (g[tileIdx][colIdx] === NonogramTile.Empty) {
          g[tileIdx][colIdx] = tile;
        }
        const newGrid = structuredClone(g);
        if (!gridsEqual(prevGrid, newGrid)) {
          animation.push(structuredClone(g));
        }
      });
    });

    iterations++;
    isSolved = gridIsSolved(g);
  }

  console.log("SOLVED = ", isSolved, "iterations = ", iterations);

  return { solution: g, animation, isSolved };
}
