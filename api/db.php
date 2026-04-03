<?php
// Veritabanı bağlantı ayarları
$host = 'localhost';
$db   = 'veritabani_adiniz'; // cPanel'de oluşturduğunuz veritabanı adı
$user = 'kullanici_adiniz';   // cPanel'de oluşturduğunuz veritabanı kullanıcısı
$pass = 'sifreniz';           // Veritabanı şifreniz
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
