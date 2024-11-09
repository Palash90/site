const WINNING_CELLS = 4;

// Function to check if 4 blocks of the same color are in a row, column, or diagonal
export function updateGridState(grid, existingWinners) {
    const size = grid.length; // Assuming square grid

    const winners = [...existingWinners]

    const checkAndSetWinningLine = (line) => {
        if (checkLine(line, winners)) {
            line.map((i) => i["winningCell"] = true);
            winners.push(line[0].color)
            return;
        }
    }

    // Check rows for four consecutive elements
    for (let i = 0; i < size; i++) {
        for (let j = 0; j <= size - WINNING_CELLS; j++) {
            const rowSegment = grid[i].slice(j, j + WINNING_CELLS); // Get a segment of 4
            checkAndSetWinningLine(rowSegment);
        }
    }

    // Check columns for WINNING_CELLS consecutive elements
    for (let j = 0; j < size; j++) {
        for (let i = 0; i <= size - WINNING_CELLS; i++) {
            const columnSegment = [];

            // Collect WINNING_CELLS elements from the current column
            for (let k = 0; k < WINNING_CELLS; k++) {
                columnSegment.push(grid[i + k][j]);
            }

            checkAndSetWinningLine(columnSegment); // Check the current column segment
        }
    }

    // Check diagonals
    // Top-left to bottom-right diagonals
    for (let i = 0; i <= size - WINNING_CELLS; i++) {
        for (let j = 0; j <= size - WINNING_CELLS; j++) {
            const diagonal1 = [];

            // Collect WINNING_CELLS elements from the diagonal (top-left to bottom-right)
            for (let k = 0; k < WINNING_CELLS; k++) {
                diagonal1.push(grid[i + k][j + k]);
            }

            checkAndSetWinningLine(diagonal1); // Check the current diagonal segment
        }
    }

    // Top-right to bottom-left diagonals
    for (let i = 0; i <= size - WINNING_CELLS; i++) {
        for (let j = WINNING_CELLS - 1; j < size; j++) {
            const diagonal2 = [];

            // Collect WINNING_CELLS elements from the diagonal (top-right to bottom-left)
            for (let k = 0; k < WINNING_CELLS; k++) {
                diagonal2.push(grid[i + k][j - k]);
            }

            checkAndSetWinningLine(diagonal2); // Check the current diagonal segment
        }
    }

    return winners;
};

export function checkGameOver(winners, colors, grid) {
    const onlyPlayerLeft = colors.filter(c => !winners.includes(c.val)).length === 1;
    const allCellsOccupied = grid.every(row => row.every(cell => cell.color))
    return onlyPlayerLeft || allCellsOccupied;
}

// Helper function to check if all blocks in a line (row/column/diagonal) have the same color
const checkLine = (line, winners) => {
    for (let i = 0; i <= line.length - WINNING_CELLS; i++) {
        const color = line[i].color;
        // Check if the current color is defined
        if (color) {
            let hasWinningStreak = true;

            // Loop through the next WINNING_CELLS - 1 elements and check if they match the current color
            for (let j = 1; j < WINNING_CELLS; j++) {
                if (line[i + j].color !== color) {
                    hasWinningStreak = false;
                    break;
                }
            }

            // If we found WINNING_CELLS consecutive elements with the same color, return true
            if (hasWinningStreak && !winners.includes(color)) {
                return true;
            }
        }
    }
    return false; // No consecutive elements found with the same color
};

export function handleColumnShift(colIndex, direction, grid, setGrid, winners) {
    const newGrid = grid.map(row => row.map(cell => { return { ...cell, winningCell: false } }));
    const column = newGrid.map(row => row[colIndex]);
    if (direction === 'up') {
        column.push(column.shift()); // Shift up
    } else {
        column.unshift(column.pop()); // Shift down
    }
    newGrid.forEach((row, i) => (row[colIndex] = column[i]));
    setGrid(newGrid);
    return updateGridState(newGrid, winners); // Check for a winner after shifting
};

export function handleRowShift(rowIndex, direction, grid, setGrid, winners) {
    const newGrid = grid.map(row => row.map(cell => { return { ...cell, winningCell: false } }))
    if (direction === 'left') {
        newGrid[rowIndex].push(newGrid[rowIndex].shift()); // Shift left
    } else {
        newGrid[rowIndex].unshift(newGrid[rowIndex].pop()); // Shift right
    }
    setGrid(newGrid);
    return updateGridState(newGrid, winners); // Check for a winner after shifting
};
