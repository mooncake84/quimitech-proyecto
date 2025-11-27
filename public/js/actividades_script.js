// actividades_script.js - ACTUALIZADO PARA LARAVEL + SQL SERVER
document.addEventListener("DOMContentLoaded", function () {
    const nombreEmpresaActual = document.getElementById(
        "nombre-empresa-actual"
    );
    const empresaActualIndicador = document.getElementById(
        "empresa-actual-indicador"
    );
    const actividadesBody = document.getElementById("actividades-body");
    const mensajeVacio = document.getElementById("mensaje-vacio");

    // Variables globales
    let empresasCargadas = [];
    let currentCompanyId = null;
    let actividadesCargadas = [];

    /**
     * Convertir IDs antiguos ("empresa1") a nuevos (1)
     */
    function convertirIdEmpresa(id) {
        if (typeof id === "string" && id.startsWith("empresa")) {
            const nuevoId = id.replace("empresa", "");
            console.log(`🔄 Convirtiendo ID: ${id} -> ${nuevoId}`);
            return nuevoId;
        }
        return id.toString();
    }

    /**
     * Cargar empresas desde SQL Server
     */
    async function cargarEmpresas() {
        try {
            console.log("🔍 Cargando empresas desde SQL Server...");

            empresasCargadas = await DataManager.cargarEmpresas();

            if (!empresasCargadas || empresasCargadas.length === 0) {
                throw new Error("No se pudieron cargar las empresas");
            }

            console.log("✅ Empresas cargadas:", empresasCargadas);
            return empresasCargadas;
        } catch (error) {
            console.error("❌ Error cargando empresas:", error);

            // Fallback a datos locales
            empresasCargadas = DataManager.getEmpresasLocales();
            console.warn("🔄 Usando datos locales como fallback");
            return empresasCargadas;
        }
    }

    /**
     * Cargar actividades desde SQL Server
     */
    async function cargarActividades() {
        try {
            console.log("🔍 Cargando actividades desde SQL Server...");

            actividadesCargadas = await DataManager.cargarActividades();

            if (!actividadesCargadas) {
                actividadesCargadas = [];
            }

            console.log("✅ Actividades cargadas:", actividadesCargadas);
            return actividadesCargadas;
        } catch (error) {
            console.error("❌ Error cargando actividades:", error);
            actividadesCargadas = [];
            return [];
        }
    }

    // Cargar y mostrar la empresa seleccionada
    async function cargarEmpresaActual() {
        try {
            let selectedCompanyId = convertirIdEmpresa(
                localStorage.getItem("selectedCompany") || "1"
            );

            // Cargar empresas si no están cargadas
            if (empresasCargadas.length === 0) {
                await cargarEmpresas();
            }

            // Buscar la empresa
            const empresa = empresasCargadas.find(
                (emp) => emp.id.toString() === selectedCompanyId.toString()
            );

            if (!empresa) {
                throw new Error(`Empresa ${selectedCompanyId} no encontrada`);
            }

            const nombreEmpresa = empresa.nombre;
            nombreEmpresaActual.textContent = `Empresa Actual: ${nombreEmpresa}`;
            empresaActualIndicador.innerHTML = `Mostrando actividades para: <strong>${nombreEmpresa}</strong>`;
            currentCompanyId = empresa.id.toString();

            return currentCompanyId;
        } catch (error) {
            console.error("Error cargando empresa actual:", error);

            // Fallback
            if (empresasCargadas.length > 0) {
                const primeraEmpresa = empresasCargadas[0];
                nombreEmpresaActual.textContent = `Empresa Actual: ${primeraEmpresa.nombre}`;
                empresaActualIndicador.innerHTML = `Mostrando actividades para: <strong>${primeraEmpresa.nombre}</strong>`;
                currentCompanyId = primeraEmpresa.id.toString();
                return currentCompanyId;
            }

            return "1";
        }
    }

    // Mostrar mensaje temporal
    function mostrarMensaje(mensaje, tipo = "success") {
        const mensajeElement = document.createElement("div");
        mensajeElement.textContent = mensaje;
        mensajeElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background-color: ${tipo === "success" ? "#4CAF50" : "#f44336"};
            color: white;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;

        document.body.appendChild(mensajeElement);

        setTimeout(() => {
            if (mensajeElement.parentNode) {
                document.body.removeChild(mensajeElement);
            }
        }, 3000);
    }

    // Cargar y renderizar la tabla de actividades
    async function renderizarTabla() {
        try {
            // Cargar actividades desde SQL Server
            await cargarActividades();

            const actividadesFiltradas = actividadesCargadas.filter(
                (act) =>
                    act.empresa_id &&
                    act.empresa_id.toString() === currentCompanyId.toString()
            );

            actividadesBody.innerHTML = "";

            if (actividadesFiltradas.length === 0) {
                mensajeVacio.style.display = "block";
                return;
            } else {
                mensajeVacio.style.display = "none";
            }

            actividadesFiltradas.forEach((act) => {
                const isCompletado = act.estado === "Completado";
                const isRetraso = act.estado === "Retraso";

                let estadoClass = "";
                if (isCompletado) estadoClass = "estado-completado";
                else if (isRetraso) estadoClass = "estado-retraso";
                else estadoClass = "estado-pendiente";

                // Obtener nombre de la empresa
                const empresa = empresasCargadas.find(
                    (emp) => emp.id.toString() === act.empresa_id.toString()
                );
                const nombreEmpresa = empresa
                    ? empresa.nombre
                    : "Empresa no disponible";

                const rowHTML = `
                <tr data-actividad-id="${act.id}">
                    <td>${act.fecha} <br> (${act.hora})</td>
                    <td>${nombreEmpresa}</td>
                    <td>${act.objetivo}<br><small style="color: #666;">${
                    act.datos_adicionales || ""
                }</small></td>
                    <td class="${estadoClass}">${act.estado || "Pendiente"}</td>
                    <td>
                        <input type="checkbox" 
                               data-id="${act.id}" 
                               data-field="completado" 
                               ${isCompletado ? "checked" : ""}
                               ${isRetraso ? "disabled" : ""}>
                    </td>
                    <td>
                        <input type="checkbox" 
                               data-id="${act.id}" 
                               data-field="retraso" 
                               ${isRetraso ? "checked" : ""}
                               ${isCompletado ? "disabled" : ""}>
                    </td>
                    <td>
                        <input type="text" 
                               class="input-tabla" 
                               data-id="${act.id}" 
                               data-field="pedido_entregado" 
                               value="${act.pedido_entregado || ""}"
                               placeholder="N° Pedido">
                    </td>
                    <td>
                        <input type="text" 
                               class="input-tabla" 
                               data-id="${act.id}" 
                               data-field="cantidad_entregada" 
                               value="${act.cantidad_entregada || ""}"
                               placeholder="Cant.">
                    </td>
                </tr>
                `;
                actividadesBody.insertAdjacentHTML("beforeend", rowHTML);
            });

            agregarEventListeners();
        } catch (error) {
            console.error("Error renderizando tabla:", error);
            mostrarMensaje("Error al cargar las actividades", "error");
        }
    }

    // Lógica para manejar interacciones del usuario
    function agregarEventListeners() {
        actividadesBody.addEventListener("change", async function (event) {
            const target = event.target;
            const id = parseInt(target.getAttribute("data-id"));
            const field = target.getAttribute("data-field");

            if (!id) return;

            if (field === "completado") {
                await manejarCompletado(id, target.checked);
            } else if (field === "retraso") {
                await manejarRetraso(id, target.checked);
            } else if (
                field === "pedido_entregado" ||
                field === "cantidad_entregada"
            ) {
                await actualizarCampo(id, field, target.value);
            }
        });
    }

    async function manejarCompletado(id, isChecked) {
        try {
            if (
                isChecked &&
                !confirm(
                    "¿Estás seguro de que quieres marcar esta actividad como COMPLETADA?"
                )
            ) {
                // Si el usuario cancela, volver a renderizar para desmarcar el checkbox
                await renderizarTabla();
                return;
            }

            const nuevoEstado = isChecked ? "Completado" : "Pendiente";

            // Actualizar en SQL Server
            const actualizado = await actualizarActividadEnServidor(id, {
                estado: nuevoEstado,
            });

            if (actualizado) {
                // Actualizar también en el array local
                const index = actividadesCargadas.findIndex(
                    (act) => act.id === id
                );
                if (index !== -1) {
                    actividadesCargadas[index].estado = nuevoEstado;
                }

                mostrarMensaje("Actividad actualizada correctamente");
                await renderizarTabla(); // Recargar para reflejar cambios
            } else {
                throw new Error("No se pudo actualizar en el servidor");
            }
        } catch (error) {
            console.error("Error actualizando estado:", error);
            mostrarMensaje("Error al actualizar la actividad", "error");
            await renderizarTabla(); // Recargar para revertir cambios visuales
        }
    }

    async function manejarRetraso(id, isChecked) {
        try {
            const nuevoEstado = isChecked ? "Retraso" : "Pendiente";

            // Actualizar en SQL Server
            const actualizado = await actualizarActividadEnServidor(id, {
                estado: nuevoEstado,
            });

            if (actualizado) {
                // Actualizar también en el array local
                const index = actividadesCargadas.findIndex(
                    (act) => act.id === id
                );
                if (index !== -1) {
                    actividadesCargadas[index].estado = nuevoEstado;
                }

                mostrarMensaje("Actividad actualizada correctamente");
                await renderizarTabla(); // Recargar para reflejar cambios
            } else {
                throw new Error("No se pudo actualizar en el servidor");
            }
        } catch (error) {
            console.error("Error actualizando retraso:", error);
            mostrarMensaje("Error al actualizar la actividad", "error");
            await renderizarTabla(); // Recargar para revertir cambios visuales
        }
    }

    async function actualizarCampo(id, campo, valor) {
        try {
            const datosActualizacion = {};
            datosActualizacion[campo] = valor;

            // Actualizar en SQL Server
            const actualizado = await actualizarActividadEnServidor(
                id,
                datosActualizacion
            );

            if (actualizado) {
                // Actualizar también en el array local
                const index = actividadesCargadas.findIndex(
                    (act) => act.id === id
                );
                if (index !== -1) {
                    actividadesCargadas[index][campo] = valor;
                }

                mostrarMensaje(
                    `${
                        campo === "pedido_entregado" ? "Pedido" : "Cantidad"
                    } actualizado correctamente`
                );
            } else {
                throw new Error("No se pudo actualizar en el servidor");
            }
        } catch (error) {
            console.error(`Error actualizando ${campo}:`, error);
            mostrarMensaje(
                `Error al actualizar ${
                    campo === "pedido_entregado" ? "pedido" : "cantidad"
                }`,
                "error"
            );
        }
    }

    /**
     * Actualizar actividad en SQL Server
     */
    async function actualizarActividadEnServidor(id, datos) {
        try {
            console.log(
                `💾 Actualizando actividad ${id} en SQL Server:`,
                datos
            );

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log("✅ Actividad actualizada en SQL Server");
                return true;
            } else {
                console.error("❌ Error del servidor:", result.message);
                return false;
            }
        } catch (error) {
            console.error("❌ Error actualizando actividad:", error);
            return false;
        }
    }

    /**
     * Inicialización
     */
    async function inicializar() {
        try {
            console.log("🚀 Inicializando página de actividades...");

            await cargarEmpresas();
            await cargarEmpresaActual();
            await renderizarTabla();

            console.log("✅ Página de actividades inicializada correctamente");
        } catch (error) {
            console.error("❌ Error en inicialización:", error);
            mostrarMensaje("Error al inicializar la página", "error");
        }
    }

    // Inicialización
    inicializar();
});
