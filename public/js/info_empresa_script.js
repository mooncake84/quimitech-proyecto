class InfoEmpresaManager {
    constructor() {
        this.empresaId = null;
        this.empresaData = null;
        this.contactos = [];
        this.filtros = {
            producto: "todos",
            area: "todos",
        };

        this.modoEdicionInfoGeneral = false;

        this.industriasPermitidas = [
            "Linea Alimentaria",
            "Linea Avicola",
            "Tratamiento de aguas industriales y residuales",
            "Linea industrial Metal- Mecanica",
            "Linea Hospitalaria",
            "Linea Establos",
            "Linea Institucional",
            "Linea para la industria del papel",
            "Otra",
        ];

        this.inicializarElementos();
    }

    inicializarElementos() {
        this.nombreEmpresa = document.getElementById("info-nombre");
        this.giroEmpresa = document.getElementById("info-giro");
        this.direccionEmpresa = document.getElementById("info-direccion");
        this.contactoEmpresa = document.getElementById("info-contacto");
        this.telefonoEmpresa = document.getElementById("info-telefono");
        this.emailEmpresa = document.getElementById("info-email");
        this.industriaEmpresa = document.getElementById("info-industria");

        this.formularioEdicion = document.getElementById("info-edit-form");
        this.editNombre = document.getElementById("edit-nombre");
        this.editGiro = document.getElementById("edit-giro");
        this.editDireccion = document.getElementById("edit-direccion");
        this.editContacto = document.getElementById("edit-contacto");
        this.editTelefono = document.getElementById("edit-telefono");
        this.editEmail = document.getElementById("edit-email");
        this.editIndustria = document.getElementById("edit-industria");

        this.btnEditarInfoGeneral = document.getElementById(
            "btn-editar-info-general"
        );
        this.btnGuardarInfoGeneral =
            document.getElementById("btn-guardar-info");
        this.btnCancelarInfoGeneral =
            document.getElementById("btn-cancelar-info");

        this.contactosBody = document.getElementById("cuerpo-tabla-contactos");

        this.buscador = document.getElementById("buscador-contactos");
        this.filtroProducto = document.getElementById("filtro-producto");
        this.filtroArea = document.getElementById("filtro-area");
        this.btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");

        this.btnNuevaFila = document.getElementById("btn-nueva-fila");
    }

    async init() {
        try {
            this.empresaId = this.obtenerEmpresaId();
            if (!this.empresaId)
                throw new Error("No se pudo determinar el ID de la empresa");

            await this.cargarDatosEmpresa();
            await this.cargarContactos();

            this.inicializarSistemaInfoGeneral();
            this.inicializarBusquedaYFiltros();

            this.dispararEventoDatosCargados();
        } catch (error) {
            this.mostrarError(`Error al cargar datos: ${error.message}`);
        }
    }

    obtenerEmpresaId() {
        const urlParams = new URLSearchParams(window.location.search);
        let companyId = urlParams.get("companyId");

        if (companyId) return this.convertirIdEmpresa(companyId);

        companyId = localStorage.getItem("selectedCompany");
        if (companyId) return this.convertirIdEmpresa(companyId);

        const selectorEmpresa = document.querySelector(
            ".select-empresa-header"
        );
        if (selectorEmpresa && selectorEmpresa.value)
            return this.convertirIdEmpresa(selectorEmpresa.value);

        return "1";
    }

    convertirIdEmpresa(id) {
        if (!id) return "1";
        const idStr = id.toString().trim();
        if (idStr.toLowerCase().startsWith("empresa")) {
            return idStr.replace(/empresa/i, "") || "1";
        }
        return /^\d+$/.test(idStr) ? idStr : "1";
    }

    async cargarDatosEmpresa() {
        try {
            const response = await fetch(`/api/empresas/${this.empresaId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            if (!result.success)
                throw new Error(result.message || "Error del servidor");

            this.empresaData = result.data;
            this.renderizarInfoGeneral();
            return this.empresaData;
        } catch (error) {
            throw error;
        }
    }

    async cargarContactos() {
        try {
            const response = await fetch(
                `/api/contactos/por-empresa/${this.empresaId}`
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            if (!result.success)
                throw new Error(result.message || "Error del servidor");

            this.contactos = (result.data || []).map((contacto) => ({
                id: contacto.id,
                empresa_id: contacto.empresa_id,
                area: contacto.area || "",
                producto:
                    contacto.producto || contacto.producto_requerido || "",
                encargado: contacto.encargado || contacto.nombre_contacto || "",
                puesto: contacto.puesto || "",
                telefono: contacto.telefono || "",
                extension: contacto.extension || "",
                correo: contacto.correo || contacto.email || "",
            }));

            this.renderizarTabla();
            this.actualizarOpcionesFiltros();
            return this.contactos;
        } catch (error) {
            this.contactos = [];
            this.mostrarErrorContactos(error);
            return [];
        }
    }

    mostrarErrorContactos(error) {
        if (!this.contactosBody) return;
        this.contactosBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #718096;">
                    <div style="color: #e53e3e;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 24px;"></i>
                        <p><strong>Error al cargar contactos</strong></p>
                        <p style="font-size: 14px;">${error.message}</p>
                        <button onclick="window.infoEmpresaManager.cargarContactos()" 
                                style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderizarInfoGeneral() {
        if (!this.empresaData) return;
        const data = this.empresaData;

        if (this.nombreEmpresa)
            this.nombreEmpresa.textContent = data.nombre || "No disponible";
        if (this.giroEmpresa)
            this.giroEmpresa.textContent = data.giro || "No disponible";
        if (this.direccionEmpresa)
            this.direccionEmpresa.textContent =
                data.direccion || "No disponible";
        if (this.contactoEmpresa)
            this.contactoEmpresa.textContent = data.contacto || "No disponible";
        if (this.telefonoEmpresa)
            this.telefonoEmpresa.textContent = data.telefono || "No disponible";
        if (this.emailEmpresa)
            this.emailEmpresa.textContent = data.email || "No disponible";

        if (this.industriaEmpresa) {
            const industria = data.industria || "No especificada";
            this.industriaEmpresa.textContent = industria;
            this.aplicarEstiloIndustria(this.industriaEmpresa, industria);
        }

        if (this.editNombre) {
            this.editNombre.value = data.nombre || "";
            this.editGiro.value = data.giro || "";
            this.editDireccion.value = data.direccion || "";
            this.editContacto.value = data.contacto || "";
            this.editTelefono.value = data.telefono || "";
            this.editEmail.value = data.email || "";
            if (this.editIndustria) {
                const industria = data.industria || "";
                this.editIndustria.value = industria;
                if (industria && !this.opcionIndustriaExiste(industria)) {
                    this.agregarOpcionIndustriaTemporal(industria);
                }
            }
        }

        const infoIdElement = document.getElementById("info-id");
        if (infoIdElement && data.id) infoIdElement.textContent = data.id;

        const nombreHeader = document.getElementById("nombre-empresa-actual");
        if (nombreHeader && data.nombre) nombreHeader.textContent = data.nombre;
    }

    aplicarEstiloIndustria(elemento, industria) {
        if (!elemento || !industria) return;
        const coloresIndustria = {
            "Linea Alimentaria": {
                bg: "#e8f5e9",
                text: "#2e7d32",
                border: "#c8e6c9",
            },
            "Linea Avicola": {
                bg: "#fff3e0",
                text: "#ef6c00",
                border: "#ffcc80",
            },
            "Tratamiento de aguas industriales y residuales": {
                bg: "#e1f5fe",
                text: "#0288d1",
                border: "#b3e5fc",
            },
            "Linea industrial Metal- Mecanica": {
                bg: "#f3e5f5",
                text: "#7b1fa2",
                border: "#e1bee7",
            },
            "Linea Hospitalaria": {
                bg: "#ffebee",
                text: "#d32f2f",
                border: "#ffcdd2",
            },
            "Linea Establos": {
                bg: "#fff8e1",
                text: "#ff8f00",
                border: "#ffecb3",
            },
            "Linea Institucional": {
                bg: "#f9fbe7",
                text: "#827717",
                border: "#f0f4c3",
            },
            "Linea para la industria del papel": {
                bg: "#fce4ec",
                text: "#c2185b",
                border: "#f8bbd9",
            },
            Otra: { bg: "#f5f5f5", text: "#616161", border: "#e0e0e0" },
            "No especificada": {
                bg: "#fafafa",
                text: "#757575",
                border: "#eeeeee",
            },
        };
        const estilo =
            coloresIndustria[industria] || coloresIndustria["No especificada"];
        elemento.style.cssText = `display: inline-block; padding: 4px 12px; background-color: ${estilo.bg}; color: ${estilo.text}; border: 1px solid ${estilo.border}; border-radius: 20px; font-size: 14px; font-weight: 500;`;
    }

    opcionIndustriaExiste(industria) {
        return this.editIndustria
            ? Array.from(this.editIndustria.options).some(
                  (opt) => opt.value === industria
              )
            : false;
    }

    agregarOpcionIndustriaTemporal(industria) {
        if (!this.editIndustria || this.opcionIndustriaExiste(industria))
            return;
        const option = document.createElement("option");
        option.value = industria;
        option.textContent = `${industria} (personalizado)`;
        option.dataset.temporal = "true";
        const opcionOtra = Array.from(this.editIndustria.options).find(
            (opt) => opt.value === "Otra"
        );
        if (opcionOtra) this.editIndustria.insertBefore(option, opcionOtra);
        else this.editIndustria.appendChild(option);
    }

    renderizarTabla() {
        if (!this.contactosBody) return;
        this.contactosBody.innerHTML = "";
        if (this.contactos.length === 0) {
            this.mostrarMensajeVacio();
            return;
        }
        this.contactos.forEach((contacto, index) => {
            const row = this.crearFilaVista(contacto, index);
            this.contactosBody.appendChild(row);
        });
    }

    crearFilaVista(contacto, index) {
        const row = document.createElement("tr");
        const contactoId = contacto.id || `temp-${index}`;
        row.dataset.contactoId = contactoId;
        row.dataset.originalData = JSON.stringify(contacto);

        const campos = [
            "area",
            "producto",
            "encargado",
            "puesto",
            "telefono",
            "correo",
        ];
        campos.forEach((campo) => {
            const td = document.createElement("td");
            const valor = contacto[campo] || "";
            td.setAttribute("data-field", campo);
            td.setAttribute("data-valor-original", valor);
            td.textContent = valor;
            td.style.cssText = `padding: 10px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; min-height: 40px;`;
            row.appendChild(td);
        });

        const tdAcciones = document.createElement("td");
        tdAcciones.className = "acciones-edicion";
        tdAcciones.style.cssText = `display: none; text-align: center; min-width: 80px; padding: 10px 8px;`;
        tdAcciones.innerHTML = `<button class="btn-eliminar-fila" data-contacto-id="${contactoId}" style="display: none; opacity: 0; pointer-events: none;"><i class="fas fa-trash"></i></button>`;
        row.appendChild(tdAcciones);

        return row;
    }

    mostrarMensajeVacio() {
        if (this.contactosBody) {
            this.contactosBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #718096;">No hay contactos registrados.</td></tr>`;
        }
    }

    inicializarSistemaInfoGeneral() {
        if (this.btnEditarInfoGeneral)
            this.btnEditarInfoGeneral.addEventListener("click", () =>
                this.toggleEditInfo()
            );
        if (this.btnGuardarInfoGeneral)
            this.btnGuardarInfoGeneral.addEventListener("click", (e) => {
                e.preventDefault();
                this.guardarInformacionGeneral();
            });
        if (this.btnCancelarInfoGeneral)
            this.btnCancelarInfoGeneral.addEventListener("click", () =>
                this.cancelarEdicionInfoGeneral()
            );
    }

    toggleEditInfo() {
        this.modoEdicionInfoGeneral = !this.modoEdicionInfoGeneral;
        if (this.modoEdicionInfoGeneral) this.activarEdicionInfoGeneral();
        else this.desactivarEdicionInfoGeneral();
    }

    activarEdicionInfoGeneral() {
        if (this.formularioEdicion)
            this.formularioEdicion.style.display = "block";
        if (this.btnEditarInfoGeneral)
            this.btnEditarInfoGeneral.style.display = "none";
        if (this.btnGuardarInfoGeneral)
            this.btnGuardarInfoGeneral.style.display = "inline-block";
        if (this.btnCancelarInfoGeneral)
            this.btnCancelarInfoGeneral.style.display = "inline-block";
    }

    desactivarEdicionInfoGeneral() {
        if (this.formularioEdicion)
            this.formularioEdicion.style.display = "none";
        if (this.btnEditarInfoGeneral)
            this.btnEditarInfoGeneral.style.display = "inline-block";
        if (this.btnGuardarInfoGeneral)
            this.btnGuardarInfoGeneral.style.display = "none";
        if (this.btnCancelarInfoGeneral)
            this.btnCancelarInfoGeneral.style.display = "none";
        this.renderizarInfoGeneral();
    }

    cancelarEdicionInfoGeneral() {
        if (confirm("¿Cancelar edición y perder los cambios?")) {
            this.modoEdicionInfoGeneral = false;
            this.desactivarEdicionInfoGeneral();
            this.mostrarNotificacion("Edición cancelada", "info");
        }
    }

    async guardarInformacionGeneral() {
        try {
            if (!this.editNombre || !this.empresaId)
                throw new Error("Faltan elementos");
            const industria = this.editIndustria
                ? this.editIndustria.value
                : "";
            if (!industria) {
                this.mostrarNotificacion(
                    "⚠️ Selecciona una industria",
                    "error"
                );
                return;
            }
            const datos = {
                nombre: this.editNombre.value || "",
                giro: this.editGiro.value || "",
                direccion: this.editDireccion.value || "",
                contacto: this.editContacto.value || "",
                telefono: this.editTelefono.value || "",
                email: this.editEmail.value || "",
                industria: industria,
            };
            const csrfToken = this.obtenerCSRFToken();
            const response = await fetch(`/api/empresas/${this.empresaId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify(datos),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.message || "Error");
            this.empresaData = { ...this.empresaData, ...datos };
            this.desactivarEdicionInfoGeneral();
            this.mostrarNotificacion("✅ Información guardada", "success");
        } catch (error) {
            this.mostrarNotificacion(`❌ Error: ${error.message}`, "error");
        }
    }

    inicializarBusquedaYFiltros() {
        if (this.buscador)
            this.buscador.addEventListener("input", () =>
                this.filtrarContactos()
            );
        if (this.filtroProducto)
            this.filtroProducto.addEventListener("change", () =>
                this.filtrarContactos()
            );
        if (this.filtroArea)
            this.filtroArea.addEventListener("change", () =>
                this.filtrarContactos()
            );
        if (this.btnLimpiarFiltros)
            this.btnLimpiarFiltros.addEventListener("click", () =>
                this.limpiarFiltros()
            );
    }

    actualizarOpcionesFiltros() {
        if (!this.filtroProducto || !this.filtroArea) return;
        const productos = [
            ...new Set(this.contactos.map((c) => c.producto).filter(Boolean)),
        ];
        const areas = [
            ...new Set(this.contactos.map((c) => c.area).filter(Boolean)),
        ];

        this.filtroProducto.innerHTML =
            '<option value="todos">Todos los productos</option>';
        productos.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p;
            opt.textContent = p;
            this.filtroProducto.appendChild(opt);
        });

        this.filtroArea.innerHTML =
            '<option value="todos">Todas las áreas</option>';
        areas.forEach((a) => {
            const opt = document.createElement("option");
            opt.value = a;
            opt.textContent = a;
            this.filtroArea.appendChild(opt);
        });
    }

    filtrarContactos() {
        const search = this.buscador ? this.buscador.value.toLowerCase() : "";
        const fProd = this.filtroProducto ? this.filtroProducto.value : "todos";
        const fArea = this.filtroArea ? this.filtroArea.value : "todos";

        const filtrados = this.contactos.filter((c) => {
            if (
                search &&
                !Object.values(c).join(" ").toLowerCase().includes(search)
            )
                return false;
            if (fProd !== "todos" && c.producto !== fProd) return false;
            if (fArea !== "todos" && c.area !== fArea) return false;
            return true;
        });
        this.actualizarTablaFiltrada(filtrados);
    }

    actualizarTablaFiltrada(filtrados) {
        if (!this.contactosBody) return;
        this.contactosBody.innerHTML = "";
        if (filtrados.length === 0) this.mostrarMensajeVacio();
        else
            filtrados.forEach((c, i) =>
                this.contactosBody.appendChild(this.crearFilaVista(c, i))
            );
    }

    limpiarFiltros() {
        if (this.buscador) this.buscador.value = "";
        if (this.filtroProducto) this.filtroProducto.value = "todos";
        if (this.filtroArea) this.filtroArea.value = "todos";
        this.filtrarContactos();
    }

    obtenerCSRFToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute("content");
        const tokenInput = document.querySelector('input[name="_token"]');
        return tokenInput ? tokenInput.value : "";
    }

    mostrarNotificacion(mensaje, tipo = "info") {
        const ant = document.querySelector(".notification");
        if (ant) ant.remove();
        const notif = document.createElement("div");
        notif.className = `notification ${tipo}`;
        notif.textContent = mensaje;
        notif.style.cssText = `position: fixed; top: 80px; right: 20px; padding: 15px 25px; border-radius: 8px; color: white; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);`;
        if (tipo === "success")
            notif.style.background =
                "linear-gradient(135deg, #38a169, #2f855a)";
        else if (tipo === "error")
            notif.style.background =
                "linear-gradient(135deg, #e53e3e, #c53030)";
        else
            notif.style.background =
                "linear-gradient(135deg, #667eea, #764ba2)";
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    mostrarError(mensaje) {
        this.mostrarNotificacion(`⚠️ ${mensaje}`, "error");
    }

    dispararEventoDatosCargados() {
        window.dispatchEvent(
            new CustomEvent("datosEmpresaCargados", {
                detail: {
                    empresaId: this.empresaId,
                    empresaData: this.empresaData,
                    contactos: this.contactos,
                },
            })
        );
    }

    async recargarDatos() {
        try {
            await this.cargarContactos();
            this.mostrarNotificacion("✅ Datos actualizados", "success");
        } catch (e) {
            this.mostrarError("Error al actualizar");
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        try {
            window.infoEmpresaManager = new InfoEmpresaManager();
            window.infoEmpresaManager.init().then(() => {
                window.toggleEditInfo = function () {
                    if (window.infoEmpresaManager)
                        window.infoEmpresaManager.toggleEditInfo();
                };
            });
        } catch (e) {}
    }, 100);
});

if (typeof window !== "undefined") {
    window.recargarContactosEmpresa = () =>
        window.infoEmpresaManager
            ? window.infoEmpresaManager.recargarDatos()
            : false;
    window.obtenerDatosEmpresaActual = () =>
        window.infoEmpresaManager
            ? {
                  empresaId: window.infoEmpresaManager.empresaId,
                  empresaData: window.infoEmpresaManager.empresaData,
                  contactos: window.infoEmpresaManager.contactos,
              }
            : null;
}
