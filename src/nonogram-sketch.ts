import type { Sketch, SketchProps } from "@p5-wrapper/react";
import { type Nonogram } from "./nonogram";
import { NonogramTile } from "./nonogram-tile";
import { AppMode } from "./app-mode";

const RECT_SIZE = 40;
const TEXT_SIZE = 30;
const THICK_LINES_STROKE_WEIGHT = 3;

export type MouseButton = "left" | "right";

export interface TileInputEvent {
  col: number;
  row: number;
  mouseButton: MouseButton; 
}

type MySketchProps = SketchProps & {
  nonogram: Nonogram;
  tileInputHandler: (e: TileInputEvent) => void;
  mode: AppMode;
  keyInputHandler: (e: KeyboardEvent) => void;
};


export const NonogramSketch: Sketch<MySketchProps> = (p5) => {
  let _props: MySketchProps;

  let ENABLE_ZOOM = false;
  let CAMERA_ZOOM = 1;
  let CAMERA_ZOOM_MIN = 0.1;
  let PAN = { x: 0, y: 0 };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);
    const { w, h } = getCanvasSize();

    if (ENABLE_ZOOM) {
      PAN.x = p5.width / 2 - w / 2;
      PAN.y = p5.height / 2 - h / 2;
    }
  };

  const getGridOffset = () => {
    if (_props.mode === AppMode.Draw) {
      return { x: 0, y: 0 };
    }
    const { longestColumn, longestRow } = _props.nonogram.getCluesData();
    return {
      x: longestRow * RECT_SIZE,
      y: longestColumn * RECT_SIZE,
    };
  };

  const getCanvasSize = () => {
    const nonogram: Nonogram = _props.nonogram;
    const { longestColumn, longestRow } = nonogram.getCluesData();
    if (_props.mode === AppMode.Draw) {
      return {
        w: nonogram.width * RECT_SIZE,
        h: nonogram.height * RECT_SIZE,
      };
    }
    const w = (nonogram.width + longestRow || 10) * RECT_SIZE;
    const h = (nonogram.height + longestColumn || 10) * RECT_SIZE;
    return { w, h };
  };

  p5.updateWithProps = (props) => {
    _props = props;
    if (_props.nonogram) {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    }
  };

  const drawGameField = () => {
    const nonogram = _props.nonogram;
    const { longestColumn, longestRow } = nonogram.getCluesData();

    // Grid
    const { x: gridOffsetX, y: gridOffsetY } = getGridOffset();
    p5.push();
    p5.translate(PAN.x, PAN.y);
    p5.scale(CAMERA_ZOOM);
    p5.push();
    p5.translate(gridOffsetX, gridOffsetY);
    const grid = nonogram.field;
    for (let rowIdx = 0; rowIdx < nonogram.field.length; rowIdx++) {
      for (let colIdx = 0; colIdx < nonogram.field[0].length; colIdx++) {
        p5.push();
        if (grid[rowIdx][colIdx] === NonogramTile.Crossed) {
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
        if (grid[rowIdx][colIdx] === NonogramTile.Filled) {
          p5.fill(50);
        } else {
          p5.fill(255);
        }
        p5.rect(colIdx * RECT_SIZE, rowIdx * RECT_SIZE, RECT_SIZE, RECT_SIZE);
        p5.pop();
      }
    }

    // Grid 5x Lines
    p5.strokeWeight(THICK_LINES_STROKE_WEIGHT);
    const width = _props.nonogram.width;
    const height = _props.nonogram.height;
    for (let i = 5; i < width; i += 5) {
      p5.line(i * RECT_SIZE, 0, i * RECT_SIZE, height * RECT_SIZE);
    }
    for (let i = 5; i < height; i += 5) {
      p5.line(0, i * RECT_SIZE, width * RECT_SIZE, i * RECT_SIZE);
    }
    p5.pop();

    if (_props.mode === AppMode.Solve) {
      // Columns
      p5.textSize(TEXT_SIZE);
      p5.push();
      p5.fill(100);
      p5.translate(longestRow * RECT_SIZE, 0);
      nonogram.clueColumns.forEach((col, i) => {
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
      nonogram.clueRows.forEach((row, i) => {
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

    // TODO: finish pan zoomn feature
    if (ENABLE_ZOOM && e.buttons === 4) {
      PAN.x += e.movementX;
      PAN.y += e.movementY;
      return;
    }

    // Inside Grid
    const mouseX = p5.mouseX - gridOffsetX;
    const mouseY = p5.mouseY - gridOffsetY;
    // TODO: broken click on tile when zoomed + panned
    const colIdx = Math.floor((mouseX - PAN.x) / (RECT_SIZE * CAMERA_ZOOM));
    const rowIdx = Math.floor((mouseY - PAN.y) / (RECT_SIZE * CAMERA_ZOOM));

    const mouseButton: MouseButton = e.buttons === 2 ? "right" : "left";
    console.log(e.buttons);

    const grid = _props.nonogram.field;
    if (
      rowIdx >= 0 &&
      rowIdx < grid.length &&
      colIdx >= 0 &&
      colIdx < grid[rowIdx].length
    ) {
      _props.tileInputHandler({ col: colIdx, row: rowIdx, mouseButton });
    }
  };

  p5.mouseDragged = mouseHandler;
  p5.mousePressed = mouseHandler;
  p5.mouseWheel = (e: WheelEvent) => {
    if (!ENABLE_ZOOM) {
      return;
    }
    // TODO: finish pan zoomn feature
    const diff = 1 - e.deltaY / 1000;

    CAMERA_ZOOM = CAMERA_ZOOM * diff;
    CAMERA_ZOOM = p5.constrain(CAMERA_ZOOM, CAMERA_ZOOM_MIN, 5);

    PAN.x -= (p5.mouseX - PAN.x) * (diff - 1);
    PAN.y -= (p5.mouseY - PAN.y) * (diff - 1);

    return false;
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.keyPressed = (e: KeyboardEvent) => {
    _props.keyInputHandler(e);
  };
};
