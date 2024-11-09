export default function rules() {
   return `
## Shift, strategize, and win—welcome to Tic Tac Slide!



### 🎮 How to Play

1. **Choose Number of Players**: Use the slider in the topmost row to select how many players are participating.
1. **Player Colors**: Players are assigned distinct colors: Red, Blue, Yellow, Green, Purple, and Pink.
1. **Taking Turns**:
   - Each player takes turns in a predefined order.
   - On a player's turn, they must first choose an unoccupied cell by clicking on it.
   - After selecting a cell, they can:
     - Use one of the four move buttons to shift rows or columns.
     - Click the **Skip** button on the control panel to pass the turn to the next player.
1. **Winning the Game**:
   - If a player successfully matches four cells in a row, column, or diagonal, they win.
   - Upon winning, the player loses control of the game and cannot make further changes to the grid. The next player is given control automatically.
1. **Classic Mode**: 
   - Use the checkbox in the control panel to disable all navigation, creating a experience similar to classic Tic Tac Toe but in a multi-player mode.
1. **Active Player Indicator**: The currently active player's color is displayed in a circled person icon on the control panel.
1. **Restarting the Game**: Use the refresh button on the control panel to restart the game at any time.
`;
}