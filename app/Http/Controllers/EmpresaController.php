<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Empresa;

class EmpresaController extends Controller
{
    public function index()
    {
        $empresas = Empresa::with('areasContacto')->get();
        return response()->json($empresas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'giro' => 'required|string|max:255',
            'direccion' => 'nullable|string',
            'contacto' => 'nullable|string',
            'telefono' => 'nullable|string',
        ]);

        try {
            $empresa = Empresa::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Empresa guardada exitosamente',
                'empresa' => $empresa
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $empresa = Empresa::with('areasContacto')->findOrFail($id);
        return response()->json($empresa);
    }

    public function update(Request $request, string $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'giro' => 'sometimes|string|max:255',
            'direccion' => 'nullable|string',
            'contacto' => 'nullable|string',
            'telefono' => 'nullable|string',
        ]);

        $empresa->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Empresa actualizada exitosamente',
            'empresa' => $empresa
        ]);
    }

    public function destroy(string $id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Empresa eliminada exitosamente'
        ]);
    }
}