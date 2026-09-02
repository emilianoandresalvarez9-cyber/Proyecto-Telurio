/* ============================================================================
   TELURIO — clase-detalle.js  (lógica de clase-detalle.html)
   ----------------------------------------------------------------------------
   La página recibe el curso por parámetro de URL: clase-detalle.html?curso=q3
   y dibuja la rejilla de semanas del bimestre. Las semanas sin contenido se
   muestran bloqueadas con candado.
   Requiere estado.js, datos.js y principal.js.
   TODO BACKEND: GET /api/cursos/{id}/semanas
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const parametros = new URLSearchParams(window.location.search);
    const idCurso = parametros.get("curso") || "q3";
    const curso = CURSOS[idCurso] || CURSOS.q3;

    /* Encabezado del curso -------------------------------------------------- */
    document.getElementById("nombre-curso").textContent =
      `${curso.nombre} (${curso.ciclo})`;
    document.getElementById("profesor-curso").textContent = curso.profesor;
    document.title = `${curso.nombre} · Telurio`;

    /* Rejilla de semanas ---------------------------------------------------- */
    const rejilla = document.getElementById("rejilla-semanas");

    for (let semana = 1; semana <= curso.totalSemanas; semana++) {
      const desbloqueada = semana <= curso.semanasDesbloqueadas;
      const tarjeta = document.createElement("article");
      tarjeta.className = `tarjeta-semana${desbloqueada ? "" : " bloqueada"}`;

      if (desbloqueada) {
        tarjeta.innerHTML = `
          <h3>semana ${semana}</h3>
          <a class="btn btn-claro btn-chico"
             href="juego.html?curso=${curso.id}&semana=${semana}">
             Practicar
          </a>
        `;
      } else {
        tarjeta.innerHTML = `
          <h3>semana ${semana}</h3>
          <img class="icono-candado" src="img/candado-cerrado.png"
               alt="Semana bloqueada">
        `;
      }
      rejilla.appendChild(tarjeta);
    }
  });
})();
