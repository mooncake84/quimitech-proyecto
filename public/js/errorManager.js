// errorManager.js - Gestión de errores
const errorManager = {
    mostrarError: function (mensaje, tipo = "error", duracion = 5000) {
        const errorContainer = document.getElementById(
            "global-error-container"
        );
        if (!errorContainer) {
            // Crear contenedor si no existe
            const newContainer = document.createElement("div");
            newContainer.id = "global-error-container";
            newContainer.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
      `;
            document.body.appendChild(newContainer);
        }

        const finalContainer = document.getElementById(
            "global-error-container"
        );
        const errorDiv = document.createElement("div");
        errorDiv.className = `error-mensaje ${
            tipo === "warning" ? "warning" : ""
        } ${tipo === "success" ? "success" : ""}`;
        errorDiv.textContent = mensaje;
        errorDiv.style.cssText = `
      margin-bottom: 10px;
      padding: 12px 16px;
      border-radius: 6px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
    `;

        // Colores según el tipo
        if (tipo === "success") {
            errorDiv.style.backgroundColor = "#d4edda";
            errorDiv.style.color = "#155724";
            errorDiv.style.borderLeft = "4px solid #28a745";
        } else if (tipo === "warning") {
            errorDiv.style.backgroundColor = "#fff3cd";
            errorDiv.style.color = "#856404";
            errorDiv.style.borderLeft = "4px solid #ffc107";
        } else {
            errorDiv.style.backgroundColor = "#f8d7da";
            errorDiv.style.color = "#721c24";
            errorDiv.style.borderLeft = "4px solid #dc3545";
        }

        finalContainer.appendChild(errorDiv);

        // Auto-eliminar después del tiempo especificado
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = "slideOutRight 0.3s ease";
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.remove();
                    }
                }, 300);
            }
        }, duracion);
    },

    validarDatosEmpresa: function (companyId) {
        if (!DATOS_EMPRESAS || !DATOS_EMPRESAS[companyId]) {
            throw new Error(`Empresa con ID "${companyId}" no encontrada`);
        }

        const empresa = DATOS_EMPRESAS[companyId];
        if (!empresa.nombre || !empresa.giro || !empresa.direccion) {
            throw new Error("Datos incompletos de la empresa");
        }
    },

    mostrarErrorCargaEmpresa: function (companyId) {
        this.mostrarError(
            `No se pudo cargar la información de la empresa seleccionada (ID: ${companyId})`
        );
    },

    mostrarErrorLocalStorage: function (operacion) {
        this.mostrarError(
            `Error al ${operacion}. Verifique que su navegador soporte localStorage.`
        );
    },
};
