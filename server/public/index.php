<?php
declare(strict_types=1);

/* ============================================================
   API REST BHAR INOX — PHP + MySQL
   Toutes les requêtes exigent l'en-tête X-Api-Key.
   Le site Next.js est le seul client (appels serveur à serveur).
   ============================================================ */

require __DIR__ . '/../lib/repository.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(mixed $data, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(int $status, string $message): never
{
    respond(['error' => $message], $status);
}

function request_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail(400, 'JSON invalide.');
    }
    return $data;
}

$config = require __DIR__ . '/../config.php';
$providedKey = (string) ($_SERVER['HTTP_X_API_KEY'] ?? '');

if ($config['api_key'] === '' || !hash_equals((string) $config['api_key'], $providedKey)) {
    fail(401, 'Non autorisé.');
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$path = (string) (parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/index.php')), '/');
if ($base !== '' && str_starts_with($path, $base)) {
    $path = substr($path, strlen($base));
}
$segments = array_values(array_filter(
    array_map('rawurldecode', explode('/', trim($path, '/'))),
    static fn (string $segment): bool => $segment !== ''
));

$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$action = $segments[2] ?? null;

try {
    switch ($resource) {
        case 'health':
            if ($method !== 'GET') {
                fail(405, 'Méthode non autorisée.');
            }
            respond(['ok' => true] + health_check());

        case 'projects':
            if ($method === 'GET' && $id === null) {
                $publishedOnly = !isset($_GET['published']) || (string) $_GET['published'] !== '0';
                $category = isset($_GET['category']) ? (string) $_GET['category'] : null;
                respond(projects_all([
                    'published_only' => $publishedOnly,
                    'category' => $category,
                ]));
            }
            if ($method === 'GET' && $id !== null) {
                $project = project_find($id);
                $project === null ? fail(404, 'Projet introuvable.') : respond($project);
            }
            if ($method === 'POST' && $id === null) {
                respond(project_upsert(request_body()), 201);
            }
            if ($method === 'DELETE' && $id !== null) {
                project_delete($id);
                respond(['ok' => true]);
            }
            fail(405, 'Méthode non autorisée.');

        case 'services':
            if ($method === 'GET' && $id === null) {
                $publishedOnly = !isset($_GET['published']) || (string) $_GET['published'] !== '0';
                respond(services_all(['published_only' => $publishedOnly]));
            }
            if ($method === 'POST' && $id === null) {
                respond(service_upsert(request_body()), 201);
            }
            if ($method === 'DELETE' && $id !== null) {
                service_delete($id);
                respond(['ok' => true]);
            }
            fail(405, 'Méthode non autorisée.');

        case 'settings':
            if ($method === 'GET') {
                respond(settings_get());
            }
            if ($method === 'PUT' || $method === 'PATCH') {
                settings_update(request_body());
                respond(settings_get());
            }
            fail(405, 'Méthode non autorisée.');

        case 'quotes':
            if ($method === 'GET' && $id === null) {
                respond(quotes_all([
                    'status' => isset($_GET['status']) ? (string) $_GET['status'] : null,
                    'search' => isset($_GET['search']) ? (string) $_GET['search'] : null,
                ]));
            }
            if ($method === 'GET' && $id !== null && $action === null) {
                $quote = quote_find($id);
                $quote === null ? fail(404, 'Demande introuvable.') : respond($quote);
            }
            if ($method === 'POST' && $id === null) {
                $body = request_body();
                $draft = isset($body['draft']) && is_array($body['draft']) ? $body['draft'] : [];
                $files = isset($body['files']) && is_array($body['files']) ? $body['files'] : [];
                respond(quote_create($draft, $files), 201);
            }
            if ($method === 'POST' && $id !== null && $action === 'status') {
                $body = request_body();
                quote_status_update($id, (string) ($body['status'] ?? ''));
                respond(['ok' => true]);
            }
            fail(405, 'Méthode non autorisée.');

        case 'quote-files':
            if ($method === 'GET') {
                respond(quote_files((string) ($_GET['reference'] ?? '')));
            }
            fail(405, 'Méthode non autorisée.');

        case 'messages':
            if ($method === 'GET' && $id === null) {
                respond(messages_all());
            }
            if ($method === 'POST' && $id === null) {
                respond(message_create(request_body()), 201);
            }
            if ($method === 'DELETE' && $id !== null) {
                message_delete($id);
                respond(['ok' => true]);
            }
            if ($method === 'POST' && $id !== null && $action === 'read') {
                $body = request_body();
                message_mark_read($id, !isset($body['read']) || (bool) $body['read']);
                respond(['ok' => true]);
            }
            fail(405, 'Méthode non autorisée.');

        default:
            fail(404, 'Ressource inconnue.');
    }
} catch (PDOException $error) {
    error_log('[api] ' . $error->getMessage());
    fail(500, 'Erreur de base de données.');
} catch (RuntimeException $error) {
    fail(422, $error->getMessage());
} catch (Throwable $error) {
    error_log('[api] ' . $error->getMessage());
    fail(500, 'Erreur serveur.');
}
