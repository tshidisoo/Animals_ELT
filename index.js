class AnimalsMatchingGame {
    constructor() {
        // Wild animals with their emoji stickers
        this.wildAnimals = {
            'lion': '🦁',
            'elephant': '🐘',
            'giraffe': '🦒',
            'bear': '🐻',
            'polar bear': '🐻‍❄️',
            'snow leopard': '🐆',
            'camel': '🐪',
            'crocodile': '🐊',
            'leopard': '🐆',
            'deer': '🦌',
            'mountain goat': '🐐',
            'python': '🐍',
            'chameleon': '🦎',
            'tortoise': '🐢',
            'turtle': '🐢',
            'armadillo': '🦔',
            'bat': '🦇',
            'hawk': '🦅',
            'rattlesnake': '🐍',
            'flamingo': '🦩',
            'peacock': '🦚',
            'owl': '🦉',
            'bald eagle': '🦅'
        };

        // Domestic animals with their emoji stickers
        this.domesticAnimals = {
            'dog': '🐕',
            'cat': '🐱',
            'cow': '🐄',
            'horse': '🐎',
            'pig': '🐷',
            'chicken': '🐔',
            'sheep': '🐑',
            'goat': '🐐',
            'duck': '🦆',
            'rabbit': '🐰',
            'hamster': '🐹',
            'guinea pig': '🐹',
            'canary': '🐦',
            'goldfish': '🐠',
            'parrot': '🦜',
            'turkey': '🦃',
            'goose': '🪿',
            'donkey': '🫏',
            'llama': '🦙',
            'ferret': '🦫'
        };

        this.score = 0;
        this.timer = 0;
        this.gameStarted = false;
        this.timerInterval = null;
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.setupGame();
        this.bindEvents();
        this.startTimer();
    }

    setupGame() {
        this.createGameBoard('wild-board', this.wildAnimals);
        this.createGameBoard('domestic-board', this.domesticAnimals);
        this.totalPairs = Object.keys(this.wildAnimals).length + Object.keys(this.domesticAnimals).length;
        this.updateScore();
        this.showMessage('Match animal names with their stickers! Click a name, then its matching emoji! 🎯', 'info');
    }

    createGameBoard(boardId, animalsObj) {
        const board = document.getElementById(boardId);
        if (!board) {
            console.error(`Board element with id ${boardId} not found`);
            return;
        }
        
        board.innerHTML = '';
        
        // Create array of all cards (names and emojis)
        const allCards = [];
        Object.entries(animalsObj).forEach(([name, emoji]) => {
            allCards.push({ type: 'name', content: name, match: name });
            allCards.push({ type: 'emoji', content: emoji, match: name });
        });
        
        // Shuffle the cards
        this.shuffleArray(allCards);
        
        // Create card elements
        allCards.forEach((cardData, index) => {
            const card = this.createCard(cardData, `${boardId}-${index}`);
            board.appendChild(card);
        });
    }

    createCard(cardData, id) {
        const card = document.createElement('div');
        card.className = `card ${cardData.type}-card`;
        card.dataset.match = cardData.match;
        card.dataset.type = cardData.type;
        card.dataset.id = id;
        card.textContent = cardData.content;
        
        card.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectCard(card);
        });
        
        return card;
    }

    selectCard(card) {
        // Prevent selection if game is processing or card is already selected/matched
        if (this.isProcessing || 
            card.classList.contains('selected') || 
            card.classList.contains('matched') || 
            this.selectedCards.length >= 2) {
            return;
        }

        // Start the game timer on first click
        if (!this.gameStarted) {
            this.gameStarted = true;
        }

        card.classList.add('selected');
        this.selectedCards.push(card);

        // Check for match when two cards are selected
        if (this.selectedCards.length === 2) {
            this.isProcessing = true;
            setTimeout(() => {
                this.checkMatch();
            }, 500);
        }
    }

    checkMatch() {
        if (this.selectedCards.length !== 2) {
            this.isProcessing = false;
            return;
        }

        const [card1, card2] = this.selectedCards;
        const match1 = card1.dataset.match;
        const match2 = card2.dataset.match;
        const type1 = card1.dataset.type;
        const type2 = card2.dataset.type;

        // Check if cards match (same animal but different types - name and emoji)
        if (match1 === match2 && type1 !== type2) {
            // Correct match found
            card1.classList.remove('selected');
            card2.classList.remove('selected');
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            this.score += 15;
            this.matchedPairs++;
            
            const emojiCard = type1 === 'emoji' ? card1 : card2;
            this.showMessage(`Perfect match! ${emojiCard.textContent} ${match1} 🎉`, 'success');
            
            // Check if game is won
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => {
                    this.gameWon();
                }, 1000);
            }
        } else {
            // No match - wrong selection
            card1.classList.add('wrong');
            card2.classList.add('wrong');
            this.score = Math.max(0, this.score - 3);
            this.showMessage('Not quite right! Try again! 🤔', 'error');
            
            // Reset cards after showing wrong animation
            setTimeout(() => {
                card1.classList.remove('selected', 'wrong');
                card2.classList.remove('selected', 'wrong');
            }, 1000);
        }

        // Clear selected cards and allow new selections
        this.selectedCards = [];
        this.updateScore();
        
        setTimeout(() => {
            this.isProcessing = false;
        }, 1000);
    }

    gameWon() {
        this.stopTimer();
        this.showMessage(`🎊 Congratulations! You matched all animals! Final Score: ${this.score} points in ${this.timer} seconds! 🎊`, 'success');
        
        // Add celebration effect
        this.celebrateWin();
    }

    celebrateWin() {
        const cards = document.querySelectorAll('.card.matched');
        cards.forEach((card, index) => {
            setTimeout(() => {
                if (card && card.style) {
                    card.style.animation = 'bounce 0.6s ease-in-out';
                }
            }, index * 50);
        });
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        if (!messageEl) return;
        
        messageEl.textContent = text;
        messageEl.className = type;
        
        // Clear message after delay (except for win message)
        if (!text.includes('Congratulations')) {
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = '';
            }, 2500);
        }
    }

    updateScore() {
        const scoreEl = document.getElementById('score');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
    }

    startTimer() {
        this.timer = 0;
        this.updateTimer();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (this.gameStarted) {
                this.timer++;
                this.updateTimer();
            }
        }, 1000);
    }

    updateTimer() {
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.textContent = this.timer;
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetGame() {
        // Stop timer
        this.stopTimer();
        
        // Reset game state
        this.score = 0;
        this.timer = 0;
        this.gameStarted = false;
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.isProcessing = false;
        
        // Remove any existing animations
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card && card.style) {
                card.style.animation = '';
            }
        });
        
        // Restart the game
        this.setupGame();
        this.startTimer();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    bindEvents() {
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }
}

// Add bounce animation CSS dynamically
function addBounceAnimation() {
    const existingStyle = document.getElementById('bounce-animation');
    if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'bounce-animation';
        style.textContent = `
            @keyframes bounce {
                0%, 100% { 
                    transform: scale(0.95) translateY(0); 
                }
                50% { 
                    transform: scale(1.1) translateY(-10px); 
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        addBounceAnimation();
        new AnimalsMatchingGame();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

// Handle page visibility changes to pause/resume timer
document.addEventListener('visibilitychange', () => {
    // This could be extended to pause/resume the game when tab is not visible
});