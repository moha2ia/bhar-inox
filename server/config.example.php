<?php
declare(strict_types=1);

/**
 * Copier vers config.local.php puis adapter.
 * XAMPP local par défaut : utilisateur root, mot de passe vide.
 * La clé API doit être identique à PHP_API_KEY dans .env.local.
 */
return [
    'db_host' => '127.0.0.1',
    'db_port' => 3306,
    'db_name' => 'bhar_inox',
    'db_user' => 'root',
    'db_pass' => '',
    'api_key' => 'remplacer-par-une-cle-aleatoire',
];
