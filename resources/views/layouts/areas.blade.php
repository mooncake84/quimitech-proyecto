@extends('layouts.app')

@section('title', 'Áreas de Empresa')

@section('content')
<div class="container-fluid">
    <!-- Header -->
    <div class="header-section">
        <div class="header-content">
            <div class="header-left">
                <h1><i class="fas fa-sitemap"></i> Gestión de Áreas de Contacto</h1>
                <p id="empresa-actual-indicador">Empresa: <strong id="nombre-empresa-header">Cargando...</strong></p>
            </div>
            <div class="header-right">
                <div class="empresa-info">
                    <span id="nombre-empresa-actual">Empresa Actual: Cargando...</span>
                </div>
                <a href="{{ route('info-empresa') }}" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i> Volver a Información
                </a>
            </div>
        </div>
    </div>

    <!-- Estadísticas -->
    <div class="estadisticas-areas">
        <div class="estadistica-card">
            <div class="estadistica-icon">
                <i class="fas fa-layer-group"></i>
            </div>
            <div class="estadistica-content">
                <h3 id="total-areas">0</h3>
                <p>Áreas Totales</p>
            </div>
        </div>
        
        <div class="estadistica-card">
            <div class="estadistica-icon">
                <i class="fas fa-user-check"></i>
            </div>
            <div class="estadistica-content">
                <h3 id="areas-con-contacto">0</h3>
                <p>Áreas con Contacto</p>
            </div>
        </div>
        
        <div class="estadistica-card">
            <div class="estadistica-icon">
                <i class="fas fa-user-times"></i>
            </div>
            <div class="estadistica-content">
                <h3 id="areas-sin-contacto">0</h3>
                <p>Áreas sin Contacto</p>
            </div>
        </div>
        
        <div class="estadistica-card">
            <div class="estadistica-icon">
                <i class="fas fa-percentage"></i>
            </div>
            <div class="estadistica-content">
                <h3 id="porcentaje-completitud">0%</h3>
                <p>Completitud</p>
            </div>
        </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filtros-areas card shadow-sm mb-4">
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-md-4">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="search-area" class="form-control" placeholder="Buscar área, producto o contacto...">
                    </div>
                </div>
                
                <div class="col-md-3">
                    <select id="filtro-con-contacto" class="form-control">
                        <option value="todos">Todos los contactos</option>
                        <option value="con">Con contacto asignado</option>
                        <option value="sin">Sin contacto asignado</option>
                    </select>
                </div>
                
                <div class="col-md-5 text-right">
                    <button id="btn-activar-edicion" class="btn btn-primary">
                        <i class="fas fa-edit"></i> Activar Edición
                    </button>
                    
                    <button id="btn-agregar-area" class="btn btn-success" style="display: none;">
                        <i class="fas fa-plus"></i> Agregar Área
                    </button>
                    
                    <button id="btn-guardar-cambios" class="btn btn-success" style="display: none;">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                    
                    <button id="btn-cancelar-edicion" class="btn btn-outline-secondary" style="display: none;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Tabla de áreas -->
    <div class="card shadow-lg">
        <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-list"></i> Lista de Áreas y Contactos</h4>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table id="tabla-areas" class="table table-hover">
                    <thead>
                        <tr>
                            <th width="15%"><i class="fas fa-sitemap"></i> Área</th>
                            <th width="15%"><i class="fas fa-box"></i> Producto</th>
                            <th width="15%"><i class="fas fa-user"></i> Contacto</th>
                            <th width="10%"><i class="fas fa-id-badge"></i> Puesto</th>
                            <th width="10%"><i class="fas fa-phone"></i> Teléfono</th>
                            <th width="8%"><i class="fas fa-phone-office"></i> Ext.</th>
                            <th width="15%"><i class="fas fa-envelope"></i> Email</th>
                            <th width="7%"><i class="fas fa-cog"></i> Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="areas-body">
                        <!-- Las áreas se cargarán aquí -->
                    </tbody>
                </table>
            </div>
            
            <div id="mensaje-vacio" style="display: none; text-align: center; padding: 50px;">
                <i class="fas fa-sitemap fa-4x text-muted mb-3"></i>
                <h4>No hay áreas registradas</h4>
                <p>Agrega áreas de contacto para esta empresa</p>
                <button id="btn-agregar-primera-area" class="btn btn-primary mt-3">
                    <i class="fas fa-plus"></i> Agregar Primera Área
                </button>
            </div>
            
            <div id="loading-areas" style="display: none; text-align: center; padding: 30px;">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Cargando...</span>
                </div>
                <p class="mt-2">Cargando áreas de contacto...</p>
            </div>
        </div>
    </div>
</div>

<!-- Estilos específicos -->
<style>
.estadisticas-areas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.estadistica-card {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 10px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    transition: transform 0.3s ease;
}

.estadistica-card:hover {
    transform: translateY(-5px);
}

.estadistica-icon {
    font-size: 1.8rem;
    opacity: 0.9;
}

.estadistica-content h3 {
    font-size: 1.8rem;
    margin: 0;
    font-weight: bold;
}

.estadistica-content p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
}

.filtros-areas {
    background: #f8f9fa;
    border-radius: 10px;
}

.search-box {
    position: relative;
}

.search-box i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
}

.search-box input {
    padding-left: 35px;
}

#tabla-areas {
    font-size: 14px;
}

#tabla-areas th {
    background: #f8f9fa;
    position: sticky;
    top: 0;
    z-index: 10;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
}

#tabla-areas td {
    vertical-align: middle;
    padding: 12px 8px;
}

.edit-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 14px;
    background-color: #fff;
}

.edit-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.25);
}

.area-row-editable {
    background-color: #fff8e1 !important;
}

.btn-accion {
    padding: 4px 8px;
    font-size: 12px;
    margin: 2px;
}

@media (max-width: 768px) {
    .estadisticas-areas {
        grid-template-columns: 1fr;
    }
    
    .filtros-areas .card-body .row > div {
        margin-bottom: 10px;
    }
    
    .filtros-areas .text-right {
        text-align: left !important;
    }
    
    #tabla-areas {
        font-size: 12px;
    }
    
    #tabla-areas th,
    #tabla-areas td {
        padding: 6px;
    }
}
</style>

<!-- Scripts -->
@section('scripts')
<script>
class AreasManager {
    constructor() {
        this.empresaId = null;
        this.empresaData = null;
        this.areas = [];
        this.contactos = [];
        this.modoEdicion = false;
        this.cambiosPendientes = new Map();
        this.inicializarElementos();
    }

    inicializarElementos() {
        // Elementos principales
        this.nombreEmpresaHeader = document.getElementById('nombre-empresa-header');
        this.nombreEmpresaActual = document.getElementById('nombre-empresa-actual');
        this.empresaIndicador = document.getElementById('empresa-actual-indicador');
        this.areasBody = document.getElementById('areas-body');
        this.mensajeVacio = document.getElementById('mensaje-vacio');
        this.loadingAreas = document.getElementById('loading-areas');
        
        // Estadísticas
        this.totalAreas = document.getElementById('total-areas');
        this.areasConContacto = document.getElementById('areas-con-contacto');
        this.areasSinContacto = document.getElementById('areas-sin-contacto');
        this.porcentajeCompletitud = document.getElementById('porcentaje-completitud');
        
        // Filtros
        this.searchArea = document.getElementById('search-area');
        this.filtroContacto = document.getElementById('filtro-con-contacto');
        
        // Botones
        this.btnActivarEdicion = document.getElementById('btn-activar-edicion');
        this.btnAgregarArea = document.getElementById('btn-agregar-area');
        this.btnGuardarCambios = document.getElementById('btn-guardar-cambios');
        this.btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');
        this.btnAgregarPrimeraArea = document.getElementById('btn-agregar-primera-area');
    }

    async init() {
        try {
            console.log('🚀 Inicializando AreasManager...');
            
            // Obtener empresa ID
            this.empresaId = this.obtenerEmpresaId();
            console.log('📋 Empresa ID:', this.empresaId);
            
            // Mostrar loading
            this.mostrarLoading();
            
            // Cargar datos
            await this.cargarDatosEmpresa();
            await this.cargarContactos();
            
            // Inicializar sistemas
            this.inicializarFiltros();
            this.inicializarSistemaEdicion();
            
            // Renderizar tabla
            this.renderizarTabla();
            this.actualizarEstadisticas();
            
            console.log('✅ AreasManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
            this.mostrarError('Error al cargar las áreas de la empresa: ' + error.message);
        }
    }

    obtenerEmpresaId() {
        // Intentar desde URL
        const urlParams = new URLSearchParams(window.location.search);
        let companyId = urlParams.get('id') || urlParams.get('companyId');
        
        if (companyId) {
            console.log('🔍 ID encontrado en URL:', companyId);
            return companyId;
        }
        
        // Intentar desde localStorage
        companyId = localStorage.getItem('selectedCompany');
        if (companyId) {
            console.log('🔍 ID encontrado en localStorage:', companyId);
            return companyId;
        }
        
        // Intentar desde sessionStorage
        companyId = sessionStorage.getItem('selectedCompany');
        if (companyId) {
            console.log('🔍 ID encontrado en sessionStorage:', companyId);
            return companyId;
        }
        
        // Valor por defecto
        console.log('⚠️ No se encontró ID, usando valor por defecto: 1');
        return '1';
    }

    async cargarDatosEmpresa() {
        try {
            console.log('📥 Cargando datos de empresa...');
            
            const response = await fetch(`/api/empresas/${this.empresaId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Error en la respuesta del servidor');
            }
            
            this.empresaData = result.data;
            
            // Actualizar indicadores
            this.nombreEmpresaHeader.textContent = this.empresaData.nombre;
            this.nombreEmpresaActual.textContent = `Empresa Actual: ${this.empresaData.nombre}`;
            this.empresaIndicador.innerHTML = `Empresa: <strong>${this.empresaData.nombre}</strong>`;
            
            console.log('✅ Datos de empresa cargados:', this.empresaData.nombre);
            
        } catch (error) {
            console.error('❌ Error cargando datos de empresa:', error);
            throw error;
        }
    }

    async cargarContactos() {
        try {
            console.log('📥 Cargando contactos...');
            
            // Intentar diferentes rutas
            const rutasPosibles = [
                `/api/contactos/por-empresa/${this.empresaId}`,
                `/api/empresas/${this.empresaId}/contactos`,
                `/api/contactos?empresa_id=${this.empresaId}`
            ];
            
            let response = null;
            
            for (const ruta of rutasPosibles) {
                console.log(`🔍 Probando ruta: ${ruta}`);
                try {
                    response = await fetch(ruta);
                    if (response.ok) {
                        console.log(`✅ Ruta funcionó: ${ruta}`);
                        break;
                    }
                } catch (error) {
                    console.log(`❌ Error en ruta ${ruta}:`, error.message);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error('No se pudo cargar contactos desde ninguna ruta');
            }
            
            const result = await response.json();
            
            // Procesar respuesta según formato
            if (result.success && Array.isArray(result.data)) {
                this.contactos = result.data;
            } else if (Array.isArray(result)) {
                this.contactos = result;
            } else {
                console.warn('⚠️ Formato de respuesta inesperado, usando array vacío');
                this.contactos = [];
            }
            
            console.log(`✅ ${this.contactos.length} contactos cargados`);
            
        } catch (error) {
            console.error('❌ Error cargando contactos:', error);
            this.contactos = [];
            throw error;
        }
    }

    mostrarLoading() {
        this.loadingAreas.style.display = 'block';
        this.areasBody.innerHTML = '';
        this.mensajeVacio.style.display = 'none';
    }

    ocultarLoading() {
        this.loadingAreas.style.display = 'none';
    }

    renderizarTabla() {
        this.ocultarLoading();
        
        if (!this.areasBody) {
            console.error('❌ Elemento areas-body no encontrado');
            return;
        }
        
        // Limpiar tabla
        this.areasBody.innerHTML = '';
        
        if (this.contactos.length === 0) {
            this.mostrarMensajeVacio();
            console.log('📭 No hay contactos para mostrar');
            return;
        }
        
        // Crear filas para cada contacto
        this.contactos.forEach((contacto, index) => {
            const row = this.crearFilaContacto(contacto, index);
            this.areasBody.appendChild(row);
        });
        
        console.log(`✅ Tabla renderizada con ${this.contactos.length} contactos`);
    }

    crearFilaContacto(contacto, index) {
        const row = document.createElement('tr');
        row.dataset.contactoId = contacto.id || `new-${index}`;
        
        if (contacto.id && this.modoEdicion) {
            row.classList.add('area-row-editable');
        }
        
        // Datos del contacto (usando campos reales)
        const area = contacto.area || '';
        const producto = contacto.producto || '';
        const encargado = contacto.encargado || contacto.nombre_contacto || '';
        const puesto = contacto.puesto || '';
        const telefono = contacto.telefono || '';
        const extension = contacto.extension || '';
        const correo = contacto.correo || contacto.email || '';
        
        // Crear celdas
        const celdas = [
            this.crearCeldaEditable('area', area, contacto.id),
            this.crearCeldaEditable('producto', producto, contacto.id),
            this.crearCeldaEditable('encargado', encargado, contacto.id),
            this.crearCeldaEditable('puesto', puesto, contacto.id),
            this.crearCeldaEditable('telefono', telefono, contacto.id),
            this.crearCeldaEditable('extension', extension, contacto.id),
            this.crearCeldaEditable('correo', correo, contacto.id)
        ];
        
        celdas.forEach(celda => row.appendChild(celda));
        
        // Celda de acciones
        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'text-center';
        
        if (this.modoEdicion && contacto.id) {
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm btn-accion';
            btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
            btnEliminar.title = 'Eliminar contacto';
            btnEliminar.addEventListener('click', () => this.eliminarContacto(contacto.id));
            tdAcciones.appendChild(btnEliminar);
        }
        
        row.appendChild(tdAcciones);
        
        return row;
    }

    crearCeldaEditable(campo, valor, contactoId) {
        const td = document.createElement('td');
        
        if (this.modoEdicion && contactoId) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'edit-input';
            input.value = valor || '';
            input.dataset.field = campo;
            input.dataset.contactoId = contactoId;
            
            // Configurar placeholder según campo
            const placeholders = {
                'area': 'Ej: Administración',
                'producto': 'Ej: Producto Químico',
                'encargado': 'Ej: Juan Pérez',
                'puesto': 'Ej: Gerente',
                'telefono': 'Ej: 8711234567',
                'extension': 'Ej: 101',
                'correo': 'Ej: contacto@empresa.com'
            };
            
            input.placeholder = placeholders[campo] || '';
            
            input.addEventListener('change', (e) => this.manejarCambioContacto(e, contactoId));
            input.addEventListener('blur', (e) => this.manejarCambioContacto(e, contactoId));
            
            td.appendChild(input);
        } else {
            td.textContent = valor || '-';
            td.title = valor || '';
        }
        
        return td;
    }

    mostrarMensajeVacio() {
        this.mensajeVacio.style.display = 'block';
        this.areasBody.innerHTML = '';
    }

    actualizarEstadisticas() {
        const total = this.contactos.length;
        const conContacto = this.contactos.filter(c => 
            c.encargado || c.nombre_contacto
        ).length;
        const sinContacto = total - conContacto;
        const porcentaje = total > 0 ? Math.round((conContacto / total) * 100) : 0;
        
        this.totalAreas.textContent = total;
        this.areasConContacto.textContent = conContacto;
        this.areasSinContacto.textContent = sinContacto;
        this.porcentajeCompletitud.textContent = `${porcentaje}%`;
    }

    inicializarFiltros() {
        // Búsqueda
        if (this.searchArea) {
            this.searchArea.addEventListener('input', () => this.filtrarContactos());
        }
        
        // Filtro por contacto
        if (this.filtroContacto) {
            this.filtroContacto.addEventListener('change', () => this.filtrarContactos());
        }
        
        // Botón agregar primera área
        if (this.btnAgregarPrimeraArea) {
            this.btnAgregarPrimeraArea.addEventListener('click', () => this.agregarNuevoContacto());
        }
    }

    filtrarContactos() {
        const termino = this.searchArea ? this.searchArea.value.toLowerCase() : '';
        const filtro = this.filtroContacto ? this.filtroContacto.value : 'todos';
        
        const contactosFiltrados = this.contactos.filter(contacto => {
            // Filtrar por búsqueda
            if (termino) {
                const textoBusqueda = [
                    contacto.area,
                    contacto.producto,
                    contacto.encargado || contacto.nombre_contacto,
                    contacto.puesto,
                    contacto.telefono,
                    contacto.correo || contacto.email
                ].join(' ').toLowerCase();
                
                if (!textoBusqueda.includes(termino)) {
                    return false;
                }
            }
            
            // Filtrar por presencia de contacto
            if (filtro === 'con') {
                if (!contacto.encargado && !contacto.nombre_contacto) {
                    return false;
                }
            } else if (filtro === 'sin') {
                if (contacto.encargado || contacto.nombre_contacto) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Actualizar tabla
        this.actualizarTablaFiltrada(contactosFiltrados);
    }

    actualizarTablaFiltrada(contactosFiltrados) {
        this.areasBody.innerHTML = '';
        
        if (contactosFiltrados.length === 0) {
            this.mensajeVacio.style.display = 'block';
            return;
        }
        
        contactosFiltrados.forEach((contacto, index) => {
            const row = this.crearFilaContacto(contacto, index);
            this.areasBody.appendChild(row);
        });
        
        this.mensajeVacio.style.display = 'none';
    }

    inicializarSistemaEdicion() {
        // Botón activar edición
        if (this.btnActivarEdicion) {
            this.btnActivarEdicion.addEventListener('click', () => this.activarModoEdicion());
        }
        
        // Botón agregar área
        if (this.btnAgregarArea) {
            this.btnAgregarArea.addEventListener('click', () => this.agregarNuevoContacto());
        }
        
        // Botón guardar cambios
        if (this.btnGuardarCambios) {
            this.btnGuardarCambios.addEventListener('click', () => this.guardarCambios());
        }
        
        // Botón cancelar edición
        if (this.btnCancelarEdicion) {
            this.btnCancelarEdicion.addEventListener('click', () => this.cancelarEdicion());
        }
    }

    activarModoEdicion() {
        this.modoEdicion = true;
        
        // Mostrar/ocultar botones
        if (this.btnActivarEdicion) this.btnActivarEdicion.style.display = 'none';
        if (this.btnAgregarArea) this.btnAgregarArea.style.display = 'inline-block';
        if (this.btnGuardarCambios) this.btnGuardarCambios.style.display = 'inline-block';
        if (this.btnCancelarEdicion) this.btnCancelarEdicion.style.display = 'inline-block';
        
        // Re-renderizar tabla en modo edición
        this.renderizarTabla();
        
        // Mostrar indicador
        this.mostrarIndicadorEdicion();
        
        console.log('✏️ Modo edición activado');
    }

    mostrarIndicadorEdicion() {
        // Eliminar indicador anterior si existe
        const indicadorAnterior = document.getElementById('modo-edicion-indicador');
        if (indicadorAnterior) indicadorAnterior.remove();
        
        const indicador = document.createElement('div');
        indicador.id = 'modo-edicion-indicador';
        indicador.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: linear-gradient(135deg, #f6e05e, #d69e2e);
            color: #2d3748;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: pulse 2s infinite;
        `;
        indicador.textContent = 'MODO EDICIÓN ACTIVO';
        
        document.body.appendChild(indicador);
    }

    cancelarEdicion() {
        if (!confirm('¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.')) {
            return;
        }
        
        this.modoEdicion = false;
        this.cambiosPendientes.clear();
        
        // Restaurar botones
        if (this.btnActivarEdicion) this.btnActivarEdicion.style.display = 'inline-block';
        if (this.btnAgregarArea) this.btnAgregarArea.style.display = 'none';
        if (this.btnGuardarCambios) this.btnGuardarCambios.style.display = 'none';
        if (this.btnCancelarEdicion) this.btnCancelarEdicion.style.display = 'none';
        
        // Re-renderizar tabla normal
        this.renderizarTabla();
        
        // Eliminar indicador
        const indicador = document.getElementById('modo-edicion-indicador');
        if (indicador) indicador.remove();
        
        console.log('❌ Edición cancelada');
    }

    async guardarCambios() {
        try {
            console.log('💾 Guardando cambios...');
            
            // Validar que haya cambios
            if (this.cambiosPendientes.size === 0) {
                this.mostrarMensaje('No hay cambios para guardar', 'info');
                return;
            }
            
            // Guardar cada contacto modificado
            const promesas = [];
            
            for (const [contactoId, cambios] of this.cambiosPendientes) {
                // Si es un contacto nuevo (ID empieza con "new-")
                if (contactoId.toString().startsWith('new-')) {
                    promesas.push(this.crearNuevoContacto(cambios));
                } else {
                    promesas.push(this.actualizarContacto(contactoId, cambios));
                }
            }
            
            // Ejecutar todas las promesas
            await Promise.all(promesas);
            
            // Limpiar cambios pendientes
            this.cambiosPendientes.clear();
            
            // Desactivar modo edición
            this.modoEdicion = false;
            
            // Restaurar botones
            if (this.btnActivarEdicion) this.btnActivarEdicion.style.display = 'inline-block';
            if (this.btnAgregarArea) this.btnAgregarArea.style.display = 'none';
            if (this.btnGuardarCambios) this.btnGuardarCambios.style.display = 'none';
            if (this.btnCancelarEdicion) this.btnCancelarEdicion.style.display = 'none';
            
            // Eliminar indicador
            const indicador = document.getElementById('modo-edicion-indicador');
            if (indicador) indicador.remove();
            
            // Recargar datos
            await this.cargarContactos();
            this.renderizarTabla();
            this.actualizarEstadisticas();
            
            this.mostrarMensaje('Cambios guardados exitosamente', 'success');
            console.log('✅ Cambios guardados correctamente');
            
        } catch (error) {
            console.error('❌ Error guardando cambios:', error);
            this.mostrarMensaje('Error al guardar cambios: ' + error.message, 'error');
        }
    }

    async crearNuevoContacto(datos) {
        try {
            const datosCompletos = {
                empresa_id: this.empresaId,
                area: datos.area || '',
                producto: datos.producto || '',
                encargado: datos.encargado || '',
                puesto: datos.puesto || '',
                telefono: datos.telefono || '',
                extension: datos.extension || '',
                correo: datos.correo || ''
            };
            
            const response = await fetch('/api/contactos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(datosCompletos)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message);
            }
            
            console.log('✅ Contacto creado:', result.data);
            return result.data;
            
        } catch (error) {
            console.error('❌ Error creando contacto:', error);
            throw error;
        }
    }

    async actualizarContacto(contactoId, cambios) {
        try {
            const response = await fetch(`/api/contactos/${contactoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(cambios)
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message);
            }
            
            console.log(`✅ Contacto ${contactoId} actualizado`);
            return result.data;
            
        } catch (error) {
            console.error(`❌ Error actualizando contacto ${contactoId}:`, error);
            throw error;
        }
    }

    manejarCambioContacto(event, contactoId) {
        const input = event.target;
        const field = input.dataset.field;
        const value = input.value.trim();
        
        if (!this.cambiosPendientes.has(contactoId)) {
            this.cambiosPendientes.set(contactoId, {});
        }
        
        const cambios = this.cambiosPendientes.get(contactoId);
        cambios[field] = value;
        
        console.log(`📝 Cambio registrado para contacto ${contactoId}: ${field} = ${value}`);
    }

    async eliminarContacto(contactoId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/contactos/${contactoId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message);
            }
            
            // Eliminar de la lista local
            this.contactos = this.contactos.filter(c => c.id !== contactoId);
            
            // Volver a renderizar
            this.renderizarTabla();
            this.actualizarEstadisticas();
            
            this.mostrarMensaje('Contacto eliminado exitosamente', 'success');
            console.log(`🗑️ Contacto ${contactoId} eliminado`);
            
        } catch (error) {
            console.error('❌ Error eliminando contacto:', error);
            this.mostrarMensaje('Error al eliminar contacto: ' + error.message, 'error');
        }
    }

    agregarNuevoContacto() {
        const nuevoContacto = {
            id: `new-${Date.now()}`,
            area: '',
            producto: '',
            encargado: '',
            puesto: '',
            telefono: '',
            extension: '',
            correo: '',
            empresa_id: this.empresaId
        };
        
        this.contactos.unshift(nuevoContacto);
        
        const row = this.crearFilaContacto(nuevoContacto, 0);
        this.areasBody.insertBefore(row, this.areasBody.firstChild);
        
        // Hacer scroll a la nueva fila
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Enfocar el primer campo
        const primerInput = row.querySelector('input');
        if (primerInput) {
            primerInput.focus();
        }
        
        this.actualizarEstadisticas();
        console.log('➕ Nuevo contacto agregado para edición');
    }

    mostrarMensaje(mensaje, tipo = 'info') {
        // Eliminar notificación anterior si existe
        const notificacionAnterior = document.querySelector('.notification-flotante');
        if (notificacionAnterior) notificacionAnterior.remove();
        
        const notificacion = document.createElement('div');
        notificacion.className = `notification-flotante ${tipo}`;
        notificacion.textContent = mensaje;
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            background: ${tipo === 'success' ? '#38a169' : tipo === 'error' ? '#e53e3e' : '#667eea'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;
        
        // Agregar animación CSS si no existe
        if (!document.querySelector('#notification-animation')) {
            const style = document.createElement('style');
            style.id = 'notification-animation';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notificacion);
        
        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    if (notificacion.parentNode) {
                        document.body.removeChild(notificacion);
                    }
                }, 300);
            }
        }, 3000);
    }

    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'error');
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM cargado, preparando AreasManager...');
    
    try {
        // Crear instancia global
        window.areasManager = new AreasManager();
        
        // Inicializar
        window.areasManager.init().catch(error => {
            console.error('❌ Error fatal en inicialización:', error);
            window.areasManager.mostrarError('Error crítico al cargar las áreas: ' + error.message);
        });
        
    } catch (error) {
        console.error('❌ Error crítico al crear AreasManager:', error);
        alert('Error crítico: ' + error.message + '\n\nPor favor, recarga la página o contacta al administrador.');
    }
});
</script>
@endsection

@endsection