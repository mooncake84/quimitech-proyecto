<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('rfc')->unique();
            $table->text('direccion')->nullable();
            $table->string('telefono');
            $table->string('contacto');
            $table->string('email');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('clientes');
    }
};