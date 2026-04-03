<?php
require_once 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("
        SELECT a.*, c.name as categoryName, u.displayName as authorName 
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        LEFT JOIN users u ON a.author_id = u.id
        ORDER BY a.createdAt DESC
    ");
    echo json_encode($stmt->fetchAll());
}
// POST, PUT, DELETE işlemleri buraya eklenecek...
?>
