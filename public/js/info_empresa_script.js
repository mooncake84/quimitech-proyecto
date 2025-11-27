// info_empresa_script.js - VERSIÓN ACTUALIZADA Y CORREGIDA PARA LARAVEL + SQL SERVER
class InfoEmpresaManager {
    constructor() {
        this.companyIdActual = null;
        this.contactos = [];
        this.empresaActual = null;
        this.init();
    }

    async init() {
        try {
            await this.obtenerCompanyIdActual();
            await this.cargarDatosEmpresa();
            await this.cargarContactos();
            this.inicializarSistemaEdicion();

            console.log("✅ InfoEmpresaManager inicializado correctamente");
        } catch (error) {
            console.error("❌ Error inicializando InfoEmpresaManager:", error);
            this.manejarErrorCarga(error);
        }
    }

    obtenerCompanyIdActual() {
        // info_empresa_script.js - VERSIÓN ACTUALIZADA Y CORREGIDA PARA LARAVEL + SQL SERVER
        class InfoEmpresaManager {
            constructor() {
                this.companyIdActual = null;
                this.contactos = [];
                this.empresaActual = null;
                this.init();
            }

            async init() {
                try {
                    await this.obtenerCompanyIdActual();
                    await this.cargarDatosEmpresa();
                    await this.cargarContactos();
                    this.inicializarSistemaEdicion();

                    console.log(
                        "✅ InfoEmpresaManager inicializado correctamente"
                    );
                } catch (error) {
                    console.error(
                        "❌ Error inicializando InfoEmpresaManager:",
                        error
                    );
                    this.manejarErrorCarga(error);
                }
            }

            obtenerCompanyIdActual() {
                const urlParams = new URLSearchParams(window.location.search);
                let companyId =
                    urlParams.get("companyId") ||
                    localStorage.getItem("selectedCompany") ||
                    "1";

                // Convertir ID antiguo si es necesario
                if (
                    typeof companyId === "string" &&
                    companyId.startsWith("empresa")
                ) {
                    companyId = companyId.replace("empresa", "");
                }

                this.companyIdActual = companyId;
                console.log("🏢 Company ID actual:", this.companyIdActual);
                return companyId;
            }

            async cargarDatosEmpresa() {
                try {
                    console.log(
                        "📡 Cargando datos de empresa desde SQL Server..."
                    );

                    const response = await fetch(
                        `/api/empresas/${this.companyIdActual}`
                    );

                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }

                    const resultado = await response.json();

                    if (resultado && resultado.id) {
                        this.empresaActual = resultado;
                        this.mostrarInfoEmpresa(resultado);
                        this.actualizarNombreEmpresaHeader(resultado.nombre);
                    } else {
                        throw new Error(
                            "Empresa no encontrada en la respuesta"
                        );
                    }
                } catch (error) {
                    console.error("❌ Error cargando datos de empresa:", error);
                    throw new Error(
                        `No se pudo cargar la empresa: ${error.message}`
                    );
                }
            }

            mostrarInfoEmpresa(empresa) {
                const contenedor = document.getElementById(
                    "info-empresa-detalle"
                );

                contenedor.innerHTML = `
            <div class="info-basica-container">
                <h3>Información General</h3>
                <p><strong>Nombre:</strong> ${
                    empresa.nombre || "No disponible"
                }</p>
                <p><strong>Dirección:</strong> ${
                    empresa.direccion || "No disponible"
                }</p>
                <p><strong>Teléfono:</strong> ${
                    empresa.telefono || "No disponible"
                }</p>
                <p><strong>Email:</strong> ${
                    empresa.email || "No disponible"
                }</p>
                <p><strong>Industria:</strong> ${
                    empresa.industria || "No disponible"
                }</p>
                <p><strong>Notas:</strong> ${
                    empresa.notas || "No disponible"
                }</p>
                <p><small style="color: #666;">ID: ${
                    empresa.id
                } | Datos cargados desde SQL Server</small></p>
            </div>
        `;
            }

            actualizarNombreEmpresaHeader(nombre) {
                const elemento = document.getElementById(
                    "nombre-empresa-actual"
                );
                if (elemento) {
                    elemento.textContent = nombre || "Empresa no encontrada";
                }
            }

            async cargarContactos() {
                try {
                    console.log("📡 Cargando contactos desde SQL Server...");

                    const response = await fetch(
                        `/api/contactos/por-empresa/${this.companyIdActual}`
                    );

                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }

                    const resultado = await response.json();

                    // Manejar diferentes formatos de respuesta
                    if (resultado.success !== undefined) {
                        this.contactos = resultado.data || [];
                    } else if (Array.isArray(resultado)) {
                        this.contactos = resultado;
                    } else {
                        this.contactos = [];
                    }

                    this.mostrarContactosEnTabla();
                    this.inicializarBusquedaYFiltros();
                } catch (error) {
                    console.error("❌ Error cargando contactos:", error);
                    this.mostrarErrorContactos(
                        `Error al cargar contactos: ${error.message}`
                    );
                }
            }

            mostrarContactosEnTabla() {
                const tbody = document.getElementById("cuerpo-tabla-contactos");

                if (!this.contactos || this.contactos.length === 0) {
                    tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #666;">
                        No se encontraron contactos para esta empresa.
                    </td>
                </tr>
            `;
                    return;
                }

                tbody.innerHTML = this.contactos
                    .map(
                        (contacto) => `
            <tr data-contacto-id="${contacto.id}">
                <td>${this.escapeHtml(contacto.area || "")}</td>
                <td>${this.escapeHtml(contacto.producto_requerido || "")}</td>
                <td>${this.escapeHtml(contacto.encargado || "")}</td>
                <td>${this.escapeHtml(contacto.puesto || "")}</td>
                <td>
                    ${
                        contacto.correo &&
                        contacto.correo !== "S.C" &&
                        contacto.correo !== "N/A"
                            ? `<a href="mailto:${
                                  contacto.correo
                              }" style="color: #2196F3; text-decoration: none;">${this.escapeHtml(
                                  contacto.correo
                              )}</a>`
                            : this.escapeHtml(contacto.correo || "S.C")
                    }
                </td>
                <td>${this.escapeHtml(contacto.telefono || "S.D")}</td>
                <td class="acciones-edicion" style="display: none;">
                    <button class="btn-eliminar-fila" title="Eliminar contacto">🗑️</button>
                </td>
            </tr>
        `
                    )
                    .join("");

                console.log(
                    `✅ ${this.contactos.length} contactos cargados en la tabla`
                );
            }

            mostrarErrorContactos(mensaje) {
                const tbody = document.getElementById("cuerpo-tabla-contactos");
                tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #dc3545;">
                    ${mensaje}
                </td>
            </tr>
        `;
            }

            inicializarBusquedaYFiltros() {
                try {
                    if (
                        typeof searchManager !== "undefined" &&
                        searchManager.inicializar
                    ) {
                        searchManager.inicializar(); // ← LLAMAR AL NUEVO MÉTODO
                        console.log("✅ Sistema de búsqueda inicializado");
                    } else {
                        console.warn(
                            "⚠️ SearchManager no disponible, inicializando búsqueda básica"
                        );
                        this.inicializarBusquedaBasica();
                    }
                } catch (error) {
                    console.error("❌ Error inicializando búsqueda:", error);
                    this.inicializarBusquedaBasica();
                }
            }

            inicializarBusquedaBasica() {
                const buscador = document.getElementById("buscador-contactos");
                const filtroProducto =
                    document.getElementById("filtro-producto");
                const filtroArea = document.getElementById("filtro-area");

                if (buscador) {
                    buscador.addEventListener("input", (e) =>
                        this.filtrarTabla()
                    );
                }

                if (filtroProducto) {
                    this.llenarFiltroProductos();
                    filtroProducto.addEventListener("change", () =>
                        this.filtrarTabla()
                    );
                }

                if (filtroArea) {
                    this.llenarFiltroAreas();
                    filtroArea.addEventListener("change", () =>
                        this.filtrarTabla()
                    );
                }
            }

            llenarFiltroProductos() {
                const filtroProducto =
                    document.getElementById("filtro-producto");
                if (!filtroProducto) return;

                const productos = [
                    ...new Set(
                        this.contactos
                            .filter(
                                (c) =>
                                    c.producto_requerido &&
                                    c.producto_requerido !== "N/A"
                            )
                            .map((c) => c.producto_requerido)
                    ),
                ].sort();

                filtroProducto.innerHTML =
                    '<option value="">Todos los productos</option>';
                productos.forEach((producto) => {
                    const option = document.createElement("option");
                    option.value = producto;
                    option.textContent = producto;
                    filtroProducto.appendChild(option);
                });
            }

            llenarFiltroAreas() {
                const filtroArea = document.getElementById("filtro-area");
                if (!filtroArea) return;

                const areas = [
                    ...new Set(
                        this.contactos
                            .filter((c) => c.area && c.area !== "N/A")
                            .map((c) => c.area)
                    ),
                ].sort();

                filtroArea.innerHTML =
                    '<option value="">Todas las áreas</option>';
                areas.forEach((area) => {
                    const option = document.createElement("option");
                    option.value = area;
                    option.textContent = area;
                    filtroArea.appendChild(option);
                });
            }

            filtrarTabla() {
                const terminoBusqueda =
                    document
                        .getElementById("buscador-contactos")
                        ?.value.toLowerCase() || "";
                const productoSeleccionado =
                    document.getElementById("filtro-producto")?.value || "";
                const areaSeleccionada =
                    document.getElementById("filtro-area")?.value || "";

                const filas = document.querySelectorAll(
                    "#cuerpo-tabla-contactos tr[data-contacto-id]"
                );
                let contadorVisibles = 0;

                filas.forEach((fila) => {
                    const textoFila = fila.textContent.toLowerCase();
                    const producto = fila.cells[1]?.textContent || "";
                    const area = fila.cells[0]?.textContent || "";

                    const coincideBusqueda =
                        textoFila.includes(terminoBusqueda);
                    const coincideProducto =
                        !productoSeleccionado ||
                        producto === productoSeleccionado;
                    const coincideArea =
                        !areaSeleccionada || area === areaSeleccionada;

                    const mostrar =
                        coincideBusqueda && coincideProducto && coincideArea;
                    fila.style.display = mostrar ? "" : "none";

                    if (mostrar) contadorVisibles++;
                });

                this.actualizarContadorResultados(contadorVisibles);
            }

            actualizarContadorResultados(contador) {
                // Puedes implementar un contador visual si lo deseas
                console.log(`🔍 ${contador} contactos encontrados`);
            }

            inicializarSistemaEdicion() {
                // Esperar un poco para que la tabla se renderice completamente
                setTimeout(() => {
                    if (
                        typeof editManager !== "undefined" &&
                        editManager.inicializar
                    ) {
                        editManager.inicializar();
                        console.log("✅ Sistema de edición inicializado");
                    } else {
                        console.error("❌ EditManager no disponible");
                    }
                }, 1000);
            }

            escapeHtml(text) {
                if (!text) return "";
                const div = document.createElement("div");
                div.textContent = text;
                return div.innerHTML;
            }

            manejarErrorCarga(error) {
                const contenedor = document.getElementById(
                    "info-empresa-detalle"
                );
                const tbody = document.getElementById("cuerpo-tabla-contactos");

                if (contenedor) {
                    contenedor.innerHTML = `
                <div class="error-mensaje">
                    <strong>Error al cargar los datos:</strong><br>
                    ${error.message}<br>
                    <small>Por favor, recarga la página o verifica la conexión.</small>
                </div>
            `;
                }

                if (tbody) {
                    tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #dc3545;">
                        Error al cargar los contactos
                    </td>
                </tr>
            `;
                }

                if (
                    typeof errorManager !== "undefined" &&
                    errorManager.mostrarError
                ) {
                    errorManager.mostrarError(
                        `Error de carga: ${error.message}`
                    );
                }
            }

            // Función para recargar datos (llamada desde editManager después de guardar)
            async recargarDatos() {
                console.log("🔄 Recargando datos...");
                try {
                    await this.cargarDatosEmpresa();
                    await this.cargarContactos();

                    if (typeof errorManager !== "undefined") {
                        errorManager.mostrarError(
                            "Datos actualizados correctamente",
                            "success",
                            3000
                        );
                    }
                } catch (error) {
                    console.error("❌ Error recargando datos:", error);
                    if (typeof errorManager !== "undefined") {
                        errorManager.mostrarError(
                            `Error al recargar: ${error.message}`
                        );
                    }
                }
            }
        }

        // Inicialización cuando el DOM esté listo
        document.addEventListener("DOMContentLoaded", function () {
            // Crear instancia global
            window.infoEmpresaManager = new InfoEmpresaManager();

            // Función global para recargar datos
            window.recargarDatosEmpresa = function () {
                if (
                    window.infoEmpresaManager &&
                    window.infoEmpresaManager.recargarDatos
                ) {
                    window.infoEmpresaManager.recargarDatos();
                }
            };

            // Función global para obtener el companyId actual
            window.obtenerCompanyIdActual = function () {
                if (window.infoEmpresaManager) {
                    return window.infoEmpresaManager.companyIdActual;
                }
                return null;
            };
        });

        // También exportar para módulos si es necesario
        if (typeof module !== "undefined" && module.exports) {
            module.exports = InfoEmpresaManager;
        }
        const urlParams = new URLSearchParams(window.location.search);
        let companyId =
            urlParams.get("companyId") ||
            localStorage.getItem("selectedCompany") ||
            "1";

        // Convertir ID antiguo si es necesario
        if (typeof companyId === "string" && companyId.startsWith("empresa")) {
            companyId = companyId.replace("empresa", "");
        }

        this.companyIdActual = companyId;
        console.log("🏢 Company ID actual:", this.companyIdActual);
        return companyId;
    }

    async cargarDatosEmpresa() {
        try {
            console.log("📡 Cargando datos de empresa desde SQL Server...");

            const response = await fetch(
                `/api/empresas/${this.companyIdActual}`
            );

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado && resultado.id) {
                this.empresaActual = resultado;
                this.mostrarInfoEmpresa(resultado);
                this.actualizarNombreEmpresaHeader(resultado.nombre);
            } else {
                throw new Error("Empresa no encontrada en la respuesta");
            }
        } catch (error) {
            console.error("❌ Error cargando datos de empresa:", error);
            throw new Error(`No se pudo cargar la empresa: ${error.message}`);
        }
    }

    mostrarInfoEmpresa(empresa) {
        const contenedor = document.getElementById("info-empresa-detalle");

        contenedor.innerHTML = `
            <div class="info-basica-container">
                <h3>Información General</h3>
                <p><strong>Nombre:</strong> ${
                    empresa.nombre || "No disponible"
                }</p>
                <p><strong>Dirección:</strong> ${
                    empresa.direccion || "No disponible"
                }</p>
                <p><strong>Teléfono:</strong> ${
                    empresa.telefono || "No disponible"
                }</p>
                <p><strong>Email:</strong> ${
                    empresa.email || "No disponible"
                }</p>
                <p><strong>Industria:</strong> ${
                    empresa.industria || "No disponible"
                }</p>
                <p><strong>Notas:</strong> ${
                    empresa.notas || "No disponible"
                }</p>
                <p><small style="color: #666;">ID: ${
                    empresa.id
                } | Datos cargados desde SQL Server</small></p>
            </div>
        `;
    }

    actualizarNombreEmpresaHeader(nombre) {
        const elemento = document.getElementById("nombre-empresa-actual");
        if (elemento) {
            elemento.textContent = nombre || "Empresa no encontrada";
        }
    }

    async cargarContactos() {
        try {
            console.log("📡 Cargando contactos desde SQL Server...");

            const response = await fetch(
                `/api/contactos/por-empresa/${this.companyIdActual}`
            );

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const resultado = await response.json();

            // Manejar diferentes formatos de respuesta
            if (resultado.success !== undefined) {
                this.contactos = resultado.data || [];
            } else if (Array.isArray(resultado)) {
                this.contactos = resultado;
            } else {
                this.contactos = [];
            }

            this.mostrarContactosEnTabla();
            this.inicializarBusquedaYFiltros();
        } catch (error) {
            console.error("❌ Error cargando contactos:", error);
            this.mostrarErrorContactos(
                `Error al cargar contactos: ${error.message}`
            );
        }
    }

    mostrarContactosEnTabla() {
        const tbody = document.getElementById("cuerpo-tabla-contactos");

        if (!this.contactos || this.contactos.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #666;">
                    No se encontraron contactos para esta empresa.
                </td>
            </tr>
        `;
            return;
        }

        tbody.innerHTML = this.contactos
            .map(
                (contacto) => `
        <tr data-contacto-id="${contacto.id}">
            <td data-field="area">${this.escapeHtml(contacto.area || "")}</td>
            <td data-field="producto_requerido">${this.escapeHtml(
                contacto.producto_requerido || ""
            )}</td>
            <td data-field="encargado">${this.escapeHtml(
                contacto.encargado || ""
            )}</td>
            <td data-field="puesto">${this.escapeHtml(
                contacto.puesto || ""
            )}</td>
            <td data-field="correo">
                ${
                    contacto.correo &&
                    contacto.correo !== "S.C" &&
                    contacto.correo !== "N/A"
                        ? `<span class="view-mode">${this.escapeHtml(
                              contacto.correo
                          )}</span>
                       <input type="email" class="edit-mode form-control form-control-sm" value="${this.escapeHtml(
                           contacto.correo || ""
                       )}" style="display: none;">`
                        : `<span class="view-mode">${this.escapeHtml(
                              contacto.correo || "S.C"
                          )}</span>
                       <input type="email" class="edit-mode form-control form-control-sm" value="${this.escapeHtml(
                           contacto.correo || ""
                       )}" style="display: none;">`
                }
            </td>
            <td data-field="telefono">
                <span class="view-mode">${this.escapeHtml(
                    contacto.telefono || "S.D"
                )}</span>
                <input type="text" class="edit-mode form-control form-control-sm" value="${this.escapeHtml(
                    contacto.telefono || ""
                )}" style="display: none;">
            </td>
            <td class="acciones-edicion" style="display: none;">
                <button class="btn-eliminar-fila" title="Eliminar contacto">🗑️</button>
            </td>
        </tr>
    `
            )
            .join("");

        console.log(
            `✅ ${this.contactos.length} contactos renderizados en tabla`
        );
    }

    mostrarErrorContactos(mensaje) {
        const tbody = document.getElementById("cuerpo-tabla-contactos");
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #dc3545;">
                    ${mensaje}
                </td>
            </tr>
        `;
    }

    inicializarBusquedaYFiltros() {
        try {
            // Solo inicializar si searchManager existe
            if (
                typeof searchManager !== "undefined" &&
                searchManager.inicializar
            ) {
                searchManager.inicializar();
                console.log("✅ Sistema de búsqueda inicializado");
            } else {
                console.warn(
                    "⚠️ SearchManager no disponible, inicializando búsqueda básica"
                );
                this.inicializarBusquedaBasica();
            }
        } catch (error) {
            console.error("❌ Error inicializando búsqueda:", error);
            this.inicializarBusquedaBasica();
        }
    }

    inicializarBusquedaBasica() {
        const buscador = document.getElementById("buscador-contactos");
        const filtroProducto = document.getElementById("filtro-producto");
        const filtroArea = document.getElementById("filtro-area");

        if (buscador) {
            buscador.addEventListener("input", (e) => this.filtrarTabla());
        }

        if (filtroProducto) {
            this.llenarFiltroProductos();
            filtroProducto.addEventListener("change", () =>
                this.filtrarTabla()
            );
        }

        if (filtroArea) {
            this.llenarFiltroAreas();
            filtroArea.addEventListener("change", () => this.filtrarTabla());
        }
    }

    llenarFiltroProductos() {
        const filtroProducto = document.getElementById("filtro-producto");
        if (!filtroProducto) return;

        const productos = [
            ...new Set(
                this.contactos
                    .filter(
                        (c) =>
                            c.producto_requerido &&
                            c.producto_requerido !== "N/A"
                    )
                    .map((c) => c.producto_requerido)
            ),
        ].sort();

        filtroProducto.innerHTML =
            '<option value="">Todos los productos</option>';
        productos.forEach((producto) => {
            const option = document.createElement("option");
            option.value = producto;
            option.textContent = producto;
            filtroProducto.appendChild(option);
        });
    }

    llenarFiltroAreas() {
        const filtroArea = document.getElementById("filtro-area");
        if (!filtroArea) return;

        const areas = [
            ...new Set(
                this.contactos
                    .filter((c) => c.area && c.area !== "N/A")
                    .map((c) => c.area)
            ),
        ].sort();

        filtroArea.innerHTML = '<option value="">Todas las áreas</option>';
        areas.forEach((area) => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            filtroArea.appendChild(option);
        });
    }

    filtrarTabla() {
        const terminoBusqueda =
            document
                .getElementById("buscador-contactos")
                ?.value.toLowerCase() || "";
        const productoSeleccionado =
            document.getElementById("filtro-producto")?.value || "";
        const areaSeleccionada =
            document.getElementById("filtro-area")?.value || "";

        const filas = document.querySelectorAll(
            "#cuerpo-tabla-contactos tr[data-contacto-id]"
        );
        let contadorVisibles = 0;

        filas.forEach((fila) => {
            const textoFila = fila.textContent.toLowerCase();
            const producto = fila.cells[1]?.textContent || "";
            const area = fila.cells[0]?.textContent || "";

            const coincideBusqueda = textoFila.includes(terminoBusqueda);
            const coincideProducto =
                !productoSeleccionado || producto === productoSeleccionado;
            const coincideArea = !areaSeleccionada || area === areaSeleccionada;

            const mostrar =
                coincideBusqueda && coincideProducto && coincideArea;
            fila.style.display = mostrar ? "" : "none";

            if (mostrar) contadorVisibles++;
        });

        this.actualizarContadorResultados(contadorVisibles);
    }

    actualizarContadorResultados(contador) {
        // Puedes implementar un contador visual si lo deseas
        console.log(`🔍 ${contador} contactos encontrados`);
    }

    inicializarSistemaEdicion() {
        // Esperar un poco para que la tabla se renderice completamente
        setTimeout(() => {
            if (typeof editManager !== "undefined" && editManager.inicializar) {
                editManager.inicializar();
                console.log("✅ Sistema de edición inicializado");
            } else {
                console.error("❌ EditManager no disponible");
            }
        }, 1000);
    }

    escapeHtml(text) {
        if (!text) return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    manejarErrorCarga(error) {
        const contenedor = document.getElementById("info-empresa-detalle");
        const tbody = document.getElementById("cuerpo-tabla-contactos");

        if (contenedor) {
            contenedor.innerHTML = `
                <div class="error-mensaje">
                    <strong>Error al cargar los datos:</strong><br>
                    ${error.message}<br>
                    <small>Por favor, recarga la página o verifica la conexión.</small>
                </div>
            `;
        }

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #dc3545;">
                        Error al cargar los contactos
                    </td>
                </tr>
            `;
        }

        if (typeof errorManager !== "undefined" && errorManager.mostrarError) {
            errorManager.mostrarError(`Error de carga: ${error.message}`);
        }
    }

    // Función para recargar datos (llamada desde editManager después de guardar)
    async recargarDatos() {
        console.log("🔄 Recargando datos...");
        try {
            await this.cargarDatosEmpresa();
            await this.cargarContactos();

            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError(
                    "Datos actualizados correctamente",
                    "success",
                    3000
                );
            }
        } catch (error) {
            console.error("❌ Error recargando datos:", error);
            if (typeof errorManager !== "undefined") {
                errorManager.mostrarError(
                    `Error al recargar: ${error.message}`
                );
            }
        }
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
    // Crear instancia global
    window.infoEmpresaManager = new InfoEmpresaManager();

    // Función global para recargar datos
    window.recargarDatosEmpresa = function () {
        if (
            window.infoEmpresaManager &&
            window.infoEmpresaManager.recargarDatos
        ) {
            window.infoEmpresaManager.recargarDatos();
        }
    };

    // Función global para obtener el companyId actual
    window.obtenerCompanyIdActual = function () {
        if (window.infoEmpresaManager) {
            return window.infoEmpresaManager.companyIdActual;
        }
        return null;
    };
});

// También exportar para módulos si es necesario
if (typeof module !== "undefined" && module.exports) {
    module.exports = InfoEmpresaManager;
}
