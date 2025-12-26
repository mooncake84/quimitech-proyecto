<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quimitech - @yield('title', 'Sistema')</title>
    
    <!-- Tus estilos existentes -->
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- FullCalendar -->
    <link href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css" rel="stylesheet">
    
    @yield('styles')
</head>
<body>
    <div id="app">
        @if(auth()->check())
            <!-- Sidebar/Navigation -->
            @include('layouts.sidebar')
            
            <!-- Main Content -->
            <main class="main-content">
                @yield('content')
            </main>
        @else
            <!-- Login Page -->
            @yield('content')
        @endif
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js"></script>
    <script src="{{ asset('js/app.js') }}"></script>
    
    <!-- Tus scripts existentes -->
    <script src="{{ asset('js/data-manager.js') }}"></script>
    <script src="{{ asset('js/form-validator.js') }}"></script>
    <script src="{{ asset('js/error-manager.js') }}"></script>
    
    @yield('scripts')
</body>
</html>