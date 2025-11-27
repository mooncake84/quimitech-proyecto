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
        <h2>Seguimiento de Actividades</h2>

        <p id="empresa-actual-indicador">
            Mostrando actividades para: <strong>Cargando...</strong>
        </p>

        <div class="tabla-scroll">
            <table id="tabla-actividades">
                <thead>
                    <tr>
                        <th>Fecha / Hora</th>
                        <th>Empresa</th>
                        <th>Objetivo</th>
                        <th>Estado</th>
                        <th>Completar</th>
                        <th>Retraso</th>
                        <th>Num.Pedido</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody id="actividades-body"></tbody>
            </table>
        </div>

        <p
            id="mensaje-vacio"
            style="
                display: none;
                text-align: center;
                margin-top: 30px;
                font-size: 18px;
                color: #777;
                padding: 20px;
                border: 1px dashed #ccc;
                border-radius: 8px;
            "
        >
            No hay actividades programadas para esta empresa.
        </p>
    </div>

    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/errorManager.js') }}"></script>
    <script src="{{ asset('js/actividades_script.js') }}"></script>
    <script src="{{ asset('js/autoSaveManager.js') }}"></script>
</body>
</html>