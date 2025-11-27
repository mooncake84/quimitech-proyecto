// programacion_script.js - ACTUALIZADO PARA LARAVEL + SQL SERVER
document.addEventListener("DOMContentLoaded", function () {
    const nombreEmpresaActual = document.getElementById(
        "nombre-empresa-actual"
    );
    const btnGuardar = document.getElementById("btn-guardar-actividad");
    const fechaInput = document.getElementById("fecha-actividad");
    const formulario = document.querySelector(".form-container");

    // Variables globales
    let empresasCargadas = [];
    let currentCompanyId = null;

    // Crear contenedor de errores del formulario
    const erroresContainer = document.createElement("div");
    erroresContainer.id = "errores-formulario";
    erroresContainer.style.cssText = `
        margin-bottom: 20px;
        border-radius: 5px;
        overflow: hidden;
    `;
    formulario.parentNode.insertBefore(erroresContainer, formulario);

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

    // Establecer fecha mínima como hoy
    function establecerFechaMinima() {
        try {
            const hoy = new Date();
            const fechaFormateada = hoy.toISOString().split("T")[0];
            fechaInput.setAttribute("min", fechaFormateada);

            // Establecer fecha por defecto como hoy
            fechaInput.value = fechaFormateada;
        } catch (error) {
            console.error("Error estableciendo fecha mínima:", error);
            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError(
                    "Error al configurar fecha del sistema"
                );
            }
        }
    }

    // Mostrar la empresa seleccionada actualmente
    async function cargarEmpresaActual() {
        try {
            let selectedCompanyId = convertirIdEmpresa(
                localStorage.getItem("selectedCompany") || "1"
            );

            // Cargar empresas si no están cargadas
            if (empresasCargadas.length === 0) {
                empresasCargadas = await DataManager.cargarEmpresas();

                if (!empresasCargadas || empresasCargadas.length === 0) {
                    // Fallback a datos locales
                    empresasCargadas = DataManager.getEmpresasLocales();
                    console.warn("🔄 Usando datos locales para empresas");
                }
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
            currentCompanyId = empresa.id.toString();

            return currentCompanyId;
        } catch (error) {
            console.error("Error cargando empresa actual:", error);
            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError(
                    "Error al cargar información de la empresa"
                );
            }

            // Fallback
            if (empresasCargadas.length > 0) {
                const primeraEmpresa = empresasCargadas[0];
                nombreEmpresaActual.textContent = `Empresa Actual: ${primeraEmpresa.nombre}`;
                currentCompanyId = primeraEmpresa.id.toString();
                return currentCompanyId;
            }

            return "1";
        }
    }

    // Validar formulario completo
    async function validarYEnviarFormulario() {
        try {
            // Obtener datos del formulario
            const formData = {
                fecha: fechaInput.value,
                hora: document.getElementById("hora-actividad").value,
                objetivo: document.getElementById("objetivo-visita").value,
                datosAdicionales:
                    document.getElementById("datos-adicionales").value,
            };

            // Sanitizar entradas
            const formDataSanitizado = {
                fecha: formValidator.sanitizarInput(formData.fecha),
                hora: formValidator.sanitizarInput(formData.hora),
                objetivo: formValidator.sanitizarInput(formData.objetivo),
                datosAdicionales: formValidator.sanitizarInput(
                    formData.datosAdicionales
                ),
            };

            // Validar formulario
            const resultadoValidacion =
                formValidator.validarProgramacionActividad(formDataSanitizado);

            // Mostrar errores en la UI
            formValidator.mostrarErroresEnUI("errores-formulario");

            if (!resultadoValidacion.esValido) {
                // Scroll a los errores
                erroresContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                return;
            }

            // Si es válido, guardar la actividad
            await guardarActividad(formDataSanitizado);
        } catch (error) {
            console.error("Error en validación de formulario:", error);
            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError(
                    "Error inesperado al procesar el formulario"
                );
            }
        }
    }

    // Guardar actividad en SQL Server y localStorage
    async function guardarActividad(formData) {
        try {
            // Obtener nombre de la empresa actual
            const empresa = empresasCargadas.find(
                (emp) => emp.id.toString() === currentCompanyId.toString()
            );

            if (!empresa) {
                throw new Error("No se pudo obtener información de la empresa");
            }

            // Crear objeto de actividad para SQL Server
            const actividadData = {
                empresa_id: parseInt(currentCompanyId),
                fecha: formData.fecha,
                hora: formData.hora,
                objetivo: formData.objetivo,
                datos_adicionales:
                    formData.datosAdicionales ||
                    "No se especificaron datos adicionales a tomar.",
                estado: "Pendiente",
                pedido_entregado: "",
                cantidad_entregada: "",
            };

            // Guardar en SQL Server
            const actividadGuardada = await DataManager.guardarActividad(
                actividadData
            );

            if (actividadGuardada) {
                console.log(
                    "✅ Actividad guardada en SQL Server:",
                    actividadGuardada
                );

                // También guardar en localStorage como backup
                guardarEnLocalStorage(actividadGuardada);

                // Mostrar mensaje de éxito
                if (typeof errorManager !== "undefined") {
                    errorManager.mostrarError(
                        `¡Actividad para ${empresa.nombre} programada con éxito para el ${formData.fecha} a las ${formData.hora}!`,
                        "info",
                        5000
                    );
                }

                // Limpiar el formulario
                limpiarFormulario();
            } else {
                throw new Error(
                    "No se pudo guardar la actividad en la base de datos"
                );
            }
        } catch (error) {
            console.error("Error guardando actividad:", error);
            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError("Error al guardar la actividad");
            }
        }
    }

    // Guardar en localStorage como backup
    function guardarEnLocalStorage(actividad) {
        try {
            const actividadesString = localStorage.getItem(
                "actividadesProgramadas"
            );
            let actividades = actividadesString
                ? JSON.parse(actividadesString)
                : [];

            if (!Array.isArray(actividades)) {
                actividades = [];
            }

            // Crear objeto compatible con el formato antiguo
            const actividadLocal = {
                id: actividad.id || Date.now(),
                empresaId: currentCompanyId,
                empresaNombre:
                    actividad.empresa?.nombre ||
                    empresasCargadas.find(
                        (emp) => emp.id.toString() === currentCompanyId
                    )?.nombre ||
                    "Empresa no disponible",
                fecha: actividad.fecha,
                hora: actividad.hora,
                objetivo: actividad.objetivo,
                datosAdicionales: actividad.datos_adicionales,
                estado: actividad.estado || "Pendiente",
                pedidoEntregado: actividad.pedido_entregado || "",
                cantidadEntregada: actividad.cantidad_entregada || "",
                timestampGuardado: new Date().toISOString(),
            };

            actividades.push(actividadLocal);
            localStorage.setItem(
                "actividadesProgramadas",
                JSON.stringify(actividades)
            );

            console.log(
                "📦 Actividad guardada en localStorage como backup:",
                actividadLocal
            );
        } catch (error) {
            console.error("Error guardando en localStorage:", error);
        }
    }

    // Limpiar formulario después de guardar
    function limpiarFormulario() {
        try {
            document.getElementById("fecha-actividad").value = "";
            document.getElementById("hora-actividad").value = "";
            document.getElementById("objetivo-visita").value = "";
            document.getElementById("datos-adicionales").value = "";

            // Limpiar errores
            if (typeof formValidator !== "undefined") {
                formValidator.limpiarErrores();
            }
            document.getElementById("errores-formulario").innerHTML = "";

            // Restablecer fecha mínima
            establecerFechaMinima();
        } catch (error) {
            console.error("Error limpiando formulario:", error);
        }
    }

    // Lógica para el botón GUARDAR
    btnGuardar.addEventListener("click", function (e) {
        e.preventDefault();
        validarYEnviarFormulario();
    });

    // Validación en tiempo real para campos críticos
    document
        .getElementById("objetivo-visita")
        .addEventListener("blur", function () {
            const objetivo = this.value;
            if (objetivo.trim().length > 0 && objetivo.trim().length < 10) {
                if (typeof errorManager !== "undefined") {
                    errorManager.mostrarError(
                        "El objetivo debe tener al menos 10 caracteres",
                        "warning",
                        3000
                    );
                }
            }
        });

    // Inicialización
    async function inicializar() {
        try {
            console.log("🚀 Inicializando programación de actividades...");

            await cargarEmpresaActual();
            establecerFechaMinima();

            console.log(
                "✅ Programación de actividades inicializada correctamente"
            );
        } catch (error) {
            console.error("❌ Error en inicialización:", error);
        }
    }

    // Inicializar al cargar
    inicializar();
});
