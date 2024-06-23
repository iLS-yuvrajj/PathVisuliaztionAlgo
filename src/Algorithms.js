const { MinHeap } = require('heap');

const rows = 20;
const cols = 40;
const grid = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => ({ weight: 1 })) // All cells have weight of 1
);


function dijkstra(graph, startNode) {
    let distances = {};
    let prev = {};
    let pq = new MinHeap((a, b) => a[1] - b[1]); // Min-Heap based on distances

    distances[startNode] = 0;
    pq.push([startNode, 0]);

    Object.keys(graph).forEach(node => {
        if (node !== startNode) {
            distances[node] = Infinity;
        }
        prev[node] = null;
    });

    while (!pq.empty()) {
        let [currentNode, currentDistance] = pq.pop();

        if (currentDistance > distances[currentNode]) {
            continue; // Skip if this distance is not updated
        }

        for (let neighbor in getNeighbours(grid, row, col) ) {
            let weight = graph[currentNode][neighbor];
            let alt = distances[currentNode] + weight;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = currentNode;
                pq.push([neighbor, alt]);
            }
        }
    }

    return { distances, prev };
}


function astar(grid, sourceRow, sourceCol, targetRow, targetCol) {
    const rows = grid.length;
    const cols = grid[0].length;
    
    // Create priority queue using a min-heap
    const heap = new Heap((a, b) => a.f - b.f);
    
    // Initialize distance and heuristic arrays
    const f = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const g = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    
    g[sourceRow][sourceCol] = 0;
    f[sourceRow][sourceCol] = heuristicDistance(sourceRow, sourceCol, targetRow, targetCol);
    
    heap.push({ f: f[sourceRow][sourceCol], g: 0, row: sourceRow, col: sourceCol });
    
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    visited[sourceRow][sourceCol] = true;
    
    while (!heap.empty()) {
        const { f: curF, g: curG, row, col } = heap.pop();
        
        if (row === targetRow && col === targetCol) {
            console.log(`Reached target: ${row}, ${col}`);
            return true;
        }
        
        const neighbours = getNeighbours(grid, row, col);
        for (const neighbour of neighbours) {
            const newG = curG + 1;
            const { row: nRow, col: nCol } = neighbour;
            
            if (newG < g[nRow][nCol] && !visited[nRow][nCol]) {
                visited[nRow][nCol] = true;
                g[nRow][nCol] = newG;
                f[nRow][nCol] = newG + heuristicDistance(nRow, nCol, targetRow, targetCol);
                heap.push({ f: f[nRow][nCol], g: newG, row: nRow, col: nCol });
            }
        }
    }
    
    return false; // No path found
}

function heuristicDistance(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2); // Manhattan distance
}

function getNeighbours(grid, row, col) {
    const neighbours = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
            neighbours.push({ row: newRow, col: newCol });
        }
    }
    
    return neighbours;
}

// export default { dijkstra , astar }