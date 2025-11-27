<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Información de la Empresa</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
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
            <h2>Información de la Empresa</h2>
            <div id="info-empresa-detalle">
                <p style="text-align: center; color: #666">
                    Cargando información de la empresa...
                </p>
            </div>

            <div class="seccion-tabla">
                <h3>📊 Contactos por Área - Datos de Clientes</h3>

                <div class="herramientas-busqueda">
                    <input
                        type="text"
                        id="buscador-contactos"
                        placeholder="🔍 Buscar por área, encargado, producto..."
                    />
                    <select id="filtro-producto">
                        <option value="">Todos los productos</option>
                    </select>
                    <select id="filtro-area">
                        <option value="">Todas las áreas</option>
                    </select>
                    <button
                        class="btn-limpiar"
                        onclick="searchManager.limpiarFiltros()"
                    >
                        🗑️ Limpiar Filtros
                    </button>
                    <!-- BOTÓN PARA AGREGAR NUEVOS CONTACTOS - SOLO EN MODO EDICIÓN -->
                   <button
    class="btn-agregar"
    onclick="editManager.agregarNuevaFila()"
    style="display: none;"
    id="btn-nueva-fila"  <!-- CAMBIADO: de btn-agregar-contacto a btn-nueva-fila -->
    ➕ Nueva Fila  <!-- CAMBIADO: de "Agregar Contacto" a "Nueva Fila" -->
</button>
                </div>

                <div class="tabla-scroll-container">
                    <table class="tabla-areas" id="tabla-contactos-areas">
                        <thead>
                            <tr>
                                <th>Área</th>
                                <th>Producto Requerido</th>
                                <th>Encargado del Área</th>
                                <th>Puesto</th>
                                <th>Correo Electrónico</th>
                                <th>Teléfono</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla-contactos">
                            <!-- Las filas se cargarán dinámicamente aquí -->
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

    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/errorManager.js') }}"></script>
    <script src="{{ asset('js/searchManager.js') }}"></script>
    <script src="{{ asset('js/editManager.js') }}"></script>
    <script src="{{ asset('js/info_empresa_script.js') }}"></script>
</body>
</html>