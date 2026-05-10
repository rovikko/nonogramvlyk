import { P5Canvas } from "@p5-wrapper/react";
import "./App.css";
import { useState } from "react";
import { Nonogram, NonogramTile } from "./nonogram";
import { NonogramSketch, type TileInputEvent } from "./nonogram-sketch";
import { N1Example } from "./nonogram-examples";

export function App() {
  const init: Nonogram = new Nonogram(N1Example);
  const [nonogram, setNonogram] = useState<Nonogram>(init);

  const tileInputHandler = (e: TileInputEvent) => {
    const currentTileBrush = NonogramTile.Filled; // TODO: udpate to tile-picker
    nonogram.field[e.col][e.row] =
      e.mouseButton === "left" ? currentTileBrush : NonogramTile.Empty;
    setNonogram(nonogram);
  };

  return (
    <>
      <div className="container">
        <div className="canvas-container">
          <div className="controls"></div>
          <P5Canvas
            sketch={NonogramSketch}
            nonogram={nonogram}
            tileInputHandler={tileInputHandler}
          />
        </div>
      </div>
    </>
  );
}

export default App;
