// programacion_script.js - SOLO FORMULARIO DE CREACIÓN - VERSIÓN FINAL CORREGIDA
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Inicializando módulo de programación...");

    // Elementos del DOM
    const formActividad = document.getElementById("form-actividad");
    const mensajeExito = document.getElementById("mensaje-exito");
    const nombreEmpresaActual = document.getElementById(
        "nombre-empresa-actual"
    );
    const empresaActualIndicador = document.getElementById(
        "empresa-actual-indicador"
    );

    // Variables globales
    let empresasCargadas = [];
    let currentCompanyId = null;

    /**
     * Convertir IDs antiguos ("empresa1") a nuevos (1)
     */
    function convertirIdEmpresa(id) {
        if (typeof id === "string" && id.startsWith("empresa")) {
            const nuevoId = id.replace("empresa", "");
            console.log(`🔄 Convirtiendo ID: ${id} -> ${nuevoId}`);
            return nuevoId;
        }
        return id ? id.toString() : null;
    }

    /**
     * Cargar empresas desde SQL Server
     */
    async function cargarEmpresas() {
        try {
            console.log("🔍 Cargando empresas desde DataManager...");

            const empresasData = await DataManager.cargarEmpresas();
            console.log("📊 Resultado cargarEmpresas:", empresasData);

            if (Array.isArray(empresasData)) {
                empresasCargadas = empresasData;
                console.log(
                    `✅ ${empresasCargadas.length} empresas cargadas correctamente`
                );
                return empresasCargadas;
            } else {
                console.error(
                    "❌ Error: DataManager.cargarEmpresas() no retornó un array"
                );
                empresasCargadas = [];
                return [];
            }
        } catch (error) {
            console.error("❌ Error en cargarEmpresas:", error);
            empresasCargadas = [];
            return [];
        }
    }

    /**
     * Cargar y mostrar la empresa seleccionada
     */
    async function cargarEmpresaActual() {
        try {
            console.log("🔍 Cargando empresa actual...");

            let selectedCompanyId = convertirIdEmpresa(
                localStorage.getItem("selectedCompany") || "1"
            );
            console.log("🔍 ID empresa desde localStorage:", selectedCompanyId);

            if (empresasCargadas.length === 0) {
                console.log("🔄 No hay empresas cargadas, cargando ahora...");
                await cargarEmpresas();
            }

            if (!Array.isArray(empresasCargadas)) {
                console.error("❌ Error: empresasCargadas no es un array");
                empresasCargadas = [];
                currentCompanyId = null;
                return null;
            }

            console.log("🔍 Buscando empresa con ID:", selectedCompanyId);
            console.log(
                "🔍 Empresas disponibles:",
                empresasCargadas.map((e) => ({ id: e.id, nombre: e.nombre }))
            );

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
                    empresaActualIndicador.innerHTML = `Programando actividad para: <strong>${nombreEmpresa}</strong>`;
                }

                console.log(
                    `✅ Empresa actual cargada: ${nombreEmpresa} (ID: ${currentCompanyId})`
                );
                return currentCompanyId;
            } else {
                console.warn(
                    `⚠️ Empresa con ID ${selectedCompanyId} no encontrada`
                );

                if (empresasCargadas.length > 0) {
                    const primeraEmpresa = empresasCargadas[0];
                    currentCompanyId = primeraEmpresa.id.toString();

                    if (nombreEmpresaActual) {
                        nombreEmpresaActual.textContent = `Empresa Actual: ${primeraEmpresa.nombre}`;
                    }

                    if (empresaActualIndicador) {
                        empresaActualIndicador.innerHTML = `Programando actividad para: <strong>${primeraEmpresa.nombre}</strong>`;
                    }

                    console.log(
                        `🔄 Usando primera empresa como fallback: ${primeraEmpresa.nombre}`
                    );
                    return currentCompanyId;
                } else {
                    currentCompanyId = null;
                    console.warn("⚠️ No hay empresas disponibles");
                    return null;
                }
            }
        } catch (error) {
            console.error("❌ Error en cargarEmpresaActual:", error);
            currentCompanyId = null;
            return null;
        }
    }

    /**
     * Mostrar mensaje temporal
     */
    function mostrarMensaje(mensaje, tipo = "success") {
        try {
            console.log(`${tipo.toUpperCase()}: ${mensaje}`);

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
        } catch (error) {
            console.error("❌ Error mostrando mensaje:", error);
        }
    }

    /**
     * Validar formulario antes de enviar
     */
    function validarFormulario(actividadData) {
        const errores = [];

        if (!actividadData.fecha) {
            errores.push("La fecha es obligatoria");
        }

        if (!actividadData.hora) {
            errores.push("La hora es obligatoria");
        }

        if (
            !actividadData.objetivo ||
            actividadData.objetivo.trim().length === 0
        ) {
            errores.push("El objetivo es obligatorio");
        }

        if (!currentCompanyId) {
            errores.push("No se ha seleccionado una empresa válida");
        }

        // SOLUCIÓN SIMPLE: Comparar strings de fecha YYYY-MM-DD directamente
        // Esto evita problemas de zona horaria

        // Obtener fecha de hoy en formato YYYY-MM-DD
        const hoy = new Date();
        const hoyFormateado = hoy.toISOString().split("T")[0]; // "2025-12-17"

        console.log("📅 Comparación simple (sin zona horaria):");
        console.log("- Fecha seleccionada:", actividadData.fecha);
        console.log("- Hoy formateado:", hoyFormateado);
        console.log("- Son iguales?", actividadData.fecha === hoyFormateado);

        // Comparar strings directamente (YYYY-MM-DD)
        if (actividadData.fecha < hoyFormateado) {
            console.log("❌ Fecha seleccionada es anterior a hoy");
            errores.push(
                "No se pueden programar actividades para fechas pasadas"
            );
        } else if (actividadData.fecha === hoyFormateado) {
            console.log("✅ Fecha seleccionada es HOY");

            // Solo si es hoy, validar la hora
            if (actividadData.hora) {
                const ahora = new Date();
                const [horaSeleccionadaStr, minutoSeleccionadoStr] =
                    actividadData.hora.split(":");
                const horaSeleccionada = parseInt(horaSeleccionadaStr);
                const minutoSeleccionado = parseInt(minutoSeleccionadoStr);

                const minutosActuales =
                    ahora.getHours() * 60 + ahora.getMinutes();
                const minutosSeleccionados =
                    horaSeleccionada * 60 + minutoSeleccionado;

                console.log(`⏰ Validación hora para hoy:
                Hora actual: ${ahora.getHours()}:${ahora.getMinutes()} (${minutosActuales} min)
                Hora seleccionada: ${horaSeleccionada}:${minutoSeleccionado} (${minutosSeleccionados} min)
                Límite (2 hrs antes): ${minutosActuales - 120} min
            `);

                // 2 horas antes = 120 minutos
                if (minutosSeleccionados < minutosActuales - 120) {
                    const horaMinima = new Date(
                        ahora.getTime() - 2 * 60 * 60 * 1000
                    );
                    const horaMinimaStr =
                        horaMinima.getHours().toString().padStart(2, "0") +
                        ":" +
                        horaMinima.getMinutes().toString().padStart(2, "0");

                    // Hora sugerida (2 horas después)
                    const horaSugerida = new Date(
                        ahora.getTime() + 2 * 60 * 60 * 1000
                    );
                    const horaSugeridaStr =
                        horaSugerida.getHours().toString().padStart(2, "0") +
                        ":" +
                        horaSugerida.getMinutes().toString().padStart(2, "0");

                    errores.push(`Para hoy, la hora mínima permitida es ${horaMinimaStr} (2 horas antes de la hora actual). 
                             Sugerencia: Intenta con ${horaSugeridaStr} o más tarde.`);
                }
            }
        } else {
            console.log("✅ Fecha seleccionada es FUTURA");
        }

        return errores;
    }
    /**
     * Mostrar errores de validación
     */
    function mostrarErroresValidacion(errores) {
        const mensajeError = errores.join("\n");
        mostrarMensaje(mensajeError, "error");

        if (errores.length > 0) {
            const mensaje = errores
                .map((error, index) => {
                    if (error.includes("hora mínima permitida")) {
                        return `• ${error} (Por ejemplo: si son las 14:00, puedes programar desde las 12:00 en adelante)`;
                    }
                    return `• ${error}`;
                })
                .join("\n");

            alert("Errores en el formulario:\n\n" + mensaje);
        }
    }

    /**
     * Configurar hora mínima basada en la fecha seleccionada
     */
    function configurarHoraMinima() {
        const fechaInput = document.getElementById("fecha-actividad");
        const horaInput = document.getElementById("hora-actividad");

        if (!fechaInput || !horaInput) return;

        // Función para determinar si la fecha seleccionada es hoy (comparando strings)
        function esHoy(fechaStr) {
            const hoy = new Date();
            const hoyFormateado = hoy.toISOString().split("T")[0]; // "2025-12-17"
            return fechaStr === hoyFormateado;
        }

        fechaInput.addEventListener("change", function () {
            const fechaSeleccionadaStr = this.value;

            console.log(
                "📅 Cambio de fecha detectado (string):",
                fechaSeleccionadaStr
            );
            console.log("¿Es hoy?", esHoy(fechaSeleccionadaStr));

            // Si es hoy, establecer hora mínima
            if (esHoy(fechaSeleccionadaStr)) {
                // Calcular hora mínima (2 horas antes de ahora)
                const ahora = new Date();
                const horaMinima = new Date(
                    ahora.getTime() - 2 * 60 * 60 * 1000
                );

                const horaMinimaStr =
                    horaMinima.getHours().toString().padStart(2, "0") +
                    ":" +
                    horaMinima.getMinutes().toString().padStart(2, "0");

                // Calcular hora sugerida (2 horas después)
                const horaSugerida = new Date(
                    ahora.getTime() + 2 * 60 * 60 * 1000
                );
                const horaSugeridaStr =
                    horaSugerida.getHours().toString().padStart(2, "0") +
                    ":" +
                    horaSugerida.getMinutes().toString().padStart(2, "0");

                // Actualizar atributos del input de hora
                horaInput.min = horaMinimaStr;
                horaInput.title = `Hora mínima: ${horaMinimaStr}. Hora sugerida: ${horaSugeridaStr}`;
                horaInput.placeholder = `Mínimo ${horaMinimaStr}`;

                console.log(`⏰ Configuración para hoy:
                Hora mínima: ${horaMinimaStr}
                Hora sugerida: ${horaSugeridaStr}
                Hora actual: ${ahora.getHours()}:${ahora.getMinutes()}
            `);
            } else {
                // Para fechas futuras, no hay restricción de hora mínima
                horaInput.min = "00:00";
                horaInput.title = "Puedes seleccionar cualquier hora";
                horaInput.placeholder = "HH:mm (cualquier hora)";
                console.log("📅 Fecha futura: sin restricción de hora mínima");
            }
        });

        // Disparar evento change inicial
        setTimeout(() => {
            if (fechaInput.value) {
                fechaInput.dispatchEvent(new Event("change"));
            }
        }, 100);
    }

    /**
     * Limpiar formulario
     */
    function limpiarFormulario() {
        if (!formActividad) return;

        console.log("🧹 Limpiando formulario...");
        formActividad.reset();

        // Establecer fecha mínima como hoy - USANDO FECHA LOCAL
        const fechaInput = document.getElementById("fecha-actividad");
        if (fechaInput) {
            // Obtener fecha local sin problemas de zona horaria
            const hoy = new Date();
            const año = hoy.getFullYear();
            const mes = String(hoy.getMonth() + 1).padStart(2, "0");
            const dia = String(hoy.getDate()).padStart(2, "0");

            const hoyFormateado = `${año}-${mes}-${dia}`; // "2025-12-17"

            fechaInput.min = hoyFormateado;
            fechaInput.value = hoyFormateado;

            console.log("📅 Fecha establecida a hoy (local):", hoyFormateado);
            console.log("📅 Fecha Date original:", hoy.toDateString());
        }

        // NO establecer hora por defecto
        const horaInput = document.getElementById("hora-actividad");
        if (horaInput) {
            horaInput.value = "";
            horaInput.placeholder = "Selecciona hora";
            console.log("⏰ Hora dejada en blanco");
        }

        // Configurar hora mínima
        setTimeout(() => {
            configurarHoraMinima();
        }, 200);
    }
    /**
     * Manejar envío del formulario
     */
    async function manejarSubmitFormulario(e) {
        e.preventDefault();

        if (!formActividad) {
            console.error("❌ Formulario no encontrado");
            return;
        }

        const formData = new FormData(formActividad);
        const actividadData = {
            empresa_id: currentCompanyId,
            fecha: formData.get("fecha"),
            hora: formData.get("hora"),
            objetivo: formData.get("objetivo")
                ? formData.get("objetivo").trim()
                : "",
            datos_adicionales: formData.get("datos_adicionales")
                ? formData.get("datos_adicionales").trim()
                : null,
            estado: "Pendiente",
        };

        console.log("📋 Datos del formulario:", actividadData);

        // Validar formulario
        const errores = validarFormulario(actividadData);
        if (errores.length > 0) {
            mostrarErroresValidacion(errores);
            return;
        }

        // Mostrar loading
        const submitBtn = formActividad.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "⏳ Programando...";
        submitBtn.disabled = true;

        try {
            console.log("📤 Enviando actividad al servidor...");

            const response = await fetch("/api/actividades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(actividadData),
            });

            const result = await response.json();

            console.log("📥 Respuesta del servidor:", {
                status: response.status,
                ok: response.ok,
                data: result,
            });

            if (!response.ok) {
                throw new Error(
                    result.message || `Error HTTP: ${response.status}`
                );
            }

            if (result.success) {
                console.log("✅ Actividad creada exitosamente:", result.data);

                mostrarMensaje("✅ Actividad programada exitosamente");

                if (mensajeExito) {
                    mensajeExito.style.display = "block";
                    mensajeExito.textContent =
                        "✅ Actividad programada exitosamente";
                }

                // Limpiar formulario
                limpiarFormulario();

                setTimeout(() => {
                    if (mensajeExito) {
                        mensajeExito.style.display = "none";
                    }
                }, 5000);

                setTimeout(() => {
                    if (
                        confirm(
                            "¿Deseas ver todas las actividades programadas?"
                        )
                    ) {
                        window.location.href = "/actividades";
                    }
                }, 2000);
            } else {
                throw new Error(
                    result.message || "Error desconocido del servidor"
                );
            }
        } catch (error) {
            console.error("❌ Error creando actividad:", error);

            let mensajeError = "Error al programar la actividad: ";

            // Manejar errores específicos
            if (error.message.includes("fechas pasadas")) {
                mensajeError =
                    "No se pueden programar actividades para fechas pasadas.";
            } else if (error.message.includes("hora mínima permitida")) {
                mensajeError = error.message;
            } else if (error.message.includes("empresa_id")) {
                mensajeError =
                    "Empresa no válida. Por favor, recarga la página.";
            } else if (error.message.includes("objetivo")) {
                mensajeError = "El objetivo es obligatorio.";
            } else {
                mensajeError += error.message;
            }

            mostrarMensaje(mensajeError, "error");
            alert(mensajeError);
        } finally {
            // Restaurar botón
            if (submitBtn) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    /**
     * Configurar event listeners
     */
    function configurarEventListeners() {
        try {
            // Formulario
            if (formActividad) {
                formActividad.addEventListener(
                    "submit",
                    manejarSubmitFormulario
                );

                formActividad.addEventListener("input", function (e) {
                    if (
                        mensajeExito &&
                        mensajeExito.style.display === "block"
                    ) {
                        mensajeExito.style.display = "none";
                    }
                });
            }

            // Cambios en localStorage
            window.addEventListener("storage", function (e) {
                if (e.key === "selectedCompany") {
                    console.log("🔄 Empresa cambiada, actualizando...");
                    cargarEmpresaActual();
                }
            });

            console.log("✅ Event listeners configurados");
        } catch (error) {
            console.error("❌ Error configurando event listeners:", error);
        }
    }

    /**
     * Inicialización completa
     */
    async function inicializar() {
        try {
            console.log("🚀 Inicializando módulo de programación...");

            // Cargar datos
            await cargarEmpresas();
            await cargarEmpresaActual();

            // Configurar valores por defecto
            limpiarFormulario();

            // Configurar validación de hora mínima
            configurarHoraMinima();

            // Configurar eventos
            configurarEventListeners();

            console.log("✅ Módulo de programación inicializado correctamente");

            // Verificar que todo esté correcto
            console.log("🔍 Estado final:");
            console.log("- Empresa ID:", currentCompanyId);
            console.log(
                "- Fecha input:",
                document.getElementById("fecha-actividad")?.value
            );
            console.log(
                "- Hora input:",
                document.getElementById("hora-actividad")?.value
            );
        } catch (error) {
            console.error("❌ Error en inicialización:", error);
            mostrarMensaje(
                "Error al inicializar el módulo de programación",
                "error"
            );
        }
    }

    // Inicializar cuando el DOM esté listo
    inicializar();
});
