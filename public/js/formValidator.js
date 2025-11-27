// formValidator.js - Validaciones centralizadas de formularios
class FormValidator {
    constructor() {
        this.errores = [];
    }

    // Validación principal para programación de actividades
    validarProgramacionActividad(formData) {
        this.errores = [];

        const { fecha, hora, objetivo, datosAdicionales } = formData;

        // Validar campos requeridos
        if (!fecha) this.agregarError("La fecha de visita es obligatoria");
        if (!hora) this.agregarError("La hora estimada es obligatoria");
        if (!objetivo)
            this.agregarError("El objetivo de la visita es obligatorio");

        // Validaciones de formato y contenido
        if (fecha) this.validarFecha(fecha);
        if (hora) this.validarHora(hora);
        if (objetivo) this.validarObjetivo(objetivo);
        if (datosAdicionales) this.validarDatosAdicionales(datosAdicionales);

        return {
            esValido: this.errores.length === 0,
            errores: [...this.errores],
        };
    }

    validarFecha(fecha) {
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaObj < hoy) {
            this.agregarError(
                "No se pueden programar actividades para fechas pasadas"
            );
        }

        // Validar que no sea más de 1 año en el futuro
        const maxFecha = new Date();
        maxFecha.setFullYear(hoy.getFullYear() + 1);
        if (fechaObj > maxFecha) {
            this.agregarError(
                "No se pueden programar actividades con más de 1 año de anticipación"
            );
        }

        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            this.agregarError("Formato de fecha inválido. Use YYYY-MM-DD");
        }
    }

    validarHora(hora) {
        if (!/^\d{2}:\d{2}$/.test(hora)) {
            this.agregarError("Formato de hora inválido. Use HH:MM (24 horas)");
            return;
        }

        const [horas, minutos] = hora.split(":").map(Number);

        if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
            this.agregarError("Hora inválida. Rango permitido: 00:00 - 23:59");
        }

        // Validar que no sea en horario no laboral (opcional)
        if (horas < 7 || horas > 21) {
            this.agregarError(
                "Advertencia: La hora está fuera del horario laboral típico (7:00 - 21:00)",
                "warning"
            );
        }
    }

    validarObjetivo(objetivo) {
        const objetivoLimpio = objetivo.trim();

        if (objetivoLimpio.length < 10) {
            this.agregarError("El objetivo debe tener al menos 10 caracteres");
        }

        if (objetivoLimpio.length > 500) {
            this.agregarError(
                "El objetivo no puede exceder los 500 caracteres"
            );
        }

        // Validar contenido mínimo (debe tener al menos 2 palabras)
        const palabras = objetivoLimpio
            .split(/\s+/)
            .filter((palabra) => palabra.length > 0);
        if (palabras.length < 2) {
            this.agregarError("El objetivo debe contener al menos 2 palabras");
        }

        // Palabras prohibidas o inapropiadas
        const palabrasProhibidas = ["prueba", "test", "xxxx", "aaaa"];
        const contieneProhibidas = palabrasProhibidas.some((palabra) =>
            objetivoLimpio.toLowerCase().includes(palabra)
        );

        if (contieneProhibidas) {
            this.agregarError("El objetivo contiene palabras no permitidas");
        }
    }

    validarDatosAdicionales(datos) {
        if (datos.length > 1000) {
            this.agregarError(
                "Los datos adicionales no pueden exceder los 1000 caracteres"
            );
        }
    }

    // Validación para campos de texto general
    validarTexto(texto, campo, minLength = 1, maxLength = 1000) {
        if (!texto || texto.trim().length === 0) {
            this.agregarError(`El campo ${campo} es obligatorio`);
            return false;
        }

        if (texto.trim().length < minLength) {
            this.agregarError(
                `El campo ${campo} debe tener al menos ${minLength} caracteres`
            );
            return false;
        }

        if (texto.length > maxLength) {
            this.agregarError(
                `El campo ${campo} no puede exceder los ${maxLength} caracteres`
            );
            return false;
        }

        return true;
    }

    // Sanitización básica de entrada
    sanitizarInput(input) {
        if (typeof input !== "string") return input;

        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<[^>]*>/g, "")
            .trim()
            .substring(0, 5000); // límite máximo
    }

    agregarError(mensaje, tipo = "error") {
        this.errores.push({ mensaje, tipo });
    }

    limpiarErrores() {
        this.errores = [];
    }

    // Método para mostrar errores en la UI
    mostrarErroresEnUI(contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        contenedor.innerHTML = "";

        this.errores.forEach((error) => {
            const errorElement = document.createElement("div");
            errorElement.className = `error-item ${error.tipo}`;
            errorElement.style.cssText = `
                padding: 10px;
                margin: 5px 0;
                border-radius: 4px;
                border-left: 4px solid ${
                    error.tipo === "warning" ? "#ff9800" : "#f44336"
                };
                background-color: ${
                    error.tipo === "warning" ? "#fff3e0" : "#ffebee"
                };
                color: ${error.tipo === "warning" ? "#e65100" : "#c62828"};
            `;
            errorElement.textContent = error.mensaje;
            contenedor.appendChild(errorElement);
        });
    }
}

// Instancia global
const formValidator = new FormValidator();
