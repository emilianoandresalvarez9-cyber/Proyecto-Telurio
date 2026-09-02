/* ============================================================================
   TELURIO — foro.js  (lógica de foro.html)
   ----------------------------------------------------------------------------
   Lista los temas del foro y permite crear temas nuevos con un formulario.
   Los temas creados se guardan en el navegador (Estado) hasta que exista la
   API. Requiere estado.js, datos.js y principal.js.
   TODO BACKEND: GET/POST /api/foro/temas
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const cuerpoTabla = document.getElementById("cuerpo-temas");
    const botonNuevoTema = document.getElementById("boton-nuevo-tema");
    const formulario = document.getElementById("formulario-tema");
    const campoTitulo = document.getElementById("campo-titulo-tema");
    const campoDetalle = document.getElementById("campo-detalle-tema");
    const botonCancelar = document.getElementById("boton-cancelar-tema");

    /* ------------------------- Pintar los temas --------------------------- */
    function pintarTemas() {
      // Los temas del usuario van primero, seguidos por los de demostración
      const temas = [...Estado.obtenerTemasForo(), ...TEMAS_FORO_DEMO];
      cuerpoTabla.innerHTML = "";

      temas.forEach((tema) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>
            <span class="titulo-tema">${escaparHTML(tema.titulo)}</span>
            <p class="detalle-tema">${escaparHTML(tema.detalle)}</p>
          </td>
          <td>${escaparHTML(tema.autor)}</td>
          <td><span class="contador-respuestas">${tema.respuestas}</span></td>
        `;
        cuerpoTabla.appendChild(fila);
      });
    }

    /* --------------------- Formulario de nuevo tema ------------------------ */
    botonNuevoTema.addEventListener("click", () => {
      formulario.classList.toggle("visible");
      if (formulario.classList.contains("visible")) campoTitulo.focus();
    });

    botonCancelar.addEventListener("click", () => {
      formulario.classList.remove("visible");
      formulario.reset();
    });

    formulario.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const titulo = campoTitulo.value.trim();
      const detalle = campoDetalle.value.trim();
      if (!titulo || !detalle) return; // los campos son required, doble control

      const nuevoTema = {
        titulo,
        detalle,
        autor: Estado.obtenerUsuario() || "Alumno",
        respuestas: 0,
      };

      Estado.agregarTemaForo(nuevoTema); // TODO BACKEND: POST /api/foro/temas
      formulario.reset();
      formulario.classList.remove("visible");
      pintarTemas();
      window.mostrarAviso("¡Tema publicado en el foro!");
    });

    /** Evita inyección de HTML en el contenido escrito por el usuario. */
    function escaparHTML(texto) {
      const div = document.createElement("div");
      div.textContent = texto;
      return div.innerHTML;
    }

    pintarTemas();
  });
})();
