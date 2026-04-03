<?php
require_once 'api/db.php';
require_once 'header.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    header("Location: /");
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
$stmt->execute([$id]);
$article = $stmt->fetch();

if (!$article) {
    echo "<h1>Haber bulunamadı</h1>";
} else {
    echo "<h1>" . htmlspecialchars($article['title']) . "</h1>";
    echo "<p>" . htmlspecialchars($article['content']) . "</p>";
}

require_once 'footer.php';
?>
