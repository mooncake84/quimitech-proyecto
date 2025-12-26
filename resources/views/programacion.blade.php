<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Programación de Actividades</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
</head>
<body class="programacion-page">
    <header class="rastros-header">
        <div class="empresa-info-selector">
            <a href="{{ route('rastros') }}" class="btn-regresar">← Regresar a Menú</a>
            <p id="nombre-empresa-actual" class="nombre-empresa-actual"></p>
        </div>
    </header>

    <div class="programacion-contenedor">
        <h2>Programar Nueva Actividad</h2>
        
        <p id="empresa-actual-indicador">
            Programando actividad para: <strong>Cargando...</strong>
        </p>

        <!-- Solo formulario de creación -->
        <div class="formulario-programacion">
            <form id="form-actividad" class="form-actividad">
                <div class="form-row">
                    <div class="form-group">
                        <label for="fecha-actividad">Fecha:</label>
                        <input type="date" id="fecha-actividad" name="fecha" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="hora-actividad">Hora:</label>
                        <input type="time" id="hora-actividad" name="hora" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="objetivo-actividad">Objetivo:</label>
                    <textarea id="objetivo-actividad" name="objetivo" rows="3" required 
                              placeholder="Describe el objetivo de la actividad..."></textarea>
                </div>

                <div class="form-group">
                    <label for="datos-adicionales">Datos Adicionales:</label>
                    <textarea id="datos-adicionales" name="datos_adicionales" rows="2"
                              placeholder="Información adicional (opcional)..."></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        💾 Programar Actividad
                    </button>
                    <a href="{{ route('actividades') }}" class="btn btn-secondary">
                        📋 Ver Actividades Programadas
                    </a>
                </div>
            </form>
        </div>

        <!-- Mensaje de éxito -->
        <div id="mensaje-exito" class="mensaje-exito" style="display: none;">
            ✅ Actividad programada exitosamente
        </div>
    </div>

    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/programacion_script.js') }}"></script>
</body>
</html>