<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Quimitech - @yield('title', 'Sistema de Gestión')</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    @yield('styles')
</head>
<body>
    <div id="app">
        @include('partials.header') <!-- Si tienes un header -->
        
        <main>
            @yield('content')
        </main>
        
        @include('partials.footer') <!-- Si tienes un footer -->
    </div>

    <script src="{{ asset('js/app.js') }}"></script>
    @yield('scripts')
</body>
</html>