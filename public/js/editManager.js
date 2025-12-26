const editManager = {
    modoEdicion: false,
    companyIdActual: null,
    tablaOriginal: null,
    cambiosPendientes: new Map(),

    API_URLS: {
        contactos: "/api/contactos",
        contactosPorEmpresa: (empresaId) =>
            `/api/contactos/por-empresa/${empresaId}`,
    },

    inicializar: function () {
        try {
            this.companyIdActual = this.obtenerCompanyIdActual();
            this.crearBotonesEdicion();
            this.agregarEventListeners();
            return true;
        } catch (error) {
            return false;
        }
    },

    obtenerCompanyIdActual: function () {
        if (window.infoEmpresaManager && window.infoEmpresaManager.empresaId) {
            return window.infoEmpresaManager.empresaId;
        }

        const urlParams = new URLSearchParams(window.location.search);
        let companyId = urlParams.get("companyId") || "1";

        if (companyId.startsWith("empresa")) {
            companyId = companyId.replace("empresa", "");
        }

        return companyId || "1";
    },

    crearBotonesEdicion: function () {
        const seccionTabla = document.querySelector(".seccion-tabla h3");
        if (!seccionTabla) return;

        const botonesExistentes = seccionTabla.querySelector(
            ".botones-edicion-container"
        );
        if (botonesExistentes) botonesExistentes.remove();

        const botonesContainer = document.createElement("div");
        botonesContainer.className = "botones-edicion-container";
        botonesContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-left: auto;
            align-items: center;
        `;

        const btnActivar = document.createElement("button");
        btnActivar.id = "btn-activar-edicion";
        btnActivar.innerHTML = "✏️ <span>Editar Tabla</span>";
        btnActivar.className = "btn-edicion";
        btnActivar.title = "Activar modo edición para modificar contactos";
        botonesContainer.appendChild(btnActivar);

        const btnGuardar = document.createElement("button");
        btnGuardar.id = "btn-guardar-cambios";
        btnGuardar.innerHTML = "💾 <span>Guardar Cambios</span>";
        btnGuardar.className = "btn-edicion";
        btnGuardar.title = "Guardar todos los cambios";
        btnGuardar.style.display = "none";
        botonesContainer.appendChild(btnGuardar);

        const btnCancelar = document.createElement("button");
        btnCancelar.id = "btn-cancelar-edicion";
        btnCancelar.innerHTML = "❌ <span>Cancelar</span>";
        btnCancelar.className = "btn-edicion";
        btnCancelar.title = "Cancelar edición";
        btnCancelar.style.display = "none";
        botonesContainer.appendChild(btnCancelar);

        const btnNuevaFila = document.createElement("button");
        btnNuevaFila.id = "btn-nueva-fila";
        btnNuevaFila.innerHTML = "➕ <span>Nueva Fila</span>";
        btnNuevaFila.className = "btn-edicion";
        btnNuevaFila.title = "Agregar nuevo contacto";
        btnNuevaFila.style.display = "none";
        botonesContainer.appendChild(btnNuevaFila);

        seccionTabla.style.cssText = `
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
        `;
        seccionTabla.appendChild(botonesContainer);
    },

    agregarEventListeners: function () {
        document.addEventListener("click", (e) => this.manejarClick(e));
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.modoEdicion) {
                this.cancelarEdicion();
            }
        });
    },

    manejarClick: function (e) {
        if (
            e.target.id === "btn-activar-edicion" ||
            e.target.closest("#btn-activar-edicion")
        ) {
            this.activarModoEdicion();
        } else if (
            e.target.id === "btn-guardar-cambios" ||
            e.target.closest("#btn-guardar-cambios")
        ) {
            e.preventDefault();
            e.stopPropagation();
            this.guardarCambios();
        } else if (
            e.target.id === "btn-cancelar-edicion" ||
            e.target.closest("#btn-cancelar-edicion")
        ) {
            this.cancelarEdicion();
        } else if (
            e.target.id === "btn-nueva-fila" ||
            e.target.closest("#btn-nueva-fila")
        ) {
            this.agregarNuevaFila();
        } else if (
            e.target.classList.contains("btn-eliminar-fila") ||
            e.target.closest(".btn-eliminar-fila")
        ) {
            if (this.modoEdicion) {
                this.eliminarFila(
                    e.target.closest(".btn-eliminar-fila") || e.target
                );
            }
        }
    },

    activarModoEdicion: function () {
        if (this.modoEdicion) {
            alert("Ya estás en modo edición");
            return;
        }

        const tbody = document.getElementById("cuerpo-tabla-contactos");
        if (!tbody) {
            alert("No se encontró la tabla de contactos");
            return;
        }

        this.tablaOriginal = tbody.innerHTML;
        this.modoEdicion = true;
        this.cambiosPendientes.clear();

        this.habilitarEdicionTabla();
        this.mostrarBotonesEdicion();
        this.mostrarIndicadorEdicion();

        alert(
            "Modo edición activado. Ahora puedes editar y eliminar contactos."
        );
    },

    habilitarEdicionTabla: function () {
        const tbody = document.getElementById("cuerpo-tabla-contactos");
        if (!tbody) return;

        const filas = tbody.querySelectorAll("tr");

        filas.forEach((fila) => {
            const celdas = fila.querySelectorAll("td:not(.acciones-edicion)");
            celdas.forEach((celda) => {
                const valorOriginal = celda.textContent.trim();
                celda.setAttribute("contenteditable", "true");
                celda.setAttribute("data-valor-original", valorOriginal);
                celda.style.cssText = `
                    border: 1px dashed #adb5bd;
                    padding: 8px;
                    min-height: 28px;
                    outline: none;
                    background-color: #f8f9fa;
                `;

                celda.addEventListener("input", (e) =>
                    this.marcarCambio(e.target)
                );
                celda.addEventListener(
                    "focus",
                    (e) => (e.target.style.backgroundColor = "#e3f2fd")
                );
                celda.addEventListener("blur", (e) => {
                    if (
                        e.target.textContent.trim() ===
                        e.target.getAttribute("data-valor-original")
                    ) {
                        e.target.style.backgroundColor = "#f8f9fa";
                    }
                });
            });

            const accionesCell = fila.querySelector(".acciones-edicion");
            if (accionesCell) {
                accionesCell.style.display = "table-cell";

                const btnEliminar =
                    accionesCell.querySelector(".btn-eliminar-fila");
                if (btnEliminar) {
                    btnEliminar.style.display = "inline-block";
                    btnEliminar.style.opacity = "1";
                    btnEliminar.style.pointerEvents = "auto";
                } else {
                    const nuevoBtn = document.createElement("button");
                    nuevoBtn.className = "btn-eliminar-fila";
                    nuevoBtn.innerHTML = '<i class="fas fa-trash"></i>';
                    nuevoBtn.title = "Eliminar contacto";
                    nuevoBtn.onclick = () => this.eliminarFila(nuevoBtn);
                    accionesCell.appendChild(nuevoBtn);
                }
            }
        });

        document.body.classList.add("modo-edicion-activo");
    },

    marcarCambio: function (celda) {
        const valorOriginal = celda.getAttribute("data-valor-original");
        const valorActual = celda.textContent.trim();

        if (valorOriginal !== valorActual) {
            celda.style.backgroundColor = "#fff3cd";
            celda.style.borderColor = "#ffc107";
        } else {
            celda.style.backgroundColor = "#f8f9fa";
            celda.style.borderColor = "#adb5bd";
        }
    },

    mostrarBotonesEdicion: function () {
        document.getElementById("btn-activar-edicion").style.display = "none";
        document.getElementById("btn-guardar-cambios").style.display = "flex";
        document.getElementById("btn-cancelar-edicion").style.display = "flex";
        document.getElementById("btn-nueva-fila").style.display = "flex";
    },

    mostrarIndicadorEdicion: function () {
        const existente = document.getElementById("indicador-edicion");
        if (existente) existente.remove();

        const indicador = document.createElement("div");
        indicador.id = "indicador-edicion";
        indicador.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">✏️</span>
                <div>
                    <strong>MODO EDICIÓN ACTIVO</strong><br>
                    <small>Ahora puedes editar y eliminar contactos</small>
                </div>
            </div>
        `;
        indicador.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #ffc107, #ff9800);
            color: #333;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: pulse 1.5s infinite;
            border-left: 4px solid #ff5722;
        `;

        document.body.appendChild(indicador);
    },

    agregarNuevaFila: function () {
        if (!this.modoEdicion) {
            alert("Debes activar el modo edición primero");
            return;
        }

        const tbody = document.getElementById("cuerpo-tabla-contactos");
        if (!tbody) return;

        const nuevoId = `nuevo_${Date.now()}`;
        const nuevaFila = document.createElement("tr");
        nuevaFila.dataset.contactoId = nuevoId;
        nuevaFila.dataset.nuevo = "true";
        nuevaFila.style.backgroundColor = "#e8f5e9";

        const campos = [
            "area",
            "producto",
            "encargado",
            "puesto",
            "telefono",
            "correo",
        ];

        campos.forEach((campo) => {
            const celda = document.createElement("td");
            celda.setAttribute("contenteditable", "true");
            celda.setAttribute("data-field", campo);
            celda.setAttribute("data-valor-original", "");
            celda.textContent = "";
            celda.style.cssText = `
                border: 2px dashed #4caf50;
                padding: 8px;
                background-color: #f1f8e9;
            `;
            nuevaFila.appendChild(celda);
        });

        const accionesCell = document.createElement("td");
        accionesCell.className = "acciones-edicion";
        accionesCell.style.display = "table-cell";
        accionesCell.innerHTML = `
            <button class="btn-eliminar-fila" title="Eliminar fila">
                <i class="fas fa-trash"></i>
            </button>
        `;
        nuevaFila.appendChild(accionesCell);

        tbody.insertBefore(nuevaFila, tbody.firstChild);

        setTimeout(() => {
            const primeraCelda = nuevaFila.querySelector("td");
            if (primeraCelda) primeraCelda.focus();
        }, 10);
    },

    eliminarFila: function (boton) {
        const fila = boton.closest("tr");
        if (!fila) return;

        const esNueva = fila.dataset.nuevo === "true";
        const contactoId = fila.dataset.contactoId;

        const mensaje = esNueva
            ? "¿Eliminar esta fila nueva?"
            : "¿Estás seguro de eliminar este contacto?";

        if (!confirm(mensaje)) return;

        if (!esNueva && contactoId && !contactoId.startsWith("temp")) {
            if (!this.cambiosPendientes.has("eliminados")) {
                this.cambiosPendientes.set("eliminados", []);
            }
            this.cambiosPendientes.get("eliminados").push(contactoId);
        }

        fila.style.transition = "opacity 0.3s, transform 0.3s";
        fila.style.opacity = "0";
        fila.style.transform = "translateX(20px)";

        setTimeout(() => {
            fila.remove();
        }, 300);
    },

    async guardarCambios() {
        try {
            const tbody = document.getElementById("cuerpo-tabla-contactos");
            if (!tbody) {
                alert("No se encontró la tabla de contactos");
                return;
            }

            const filas = tbody.querySelectorAll("tr");
            const operaciones = [];

            filas.forEach((fila) => {
                const contactoId = fila.dataset.contactoId;
                const esNueva = fila.dataset.nuevo === "true";
                const esTemporal = contactoId && contactoId.startsWith("temp");

                if (esNueva || esTemporal) {
                    const datos = this.obtenerDatosFila(fila);
                    if (datos) {
                        operaciones.push({
                            tipo: "crear",
                            datos: {
                                ...datos,
                                empresa_id: this.companyIdActual,
                            },
                        });
                    }
                } else {
                    const tieneCambios = this.tieneCambiosFila(fila);
                    if (tieneCambios && contactoId) {
                        const datos = this.obtenerDatosFila(fila);
                        if (datos) {
                            operaciones.push({
                                tipo: "actualizar",
                                id: contactoId,
                                datos: datos,
                            });
                        }
                    }
                }
            });

            if (this.cambiosPendientes.has("eliminados")) {
                const eliminados = this.cambiosPendientes.get("eliminados");
                eliminados.forEach((id) => {
                    operaciones.push({
                        tipo: "eliminar",
                        id: id,
                    });
                });
            }

            if (operaciones.length === 0) {
                alert("ℹ️ No hay cambios para guardar");
                return;
            }

            this.mostrarIndicadorCarga();

            const resultados = [];
            for (const operacion of operaciones) {
                try {
                    let resultado;
                    switch (operacion.tipo) {
                        case "crear":
                            resultado = await this.crearContacto(
                                operacion.datos
                            );
                            break;
                        case "actualizar":
                            resultado = await this.actualizarContacto(
                                operacion.id,
                                operacion.datos
                            );
                            break;
                        case "eliminar":
                            resultado = await this.eliminarContacto(
                                operacion.id
                            );
                            break;
                    }
                    resultados.push({ ...operacion, exito: resultado });
                } catch (error) {
                    resultados.push({
                        ...operacion,
                        exito: false,
                        error: error.message,
                    });
                }
            }

            this.ocultarIndicadorCarga();

            const exitosas = resultados.filter((r) => r.exito).length;
            const fallidas = resultados.filter((r) => !r.exito).length;

            if (fallidas > 0) {
                alert(
                    `⚠️ Guardado parcial: ${exitosas} exitosas, ${fallidas} fallidas.`
                );
            } else {
                alert(`✅ ${exitosas} cambios guardados exitosamente`);
            }

            await this.recargarDatosDesdeServidor();
            this.finalizarEdicion();
        } catch (error) {
            this.ocultarIndicadorCarga();
            alert("❌ Error al guardar cambios: " + error.message);
        }
    },

    obtenerDatosFila: function (fila) {
        const celdas = fila.querySelectorAll("td:not(.acciones-edicion)");
        if (celdas.length < 6) return null;

        const datos = {};
        celdas.forEach((celda) => {
            const campo = celda.getAttribute("data-field");
            if (campo) {
                datos[campo] = celda.textContent.trim();
            }
        });

        if (!datos.area) datos.area = "";
        if (!datos.producto) datos.producto = "";
        if (!datos.encargado) datos.encargado = "";
        if (!datos.puesto) datos.puesto = "";
        if (!datos.telefono) datos.telefono = "";
        if (!datos.correo) datos.correo = "";

        return datos;
    },

    tieneCambiosFila: function (fila) {
        const celdas = fila.querySelectorAll("td[contenteditable='true']");
        for (const celda of celdas) {
            const original = celda.getAttribute("data-valor-original");
            const actual = celda.textContent.trim();
            if (original !== actual) return true;
        }
        return false;
    },

    async crearContacto(datos) {
        const csrfToken = this.obtenerCSRFToken();
        const response = await fetch(this.API_URLS.contactos, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        if (!result.success)
            throw new Error(result.message || "Error del servidor");
        return true;
    },

    async actualizarContacto(id, datos) {
        const csrfToken = this.obtenerCSRFToken();
        const response = await fetch(`${this.API_URLS.contactos}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify(datos),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        if (!result.success)
            throw new Error(result.message || "Error del servidor");
        return true;
    },

    async eliminarContacto(id) {
        const csrfToken = this.obtenerCSRFToken();
        const response = await fetch(`${this.API_URLS.contactos}/${id}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        if (!result.success)
            throw new Error(result.message || "Error del servidor");
        return true;
    },

    async recargarDatosDesdeServidor() {
        if (
            window.infoEmpresaManager &&
            window.infoEmpresaManager.recargarDatos
        ) {
            await window.infoEmpresaManager.recargarDatos();
        } else {
            location.reload();
        }
    },

    obtenerCSRFToken: function () {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute("content");
        const tokenInput = document.querySelector('input[name="_token"]');
        return tokenInput ? tokenInput.value : "";
    },

    mostrarIndicadorCarga: function () {
        const existente = document.getElementById("indicador-carga");
        if (existente) existente.remove();

        const indicador = document.createElement("div");
        indicador.id = "indicador-carga";
        indicador.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="spinner" style="width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <div>
                    <strong>Guardando cambios...</strong><br>
                    <small>Por favor espere</small>
                </div>
            </div>
        `;
        indicador.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            color: #333;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1001;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            border-left: 4px solid #3498db;
        `;
        document.body.appendChild(indicador);
    },

    ocultarIndicadorCarga: function () {
        const indicador = document.getElementById("indicador-carga");
        if (indicador) {
            indicador.style.transition = "opacity 0.3s";
            indicador.style.opacity = "0";
            setTimeout(() => indicador.remove(), 300);
        }
    },

    cancelarEdicion: function () {
        if (!this.modoEdicion) return;
        if (confirm("¿Cancelar edición y perder los cambios?")) {
            this.finalizarEdicion();
            alert("Edición cancelada");
        }
    },

    finalizarEdicion: function () {
        this.modoEdicion = false;
        this.cambiosPendientes.clear();

        document.getElementById("btn-activar-edicion").style.display = "flex";
        document.getElementById("btn-guardar-cambios").style.display = "none";
        document.getElementById("btn-cancelar-edicion").style.display = "none";
        document.getElementById("btn-nueva-fila").style.display = "none";

        const indicador = document.getElementById("indicador-edicion");
        if (indicador) indicador.remove();

        if (
            window.infoEmpresaManager &&
            window.infoEmpresaManager.recargarDatos
        ) {
            window.infoEmpresaManager.recargarDatos();
        }
    },
};

document.addEventListener("DOMContentLoaded", function () {
    const esperarInfoEmpresa = setInterval(() => {
        if (window.infoEmpresaManager) {
            clearInterval(esperarInfoEmpresa);
            setTimeout(() => {
                editManager.inicializar();
            }, 500);
        }
    }, 100);
});

window.editManager = editManager;
window.activarModoEdicion = function () {
    editManager.activarModoEdicion();
};
