const allMessages = {
    "GAME_OVER": "Game Over",
    "SPACE": "  ",
    "GAME_OVER_NO_WINNER": "Game Over, No Winner",
    "RULES": "Rules",
    "RESTART": "Restart",
    "SKIP": "Skip",
    "ENABLE_NAVIGATION": "Enable Row/Column Navigation",
    "DISABLE_NAVIGATION": "Disable Row/Column Navigation",
    "NUM_PLAYERS": "Number of players",
    "ACTIVE_PLAYER": "Active player",
    "WELCOME": "Shift, strategize, and win—welcome to Tic Tac Slide!",
    "REOPEN_RULES_INSTRUCTION": "To reopen the rules, you can click the rules button on control panel."
};

export default function getMessageText(msg) {
    if (msg in allMessages) {
        return allMessages[msg]
    } else {
        return msg
    }
}