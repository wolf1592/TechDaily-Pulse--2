<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY `order` ASC");
    echo json_encode($stmt->fetchAll());
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO categories (name, description, slug, metaTitle, metaDescription, color, icon, parentId, `order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data['name'], $data['description'], $data['slug'], $data['metaTitle'], $data['metaDescription'], $data['color'], $data['icon'], $data['parentId'] ?? null, $data['order'] ?? 0]);
    echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Kategori başarıyla eklendi']);
} elseif ($method === 'PUT' && $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE categories SET name=?, description=?, slug=?, metaTitle=?, metaDescription=?, color=?, icon=?, parentId=?, `order`=? WHERE id=?");
    $stmt->execute([$data['name'], $data['description'], $data['slug'], $data['metaTitle'], $data['metaDescription'], $data['color'], $data['icon'], $data['parentId'] ?? null, $data['order'] ?? 0, $id]);
    echo json_encode(['message' => 'Kategori başarıyla güncellendi']);
} elseif ($method === 'DELETE' && $id) {
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['message' => 'Kategori başarıyla silindi']);
}
?>
