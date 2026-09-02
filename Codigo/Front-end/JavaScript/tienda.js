/* ============================================================================
   TELURIO — tienda.js  (lógica de tienda.html)
   ----------------------------------------------------------------------------
   Pinta el catálogo (buffos + skins), gestiona compras contra el saldo de
   átomos y muestra el modal del "Cargador de puntos".
   Requiere estado.js, datos.js y principal.js.
   TODO BACKEND:
     - Catálogo: GET /api/tienda/productos
     - Compra:   POST /api/tienda/compras { idProducto }  (validar saldo en servidor)
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const rejillaBuffos = document.getElementById("rejilla-buffos");
    const rejillaSkins = document.getElementById("rejilla-skins");

    /* ------------------------------- Buffos -------------------------------- */
    PRODUCTOS_TIENDA.buffos.forEach((producto) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta-producto";
      tarjeta.innerHTML = `
        <h3 class="cabeza-producto">${producto.titulo}</h3>
        <div class="cuerpo-producto">
          <img class="icono-producto"
               src="${producto.tipo === "tiempo" ? "img/cronometro.png" : "img/logo-telurio.png"}"
               alt="">
          <span class="valor-buffo">×${producto.valor}</span>
          <span class="precio-producto">
            <img src="img/logo-telurio.png" alt=""> ${producto.precio} átomos
          </span>
          <button class="btn btn-chico" type="button"
                  id="comprar-${producto.id}" data-id="${producto.id}">
            Comprar
          </button>
        </div>
      `;
      rejillaBuffos.appendChild(tarjeta);

      tarjeta.querySelector("button").addEventListener("click", () => {
        comprarBuffo(producto, tarjeta);
      });
    });

    /* -------------------------------- Skins -------------------------------- */
    const comprasPrevias = Estado.obtenerCompras();

    PRODUCTOS_TIENDA.skins.forEach((producto) => {
      const yaComprada = comprasPrevias.includes(producto.id);
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta-producto";
      tarjeta.innerHTML = `
        <h3 class="cabeza-producto">Skin</h3>
        <div class="cuerpo-producto">
          <img class="icono-producto" src="img/einstein-avatar.png" alt="">
          <strong>${producto.titulo}</strong>
          <span class="precio-producto">
            <img src="img/logo-telurio.png" alt=""> ${producto.precio} átomos
          </span>
          ${yaComprada
            ? `<span class="comprado">✔ En tu colección</span>`
            : `<button class="btn btn-chico" type="button"
                       id="comprar-${producto.id}" data-id="${producto.id}">
                 Comprar
               </button>`}
        </div>
      `;
      rejillaSkins.appendChild(tarjeta);

      const boton = tarjeta.querySelector("button");
      if (boton) boton.addEventListener("click", () => comprarSkin(producto, tarjeta, boton));
    });

    /* ------------------------- Lógica de compra ---------------------------- */

    function comprarBuffo(producto, tarjeta) {
      // TODO BACKEND: POST /api/tienda/compras y validar el saldo en servidor
      if (!Estado.gastarAtomos(producto.precio)) {
        window.mostrarAviso("No te alcanzan los átomos para este buffo.");
        return;
      }
      Estado.activarBuffo(producto.tipo, producto.valor);
      window.actualizarContadorAtomos();
      window.mostrarAviso(
        `¡Buffo activado! ${producto.titulo} ×${producto.valor} para tu próxima partida.`
      );
    }

    function comprarSkin(producto, tarjeta, boton) {
      // TODO BACKEND: POST /api/tienda/compras y validar el saldo en servidor
      if (!Estado.gastarAtomos(producto.precio)) {
        window.mostrarAviso("No te alcanzan los átomos para esta skin.");
        return;
      }
      Estado.registrarCompra(producto.id);
      window.actualizarContadorAtomos();
      boton.outerHTML = `<span class="comprado">✔ En tu colección</span>`;
      window.mostrarAviso(`¡Skin de ${producto.titulo} desbloqueada!`);
    }

    /* --------------------- Modal "Cargador de puntos" ----------------------- */
    const modalCargador = document.getElementById("modal-cargador");
    document.getElementById("boton-cargador").addEventListener("click", () => {
      modalCargador.showModal();
    });
    document.getElementById("boton-cerrar-cargador").addEventListener("click", () => {
      modalCargador.close();
    });
  });
})();
