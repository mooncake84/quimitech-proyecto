// actividades_script.js - VERSIÓN FINAL CORREGIDA CON REPROGRAMACIÓN
document.addEventListener("DOMContentLoaded", function () {
    // Elementos del DOM
    const nombreEmpresaActual = document.getElementById(
        "nombre-empresa-actual"
    );
    const empresaActualIndicador = document.getElementById(
        "empresa-actual-indicador"
    );
    const actividadesBody = document.getElementById("actividades-body");
    const mensajeVacio = document.getElementById("mensaje-vacio");

    // Elementos de filtros
    const filtroEstado = document.getElementById("filtro-estado");
    const filtroFecha = document.getElementById("filtro-fecha");
    const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");

    // Modal de reprogramación
    const modalReprogramar = document.getElementById("modal-reprogramar");
    const formReprogramar = document.getElementById("form-reprogramar");
    const fechaReprogramar = document.getElementById("fecha-reprogramar");
    const horaReprogramar = document.getElementById("hora-reprogramar");
    const btnCancelarReprogramar = document.getElementById(
        "btn-cancelar-reprogramar"
    );
    const btnGuardarReprogramar = document.getElementById(
        "btn-guardar-reprogramar"
    );

    // Elementos de estadísticas
    const totalActividades = document.getElementById("total-actividades");
    const pendientesCount = document.getElementById("pendientes-count");
    const completadasCount = document.getElementById("completadas-count");
    const reprogramadasCount = document.getElementById("reprogramadas-count");

    // Variables globales
    let empresasCargadas = [];
    let actividadesCargadas = [];
    let actividadesFiltradas = [];
    let currentCompanyId = null;
    let actividadAReprogramar = null;

    /**
     * Convertir IDs antiguos ("empresa1") a nuevos (1)
     */
    function convertirIdEmpresa(id) {
        if (typeof id === "string" && id.startsWith("empresa")) {
            return id.replace("empresa", "");
        }
        return id ? id.toString() : null;
    }

    /**
     * Cargar empresas desde SQL Server
     */
    async function cargarEmpresas() {
        try {
            const empresasData = await DataManager.cargarEmpresas();

            if (Array.isArray(empresasData)) {
                empresasCargadas = empresasData;
                return empresasCargadas;
            } else {
                empresasCargadas = [];
                return [];
            }
        } catch (error) {
            empresasCargadas = [];
            return [];
        }
    }

    /**
     * Cargar actividades desde SQL Server
     */
    async function cargarActividades() {
        try {
            const actividadesData = await DataManager.cargarActividades();

            if (Array.isArray(actividadesData)) {
                actividadesCargadas = actividadesData;
                actividadesFiltradas = [...actividadesData];
                return actividadesCargadas;
            } else {
                actividadesCargadas = [];
                actividadesFiltradas = [];
                return [];
            }
        } catch (error) {
            actividadesCargadas = [];
            actividadesFiltradas = [];
            return [];
        }
    }

    /**
     * Cargar y mostrar la empresa seleccionada
     */
    async function cargarEmpresaActual() {
        try {
            let selectedCompanyId = convertirIdEmpresa(
                localStorage.getItem("selectedCompany") || "1"
            );

            if (empresasCargadas.length === 0) {
                await cargarEmpresas();
            }

            if (!Array.isArray(empresasCargadas)) {
                empresasCargadas = [];
                currentCompanyId = null;
                return null;
            }

            const empresa = empresasCargadas.find(
                (emp) =>
                    emp &&
                    emp.id &&
                    emp.id.toString() === selectedCompanyId.toString()
            );

            if (empresa) {
                currentCompanyId = empresa.id.toString();
                const nombreEmpresa = empresa.nombre;

                if (nombreEmpresaActual) {
                    nombreEmpresaActual.textContent = `Empresa Actual: ${nombreEmpresa}`;
                }

                if (empresaActualIndicador) {
                    empresaActualIndicador.innerHTML = `Mostrando actividades para: <strong>${nombreEmpresa}</strong>`;
                }

                return currentCompanyId;
            } else {
                if (empresasCargadas.length > 0) {
                    const primeraEmpresa = empresasCargadas[0];
                    currentCompanyId = primeraEmpresa.id.toString();

                    if (nombreEmpresaActual) {
                        nombreEmpresaActual.textContent = `Empresa Actual: ${primeraEmpresa.nombre}`;
                    }

                    if (empresaActualIndicador) {
                        empresaActualIndicador.innerHTML = `Mostrando actividades para: <strong>${primeraEmpresa.nombre}</strong>`;
                    }

                    return currentCompanyId;
                } else {
                    currentCompanyId = null;
                    return null;
                }
            }
        } catch (error) {
            currentCompanyId = null;
            return null;
        }
    }

    /**
     * Aplicar filtros a las actividades
     */
    function aplicarFiltros() {
        try {
            const estado = filtroEstado ? filtroEstado.value : "todos";
            const fecha = filtroFecha ? filtroFecha.value : "";

            if (!Array.isArray(actividadesCargadas)) {
                actividadesCargadas = [];
                actividadesFiltradas = [];
                renderizarTabla();
                return [];
            }

            let filtered = [...actividadesCargadas];

            if (currentCompanyId) {
                filtered = filtered.filter(
                    (act) =>
                        act &&
                        act.empresa_id &&
                        act.empresa_id.toString() ===
                            currentCompanyId.toString()
                );
            }

            if (estado !== "todos") {
                filtered = filtered.filter((act) => {
                    if (!act || !act.estado) return false;

                    const estadoActividad = act.estado.toLowerCase();
                    const estadoFiltro = estado.toLowerCase();

                    if (
                        estadoFiltro === "completado" &&
                        estadoActividad === "completado"
                    ) {
                        return true;
                    } else if (
                        estadoFiltro === "reprogramado" &&
                        estadoActividad === "reprogramado"
                    ) {
                        return true;
                    } else {
                        return estadoActividad === estadoFiltro;
                    }
                });
            }

            if (fecha) {
                filtered = filtered.filter((act) => {
                    if (!act || !act.fecha) return false;

                    try {
                        let fechaActividad = act.fecha;

                        if (fechaActividad.includes("T")) {
                            fechaActividad = fechaActividad.split("T")[0];
                        }

                        if (fechaActividad.includes(" ")) {
                            fechaActividad = fechaActividad.split(" ")[0];
                        }

                        return fechaActividad === fecha;
                    } catch (error) {
                        return false;
                    }
                });
            }

            actividadesFiltradas = filtered;
            renderizarTabla();

            return filtered;
        } catch (error) {
            actividadesFiltradas = [];
            renderizarTabla();
            return [];
        }
    }

    /**
     * Función de debugging para verificar fechas (Vacía sin logs)
     */
    function debugFechasActividades() {}

    /**
     * Actualizar estadísticas
     */
    function actualizarEstadisticas() {
        try {
            if (!Array.isArray(actividadesFiltradas)) {
                actividadesFiltradas = [];
            }

            const total = actividadesFiltradas.length;
            const pendientes = actividadesFiltradas.filter(
                (act) =>
                    act &&
                    act.estado &&
                    act.estado.toLowerCase() === "pendiente"
            ).length;

            const completadas = actividadesFiltradas.filter(
                (act) =>
                    act &&
                    act.estado &&
                    act.estado.toLowerCase() === "completado"
            ).length;

            const reprogramadas = actividadesFiltradas.filter(
                (act) =>
                    act &&
                    act.estado &&
                    act.estado.toLowerCase() === "reprogramado"
            ).length;

            if (totalActividades) totalActividades.textContent = total;
            if (pendientesCount) pendientesCount.textContent = pendientes;
            if (completadasCount) completadasCount.textContent = completadas;
            if (reprogramadasCount)
                reprogramadasCount.textContent = reprogramadas;
        } catch (error) {}
    }

    /**
     * Limpiar filtros
     */
    function limpiarFiltros() {
        if (filtroEstado) filtroEstado.value = "todos";
        if (filtroFecha) filtroFecha.value = "";

        actividadesFiltradas = [...actividadesCargadas];
        renderizarTabla();

        mostrarMensaje("Filtros limpiados correctamente", "success");
    }

    /**
     * Mostrar mensaje temporal
     */
    function mostrarMensaje(mensaje, tipo = "success") {
        try {
            const mensajeElement = document.createElement("div");
            mensajeElement.textContent = mensaje;
            mensajeElement.className = `notification ${tipo}`;
            mensajeElement.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                animation: fadeInOut 3s ease-in-out;
            `;

            document.body.appendChild(mensajeElement);

            setTimeout(() => {
                if (mensajeElement.parentNode) {
                    document.body.removeChild(mensajeElement);
                }
            }, 3000);
        } catch (error) {}
    }

    /**
     * Formatear hora correctamente para input HTML
     */
    function formatearHoraParaInput(hora) {
        try {
            if (!hora) return "09:00";

            if (/^\d{2}:\d{2}$/.test(hora)) {
                return hora;
            }

            if (hora.includes("T")) {
                const fecha = new Date(hora);
                if (!isNaN(fecha.getTime())) {
                    const horas = fecha.getHours().toString().padStart(2, "0");
                    const minutos = fecha
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                    return `${horas}:${minutos}`;
                }
            }

            const partes = hora.split(":");
            if (partes.length >= 2) {
                return `${partes[0].padStart(2, "0")}:${partes[1].padStart(
                    2,
                    "0"
                )}`;
            }

            return "09:00";
        } catch (error) {
            return "09:00";
        }
    }

    /**
     * Abrir modal de reprogramación
     */
    function abrirModalReprogramar(actividad) {
        try {
            if (
                !actividad ||
                !modalReprogramar ||
                !fechaReprogramar ||
                !horaReprogramar
            ) {
                mostrarMensaje(
                    "Error: No se puede abrir el modal de reprogramación",
                    "error"
                );
                return;
            }

            actividadAReprogramar = actividad;

            const fechaActual = actividad.fecha
                ? new Date(actividad.fecha).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0];

            const horaActual = formatearHoraParaInput(actividad.hora);

            fechaReprogramar.value = fechaActual;
            horaReprogramar.value = horaActual;

            const hoy = new Date().toISOString().split("T")[0];
            fechaReprogramar.min = hoy;

            modalReprogramar.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        } catch (error) {
            mostrarMensaje(
                "Error al abrir el formulario de reprogramación",
                "error"
            );
        }
    }

    /**
     * Cerrar modal de reprogramación
     */
    function cerrarModalReprogramar() {
        try {
            modalReprogramar.classList.add("hidden");
            document.body.style.overflow = "auto";

            actividadAReprogramar = null;

            if (formReprogramar) {
                formReprogramar.reset();
            }
        } catch (error) {}
    }

    /**
     * Guardar reprogramación
     */
    async function guardarReprogramacion(e) {
        if (e) e.preventDefault();

        try {
            if (
                !actividadAReprogramar ||
                !fechaReprogramar ||
                !horaReprogramar
            ) {
                throw new Error("Datos de reprogramación no válidos");
            }

            const nuevaFecha = fechaReprogramar.value;
            const nuevaHora = horaReprogramar.value;

            if (!nuevaFecha || !nuevaHora) {
                throw new Error("Fecha y hora son requeridas");
            }

            const fechaSeleccionada = new Date(nuevaFecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada < hoy) {
                throw new Error("No se puede reprogramar a una fecha pasada");
            }

            const actualizado = await actualizarActividadEnServidor(
                actividadAReprogramar.id,
                {
                    fecha: nuevaFecha,
                    hora: nuevaHora,
                    estado: "Pendiente",
                }
            );

            if (actualizado) {
                const index = actividadesCargadas.findIndex(
                    (act) => act.id === actividadAReprogramar.id
                );
                if (index !== -1) {
                    actividadesCargadas[index].fecha = nuevaFecha;
                    actividadesCargadas[index].hora = nuevaHora;
                    actividadesCargadas[index].estado = "Pendiente";
                }

                mostrarMensaje("Actividad reprogramada correctamente");
                cerrarModalReprogramar();

                await cargarActividades();
                aplicarFiltros();
            } else {
                throw new Error("No se pudo reprogramar en el servidor");
            }
        } catch (error) {
            mostrarMensaje(`Error al reprogramar: ${error.message}`, "error");
        }
    }

    /**
     * Renderizar tabla de actividades
     */
    async function renderizarTabla() {
        try {
            if (!actividadesBody) {
                return;
            }

            actividadesBody.innerHTML = "";

            if (!Array.isArray(actividadesFiltradas)) {
                actividadesFiltradas = [];
            }

            if (actividadesFiltradas.length === 0) {
                if (mensajeVacio) {
                    mensajeVacio.style.display = "block";
                }
                return;
            } else {
                if (mensajeVacio) {
                    mensajeVacio.style.display = "none";
                }
            }

            actividadesFiltradas.forEach((act) => {
                renderizarFilaActividad(act);
            });

            actualizarEstadisticas();
        } catch (error) {
            mostrarMensaje("Error al mostrar actividades", "error");
        }
    }

    /**
     * Renderizar fila de actividad
     */
    function renderizarFilaActividad(actividad) {
        try {
            if (!actividad || !actividadesBody) return;

            let nombreEmpresa = "Empresa no disponible";
            if (actividad.empresa_id && Array.isArray(empresasCargadas)) {
                const empresa = empresasCargadas.find(
                    (emp) =>
                        emp &&
                        emp.id &&
                        emp.id.toString() === actividad.empresa_id.toString()
                );
                if (empresa && empresa.nombre) {
                    nombreEmpresa = empresa.nombre;
                }
            }

            const isCompletado =
                actividad.estado &&
                actividad.estado.toLowerCase() === "completado";
            const isReprogramado =
                actividad.estado &&
                actividad.estado.toLowerCase() === "reprogramado";

            let estadoClass = "";
            let estadoTexto = actividad.estado || "Pendiente";

            if (isCompletado) {
                estadoClass = "estado-completado";
                estadoTexto = "Completado";
            } else if (isReprogramado) {
                estadoClass = "estado-reprogramado";
                estadoTexto = "Reprogramado";
            } else {
                estadoClass = "estado-pendiente";
                estadoTexto = "Pendiente";
            }

            let fechaMostrar = "No especificada";
            if (actividad.fecha) {
                try {
                    const fechaObj = new Date(actividad.fecha);
                    fechaMostrar = fechaObj.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    });
                } catch (error) {}
            }

            let horaMostrar = "";
            if (actividad.hora) {
                const horaFormateada = formatearHoraParaInput(actividad.hora);
                horaMostrar = `<br><small class="text-gray-500">${horaFormateada}</small>`;
            }

            let botonReprogramarHTML = "";

            if (!isCompletado) {
                botonReprogramarHTML = `
                    <button class="btn-reprogramar px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-sm font-medium"
                            data-id="${actividad.id}">
                        📅 Reprogramar
                    </button>
                `;
            } else {
                botonReprogramarHTML = `
                    <span class="px-3 py-1 text-gray-400 text-sm cursor-not-allowed" title="Actividad completada">
                        📅 Reprogramar
                    </span>
                `;
            }

            const rowHTML = `
            <tr data-actividad-id="${actividad.id}" class="hover:bg-gray-50">
                <td class="px-4 py-3 border-b">${fechaMostrar}${horaMostrar}</td>
                <td class="px-4 py-3 border-b">${nombreEmpresa}</td>
                <td class="px-4 py-3 border-b">
                    <div class="objetivo-contenido">
                        <strong class="text-gray-800">${
                            actividad.objetivo || "Sin objetivo"
                        }</strong>
                        ${
                            actividad.datos_adicionales
                                ? `<br><small class="text-gray-600 text-sm">${actividad.datos_adicionales}</small>`
                                : ""
                        }
                    </div>
                </td>
                <td class="px-4 py-3 border-b">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${estadoClass}">
                        ${estadoTexto}
                    </span>
                </td>
                <td class="px-4 py-3 border-b text-center">
                    <input type="checkbox" 
                           data-id="${actividad.id}" 
                           data-field="completado" 
                           ${isCompletado ? "checked" : ""}
                           ${isReprogramado ? "disabled" : ""}
                           class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                           ${isCompletado ? "disabled" : ""}>
                </td>
                <td class="px-4 py-3 border-b text-center">
                    ${botonReprogramarHTML}
                </td>
                <td class="px-4 py-3 border-b text-center">
                    <button class="btn-eliminar px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-sm font-medium"
                            data-id="${actividad.id}">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
            `;

            actividadesBody.insertAdjacentHTML("beforeend", rowHTML);
        } catch (error) {}
    }

    /**
     * Agregar event listeners
     */
    function agregarEventListeners() {
        try {
            if (actividadesBody) {
                actividadesBody.addEventListener(
                    "change",
                    async function (event) {
                        const target = event.target;
                        const id = parseInt(target.getAttribute("data-id"));
                        const field = target.getAttribute("data-field");

                        if (!id || field !== "completado") return;

                        await manejarCompletado(id, target.checked);
                    }
                );

                actividadesBody.addEventListener(
                    "click",
                    async function (event) {
                        if (
                            event.target.classList.contains("btn-reprogramar")
                        ) {
                            const id = parseInt(
                                event.target.getAttribute("data-id")
                            );
                            const actividad = actividadesCargadas.find(
                                (act) => act.id === id
                            );

                            if (actividad && !event.target.disabled) {
                                abrirModalReprogramar(actividad);
                            }
                        }

                        if (event.target.classList.contains("btn-eliminar")) {
                            const id = parseInt(
                                event.target.getAttribute("data-id")
                            );
                            await eliminarActividad(id);
                        }
                    }
                );
            }

            if (filtroEstado) {
                filtroEstado.addEventListener("change", aplicarFiltros);
            }

            if (filtroFecha) {
                filtroFecha.addEventListener("change", aplicarFiltros);
            }

            if (btnLimpiarFiltros) {
                btnLimpiarFiltros.addEventListener("click", limpiarFiltros);
            }

            if (btnCancelarReprogramar) {
                btnCancelarReprogramar.addEventListener(
                    "click",
                    cerrarModalReprogramar
                );
            }

            if (btnGuardarReprogramar) {
                btnGuardarReprogramar.addEventListener(
                    "click",
                    guardarReprogramacion
                );
            }

            if (modalReprogramar) {
                modalReprogramar.addEventListener("click", function (e) {
                    if (e.target === modalReprogramar) {
                        cerrarModalReprogramar();
                    }
                });
            }

            if (formReprogramar) {
                formReprogramar.addEventListener("submit", function (e) {
                    e.preventDefault();
                    guardarReprogramacion(e);
                });
            }

            if (document.getElementById("btn-cerrar-modal")) {
                document
                    .getElementById("btn-cerrar-modal")
                    .addEventListener("click", cerrarModalReprogramar);
            }
        } catch (error) {}
    }

    /**
     * Manejar completado de actividad
     */
    async function manejarCompletado(id, isChecked) {
        try {
            if (
                isChecked &&
                !confirm(
                    "¿Estás seguro de que quieres marcar esta actividad como COMPLETADA?"
                )
            ) {
                await renderizarTabla();
                return;
            }

            const nuevoEstado = isChecked ? "Completado" : "Pendiente";

            const actualizado = await actualizarActividadEnServidor(id, {
                estado: nuevoEstado,
            });

            if (actualizado) {
                const index = actividadesCargadas.findIndex(
                    (act) => act.id === id
                );
                if (index !== -1) {
                    actividadesCargadas[index].estado = nuevoEstado;
                }

                mostrarMensaje("Actividad actualizada correctamente");
                await cargarActividades();
                aplicarFiltros();
            } else {
                throw new Error("No se pudo actualizar en el servidor");
            }
        } catch (error) {
            mostrarMensaje("Error al actualizar la actividad", "error");
            await renderizarTabla();
        }
    }

    /**
     * Eliminar actividad
     */
    async function eliminarActividad(id) {
        try {
            if (
                !confirm(
                    "¿Estás seguro de que quieres eliminar esta actividad?"
                )
            ) {
                return;
            }

            const response = await fetch(`/api/actividades/${id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                mostrarMensaje("Actividad eliminada correctamente");
                await cargarActividades();
                aplicarFiltros();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            mostrarMensaje("Error al eliminar la actividad", "error");
        }
    }

    /**
     * Actualizar actividad en SQL Server
     */
    async function actualizarActividadEnServidor(id, datos) {
        try {
            const response = await fetch(`/api/actividades/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(datos),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`
                );
            }

            const result = await response.json();

            if (result.success) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    async function inicializar() {
        try {
            await cargarEmpresas();
            await cargarEmpresaActual();
            await cargarActividades();

            debugFechasActividades();

            await renderizarTabla();
            agregarEventListeners();
        } catch (error) {
            mostrarMensaje(
                "Error al inicializar la página de actividades",
                "error"
            );
        }
    }

    inicializar();
});
