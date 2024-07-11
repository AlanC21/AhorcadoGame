// Variables globales
let palabra = '';
let palabraOculta = '';
let intentos = 6;
const letrasUsadas = new Set();

// Elementos del DOM
const btnEmpezar = document.getElementById('btnEmpezar');
const btnReiniciar = document.getElementById('btnReiniciar');
const introduccion = document.getElementById('introduccion');
const juegoContainer = document.getElementById('juego');
const vidasRestantes = document.getElementById('vidas-restantes');
const teclaSonido = document.getElementById('tecla-sonido');

// Función para normalizar texto (quitar acentos y caracteres especiales)
function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Función para obtener una palabra aleatoria
async function obtenerPalabra() {
    try {
        const respuesta = await fetch('https://random-word-api.herokuapp.com/word?lang=es');
        const [palabraAleatoria] = await respuesta.json();
        return normalizarTexto(palabraAleatoria.toUpperCase());
    } catch (error) {
        console.error('Error al obtener la palabra:', error);
        return 'PROGRAMACION'; // Palabra por defecto en caso de error
    }
}

// Función para inicializar el juego
async function iniciarJuego() {
    introduccion.style.display = 'none';
    juegoContainer.style.display = 'block';
    btnReiniciar.style.display = 'none';
    vidasRestantes.style.display = 'block';
    
    palabra = await obtenerPalabra();
    palabraOculta = palabra.split('').map(letra => letra === ' ' ? ' ' : '_').join('');
    intentos = 6;
    letrasUsadas.clear();
    
    actualizarPalabra();
    crearTeclado();
    dibujarAhorcado();
    mostrarMensaje('');
    actualizarVidasRestantes();

    document.addEventListener('keydown', manejarTeclaFisica);
}

// Función para reiniciar el juego
async function reiniciarJuego() {
    // Reiniciar todas las variables y el estado del juego
    palabra = await obtenerPalabra();
    palabraOculta = palabra.split('').map(letra => letra === ' ' ? ' ' : '_').join('');
    intentos = 6;
    letrasUsadas.clear();
    
    actualizarPalabra();
    crearTeclado();
    dibujarAhorcado();
    mostrarMensaje('');
    actualizarVidasRestantes();
}

// Función para actualizar la palabra oculta en la pantalla
function actualizarPalabra() {
    document.getElementById('palabra').textContent = palabraOculta;
}

// Función para crear el teclado virtual
function crearTeclado() {
    const teclado = document.getElementById('teclado');
    teclado.innerHTML = ''; // Limpiar teclado existente
    
    const letras = 'ABCDEFGHIJKLMNÑOPQRST';
    const ultimasFila = 'UVWXYZ';

    // Crear las primeras tres filas
    for (let i = 0; i < letras.length; i++) {
        const letra = letras[i];
        const boton = document.createElement('button');
        boton.textContent = letra;
        boton.className = 'tecla';
        boton.addEventListener('click', () => {
            intentarLetra(letra); 
            reproducirSonidoTecla();
        });
        teclado.appendChild(boton);
    }

    // Crear la última fila
    const ultimaFila = document.createElement('div');
    ultimaFila.className = 'ultima-fila';

    // Añadir el resto de las letras de la última fila
    for (let i = 0; i < ultimasFila.length; i++) {
        const letra = ultimasFila[i];
        const boton = document.createElement('button');
        boton.textContent = letra;
        boton.className = 'tecla';
        boton.addEventListener('click', () => {
            intentarLetra(letra);
            reproducirSonidoTecla();
        });
        ultimaFila.appendChild(boton);
    }

    teclado.appendChild(ultimaFila);
}

function reproducirSonidoTecla() {
    teclaSonido.currentTime = 0;
    teclaSonido.play();
}

// Función para manejar la tecla física presionada
function manejarTeclaFisica(event) {
    const letra = event.key.toUpperCase();
    if (/^[A-Z]$/.test(letra)) {
        intentarLetra(letra);
        reproducirSonidoTecla();
    }
}

// Función para manejar el intento de una letra
function intentarLetra(letra) {
    letra = normalizarTexto(letra);
    if (letrasUsadas.has(letra)) return;
    letrasUsadas.add(letra);

    if (normalizarTexto(palabra).includes(letra)) {
        actualizarPalabraOculta(letra);
    } else {
        intentos--;
        dibujarAhorcado();
        actualizarVidasRestantes();
    }

    actualizarPalabra();
    verificarEstadoJuego();
    deshabilitarTecla(letra);
}

// Función para actualizar el contador de vidas restantes
function actualizarVidasRestantes() {
    vidasRestantes.textContent = `Vidas restantes: ${intentos}`;
}

// Función para actualizar la palabra oculta con la letra adivinada
function actualizarPalabraOculta(letra) {
    palabraOculta = palabraOculta.split('').map((char, index) => 
        palabra[index] === letra ? letra : char
    ).join('');
}

// Función para verificar el estado del juego
function verificarEstadoJuego() {
    if (palabraOculta === palabra) {
        mostrarMensaje('¡Felicidades! Has ganado.');
        finalizarJuego();
    } else if (intentos === 0) {
        mostrarMensaje(`Game Over. La palabra era: ${palabra}`);
        finalizarJuego();
    }
}

// Función para mostrar mensajes
function mostrarMensaje(mensaje) {
    document.getElementById('mensaje').textContent = mensaje;
}

// Función para deshabilitar una tecla
function deshabilitarTecla(letra) {
    const teclas = document.querySelectorAll('.tecla');
    teclas.forEach(tecla => {
        if (tecla.textContent === letra) {
            tecla.disabled = true;
        }
    });
}

// Función para deshabilitar todo el teclado
function deshabilitarTeclado() {
    const teclas = document.querySelectorAll('.tecla');
    teclas.forEach(tecla => tecla.disabled = true);
}

// Función para dibujar el ahorcado
function dibujarAhorcado() {
    const canvas = document.getElementById('ahorcado');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Dibujar base
    ctx.beginPath();
    ctx.moveTo(20, 180);
    ctx.lineTo(180, 180);
    ctx.moveTo(40, 180);
    ctx.lineTo(40, 20);
    ctx.moveTo(40, 20);
    ctx.lineTo(100, 20);
    ctx.moveTo(100, 20);
    ctx.lineTo(100, 40);
    ctx.stroke();

    if (intentos < 6) {
        // Dibujar cabeza
        ctx.beginPath();
        ctx.arc(100, 60, 20, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (intentos < 5) {
        // Dibujar cuerpo
        ctx.beginPath();
        ctx.moveTo(100, 80);
        ctx.lineTo(100, 130);
        ctx.stroke();
    }

    if (intentos < 4) {
        // Dibujar brazo izquierdo
        ctx.beginPath();
        ctx.moveTo(100, 80);
        ctx.lineTo(70, 100);
        ctx.stroke();
    }

    if (intentos < 3) {
        // Dibujar brazo derecho
        ctx.beginPath();
        ctx.moveTo(100, 80);
        ctx.lineTo(130, 100);
        ctx.stroke();
    }

    if (intentos < 2) {
        // Dibujar pierna izquierda
        ctx.beginPath();
        ctx.moveTo(100, 130);
        ctx.lineTo(80, 160);
        ctx.stroke();
    }

    if (intentos < 1) {
        // Dibujar pierna derecha
        ctx.beginPath();
        ctx.moveTo(100, 130);
        ctx.lineTo(120, 160);
        ctx.stroke();
    }
}

// Función para finalizar el juego
function finalizarJuego() {
    deshabilitarTeclado();
    btnReiniciar.style.display = 'inline-block';
    document.removeEventListener('keydown', manejarTeclaFisica);
}

// Event Listeners
btnEmpezar.addEventListener('click', iniciarJuego);
btnReiniciar.addEventListener('click', iniciarJuego);

// Inicialmente, ocultamos el contador de vidas
vidasRestantes.style.display = 'none';