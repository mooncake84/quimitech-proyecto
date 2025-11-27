// editManager.js - VERSIÓN CORREGIDA

const editManager = {
    modoEdicion: false,
    companyIdActual: null,
    tablaOriginal: null,

    // Inicializar sistema de edición
    inicializar: function () {
        try {
            if (typeof errorManager === "undefined") {
                console.warn(
                    "errorManager no está disponible, creando uno básico"
                );
                window.errorManager = {
                    mostrarError: function (
                        msg,
                        tipo = "error",
                        tiempo = 5000
                    ) {
                        console[tipo === "error" ? "error" : "log"](msg);
                        alert(msg);
                    },
                };
            }

            this.companyIdActual = this.obtenerCompanyIdActual();
            this.crearBotonesEdicion();
            this.agregarEventListeners();

            console.log("✅ editManager inicializado correctamente");
            return true;
        } catch (error) {
            console.error("❌ Error inicializando editManager:", error);
            return false;
        }
    },

    // Obtener ID de empresa actual
    obtenerCompanyIdActual: function () {
        const urlParams = new URLSearchParams(window.location.search);
        let companyId =
            urlParams.get("companyId") ||
            localStorage.getItem("selectedCompany") ||
            "1";

        if (typeof companyId === "string" && companyId.startsWith("empresa")) {
            return companyId.replace("empresa", "");
        }
        return companyId;
    },

    // Función para crear botones de edición
    crearBotonesEdicion: function () {
        const seccionTabla = document.querySelector(".seccion-tabla h3");
        if (!seccionTabla) {
            console.warn(
                "No se encontró la sección de tabla para agregar botones de edición"
            );
            return;
        }

        // Eliminar botones existentes para evitar duplicados
        const botonesExistentes = document.querySelector(
            ".botones-edicion-container"
        );
        if (botonesExistentes) {
            botonesExistentes.remove();
        }

        const botonesContainer = document.createElement("div");
        botonesContainer.className = "botones-edicion-container";

        // Botón activar edición
        const btnActivarEdicion = document.createElement("button");
        btnActivarEdicion.id = "btn-activar-edicion";
        btnActivarEdicion.innerHTML = "✏️ Editar Tabla";
        btnActivarEdicion.className = "btn-edicion";
        btnActivarEdicion.title =
            "Activar modo edición para modificar contactos";

        // Botón guardar cambios
        const btnGuardarCambios = document.createElement("button");
        btnGuardarCambios.id = "btn-guardar-cambios";
        btnGuardarCambios.innerHTML = "💾 Guardar";
        btnGuardarCambios.className = "btn-edicion";
        btnGuardarCambios.style.display = "none";
        btnGuardarCambios.title =
            "Guardar todos los cambios en la base de datos";

        // Botón cancelar edición
        const btnCancelarEdicion = document.createElement("button");
        btnCancelarEdicion.id = "btn-cancelar-edicion";
        btnCancelarEdicion.innerHTML = "❌ Cancelar";
        btnCancelarEdicion.className = "btn-edicion";
        btnCancelarEdicion.style.display = "none";
        btnCancelarEdicion.title = "Cancelar edición y descartar cambios";

        // Agregar botones al contenedor
        botonesContainer.appendChild(btnActivarEdicion);
        botonesContainer.appendChild(btnGuardarCambios);
        botonesContainer.appendChild(btnCancelarEdicion);

        seccionTabla.style.display = "flex";
        seccionTabla.style.alignItems = "center";
        seccionTabla.style.justifyContent = "space-between";
        seccionTabla.style.flexWrap = "wrap";
        seccionTabla.style.gap = "15px";
        seccionTabla.style.width = "100%";

        seccionTabla.appendChild(botonesContainer);
    },

    // Agregar event listeners
    agregarEventListeners: function () {
        const self = this;

        document.addEventListener("click", function (e) {
            if (e.target.id === "btn-activar-edicion") {
                self.activarModoEdicion();
            } else if (e.target.id === "btn-guardar-cambios") {
                self.guardarCambios();
            } else if (e.target.id === "btn-cancelar-edicion") {
                self.cancelarEdicion();
            } else if (e.target.classList.contains("btn-eliminar-fila")) {
                self.eliminarFila(e.target);
            } else if (e.target.id === "btn-nueva-fila") {
                self.agregarNuevaFila();
            }
        });
    },

    // Activar modo edición
    activarModoEdicion: function () {
        if (this.modoEdicion) {
            errorManager.mostrarError("Ya estás en modo edición", "warning");
            return;
        }

        console.log("✏️ Activando modo edición...");

        // Guardar estado original de la tabla
        this.tablaOriginal = document.getElementById(
            "cuerpo-tabla-contactos"
        ).innerHTML;

        this.modoEdicion = true;
        this.habilitarEdicionTabla();
        this.mostrarBotonesEdicion();

        errorManager.mostrarError(
            "Modo edición activado. Haz doble clic en cualquier celda para editar.",
            "success",
            3000
        );
    },

    // CORREGIR ESTA FUNCIÓN EN editManager.js

    // Habilitar edición de la tabla - VERSIÓN CORREGIDA
    habilitarEdicionTabla: function () {
        const tbody = document.getElementById("cuerpo-tabla-contactos");
        const filas = tbody.querySelectorAll("tr");

        filas.forEach((fila, index) => {
            // Hacer fila editable con doble clic
            fila.setAttribute("data-fila-index", index);

            // VERIFICAR SI YA EXISTE LA COLUMNA DE ACCIONES
            let celdaAcciones = fila.querySelector(".acciones-edicion");

            if (!celdaAcciones) {
                // Crear columna de acciones si no existe
                celdaAcciones = document.createElement("td");
                celdaAcciones.className = "acciones-edicion";
                fila.appendChild(celdaAcciones);
            }

            // AGREGAR/MANTENER BOTÓN ELIMINAR
            celdaAcciones.innerHTML =
                '<button class="btn-eliminar-fila" title="Eliminar fila">🗑️</button>';

            // Hacer celdas editables (excluyendo la columna de acciones)
            const celdas = fila.querySelectorAll("td:not(.acciones-edicion)");
            celdas.forEach((celda, celdaIndex) => {
                celda.setAttribute("contenteditable", "true");
                celda.style.border = "1px dashed #ccc";
                celda.style.padding = "8px";

                // Guardar valor original
                if (!celda.getAttribute("data-valor-original")) {
                    celda.setAttribute(
                        "data-valor-original",
                        celda.textContent.trim()
                    );
                }
            });
        });

        // FORZAR MOSTRAR ACCIONES CON CSS
        document.body.classList.add("modo-edicion-activo");
    },

    // Función para mostrar botones de edición - VERSIÓN MEJORADA
    mostrarBotonesEdicion: function () {
        // Ocultar botón de activar edición
        document.getElementById("btn-activar-edicion").style.display = "none";

        // Mostrar botones de acción
        document.getElementById("btn-guardar-cambios").style.display =
            "inline-block";
        document.getElementById("btn-cancelar-edicion").style.display =
            "inline-block";

        // Mostrar botón de NUEVA FILA
        const btnNuevaFila = document.getElementById("btn-nueva-fila");
        if (btnNuevaFila) {
            btnNuevaFila.style.display = "inline-block";
        }

        // FORZAR MOSTRAR COLUMNA DE ACCIONES EN TODAS LAS FILAS
        const accionesCells = document.querySelectorAll(".acciones-edicion");
        accionesCells.forEach((cell) => {
            cell.style.display = "table-cell";
            cell.style.visibility = "visible";
            cell.style.opacity = "1";
        });

        // Agregar indicador visual de modo edición
        const indicador = document.createElement("div");
        indicador.className = "modo-edicion-indicador";
        indicador.innerHTML =
            "✏️ MODO EDICIÓN ACTIVO - Recuerda guardar los cambios";
        indicador.id = "indicador-edicion";
        document.body.appendChild(indicador);

        document.body.classList.add("modo-edicion-activo");
        console.log("✅ Modo edición activado - Botones configurados");
    },

    // Función para ocultar botones de edición - CORREGIDA
    ocultarBotonesEdicion: function () {
        // Mostrar botón de activar edición
        document.getElementById("btn-activar-edicion").style.display =
            "inline-block";

        // Ocultar botones de acción
        document.getElementById("btn-guardar-cambios").style.display = "none";
        document.getElementById("btn-cancelar-edicion").style.display = "none";

        // Ocultar botón de NUEVA FILA - CON VERIFICACIÓN
        const btnNuevaFila = document.getElementById("btn-nueva-fila");
        if (btnNuevaFila) {
            btnNuevaFila.style.display = "none";
        }

        // Remover indicador
        const indicador = document.getElementById("indicador-edicion");
        if (indicador) {
            indicador.remove();
        }

        document.body.classList.remove("modo-edicion-activo");
        console.log("❌ Modo edición desactivado - Botones ocultos");
    },

    // Función para agregar nueva fila - VERSIÓN CORREGIDA
    agregarNuevaFila: function () {
        if (!this.modoEdicion) {
            errorManager.mostrarError(
                "Debes activar el modo edición primero",
                "warning"
            );
            return;
        }

        const tbody = document.getElementById("cuerpo-tabla-contactos");
        const nuevaFila = document.createElement("tr");
        nuevaFila.setAttribute("data-contacto-id", "nuevo");
        nuevaFila.className = "fila-nueva";

        // ESTRUCTURA CORREGIDA - INCLUYENDO CLASE acciones-edicion
        nuevaFila.innerHTML = `
        <td contenteditable="true" data-field="area">Nueva Área</td>
        <td contenteditable="true" data-field="producto_requerido">Nuevo Producto</td>
        <td contenteditable="true" data-field="encargado">Nuevo Encargado</td>
        <td contenteditable="true" data-field="puesto">Nuevo Puesto</td>
        <td contenteditable="true" data-field="correo">nuevo@email.com</td>
        <td contenteditable="true" data-field="telefono">1234567890</td>
        <td class="acciones-edicion" style="display: table-cell !important;">
            <button class="btn-eliminar-fila" title="Eliminar fila">🗑️</button>
        </td>
    `;

        tbody.insertBefore(nuevaFila, tbody.firstChild);

        // Aplicar estilos de edición a la nueva fila
        const celdas = nuevaFila.querySelectorAll("td:not(.acciones-edicion)");
        celdas.forEach((celda) => {
            celda.style.border = "1px dashed #ccc";
            celda.style.padding = "8px";
            celda.setAttribute("data-valor-original", celda.textContent.trim());
        });

        nuevaFila.scrollIntoView({ behavior: "smooth", block: "nearest" });

        errorManager.mostrarError(
            "Nueva fila agregada. Recuerda guardar los cambios cuando termines.",
            "success",
            3000
        );
        console.log("➕ Nueva fila agregada en modo edición");
    },

    // Eliminar fila
    eliminarFila: function (boton) {
        const fila = boton.closest("tr");
        const contactoId = fila.getAttribute("data-contacto-id");

        if (contactoId && contactoId !== "nuevo") {
            if (
                !confirm(
                    "¿Estás seguro de que quieres eliminar este contacto? Esta acción no se puede deshacer."
                )
            ) {
                return;
            }
            this.eliminarContactoServidor(contactoId, fila);
        } else {
            fila.remove();
            console.log("🗑️ Fila nueva eliminada localmente");
        }
    },

    async eliminarContactoServidor(contactoId, fila) {
        try {
            console.log(`🗑️ Eliminando contacto ${contactoId} del servidor...`);

            const response = await fetch(`/api/contactos/${contactoId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                    "Content-Type": "application/json",
                },
            });

            const resultado = await response.json();

            if (resultado.success) {
                fila.remove();
                errorManager.mostrarError(
                    "Contacto eliminado exitosamente",
                    "success",
                    3000
                );
                console.log("✅ Contacto eliminado del servidor");
            } else {
                throw new Error(resultado.message);
            }
        } catch (error) {
            console.error("❌ Error eliminando contacto:", error);
            errorManager.mostrarError(`Error al eliminar: ${error.message}`);
        }
    },

    // GUARDAR CAMBIOS - CORREGIDO
    async guardarCambios() {
        try {
            console.log("💾 Guardando todos los cambios en SQL Server...");

            const tbody = document.getElementById("cuerpo-tabla-contactos");
            const filas = tbody.querySelectorAll("tr");
            const cambios = [];

            // Recolectar cambios - ESTRUCTURA CORREGIDA
            for (const fila of filas) {
                const contactoId = fila.getAttribute("data-contacto-id");

                // OBTENER CELDAS CORRECTAMENTE - excluir columna de acciones
                const celdas = fila.querySelectorAll(
                    "td:not(.acciones-edicion)"
                );

                // VERIFICAR QUE TENEMOS LAS CELDAS CORRECTAS
                if (celdas.length < 6) {
                    console.warn("❌ Fila con estructura incorrecta:", fila);
                    continue;
                }

                const datos = {
                    empresa_id: this.companyIdActual,
                    area: celdas[0].textContent.trim(),
                    producto_requerido: celdas[1].textContent.trim(),
                    encargado: celdas[2].textContent.trim(),
                    puesto: celdas[3].textContent.trim(),
                    correo: celdas[4].textContent.trim(),
                    telefono: celdas[5].textContent.trim(),
                };

                cambios.push({
                    id: contactoId,
                    datos: datos,
                    esNuevo: contactoId === "nuevo",
                });
            }

            console.log("📦 Cambios a guardar:", cambios);

            // Procesar cambios
            let cambiosExitosos = 0;
            for (const cambio of cambios) {
                if (cambio.esNuevo) {
                    await this.guardarNuevoContacto(cambio.datos);
                } else {
                    await this.actualizarContacto(cambio.id, cambio.datos);
                }
                cambiosExitosos++;
            }

            errorManager.mostrarError(
                `✅ ${cambiosExitosos} cambios guardados exitosamente en SQL Server`,
                "success",
                3000
            );
            this.finalizarEdicion();

            // Recargar datos para sincronizar con servidor
            setTimeout(() => {
                if (typeof window.recargarDatosEmpresa === "function") {
                    window.recargarDatosEmpresa();
                }
            }, 1000);
        } catch (error) {
            console.error("❌ Error guardando cambios:", error);
            errorManager.mostrarError(
                `Error al guardar cambios: ${error.message}`
            );
        }
    },

    async guardarNuevoContacto(datos) {
        console.log("🆕 Guardando nuevo contacto:", datos);

        const response = await fetch("/api/contactos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify(datos),
        });

        const resultado = await response.json();

        if (!resultado.success) {
            throw new Error(resultado.message);
        }

        console.log(
            "✅ Nuevo contacto guardado en SQL Server:",
            resultado.contacto
        );
        return resultado.contacto;
    },

    async actualizarContacto(contactoId, datos) {
        console.log("✏️ Actualizando contacto:", contactoId, datos);

        const response = await fetch(`/api/contactos/${contactoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify(datos),
        });

        const resultado = await response.json();

        if (!resultado.success) {
            throw new Error(resultado.message);
        }

        console.log(
            "✅ Contacto actualizado en SQL Server:",
            resultado.contacto
        );
        return resultado.contacto;
    },

    cancelarEdicion: function () {
        if (!this.modoEdicion) return;

        if (this.verificarCambiosNoGuardados()) {
            if (
                !confirm(
                    "⚠️ Tienes cambios sin guardar. ¿Estás seguro de que quieres cancelar? Se perderán todos los cambios no guardados."
                )
            ) {
                return;
            }
        }

        console.log("❌ Cancelando edición...");

        // Restaurar tabla original
        if (this.tablaOriginal) {
            document.getElementById("cuerpo-tabla-contactos").innerHTML =
                this.tablaOriginal;
        }

        this.modoEdicion = false;
        this.ocultarBotonesEdicion();
        errorManager.mostrarError(
            "Edición cancelada - Cambios descartados",
            "info",
            3000
        );
    },

    finalizarEdicion: function () {
        this.modoEdicion = false;
        this.ocultarBotonesEdicion();
        this.tablaOriginal = null;
    },

    verificarCambiosNoGuardados: function () {
        if (!this.modoEdicion) return false;

        const tbody = document.getElementById("cuerpo-tabla-contactos");
        const filas = tbody.querySelectorAll("tr");

        for (const fila of filas) {
            const celdas = fila.querySelectorAll("td[contenteditable='true']");
            for (const celda of celdas) {
                const valorOriginal = celda.getAttribute("data-valor-original");
                const valorActual = celda.textContent.trim();

                if (valorOriginal !== valorActual) {
                    return true;
                }
            }

            if (fila.getAttribute("data-contacto-id") === "nuevo") {
                return true;
            }
        }

        return false;
    },
};

// Inicialización automática
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        if (document.getElementById("cuerpo-tabla-contactos")) {
            editManager.inicializar();
        } else {
            setTimeout(function () {
                editManager.inicializar();
            }, 1000);
        }
    }, 500);
});

if (typeof window !== "undefined") {
    window.recargarEditManager = function () {
        setTimeout(() => {
            editManager.inicializar();
        }, 1000);
    };
}
