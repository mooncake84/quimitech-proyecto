// clientes_script.js - VERSIÓN CORREGIDA

document.addEventListener("DOMContentLoaded", function () {
    // Elementos del DOM
    const clientesBody = document.getElementById("clientes-body");
    const totalClientesElement = document.getElementById("total-clientes");
    const clientesActivosElement = document.getElementById("clientes-activos");
    const clientesInactivosElement =
        document.getElementById("clientes-inactivos");
    const btnNuevoCliente = document.getElementById("btn-nuevo-cliente");
    const btnRefrescar = document.getElementById("btn-refrescar");
    const buscarClienteInput = document.getElementById("buscar-cliente");
    const filtroEstadoSelect = document.getElementById("filtro-estado");

    // Modal elements
    const modalCliente = document.getElementById("modal-cliente");
    const formCliente = document.getElementById("form-cliente");
    const modalTitulo = document.getElementById("modal-titulo");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const btnCancelar = document.getElementById("btn-cancelar");

    // ✅ CORRECCIÓN: Cambiar nombre de variable para claridad
    const giroInput = document.getElementById("rfc"); // Este es correcto, apunta al elemento con id="rfc"
    const estadoInput = document.getElementById("estado"); // Campo estado

    // Otras variables del formulario (mantener igual)
    const clienteIdInput = document.getElementById("cliente-id");
    const nombreInput = document.getElementById("nombre");
    const direccionInput = document.getElementById("direccion");
    const telefonoInput = document.getElementById("telefono");
    const contactoInput = document.getElementById("contacto");
    const emailInput = document.getElementById("email");

    // Variables globales
    let clientes = [];
    let clienteEditando = null;
    let terminoBusqueda = "";
    let filtroEstado = "todos";

    // Verificar que los elementos críticos existen
    if (!clientesBody) {
        console.error(
            "❌ ERROR: Elemento 'clientes-body' no encontrado en el DOM"
        );
        alert(
            "Error crítico: No se puede cargar la página de clientes. Recargue la página."
        );
        return;
    }

    /**
     * Cargar clientes (empresas) desde el servidor
     */
    async function cargarClientes() {
        try {
            mostrarMensajeCarga();

            // Construir URL con filtros
            let url = "/api/clientes";
            const params = new URLSearchParams();

            if (terminoBusqueda) {
                params.append("buscar", terminoBusqueda);
            }

            if (filtroEstado !== "todos") {
                params.append("estado", filtroEstado);
            }

            if (params.toString()) {
                url += "?" + params.toString();
            }

            const response = await fetch(url, {
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const resultado = await response.json();

            if (resultado.success && Array.isArray(resultado.data)) {
                clientes = resultado.data;
                mostrarClientes();
                actualizarEstadisticas();
            } else {
                throw new Error("Formato de respuesta inválido");
            }
        } catch (error) {
            console.error("❌ Error cargando clientes:", error);
            mostrarError(`Error al cargar clientes: ${error.message}`);
        }
    }

    /**
     * Actualizar estadísticas
     */
    function actualizarEstadisticas() {
        if (!clientes || clientes.length === 0) {
            if (totalClientesElement) totalClientesElement.textContent = "0";
            if (clientesActivosElement)
                clientesActivosElement.textContent = "0";
            if (clientesInactivosElement)
                clientesInactivosElement.textContent = "0";
            return;
        }

        const total = clientes.length;
        const activos = clientes.filter((c) => c.estado === "activo").length;
        const inactivos = clientes.filter(
            (c) => c.estado === "inactivo"
        ).length;

        if (totalClientesElement) totalClientesElement.textContent = total;
        if (clientesActivosElement)
            clientesActivosElement.textContent = activos;
        if (clientesInactivosElement)
            clientesInactivosElement.textContent = inactivos;
    }

    /**
     * Mostrar mensaje de carga
     */
    function mostrarMensajeCarga() {
        clientesBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Cargando clientes...</p>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Mostrar error
     */
    function mostrarError(mensaje) {
        clientesBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div style="background: #fed7d7; color: #742a2a; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                        <h3 style="margin-bottom: 10px;">Error</h3>
                        <p style="margin-bottom: 20px;">${mensaje}</p>
                        <button onclick="cargarClientes()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                            <i class="fas fa-redo"></i> Reintentar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Mostrar lista de clientes con filtros
     */
    function mostrarClientes() {
        if (!clientes || clientes.length === 0) {
            clientesBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div style="padding: 40px; color: #718096;">
                            <i class="fas fa-users-slash" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                            <p>No hay clientes registrados</p>
                            <button onclick="abrirModalNuevo()" class="btn btn-primary" style="margin-top: 15px;">
                                <i class="fas fa-plus"></i> Agregar Primer Cliente
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        clientes.forEach((cliente) => {
            // Nota: La BD no tiene RFC, usar giro o industria
            const rfcDisplay = cliente.giro || cliente.industria || "N/A";

            html += `
                <tr data-id="${cliente.id}">
                    <td>${cliente.id}</td>
                    <td><strong>${cliente.nombre}</strong></td>
                    <td>${rfcDisplay}</td>
                    <td>${cliente.telefono || "N/A"}</td>
                    <td>${cliente.contacto || "N/A"}</td>
                    <td>${cliente.email || "N/A"}</td>
                    <td>
                        ${
                            cliente.estado === "inactivo"
                                ? '<span class="estado-inactivo">Inactivo</span>'
                                : '<span class="estado-activo">Activo</span>'
                        }
                    </td>
                    <td>
                        <div class="acciones-cell">
                            <button onclick="window.abrirModalEditar(${
                                cliente.id
                            })" class="btn-accion btn-editar">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button onclick="window.eliminarCliente(${
                                cliente.id
                            })" class="btn-accion btn-eliminar">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        clientesBody.innerHTML = html;
    }

    /**
     * Abrir modal para nuevo cliente
     */
    function abrirModalNuevo() {
        console.log("📝 Abriendo modal para nuevo cliente");

        // Limpiar formulario
        if (formCliente) formCliente.reset();
        if (clienteIdInput) clienteIdInput.value = "";
        if (modalTitulo)
            modalTitulo.innerHTML =
                '<i class="fas fa-user-plus"></i> Nuevo Cliente';
        if (estadoInput) estadoInput.value = "activo"; // Valor por defecto
        clienteEditando = null;

        // Mostrar modal
        if (modalCliente) {
            modalCliente.classList.remove("hidden");
        } else {
            console.error("❌ Modal no encontrado");
            alert("Error: No se puede abrir el modal. Recargue la página.");
        }
    }

    /**
     * Abrir modal para editar cliente
     */
    async function abrirModalEditar(id) {
        console.log(`📝 Editando cliente ID: ${id}`);

        const cliente = clientes.find((c) => c.id === id);
        if (!cliente) {
            alert("Cliente no encontrado");
            return;
        }

        // Cargar datos en el formulario
        if (clienteIdInput) clienteIdInput.value = cliente.id;
        if (nombreInput) nombreInput.value = cliente.nombre || "";
        if (giroInput) giroInput.value = cliente.giro || "";
        if (direccionInput) direccionInput.value = cliente.direccion || "";
        if (telefonoInput) telefonoInput.value = cliente.telefono || "";
        if (contactoInput) contactoInput.value = cliente.contacto || "";
        if (emailInput) emailInput.value = cliente.email || "";
        if (estadoInput) estadoInput.value = cliente.estado || "activo";

        if (modalTitulo) {
            modalTitulo.innerHTML = `<i class="fas fa-edit"></i> Editar Cliente - ${cliente.nombre}`;
        }

        clienteEditando = cliente;

        // Mostrar modal
        if (modalCliente) {
            modalCliente.classList.remove("hidden");
        }
    }

    /**
     * Guardar cliente (nuevo o edición)
     */
    async function guardarCliente(event) {
        event.preventDefault();

        // Validar que elementos existan
        if (
            !nombreInput ||
            !giroInput ||
            !telefonoInput ||
            !contactoInput ||
            !estadoInput
        ) {
            alert("Error: Formulario incompleto. Recargue la página.");
            return;
        }

        const id = clienteIdInput.value;
        const nombre = nombreInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const contacto = contactoInput.value.trim();
        const email = emailInput ? emailInput.value.trim() : "";
        const estado = estadoInput.value; // ✅ Esto captura correctamente el estado

        // Validaciones básicas
        if (!nombre || !telefono || !contacto || !estado) {
            alert("Por favor complete todos los campos obligatorios (*)");
            return;
        }

        // ✅ CORRECCIÓN: Asegurar que giro/industria se envíen correctamente
        const datosCliente = {
            nombre: nombre,
            giro: giroInput.value.trim(), // Esto viene del campo con id="rfc" pero name="giro"
            direccion: direccionInput ? direccionInput.value.trim() : "",
            telefono: telefono,
            contacto: contacto,
            email: email || null,
            industria: giroInput.value.trim(), // Mismo valor que giro
            estado: estado, // ✅ Este es el campo IMPORTANTE que debe enviarse
        };

        // ✅ DEBUG: Verificar datos antes de enviar
        console.log("📤 Datos a enviar a la API:", datosCliente);
        console.log("📤 Valor específico del estado:", estado);
        console.log("📤 Elemento estadoInput existe?:", !!estadoInput);
        console.log("📤 Valor de estadoInput.value:", estadoInput.value);

        try {
            let url = "/api/clientes";
            let method = "POST";

            if (id) {
                url = `/api/clientes/${id}`;
                method = "PUT";
            }

            console.log(`📤 Enviando: ${method} ${url}`);

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify(datosCliente),
            });

            const resultado = await response.json();
            console.log("📥 Respuesta del servidor:", resultado);

            if (resultado.success) {
                alert(
                    id
                        ? "✅ Cliente actualizado exitosamente"
                        : "✅ Cliente creado exitosamente"
                );
                cerrarModal();
                await cargarClientes();
            } else {
                const errorMsg =
                    resultado.message ||
                    (resultado.errors
                        ? JSON.stringify(resultado.errors)
                        : "Error desconocido");
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error("❌ Error guardando cliente:", error);
            alert(`Error al guardar cliente: ${error.message}`);
        }
    }

    /**
     * Eliminar cliente con confirmación
     */
    async function eliminarCliente(id) {
        const cliente = clientes.find((c) => c.id === id);
        if (!cliente) return;

        if (
            !confirm(
                `¿Estás seguro de que deseas eliminar al cliente "${cliente.nombre}"?\n\nEsta acción no se puede deshacer.`
            )
        ) {
            return;
        }

        try {
            console.log(`🗑️ Eliminando cliente ID: ${id}`);

            const response = await fetch(`/api/clientes/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || `Error HTTP: ${response.status}`
                );
            }

            const resultado = await response.json();

            if (resultado.success) {
                alert(`✅ Cliente "${cliente.nombre}" eliminado exitosamente`);
                await cargarClientes();
            } else {
                throw new Error(resultado.message || "Error desconocido");
            }
        } catch (error) {
            console.error("❌ Error eliminando cliente:", error);
            alert(`Error al eliminar cliente: ${error.message}`);
        }
    }

    /**
     * Cerrar modal
     */
    function cerrarModal() {
        if (modalCliente) {
            modalCliente.classList.add("hidden");
        }
        if (formCliente) {
            formCliente.reset();
        }
        clienteEditando = null;
    }

    /**
     * Cambiar estado rápido (activo/inactivo)
     */
    async function cambiarEstadoRapido(id, nuevoEstado) {
        const cliente = clientes.find((c) => c.id === id);
        if (!cliente) return;

        const accion = nuevoEstado === "activo" ? "activar" : "desactivar";
        if (
            !confirm(
                `¿Estás seguro de que deseas ${accion} al cliente "${cliente.nombre}"?`
            )
        ) {
            return;
        }

        try {
            console.log(
                `🔄 Cambiando estado cliente ID: ${id} a ${nuevoEstado}`
            );

            const response = await fetch(`/api/clientes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector(
                        'meta[name="csrf-token"]'
                    ).content,
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            const resultado = await response.json();

            if (resultado.success) {
                alert(
                    `✅ Cliente "${cliente.nombre}" ${accion}do exitosamente`
                );
                await cargarClientes();
            } else {
                throw new Error(resultado.message || "Error desconocido");
            }
        } catch (error) {
            console.error("❌ Error cambiando estado:", error);
            alert(`Error al cambiar estado: ${error.message}`);
        }
    }

    /**
     * Configurar event listeners
     */
    function configurarEventListeners() {
        // Botón nuevo cliente
        if (btnNuevoCliente) {
            btnNuevoCliente.addEventListener("click", abrirModalNuevo);
        }

        // Botón refrescar
        if (btnRefrescar) {
            btnRefrescar.addEventListener("click", cargarClientes);
        }

        // Búsqueda
        if (buscarClienteInput) {
            buscarClienteInput.addEventListener("input", function (e) {
                terminoBusqueda = e.target.value;
                cargarClientes();
            });
        }

        // Filtro por estado
        if (filtroEstadoSelect) {
            filtroEstadoSelect.addEventListener("change", function (e) {
                filtroEstado = e.target.value;
                cargarClientes();
            });
        }

        // Modal
        if (formCliente) {
            formCliente.addEventListener("submit", guardarCliente);
        }

        if (btnCerrarModal) {
            btnCerrarModal.addEventListener("click", cerrarModal);
        }

        if (btnCancelar) {
            btnCancelar.addEventListener("click", cerrarModal);
        }

        // Cerrar modal al hacer clic fuera
        if (modalCliente) {
            modalCliente.addEventListener("click", function (e) {
                if (e.target === modalCliente) {
                    cerrarModal();
                }
            });
        }
    }

    /**
     * Hacer funciones disponibles globalmente
     */
    window.abrirModalNuevo = abrirModalNuevo;
    window.abrirModalEditar = abrirModalEditar;
    window.eliminarCliente = eliminarCliente;
    window.cargarClientes = cargarClientes;
    window.cambiarEstadoRapido = cambiarEstadoRapido;

    /**
     * Inicializar módulo
     */
    async function inicializar() {
        try {
            configurarEventListeners();
            await cargarClientes();
        } catch (error) {
            console.error("❌ Error inicializando gestión de clientes:", error);
            mostrarError(`Error al inicializar: ${error.message}`);
        }
    }

    // Inicializar
    inicializar();
});
