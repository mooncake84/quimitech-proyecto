<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Usuario;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        try {
            $usuario = Usuario::where('email', $credentials['email'])->first();

            if (!$usuario || !password_verify($credentials['password'], $usuario->password)) {
                return back()->withErrors([
                    'email' => 'Las credenciales no coinciden con nuestros registros.',
                ])->withInput();
            }

            Auth::login($usuario);
            $request->session()->regenerate();

            return redirect()->intended('/rastros');
        } catch (\Exception $e) {
            Log::error('Error en login: ' . $e->getMessage());
            return back()->withErrors([
                'email' => 'Error del sistema. Por favor intenta más tarde.',
            ])->withInput();
        }

    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/');
    }
}