<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Models\Empresa;
use App\Models\Actividad;
use App\Models\AreaContacto;

class MainController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function rastros()
    {
        $empresas = Empresa::with('areasContacto')->get();
        return view('rastros', compact('empresas'));
    }

    public function programacion()
    {
        $actividades = Actividad::with('empresa')->orderBy('fecha', 'desc')->get();
        return view('programacion', compact('actividades'));
    }

    public function actividades()
    {
        $actividades = Actividad::with('empresa')->orderBy('fecha', 'desc')->get();
        $empresas = Empresa::all();
        return view('actividades', compact('actividades', 'empresas'));
    }

    public function infoEmpresa()
    {
        $empresas = Empresa::with('areasContacto')->get();
        return view('info-empresa', compact('empresas'));
    }
}