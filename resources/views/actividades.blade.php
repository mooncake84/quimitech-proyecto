<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Seguimiento de Actividades</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
</head>
<body class="actividades-page">
    <header class="rastros-header">
        <div class="empresa-info-selector">
            <a href="{{ route('rastros') }}" class="btn-regresar">← Regresar a Menú</a>
            <p id="nombre-empresa-actual" class="nombre-empresa-actual"></p>
        </div>
    </header>

    <div class="actividades-contenedor">
        <div class="actividades-header">
            <h2>Seguimiento de Actividades</h2>
            <a href="{{ route('programacion') }}" class="btn btn-primary">
                 Programar Nueva Actividad
            </a>
        </div>

        <p id="empresa-actual-indicador">
            Mostrando actividades para: <strong>Cargando...</strong>
        </p>

        <!-- Filtros y Estadísticas -->
        <div class="filtros-actividades">
            <div class="filtros-row">
                <div class="filtro-group">
                    <label for="filtro-estado">Filtrar por Estado:</label>
                    <select id="filtro-estado">
                        <option value="todos">Todos los estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Completado">Completado</option>
                
                    </select>
                </div>
                
                <div class="filtro-group">
                    <label for="filtro-fecha">Filtrar por Fecha:</label>
                    <input type="date" id="filtro-fecha">
                </div>
                
                <button id="btn-limpiar-filtros" class="btn btn-secondary">Limpiar Filtros</button>
            </div>
            
            <!-- Estadísticas -->
            <div class="estadisticas-actividades">
                <div class="estadistica-item">
                    <span class="estadistica-numero" id="total-actividades">0</span>
                    <span class="estadistica-label">Total</span>
                </div>
                <div class="estadistica-item">
                    <span class="estadistica-numero estado-pendiente" id="pendientes-count">0</span>
                    <span class="estadistica-label">Pendientes</span>
                </div>
                <div class="estadistica-item">
                    <span class="estadistica-numero estado-completado" id="completadas-count">0</span>
                    <span class="estadistica-label">Completadas</span>
                </div>
                
            </div>
        </div>

        <!-- Tabla de Actividades -->
        <div class="tabla-scroll">
            <table id="tabla-actividades">
                <thead>
                    <tr>
                        <th>Fecha / Hora</th>
                        <th>Empresa</th>
                        <th>Objetivo</th>
                        <th>Estado</th>
                        <th>Completar</th>
                        <th>Reprogramar</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="actividades-body"></tbody>
            </table>
        </div>

        <p id="mensaje-vacio" class="mensaje-vacio">
            No hay actividades programadas para esta empresa.
        </p>
    </div>

    <!-- Modal de Reprogramación - VERSIÓN MEJORADA -->
    <div id="modal-reprogramar" class="hidden">
        <div class="modal-container">
            <div class="modal-header">
                <h3>📅 Reprogramar Actividad</h3>
                <p>Cambia la fecha y hora de esta actividad</p>
                <button type="button" class="modal-close-btn" id="btn-cerrar-modal" aria-label="Cerrar modal">
                    ×
                </button>
            </div>
            
            <form id="form-reprogramar">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="fecha-reprogramar">
                            Nueva Fecha *
                        </label>
                        <input 
                            type="date" 
                            id="fecha-reprogramar" 
                            name="fecha" 
                            required
                            class="form-control"
                            min=""
                            placeholder="Selecciona una fecha">
                    </div>
                    
                    <div class="form-group">
                        <label for="hora-reprogramar">
                            Nueva Hora *
                        </label>
                        <input 
                            type="time" 
                            id="hora-reprogramar" 
                            name="hora" 
                            required
                            class="form-control"
                            placeholder="HH:MM">
                    </div>
                    
                    <div class="info-note">
                        <strong>Nota:</strong> Al reprogramar, la actividad volverá al estado "Pendiente" y se actualizará en el sistema.
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button 
                        type="button" 
                        id="btn-cancelar-reprogramar"
                        class="modal-btn modal-btn-cancel">
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        id="btn-guardar-reprogramar"
                        class="modal-btn modal-btn-save">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/errorManager.js') }}"></script>
    <script src="{{ asset('js/actividades_script.js') }}"></script>
    

</body>
</html>