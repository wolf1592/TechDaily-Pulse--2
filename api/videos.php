<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM videos ORDER BY createdAt DESC");
    echo json_encode($stmt->fetchAll());
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO videos (title, image, duration, url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data['title'], $data['image'], $data['duration'], $data['url']]);
    echo json_encode(['id' => $pdo->lastInsertId()]);
}
?>
