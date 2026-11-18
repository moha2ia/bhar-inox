<?php
declare(strict_types=1);

/**
 * Amorçage de la base avec les contenus de démonstration
 * (projets, services, paramètres) issus de server/seed-data.json.
 * Idempotent : les enregistrements déjà présents ne sont pas écrasés.
 *
 * Usage : php server/seed.php [chemin-donnees.json]
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Script réservé à la ligne de commande.\n");
}

require __DIR__ . '/lib/repository.php';

$source = $argv[1] ?? __DIR__ . '/seed-data.json';
$raw = @file_get_contents($source);
if ($raw === false) {
    fwrite(STDERR, "Fichier de données introuvable : $source\n");
    exit(1);
}

$seed = json_decode($raw, true);
if (!is_array($seed)) {
    fwrite(STDERR, "JSON invalide : $source\n");
    exit(1);
}

$pdo = db();
$inserted = ['projects' => 0, 'services' => 0, 'messages' => 0];
$skipped = ['projects' => 0, 'services' => 0];

$pdo->beginTransaction();

try {
    // --- Paramètres du site (uniquement s'ils sont encore vides) ---
    $settings = settings_get();
    if ($settings['hero_title'] === '' && isset($seed['settings']) && is_array($seed['settings'])) {
        settings_update($seed['settings']);
        echo "Paramètres du site amorcés.\n";
    }

    // --- Projets ---
    $imagesCount = $pdo->prepare('SELECT COUNT(*) FROM project_images WHERE project_id = ?');
    $insertProject = $pdo->prepare(
        'INSERT INTO projects
            (id, slug, title, description, category, location, sort_order, published, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertImage = $pdo->prepare(
        'INSERT INTO project_images (project_id, image_path, sort_order) VALUES (?, ?, ?)'
    );
    $findProject = $pdo->prepare('SELECT id FROM projects WHERE id = ? OR slug = ? LIMIT 1');

    foreach ($seed['projects'] ?? [] as $project) {
        $id = (string) ($project['id'] ?? '');
        $slug = (string) ($project['slug'] ?? '');
        $findProject->execute([$id, $slug]);
        $existingId = $findProject->fetchColumn();

        if ($existingId) {
            $imagesCount->execute([$existingId]);
            if ((int) $imagesCount->fetchColumn() === 0) {
                foreach (($project['images'] ?? []) as $index => $image) {
                    $insertImage->execute([$existingId, (string) $image, $index]);
                }
            }
            $skipped['projects']++;
            continue;
        }

        $insertProject->execute([
            $id !== '' ? $id : 'p-' . bin2hex(random_bytes(8)),
            $slug,
            (string) ($project['title'] ?? ''),
            (string) ($project['description'] ?? ''),
            (string) ($project['category'] ?? 'Autre'),
            isset($project['location']) && $project['location'] !== '' ? (string) $project['location'] : null,
            (int) ($project['sort_order'] ?? 0),
            !empty($project['published']) ? 1 : 0,
            to_datetime((string) ($project['created_at'] ?? '')),
        ]);

        foreach (($project['images'] ?? []) as $index => $image) {
            $insertImage->execute([$id, (string) $image, $index]);
        }
        $inserted['projects']++;
    }

    // --- Services ---
    $insertService = $pdo->prepare(
        'INSERT INTO services (id, name, description, image, sort_order, published)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $findService = $pdo->prepare('SELECT id FROM services WHERE id = ? OR name = ? LIMIT 1');

    foreach ($seed['services'] ?? [] as $service) {
        $id = (string) ($service['id'] ?? '');
        $name = (string) ($service['name'] ?? '');
        $findService->execute([$id, $name]);
        if ($findService->fetchColumn()) {
            $skipped['services']++;
            continue;
        }

        $insertService->execute([
            $id !== '' ? $id : 's-' . bin2hex(random_bytes(8)),
            $name,
            (string) ($service['description'] ?? ''),
            isset($service['image']) && $service['image'] !== '' ? (string) $service['image'] : null,
            (int) ($service['sort_order'] ?? 0),
            !empty($service['published']) ? 1 : 0,
        ]);
        $inserted['services']++;
    }

    // --- Messages de contact éventuellement fournis ---
    $insertMessage = $pdo->prepare(
        'INSERT IGNORE INTO contact_messages
            (id, name, email, phone, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    foreach ($seed['messages'] ?? [] as $message) {
        $insertMessage->execute([
            (string) ($message['id'] ?? ('msg-' . bin2hex(random_bytes(8)))),
            (string) ($message['name'] ?? ''),
            (string) ($message['email'] ?? ''),
            isset($message['phone']) && $message['phone'] !== '' ? (string) $message['phone'] : null,
            (string) ($message['message'] ?? ''),
            !empty($message['read']) ? 1 : 0,
            to_datetime((string) ($message['created_at'] ?? '')),
        ]);
        $inserted['messages']++;
    }

    $pdo->commit();
} catch (Throwable $error) {
    $pdo->rollBack();
    fwrite(STDERR, 'Amorçage échoué : ' . $error->getMessage() . "\n");
    exit(1);
}

echo sprintf(
    "Amorçage terminé : %d projet(s) et %d service(s) ajoutés, %d projet(s) et %d service(s) déjà présents",
    $inserted['projects'],
    $inserted['services'],
    $skipped['projects'],
    $skipped['services']
);
if ($inserted['messages'] > 0) {
    echo ", {$inserted['messages']} message(s) importé(s)";
}
echo ".\n";
