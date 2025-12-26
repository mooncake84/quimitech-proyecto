// areas_management_script.js - Gestión completa de áreas
document.addEventListener("DOMContentLoaded", function () {
    const empresaId = 1; // ID del Rastro Torreón
    const areasGrid = document.getElementById("areas-grid");
    const loadingIndicator = document.getElementById("loading-areas");
    const btnRefresh = document.getElementById("btn-refresh-areas");
    const btnNuevaArea = document.getElementById("btn-nueva-area");
    const newAreaForm = document.getElementById("new-area-form");
    const formNuevaArea = document.getElementById("form-nueva-area");
    const btnCancelarNueva = document.getElementById("btn-cancelar-nueva");
    const editModal = document.getElementById("edit-modal");
    const formEditarArea = document.getElementById("form-editar-area");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");
    const notification = document.getElementById("notification");
    const totalAreasSpan = document.getElementById("total-areas");
    const ultimaActualizacionSpan = document.getElementById(
        "ultima-actualizacion"
    );

    let areasCargadas = [];

    /**
     * Mostrar notificación
     */
    function mostrarNotificacion(mensaje, tipo = "success") {
        notification.textContent = mensaje;
        notification.className = `notification ${tipo}`;
        notification.style.display = "block";

        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }

    /**
     * Mostrar/ocultar loading
     */
    function toggleLoading(mostrar) {
        if (mostrar) {
            loadingIndicator.style.display = "block";
            areasGrid.style.display = "none";
        } else {
            loadingIndicator.style.display = "none";
            areasGrid.style.display = "grid";
        }
    }

    /**
     * Cargar áreas desde la API
     */
    async function cargarAreas() {
        try {
            toggleLoading(true);

            const response = await fetch(`/api/empresas/${empresaId}/areas`);
            const result = await response.json();

            if (result.success) {
                areasCargadas = result.data;
                renderizarAreas();
                actualizarEstadisticas();
                mostrarNotificacion(
                    `✅ ${areasCargadas.length} áreas cargadas`,
                    "success"
                );
            } else {
                throw new Error(result.message || "Error al cargar áreas");
            }
        } catch (error) {
            console.error("Error cargando áreas:", error);
            mostrarNotificacion("❌ Error al cargar áreas", "error");
        } finally {
            toggleLoading(false);
        }
    }

    /**
     * Renderizar áreas en la grid
     */
    function renderizarAreas() {
        areasGrid.innerHTML = "";

        if (areasCargadas.length === 0) {
            areasGrid.innerHTML = `
                <div class="no-areas" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p style="color: #718096; font-size: 1.1rem;">
                        No hay áreas registradas para esta empresa.
                    </p>
                    <button id="btn-agregar-primera" class="btn btn-primary" style="margin-top: 20px;">
                        ➕ Agregar Primera Área
                    </button>
                </div>
            `;

            document
                .getElementById("btn-agregar-primera")
                ?.addEventListener("click", mostrarFormNueva);
            return;
        }

        // Ordenar áreas alfabéticamente
        const areasOrdenadas = [...areasCargadas].sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
        );

        areasOrdenadas.forEach((area) => {
            const areaCard = document.createElement("div");
            areaCard.className = "area-card";
            areaCard.dataset.areaId = area.id;

            // Formatear fecha
            const fechaCreacion = new Date(area.created_at);
            const fechaFormateada = fechaCreacion.toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

            areaCard.innerHTML = `
                <h3>${area.nombre}</h3>
                <div class="descripcion">${
                    area.descripcion || "Sin descripción"
                }</div>
                <div class="fecha">Creada: ${fechaFormateada}</div>
                <div class="area-actions">
                    <button class="btn-small btn-edit" data-id="${area.id}">
                        ✏️ Editar
                    </button>
                    <button class="btn-small btn-delete" data-id="${area.id}">
                        🗑️ Eliminar
                    </button>
                </div>
            `;

            areasGrid.appendChild(areaCard);
        });

        // Agregar event listeners a los botones
        agregarEventListenersAreas();
    }

    /**
     * Agregar event listeners a las tarjetas de área
     */
    function agregarEventListenersAreas() {
        // Botones de editar
        document.querySelectorAll(".btn-edit").forEach((btn) => {
            btn.addEventListener("click", function () {
                const areaId = this.dataset.id;
                const area = areasCargadas.find((a) => a.id == areaId);
                if (area) {
                    abrirModalEdicion(area);
                }
            });
        });

        // Botones de eliminar
        document.querySelectorAll(".btn-delete").forEach((btn) => {
            btn.addEventListener("click", function () {
                const areaId = this.dataset.id;
                const area = areasCargadas.find((a) => a.id == areaId);
                if (area) {
                    eliminarArea(areaId, area.nombre);
                }
            });
        });
    }

    /**
     * Actualizar estadísticas
     */
    function actualizarEstadisticas() {
        totalAreasSpan.textContent = areasCargadas.length;

        if (areasCargadas.length > 0) {
            // Encontrar la fecha más reciente
            const fechas = areasCargadas.map(
                (a) => new Date(a.updated_at || a.created_at)
            );
            const fechaMasReciente = new Date(Math.max(...fechas));

            ultimaActualizacionSpan.textContent =
                fechaMasReciente.toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
        } else {
            ultimaActualizacionSpan.textContent = "No disponible";
        }
    }

    /**
     * Mostrar formulario de nueva área
     */
    function mostrarFormNueva() {
        newAreaForm.style.display = "block";
        newAreaForm.scrollIntoView({ behavior: "smooth" });
    }

    /**
     * Ocultar formulario de nueva área
     */
    function ocultarFormNueva() {
        newAreaForm.style.display = "none";
        formNuevaArea.reset();
    }

    /**
     * Abrir modal de edición
     */
    function abrirModalEdicion(area) {
        document.getElementById("edit-area-id").value = area.id;
        document.getElementById("edit-area-nombre").value = area.nombre;
        document.getElementById("edit-area-descripcion").value =
            area.descripcion || "";

        editModal.style.display = "flex";
    }

    /**
     * Cerrar modal de edición
     */
    function cerrarModalEdicion() {
        editModal.style.display = "none";
        formEditarArea.reset();
    }

    /**
     * Crear nueva área
     */
    formNuevaArea.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nombre = document.getElementById("area-nombre").value.trim();
        const descripcion = document
            .getElementById("area-descripcion")
            .value.trim();

        if (!nombre) {
            mostrarNotificacion("❌ El nombre del área es requerido", "error");
            return;
        }

        try {
            const response = await fetch("/api/empresa-areas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify({
                    empresa_id: empresaId,
                    nombre: nombre,
                    descripcion: descripcion,
                }),
            });

            const result = await response.json();

            if (result.success) {
                mostrarNotificacion("✅ Área creada exitosamente", "success");
                ocultarFormNueva();
                await cargarAreas(); // Recargar la lista
            } else {
                throw new Error(result.message || "Error al crear área");
            }
        } catch (error) {
            console.error("Error creando área:", error);
            mostrarNotificacion(
                "❌ Error al crear área: " + error.message,
                "error"
            );
        }
    });

    /**
     * Actualizar área existente
     */
    formEditarArea.addEventListener("submit", async function (e) {
        e.preventDefault();

        const areaId = document.getElementById("edit-area-id").value;
        const nombre = document.getElementById("edit-area-nombre").value.trim();
        const descripcion = document
            .getElementById("edit-area-descripcion")
            .value.trim();

        if (!nombre) {
            mostrarNotificacion("❌ El nombre del área es requerido", "error");
            return;
        }

        try {
            const response = await fetch(`/api/empresa-areas/${areaId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify({
                    nombre: nombre,
                    descripcion: descripcion,
                }),
            });

            const result = await response.json();

            if (result.success) {
                mostrarNotificacion(
                    "✅ Área actualizada exitosamente",
                    "success"
                );
                cerrarModalEdicion();
                await cargarAreas(); // Recargar la lista
            } else {
                throw new Error(result.message || "Error al actualizar área");
            }
        } catch (error) {
            console.error("Error actualizando área:", error);
            mostrarNotificacion(
                "❌ Error al actualizar área: " + error.message,
                "error"
            );
        }
    });

    /**
     * Eliminar área
     */
    async function eliminarArea(areaId, areaNombre) {
        if (
            !confirm(
                `¿Estás seguro de que deseas eliminar el área "${areaNombre}"?\nEsta acción no se puede deshacer.`
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/empresa-areas/${areaId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
            });

            const result = await response.json();

            if (result.success) {
                mostrarNotificacion(
                    `🗑️ Área "${areaNombre}" eliminada`,
                    "success"
                );
                await cargarAreas(); // Recargar la lista
            } else {
                throw new Error(result.message || "Error al eliminar área");
            }
        } catch (error) {
            console.error("Error eliminando área:", error);
            mostrarNotificacion(
                "❌ Error al eliminar área: " + error.message,
                "error"
            );
        }
    }

    /**
     * Event Listeners principales
     */
    btnRefresh.addEventListener("click", cargarAreas);

    btnNuevaArea.addEventListener("click", mostrarFormNueva);

    btnCancelarNueva.addEventListener("click", ocultarFormNueva);

    btnCloseModal.addEventListener("click", cerrarModalEdicion);

    btnCancelarEdicion.addEventListener("click", cerrarModalEdicion);

    // Cerrar modal al hacer clic fuera
    editModal.addEventListener("click", function (e) {
        if (e.target === editModal) {
            cerrarModalEdicion();
        }
    });

    /**
     * Inicializar
     */
    async function inicializar() {
        console.log("🚀 Inicializando gestión de áreas...");
        await cargarAreas();
        console.log("✅ Gestión de áreas inicializada");
    }

    inicializar();
});
