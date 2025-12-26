// rastros_script.js - VERSIÓN COMPLETA Y CORREGIDA
document.addEventListener("DOMContentLoaded", function () {
    // Elementos del DOM
    const selectCambioEmpresa = document.getElementById(
        "select-cambio-empresa"
    );
    const nombreEmpresaActual = document.getElementById(
        "nombre-empresa-actual"
    );
    const btnGestionClientes = document.getElementById("btn-gestion-clientes");
    const btnOpcion1 = document.getElementById("btn-opcion1");

    // Variable para almacenar empresas cargadas
    let empresasCargadas = [];

    /**
     * Convertir IDs antiguos ("empresa1") a nuevos (1)
     */
    function convertirIdEmpresa(id) {
        if (!id) return "1";

        const idStr = id.toString().trim();

        // Si es vacío
        if (idStr === "") {
            console.warn("⚠️ ID vacío recibido");
            return "1";
        }

        // Convertir "empresaX" a "X"
        if (idStr.toLowerCase().startsWith("empresa")) {
            const nuevoId = idStr.replace(/empresa/i, "");
            console.log(
                `🔄 Convirtiendo ID formato antiguo: ${idStr} -> ${nuevoId}`
            );
            return nuevoId || "1";
        }

        // Validar que sea numérico
        if (!/^\d+$/.test(idStr)) {
            console.warn(
                `⚠️ ID no numérico recibido: ${idStr}, usando 1 por defecto`
            );
            return "1";
        }

        return idStr;
    }

    /**
     * Cargar empresas desde API
     */
    async function cargarEmpresas() {
        try {
            // Usar DataManager que ya funciona
            const resultado = await DataManager.cargarEmpresas();

            // Procesar respuesta
            if (resultado.success && Array.isArray(resultado.data)) {
                empresasCargadas = resultado.data;
                console.log(
                    `✅ ${empresasCargadas.length} empresas cargadas desde API`
                );
            } else if (Array.isArray(resultado)) {
                empresasCargadas = resultado;
            } else {
                console.warn("⚠️ Formato inesperado, usando fallback");
                empresasCargadas = DataManager.getEmpresasLocales() || [];
            }

            if (!empresasCargadas || empresasCargadas.length === 0) {
                throw new Error("No se pudieron cargar las empresas");
            }

            return empresasCargadas;
        } catch (error) {
            console.error("❌ Error cargando empresas:", error);
            empresasCargadas = DataManager.getEmpresasLocales() || [];
            return empresasCargadas;
        }
    }

    /**
     * Actualizar empresa seleccionada
     */
    async function actualizarEmpresaVista(empresaId) {
        try {
            if (!empresasCargadas || empresasCargadas.length === 0) {
                await cargarEmpresas();
            }

            const empresa = empresasCargadas.find(
                (e) => e && e.id && e.id.toString() === empresaId.toString()
            );

            if (!empresa) {
                console.warn(`⚠️ Empresa ${empresaId} no encontrada`);

                // Usar primera empresa
                if (empresasCargadas.length > 0) {
                    const primera = empresasCargadas[0];

                    if (nombreEmpresaActual) {
                        nombreEmpresaActual.textContent = `Empresa Actual: ${primera.nombre}`;
                    }

                    if (selectCambioEmpresa) {
                        selectCambioEmpresa.value = primera.id;
                    }

                    localStorage.setItem(
                        "selectedCompany",
                        primera.id.toString()
                    );
                    return;
                }

                throw new Error(`Empresa con ID ${empresaId} no encontrada`);
            }

            if (nombreEmpresaActual) {
                nombreEmpresaActual.textContent = `Empresa Actual: ${empresa.nombre}`;
            }

            if (selectCambioEmpresa) {
                selectCambioEmpresa.value = empresa.id;
            }

            localStorage.setItem("selectedCompany", empresa.id.toString());
        } catch (error) {
            console.error("Error actualizando empresa:", error);
            if (nombreEmpresaActual) {
                nombreEmpresaActual.textContent = "Error cargando empresa";
            }
        }
    }

    /**
     * Llenar selector de empresas
     */
    function llenarSelectorEmpresas() {
        if (!selectCambioEmpresa) return;

        if (!empresasCargadas || !Array.isArray(empresasCargadas)) {
            selectCambioEmpresa.innerHTML =
                '<option value="">Error cargando empresas</option>';
            return;
        }

        selectCambioEmpresa.innerHTML = "";

        // Opción por defecto
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Seleccione una empresa";
        defaultOption.disabled = true;
        selectCambioEmpresa.appendChild(defaultOption);

        // Opciones de empresas
        empresasCargadas.forEach((empresa) => {
            if (!empresa || !empresa.id || !empresa.nombre) return;

            const option = document.createElement("option");
            option.value = empresa.id;
            option.textContent = empresa.nombre;

            // Agregar contacto si existe
            if (empresa.contacto) {
                option.textContent += ` - ${empresa.contacto}`;
            }

            selectCambioEmpresa.appendChild(option);
        });
    }

    /**
     * Obtener empresa inicial
     */
    function obtenerEmpresaInicial() {
        const stored = localStorage.getItem("selectedCompany");

        if (stored && empresasCargadas && empresasCargadas.length > 0) {
            const empresaExiste = empresasCargadas.some(
                (e) => e && e.id && e.id.toString() === stored.toString()
            );

            if (empresaExiste) {
                return stored;
            }
        }

        // Usar primera empresa disponible
        if (empresasCargadas && empresasCargadas.length > 0) {
            const primera = empresasCargadas[0];
            if (primera && primera.id) {
                return primera.id.toString();
            }
        }

        return "1";
    }

    /**
     * Función para abrir información general
     */
    function abrirInformacionGeneral() {
        try {
            let selectedCompany =
                localStorage.getItem("selectedCompany") || "1";

            if (!empresasCargadas || empresasCargadas.length === 0) {
                throw new Error("No hay empresas cargadas");
            }

            const empresaExiste = empresasCargadas.some(
                (e) =>
                    e && e.id && e.id.toString() === selectedCompany.toString()
            );

            if (!empresaExiste) {
                throw new Error(`Empresa ${selectedCompany} no encontrada`);
            }

            window.location.href = `/info-empresa?companyId=${selectedCompany}`;
        } catch (error) {
            console.error("Error:", error);
            mostrarNotificacion(`Error: ${error.message}`, "error");
        }
    }

    /**
     * Función para abrir gestión de clientes
     */
    function abrirGestionClientes() {
        try {
            console.log("📋 Abriendo gestión de clientes...");
            window.location.href = "/clientes";
        } catch (error) {
            console.error("Error:", error);
            mostrarNotificacion("Error al abrir gestión de clientes", "error");
        }
    }

    /**
     * Mostrar notificación temporal
     */
    function mostrarNotificacion(mensaje, tipo = "info") {
        console.log(`${tipo.toUpperCase()}: ${mensaje}`);

        // Eliminar notificación anterior si existe
        const notifAnterior = document.querySelector(".notificacion-rastros");
        if (notifAnterior) notifAnterior.remove();

        const notificacion = document.createElement("div");
        notificacion.className = `notificacion-rastros notificacion-${tipo}`;
        notificacion.textContent = mensaje;

        notificacion.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
        `;

        if (tipo === "success") {
            notificacion.style.background =
                "linear-gradient(135deg, #38a169, #2f855a)";
        } else if (tipo === "error") {
            notificacion.style.background =
                "linear-gradient(135deg, #e53e3e, #c53030)";
        } else if (tipo === "warning") {
            notificacion.style.background =
                "linear-gradient(135deg, #d69e2e, #b7791f)";
        } else {
            notificacion.style.background =
                "linear-gradient(135deg, #667eea, #764ba2)";
        }

        document.body.appendChild(notificacion);

        setTimeout(() => {
            if (notificacion.parentNode) {
                document.body.removeChild(notificacion);
            }
        }, 3000);
    }

    /**
     * Configurar event listeners
     */
    function configurarEventListeners() {
        // Botón de gestión de clientes
        if (btnGestionClientes) {
            btnGestionClientes.addEventListener("click", abrirGestionClientes);
        }

        // Botón de información general
        if (btnOpcion1) {
            btnOpcion1.addEventListener("click", abrirInformacionGeneral);
        }

        // Selector de cambio de empresa
        if (selectCambioEmpresa) {
            selectCambioEmpresa.addEventListener("change", function () {
                console.log("🔄 Cambiando empresa a:", this.value);
                if (this.value) {
                    actualizarEmpresaVista(this.value);
                }
            });
        }
    }

    /**
     * Inicialización
     */
    async function inicializar() {
        try {
            // 1. Cargar empresas
            await cargarEmpresas();

            // 2. Llenar selector
            llenarSelectorEmpresas();

            // 3. Establecer empresa inicial
            const empresaInicial = obtenerEmpresaInicial();
            await actualizarEmpresaVista(empresaInicial);

            // 4. Configurar event listeners
            configurarEventListeners();

            // 5. Hacer funciones disponibles globalmente
            window.abrirGestionClientes = abrirGestionClientes;
            window.abrirInformacionGeneral = abrirInformacionGeneral;
        } catch (error) {
            mostrarNotificacion("Error al cargar el sistema", "error");
        }
    }

    // Agregar estilos CSS para animaciones
    const estiloNotificaciones = document.createElement("style");
    estiloNotificaciones.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(estiloNotificaciones);

    // Inicializar la página
    inicializar();
});
