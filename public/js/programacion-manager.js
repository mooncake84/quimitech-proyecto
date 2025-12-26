// public/js/programacion-manager.js - VERSIÓN CORREGIDA
class ProgramacionManager {
    constructor() {
        this.actividades = [];
        this.init();
    }

    async init() {
        await this.cargarActividades();
        this.setupEventListeners();
        this.ajustarAlturaContenedores();
    }

    // Nueva función para ajustar alturas dinámicamente
    ajustarAlturaContenedores() {
        const activitiesGrid = document.getElementById("activitiesList");
        const activitiesSection = document.querySelector(".activities-section");

        if (activitiesGrid && activitiesSection) {
            const headerHeight =
                activitiesSection.querySelector("h2").offsetHeight;
            const statsHeight = document.querySelector(
                ".estadisticas-programacion"
            ).offsetHeight;
            const filtersHeight = document.querySelector(
                ".filtros-programacion"
            ).offsetHeight;
            const padding = 40; // Padding adicional

            const availableHeight =
                activitiesSection.offsetHeight -
                headerHeight -
                statsHeight -
                filtersHeight -
                padding;

            if (availableHeight > 200) {
                activitiesGrid.style.maxHeight = availableHeight + "px";
            }
        }
    }

    async cargarActividades() {
        try {
            // Mostrar loading
            const activitiesList = document.getElementById("activitiesList");
            if (activitiesList) {
                activitiesList.innerHTML = `
                    <div class="loading-actividades">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Cargando actividades...</span>
                        </div>
                        <p>Cargando actividades...</p>
                    </div>
                `;
            }

            const response = await fetch("/api/actividades");
            if (!response.ok) throw new Error("Error al cargar actividades");

            this.actividades = await response.json();
            this.mostrarActividades();
        } catch (error) {
            console.error("Error cargando actividades:", error);
            this.mostrarError("Error al cargar las actividades");
            this.mostrarEstadoVacio();
        }
    }

    mostrarActividades(actividadesFiltradas = null) {
        const actividades = actividadesFiltradas || this.actividades;
        const container = document.getElementById("activitiesList");

        if (!container) return;

        if (actividades.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        container.innerHTML = actividades
            .map((actividad) => this.crearCardActividad(actividad))
            .join("");

        // Reajustar altura después de renderizar
        setTimeout(() => this.ajustarAlturaContenedores(), 100);
    }

    crearCardActividad(actividad) {
        const fecha = new Date(actividad.fecha).toLocaleDateString("es-ES");
        const objetivo = this.escapeHtml(actividad.objetivo || "");
        const datosAdicionales = this.escapeHtml(
            actividad.datos_adicionales || ""
        );
        const empresaNombre = this.escapeHtml(
            actividad.empresa?.nombre || "N/A"
        );

        return `
            <div class="activity-card ${
                actividad.estado?.toLowerCase() || "pendiente"
            }" 
                 data-estado="${actividad.estado}" 
                 data-fecha="${actividad.fecha}"
                 data-empresa="${empresaNombre}"
                 data-objetivo="${objetivo}">
                
                <div class="activity-header">
                    <h4 title="${objetivo}">${this.limitarTexto(
            objetivo,
            60
        )}</h4>
                    <span class="activity-status status-${
                        actividad.estado?.toLowerCase() || "pendiente"
                    }">
                        ${actividad.estado || "Pendiente"}
                    </span>
                </div>
                
                <div class="activity-details">
                    <div class="detail-item">
                        <i class="fas fa-building"></i>
                        <div>
                            <strong>Empresa:</strong> ${empresaNombre}
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <strong>Fecha:</strong> ${fecha}
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Hora:</strong> ${
                                actividad.hora || "No especificada"
                            }
                        </div>
                    </div>
                    
                    ${
                        datosAdicionales
                            ? `
                    <div class="detail-item">
                        <i class="fas fa-sticky-note"></i>
                        <div>
                            <strong>Notas:</strong> ${this.limitarTexto(
                                datosAdicionales,
                                100
                            )}
                        </div>
                    </div>
                    `
                            : ""
                    }
                </div>

                <div class="activity-actions">
                    <button class="btn btn-editar" onclick="programacionManager.editarActividad(${
                        actividad.id
                    })">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    
                    ${
                        actividad.estado !== "Completado"
                            ? `
                    <button class="btn btn-completar" onclick="programacionManager.cambiarEstado(${actividad.id}, 'Completado')">
                        <i class="fas fa-check"></i> Completar
                    </button>
                    `
                            : ""
                    }
                    
                    <button class="btn btn-eliminar" onclick="programacionManager.eliminarActividad(${
                        actividad.id
                    })">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    filterActivities() {
        const estado = document.getElementById("filterEstado")?.value;
        const fecha = document.getElementById("filterFecha")?.value;
        const empresa = document
            .getElementById("searchEmpresa")
            ?.value.toLowerCase();
        const objetivo = document
            .getElementById("searchObjetivo")
            ?.value.toLowerCase();

        let actividadesFiltradas = this.actividades;

        if (estado) {
            actividadesFiltradas = actividadesFiltradas.filter(
                (a) => a.estado === estado
            );
        }

        if (fecha) {
            actividadesFiltradas = actividadesFiltradas.filter(
                (a) => a.fecha === fecha
            );
        }

        if (empresa) {
            actividadesFiltradas = actividadesFiltradas.filter((a) =>
                a.empresa?.nombre?.toLowerCase().includes(empresa)
            );
        }

        if (objetivo) {
            actividadesFiltradas = actividadesFiltradas.filter((a) =>
                a.objetivo?.toLowerCase().includes(objetivo)
            );
        }

        this.mostrarActividades(actividadesFiltradas);
    }

    async eliminarActividad(id) {
        if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;

        try {
            const response = await fetch(`/api/actividades/${id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            const result = await response.json();

            if (result.success) {
                this.mostrarMensaje(
                    "Actividad eliminada correctamente",
                    "success"
                );
                await this.cargarActividades();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("Error eliminando actividad:", error);
            this.mostrarError("Error al eliminar la actividad");
        }
    }

    async cambiarEstado(id, nuevoEstado) {
        try {
            const response = await fetch(`/api/actividades/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            const result = await response.json();

            if (result.success) {
                this.mostrarMensaje(
                    `Estado cambiado a ${nuevoEstado}`,
                    "success"
                );
                await this.cargarActividades();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error("Error cambiando estado:", error);
            this.mostrarError("Error al cambiar el estado");
        }
    }

    editarActividad(id) {
        window.location.href = `/actividades?editar=${id}`;
    }

    mostrarEstadoVacio() {
        const container = document.getElementById("activitiesList");
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No hay actividades programadas</h3>
                    <p>Comienza creando tu primera actividad usando el formulario superior</p>
                </div>
            `;
        }
    }

    limitarTexto(texto, longitud) {
        return texto.length > longitud
            ? texto.substring(0, longitud) + "..."
            : texto;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    mostrarMensaje(mensaje, tipo = "info") {
        if (typeof errorManager !== "undefined") {
            errorManager.mostrarError(mensaje, tipo, 3000);
        } else {
            this.mostrarNotificacion(mensaje, tipo);
        }
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, "error");
    }

    mostrarNotificacion(mensaje, tipo = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${tipo}`;
        notification.innerHTML = mensaje;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    setupEventListeners() {
        // Reajustar altura cuando cambie el tamaño de la ventana
        window.addEventListener("resize", () => {
            this.ajustarAlturaContenedores();
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
    window.programacionManager = new ProgramacionManager();
});

// Funciones globales para los filtros
function filterActivities() {
    if (window.programacionManager) {
        window.programacionManager.filterActivities();
    }
}

function openCreateModal() {
    console.log("Abrir modal de creación");
}
