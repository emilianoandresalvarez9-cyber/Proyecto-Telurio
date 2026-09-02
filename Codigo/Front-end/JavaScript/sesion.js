/* ============================================================================
   TELURIO — sesion.js  (lógica de index.html)
   ----------------------------------------------------------------------------
   Maneja el formulario de ingreso y los botones de proveedores externos.
   Requiere estado.js.

   >>> TODO BACKEND <<<
   - Formulario: reemplazar la validación local por un fetch a POST /api/sesion.
   - Google: inicializar Google Identity Services con el client_id real:
       https://developers.google.com/identity/gsi/web
     El botón #boton-google ya está identificado para engancharlo.
   - Microsoft: ídem con MSAL (Microsoft Authentication Library).
   ========================================================================== */

(function () {
  "use strict";

  // Si ya hay sesión iniciada, saltar directo al panel
  if (Estado.obtenerUsuario()) {
    window.location.href = "inicio.html";
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-sesion");
    const campoUsuario = document.getElementById("campo-usuario");
    const campoContrasena = document.getElementById("campo-contrasena");
    const casillaRecordar = document.getElementById("casilla-recordarme");
    const mensajeError = document.getElementById("mensaje-error-sesion");

    /* --------------------- Ingreso con usuario y contraseña --------------- */
    formulario.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const usuario = campoUsuario.value.trim();
      const contrasena = campoContrasena.value;

      // Validación mínima del lado del cliente
      if (usuario.length < 3) {
        mostrarError("Ingresá un usuario de al menos 3 caracteres.");
        campoUsuario.focus();
        return;
      }
      if (contrasena.length < 4) {
        mostrarError("La contraseña debe tener al menos 4 caracteres.");
        campoContrasena.focus();
        return;
      }

      /* TODO BACKEND: validar credenciales contra la base de datos:
         const respuesta = await fetch("/api/sesion", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ usuario, contrasena }),
         });
         if (!respuesta.ok) { mostrarError("Usuario o contraseña incorrectos."); return; }
      */

      Estado.iniciarSesion(usuario, casillaRecordar.checked);
      window.location.href = "inicio.html"; // redirección al panel del alumno
    });

    /* ----------------------- Proveedores externos ------------------------- */
    // TODO BACKEND: conectar con Google Identity Services (OAuth 2.0).
    document.getElementById("boton-google").addEventListener("click", () => {
      avisarProveedor("Google");
    });

    // TODO BACKEND: conectar con MSAL / cuenta de Microsoft.
    document.getElementById("boton-microsoft").addEventListener("click", () => {
      avisarProveedor("Microsoft");
    });

    /**
     * Demostración: mientras no exista la API, el ingreso con proveedor crea
     * una sesión de invitado para poder recorrer el sitio.
     */
    function avisarProveedor(nombre) {
      const continuar = window.confirm(
        `El ingreso con ${nombre} se conectará con el back-end.\n` +
        `¿Querés entrar como "Alumno1" para probar el sitio?`
      );
      if (continuar) {
        Estado.iniciarSesion("Alumno1", true);
        window.location.href = "inicio.html";
      }
    }

    function mostrarError(texto) {
      mensajeError.textContent = texto;
      mensajeError.classList.add("visible");
    }

    // Ocultar el error cuando el alumno vuelve a escribir
    [campoUsuario, campoContrasena].forEach((campo) =>
      campo.addEventListener("input", () => mensajeError.classList.remove("visible"))
    );
  });
})();
