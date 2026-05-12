import { P5Canvas } from "@p5-wrapper/react";
import { useState, useEffect } from "react";
import { AppMode } from "./app-mode";
import { Nonogram } from "./nonogram";
import { W_nonotram } from "./nonogram-examples";
import { type TileInputEvent, NonogramSketch } from "./nonogram-sketch";
import { solveNonogram } from "./nonogram-solver";
import { NonogramTile } from "./nonogram-tile";

export function NonogramAppV1() {
  const [nonogram, setNonogram] = useState<Nonogram>(new Nonogram());
  const [mode, setMode] = useState<AppMode>(AppMode.Solve);
  const [brush, setBrush] = useState(NonogramTile.Filled);

  useEffect(() => {
    // const n: Nonogram = new Nonogram();
    // n.initGrid(15, 15);
    // setNonogram(n);
    // setMode(AppMode.Draw);

    const n: Nonogram = new Nonogram(W_nonotram);
    // n.field = solveNonogram(n).solution;
    setNonogram(n);
    setMode(AppMode.Solve);
  }, []);

  const tileInputHandler = (e: TileInputEvent) => {
    const currentTileBrush = brush;
    nonogram.field[e.row][e.col] =
      e.mouseButton === "left" ? currentTileBrush : NonogramTile.Empty;

    // TODO: here goes additional logic after user input like filling the crossed tiles and validity check

    setNonogram(nonogram);
  };

  const keyInputHandler = (e: KeyboardEvent) => {
    if (e.key === "1") {
      setBrush(NonogramTile.Filled);
      console.log("Empty");
    } else if (e.key === "2") {
      setBrush(NonogramTile.Crossed);
      console.log("Filled");
    }
  };

  const changeMode = () => {
    if (mode === AppMode.Draw) {
      nonogram.computeClues();
      if (solveNonogram(nonogram).isSolved) {
        nonogram.initGrid(nonogram.width, nonogram.height);
        console.log(nonogram);
        setNonogram(nonogram);
        setMode(AppMode.Solve);
      }
    } else if (mode === AppMode.Solve) {
      nonogram.field = solveNonogram(nonogram).solution;
      nonogram.clearOutByTile(NonogramTile.Crossed);

      console.log(nonogram);
      setNonogram(nonogram);
      setMode(AppMode.Draw);
    }
  };

  const verify = () => {
    nonogram.computeClues();
    const solved = solveNonogram(nonogram).isSolved;
    if (solved) {
      alert(`NONOGRAM CAN BE SOLVED`);
    } else {
      alert(`NONOGRAM CANNOT BE SOLVED`);
    }
  };

  const clear = () => {
    nonogram.initGrid(nonogram.width, nonogram.height);
    setNonogram(nonogram);
  };

  return (
    <>
      <div className="container">
        <div className="canvas-container">
          <div className="controls"></div>
          <button onClick={changeMode}> change mode : {mode} </button>
          <button onClick={verify}> verify </button>
          <button onClick={clear}> clear </button>

          <P5Canvas
            sketch={NonogramSketch}
            mode={mode}
            nonogram={nonogram}
            keyInputHandler={keyInputHandler}
            tileInputHandler={tileInputHandler}
          />

          <pre>
            <div>
              current brush tile = <b>{brush}</b>{" "}
            </div>
            <div>1 = fill</div>
            <div>2 = cross</div>
          </pre>
        </div>
      </div>
    </>
  );
}
