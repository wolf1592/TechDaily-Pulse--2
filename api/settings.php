<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM settings");
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['id']] = json_decode($row['value'], true) ?? $row['value'];
    }
    echo json_encode($settings);
} elseif ($method === 'POST' && $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $value = json_encode($data);
    $stmt = $pdo->prepare("INSERT INTO settings (id, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?");
    $stmt->execute([$id, $value, $value]);
    echo json_encode(['message' => 'Ayarlar başarıyla güncellendi']);
}
?>
