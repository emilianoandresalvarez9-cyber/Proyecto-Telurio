/* ============================================================================
   TELURIO — principal.js
   ----------------------------------------------------------------------------
   Comportamiento compartido por todas las páginas internas:
     1. Protección de sesión (redirige a index.html si no hay usuario).
     2. Contador de átomos en la cabecera.
     3. Menú lateral deslizante en móvil.
     4. Menú desplegable del usuario (perfil / cerrar sesión).
     5. Aviso flotante reutilizable (window.mostrarAviso).
   Requiere que estado.js esté cargado antes.
   ========================================================================== */

(function () {
  "use strict";

  /* 1. Sesión obligatoria en páginas internas ------------------------------ */
  Estado.exigirSesion();

  document.addEventListener("DOMContentLoaded", () => {

    /* 2. Contador de átomos ------------------------------------------------ */
    actualizarContadorAtomos();

    /* 3. Menú lateral en móvil --------------------------------------------- */
    const botonMenu = document.getElementById("boton-menu");
    const menuLateral = document.getElementById("menu-lateral");
    const telon = document.getElementById("telon-menu");

    function alternarMenu(abrir) {
      const estaAbierto = abrir ?? !menuLateral.classList.contains("abierto");
      menuLateral.classList.toggle("abierto", estaAbierto);
      telon.classList.toggle("visible", estaAbierto);
      botonMenu.setAttribute("aria-expanded", String(estaAbierto));
    }

    if (botonMenu && menuLateral && telon) {
      botonMenu.addEventListener("click", () => alternarMenu());
      telon.addEventListener("click", () => alternarMenu(false));
      // Cerrar con la tecla Escape
      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") alternarMenu(false);
      });
    }

    /* 4. Menú del usuario -------------------------------------------------- */
    const botonUsuario = document.getElementById("boton-usuario");
    const desplegable = document.getElementById("desplegable-usuario");

    if (botonUsuario && desplegable) {
      // Mostrar el nombre del alumno en el desplegable
      const nodoNombre = desplegable.querySelector(".nombre-usuario");
      if (nodoNombre) nodoNombre.textContent = Estado.obtenerUsuario() || "Alumno";

      botonUsuario.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const abierto = desplegable.classList.toggle("abierto");
        botonUsuario.setAttribute("aria-expanded", String(abierto));
      });

      // Cerrar al hacer clic fuera
      document.addEventListener("click", () => desplegable.classList.remove("abierto"));
      desplegable.addEventListener("click", (ev) => ev.stopPropagation());

      const botonSalir = document.getElementById("boton-cerrar-sesion");
      if (botonSalir) {
        botonSalir.addEventListener("click", () => {
          Estado.cerrarSesion();
          window.location.href = "index.html";
        });
      }
    }
  });

  /* 2b. Función global para refrescar el contador (la usan tienda y juego) - */
  window.actualizarContadorAtomos = function () {
    const nodo = document.getElementById("valor-atomos");
    if (nodo) nodo.textContent = Estado.obtenerAtomos();
  };

  /* 5. Aviso flotante reutilizable ----------------------------------------- */
  let temporizadorAviso = null;
  window.mostrarAviso = function (mensaje) {
    let aviso = document.getElementById("aviso-flotante");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "aviso-flotante";
      aviso.className = "aviso-flotante";
      aviso.setAttribute("role", "status");
      document.body.appendChild(aviso);
    }
    aviso.textContent = mensaje;
    aviso.classList.add("visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2600);
  };
})();
