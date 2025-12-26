<?php
// database/migrations/2024_01_01_create_actividades_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActividadesTable extends Migration
{
    public function up()
    {
        Schema::create('actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained()->onDelete('cascade');
            $table->date('fecha');
            $table->time('hora');
            $table->string('objetivo', 500);
            $table->text('datos_adicionales')->nullable();
            $table->enum('estado', ['Pendiente', 'Completado', 'Retraso'])->default('Pendiente');
            $table->string('pedido_entregado')->nullable();
            $table->string('cantidad_entregada')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('actividades');
    }
}