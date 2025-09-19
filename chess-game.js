// Chess Game Implementation for SIDER.dev
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.gameMode = 'vs-ai'; // 'vs-human' or 'vs-ai'
        this.difficulty = 'medium';
        this.moveCount = 0;
        
        // Game stats
        this.startTime = Date.now();
        this.capturedPieces = { white: [], black: [] };
        this.checkStatus = null;
        
        // Canvas and rendering
        this.canvas = null;
        this.ctx = null;
        this.boardSize = 480;
        this.squareSize = 60;
        this.boardOffset = { x: 0, y: 0 };
        
        // Animation
        this.animationQueue = [];
        this.animating = false;
        
        // Event listeners
        this.bindEvents();
    }
    
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Place other pieces
        const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: backRow[i], color: 'black' };
            board[7][i] = { type: backRow[i], color: 'white' };
        }
        
        return board;
    }
    
    // Piece movement validation
    isValidMove(fromRow, fromCol, toRow, toCol) {
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
        
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) return false;
        
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        switch (piece.type) {
            case 'pawn':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol);
            case 'rook':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case 'bishop':
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case 'king':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }
    
    isValidPawnMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        const targetPiece = this.board[toRow][toCol];
        
        // Forward move
        if (fromCol === toCol) {
            if (toRow === fromRow + direction && !targetPiece) return true;
            if (fromRow === startRow && toRow === fromRow + (2 * direction) && !targetPiece) return true;
        }
        
        // Diagonal capture
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece) {
            return true;
        }
        
        return false;
    }
    
    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }
    
    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }
    
    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }
    
    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }
    
    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return rowDiff <= 1 && colDiff <= 1;
    }
    
    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
        const colStep = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }
    
    // Game logic
    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) return false;
        
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Record move for history
        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece,
            moveNumber: this.moveCount + 1
        };
        
        // Execute move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Handle captured pieces
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
        }
        
        // Pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: 'queen', color: piece.color };
            move.promoted = true;
        }
        
        this.gameHistory.push(move);
        this.moveCount++;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update UI
        this.updateGameUI();
        
        // Check for game end conditions
        this.checkGameStatus();
        
        return true;
    }
    
    updateGameUI() {
        const moveElement = document.getElementById('chess-moves');
        const turnElement = document.getElementById('chess-turn');
        
        if (moveElement) {
            moveElement.textContent = `Moves: ${this.moveCount}`;
        }
        
        if (turnElement) {
            turnElement.textContent = `${this.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
        }
        
        this.updateCapturedPieces();
    }
    
    updateCapturedPieces() {
        const whiteCaptured = document.querySelector('#white-captured .captured-list');
        const blackCaptured = document.querySelector('#black-captured .captured-list');
        
        if (whiteCaptured) {
            whiteCaptured.innerHTML = this.capturedPieces.white.map(piece => 
                this.getPieceSymbol(piece.type, 'white')
            ).join(' ');
        }
        
        if (blackCaptured) {
            blackCaptured.innerHTML = this.capturedPieces.black.map(piece => 
                this.getPieceSymbol(piece.type, 'black')
            ).join(' ');
        }
    }
    
    getPieceSymbol(type, color) {
        const symbols = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };
        return symbols[color][type];
    }
    
    checkGameStatus() {
        // Simplified check detection
        const kingInCheck = this.isKingInCheck(this.currentPlayer);
        if (kingInCheck) {
            this.checkStatus = this.currentPlayer;
            // Check for checkmate (simplified)
            if (this.hasNoLegalMoves()) {
                this.isGameOver = true;
                this.gameResult = `${this.currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate!`;
                this.updateStatus(this.gameResult);
            } else {
                this.updateStatus(`${this.currentPlayer.toUpperCase()} is in check!`);
            }
        } else {
            this.checkStatus = null;
            // Check for stalemate
            if (this.hasNoLegalMoves()) {
                this.isGameOver = true;
                this.gameResult = "Stalemate - Draw!";
                this.updateStatus(this.gameResult);
            } else {
                this.updateStatus(`${this.currentPlayer === 'white' ? 'White' : 'Black'} to move`);
            }
        }
    }
    
    updateStatus(message) {
        const statusElement = document.getElementById('chess-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
    
    isKingInCheck(color) {
        // Find king position
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingPos = { row, col };
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false;
        
        // Check if any opponent piece can attack the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    if (this.isValidMove(row, col, kingPos.row, kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    hasNoLegalMoves() {
        // Simplified implementation
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (piece && piece.color === this.currentPlayer) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
    
    // AI opponent (simple implementation)
    makeAIMove() {
        if (this.currentPlayer !== 'black' || this.isGameOver) return;
        
        const possibleMoves = this.getAllValidMoves('black');
        if (possibleMoves.length === 0) return;
        
        // Simple AI: prioritize captures, then random moves
        let bestMoves = possibleMoves.filter(move => 
            this.board[move.to.row][move.to.col] !== null
        );
        
        if (bestMoves.length === 0) {
            bestMoves = possibleMoves;
        }
        
        const randomMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        
        setTimeout(() => {
            this.makeMove(
                randomMove.from.row, 
                randomMove.from.col, 
                randomMove.to.row, 
                randomMove.to.col
            );
            this.render();
        }, 500 + Math.random() * 1000);
    }
    
    getAllValidMoves(color) {
        const moves = [];
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                moves.push({
                                    from: { row: fromRow, col: fromCol },
                                    to: { row: toRow, col: toCol }
                                });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
    
    // Rendering
    render() {
        if (!this.canvas || !this.ctx) return;
        
        this.clearCanvas();
        this.drawBoard();
        this.drawPieces();
        this.drawUI();
        
        if (this.selectedSquare) {
            this.highlightSquare(this.selectedSquare.row, this.selectedSquare.col, '#4CAF50', 0.3);
            this.showValidMoves();
        }
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(18, 24, 39, 0.95)');
        gradient.addColorStop(1, 'rgba(45, 52, 54, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBoard() {
        const startX = (this.canvas.width - this.boardSize) / 2;
        const startY = (this.canvas.height - this.boardSize) / 2 - 20;
        this.boardOffset = { x: startX, y: startY };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = startX + col * this.squareSize;
                const y = startY + row * this.squareSize;
                const isLight = (row + col) % 2 === 0;
                
                this.ctx.fillStyle = isLight ? '#F0D9B5' : '#B58863';
                this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
                
                // Board border
                this.ctx.strokeStyle = '#8B4513';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.squareSize, this.squareSize);
            }
        }
        
        // Board labels
        this.drawBoardLabels(startX, startY);
    }
    
    drawBoardLabels(startX, startY) {
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = '12px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        
        // Column labels (a-h)
        for (let col = 0; col < 8; col++) {
            const letter = String.fromCharCode(97 + col); // 'a' + col
            const x = startX + col * this.squareSize + this.squareSize / 2;
            this.ctx.fillText(letter, x, startY + this.boardSize + 20);
        }
        
        // Row labels (1-8)
        this.ctx.textAlign = 'left';
        for (let row = 0; row < 8; row++) {
            const number = 8 - row;
            const y = startY + row * this.squareSize + this.squareSize / 2 + 4;
            this.ctx.fillText(number.toString(), startX - 20, y);
        }
    }
    
    drawPieces() {
        const pieceSymbols = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };
        
        this.ctx.font = '40px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const x = this.boardOffset.x + col * this.squareSize + this.squareSize / 2;
                    const y = this.boardOffset.y + row * this.squareSize + this.squareSize / 2;
                    
                    // Add glow effect for better visibility
                    this.ctx.shadowColor = piece.color === 'white' ? '#ffffff' : '#000000';
                    this.ctx.shadowBlur = 3;
                    
                    this.ctx.fillStyle = piece.color === 'white' ? '#ffffff' : '#1a1a1a';
                    this.ctx.fillText(pieceSymbols[piece.color][piece.type], x, y);
                    
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }
    
    drawUI() {
        // Game status
        this.ctx.font = '16px "JetBrains Mono", monospace';
        this.ctx.fillStyle = '#00ff41';
        this.ctx.textAlign = 'left';
        
        const statusY = this.boardOffset.y - 40;
        this.ctx.fillText(`Turn: ${this.currentPlayer.toUpperCase()}`, this.boardOffset.x, statusY);
        
        if (this.checkStatus) {
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillText('CHECK!', this.boardOffset.x + 150, statusY);
        }
        
        // Move counter
        this.ctx.fillStyle = '#00ff41';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Move: ${this.moveCount}`, this.boardOffset.x + this.boardSize, statusY);
        
        if (this.isGameOver) {
            this.drawGameOver();
        }
    }
    
    drawGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over message
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = 'bold 28px "JetBrains Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '18px "JetBrains Mono", monospace';
        this.ctx.fillText(this.gameResult, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '14px "JetBrains Mono", monospace';
        this.ctx.fillText('Press R to restart or ESC to exit', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    highlightSquare(row, col, color, alpha = 0.5) {
        const x = this.boardOffset.x + col * this.squareSize;
        const y = this.boardOffset.y + row * this.squareSize;
        
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
        this.ctx.globalAlpha = 1.0;
    }
    
    showValidMoves() {
        if (!this.selectedSquare) return;
        
        const fromRow = this.selectedSquare.row;
        const fromCol = this.selectedSquare.col;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(fromRow, fromCol, row, col)) {
                    const x = this.boardOffset.x + col * this.squareSize + this.squareSize / 2;
                    const y = this.boardOffset.y + row * this.squareSize + this.squareSize / 2;
                    
                    this.ctx.fillStyle = this.board[row][col] ? '#ff4444' : '#4CAF50';
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, this.board[row][col] ? 25 : 8, 0, 2 * Math.PI);
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1.0;
                }
            }
        }
    }
    
    // Input handling
    getSquareFromCoords(x, y) {
        const relX = x - this.boardOffset.x;
        const relY = y - this.boardOffset.y;
        
        if (relX < 0 || relY < 0 || relX >= this.boardSize || relY >= this.boardSize) {
            return null;
        }
        
        const col = Math.floor(relX / this.squareSize);
        const row = Math.floor(relY / this.squareSize);
        
        return { row, col };
    }
    
    handleClick(x, y) {
        if (this.isGameOver || this.currentPlayer !== 'white') return;
        
        const square = this.getSquareFromCoords(x, y);
        if (!square) return;
        
        const { row, col } = square;
        
        if (this.selectedSquare) {
            // Try to make a move
            if (this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.selectedSquare = null;
                this.render();
                
                // Trigger AI move if in AI mode
                if (this.gameMode === 'vs-ai' && !this.isGameOver) {
                    this.makeAIMove();
                }
            } else if (this.board[row][col] && this.board[row][col].color === 'white') {
                // Select different piece
                this.selectedSquare = { row, col };
                this.render();
            } else {
                // Deselect
                this.selectedSquare = null;
                this.render();
            }
        } else {
            // Select a piece
            if (this.board[row][col] && this.board[row][col].color === 'white') {
                this.selectedSquare = { row, col };
                this.render();
            }
        }
    }
    
    bindEvents() {
        // Will be called after canvas is created
    }
    
    initCanvas(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 640;
        this.canvas.height = 600;
        
        // Mouse events
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleClick(x, y);
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('chess-game').style.display === 'none') return;
            
            switch(e.key) {
                case 'r':
                case 'R':
                    if (this.isGameOver) {
                        this.resetGame();
                    }
                    break;
                case 'Escape':
                    this.exitGame();
                    break;
            }
        });
        
        this.render();
    }
    
    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.selectedSquare = null;
        this.isGameOver = false;
        this.moveCount = 0;
        this.startTime = Date.now();
        this.capturedPieces = { white: [], black: [] };
        this.checkStatus = null;
        this.gameResult = null;
        
        this.updateGameUI();
        this.updateStatus('New game started! White to move.');
        this.render();
    }
    
    exitGame() {
        document.getElementById('chess-game').style.display = 'none';
    }
}

// Chess Game UI Manager
class ChessGameManager {
    constructor() {
        this.game = null;
        this.isActive = false;
        this.stats = this.loadStats();
        this.setupGameEvents();
    }
    
    loadStats() {
        const stored = localStorage.getItem('sider-chess-stats');
        return stored ? JSON.parse(stored) : {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            bestTime: null
        };
    }
    
    saveStats() {
        localStorage.setItem('sider-chess-stats', JSON.stringify(this.stats));
        this.updateStatsDisplay();
    }
    
    updateStatsDisplay() {
        const gamesElement = document.getElementById('games-played');
        const winsElement = document.getElementById('wins');
        const bestTimeElement = document.getElementById('best-time');
        
        if (gamesElement) gamesElement.textContent = this.stats.gamesPlayed;
        if (winsElement) winsElement.textContent = this.stats.wins;
        if (bestTimeElement) {
            bestTimeElement.textContent = this.stats.bestTime ? 
                this.formatTime(this.stats.bestTime) : '--:--';
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    setupGameEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            const closeBtn = document.getElementById('chess-close');
            const newGameBtn = document.getElementById('chess-new-game');
            const settingsBtn = document.getElementById('chess-settings');
            
            if (closeBtn) closeBtn.addEventListener('click', () => this.hideGame());
            if (newGameBtn) newGameBtn.addEventListener('click', () => this.startNewGame());
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    alert('Settings:\n• Difficulty: Medium\n• Mode: vs AI\n• Sound: ON\n\nMore options coming soon!');
                });
            }
            
            this.updateStatsDisplay();
        });
    }
    
    showGame() {
        if (this.isActive) return;
        
        const gameElement = document.getElementById('chess-game');
        if (!gameElement) {
            console.error('Chess game element not found');
            return;
        }
        
        gameElement.style.display = 'flex';
        this.isActive = true;
        
        // Initialize game if not already done
        if (!this.game) {
            this.startNewGame();
        }
        
        // Play activation effect
        this.playActivationEffect();
        
        console.log('🎮 Chess game activated!');
    }
    
    hideGame() {
        const gameElement = document.getElementById('chess-game');
        if (gameElement) {
            gameElement.style.display = 'none';
        }
        this.isActive = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    startNewGame() {
        this.game = new ChessGame();
        const canvas = document.getElementById('chess-canvas');
        if (canvas) {
            this.game.initCanvas(canvas);
        }
        
        // Start timer
        this.startGameTimer();
        
        // Update stats display
        this.updateStatsDisplay();
        
        const statusElement = document.getElementById('chess-status');
        if (statusElement) {
            statusElement.textContent = 'New game started! White to move. Click pieces to select and move.';
        }
    }
    
    startGameTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        let startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            if (!this.isActive || !this.game) return;
            
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const timerElement = document.getElementById('chess-timer');
            if (timerElement) {
                timerElement.textContent = this.formatTime(elapsed);
            }
            
            // Check if game ended
            if (this.game.isGameOver) {
                clearInterval(this.timerInterval);
                this.handleGameEnd(elapsed);
            }
        }, 1000);
    }
    
    handleGameEnd(gameTime) {
        this.stats.gamesPlayed++;
        
        if (this.game.gameResult.includes('White wins')) {
            this.stats.wins++;
            if (!this.stats.bestTime || gameTime < this.stats.bestTime) {
                this.stats.bestTime = gameTime;
            }
        } else if (this.game.gameResult.includes('Black wins')) {
            this.stats.losses++;
        } else {
            this.stats.draws++;
        }
        
        this.saveStats();
    }
    
    playActivationEffect() {
        const gameElement = document.getElementById('chess-game');
        if (gameElement) {
            gameElement.classList.add('chess-activating');
            
            setTimeout(() => {
                gameElement.classList.remove('chess-activating');
            }, 1000);
        }
        
        // Play sound effect if available
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcCTqS2fHKdSgEJ3vN9N+RQAoUXL3o7KhVEwlEneLz');
            audio.volume = 0.1;
            audio.play().catch(() => {});
        } catch (e) {
            // Sound failed, continue silently
        }
    }
}

// Initialize chess game manager
document.addEventListener('DOMContentLoaded', () => {
    window.chessGameManager = new ChessGameManager();
});