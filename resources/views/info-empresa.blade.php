<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Información de la Empresa</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
    <!-- NUEVO CSS PARA LOS CAMPOS ADICIONALES -->
    <link rel="stylesheet" href="{{ asset('css/empresa_info.css') }}" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="info-empresa-page">
    <header class="rastros-header">
        <div class="empresa-info-selector">
            <a href="{{ route('rastros') }}" class="btn-regresar">← Regresar a Menú</a>
            <p id="nombre-empresa-actual" class="nombre-empresa-actual"></p>
        </div>
    </header>

    <div id="global-error-container"></div>

    <div class="info-empresa-container">
        <div class="info-container">
            <!-- Header con botón de edición -->
            <div class="info-header">
                <h2><i class="fas fa-building"></i> Información de la Empresa</h2>
                <button class="edit-info-btn" id="btn-editar-info-general">
                    <i class="fas fa-edit"></i> Editar Información
                </button>
                <button class="btn btn-success" id="btn-guardar-info" style="display: none;">
                    <i class="fas fa-save"></i> Guardar
                </button>
                <button class="btn btn-secondary" id="btn-cancelar-info" style="display: none;">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>

            <!-- Vista de información (solo lectura) SIN NOTAS -->
            <div id="info-empresa-detalle">
                <div class="info-grid">
                    <div class="info-item">
                        <label>Nombre:</label>
                        <span id="info-nombre">Cargando...</span>
                    </div>
                    <div class="info-item">
                        <label>Dirección:</label>
                        <span id="info-direccion">Cargando...</span>
                    </div>
                    <div class="info-item">
                        <label>Teléfono:</label>
                        <span id="info-telefono">Cargando...</span>
                    </div>
                    <div class="info-item">
                        <label>Email:</label>
                        <span id="info-email">Cargando...</span>
                    </div>
                   <div class="info-item">
    <label>Industria:</label>
    <span id="info-industria" class="industria-tag">Cargando...</span>
</div>
                    <div class="info-item">
                        <label>Giro:</label>
                        <span id="info-giro">Cargando...</span>
                    </div>
                    <div class="info-item full-width">
                        <label>Contacto Principal:</label>
                        <span id="info-contacto">Cargando...</span>
                    </div>
                    <!-- NOTAS ELIMINADA -->
                </div>
                <p class="info-footer">
                    <small>ID: <span id="info-id">...</span> | Datos cargados desde SQL Server</small>
                </p>
            </div>

            <!-- Formulario de edición (oculto inicialmente) SIN NOTAS -->
            <div id="info-edit-form" style="display: none;">
                <h3><i class="fas fa-edit"></i> Editar Información de la Empresa</h3>
                <form id="edit-empresa-form">
                    @csrf
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="edit-nombre">Nombre *</label>
                            <input type="text" id="edit-nombre" name="nombre" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="edit-direccion">Dirección</label>
                            <input type="text" id="edit-direccion" name="direccion" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="edit-telefono">Teléfono</label>
                            <input type="text" id="edit-telefono" name="telefono" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="edit-email">Email</label>
                            <input type="email" id="edit-email" name="email" class="form-control">
                        </div>
                       <div class="form-group">
    <label for="edit-industria">Industria *</label>
    <select id="edit-industria" name="industria" class="form-control" required>
        <option value="">-- Seleccionar industria --</option>
        <option value="Linea Alimentaria">Línea Alimentaria</option>
        <option value="Linea Avicola">Línea Avícola</option>
        <option value="Tratamiento de aguas industriales y residuales">Tratamiento de aguas industriales y residuales</option>
        <option value="Linea industrial Metal- Mecanica">Línea industrial Metal-Mecánica</option>
        <option value="Linea Hospitalaria">Línea Hospitalaria</option>
        <option value="Linea Establos">Línea Establos</option>
        <option value="Linea Institucional">Línea Institucional</option>
        <option value="Linea para la industria del papel">Línea para la industria del papel</option>
        
    </select>
    <small class="form-text text-muted">Selecciona la industria principal de la empresa</small>
</div>
                        <div class="form-group">
                            <label for="edit-giro">Giro</label>
                            <input type="text" id="edit-giro" name="giro" class="form-control">
                        </div>
                        <div class="form-group full-width">
                            <label for="edit-contacto">Contacto Principal</label>
                            <input type="text" id="edit-contacto" name="contacto" class="form-control">
                        </div>
                        <!-- TEXTAREA DE NOTAS ELIMINADO -->
                    </div>
                </form>
            </div>

            <!-- Sección de contactos SIN COLUMNA DE NOTAS -->
            <div class="seccion-tabla">
                <h3>📊 Contactos por Área - Datos de Clientes</h3>

                <div class="herramientas-busqueda">
                    <input
                        type="text"
                        id="buscador-contactos"
                        placeholder="🔍 Buscar por área, encargado, producto..."
                    />
                    <select id="filtro-producto">
                        <option value="todos">Todos los productos</option>
                    </select>
                    <select id="filtro-area">
                        <option value="todos">Todas las áreas</option>
                    </select>
                    <button class="btn-limpiar" id="btn-limpiar-filtros">
                        🗑️ Limpiar Filtros
                    </button>
                    <button class="btn-agregar" id="btn-nueva-fila" style="display: none;">
                        ➕ Nueva Fila
                    </button>
                </div>

                <div class="tabla-scroll-container">
                    <table class="tabla-areas" id="tabla-contactos-areas">
                        <thead>
                            <tr>
                                <th>Área</th>
                                <th>Producto</th>
                                <th>Encargado</th>
                                <th>Puesto</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <!-- COLUMNA DE NOTAS ELIMINADA -->
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla-contactos">
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                                    Cargando contactos...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts en ORDEN CORRECTO -->
    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/info_empresa_script.js') }}"></script>
    <script src="{{ asset('js/editManager.js') }}"></script>
    
    <script>
    // Inicialización simple
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📋 Inicializando sistema de información de empresa...');
        
        // Crear instancia global
        window.infoEmpresaManager = new InfoEmpresaManager();
        
        // Inicializar
        window.infoEmpresaManager.init().then(() => {
            console.log('✅ Sistema de información de empresa listo');
        }).catch(error => {
            console.error('❌ Error inicializando sistema:', error);
            alert('Error al cargar la información de la empresa: ' + error.message);
        });
    });
    </script>
</body>
</html>