// rastros_script.js - ACTUALIZADO CON CONVERSIÓN DE IDs
document.addEventListener("DOMContentLoaded", function () {
    const selectCambioEmpresa = document.getElementById(
        "select-cambio-empresa"
    );
    const nombreEmpresaActual = document.getElementById(
        "nombre-empresa-actual"
    );

    // Variable para almacenar empresas cargadas
    let empresasCargadas = [];

    /**
     * Convertir IDs antiguos ("empresa1") a nuevos (1)
     */
    function convertirIdEmpresa(id) {
        // Si es un ID antiguo como "empresa1", convertirlo a "1"
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
     * Actualiza el nombre de la empresa en el header y guarda el ID.
     * @param {string|number} companyId - El ID de la empresa.
     */
    async function actualizarEmpresaVista(companyId) {
        try {
            // Si no tenemos empresas cargadas, cargarlas primero
            if (empresasCargadas.length === 0) {
                await cargarEmpresas();
            }

            // Convertir ID si es necesario
            const companyIdConvertido = convertirIdEmpresa(companyId);

            // Buscar la empresa
            const empresa = empresasCargadas.find(
                (emp) => emp.id.toString() === companyIdConvertido.toString()
            );

            if (!empresa) {
                // Si no encuentra, usar la primera empresa disponible
                if (empresasCargadas.length > 0) {
                    const primeraEmpresa = empresasCargadas[0];
                    console.warn(
                        `⚠️ Empresa ${companyId} no encontrada, usando ${primeraEmpresa.nombre} como fallback`
                    );

                    nombreEmpresaActual.textContent = `Empresa Actual: ${primeraEmpresa.nombre}`;
                    if (selectCambioEmpresa) {
                        selectCambioEmpresa.value = primeraEmpresa.id;
                    }
                    localStorage.setItem(
                        "selectedCompany",
                        primeraEmpresa.id.toString()
                    );
                    return;
                }
                throw new Error(`Empresa con ID ${companyId} no encontrada`);
            }

            const nombreEmpresa = empresa.nombre;
            nombreEmpresaActual.textContent = `Empresa Actual: ${nombreEmpresa}`;

            // Actualizar selector si existe
            if (selectCambioEmpresa) {
                selectCambioEmpresa.value = empresa.id;
            }

            // Guardar el ID convertido en localStorage
            localStorage.setItem("selectedCompany", empresa.id.toString());

            console.log(
                `🏢 Empresa actualizada: ${nombreEmpresa} (ID: ${empresa.id})`
            );
        } catch (error) {
            console.error("Error actualizando vista de empresa:", error);

            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError("Error al cambiar de empresa");
            }

            // Fallback: usar primera empresa disponible
            if (empresasCargadas.length > 0) {
                const primeraEmpresa = empresasCargadas[0];
                nombreEmpresaActual.textContent = `Empresa Actual: ${primeraEmpresa.nombre}`;
                localStorage.setItem(
                    "selectedCompany",
                    primeraEmpresa.id.toString()
                );
            }
        }
    }

    /**
     * Llenar el selector de empresas
     */
    function llenarSelectorEmpresas() {
        if (!selectCambioEmpresa || empresasCargadas.length === 0) return;

        // Limpiar selector
        selectCambioEmpresa.innerHTML = "";

        // Agregar opciones
        empresasCargadas.forEach((empresa) => {
            const option = document.createElement("option");
            option.value = empresa.id;
            option.textContent = empresa.nombre;
            selectCambioEmpresa.appendChild(option);
        });

        console.log("✅ Selector de empresas actualizado");
    }

    // Función para abrir información general con la empresa actual
    window.abrirInformacionGeneral = function () {
        try {
            let selectedCompany =
                localStorage.getItem("selectedCompany") || "1";

            // Convertir ID si es necesario
            selectedCompany = convertirIdEmpresa(selectedCompany);

            // Validar que la empresa existe
            if (empresasCargadas.length === 0) {
                throw new Error("No hay empresas cargadas");
            }

            const empresaExiste = empresasCargadas.some(
                (emp) => emp.id.toString() === selectedCompany.toString()
            );

            if (!empresaExiste) {
                throw new Error(`Empresa ${selectedCompany} no encontrada`);
            }

            // Usar URL de Laravel
            window.location.href = `/info-empresa?companyId=${selectedCompany}`;
        } catch (error) {
            console.error("Error abriendo información general:", error);

            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError(
                    "Error al abrir información de la empresa"
                );
            }
        }
    };

    /**
     * Obtener empresa inicial considerando conversión de IDs
     */
    function obtenerEmpresaInicial() {
        const storedCompany = localStorage.getItem("selectedCompany");

        if (storedCompany) {
            // Convertir ID antiguo si es necesario
            return convertirIdEmpresa(storedCompany);
        }

        // Si no hay empresa guardada, usar la primera disponible
        if (empresasCargadas.length > 0) {
            return empresasCargadas[0].id.toString();
        }

        return "1"; // Fallback
    }

    /**
     * Inicialización de la página
     */
    async function inicializar() {
        try {
            console.log("🚀 Inicializando página rastros...");

            // Cargar empresas
            await cargarEmpresas();

            // Llenar selector
            llenarSelectorEmpresas();

            // Establecer empresa inicial con conversión
            const empresaInicial = obtenerEmpresaInicial();

            await actualizarEmpresaVista(empresaInicial);

            console.log("✅ Página rastros inicializada correctamente");
        } catch (error) {
            console.error("❌ Error en inicialización:", error);

            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError("Error al inicializar la aplicación");
            }
        }
    }

    // Evento para cambiar la empresa en el selector del header
    if (selectCambioEmpresa) {
        selectCambioEmpresa.addEventListener("change", function () {
            actualizarEmpresaVista(selectCambioEmpresa.value);
        });
    }

    // Inicializar la página
    inicializar();
});
