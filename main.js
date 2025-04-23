// Referencias DOM
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const estado  = document.getElementById("estado");
const pista   = document.getElementById("pista");
const bus1    = document.getElementById("bus1");
const bus2    = document.getElementById("bus2");
const audioStart  = document.getElementById("audioStart");
const audioFinish = document.getElementById("audioFinish");

// Configuración
const RACE_DURATION = 26_000;     // ms
const SPEED_INTERVAL = 1_000;     // cambiar velocidad cada 1s
const MIN_SPEED = 20;   // px/seg
const MAX_SPEED = 100;  // px/seg

// Estado mutable
let startTime = 0,
    lastFrame = 0,
    rafId     = null,
    speedInt  = null,
    speed1    = 0,
    speed2    = 0,
    pos1       = 0,
    pos2       = 0,
    finishLine = 0,
    finished   = false;

// Genera velocidad aleatoria en [min,max]
function randSpeed(min, max) {
  return Math.random() * (max - min) + min;
}

function initRace() {
  // Reset posiciones y estado
  pos1 = pos2 = 0;
  bus1.style.transform = bus2.style.transform = "translateX(0)";
  estado.textContent = "¡Carrera iniciada!";
  finished = false;

  // Calcular meta en px
  finishLine = pista.clientWidth - bus1.clientWidth;

  // Velocidades iniciales
  speed1 = randSpeed(MIN_SPEED, MAX_SPEED);
  speed2 = randSpeed(MIN_SPEED, MAX_SPEED);

  // Reproducir sonido de salida
  audioStart.currentTime = 0;
  audioStart.play();

  // Tiempos
  startTime = lastFrame = performance.now();

  // Cambiar velocidad cada segundo
  speedInt = setInterval(() => {
    speed1 = randSpeed(MIN_SPEED, MAX_SPEED);
    speed2 = randSpeed(MIN_SPEED, MAX_SPEED);
  }, SPEED_INTERVAL);

  // Iniciar bucle de animación
  rafId = requestAnimationFrame(animate);
}

function animate(now) {
  const elapsed = now - startTime;
  const delta   = now - lastFrame;

  // Mover buses
  pos1 += speed1 * (delta / 1000);
  pos2 += speed2 * (delta / 1000);
  bus1.style.transform = `translateX(${pos1}px)`;
  bus2.style.transform = `translateX(${pos2}px)`;

  // Determinar líder
  if (!finished) {
    if (pos1 > pos2)      estado.textContent = "Lidera Berlinave";
    else if (pos2 > pos1) estado.textContent = "Lidera Brasilia";
    else                  estado.textContent = "Empate momentáneo";
  }

  // ¿Alguien alcanza la meta?
  if (!finished && (pos1 >= finishLine || pos2 >= finishLine)) {
    finished = true;
    const winner = pos1 >= finishLine && pos1 > pos2
                 ? "Berlinave" 
                 : pos2 >= finishLine && pos2 > pos1
                   ? "Brasilia"
                   : pos1 > pos2 
                     ? "Berlinave"
                     : "Brasilia";
    endRace(winner);
    return;
  }

  // ¿Se acabó el tiempo?
  if (!finished && elapsed >= RACE_DURATION) {
    finished = true;
    const winner = pos1 > pos2 ? "Berlinave" 
                   : pos2 > pos1 ? "Brasilia" 
                   : "¡Empate!";
    endRace(winner);
    return;
  }

  lastFrame = now;
  rafId = requestAnimationFrame(animate);
}

function endRace(winner) {
  cancelAnimationFrame(rafId);
  clearInterval(speedInt);
  estado.textContent = winner === "¡Empate!" 
                    ? "¡Ha sido un empate!" 
                    : `¡${winner} gana la carrera!`;
  audioStart.pause()
  audioFinish.currentTime = 0;
  audioFinish.play();
  resetBtn.disabled = false;
}

function resetRace() {
  cancelAnimationFrame(rafId);
  clearInterval(speedInt);
  pos1 = pos2 = 0;
  bus1.style.transform = bus2.style.transform = "translateX(0)";
  estado.textContent = "Pulsa “Iniciar carrera” para empezar";
  resetBtn.disabled = true;
  startBtn.disabled = false;
  audioStart.pause()
  audioStart.currentTime = 0
  audioFinish.pause()
  audioFinish.currentTime = 0;
}

// Eventos de botones
startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  resetBtn.disabled = true;
  initRace();
});
resetBtn.addEventListener("click", () => {
  resetRace();
});