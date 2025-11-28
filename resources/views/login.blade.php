<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login QuimiTech Completo</title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
</head>
<body>
    <div class="carrusel-fondo">
        <div class="carrusel-item active" style="background-image: url('{{ asset('images/lab.jpg') }}')"></div>
        <div class="carrusel-item" style="background-image: url('{{ asset('images/laboratorio.jpg') }}')"></div>
        <div class="carrusel-item" style="background-image: url('{{ asset('images/quimicos.jpg') }}')"></div>
    </div>
    <div class="contenedor-central">
        <div class="contenedor-login">
            <div class="logo-contenedor">
                <img id="logo-empresa" class="logo" src="{{ asset('images/quimitech.png') }}" alt="Logotipo de la Empresa" />
            </div>

            {{-- Mostrar errores de validación --}}
            @if($errors->any())
                <div class="alert alert-error" style="background: #fee; color: #c33; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center;">
                    @foreach($errors->all() as $error)
                        <p style="margin: 0;">{{ $error }}</p>
                    @endforeach
                </div>
            @endif

            {{-- Mostrar mensajes de sesión --}}
            @if(session('status'))
                <div class="alert alert-success" style="background: #efe; color: #363; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center;">
                    {{ session('status') }}
                </div>
            @endif

            {{-- FORMULARIO CORREGIDO - usa login.post --}}
            <form method="POST" action="{{ route('login.post') }}">
                @csrf
                
                <input type="email" id="email" name="email" class="input-login" 
                       placeholder="Correo Electrónico" value="{{ old('email') }}" required autofocus />

                <input type="password" id="password" name="password" class="input-login" 
                       placeholder="Contraseña" required />

                <button type="submit" id="iniciar-sesion-btn" class="btn-inicio-sesion">
                    Iniciar sesión
                </button>
            </form>
        </div>
    </div>

    <script src="{{ asset('js/index.js') }}"></script>
</body>
</html>