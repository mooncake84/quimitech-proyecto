// searchManager.js - VERSIÓN ACTUALIZADA PARA LARAVEL
const searchManager = {
    inicializar: function () {
        console.log("🔍 SearchManager inicializado para Laravel");
        this.inicializarBuscador("buscador-contactos", "tabla-contactos-areas");
        this.inicializarFiltroProducto(
            "filtro-producto",
            "tabla-contactos-areas"
        );
        this.inicializarFiltroArea("filtro-area", "tabla-contactos-areas");
        return true;
    },

    inicializarBuscador: function (inputId, tablaId, callback) {
        const buscador = document.getElementById(inputId);
        if (!buscador) return;

        buscador.addEventListener(
            "input",
            function (e) {
                this.filtrarTabla(tablaId, e.target.value, callback);
            }.bind(this)
        );
    },

    filtrarTabla: function (tablaId, texto, callback) {
        const tabla = document.getElementById(tablaId);
        if (!tabla) return;

        const filas = tabla.querySelectorAll("tbody tr");
        let filasVisibles = 0;
        const textoLower = texto.toLowerCase();

        filas.forEach((fila) => {
            // Solo filtrar filas con datos reales (no mensajes de carga/error)
            if (fila.querySelector("td[colspan]")) {
                return;
            }

            const textoFila = fila.textContent.toLowerCase();
            const esVisible =
                textoLower === "" || textoFila.includes(textoLower);
            fila.style.display = esVisible ? "" : "none";
            if (esVisible) filasVisibles++;
        });

        if (callback) callback(filasVisibles);
    },

    inicializarFiltroProducto: function (selectId, tablaId) {
        this.inicializarFiltroGenerico(selectId, tablaId, 1); // Columna 1 = Producto
    },

    inicializarFiltroArea: function (selectId, tablaId) {
        this.inicializarFiltroGenerico(selectId, tablaId, 0); // Columna 0 = Área
    },

    inicializarFiltroGenerico: function (selectId, tablaId, columnaIndex) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.addEventListener(
            "change",
            function (e) {
                this.aplicarFiltroColumna(
                    tablaId,
                    columnaIndex,
                    e.target.value
                );
            }.bind(this)
        );
    },

    aplicarFiltroColumna: function (tablaId, columnaIndex, valorFiltro) {
        const tabla = document.getElementById(tablaId);
        if (!tabla) return;

        const filas = tabla.querySelectorAll("tbody tr");

        filas.forEach((fila) => {
            // Saltar filas de mensajes
            if (fila.querySelector("td[colspan]")) {
                return;
            }

            const celdas = fila.querySelectorAll("td");
            if (celdas.length > columnaIndex) {
                const textoCelda = celdas[columnaIndex].textContent.trim();
                const coincide =
                    valorFiltro === "" || textoCelda === valorFiltro;
                fila.style.display = coincide ? "" : "none";
            }
        });
    },

    limpiarFiltros: function () {
        // Limpiar campos de búsqueda
        const buscador = document.getElementById("buscador-contactos");
        if (buscador) buscador.value = "";

        // Limpiar selects
        const filtroProducto = document.getElementById("filtro-producto");
        const filtroArea = document.getElementById("filtro-area");
        if (filtroProducto) filtroProducto.value = "";
        if (filtroArea) filtroArea.value = "";

        // Mostrar todas las filas
        const tabla = document.getElementById("tabla-contactos-areas");
        if (tabla) {
            const filas = tabla.querySelectorAll("tbody tr");
            filas.forEach((fila) => {
                // No mostrar filas de mensajes si hay datos
                if (!fila.querySelector("td[colspan]")) {
                    fila.style.display = "";
                }
            });
        }

        console.log("🗑️ Filtros limpiados");

        // Mostrar mensaje de éxito
        if (typeof errorManager !== "undefined") {
            errorManager.mostrarError(
                "Filtros limpiados correctamente",
                "success",
                2000
            );
        }
    },
};

// Inicialización automática para Laravel
document.addEventListener("DOMContentLoaded", function () {
    // Inicializar después de un breve delay para asegurar que la tabla esté cargada
    setTimeout(() => {
        if (document.getElementById("tabla-contactos-areas")) {
            searchManager.inicializar();
            console.log("✅ SearchManager inicializado automáticamente");
        }
    }, 1000);
});

// También permitir inicialización manual desde otros scripts
if (typeof window !== "undefined") {
    window.inicializarSearchManager = function () {
        searchManager.inicializar();
    };
}
