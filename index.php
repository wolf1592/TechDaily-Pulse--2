<?php
require_once 'api/db.php';
require_once 'header.php';

$stmt = $pdo->query("SELECT * FROM articles ORDER BY createdAt DESC LIMIT 10");
$articles = $stmt->fetchAll();
?>

<div class="flex gap-8">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span class="text-orange-500">↗</span> Yapay Zeka Trendleri
        </h2>
        <ul class="space-y-3 text-gray-700">
            <li><a href="#" class="hover:text-orange-600">En Çok Okunanlar</a></li>
            <li><a href="#" class="hover:text-orange-600">Haftanın Özetleri</a></li>
            <li><a href="#" class="hover:text-orange-600">Editörün Seçimi</a></li>
            <li><a href="#" class="hover:text-orange-600">Video İncelemeler</a></li>
        </ul>
    </aside>

    <!-- News Grid -->
    <div class="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($articles as $article): ?>
            <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <img src="<?php echo htmlspecialchars($article['image'] ?? 'https://picsum.photos/400/200'); ?>" alt="Haber" class="w-full h-40 object-cover">
                <div class="p-4">
                    <h2 class="text-lg font-semibold mb-2">
                        <a href="/web/2/article.php?id=<?php echo $article['id']; ?>" class="hover:text-orange-600">
                            <?php echo htmlspecialchars($article['title']); ?>
                        </a>
                    </h2>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once 'footer.php'; ?>
