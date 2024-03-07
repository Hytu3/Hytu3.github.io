let selectedChecker = null; //No selected checker to initialize
let currentPlayer = '1'; // Start with player 1 (black checkers)


// Function to create the checkers board
function createBoard() {
     const board = document.getElementById('board');

     //Creates board of 8 rows and 8 columns 
     for (let row = 0; row < 8; row++) {
         for (let col = 0; col < 8; col++) {
             const cell = document.createElement('div');
             cell.classList.add('cell');
             cell.classList.add((row + col) % 2 === 0 ? 'black' : 'green');
             cell.dataset.row = row;
             cell.dataset.col = col;

             cell.addEventListener('click', handleCellClick);

             board.appendChild(cell);

             // Add checkers to dark cells
             if ((row + col) % 2 === 0 && row < 3) {
                 const checker = createChecker('black-checker', row, col);
                 cell.appendChild(checker);
             } else if ((row + col) % 2 === 0 && row > 4) {
                 const checker = createChecker('green-checker', row, col);
                 cell.appendChild(checker);
             }
         }
     }
     updateEventBoard('Player 1\'s turn. Make a move!');
     updateEventBoard2('Player 1 has black checkers!');
 }


 function moveChecker(selectedCell) {

    if (!selectedChecker) {
        return; // In case no checker is selected
    }

    const currentRow = parseInt(selectedChecker.dataset.row);
    const currentCol = parseInt(selectedChecker.dataset.col);
    const targetRow = parseInt(selectedCell.dataset.row);
    const targetCol = parseInt(selectedCell.dataset.col);

    // Check the direction of movement based on the checker's color
    const direction = selectedChecker.classList.contains('black-checker') ? 1 : -1;

    // Check if the move is a valid diagonal move
    const isValidMove = Math.abs(targetRow - currentRow) === 1 && Math.abs(targetCol - currentCol) === 1;

    // Check the direction of movement to prevent moving diagonally backward
    const isForwardMove = (targetRow - currentRow) * direction > 0;

    // Check if it's a valid capture (two spaces diagonally)
    const isValidCapture = Math.abs(targetRow - currentRow) === 2 &&
        Math.abs(targetCol - currentCol) === 2 &&
        hasOpposingChecker(selectedChecker, targetRow, targetCol, currentCol, direction);
    
    const isValidKingCapture =
        ((Math.abs(targetRow - currentRow) === 2 && Math.abs(targetCol - currentCol) === 2) &&
        hasOpposingCheckerKing(selectedChecker, targetRow, targetCol, currentCol - 1, )) || // top left
        hasOpposingCheckerKing(selectedChecker, targetRow, targetCol, currentCol + 1, ) ||     // top right
        hasOpposingCheckerKing(selectedChecker, targetRow - 2, targetCol - 1, currentCol, ) || // bottom left
        hasOpposingCheckerKing(selectedChecker, targetRow - 2, targetCol + 1, currentCol, );  // bottom right

    // Check to see if checker is a king
    const isKing = selectedChecker.classList.contains('king');

    // Checking if checker is a king and if so, apply proper movement rules
    if ((selectedChecker.classList.contains('green-checker') && targetRow === 0) ||
        (selectedChecker.classList.contains('black-checker') && targetRow === 7)) {
        crownChecker(selectedChecker);
    }

    // If checker is a king, it can move diagonally forward and backward
    if (isKing) {
        if ((isValidMove || isValidKingCapture) && isPlayerTurn(selectedChecker)) {
            const targetCell = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);

            // Check if the target cell is empty
            if (!targetCell.hasChildNodes()) {
                selectedCell.appendChild(selectedChecker);

                // Update the dataset values of the checker to the new position
                selectedChecker.dataset.row = targetRow.toString();
                selectedChecker.dataset.col = targetCol.toString();

                // Update the event board with a message
                if (isValidKingCapture) {
                    // Determine the position of the captured piece
                    
                    let capturedRow, capturedCol;

                    if (targetRow < currentRow && targetCol < currentCol) {
                    // Top left direction
                    capturedRow = currentRow - 1;
                    capturedCol = currentCol - 1;
                } else if (targetRow < currentRow && targetCol > currentCol) {
                    // Top right direction
                     capturedRow = currentRow - 1;
                     capturedCol = currentCol + 1;
                } else if (targetRow > currentRow && targetCol < currentCol) {
                    // Bottom left direction
                    capturedRow = currentRow + 1;
                    capturedCol = currentCol - 1;
                } else {
                     // Bottom right direction
                    capturedRow = currentRow + 1;
                    capturedCol = currentCol + 1;
                }

                    // Find the cell of the captured piece
                    const capturedCell = document.querySelector(`[data-row="${capturedRow}"][data-col="${capturedCol}"]`);

                    if (capturedCell.hasChildNodes()) {
                        // Capture the piece in the target cell
                        const capturedPiece = capturedCell.firstChild;
                        capturedCell.removeChild(capturedPiece);

                        // Update the event board with a message
                        updateEventBoard2(`Player ${getCurrentPlayer()} captured a piece and moved checker to ${targetRow}, ${targetCol}`);
                    }
                } else {
                    updateEventBoard2(`Player ${getCurrentPlayer()} moved checker to ${targetRow}, ${targetCol}`);
                }

                // Switch to the next player's turn
                switchPlayerTurn();

                // Prompt the next player to make a move
                updateEventBoard(`Player ${getCurrentPlayer()}'s turn. Make a move!`);
            } else {
                updateEventBoard('Invalid move. Target cell is not empty.');
            }
        } else {
            // Tells the player its not a valid move
            updateEventBoard(`Invalid move.`);
        }
    } else {
        if ((isValidMove || isValidCapture) && isForwardMove && isPlayerTurn(selectedChecker)) {
            const targetCell = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
    
            // Check if the target cell is empty
            if (!targetCell.hasChildNodes()) {
                selectedCell.appendChild(selectedChecker);
    
                // Update the dataset values of the checker to the new position
                selectedChecker.dataset.row = targetRow.toString();
                selectedChecker.dataset.col = targetCol.toString();
    
                
                if (isValidCapture) {
                    // Determine the position of the captured piece
                    const capturedRow = currentRow + direction;
                    const capturedCol = currentCol + (targetCol > currentCol ? 1 : -1);
    
                    // Find the cell of the captured piece
                    const capturedCell = document.querySelector(`[data-row="${capturedRow}"][data-col="${capturedCol}"]`);
    
                    if (capturedCell.hasChildNodes()) {
                        // Capture the piece in the target cell
                        const capturedPiece = capturedCell.firstChild;
                        capturedCell.removeChild(capturedPiece);
    
                        // Update the event board with a message
                        updateEventBoard2(`Player ${getCurrentPlayer()} captured a piece and moved checker to ${targetRow}, ${targetCol}`);
                    }
                } else {
                    updateEventBoard2(`Player ${getCurrentPlayer()} moved checker to ${targetRow}, ${targetCol}`);
                }
    
                // Switch to the next player's turn
                switchPlayerTurn();
    
                // Prompt the next player to make a move
                updateEventBoard(`Player ${getCurrentPlayer()}'s turn. Make a move!`);
            } else {
                updateEventBoard('Invalid move. Target cell is not empty.');
            }
        } else {
            // Invalid move, display an error message or handle it as needed
            updateEventBoard(`Invalid move.`);
        }
    }

// Clear the selected checker
selectedChecker = null;
// Check for victory after each move
checkVictory();
}

function hasOpposingChecker(checker, targetRow, targetCol, currentCol, direction) {

    //Checks for opposing checker that is tangent to your checker
    const adjacentRow = targetRow - direction;
    const adjacentCol = currentCol + (targetCol > currentCol ? 1 : -1);

    const adjacentCell = document.querySelector(`[data-row="${adjacentRow}"][data-col="${adjacentCol}"]`);

    if (adjacentCell && adjacentCell.hasChildNodes()) {
        const adjacentChecker = adjacentCell.firstChild;
        const isOpposingChecker =
            (checker.classList.contains('black-checker') && adjacentChecker.classList.contains('green-checker')) ||
            (checker.classList.contains('green-checker') && adjacentChecker.classList.contains('black-checker'));

        return isOpposingChecker;
    }

    return false;
}

function hasOpposingCheckerKing(checker, targetRow, targetCol) {
    const directions = [
        { row: targetRow + 1, col: targetCol - 1 }, // top left
        { row: targetRow + 1, col: targetCol + 1 }, // top right
        { row: targetRow - 1, col: targetCol - 1 }, // bottom left
        { row: targetRow - 1, col: targetCol + 1 }  // bottom right
    ];

    for (const dir of directions) {
        const adjacentCell = document.querySelector(`[data-row="${dir.row}"][data-col="${dir.col}"]`);

        if (adjacentCell && adjacentCell.hasChildNodes()) {
            const adjacentChecker = adjacentCell.firstChild;
            const isOpposingKingChecker =
                (checker.classList.contains('black-checker') && adjacentChecker.classList.contains('green-checker')) ||
                (checker.classList.contains('green-checker') && adjacentChecker.classList.contains('black-checker'));

        return isOpposingKingChecker;
        }
    }

    return false;
}



function crownChecker(checker) {
    checker.classList.add('king'); // Checker becomes king and glows
}


// Updates the handleCheckerClick function to store the selected checker
function handleCheckerClick(event) {
    event.stopPropagation();  // Stop event propagation so selectedcell isnt called

    selectedChecker = event.target;
    const glowCheckers = document.querySelectorAll('.glow');

    // Remove glow from previously selected cells
    glowCheckers.forEach(checker => checker.classList.remove('glow'));

    // Add glow to the clicked checker/cell
    selectedChecker.classList.add('glow');

}

// Updates the handleCellClick function to call the moveChecker function
function handleCellClick(event) {
    const selectedCell = event.target;
    const glowCells = document.querySelectorAll('.glow');

    // Remove glow from previously selected cells
    glowCells.forEach(cell => cell.classList.remove('glow'));

    // Add glow to the clicked checker/cell
    selectedCell.classList.add('glow');

    // Move the selected checker to the clicked cell
    moveChecker(selectedCell);
}


// Function to create a checker piece
function createChecker(className, row, col) {
    const checker = document.createElement('div');
    checker.classList.add('checker');
    checker.classList.add(className);
    checker.dataset.row = row;
    checker.dataset.col = col;
    checker.addEventListener('click', handleCheckerClick);
    //console.log(`Created checker at row: ${row}, col: ${col}`);
    return checker;
}

 // Function to delete a checker
function deleteChecker(cell) {
    const checkerToDelete = cell.querySelector('.checker');

    if (checkerToDelete) {
        // Remove the checker from the cell
        checkerToDelete.remove();
    }
}

function checkVictory() {
    const player1Checkers = document.querySelectorAll('.black-checker');
    const player2Checkers = document.querySelectorAll('.green-checker');

    if (player1Checkers.length === 0) {
        updateEventBoard('Player 2 wins! Victory!');
    } else if (player2Checkers.length === 0) {
        updateEventBoard('Player 1 wins! Victory!');
    }
}

 //Updating event board with messages keeping track of player turns and if a move is legal
function updateEventBoard(message) {
     const eventBoard = document.getElementById('eventBoard');
     eventBoard.textContent = message;
}

//Updating event board 2 with messages keeping track of where player moved checker and if a capture was made
function updateEventBoard2(message) {
    const eventBoard2 = document.getElementById('eventBoard2');
    eventBoard2.textContent = message;
}



// Function to get the current player
function getCurrentPlayer() {
    return currentPlayer;
}

// Function to switch to the next player's turn
function switchPlayerTurn() {
    currentPlayer = (currentPlayer === '1') ? '2' : '1';
}

// Function to check if it's the correct player's turn
function isPlayerTurn(checker) {
    return (currentPlayer === '1' && checker.classList.contains('black-checker')) ||
        (currentPlayer === '2' && checker.classList.contains('green-checker'));
}


// Initialize the checkers board
createBoard();