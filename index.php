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
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span class="text-orange-500">↗</span> Yapay Zeka Trendleri
        </h2>
        <ul class="space-y-3 text-gray-700 dark:text-gray-300">
            <li><a href="#" class="block border-l-2 border-transparent hover:border-orange-500 hover:text-orange-600 pl-3 transition-all">En Çok Okunanlar</a></li>
            <li><a href="#" class="block border-l-2 border-transparent hover:border-orange-500 hover:text-orange-600 pl-3 transition-all">Haftanın Özetleri</a></li>
            <li><a href="#" class="block border-l-2 border-transparent hover:border-orange-500 hover:text-orange-600 pl-3 transition-all">Editörün Seçimi</a></li>
            <li><a href="#" class="block border-l-2 border-transparent hover:border-orange-500 hover:text-orange-600 pl-3 transition-all">Video İncelemeler</a></li>
        </ul>
    </aside>

    <!-- News Grid -->
    <div class="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ($articles as $article): ?>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-transform duration-300 hover:scale-105">
                <img src="<?php echo htmlspecialchars($article['image'] ?? 'https://picsum.photos/400/200'); ?>" alt="Haber" class="w-full h-40 object-cover">
                <div class="p-4">
                    <h2 class="text-lg font-semibold mb-2">
                        <a href="/web/2/article.php?id=<?php echo $article['id']; ?>" class="hover:text-orange-600 dark:text-gray-100">
                            <?php echo htmlspecialchars($article['title']); ?>
                        </a>
                    </h2>
                    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>🕒 6 dk</span>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once 'footer.php'; ?>
