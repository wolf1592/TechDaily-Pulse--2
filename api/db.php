<?php
// Veritabanı bağlantı ayarları
$host = 'localhost';
$db   = 'dij262vecomtr_Tech'; // cPanel'de oluşturduğunuz veritabanı adı
$user = 'dij262vecomtr_Tech';   // cPanel'de oluşturduğunuz veritabanı kullanıcısı
$pass = 'qQ15921594,!';           // Veritabanı şifreniz
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>
