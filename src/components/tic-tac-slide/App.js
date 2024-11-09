import React, { useEffect, useState } from 'react';
import { Stack } from 'react-bootstrap';
import './index.css'; // Using your index.css
import allColors from './playerColors';
import ControlPanel from './ControlPanel';
import GameGrid from './GameGrid.js';
import { AppContext } from './AppContext.js';
import { checkGameOver } from './logic.js';
import GameOver from './GameOver.js';

const GRID_SIZE = 8;

const GridApp = () => {
  // Initialize grid with unique IDs and no initial color
  const initializeGrid = (size) => {
    return Array.from({ length: size }, (_, rowIndex) =>
      Array.from({ length: size }, (_, colIndex) => ({
        id: `${rowIndex}-${colIndex}`,
        color: '', // No initial color
        locked: false // Flag to prevent color changes once a color is set
      }))
    );
  };

  const [colors, setColors] = useState(allColors.slice(0, 2));
  const [turnComplete, setTurnComplete] = useState(true);
  const [size] = useState(GRID_SIZE); // Grid size (both rows and columns)
  const [grid, setGrid] = useState(initializeGrid(size));
  const [selectedColor, setSelectedColor] = useState(colors[0].val); // Default color selection
  const [selectedColorName, setSelectedColorName] = useState(colors[0].name); // Default color selection
  const [winners, setWinners] = useState([]); // State to store winner color
  const [cellClicked, setCellClicked] = useState(false);
  const [moveActivated, setMoveActivated] = useState(true);

  const [showRules, setShowRules] = useState(() => {
    const saved = localStorage.getItem("showRules");
    const initialValue = JSON.parse(saved);
    return initialValue == null || initialValue;
  });

  useEffect(() => {
    localStorage.setItem("showRules", JSON.stringify(showRules));
  }, [showRules]);

  const handleCloseRule = () => setShowRules(false);
  const handleShowRule = () => setShowRules(true);

  const clearWinners = () => setWinners([]);

  const changePlayer = () => {
    setSelectedColor(getNextColor());
    setCellClicked(false);
    setTurnComplete(true);
  }

  const isGameOver = () => checkGameOver(winners, colors, grid);

  const getNextColor = () => {
    // Start from the index of the selected color in the original colors array
    let selectedColorIndex = colors.findIndex(c => c.val === selectedColor);

    // Loop through the colors array to find the next color that is not a winner
    do {
      // Move to the next color, wrapping around to the start if necessary
      selectedColorIndex = (selectedColorIndex + 1) % colors.length;
    } while (winners.includes(colors[selectedColorIndex].val));

    // Return the next non-winner color
    return colors[selectedColorIndex].val;
  };

  const contextValue = {
    colors, setColors, allColors, size, grid,
    setGrid, selectedColor, setSelectedColor,
    selectedColorName, setSelectedColorName,
    winners, initializeGrid, clearWinners,
    cellClicked, setCellClicked, getNextColor,
    turnComplete, setTurnComplete, changePlayer,
    moveActivated, setMoveActivated, isGameOver, setWinners,
    showRules, handleShowRule, handleCloseRule
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Stack className='p-4'>
        <ControlPanel colors={colors} allColors={allColors} setColors={setColors} />
        <GameOver isGameOver={isGameOver} winners={winners} />
        <GameGrid />
      </Stack>
    </AppContext.Provider >
  );
};

export default GridApp;
