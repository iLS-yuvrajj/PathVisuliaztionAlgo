import './App.css';
import GridTable from './components/grid/grid';
import { useState, createContext, useContext } from "react";


export const Context = createContext();

function App() {
  // 0 means unvisited , 1 means visited , 2 means start , 3 means target , -1 means wall

  const [startPos , setStartPos] = useState({ row: 12, col: 5 })
  const [targetPos , setTargetPos] = useState({ row: 12, col: 50 })
  const initialGrid = Array.from({ length: 28 }, () => Array(60).fill(0));
  initialGrid[startPos.row][startPos.col] = 2
  initialGrid[targetPos.row][targetPos.col] = 3

  const [grid, setGrid] = useState(initialGrid);
  const [isStart , setIsStart] = useState(false);

  return (
    <Context.Provider className="App" value={[grid,setGrid,startPos,setStartPos,targetPos,setTargetPos]}>
      <GridTable/>
    </Context.Provider>
  );
}

export default App;
