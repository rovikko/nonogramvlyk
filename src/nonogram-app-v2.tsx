import { useState } from "react";
import { P5Canvas, type Sketch, type SketchProps } from "@p5-wrapper/react";
import { Nonogram } from "./nonogram";
import { NonogramTile } from "./nonogram-tile";
import { W_nonotram } from "./nonogram-examples";

type MySketchProps = SketchProps & {
  nonogram: Nonogram;
  update: number;

  setNonogram: (n: Nonogram) => void;
};

const NonogramSketchV2: Sketch<MySketchProps> = (p5) => {
  let _props: MySketchProps;

  const gridBuffer = p5.createGraphics(0, 0);
  const drawingBuffer = p5.createGraphics(0, 0);

  const CANVAS_SIZE = { w: 5000, h: 5000 };

  const ENABLE_ZOOM = true;
  let CAMERA_ZOOM = 1;
  const CAMERA_ZOOM_MIN = 0.1;
  const PAN = { x: 0, y: 0 };

  const TILE_SIZE = 20;
  const THICK_STROKE = 3;

  const setupGridBuffer = () => {
    gridBuffer.resizeCanvas(CANVAS_SIZE.w, CANVAS_SIZE.h);
    // gridBuffer.translate(10, 10); // TODO: resolve (0, 0) of drawing

    gridBuffer.stroke(30);
    gridBuffer.strokeWeight(1);

    const w = _props.nonogram.width;
    const h = _props.nonogram.height;

    for (let x = 0; x <= w; x++) {
      gridBuffer.push();
      if (x % 5 === 0) {
        gridBuffer.strokeWeight(THICK_STROKE);
      }
      gridBuffer.line(x * TILE_SIZE, 0, x * TILE_SIZE, h * TILE_SIZE);
      gridBuffer.pop();
    }
    for (let y = 0; y <= h; y++) {
      gridBuffer.push();
      if (y % 5 === 0) {
        gridBuffer.strokeWeight(THICK_STROKE);
      }
      gridBuffer.line(0, y * TILE_SIZE, w * TILE_SIZE, y * TILE_SIZE);
      gridBuffer.pop();
    }
  };

  const drawTile = (rowIdx: number, colIdx: number, tileType: NonogramTile) => {
    drawingBuffer.push();
    if (tileType === NonogramTile.Empty) {
      drawingBuffer.fill(255);
    } else if (tileType === NonogramTile.Crossed) {
      drawingBuffer.fill(255, 0, 0, 0.5);
    } else if (tileType === NonogramTile.Filled) {
      drawingBuffer.fill(0);
    }

    const y = rowIdx * TILE_SIZE;
    const x = colIdx * TILE_SIZE;
    drawingBuffer.rect(x, y, TILE_SIZE);
    drawingBuffer.pop();
  };

  const drawDrawing = () => {
    const grid = _props.nonogram.field;
    for (let rowIdx = 0; rowIdx < grid.length; rowIdx++) {
      const row = grid[rowIdx];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const tileType = row[colIdx];
        drawTile(rowIdx, colIdx, tileType);
      }
    }
  };

  const setupDrawingBuffer = () => {
    drawingBuffer.background(255);
    drawingBuffer.fill(0);
    drawingBuffer.resizeCanvas(CANVAS_SIZE.w, CANVAS_SIZE.h);

    drawDrawing();
  };

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.P2D);
    p5.frameRate(144);
  };

  p5.updateWithProps = (props: MySketchProps) => {
    _props = props;
    setupGridBuffer();
    setupDrawingBuffer();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    p5.background(255);
    // global offset
    p5.translate(PAN.x, PAN.y);
    p5.scale(CAMERA_ZOOM);

    // static grid overlay
    p5.image(drawingBuffer, 0, 0);
    p5.image(gridBuffer, 0, 0);
  };

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

  const mouseHandler = (e: MouseEvent) => {
    if (ENABLE_ZOOM && e.buttons === 4) {
      PAN.x += e.movementX;
      PAN.y += e.movementY;
      return;
    }
    const mouseX = (p5.mouseX - PAN.x) / CAMERA_ZOOM;
    const mouseY = (p5.mouseY - PAN.y) / CAMERA_ZOOM;

    const colIdx = Math.floor(mouseX / TILE_SIZE);
    const rowIdx = Math.floor(mouseY / TILE_SIZE);
    const grid = _props.nonogram.field;

    if (
      !(
        rowIdx >= 0 &&
        rowIdx < grid.length &&
        colIdx >= 0 &&
        colIdx < grid[rowIdx].length
      )
    ) {
      return;
    }

    const tile = e.buttons === 1 ? NonogramTile.Filled : NonogramTile.Empty;

    _props.nonogram.field[rowIdx][colIdx] = tile;
    _props.setNonogram(_props.nonogram);

    drawTile(rowIdx, colIdx, tile);

    p5.ellipse(mouseX, mouseY, TILE_SIZE);
  };

  p5.mouseDragged = mouseHandler;
  p5.mousePressed = mouseHandler;
};

export function NonogramAppV2() {
  const n: Nonogram = new Nonogram(W_nonotram);
  n.initGrid(90, 90);
  //   n.field = solveNonogram(n).solution;
  const [nonogram, setNonogram] = useState(n);

  const [update, setUpdate] = useState(0);
  const triggerUpdate = () => setUpdate((v) => v + 1);

  return (
    <>
      <div>
        <button
          onClick={() => {
            const w = nonogram.width + 1;
            nonogram.initGrid(w, w);
            setNonogram(nonogram);
            triggerUpdate();
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            const w = nonogram.width - 1;
            nonogram.initGrid(w, w);
            setNonogram(nonogram);
            triggerUpdate();
          }}
        >
          --
        </button>
        <P5Canvas
          sketch={NonogramSketchV2}
          nonogram={nonogram}
          setNonogram={setNonogram}
          update={update}
        />
      </div>
    </>
  );
}
