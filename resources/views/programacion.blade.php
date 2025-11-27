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
        <div class="form-container">

            <!-- Registro de empleado y cliente -->
            <div class="form-row">
                <div class="input-group">
                    <label for="empleado-registro">Empleado que registra:</label>
                    <input 
                        type="text" 
                        id="empleado-registro" 
                        placeholder="Ej. Juan Pérez" 
                        required 
                    />
                </div>
                <div class="input-group">
                    <label for="cliente-receptor">Cliente que recibirá:</label>
                    <input 
                        type="text" 
                        id="cliente-receptor" 
                        placeholder="Ej. Distribuidora López" 
                        required 
                    />
                </div>
            </div>

            <div class="form-row">
                <div class="input-group">
                    <label for="fecha-actividad">Fecha de Visita:</label>
                    <input type="date" id="fecha-actividad" required />
                </div>
                <div class="input-group">
                    <label for="hora-actividad">Hora Estimada:</label>
                    <input type="time" id="hora-actividad" required />
                </div>
            </div>

            <div class="input-group full-width">
                <label for="objetivo-visita">Objetivo de la Visita:</label>
                <textarea
                    id="objetivo-visita"
                    rows="3"
                    placeholder="Ej. Presentación de nuevos productos, seguimiento de pedido, toma de muestra, etc."
                    required
                ></textarea>
            </div>

            <div class="input-group full-width">
                <label for="datos-adicionales">
                    Toma de Datos (Datos Relevantes/Muestras):
                </label>
                <textarea
                    id="datos-adicionales"
                    rows="5"
                    placeholder="Ej. Se requiere tomar muestra de pH, se confirmará la cantidad de stock, verificar temperatura de almacén, etc."
                ></textarea>
            </div>
        </div>

        <button id="btn-guardar-actividad" class="btn-guardar">
            Guardar Actividad
        </button>

        <p
            id="mensaje-guardado"
            style="
                text-align: center;
                margin-top: 15px;
                color: green;
                display: none;
            "
        >
            ¡Actividad programada!
        </p>
    </div>

    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/errorManager.js') }}"></script>
    <script src="{{ asset('js/formValidator.js') }}"></script>
    <script src="{{ asset('js/autoSaveManager.js') }}"></script>
    <script src="{{ asset('js/programacion_script.js') }}"></script>
    
</body>
</html>