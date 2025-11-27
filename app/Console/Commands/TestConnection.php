<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestConnection extends Command
{
    protected $signature = 'test:connection';
    protected $description = 'Test SQL Server connection';

    public function handle()
    {
        try {
            $users = DB::table('usuarios')->first();
            $this->info('✅ Conexión exitosa!');
            $this->info('Usuario encontrado: ' . ($users->email ?? 'No hay usuarios'));
        } catch (\Exception $e) {
            $this->error('❌ Error de conexión: ' . $e->getMessage());
        }
    }
}