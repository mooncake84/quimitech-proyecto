<?php
// test-routes.php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Probar rutas
$routes = [
    '/api/empresas',
    '/api/contactos', 
    '/api/actividades',
    '/test-guardado'
];

foreach ($routes as $route) {
    try {
        $request = Illuminate\Http\Request::create($route, 'GET');
        $response = $kernel->handle($request);
        echo "✅ $route - Status: " . $response->getStatusCode() . "\n";
    } catch (Exception $e) {
        echo "❌ $route - Error: " . $e->getMessage() . "\n";
    }
}