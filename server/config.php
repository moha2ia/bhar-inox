<?php
declare(strict_types=1);

/**
 * Configuration de l'API PHP.
 * Les valeurs réelles sont dans config.local.php (non versionné),
 * généré par `php server/install.php`. Les variables d'environnement
 * BHAR_DB_* / BHAR_API_KEY restent prioritaires si définies.
 */
$config = [
    'db_host' => getenv('BHAR_DB_HOST') ?: '127.0.0.1',
    'db_port' => (int) (getenv('BHAR_DB_PORT') ?: 3306),
    'db_name' => getenv('BHAR_DB_NAME') ?: 'bhar_inox',
    'db_user' => getenv('BHAR_DB_USER') ?: 'root',
    'db_pass' => getenv('BHAR_DB_PASS') ?: '',
    'api_key' => getenv('BHAR_API_KEY') ?: '',
];

$localFile = __DIR__ . '/config.local.php';
if (is_file($localFile)) {
    $local = require $localFile;
    if (is_array($local)) {
        $config = array_merge($config, $local);
    }
}

return $config;
