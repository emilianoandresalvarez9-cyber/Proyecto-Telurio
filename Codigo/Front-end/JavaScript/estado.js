/* ============================================================================
   TELURIO — estado.js
   ----------------------------------------------------------------------------
   Capa de estado del front-end. Hoy persiste en localStorage para que el sitio
   sea 100% funcional sin servidor; TODAS las funciones están pensadas para que
   el back-end las reemplace por llamadas fetch() a su API.

   >>> PUNTOS DE INTEGRACIÓN PARA EL BACK-END (buscar "TODO BACKEND") <<<
   ========================================================================== */

const Estado = (() => {
  "use strict";

  // Claves usadas en localStorage (prefijadas para no chocar con otras apps)
  const CLAVES = {
    usuario:   "telurio_usuario",     // nombre del alumno con sesión iniciada
    recordar:  "telurio_recordar",    // preferencia "recordarme"
    atomos:    "telurio_atomos",      // moneda del juego
    compras:   "telurio_compras",     // ids de productos comprados (JSON)
    buffos:    "telurio_buffos",      // buffos pendientes de consumir (JSON)
    progreso:  "telurio_progreso",    // niveles completados (JSON)
    temasForo: "telurio_temas_foro",  // temas creados por el usuario (JSON)
  };

  const ATOMOS_INICIALES = 35; // valor de arranque, igual que en la maqueta

  /* ------------------------------ Utilidades ------------------------------ */

  function leerJSON(clave, porDefecto) {
    try {
      const crudo = localStorage.getItem(clave);
      return crudo ? JSON.parse(crudo) : porDefecto;
    } catch {
      return porDefecto;
    }
  }

  function guardarJSON(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  /* ------------------------------- Sesión --------------------------------- */

  /**
   * Inicia sesión de forma local (demo).
   * TODO BACKEND: reemplazar el cuerpo por
   *   const resp = await fetch("/api/sesion", { method:"POST", body: JSON.stringify({usuario, contrasena}) })
   * y guardar el token/cookie que devuelva el servidor.
   */
  function iniciarSesion(usuario, recordar) {
    localStorage.setItem(CLAVES.usuario, usuario);
    localStorage.setItem(CLAVES.recordar, recordar ? "1" : "0");
    if (localStorage.getItem(CLAVES.atomos) === null) {
      localStorage.setItem(CLAVES.atomos, String(ATOMOS_INICIALES));
    }
  }

  /** Cierra la sesión y limpia solo los datos de identidad (no el progreso). */
  function cerrarSesion() {
    // TODO BACKEND: invalidar el token/cookie de sesión en el servidor.
    localStorage.removeItem(CLAVES.usuario);
  }

  /** Devuelve el nombre del usuario o null si no hay sesión. */
  function obtenerUsuario() {
    return localStorage.getItem(CLAVES.usuario);
  }

  /**
   * Protege las páginas internas: si no hay sesión, redirige al ingreso.
   * Llamar al inicio de cada página interna.
   */
  function exigirSesion() {
    if (!obtenerUsuario()) {
      window.location.href = "index.html";
    }
  }

  /* ---------------------------- Átomos (moneda) --------------------------- */

  /** Lee el saldo actual de átomos. TODO BACKEND: GET /api/usuario/atomos */
  function obtenerAtomos() {
    const valor = parseInt(localStorage.getItem(CLAVES.atomos), 10);
    return Number.isFinite(valor) ? valor : ATOMOS_INICIALES;
  }

  /** Suma átomos (nunca deja el saldo negativo). TODO BACKEND: POST /api/usuario/atomos */
  function sumarAtomos(cantidad) {
    const nuevo = Math.max(0, obtenerAtomos() + cantidad);
    localStorage.setItem(CLAVES.atomos, String(nuevo));
    return nuevo;
  }

  /**
   * Intenta gastar átomos. Devuelve true si alcanzó el saldo.
   * TODO BACKEND: la validación real del saldo debe hacerse en el servidor.
   */
  function gastarAtomos(cantidad) {
    if (obtenerAtomos() < cantidad) return false;
    sumarAtomos(-cantidad);
    return true;
  }

  /* ------------------------------- Tienda --------------------------------- */

  /** Ids de productos ya comprados. TODO BACKEND: GET /api/usuario/compras */
  function obtenerCompras() {
    return leerJSON(CLAVES.compras, []);
  }

  function registrarCompra(idProducto) {
    const compras = obtenerCompras();
    if (!compras.includes(idProducto)) {
      compras.push(idProducto);
      guardarJSON(CLAVES.compras, compras);
    }
  }

  /* --------------------- Buffos (mejoras consumibles) --------------------- */
  /* Un buffo comprado queda "pendiente" y se consume en la próxima partida.  */

  function obtenerBuffos() {
    return leerJSON(CLAVES.buffos, { tiempo: 1, puntos: 1 });
  }

  function guardarBuffos(buffos) {
    guardarJSON(CLAVES.buffos, buffos);
  }

  /** Activa un multiplicador ("tiempo" o "puntos") para la próxima partida. */
  function activarBuffo(tipo, multiplicador) {
    const buffos = obtenerBuffos();
    buffos[tipo] = Math.max(buffos[tipo], multiplicador);
    guardarBuffos(buffos);
  }

  /** El juego llama a esto al empezar: devuelve los buffos y los consume. */
  function consumirBuffos() {
    const buffos = obtenerBuffos();
    guardarBuffos({ tiempo: 1, puntos: 1 });
    return buffos;
  }

  /* ------------------------------ Progreso -------------------------------- */

  /** Niveles del crucigrama completados, ej.: [1, 2]. */
  function obtenerProgreso() {
    return leerJSON(CLAVES.progreso, []);
  }

  function marcarNivelCompleto(nivel) {
    const progreso = obtenerProgreso();
    if (!progreso.includes(nivel)) {
      progreso.push(nivel);
      guardarJSON(CLAVES.progreso, progreso);
    }
    // TODO BACKEND: POST /api/progreso { nivel, puntos } para sincronizar.
  }

  /* -------------------------------- Foro ---------------------------------- */

  /** Temas creados por el usuario en este navegador (se suman a los de demo). */
  function obtenerTemasForo() {
    return leerJSON(CLAVES.temasForo, []);
  }

  function agregarTemaForo(tema) {
    const temas = obtenerTemasForo();
    temas.unshift(tema); // el más nuevo primero
    guardarJSON(CLAVES.temasForo, temas);
    // TODO BACKEND: POST /api/foro/temas
  }

  /* API pública del módulo */
  return {
    iniciarSesion,
    cerrarSesion,
    obtenerUsuario,
    exigirSesion,
    obtenerAtomos,
    sumarAtomos,
    gastarAtomos,
    obtenerCompras,
    registrarCompra,
    activarBuffo,
    obtenerBuffos,
    consumirBuffos,
    obtenerProgreso,
    marcarNivelCompleto,
    obtenerTemasForo,
    agregarTemaForo,
  };
})();
