<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Gestión de Clientes - QuimiTech</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="clientes-page">
    <header class="rastros-header">
        <div class="empresa-info-selector">
            <a href="{{ route('rastros') }}" class="btn-regresar">
                <i class="fas fa-arrow-left"></i> Regresar a Menú
            </a>
            <p id="nombre-empresa-actual" class="nombre-empresa-actual">
                <i class="fas fa-users"></i> Gestión de Clientes
            </p>
        </div>
    </header>

    <!-- ELEMENTO CONTENIDO PRINCIPAL (FALTANTE) -->
    <div id="contenido-clientes" class="clientes-contenedor">
        <!-- Encabezado con estadísticas -->
        <div class="clientes-header">
            <h2><i class="fas fa-building"></i> Gestión de Clientes</h2>
            <div class="header-actions">
                <button id="btn-nuevo-cliente" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Nuevo Cliente
                </button>
                <button id="btn-refrescar" class="btn btn-secondary">
                    <i class="fas fa-sync-alt"></i> Refrescar
                </button>
            </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="clientes-stats">
            <div class="stat-card">
                <div class="stat-icon" style="background: #4f46e5;">
                    <i class="fas fa-building"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-number" id="total-clientes">0</span>
                    <span class="stat-label">Clientes Totales</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #10b981;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-number" id="clientes-activos">0</span>
                    <span class="stat-label">Clientes Activos</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #f59e0b;">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-number" id="clientes-inactivos">0</span>
                    <span class="stat-label">Clientes Inactivos</span>
                </div>
            </div>
        </div>

        <!-- Búsqueda y filtros -->
        <div class="filtros-clientes">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="buscar-cliente" placeholder="Buscar cliente por nombre, contacto, email...">
            </div>
            <div class="filter-actions">
                <select id="filtro-estado">
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                </select>

            </div>
        </div>

        <!-- Tabla de clientes -->
        <div class="tabla-scroll-container">
            <table id="tabla-clientes">
                <thead>
                    <tr>
                        <th width="5%">ID</th>
                        <th width="20%">Nombre</th>
                        <th width="15%">Giro/Industria</th> <!-- Cambiado de RFC -->
                        <th width="15%">Teléfono</th>
                        <th width="15%">Contacto</th>
                        <th width="10%">Email</th>
                        <th width="10%">Estado</th>
                        <th width="10%">Acciones</th>
                    </tr>
                </thead>
                <tbody id="clientes-body">
                    <!-- Datos se cargarán con JavaScript -->
                    <tr>
                        <td colspan="8" class="text-center">
                            <div class="loading-spinner">
                                <div class="spinner"></div>
                                <p>Cargando clientes...</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Paginación -->
        <div class="paginacion">
            <button id="btn-prev" class="btn-pag" disabled>
                <i class="fas fa-chevron-left"></i> Anterior
            </button>
            <span class="pag-info" id="pag-info">Página 1 de 1</span>
            <button id="btn-next" class="btn-pag" disabled>
                Siguiente <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>

  <!-- Modal para nuevo/editar cliente - VERSIÓN CON CAMPO ESTADO -->
<div id="modal-cliente" class="modal-overlay hidden">
    <div class="modal-container">
        <div class="modal-header">
            <h3 id="modal-titulo">
                <i class="fas fa-user-plus"></i> Nuevo Cliente
            </h3>
            <button type="button" class="modal-close-btn" id="btn-cerrar-modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <form id="form-cliente">
            <div class="modal-body">
                <!-- Campo oculto para ID -->
                <input type="hidden" id="cliente-id" name="id">
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="nombre">
                            <i class="fas fa-building"></i> Nombre de la Empresa *
                        </label>
                        <input type="text" id="nombre" name="nombre" required
                               class="form-control" placeholder="Ej: QuimiTech SA de CV">
                    </div>
                    
                    <div class="form-group">
                        <label for="rfc">
                            <i class="fas fa-industry"></i> Giro/Industria *
                        </label>
                        <input type="text" id="rfc" name="giro" required
                               class="form-control" placeholder="Ej: Procesamiento de Carnes">
                    </div>
                    
                    <div class="form-group">
                        <label for="direccion">
                            <i class="fas fa-map-marker-alt"></i> Dirección
                        </label>
                        <textarea id="direccion" name="direccion" rows="2"
                                  class="form-control" placeholder="Dirección completa"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="telefono">
                            <i class="fas fa-phone"></i> Teléfono *
                        </label>
                        <input type="tel" id="telefono" name="telefono" required
                               class="form-control" placeholder="Ej: 5551234567">
                    </div>
                    
                    <div class="form-group">
                        <label for="contacto">
                            <i class="fas fa-user-tie"></i> Persona de Contacto *
                        </label>
                        <input type="text" id="contacto" name="contacto" required
                               class="form-control" placeholder="Nombre del contacto">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">
                            <i class="fas fa-envelope"></i> Email
                        </label>
                        <input type="email" id="email" name="email"
                               class="form-control" placeholder="contacto@empresa.com">
                    </div>
                    
                    <!-- NUEVO CAMPO: ESTADO -->
                    <div class="form-group">
                        <label for="estado">
                            <i class="fas fa-toggle-on"></i> Estado *
                        </label>
                        <select id="estado" name="estado" required class="form-control">
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" id="btn-cancelar" class="btn btn-secondary">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" id="btn-guardar" class="btn btn-primary">
                    <i class="fas fa-save"></i> Guardar Cliente
                </button>
            </div>
        </form>
    </div>
</div>

    <!-- Scripts -->
    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/clientes_script.js') }}"></script>
</body>
</html>