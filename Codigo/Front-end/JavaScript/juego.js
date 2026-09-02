/* ============================================================================
   TELURIO — juego.js  (lógica de juego.html · Crucigrama)
   ----------------------------------------------------------------------------
   Motor del crucigrama:
     1. Genera el tablero a partir del nivel definido en datos.js.
     2. Valida palabra por palabra a medida que el alumno escribe.
     3. Corre el reloj (con multiplicador de tiempo si hay buffo activo).
     4. Suma átomos por palabra y bono de nivel (con buffo de puntos).
     5. Permite avanzar al siguiente nivel o salir.

   URL esperada: juego.html?curso=q3&semana=2&nivel=1  (todos opcionales)
   Requiere estado.js, datos.js y principal.js.

   TODO BACKEND: al completar un nivel se llama a Estado.marcarNivelCompleto();
   ahí está el punto para sincronizar puntaje y progreso con la API.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------- Lectura de parámetros ----------------------- */
    const parametros = new URLSearchParams(window.location.search);
    const numeroNivel = Math.min(
      Math.max(parseInt(parametros.get("nivel"), 10) || 1, 1),
      NIVELES_CRUCIGRAMA.length
    );
    const nivel = NIVELES_CRUCIGRAMA[numeroNivel - 1];

    // Curso y semana solo informativos (se conservan al pasar de nivel)
    const curso = parametros.get("curso") || "q3";
    const semana = parametros.get("semana") || "1";

    /* --------------------------- Nodos del DOM ----------------------------- */
    const tablero = document.getElementById("tablero");
    const listaHorizontales = document.getElementById("pistas-horizontales");
    const listaVerticales = document.getElementById("pistas-verticales");
    const nodoNivel = document.getElementById("valor-nivel");
    const nodoReloj = document.getElementById("reloj");
    const nodoPuntos = document.getElementById("valor-puntos");
    const nodoBuffo = document.getElementById("aviso-buffo");
    const botonSiguiente = document.getElementById("boton-siguiente-nivel");
    const modalFinal = document.getElementById("modal-final");
    const tituloFinal = document.getElementById("titulo-final");
    const textoFinal = document.getElementById("texto-final");
    const botonModalSiguiente = document.getElementById("boton-modal-siguiente");
    const botonModalSalir = document.getElementById("boton-modal-salir");

    /* ------------------------- Estado de la partida ------------------------ */
    const buffos = Estado.consumirBuffos(); // se consumen al empezar la partida
    let puntosPartida = 0;
    let segundosRestantes = Math.round(nivel.segundos * buffos.tiempo);
    let palabrasResueltas = 0;
    let partidaTerminada = false;
    let idIntervalo = null;

    // celdas[fila][col] = { input, letras: Set de palabras que pasan por acá }
    const celdas = {};

    nodoNivel.textContent = numeroNivel;
    nodoPuntos.textContent = "0";

    // Mostrar los buffos activos, si los hay
    const avisos = [];
    if (buffos.tiempo > 1) avisos.push(`⏱ tiempo ×${buffos.tiempo}`);
    if (buffos.puntos > 1) avisos.push(`⭐ puntos ×${buffos.puntos}`);
    if (avisos.length) {
      nodoBuffo.textContent = `Buffo activo: ${avisos.join(" · ")}`;
      nodoBuffo.hidden = false;
    }

    /* ========================================================================
       1. CONSTRUCCIÓN DEL TABLERO
       ===================================================================== */
    tablero.style.setProperty("--filas", nivel.filas);
    tablero.style.setProperty("--columnas", nivel.columnas);

    // Mapa de letras esperadas por celda: clave "fila-col" → letra correcta
    const letrasEsperadas = {};
    // Números que se dibujan en la celda inicial de cada palabra
    const numerosPorCelda = {};

    nivel.palabras.forEach((palabra) => {
      const claveInicio = `${palabra.fila}-${palabra.col}`;
      numerosPorCelda[claveInicio] = numerosPorCelda[claveInicio] || palabra.numero;

      [...palabra.palabra].forEach((letra, indice) => {
        const fila = palabra.dir === "V" ? palabra.fila + indice : palabra.fila;
        const col = palabra.dir === "H" ? palabra.col + indice : palabra.col;
        letrasEsperadas[`${fila}-${col}`] = letra;
      });
    });

    // Crear la rejilla completa (las celdas sin letra quedan vacías)
    for (let fila = 1; fila <= nivel.filas; fila++) {
      for (let col = 1; col <= nivel.columnas; col++) {
        const clave = `${fila}-${col}`;
        const celda = document.createElement("div");

        if (letrasEsperadas[clave]) {
          celda.className = "celda";

          if (numerosPorCelda[clave]) {
            const numero = document.createElement("span");
            numero.className = "numero-celda";
            numero.textContent = numerosPorCelda[clave];
            celda.appendChild(numero);
          }

          const input = document.createElement("input");
          input.type = "text";
          input.maxLength = 1;
          input.autocomplete = "off";
          input.dataset.fila = fila;
          input.dataset.col = col;
          input.setAttribute("aria-label", `Fila ${fila}, columna ${col}`);
          celda.appendChild(input);
          celdas[clave] = input;
        } else {
          celda.className = "celda vacia";
        }
        tablero.appendChild(celda);
      }
    }

    /* ========================================================================
       2. PISTAS
       ===================================================================== */
    const nodosPista = {}; // numero de palabra → <li>, para tacharla al resolver

    nivel.palabras.forEach((palabra) => {
      const item = document.createElement("li");
      item.value = palabra.numero; // conserva el número real en la lista
      item.textContent = palabra.pista;
      nodosPista[palabra.numero] = item;
      (palabra.dir === "H" ? listaHorizontales : listaVerticales).appendChild(item);
    });

    /* ========================================================================
       3. ESCRITURA Y NAVEGACIÓN POR TECLADO
       ===================================================================== */
    tablero.addEventListener("input", (ev) => {
      const input = ev.target;
      if (input.tagName !== "INPUT" || partidaTerminada) return;

      // Solo letras; se normaliza a mayúsculas sin tildes
      input.value = input.value
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zñA-ZÑ]/g, "")
        .toUpperCase();

      if (input.value) moverFoco(input, 1);
      verificarPalabras();
    });

    tablero.addEventListener("keydown", (ev) => {
      const input = ev.target;
      if (input.tagName !== "INPUT") return;

      const fila = parseInt(input.dataset.fila, 10);
      const col = parseInt(input.dataset.col, 10);

      const movimientos = {
        ArrowUp:    [fila - 1, col],
        ArrowDown:  [fila + 1, col],
        ArrowLeft:  [fila, col - 1],
        ArrowRight: [fila, col + 1],
      };

      if (movimientos[ev.key]) {
        ev.preventDefault();
        const destino = celdas[movimientos[ev.key].join("-")];
        if (destino) destino.focus();
      } else if (ev.key === "Backspace" && !input.value) {
        // Retroceso en celda vacía: volver a la anterior
        moverFoco(input, -1);
      }
    });

    /** Mueve el foco a la celda vecina siguiendo la dirección de escritura. */
    function moverFoco(input, paso) {
      const fila = parseInt(input.dataset.fila, 10);
      const col = parseInt(input.dataset.col, 10);
      // Primero intenta avanzar en horizontal; si no hay celda, prueba vertical
      const destino =
        celdas[`${fila}-${col + paso}`] || celdas[`${fila + paso}-${col}`];
      if (destino && !destino.disabled) destino.focus();
    }

    /* ========================================================================
       4. VALIDACIÓN PALABRA POR PALABRA
       ===================================================================== */
    function verificarPalabras() {
      nivel.palabras.forEach((palabra) => {
        if (palabra.resuelta) return;

        let escrita = "";
        let completa = true;
        const inputs = [];

        [...palabra.palabra].forEach((letraEsperada, indice) => {
          const fila = palabra.dir === "V" ? palabra.fila + indice : palabra.fila;
          const col = palabra.dir === "H" ? palabra.col + indice : palabra.col;
          const input = celdas[`${fila}-${col}`];
          inputs.push(input);
          if (!input.value) completa = false;
          escrita += input.value;
        });

        if (!completa) {
          // Mientras la palabra esté incompleta se limpia el estado de error
          inputs.forEach((i) => i.classList.remove("incorrecta"));
          return;
        }

        if (escrita === palabra.palabra) {
          resolverPalabra(palabra, inputs);
        } else {
          // Palabra completa pero incorrecta: se marca en rojo (sin bloquear)
          inputs.forEach((i) => {
            if (!i.classList.contains("correcta")) i.classList.add("incorrecta");
          });
        }
      });
    }

    function resolverPalabra(palabra, inputs) {
      palabra.resuelta = true;
      palabrasResueltas++;

      inputs.forEach((input) => {
        input.classList.remove("incorrecta");
        input.classList.add("correcta");
        input.disabled = true; // la palabra queda fijada
      });

      nodosPista[palabra.numero].classList.add("resuelta");

      // Puntaje: base por palabra × buffo de puntos
      const ganados = Math.round(PUNTAJE_JUEGO.porPalabra * buffos.puntos);
      puntosPartida += ganados;
      nodoPuntos.textContent = puntosPartida;
      window.mostrarAviso(`¡Correcto! +${ganados} átomos`);

      if (palabrasResueltas === nivel.palabras.length) {
        terminarPartida(true);
      }
    }

    /* ========================================================================
       5. RELOJ
       ===================================================================== */
    function pintarReloj() {
      const minutos = String(Math.floor(segundosRestantes / 60)).padStart(2, "0");
      const segundos = String(segundosRestantes % 60).padStart(2, "0");
      nodoReloj.textContent = `${minutos}:${segundos}`;

      nodoReloj.classList.toggle("advertencia", segundosRestantes <= 120 && segundosRestantes > 30);
      nodoReloj.classList.toggle("critico", segundosRestantes <= 30);
    }

    idIntervalo = setInterval(() => {
      segundosRestantes--;
      pintarReloj();
      if (segundosRestantes <= 0) terminarPartida(false);
    }, 1000);

    pintarReloj();

    /* ========================================================================
       6. FIN DE PARTIDA
       ===================================================================== */
    function terminarPartida(gano) {
      if (partidaTerminada) return;
      partidaTerminada = true;
      clearInterval(idIntervalo);

      // Deshabilitar el tablero completo
      Object.values(celdas).forEach((input) => (input.disabled = true));

      if (gano) {
        const bono = Math.round(PUNTAJE_JUEGO.bonoNivel * buffos.puntos);
        puntosPartida += bono;
        nodoPuntos.textContent = puntosPartida;

        Estado.sumarAtomos(puntosPartida);
        Estado.marcarNivelCompleto(numeroNivel); // TODO BACKEND: sincronizar
        window.actualizarContadorAtomos();

        tituloFinal.textContent = "¡Nivel completado! 🎉";
        textoFinal.textContent =
          `Resolviste las ${nivel.palabras.length} palabras y ganaste ` +
          `${puntosPartida} átomos (incluye bono de nivel +${bono}).`;

        const hayOtroNivel = numeroNivel < NIVELES_CRUCIGRAMA.length;
        botonModalSiguiente.hidden = !hayOtroNivel;
        botonSiguiente.disabled = !hayOtroNivel;
      } else {
        // Se acabó el tiempo: se conservan los puntos ya ganados
        Estado.sumarAtomos(puntosPartida);
        window.actualizarContadorAtomos();

        tituloFinal.textContent = "¡Se acabó el tiempo! ⏱";
        textoFinal.textContent =
          `Resolviste ${palabrasResueltas} de ${nivel.palabras.length} palabras ` +
          `y sumaste ${puntosPartida} átomos. ¡Podés reintentar el nivel!`;
        botonModalSiguiente.hidden = true;
      }

      modalFinal.showModal();
    }

    /* ========================================================================
       7. NAVEGACIÓN ENTRE NIVELES
       ===================================================================== */
    function irANivel(destino) {
      window.location.href =
        `juego.html?curso=${curso}&semana=${semana}&nivel=${destino}`;
    }

    botonSiguiente.addEventListener("click", () => {
      if (numeroNivel < NIVELES_CRUCIGRAMA.length) irANivel(numeroNivel + 1);
    });

    botonModalSiguiente.addEventListener("click", () => {
      irANivel(numeroNivel + 1);
    });

    botonModalSalir.addEventListener("click", () => {
      window.location.href = "inicio.html";
    });

    // "Siguiente nivel" queda deshabilitado hasta completar el actual
    botonSiguiente.disabled = true;
  });
})();
