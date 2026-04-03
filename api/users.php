<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, email, displayName, role, createdAt FROM users");
    echo json_encode($stmt->fetchAll());
} elseif ($method === 'PUT' && $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->execute([$data['role'], $id]);
    echo json_encode(['message' => 'Rol başarıyla güncellendi']);
}
?>
