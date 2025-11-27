<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';
    
    protected $fillable = [
        'nombre',
        'giro',
        'direccion',
        'contacto',
        'telefono',
        'created_at',
        'updated_at'
    ];

    public function areasContacto()
    {
        return $this->hasMany(AreaContacto::class, 'empresa_id');
    }

    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'empresa_id');
    }
}