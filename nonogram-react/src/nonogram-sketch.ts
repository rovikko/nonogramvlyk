import type { Sketch, SketchProps } from "@p5-wrapper/react";
import { NonogramTile, type Nonogram } from "./nonogram";

const RECT_SIZE = 40;
const TEXT_SIZE = 30;

export type MouseButton = "left" | "right";
export interface TileInputEvent {
  col: number;
  row: number;
  mouseButton: MouseButton;
}

type MySketchProps = SketchProps & {
  nonogram: Nonogram;
  tileInputHandler: (e: TileInputEvent) => void;
};

export const NonogramSketch: Sketch<MySketchProps> = (p5) => {
  let _props: MySketchProps;

  let CAMERA_ZOOM = 1;
  let CAMERA_ZOOM_MIN = 0.1;
  let PAN = { x: 0, y: 0 };

  p5.setup = () => {
    const { w, h } = getCanvasSize();
    p5.createCanvas(w, h, p5.P2D);
    console.log("init grid:", w, h);
  };

  const getGridOffset = () => {
    const { longestColumn, longestRow } = _props.nonogram.getCluesData();
    return {
      x: longestRow * RECT_SIZE,
      y: longestColumn * RECT_SIZE,
    };
  };

  const getCanvasSize = () => {
    const nonogram: Nonogram = _props.nonogram;
    const { longestColumn, longestRow } = nonogram.getCluesData();
    const w = (nonogram.rowSize + longestRow || 10) * RECT_SIZE;
    const h = (nonogram.columnSize + longestColumn || 10) * RECT_SIZE;
    return { w, h };
  };

  p5.updateWithProps = (props) => {
    _props = props;
    if (_props.nonogram) {
      const { w, h } = getCanvasSize();
      p5.resizeCanvas(w, h, false);
    }
  };

  const drawGameField = () => {
    const nonogram = _props.nonogram;
    const { longestColumn, longestRow } = nonogram.getCluesData();

    // Grid
    const { x: gridOffsetX, y: gridOffsetY } = getGridOffset();
    p5.push();
    p5.translate(gridOffsetX, gridOffsetY);
    p5.translate(PAN.x, PAN.y);
    p5.scale(CAMERA_ZOOM);
    const grid = nonogram.field;
    for (let rowIdx = 0; rowIdx < grid.length; rowIdx++) {
      for (let colIdx = 0; colIdx < grid[rowIdx].length; colIdx++) {
        p5.push();
        if (grid[colIdx][rowIdx] === NonogramTile.Crossed) {
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
        if (grid[colIdx][rowIdx] === NonogramTile.Filled) {
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
    const width = _props.nonogram.rowSize;
    const height = _props.nonogram.columnSize;
    for (let i = 5; i < width; i += 5) {
      p5.line(i * RECT_SIZE, 0, i * RECT_SIZE, width * RECT_SIZE);
    }
    for (let i = 5; i < height; i += 5) {
      p5.line(0, i * RECT_SIZE, height * RECT_SIZE, i * RECT_SIZE);
    }
    p5.pop();

    // Columns
    p5.textSize(TEXT_SIZE);
    p5.push();
    p5.fill(100);
    p5.translate(longestRow * RECT_SIZE, 0);
    nonogram.columns.forEach((col, i) => {
      col.forEach((clues, j) => {
        const colOffset = longestColumn - col.length;
        p5.push();
        p5.translate(i * RECT_SIZE * CAMERA_ZOOM, (j + colOffset) * RECT_SIZE);
        p5.rect(0, 0, RECT_SIZE * CAMERA_ZOOM, RECT_SIZE);
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
    nonogram.rows.forEach((row, i) => {
      row.forEach((clues, j) => {
        const rowOffset = longestRow - row.length;
        p5.push();
        p5.translate((j + rowOffset) * RECT_SIZE, i * RECT_SIZE * CAMERA_ZOOM);
        p5.rect(0, 0, RECT_SIZE, RECT_SIZE * CAMERA_ZOOM);
        p5.fill(0);
        p5.text(clues, TEXT_SIZE / 4, TEXT_SIZE);
        p5.pop();
      });
    });
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

    // TODO: finish pan zoomn feature 
    // if (e.buttons === 4) {
    //   PAN.x += e.movementX;
    //   PAN.y += e.movementY;
    //   return;
    // }

    // Inside Grid
    const mouseX = p5.mouseX - gridOffsetX;
    const mouseY = p5.mouseY - gridOffsetY;
    const i = Math.floor((mouseX - PAN.x) / (RECT_SIZE * CAMERA_ZOOM));
    const j = Math.floor((mouseY - PAN.y) / (RECT_SIZE * CAMERA_ZOOM));

    const mouseButton: MouseButton = e.buttons === 2 ? "right" : "left";
    console.log(e.buttons);

    const grid = _props.nonogram.field;
    if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
      _props.tileInputHandler({ col: i, row: j, mouseButton });
    }
  };

  p5.mouseDragged = mouseHandler;
  p5.mousePressed = mouseHandler;
  p5.mouseWheel = (e: WheelEvent) => {
    // TODO: finish pan zoomn feature 
    // const diff = -Math.sign(e.deltaY) / 10;
    // CAMERA_ZOOM = CAMERA_ZOOM + diff;
    // if (CAMERA_ZOOM < CAMERA_ZOOM_MIN) {
    //   CAMERA_ZOOM = CAMERA_ZOOM_MIN;
    // }
  };
};
