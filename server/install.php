<?php
declare(strict_types=1);

/**
 * Installation de la base locale : crée la base, les tables,
 * génère config.local.php (clé API) si absent.
 * Usage : php server/install.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Script réservé à la ligne de commande.\n");
}

require __DIR__ . '/lib/repository.php';

$configFile = __DIR__ . '/config.local.php';
if (!is_file($configFile)) {
    $config = require __DIR__ . '/config.php';
    $config['api_key'] = $config['api_key'] !== '' ? $config['api_key'] : bin2hex(random_bytes(24));
    $export = "<?php\ndeclare(strict_types=1);\n\nreturn " . var_export($config, true) . ";\n";
    file_put_contents($configFile, $export);
    echo "config.local.php créé.\n";
}

$config = require __DIR__ . '/config.php';

$serverDsn = sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $config['db_host'], $config['db_port']);
$server = new PDO($serverDsn, $config['db_user'], $config['db_pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$dbName = (string) $config['db_name'];
$server->exec(
    "CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
);
$server->exec("USE `$dbName`");

$schema = file_get_contents(__DIR__ . '/schema.sql');
if ($schema === false) {
    fwrite(STDERR, "schema.sql introuvable.\n");
    exit(1);
}

$statements = preg_split('/;\s*(?:\r?\n|$)/', $schema) ?: [];
$executed = 0;

foreach ($statements as $statement) {
    $statement = trim($statement);
    if ($statement === '' || preg_match('/^CREATE\s+DATABASE/i', $statement) || preg_match('/^USE\s/i', $statement)) {
        continue;
    }
    $server->exec($statement);
    $executed++;
}

echo "Base « $dbName » prête ($executed instructions exécutées).\n";
echo "Clé API : " . $config['api_key'] . "\n";
echo "→ Reporter cette clé dans .env.local (PHP_API_KEY).\n";
