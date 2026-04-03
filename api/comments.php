<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$articleId = isset($_GET['articleId']) ? $_GET['articleId'] : null;

if ($method === 'GET' && $articleId) {
    $stmt = $pdo->prepare("SELECT * FROM comments WHERE articleId = ? ORDER BY createdAt DESC");
    $stmt->execute([$articleId]);
    echo json_encode($stmt->fetchAll());
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO comments (articleId, text, authorName) VALUES (?, ?, ?)");
    $stmt->execute([$data['articleId'], $data['text'], $data['authorName']]);
    echo json_encode(['message' => 'Yorum başarıyla eklendi']);
}
?>
