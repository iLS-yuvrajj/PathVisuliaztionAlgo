import React , {useContext , useRef , useEffect , useState} from 'react';
import './grid.css';
import { Context } from '../../App';
import Heap from 'heap-js';
import goal from "../../images/goal.png"
import start from "../../images/start.svg"
import 'bootstrap/dist/css/bootstrap.min.css';


function GridTable() {

  const [grid,setGrid,startPos,setStartPos,targetPos,setTargetPos] = useContext(Context)
  const gridRef = useRef(grid);
  const animationDuration = '700ms';
  const [isDragging, setIsDragging] = useState(false);
  const [isErasing, setisErasing] = useState(false);
  const [NodeDrag, setNodeDraging] = useState(-1);
  const [isAlgoRunning , setisAlgoRunning] = useState(false);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);


  const getNeighbours = (row, col) => {
    const offsets = [
      [0, 1],[1, 0], 
      [0, -1],[-1, 0],
    ];
    let neighbours = [];
    for (let [dr, dc] of offsets) {
      let newRow = row + dr;
      let newCol = col + dc;
      if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
        neighbours.push([newRow, newCol]);
      }
    }
    return neighbours;
  };

  const clearboard = async () => {
    let newGrid = gridRef.current.map(row => row.slice());
    for (let r = 0 ; r < newGrid.length ; r++){
      for (let c = 0 ; c < newGrid[0].length ; c++){
        if (newGrid[r][c] === 1 || newGrid[r][c] === 5){
          newGrid[r][c] = 0
        }else if (newGrid[r][c].toString()[0] === "2"){
          newGrid[r][c] = 2
        }else if (newGrid[r][c].toString()[0] === "3"){
          newGrid[r][c] = 3
        }
      }
    }
    setGrid(newGrid);
  }

  const eraseboard = async () => {
    let newGrid = gridRef.current.map(row => row.slice());
    for (let r = 0 ; r < newGrid.length ; r++){
      for (let c = 0 ; c < newGrid[0].length ; c++){
        if (newGrid[r][c] === 1 || newGrid[r][c] === 5 || newGrid[r][c] === -1){
          newGrid[r][c] = 0
        }else if (newGrid[r][c].toString()[0] === "2"){
          newGrid[r][c] = 2
        }else if (newGrid[r][c].toString()[0] === "3"){
          newGrid[r][c] = 3
        }
      }
    }
    setGrid(newGrid);
  }

  const bfs = async (startRow, startCol, targetRow, targetCol , wait) => {

    await clearboard()
    setisAlgoRunning(true)

    await updateGridCell(startRow,startCol,2)
    await updateGridCell(targetRow,targetCol,3)

    let queue = [[startRow, startCol]];
    let visited = new Set();
    let parent = new Map();
    visited.add(`${startRow},${startCol}`)
    parent.set(`${startRow},${startCol}`, null);
    while (queue.length) {
      let nodes = [];
      const queueLength = queue.length; 

      for (let i = 0; i < queueLength; i++) {
        let [curRow, curCol] = queue.shift();
        nodes.push([curRow, curCol]);
  
        if (curRow === targetRow && curCol === targetCol) {
          if (wait === false) return true
          const path = reconstructPath(parent, [targetRow, targetCol]);
          await updatePathOnGrid(path);
          setisAlgoRunning(false)
          return path;
        }
  
        let neighbours = getNeighbours(curRow, curCol);
        for (let [nRow, nCol] of neighbours) {
          if (!visited.has(`${nRow},${nCol}`) && gridRef.current[nRow][nCol] !== 1 && gridRef.current[nRow][nCol] !== -1) {
            visited.add(`${nRow},${nCol}`);
            queue.push([nRow, nCol]);
            parent.set(`${nRow},${nCol}`, [curRow, curCol]);
          }
        }
      }

      if(wait) {
        await new Promise(resolve => setTimeout(resolve, 1));
        let newGrid = gridRef.current.map(row => row.slice());
        for (let i = 0; i < nodes.length; i++) {
          const row = nodes[i][0]
          const col = nodes[i][1]
          if (gridRef.current[row][col].toString()[0] === "2"){
            newGrid[row][col] = 21;
          } else if (gridRef.current[row][col].toString()[0] === "3"){
            newGrid[row][col] = 31;
          }else{
            newGrid[row][col] = 1;
          }
        }
      setGrid(newGrid);
      await new Promise(resolve => setTimeout(resolve, 40));
      }
    }
    setisAlgoRunning(false)
    return false
  };
  
  const bidirectional_bfs = async (startRow, startCol, targetRow, targetCol) => {

    await clearboard();
    setisAlgoRunning(true);
  
    await updateGridCell(startRow, startCol, 2);
    await updateGridCell(targetRow, targetCol, 3);
  
    let startQueue = [[startRow, startCol]];
    let endQueue = [[targetRow, targetCol]];
    let startVisited = new Set();
    let endVisited = new Set();
    let startParent = new Map();
    let endParent = new Map();
    startVisited.add(`${startRow},${startCol}`);
    endVisited.add(`${targetRow},${targetCol}`);
    startParent.set(`${startRow},${startCol}`, null);
    endParent.set(`${targetRow},${targetCol}`, null);
  
    let intersection = null;
    let startPath = [];
    let endPath = [];
  
    while (startQueue.length && endQueue.length) {

      let nodes = [];
      const startQueueLength = startQueue.length;
      const endQueueLength = endQueue.length;
  
      for (let i = 0; i < startQueueLength; i++) {
        let [curRow, curCol] = startQueue.shift();
        nodes.push([curRow, curCol]);
  
        if (endVisited.has(`${curRow},${curCol}`)) {
          intersection = [curRow, curCol];
          break;
        }
  
        let neighbours = getNeighbours(curRow, curCol);
        for (let [nRow, nCol] of neighbours) {
          if (
            !startVisited.has(`${nRow},${nCol}`) &&
            gridRef.current[nRow][nCol] !== 1 &&
            gridRef.current[nRow][nCol] !== -1
          ) {
            startVisited.add(`${nRow},${nCol}`);
            startQueue.push([nRow, nCol]);
            startParent.set(`${nRow},${nCol}`, [curRow, curCol]);
          }
        }
      }
  
      for (let i = 0; i < endQueueLength; i++) {
        let [curRow, curCol] = endQueue.shift();
        nodes.push([curRow, curCol]);
  
        if (startVisited.has(`${curRow},${curCol}`)) {
          intersection = [curRow, curCol];
          break;
        }
  
        let neighbours = getNeighbours(curRow, curCol);
        for (let [nRow, nCol] of neighbours) {
          if (
            !endVisited.has(`${nRow},${nCol}`) &&
            gridRef.current[nRow][nCol] !== 1 &&
            gridRef.current[nRow][nCol] !== -1
          ) {
            endVisited.add(`${nRow},${nCol}`);
            endQueue.push([nRow, nCol]);
            endParent.set(`${nRow},${nCol}`, [curRow, curCol]);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1));

      let newGrid = gridRef.current.map((row) => row.slice());
      for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i][0];
        const col = nodes[i][1];
        if (gridRef.current[row][col].toString()[0] === "2") {
          newGrid[row][col] = 21;
        } else if (gridRef.current[row][col].toString()[0] === "3") {
          newGrid[row][col] = 31;
        } else {
          newGrid[row][col] = 1;
        }
      }
      setGrid(newGrid);
      await new Promise((resolve) => setTimeout(resolve, 50));
  
      if (intersection) {
        startPath = reconstructPath(startParent, intersection);
        endPath = reconstructPath(endParent, intersection);
        const path = [...startPath.slice(0, -1), ...endPath.reverse()];
        await updatePathOnGrid(path);
        setisAlgoRunning(false);
        return path;
      }
  
    }
  
    setisAlgoRunning(false);
  };

  const aStar = async (startRow, startCol, targetRow, targetCol) => {
    await clearboard();
    setisAlgoRunning(true);

    await updateGridCell(startRow, startCol, 2); // Start cell
    await updateGridCell(targetRow, targetCol, 3); // Target cell

    const openList = [];
    const closedSet = new Set();
    const parent = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const startNode = `${startRow},${startCol}`;

    openList.push({ node: startNode, f: 0 });
    gScore.set(startNode, 0);
    fScore.set(startNode, heuristic_astar(startRow, startCol, targetRow, targetCol));
    parent.set(startNode, null);

    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();
        const [curRow, curCol] = current.node.split(',').map(Number);

        // await new Promise(resolve => setTimeout(resolve, 1));

        let newGrid = gridRef.current.map(row => row.slice());
        if (gridRef.current[curRow][curCol].toString()[0] === "2"){
          newGrid[curRow][curCol] = 21;
        }else if (gridRef.current[curRow][curCol].toString()[0] === "3"){
          newGrid[curRow][curCol] = 31;
        }else{
          newGrid[curRow][curCol] = 1;
        }
        setGrid(newGrid);

        await new Promise(resolve => setTimeout(resolve, 2));

        if (curRow === targetRow && curCol === targetCol) {
            const path = reconstructPath(parent, [targetRow,targetCol]);
            await updatePathOnGrid(path);
            setisAlgoRunning(false);
            return path;
        }

        closedSet.add(current.node);

        const neighbours = getNeighbours(curRow, curCol);
        for (let [nRow, nCol] of neighbours) {
            const neighbourNode = `${nRow},${nCol}`;
            if (closedSet.has(neighbourNode) || gridRef.current[nRow][nCol] === 1 || gridRef.current[nRow][nCol] === -1) {
                continue;
            }

            const tentativeGScore = gScore.get(current.node) + 1;

            if (!gScore.has(neighbourNode) || tentativeGScore < gScore.get(neighbourNode)) {
                parent.set(neighbourNode, [curRow,curCol]);
                gScore.set(neighbourNode, tentativeGScore);
                fScore.set(neighbourNode, tentativeGScore + heuristic_astar(nRow, nCol, targetRow, targetCol));
                if (!openList.some(node => node.node === neighbourNode)) {
                    openList.push({ node: neighbourNode, f: fScore.get(neighbourNode) });
                }
            }
        }
    }

    setisAlgoRunning(false);
  };


  const dfs = async (startRow, startCol, targetRow, targetCol, visited = new Set()) => {

    if (gridRef.current[startRow][startCol] === -1) return false
    if (visited.has(`${startRow},${startCol}`)) return false;
    

    // await new Promise(resolve => setTimeout(resolve, 1));

    let newGrid = gridRef.current.map(row => row.slice());
    if (gridRef.current[startRow][startCol].toString()[0] === "2"){
      newGrid[startRow][startCol] = 21;
    }else if (gridRef.current[startRow][startCol].toString()[0] === "3"){
      newGrid[startRow][startCol] = 31;
    }else{
      newGrid[startRow][startCol] = 1;
    }

    setGrid(newGrid);

    await new Promise(resolve => setTimeout(resolve, 2));

    if (startRow === targetRow && startCol === targetCol) {
      // const path = reconstructPath(parent, [targetRow, targetCol]);
      // updatePathOnGrid(path);
      return true;
    }

    visited.add(`${startRow},${startCol}`);

    let neighbours = getNeighbours(startRow, startCol);
    for (let [nRow, nCol] of neighbours) {
        if (await dfs(nRow, nCol, targetRow, targetCol, visited)) {
            return true;
        }
    }
    return false;
  }

  const dfsCall = async (startRow, startCol, targetRow, targetCol) =>{
    setisAlgoRunning(true)
    await clearboard()

    await updateGridCell(startRow,startCol,2)
    await updateGridCell(targetRow,targetCol,3)

    await dfs(startRow, startCol, targetRow, targetCol)
    setisAlgoRunning(false)
  }

  const gridKey = (row, col) => `${row},${col}`;


  const Swarn = async (startRow, startCol, targetRow, targetCol) => {

  await clearboard()
  setisAlgoRunning(true)

  await updateGridCell(startRow,startCol,2)
  await updateGridCell(targetRow,targetCol,3)

  const openSet = new Heap((a, b) => a[0] - b[0]); // Min-heap based on fScore
  const openSetMembers = new Set(); // Set to track nodes in the open set

  const startKey = gridKey(startRow, startCol);
  const targetKey = gridKey(targetRow, targetCol);

  openSet.push([0, [startRow, startCol]]);
  openSetMembers.add(startKey);

  const cameFrom = new Map(); // To store the path
  const gScore = {};
  const fScore = {};

  cameFrom.set(`${startRow},${startCol}`, null);

  // Initialize gScore and fScore
  gScore[startKey] = 0;
  fScore[startKey] = heuristic_swarn(startRow, startCol, targetRow, targetCol);

  while (!openSet.isEmpty()) {
    const [currentF, current] = openSet.pop();

    let row = current[0]
    let col = current[1]
    let newGrid = gridRef.current.map(row => row.slice());

    // await new Promise(resolve => setTimeout(resolve, 1));

    if (gridRef.current[row][col].toString()[0] === "2"){
      newGrid[row][col] = 21;
    }else if (gridRef.current[row][col].toString()[0] === "3"){
      newGrid[row][col] = 31;
    }else{
      newGrid[row][col] = 1;
    }
    setGrid(newGrid);

    await new Promise(resolve => setTimeout(resolve, 10)); 

    const [currentRow, currentCol] = current;
    const currentKey = gridKey(currentRow, currentCol);

    // Remove the current node from the open set members set
    openSetMembers.delete(currentKey);

    if (currentRow === targetRow && currentCol === targetCol) {
        let path = reconstructPath(cameFrom,[targetRow, targetCol])
        await updatePathOnGrid(path);
        setisAlgoRunning(false)
        return 
    }

    for (let [neighborRow, neighborCol] of getNeighbours(currentRow, currentCol)) {
      if (gridRef.current[neighborRow][neighborCol] != -1){
        const neighborKey = gridKey(neighborRow, neighborCol);
        const tentativeGScore = gScore[currentKey] + 1;

        if (tentativeGScore < (gScore[neighborKey] || Infinity)) {
          // Found a better path to the neighbor
          cameFrom.set(neighborKey, [currentRow, currentCol]);
          gScore[neighborKey] = tentativeGScore;
          fScore[neighborKey] = gScore[neighborKey] + heuristic_swarn(neighborRow, neighborCol, targetRow, targetCol);

          if (!openSetMembers.has(neighborKey)) {
            openSet.push([fScore[neighborKey], [neighborRow, neighborCol]]);
            openSetMembers.add(neighborKey);
          }
        }
      }
    }
  }
  setisAlgoRunning(false)
};

  const heuristic_astar = (startRow, startCol, targetRow, targetCol) => {
    return (Math.abs(targetRow - startRow) + Math.abs(targetCol - startCol));
  };

  const heuristic_swarn = (startRow, startCol, targetRow, targetCol) => {
    return (Math.abs(targetRow - startRow)**2 + Math.abs(targetCol - startCol)**2);
  };


  const reconstructPath = (parent, target) => {
    const path = [];
    let current = target;
    let visited = new Set();
    while (current !== null && current && !visited.has(`${current[0]},${current[1]}`)) {
        path.unshift(current);
        visited.add(`${current[0]},${current[1]}`); 
        current = parent.get(`${current[0]},${current[1]}`); 
    }
    console.log(path)
    return path;
  };

  const updatePathOnGrid = async (path) => {
    for (let i = 0; i < path.length; i++) {
      const newGrid = gridRef.current.map(row => row.slice());
      const [row, col] = path[i];
      if (gridRef.current[row][col].toString()[0] === "2"){
        newGrid[row][col] = 25; 
      }else if (gridRef.current[row][col].toString()[0] === "3"){
        newGrid[row][col] = 35; 
      }else{
        newGrid[row][col] = 5; 
      }
      setGrid(newGrid);
      await new Promise(resolve => setTimeout(resolve, 28)); 
    }
  };

  const getBackgroundColor = (value) => {
    if (value === 0) {
      return '#ffffff';
    } else if (value === 1 || value === 21 || value === 31) {
      return "#8DC8FC";
    }  else if (value == 5 || value === 25 || value === 35){
      return "#FFFF8F";
    } else if (value === -1){
      return 'black';
    }
  };

  const getBackgroundImage = (value) => {
    if (value.toString()[0] === "2") {
      return `url(${start})`;
    } else if (value.toString()[0] === "3") {
      return `url(${goal})`;
    }
    return "none";
  };

  const getAnimattion = (value) => {
    if (value === 1){
      return `visitedAnimation ${animationDuration} ease-in-out`
    }
    else if (value === 5){
      return `pathFill ${animationDuration} ease-in-out`
    }
    else if (value === -1){
      return `blockFill 500ms ease-in-out`
    }
    else{
      return `none`
    }
  }

  const generateRandomBlocks = async (blocks , direction) => {
    await eraseboard();
    setisAlgoRunning(true)

    let newGrid = gridRef.current.map(row => row.slice());
    
    if (direction === 0){
      for (let r = 0; r < newGrid.length; r++) {
        let set = 0;
        while (set < blocks) {
          const num = getRandomNumber(0, newGrid[0].length - 1);
          if (newGrid[r][num] === 0) {
            newGrid[r][num] = -1;
            set += 1;
          }
        }
        const updatedGrid = newGrid.map(row => [...row]);
        setGrid(updatedGrid);
        await new Promise(resolve => setTimeout(resolve, 40));
      }
    }else if(direction === 1){
      for (let c = 0; c < newGrid[0].length; c++) {
        let set = 0;
        while (set < blocks) {
          const num = getRandomNumber(0, newGrid.length - 1);
          if (newGrid[num][c] === 0) {
            newGrid[num][c] = -1;
            set += 1;
          }
        }
        const updatedGrid = newGrid.map(row => [...row]);
        setGrid(updatedGrid);
        await new Promise(resolve => setTimeout(resolve, 40));
      }
    }

    setisAlgoRunning(false)
  };


  async function generateMaze() {
    await eraseboard()
    setisAlgoRunning(true)
    let maze = gridRef.current.map(row => row.slice());

    for(let i = 0; i < maze.length; i++) {
        for(let j = 0; j < maze[0].length; j++) {
            if(maze[i][j] === 0) {
                maze[i][j] = -1;
            }
        }
    }
    
    maze[0][0] = -1;
    await carve(startPos.row, startPos.col);


    for (let j = 0; j < maze[0].length; j++) {
      let columnUpdate = maze.map(row => row[j]);
      setGrid(prevGrid => {
          let newGrid = prevGrid.map(row => [...row]);
          for (let i = 0; i < maze.length; i++) {
              newGrid[i][j] = maze[i][j];
          }
          return newGrid;
      });
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    setisAlgoRunning(false)
    return maze;

    async function carve(x, y) {
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      directions.sort(() => Math.random() - 0.5);
      
      for (let [dx, dy] of directions) {
          let nx = x + dx * 2;
          let ny = y + dy * 2;
          
          if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length && maze[ny][nx] === -1) {
              if (maze[y+dy][x+dx].toString()[0] !== "3" && maze[y+dy][x+dx].toString()[0] !== "2") {
                maze[ny][nx] = 0;  
                maze[y + dy][x + dx] = 0;
              }
              await carve(nx, ny);
          }
      }
  }
}


  const getRandomNumber = (min,max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  // Function to handle drag start
  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    if (gridRef.current[row][col] === -1 && isErasing === true){
      updateGridCell(row,col,0)
    }else if (gridRef.current[row][col] === 0 && isErasing === false){
      updateGridCell(row,col,-1)
    }else if (gridRef.current[row][col].toString()[0] === "2"){
      updateGridCell(row, col, 0);
      setNodeDraging(2)
    }else if (gridRef.current[row][col].toString()[0] === "3"){
      updateGridCell(row, col, 0);
      setNodeDraging(3)
    }
  };

  // Function to handle drag end
  const handleMouseUp = (row , col) => {
    setIsDragging(false);
    if (NodeDrag === 2){
      setStartPos({ row: row, col: col })
      updateGridCell(row, col, 2);
    }else if (NodeDrag === 3){
      setTargetPos({ row: row, col: col })
      updateGridCell(row, col, 3);
    }
    setNodeDraging(-1);
  };

  // Function to update the grid cell value
  const updateGridCell = (row, col, value) => {
    const newGrid = gridRef.current.map(row => row.slice());
    newGrid[row][col] = value;
    setGrid(newGrid);
  };

  // Function to handle cell modification during dragging
  const handleMouseEnter = (row, col) => {
    if (NodeDrag === -1){
      if (isDragging) {
        if(isErasing === false){
          updateGridCell(row, col, -1);
        }else{
          updateGridCell(row, col, 0);
        }
      }
    }
  };

  const handleNavClick = (e) => {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => link.classList.remove('fw-bold'));
    e.currentTarget.classList.add('fw-bold');
    return true
  };

  return (
    <div className='bg-light'>      
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand pl" href="#">PathFinder</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && bfs(startPos.row, startPos.col, targetPos.row , targetPos.col, true)} href="#">BFS</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && dfsCall(startPos.row, startPos.col, targetPos.row , targetPos.col)} href="#">DFS</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && aStar(startPos.row, startPos.col, targetPos.row , targetPos.col)} href="#">Astar</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && Swarn(startPos.row, startPos.col, targetPos.row , targetPos.col)} href="#">Swarm</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && bidirectional_bfs(startPos.row, startPos.col, targetPos.row , targetPos.col)} href="#">Bidirectional-BFS</a>
            <a class={`nav-item nav-link mr ${isErasing ? "erasing" : ""}`}  onClick={() => setisErasing(!isErasing)} href="#">Erase</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && generateRandomBlocks(10,1)} href="#">Generate wall</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && generateMaze()} href="#">Generate Maze</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && clearboard()} href="#">Clear Algo</a>
            <a class="nav-item nav-link mr" onClick={(e) => handleNavClick(e) && !isAlgoRunning && eraseboard()} href="#">Clear Board</a>
          </div>
        </div>
      </nav>

    <table className="grid-table shadow" style={{border : "1px solid black"}}>
      <tbody>
        {Array.from({ length: grid.length }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: grid[0].length }).map((_, colIndex) => (
              <td
              key={colIndex}
              className="grid-cell"
              style={{ 
                background: getBackgroundColor(grid[rowIndex][colIndex]),
                animation: getAnimattion(grid[rowIndex][colIndex]),
                position: 'relative',
              }}
              onMouseDown={() => !isAlgoRunning && handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => !isAlgoRunning && handleMouseEnter(rowIndex, colIndex)}
              onMouseUp={() =>  !isAlgoRunning &&  handleMouseUp(rowIndex, colIndex)}
              >
                <div style={{
                    height:"100%",
                    width:"100%",
                    backgroundImage: getBackgroundImage(grid[rowIndex][colIndex]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'absolute', 
                    top: 0, 
                    left: 0,
                }}></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
}

export default GridTable;
