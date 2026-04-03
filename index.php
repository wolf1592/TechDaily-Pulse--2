<?php
require_once 'api/db.php';
require_once 'header.php';

$stmt = $pdo->query("SELECT * FROM articles ORDER BY createdAt DESC LIMIT 10");
$articles = $stmt->fetchAll();
?>

<h1>Son Haberler</h1>
<div class="news-grid">
    <?php foreach ($articles as $article): ?>
        <div class="article">
            <h2><a href="/article.php?id=<?php echo $article['id']; ?>"><?php echo htmlspecialchars($article['title']); ?></a></h2>
            <p><?php echo htmlspecialchars(substr($article['content'], 0, 100)); ?>...</p>
        </div>
    <?php endforeach; ?>
</div>

<?php require_once 'footer.php'; ?>
