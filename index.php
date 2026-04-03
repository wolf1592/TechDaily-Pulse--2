<?php
require_once 'api/db.php';
require_once 'header.php';

$stmt = $pdo->query("SELECT * FROM articles ORDER BY createdAt DESC LIMIT 10");
$articles = $stmt->fetchAll();
?>

<h1 class="text-3xl font-bold mb-6">Son Haberler</h1>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <?php foreach ($articles as $article): ?>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 class="text-xl font-semibold mb-2"><a href="/article.php?id=<?php echo $article['id']; ?>" class="text-blue-600 hover:text-blue-800"><?php echo htmlspecialchars($article['title']); ?></a></h2>
            <p class="text-gray-600"><?php echo htmlspecialchars(substr($article['content'], 0, 100)); ?>...</p>
        </div>
    <?php endforeach; ?>
</div>

<?php require_once 'footer.php'; ?>
