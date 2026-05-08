import { P5Canvas } from "@p5-wrapper/react";
import "./App.css";
import { useEffect, useState } from "react";
import { Nonogram, type Grid } from "./nonogram";
import { createGrid } from "./nonogram-utils";
import { NonogramSketch } from "./nonogram-sketch";
import { N1Example } from "./nonogram-examples";
import { solveNonogram } from "./nonogram-solver";

// export function Animation() {
//   const [frame, setFrame] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);

//   const requestRef = useRef();
//   const pausedRef = useRef(isPaused);

//   // Keep the ref in sync with state for the loop to read
//   useEffect(() => {
//     pausedRef.current = isPaused;
//   }, [isPaused]);

//   const animate = (time) => {
//     if (!pausedRef.current) {
//       setFrame((prev) => (prev + 1) % 100);
//     }
//     requestRef.current = requestAnimationFrame(animate);
//   };

//   useEffect(() => {
//     requestRef.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(requestRef.current);
//   }, []); // Run once

//   return <>TODO: add animation of nonogram solver here</>;
// }

export function App() {
  const FPS_ = 60;

  const init: Nonogram = new Nonogram(N1Example);
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
  }, []);z

  return (
    <>
      {/* <Animatiozn></Animation> */}
      <div className="container">
        <div className="canvas-container">
          <div className="controls"></div>
          {frameCount}
          <P5Canvas
            sketch={NonogramSketch}
            nonogram={nonogramData}
            grid={result.animation[frameCount]}
            setGrid={setGrid}
          />
        </div>
      </div>
    </>
  );
}

export default App;
