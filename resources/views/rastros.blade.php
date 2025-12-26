<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Panel de Rastros - QuimiTech</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
</head>
<body class="rastros-page">
    <header class="rastros-header">
        <div class="empresa-info-selector">
            <select id="select-cambio-empresa" class="select-empresa-header">
                <option value="">Cargando empresas...</option>
            </select>
            <p id="nombre-empresa-actual" class="nombre-empresa-actual">Cargando...</p>
        </div>
    </header>

    <div class="contenedor-principal">
        <div class="seccion-imagen" style="background-image: url('{{ asset('images/lab.jpg') }}')">
            <button id="btn-gestion-clientes" class="btn-gestion-clientes">
                <span class="btn-icon">👥</span>
                <span class="btn-text">GESTIÓN DE CLIENTES</span>
                    
            </button>
        </div>
        
        <div class="seccion-botones">
            <button id="btn-opcion1" class="btn-menu-rastros">
                INFORMACION GENERAL
            </button>
            <button id="btn-opcion2" class="btn-menu-rastros" onclick="window.location.href='{{ route('programacion') }}'">
                PROGRAMACION DE ACTIVIDADES
            </button>
            <button id="btn-opcion3" class="btn-menu-rastros" onclick="window.location.href='{{ route('actividades') }}'">
                ACTIVIDADES
            </button>
        </div>
    </div>

    <script src="{{ asset('js/data.js') }}"></script>
    <script src="{{ asset('js/errorManager.js') }}"></script>
    <script src="{{ asset('js/rastros_script.js') }}"></script>
    <script src="{{ asset('js/autoSaveManager.js') }}"></script>
