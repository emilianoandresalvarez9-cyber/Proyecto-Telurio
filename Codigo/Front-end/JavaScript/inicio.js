/* ============================================================================
   TELURIO — inicio.js  (lógica de inicio.html)
   ----------------------------------------------------------------------------
   Pinta el saludo, las métricas del bimestre y las actividades pendientes.
   Requiere estado.js, datos.js y principal.js.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    /* Saludo personalizado ------------------------------------------------- */
    const usuario = Estado.obtenerUsuario() || "Alumno";
    document.getElementById("saludo-alumno").textContent = `¡Hola, ${usuario}!`;

    /* Métricas del bimestre (TODO BACKEND: GET /api/alumno/progreso) ------- */
    document.getElementById("valor-clases-hechas").textContent = PROGRESO_BIMESTRE.hechas;
    document.getElementById("valor-clases-faltantes").textContent = PROGRESO_BIMESTRE.faltantes;

    /* Actividades pendientes ------------------------------------------------ */
    const contenedor = document.getElementById("rejilla-actividades");

    ACTIVIDADES_PENDIENTES.forEach((actividad) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta-actividad";
      if (actividad.estado === "bloqueada") tarjeta.classList.add("bloqueada");

      // Icono según el estado (imágenes provistas por el diseño original)
      let icono = "";
      let accion = "";

      if (actividad.estado === "hecha") {
        icono = `<img src="img/verificacion.png" alt="Actividad completada">`;
        accion = `<span class="semana-actividad">¡Completada!</span>`;
      } else if (actividad.estado === "disponible") {
        icono = `<img src="img/candado-abierto.png" alt="Actividad desbloqueada">`;
        accion = `<a class="btn btn-chico" href="juego.html?curso=${actividad.curso}&semana=${actividad.semana}">Jugar</a>`;
      } else {
        icono = `<img src="img/candado-cerrado.png" alt="Actividad bloqueada">`;
        accion = `<span class="semana-actividad">Disponible pronto</span>`;
      }

      tarjeta.innerHTML = `
        <h3 class="cabeza-actividad">${actividad.materia}</h3>
        <div class="cuerpo-actividad">
          ${icono}
          <span class="semana-actividad">Semana ${actividad.semana}</span>
          ${accion}
        </div>
      `;
      contenedor.appendChild(tarjeta);
    });
  });
})();
