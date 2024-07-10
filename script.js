// Respuestas a las preguntas sobre el juego de adivinanzas de palabras

// 1- Cómo se obtienen las palabras a adivinar?
// Las palabras se obtienen haciendo una solicitud fetch a la API 'https://random-word-api.herokuapp.com/word' con parámetros específicos (número de palabras, longitud y idioma). 
// Luego, se normaliza la palabra obtenida para eliminar tildes y se verifica que no esté en la lista de palabras usadas para evitar repeticiones.

// 2- Cómo es posible tener un conjunto de palabras para que el juego se pueda volver a jugar sin repetir las palabras?
// Las palabras utilizadas se almacenan en localStorage en forma de array ('usedWords'). Antes de asignar una nueva palabra objetivo, se verifica si ya está en este array.
// Si la palabra ya ha sido utilizada, se solicita una nueva palabra hasta obtener una que no esté en la lista de palabras usadas.

// 3- Explicar brevemente la lógica usada para validar las palabras ingresadas por el usuario.
// Cuando el usuario presiona la tecla 'Enter' para confirmar su intento:
// - Se verifica si la longitud del intento actual es de 5 caracteres.
// - Se compara el intento actual con la palabra objetivo.
// - Se recorren los caracteres del intento y se comparan con los de la palabra objetivo para determinar si coinciden en posición (colorear verde), si están presentes pero en posiciones diferentes (colorear amarillo) o si no están en la palabra objetivo (colorear rojo).
// - Se lleva un conteo de intentos fallidos y se termina el juego si se alcanza el máximo de intentos permitidos.
// - Si el usuario acierta, se muestra un mensaje de victoria; de lo contrario, se muestra la palabra objetivo y un mensaje de derrota.



document.addEventListener('DOMContentLoaded', () => {
    const maxAttempts = 6; // Cantidad máxima de intentos
    let palabraObjetivo = ''; // Palabra objetivo
    let currentAttempt = ''; // Intento actual (vacío por defecto)
    let attempts = 0; // Número de intentos realizados

    const grid = document.querySelector('.grid');
    const keys = document.querySelectorAll('.key');
    const actionKeys = document.querySelectorAll('.action-key');
    const gameContainer = document.querySelector('.game-container');
    const keyboard = document.querySelector('.keyboard');

    // Cargar palabras utilizadas desde localStorage
    let usedWords = JSON.parse(localStorage.getItem('usedWords')) || [];

    async function obtenerPalabraAleatoria() {
        try {
            const response = await fetch('https://random-word-api.herokuapp.com/word?number=1&length=5&lang=es');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            let palabra = data[0].toUpperCase();
            palabra = palabra.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Eliminar tildes
            while (usedWords.includes(palabra)) {
                const response = await fetch('https://random-word-api.herokuapp.com/word?number=1&length=5&lang=es');
                const data = await response.json();
                palabra = data[0].toUpperCase();
                palabra = palabra.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Eliminar tildes
            }
            palabraObjetivo = palabra;
            usedWords.push(palabraObjetivo);
            localStorage.setItem('usedWords', JSON.stringify(usedWords)); // Guardar palabras utilizadas en localStorage
            console.log(`Palabra objetivo: ${palabraObjetivo}`); // Log de la palabra objetivo (para tramposos jeje )
        } catch (error) {
            console.error('Error al obtener la palabra:', error);
        }
    }

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
        resetButton.onclick = reiniciarJuego;
        gameContainer.insertBefore(resetButton, keyboard);

        document.querySelectorAll('.key, .action-key').forEach(key => key.removeEventListener('click', handleKeyPress));
    }

    function reiniciarJuego() {
        attempts = 0;
        currentAttempt = '';
        grid.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.style.backgroundColor = '#ffffff';
        });
        keys.forEach(key => {
            key.classList.remove('red-keys', 'green-keys');
        });

        document.querySelector('.reset-button').remove(); // Eliminar el botón de reinicio

        // Volver a agregar los event listeners a las teclas
        keys.forEach(key => key.addEventListener('click', handleKeyPress));
        actionKeys.forEach(key => key.addEventListener('click', handleKeyPress));

        obtenerPalabraAleatoria();
    }

    keys.forEach(key => key.addEventListener('click', handleKeyPress));
    actionKeys.forEach(key => key.addEventListener('click', handleKeyPress));

    obtenerPalabraAleatoria();
});
