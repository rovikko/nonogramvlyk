import { P5Canvas, type Sketch, type SketchProps } from "@p5-wrapper/react";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import { combinations } from "combinatorial-generators";

type Grid = number[][];

type MySketchProps = SketchProps & {
  nonogramData: Nonogram;
  grid: Grid;
  setGrid: (grid: Grid) => void;
};

const createGrid = (width: number, height: number) =>
  Array.from({ length: height }, () => Array.from({ length: width }, () => 0));

function gridGetRow(grid: Grid, rowIdx: number) {
  return grid.map((row) => row[rowIdx]);
}
function gridGetColumn(grid: Grid, colIdx: number) {
  return grid[colIdx];
}
function gridIsSolved(grid: Grid): boolean {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === 0) {
        return false;
      }
    }
  }
  return true;
}

function gridsEqual(g1: Grid, g2: Grid) {
  return JSON.stringify(g1) === JSON.stringify(g2);
}

const RECT_SIZE = 40;
const TEXT_SIZE = 30;

const sketch: Sketch<MySketchProps> = (p5) => {
  let _props: MySketchProps;
  // let grid: number[][] = [];

  p5.setup = () => {
    const { w, h } = getCanvasSize(_props.nonogramData);
    p5.createCanvas(w, h, p5.P2D);
    console.log("init grid:", w, h);
  };

  const getCluesData = (nonogramData: Nonogram) => {
    const longestColumn = Math.max(
      ...nonogramData.columns.map((col) => col.length),
    );
    const longestRow = Math.max(...nonogramData.rows.map((row) => row.length));
    return { longestColumn, longestRow };
  };

  const getGridOffset = () => {
    const { longestColumn, longestRow } = getCluesData(_props.nonogramData);
    return {
      x: longestRow * RECT_SIZE,
      y: longestColumn * RECT_SIZE,
    };
  };

  const getCanvasSize = (nonogramData: Nonogram) => {
    const { longestColumn, longestRow } = getCluesData(nonogramData);
    const w = (nonogramData.rowSize + longestRow || 10) * RECT_SIZE;
    const h = (nonogramData.columnSize + longestColumn || 10) * RECT_SIZE;
    return { w, h };
  };

  p5.updateWithProps = (props) => {
    _props = props;
    if (_props.nonogramData) {
      // grid = createGrid(_props.nonogramData.rowSize);

      const { w, h } = getCanvasSize(_props.nonogramData);
      p5.resizeCanvas(w, h, false);
    }
  };

  const drawGameField = () => {
    const { longestColumn, longestRow } = getCluesData(_props.nonogramData);

    // Columns
    p5.textSize(TEXT_SIZE);
    p5.push();
    p5.fill(100);
    p5.translate(longestRow * RECT_SIZE, 0);
    _props.nonogramData.columns.forEach((col, i) => {
      col.forEach((clues, j) => {
        const colOffset = longestColumn - col.length;
        p5.push();
        p5.translate(i * RECT_SIZE, (j + colOffset) * RECT_SIZE);
        p5.rect(0, 0, RECT_SIZE, RECT_SIZE);
        p5.fill(0);
        p5.text(clues, TEXT_SIZE / 4, TEXT_SIZE);
        p5.pop();
      });
    });
    p5.fill(0);
    p5.pop();

    // Rows
    p5.push();
    p5.fill(100);
    p5.translate(0, longestColumn * RECT_SIZE);
    _props.nonogramData.rows.forEach((row, i) => {
      row.forEach((clues, j) => {
        const rowOffset = longestRow - row.length;
        p5.push();
        p5.translate((j + rowOffset) * RECT_SIZE, i * RECT_SIZE);
        p5.rect(0, 0, RECT_SIZE, RECT_SIZE);
        p5.fill(0);
        p5.text(clues, TEXT_SIZE / 4, TEXT_SIZE);
        p5.pop();
      });
    });
    p5.pop();

    // Grid
    const { x: gridOffsetX, y: gridOffsetY } = getGridOffset();
    p5.push();
    p5.translate(gridOffsetX, gridOffsetY);

    for (let rowIdx = 0; rowIdx < _props.grid.length; rowIdx++) {
      for (let colIdx = 0; colIdx < _props.grid[rowIdx].length; colIdx++) {
        p5.push();
        if (_props.grid[colIdx][rowIdx] === -1) {
          p5.fill(255);
          p5.rect(colIdx * RECT_SIZE, rowIdx * RECT_SIZE, RECT_SIZE, RECT_SIZE);
          p5.line(
            colIdx * RECT_SIZE,
            rowIdx * RECT_SIZE,
            (colIdx + 1) * RECT_SIZE,
            (rowIdx + 1) * RECT_SIZE,
          );
          p5.line(
            colIdx * RECT_SIZE,
            (rowIdx + 1) * RECT_SIZE,
            (colIdx + 1) * RECT_SIZE,
            rowIdx * RECT_SIZE,
          );
          p5.pop();
          continue;
        }
        if (_props.grid[colIdx][rowIdx] === 1) {
          p5.fill(50);
        } else {
          p5.fill(255);
        }
        p5.rect(colIdx * RECT_SIZE, rowIdx * RECT_SIZE, RECT_SIZE, RECT_SIZE);
        p5.pop();
      }
    }

    // Grid 5x Lines
    p5.strokeWeight(4);
    const width = _props.nonogramData.rowSize;
    const height = _props.nonogramData.columnSize;
    for (let i = 5; i < width; i += 5) {
      p5.line(i * RECT_SIZE, 0, i * RECT_SIZE, width * RECT_SIZE);
    }
    for (let i = 5; i < height; i += 5) {
      p5.line(0, i * RECT_SIZE, height * RECT_SIZE, i * RECT_SIZE);
    }

    p5.pop();
  };

  p5.draw = () => {
    p5.background(0);
    drawGameField();
  };

  const mouseHandler = (e: MouseEvent) => {
    const { x: gridOffsetX, y: gridOffsetY } = getGridOffset();
    if (p5.mouseX < gridOffsetX && p5.mouseY < gridOffsetY) {
      return;
    }

    // Inside Grid
    const mouseX = p5.mouseX - gridOffsetX;
    const mouseY = p5.mouseY - gridOffsetY;
    const i = Math.floor(mouseX / 40);
    const j = Math.floor(mouseY / 40);

    const value = e.buttons === 2 ? 0 : 1;

    const grid = _props.grid;
    if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
      grid[i][j] = value;
    }

    _props.setGrid(_props.grid);
  };

  p5.mouseDragged = mouseHandler;
  p5.mousePressed = mouseHandler;
};

interface Nonogram {
  rowSize: number;
  columnSize: number;
  columns: number[][];
  rows: number[][];
}

const N1: Nonogram = {
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

const N2: Nonogram = {
  rowSize: 5,
  columnSize: 5,
  columns: [[1, 2], [3], [4], [3], [1, 2]],
  rows: [[1], [5], [3], [5], [1, 1]],
};

function solveNonogram(nonogram: Nonogram): {
  solution: Grid;
  animation: Grid[];
} {
  const animation: Grid[] = [];

  const analyzeRow = (row: number[], rowSize: number, simple?: number[]) => {
    const rowSum = row.reduce((sum, v) => sum + v, 0);

    const n_groups = row.length;
    const n_spaces = rowSize - (rowSum + row.length - 1);

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
        new Array(n_groups + n_spaces).fill(0).map((v, i) => i),
        n_groups,
      ),
    ];

    const sequenceToGridRow = (sequence: number[]) => {
      const gridRow = new Array(rowSize).fill(0);

      sequence = sequence.map((v, i) => {
        if (i == 0) {
          return v;
        }
        const sumOfPrevGroupSizes = row.slice(0, i).reduce((s, v) => s + v);
        return v + sumOfPrevGroupSizes;
      });
      sequence.forEach((groupStartIdx, i) => {
        const groupSize = row[i];
        for (let j = 0; j < groupSize; j++) {
          gridRow[groupStartIdx + j] = 1;
        }
      });
      return gridRow;
    };

    // console.log(sequences);
    // console.log(
    //   sequences.map((s) => sequenceToGridRow(s)).map((s) => s.join("")),
    // );

    let possibleRows = sequences.map((s) => sequenceToGridRow(s));

    if (simple) {
      possibleRows = possibleRows.filter((possibleRow) => {
        for (let i = 0; i < simple.length; i++) {
          const simpleVal = simple[i];
          const possibleVal = possibleRow[i];
          if (simpleVal === 1 && possibleVal != 1) {
            return false;
          }
          if (simpleVal === -1 && possibleVal == 1) {
            return false;
          }
        }
        return true;
      });
    }
    const possibleRowsCount = possibleRows.length;
    // console.log(possibleRowsCount);

    const weights = new Array(rowSize)
      .fill(0)
      .map((_, i) =>
        possibleRows.reduce((acc, curr) => acc + (curr[i] || 0), 0),
      );

    const simpleTiles = weights.map((w) => {
      if (w === possibleRowsCount) {
        return 1;
      }
      if (w === 0) {
        return -1;
      }
      return 0;
    });

    // console.log("weights", weights);
    // console.log("simpleTiles", simpleTiles);

    // if weight === sequences.length  -  it means tile is filled 100%
    return { possibleRows, weights, simpleTiles };
  };

  const g: Grid = createGrid(nonogram.rowSize, nonogram.columnSize);

  // set simple tiles in grid

  console.log(" ");
  console.log(" ");
  console.log(" ");
  let isSolved = false;

  while (!isSolved) {
    console.log("solving");
    nonogram.rows.forEach((row, rowIdx) => {
      const simpleRow = gridGetRow(g, rowIdx); // with already solved tiles
      const { simpleTiles } = analyzeRow(row, nonogram.rowSize, simpleRow);
      simpleTiles.forEach((tile, tileIdx) => {
        const prevGrid = structuredClone(g);
        g[tileIdx][rowIdx] ||= tile;
        const newGrid = structuredClone(g);
        if (!gridsEqual(prevGrid, newGrid)) {
          animation.push(structuredClone(g));
        }
      });
    });

    nonogram.columns.forEach((row, colIdx) => {
      // console.log(colIdx);
      const simpleCol = gridGetColumn(g, colIdx); // with already solved tiles
      const { simpleTiles } = analyzeRow(row, nonogram.rowSize, simpleCol);
      simpleTiles.forEach((tile, tileIdx) => {
        const prevGrid = structuredClone(g);
        g[colIdx][tileIdx] ||= tile;
        const newGrid = structuredClone(g);
        if (!gridsEqual(prevGrid, newGrid)) {
          animation.push(structuredClone(g));
        }
      });
    });

    isSolved = gridIsSolved(g);
  }

  // console.log("asdasd");
  // console.log(gridGetColumn(g, 9));
  // console.log("TEST");
  // analyzeRow(nonogram.columns[3], nonogram.columnSize, gridGetColumn(g, 3));

  return { solution: g, animation };
}

export function Animation() {
  const [frame, setFrame] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const requestRef = useRef();
  const pausedRef = useRef(isPaused);

  // Keep the ref in sync with state for the loop to read
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const animate = (time) => {
    if (!pausedRef.current) {
      setFrame((prev) => (prev + 1) % 100);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Run once

  return <>TODO: add animation of nonogram solver here</>;
}

export function App() {
  const FPS_ = 60;

  const init: Nonogram = N1;
  // TODO: refactor state
  const [result] = useState(solveNonogram(init));
  const [nonogramData, setNonogramData] = useState<Nonogram>(init);

  const [grid, setGrid] = useState<Grid>(
    createGrid(init.rowSize, init.columnSize),
  );

  // animation logic
  const [frameCount, setFrameCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCount((prevCount) => {
        // update fram
        // console.log(prevCount, result.animation.length - 1);
        if (prevCount >= result.animation.length - 1) {
          clearInterval(interval);
          return prevCount;
        }
        return prevCount + 1;
      });
    }, 1000 / FPS_);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Animation></Animation>
      <div className="container">
        <div className="canvas-container">
          <div className="controls"></div>
          {frameCount}
          <P5Canvas
            sketch={sketch}
            nonogramData={nonogramData}
            grid={result.animation[frameCount]}
            setGrid={setGrid}
          />
        </div>
      </div>
    </>
  );
}

export default App;
