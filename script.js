document.addEventListener('DOMContentLoaded', () => {
    const palabraObjetivo = 'MICHI'; // Palabra objetivo
    const maxAttempts = 6; //Cantidad máxima de intentos
    
    let currentAttempt = ''; // intento actual (vacío por defecto)
    let attempts = 0; // número de intentos realizados

    const grid = document.querySelector('.grid');
    const keys = document.querySelectorAll('.key');
    const actionKeys = document.querySelectorAll('.action-key');
    const gameContainer = document.querySelector('.game-container');
    const keyboard = document.querySelector('.keyboard');

    function handleKeyPress(event) {
        const key = event.target.textContent;

        if (key === 'Enter') {
            if (currentAttempt.length === 5) {
                checkGuess();
            } else {
                alert('La palabra debe tener 5 letras');
            }
        } else if (event.target.classList.contains('fa-delete-left')) {
            currentAttempt = currentAttempt.slice(0, -1);
            updateGrid();
        } else if (/^[A-ZÑ]$/.test(key) && currentAttempt.length < 5) {
            currentAttempt += key;
            updateGrid();
        }
    }

    function updateGrid() {
        const currentRow = grid.children[attempts];
        const cells = currentRow.children;

        for (let i = 0; i < 5; i++) {
            cells[i].textContent = currentAttempt[i] || '';
        }
    }

    function checkGuess() {
        if (currentAttempt === palabraObjetivo) {
            endGame('win');
            return;
        }

        const currentRow = grid.children[attempts];
        const cells = currentRow.children;

        for (let i = 0; i < 5; i++) {
            if (currentAttempt[i] === palabraObjetivo[i]) {
                cells[i].style.backgroundColor = 'green';
                markKeyGreen(currentAttempt[i]);
            } else if (palabraObjetivo.includes(currentAttempt[i])) {
                cells[i].style.backgroundColor = 'yellow';
            } else {
                cells[i].style.backgroundColor = 'red';
                markKeyRed(currentAttempt[i]);
            }
        }

        attempts++;
        if (attempts === maxAttempts) {
            endGame('lose');
        } else {
            currentAttempt = '';
        }
    }

    function markKeyRed(letter) {
        keys.forEach(key => {
            if (key.textContent === letter) {
                key.classList.add('red-keys');
            }
        });
    }

    function markKeyGreen(letter) {
        keys.forEach(key => {
            if (key.textContent === letter) {
                key.classList.add('green-keys');
            }
        });
    }

    function endGame(result) {
        if (result === 'win') {
            alert('¡Felicidades, has ganado!');
        } else {
            alert(`Lo siento, has perdido. La palabra era ${palabraObjetivo}`);
        }

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reiniciar';
        resetButton.className = 'reset-button';
        resetButton.onclick = () => window.location.reload();
        gameContainer.insertBefore(resetButton, keyboard);

        document.querySelectorAll('.key, .action-key').forEach(key => key.removeEventListener('click', handleKeyPress));
    }

    keys.forEach(key => key.addEventListener('click', handleKeyPress));
    actionKeys.forEach(key => key.addEventListener('click', handleKeyPress));
});
