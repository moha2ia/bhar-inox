<?php
declare(strict_types=1);

/* ============================================================
   Couche d'accès aux données (MySQL / MariaDB via PDO).
   Utilisée par l'API (server/public/index.php) et par le
   script d'amorçage (server/seed.php).
   ============================================================ */

const QUOTE_STATUSES = [
    'nouveau',
    'en_cours',
    'devis_envoye',
    'accepte',
    'refuse',
    'archive',
];

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require __DIR__ . '/../config.php';
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_port'],
        $config['db_name']
    );

    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

/* ------------------------------------------------------------
   Dates : stockage UTC en DATETIME, échange en ISO-8601 (Z).
   ------------------------------------------------------------ */

function to_iso(?string $datetime): ?string
{
    if ($datetime === null || $datetime === '') {
        return null;
    }
    $ts = strtotime($datetime . ' UTC');
    return $ts === false ? null : gmdate('Y-m-d\TH:i:s\Z', $ts);
}

function to_datetime(?string $iso): string
{
    $ts = $iso !== null && $iso !== '' ? strtotime($iso) : false;
    return gmdate('Y-m-d H:i:s', $ts === false ? time() : $ts);
}

function slugify(string $value): string
{
    $slug = strtolower(trim($value));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    return trim($slug, '-');
}

/* ------------------------------------------------------------
   Projets
   ------------------------------------------------------------ */

function projects_all(array $opts = []): array
{
    $pdo = db();
    $where = [];
    $params = [];

    if (!empty($opts['published_only'])) {
        $where[] = 'published = 1';
    }
    if (!empty($opts['category']) && $opts['category'] !== 'Toutes') {
        $where[] = 'category = ?';
        $params[] = $opts['category'];
    }

    $sql = 'SELECT * FROM projects';
    if ($where !== []) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY sort_order ASC, created_at ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $imageRows = $pdo->query(
        'SELECT project_id, image_path FROM project_images ORDER BY sort_order ASC, id ASC'
    )->fetchAll();

    $images = [];
    foreach ($imageRows as $image) {
        $images[$image['project_id']][] = $image['image_path'];
    }

    return array_map(
        static function (array $row) use ($images): array {
            return [
                'id' => $row['id'],
                'slug' => $row['slug'],
                'title' => $row['title'],
                'description' => $row['description'],
                'category' => $row['category'],
                'location' => $row['location'],
                'images' => $images[$row['id']] ?? [],
                'sort_order' => (int) $row['sort_order'],
                'published' => (bool) $row['published'],
                'created_at' => to_iso($row['created_at']),
            ];
        },
        $rows
    );
}

function project_find(string $idOrSlug): ?array
{
    foreach (projects_all() as $project) {
        if ($project['id'] === $idOrSlug || $project['slug'] === $idOrSlug) {
            return $project;
        }
    }
    return null;
}

function project_upsert(array $input): array
{
    $pdo = db();

    $id = trim((string) ($input['id'] ?? ''));
    $title = trim((string) ($input['title'] ?? ''));
    if ($title === '') {
        throw new RuntimeException('Titre requis.');
    }

    $slug = trim((string) ($input['slug'] ?? ''));
    if ($slug === '') {
        $slug = slugify($title);
    }

    $values = [
        'slug' => $slug,
        'title' => $title,
        'description' => (string) ($input['description'] ?? ''),
        'category' => (string) ($input['category'] ?? 'Autre'),
        'location' => isset($input['location']) && $input['location'] !== ''
            ? (string) $input['location']
            : null,
        'sort_order' => (int) ($input['sort_order'] ?? 0),
        'published' => !empty($input['published']) ? 1 : 0,
    ];

    $images = [];
    if (isset($input['images']) && is_array($input['images'])) {
        foreach ($input['images'] as $image) {
            if (is_string($image) && trim($image) !== '') {
                $images[] = trim($image);
            }
        }
    }

    $pdo->beginTransaction();
    try {
        $existingId = null;

        if ($id !== '') {
            $stmt = $pdo->prepare('SELECT id FROM projects WHERE id = ?');
            $stmt->execute([$id]);
            $existingId = $stmt->fetchColumn() ?: null;
        }

        if ($existingId === null && $slug !== '') {
            $stmt = $pdo->prepare('SELECT id FROM projects WHERE slug = ?');
            $stmt->execute([$slug]);
            $found = $stmt->fetchColumn();
            if ($found) {
                $existingId = (string) $found;
            }
        }

        if ($existingId !== null) {
            $id = $existingId;
            $stmt = $pdo->prepare(
                'UPDATE projects
                    SET slug = ?, title = ?, description = ?, category = ?,
                        location = ?, sort_order = ?, published = ?
                  WHERE id = ?'
            );
            $stmt->execute([
                $values['slug'],
                $values['title'],
                $values['description'],
                $values['category'],
                $values['location'],
                $values['sort_order'],
                $values['published'],
                $id,
            ]);
        } else {
            if ($id === '') {
                $id = 'p-' . bin2hex(random_bytes(8));
            }
            $stmt = $pdo->prepare(
                'INSERT INTO projects
                    (id, slug, title, description, category, location,
                     sort_order, published, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $id,
                $values['slug'],
                $values['title'],
                $values['description'],
                $values['category'],
                $values['location'],
                $values['sort_order'],
                $values['published'],
                to_datetime(null),
            ]);
        }

        $pdo->prepare('DELETE FROM project_images WHERE project_id = ?')->execute([$id]);
        $insertImage = $pdo->prepare(
            'INSERT INTO project_images (project_id, image_path, sort_order) VALUES (?, ?, ?)'
        );
        foreach ($images as $index => $image) {
            $insertImage->execute([$id, $image, $index]);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        if ($error instanceof PDOException && $error->getCode() === '23000') {
            throw new RuntimeException('Un projet avec ce slug existe déjà.');
        }
        throw $error;
    }

    return ['id' => $id];
}

function project_delete(string $id): void
{
    $stmt = db()->prepare('DELETE FROM projects WHERE id = ?');
    $stmt->execute([$id]);
}

/* ------------------------------------------------------------
   Services
   ------------------------------------------------------------ */

function services_all(array $opts = []): array
{
    $sql = 'SELECT * FROM services';
    if (!empty($opts['published_only'])) {
        $sql .= ' WHERE published = 1';
    }
    $sql .= ' ORDER BY sort_order ASC, name ASC';

    $rows = db()->query($sql)->fetchAll();

    return array_map(
        static fn (array $row): array => [
            'id' => $row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'image' => $row['image'],
            'sort_order' => (int) $row['sort_order'],
            'published' => (bool) $row['published'],
        ],
        $rows
    );
}

function service_upsert(array $input): array
{
    $pdo = db();

    $id = trim((string) ($input['id'] ?? ''));
    $name = trim((string) ($input['name'] ?? ''));
    if ($name === '') {
        throw new RuntimeException('Nom requis.');
    }

    $values = [
        'name' => $name,
        'description' => (string) ($input['description'] ?? ''),
        'image' => isset($input['image']) && $input['image'] !== ''
            ? (string) $input['image']
            : null,
        'sort_order' => (int) ($input['sort_order'] ?? 0),
        'published' => !empty($input['published']) ? 1 : 0,
    ];

    $pdo->beginTransaction();
    try {
        $existingId = null;

        if ($id !== '') {
            $stmt = $pdo->prepare('SELECT id FROM services WHERE id = ?');
            $stmt->execute([$id]);
            $existingId = $stmt->fetchColumn() ?: null;
        }

        if ($existingId === null && $name !== '') {
            $stmt = $pdo->prepare('SELECT id FROM services WHERE name = ?');
            $stmt->execute([$name]);
            $found = $stmt->fetchColumn();
            if ($found) {
                $existingId = (string) $found;
            }
        }

        if ($existingId !== null) {
            $id = $existingId;
            $stmt = $pdo->prepare(
                'UPDATE services
                    SET name = ?, description = ?, image = ?, sort_order = ?, published = ?
                  WHERE id = ?'
            );
            $stmt->execute([
                $values['name'],
                $values['description'],
                $values['image'],
                $values['sort_order'],
                $values['published'],
                $id,
            ]);
        } else {
            if ($id === '') {
                $id = 's-' . bin2hex(random_bytes(8));
            }
            $stmt = $pdo->prepare(
                'INSERT INTO services (id, name, description, image, sort_order, published)
                 VALUES (?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $id,
                $values['name'],
                $values['description'],
                $values['image'],
                $values['sort_order'],
                $values['published'],
            ]);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        if ($error instanceof PDOException && $error->getCode() === '23000') {
            throw new RuntimeException('Un service portant ce nom existe déjà.');
        }
        throw $error;
    }

    return ['id' => $id];
}

function service_delete(string $id): void
{
    $stmt = db()->prepare('DELETE FROM services WHERE id = ?');
    $stmt->execute([$id]);
}

/* ------------------------------------------------------------
   Paramètres du site
   ------------------------------------------------------------ */

const SETTINGS_TEXT_FIELDS = [
    'hero_title',
    'hero_subtitle',
    'about_intro',
    'phone',
    'email',
    'address',
    'hours',
    'seo_title',
    'seo_description',
];

const SETTINGS_NUMBER_FIELDS = ['map_lat', 'map_lng', 'map_zoom'];

function settings_get(): array
{
    db()->exec('INSERT IGNORE INTO site_settings (id) VALUES (1)');
    $row = db()->query('SELECT * FROM site_settings WHERE id = 1')->fetch();

    $settings = [];
    foreach (SETTINGS_TEXT_FIELDS as $field) {
        $settings[$field] = (string) ($row[$field] ?? '');
    }
    $settings['map_lat'] = (float) $row['map_lat'];
    $settings['map_lng'] = (float) $row['map_lng'];
    $settings['map_zoom'] = (int) $row['map_zoom'];

    return $settings;
}

function settings_update(array $patch): void
{
    $sets = [];
    $params = [];

    foreach (SETTINGS_TEXT_FIELDS as $field) {
        if (array_key_exists($field, $patch)) {
            $sets[] = "$field = ?";
            $params[] = (string) $patch[$field];
        }
    }

    foreach (SETTINGS_NUMBER_FIELDS as $field) {
        if (array_key_exists($field, $patch) && is_numeric($patch[$field])) {
            $sets[] = "$field = ?";
            $params[] = $field === 'map_zoom'
                ? max(3, min(19, (int) round((float) $patch[$field])))
                : (float) $patch[$field];
        }
    }

    if ($sets === []) {
        return;
    }

    db()->exec('INSERT IGNORE INTO site_settings (id) VALUES (1)');
    $params[] = 1;
    $stmt = db()->prepare('UPDATE site_settings SET ' . implode(', ', $sets) . ' WHERE id = ?');
    $stmt->execute($params);
}

/* ------------------------------------------------------------
   Demandes de devis
   ------------------------------------------------------------ */

function next_quote_reference(PDO $pdo): string
{
    $year = (int) gmdate('Y');
    $name = "quote_counter_$year";
    $prefix = "BI-$year-";

    $pdo->prepare('INSERT IGNORE INTO counters (name, value) VALUES (?, 0)')
        ->execute([$name]);

    $stmt = $pdo->prepare('SELECT value FROM counters WHERE name = ? FOR UPDATE');
    $stmt->execute([$name]);
    $current = (int) $stmt->fetchColumn();
    $next = $current + 1;

    $pdo->prepare('UPDATE counters SET value = ? WHERE name = ?')
        ->execute([$next, $name]);

    return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
}

function quote_create(array $draft, array $files): array
{
    $pdo = db();
    $pdo->beginTransaction();

    try {
        $reference = next_quote_reference($pdo);
        $id = 'q-' . bin2hex(random_bytes(8));

        $stmt = $pdo->prepare(
            'INSERT INTO quote_requests
                (id, reference, project_type, description, location, dimensions,
                 quantity, finish, budget, deadline, full_name, company, phone,
                 email, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $reference,
            (string) ($draft['project_type'] ?? ''),
            (string) ($draft['description'] ?? ''),
            (string) ($draft['location'] ?? ''),
            isset($draft['dimensions']) && $draft['dimensions'] !== ''
                ? (string) $draft['dimensions']
                : null,
            isset($draft['quantity']) && $draft['quantity'] !== '' && $draft['quantity'] !== null
                ? (int) $draft['quantity']
                : null,
            isset($draft['finish']) && $draft['finish'] !== ''
                ? (string) $draft['finish']
                : null,
            isset($draft['budget']) && $draft['budget'] !== ''
                ? (string) $draft['budget']
                : null,
            isset($draft['deadline']) && $draft['deadline'] !== ''
                ? (string) $draft['deadline']
                : null,
            (string) ($draft['full_name'] ?? ''),
            isset($draft['company']) && $draft['company'] !== ''
                ? (string) $draft['company']
                : null,
            (string) ($draft['phone'] ?? ''),
            (string) ($draft['email'] ?? ''),
            'nouveau',
            to_datetime(null),
        ]);

        if ($files !== []) {
            $insertFile = $pdo->prepare(
                'INSERT INTO quote_files (quote_reference, file_name, file_size, file_type)
                 VALUES (?, ?, ?, ?)'
            );
            foreach ($files as $file) {
                if (!is_array($file) || !isset($file['name'])) {
                    continue;
                }
                $insertFile->execute([
                    $reference,
                    (string) $file['name'],
                    (int) ($file['size'] ?? 0),
                    (string) ($file['type'] ?? ''),
                ]);
            }
        }

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }

    return ['reference' => $reference];
}

function quote_row_to_array(array $row): array
{
    return [
        'id' => $row['id'],
        'reference' => $row['reference'],
        'project_type' => $row['project_type'],
        'description' => $row['description'],
        'location' => $row['location'],
        'dimensions' => $row['dimensions'],
        'quantity' => $row['quantity'] !== null ? (int) $row['quantity'] : null,
        'finish' => $row['finish'],
        'budget' => $row['budget'],
        'deadline' => $row['deadline'],
        'full_name' => $row['full_name'],
        'company' => $row['company'],
        'phone' => $row['phone'],
        'email' => $row['email'],
        'status' => $row['status'],
        'created_at' => to_iso($row['created_at']),
    ];
}

function quotes_all(array $opts = []): array
{
    $where = [];
    $params = [];

    if (!empty($opts['status']) && in_array($opts['status'], QUOTE_STATUSES, true)) {
        $where[] = 'status = ?';
        $params[] = $opts['status'];
    }
    if (!empty($opts['search'])) {
        $like = '%' . $opts['search'] . '%';
        $where[] = '(reference LIKE ? OR full_name LIKE ? OR email LIKE ? OR project_type LIKE ?)';
        array_push($params, $like, $like, $like, $like);
    }

    $sql = 'SELECT * FROM quote_requests';
    if ($where !== []) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY created_at DESC, reference DESC';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);

    return array_map('quote_row_to_array', $stmt->fetchAll());
}

function quote_find(string $id): ?array
{
    $stmt = db()->prepare('SELECT * FROM quote_requests WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    return $row ? quote_row_to_array($row) : null;
}

function quote_status_update(string $id, string $status): void
{
    if (!in_array($status, QUOTE_STATUSES, true)) {
        throw new RuntimeException('Statut inconnu.');
    }

    $stmt = db()->prepare('SELECT id FROM quote_requests WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetchColumn()) {
        throw new RuntimeException('Demande introuvable.');
    }

    db()->prepare('UPDATE quote_requests SET status = ? WHERE id = ?')
        ->execute([$status, $id]);
}

function quote_files(string $reference): array
{
    $stmt = db()->prepare(
        'SELECT file_name, file_size, file_type
           FROM quote_files
          WHERE quote_reference = ?
          ORDER BY id ASC'
    );
    $stmt->execute([$reference]);

    return array_map(
        static fn (array $row): array => [
            'file_name' => $row['file_name'],
            'file_size' => (int) $row['file_size'],
            'file_type' => $row['file_type'],
        ],
        $stmt->fetchAll()
    );
}

/* ------------------------------------------------------------
   Messages de contact
   ------------------------------------------------------------ */

function message_create(array $input): array
{
    $id = 'msg-' . bin2hex(random_bytes(8));

    $stmt = db()->prepare(
        'INSERT INTO contact_messages (id, name, email, phone, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, 0, ?)'
    );
    $stmt->execute([
        $id,
        (string) ($input['name'] ?? ''),
        (string) ($input['email'] ?? ''),
        isset($input['phone']) && $input['phone'] !== '' ? (string) $input['phone'] : null,
        (string) ($input['message'] ?? ''),
        to_datetime(null),
    ]);

    return ['id' => $id];
}

function messages_all(): array
{
    $rows = db()->query(
        'SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC'
    )->fetchAll();

    return array_map(
        static fn (array $row): array => [
            'id' => $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'message' => $row['message'],
            'read' => (bool) $row['is_read'],
            'created_at' => to_iso($row['created_at']),
        ],
        $rows
    );
}

function message_delete(string $id): void
{
    db()->prepare('DELETE FROM contact_messages WHERE id = ?')->execute([$id]);
}

function message_mark_read(string $id, bool $read = true): void
{
    $stmt = db()->prepare('SELECT id FROM contact_messages WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetchColumn()) {
        throw new RuntimeException('Message introuvable.');
    }

    db()->prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?')
        ->execute([$read ? 1 : 0, $id]);
}

/* ------------------------------------------------------------
   Diagnostic
   ------------------------------------------------------------ */

function health_check(): array
{
    $pdo = db();
    $pdo->query('SELECT 1');

    return [
        'database' => $pdo->query('SELECT DATABASE()')->fetchColumn(),
        'projects' => (int) $pdo->query('SELECT COUNT(*) FROM projects')->fetchColumn(),
        'services' => (int) $pdo->query('SELECT COUNT(*) FROM services')->fetchColumn(),
        'quotes' => (int) $pdo->query('SELECT COUNT(*) FROM quote_requests')->fetchColumn(),
        'messages' => (int) $pdo->query('SELECT COUNT(*) FROM contact_messages')->fetchColumn(),
    ];
}
