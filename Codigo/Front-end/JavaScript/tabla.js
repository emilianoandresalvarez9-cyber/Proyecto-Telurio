/* ============================================================================
   TELURIO — tabla.js  (lógica de tabla.html)
   ----------------------------------------------------------------------------
   Dibuja la Tabla de Competición a partir de RANKING (datos.js) y resalta al
   usuario con sesión iniciada. Requiere estado.js, datos.js y principal.js.
   TODO BACKEND: reemplazar RANKING por GET /api/tabla?curso=...
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("lista-ranking");
    const usuarioActual = Estado.obtenerUsuario();

    // Orden defensivo por puntos, de mayor a menor
    const ordenado = [...RANKING].sort((a, b) => b.puntos - a.puntos);

    ordenado.forEach((alumno, indice) => {
      const puesto = indice + 1;
      const fila = document.createElement("li");
      fila.className = `fila-ranking${puesto <= 3 ? ` puesto-${puesto}` : ""}`;
      if (alumno.nombre === usuarioActual) fila.classList.add("es-usuario");

      // El multiplicador solo se muestra si el alumno tiene uno activo
      const multiplicador = alumno.multiplicador
        ? `<span class="multiplicador-ranking">×${alumno.multiplicador}</span>`
        : `<span class="multiplicador-ranking" style="visibility:hidden">×1</span>`;

      fila.innerHTML = `
        <span class="numero-ranking">${puesto}</span>
        <img class="avatar-ranking" src="img/usuario-icono.png" alt="">
        <span class="nombre-ranking">${alumno.nombre}</span>
        ${multiplicador}
        <span class="puntos-ranking">${alumno.puntos.toLocaleString("es-AR")} pts</span>
      `;
      lista.appendChild(fila);
    });
  });
})();
