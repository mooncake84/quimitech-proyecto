// empresa_registro_script.js - Sistema de registro de nuevas empresas
document.addEventListener("DOMContentLoaded", function () {
    const formNuevaEmpresa = document.getElementById("form-nueva-empresa");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnAgregarArea = document.getElementById("btn-agregar-area");
    const areasContainer = document.getElementById("areas-container");
    const mensajeExito = document.getElementById("mensaje-exito");
    const mensajeError = document.getElementById("mensaje-error");

    // Contador de áreas
    let areaCount = 1;

    /**
     * Agregar nueva área dinámica
     */
    btnAgregarArea.addEventListener("click", function () {
        areaCount++;
        const areaItem = document.createElement("div");
        areaItem.className = "area-item";
        areaItem.innerHTML = `
            <div class="area-form">
                <input type="text" name="areas[]" placeholder="Ej: ${getSugerenciaArea()}" 
                       class="area-input">
                <textarea name="descripciones[]" placeholder="Descripción del área" rows="2"></textarea>
                <button type="button" class="btn-remove-area">✕</button>
            </div>
        `;
        areasContainer.appendChild(areaItem);

        // Agregar evento al botón de eliminar
        const btnRemove = areaItem.querySelector(".btn-remove-area");
        btnRemove.addEventListener("click", function () {
            if (areasContainer.children.length > 1) {
                areaItem.remove();
            } else {
                alert("Debe haber al menos un área registrada");
            }
        });
    });

    /**
     * Obtener sugerencia de área basada en el giro
     */
    function getSugerenciaArea() {
        const giro = document.getElementById("giro").value.toLowerCase();
        if (giro.includes("rastro") || giro.includes("carne")) {
            return "Sacrificio";
        } else if (giro.includes("quim")) {
            return "Laboratorio";
        } else if (giro.includes("fabrica") || giro.includes("producción")) {
            return "Producción";
        } else if (giro.includes("alimento")) {
            return "Almacén";
        }
        return "Administración";
    }

    /**
     * Manejar eliminación de áreas
     */
    areasContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("btn-remove-area")) {
            const areaItem = e.target.closest(".area-item");
            if (areasContainer.children.length > 1) {
                areaItem.remove();
            } else {
                alert("Debe haber al menos un área registrada");
            }
        }
    });

    /**
     * Validar formulario
     */
    function validarFormulario(formData) {
        const errors = [];

        // Validar campos requeridos
        if (!formData.get("nombre") || formData.get("nombre").trim() === "") {
            errors.push("El nombre de la empresa es requerido");
        }

        if (!formData.get("giro") || formData.get("giro").trim() === "") {
            errors.push("El giro comercial es requerido");
        }

        if (
            !formData.get("telefono") ||
            formData.get("telefono").trim() === ""
        ) {
            errors.push("El teléfono es requerido");
        }

        if (
            !formData.get("contacto") ||
            formData.get("contacto").trim() === ""
        ) {
            errors.push("La persona de contacto es requerida");
        }

        if (
            !formData.get("direccion") ||
            formData.get("direccion").trim() === ""
        ) {
            errors.push("La dirección es requerida");
        }

        // Validar email si se proporcionó
        const email = formData.get("email");
        if (email && email.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push("El formato del email no es válido");
            }
        }

        return errors;
    }

    /**
     * Mostrar mensaje
     */
    function mostrarMensaje(elemento, texto, tipo = "success") {
        elemento.textContent = texto;
        elemento.className = `notification ${tipo}`;
        elemento.style.display = "block";

        setTimeout(() => {
            elemento.style.display = "none";
        }, 5000);
    }

    /**
     * Enviar formulario
     */
    formNuevaEmpresa.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Deshabilitar botón para evitar doble envío
        const btnGuardar = document.getElementById("btn-guardar-empresa");
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = "⌛ Guardando...";

        // Crear FormData
        const formData = new FormData(formNuevaEmpresa);

        // Validar
        const errors = validarFormulario(formData);
        if (errors.length > 0) {
            mostrarMensaje(mensajeError, errors.join(", "), "error");
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = "💾 Guardar Empresa";
            return;
        }

        // Preparar datos para enviar
        const datosEmpresa = {
            nombre: formData.get("nombre"),
            giro: formData.get("giro"),
            industria: formData.get("industria"),
            email: formData.get("email"),
            telefono: formData.get("telefono"),
            contacto: formData.get("contacto"),
            direccion: formData.get("direccion"),
            notas: formData.get("notas"),
            areas: [],
        };

        // Recolectar áreas
        const areas = formData.getAll("areas[]");
        const descripciones = formData.getAll("descripciones[]");

        areas.forEach((area, index) => {
            if (area.trim() !== "") {
                datosEmpresa.areas.push({
                    nombre: area.trim(),
                    descripcion: descripciones[index]
                        ? descripciones[index].trim()
                        : "",
                });
            }
        });

        try {
            // Enviar a la API
            const response = await fetch("/api/empresas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(datosEmpresa),
            });

            const result = await response.json();

            if (result.success) {
                mostrarMensaje(
                    mensajeExito,
                    "✅ Empresa registrada exitosamente. ID: " +
                        result.empresa.id,
                    "success"
                );

                // Limpiar formulario después de 2 segundos
                setTimeout(() => {
                    formNuevaEmpresa.reset();

                    // Mantener solo una área
                    while (areasContainer.children.length > 1) {
                        areasContainer.lastChild.remove();
                    }

                    // Limpiar la primera área
                    const firstAreaInput =
                        areasContainer.querySelector(".area-input");
                    const firstAreaTextarea =
                        areasContainer.querySelector("textarea");
                    if (firstAreaInput) firstAreaInput.value = "";
                    if (firstAreaTextarea) firstAreaTextarea.value = "";

                    // Regresar al menú después de 3 segundos
                    setTimeout(() => {
                        window.location.href = "{{ route('rastros') }}";
                    }, 3000);
                }, 2000);
            } else {
                throw new Error(result.message || "Error desconocido");
            }
        } catch (error) {
            console.error("Error al guardar empresa:", error);
            mostrarMensaje(mensajeError, "❌ Error: " + error.message, "error");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = "💾 Guardar Empresa";
        }
    });

    /**
     * Cancelar y regresar
     */
    btnCancelar.addEventListener("click", function () {
        if (
            confirm(
                "¿Estás seguro de que deseas cancelar? Se perderán los datos no guardados."
            )
        ) {
            window.location.href = "{{ route('rastros') }}";
        }
    });

    /**
     * Sugerir áreas basadas en el giro
     */
    document.getElementById("giro").addEventListener("input", function () {
        const primeraArea = areasContainer.querySelector(".area-input");
        if (primeraArea && !primeraArea.value) {
            primeraArea.placeholder = "Ej: " + getSugerenciaArea();
        }
    });

    console.log("Sistema de registro de empresas cargado correctamente");
});
