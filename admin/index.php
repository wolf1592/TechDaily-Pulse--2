<?php
session_name('ADMIN_SESSION');
session_start();
if (!isset($_SESSION['admin'])) { header("Location: /web/2/admin/login.php"); exit; }
require_once '../api/db.php';
$top_articles = $pdo->query("SELECT title FROM articles LIMIT 5")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-100">
    <div class="flex">
        <aside class="w-64 bg-white h-screen p-6">
            <h1 class="text-2xl font-bold mb-8">Admin Paneli</h1>
            <nav class="space-y-4">
                <a href="/web/2/admin/index.php" class="block text-orange-600 font-bold">Dashboard</a>
                <a href="/web/2/admin/articles.php" class="block text-gray-700">Haberler</a>
                <a href="/web/2/admin/categories.php" class="block text-gray-700">Kategoriler</a>
                <a href="/web/2/admin/settings.php" class="block text-gray-700">Ayarlar</a>
            </nav>
        </aside>
        <main class="flex-grow p-8">
            <h2 class="text-3xl font-bold mb-6">Dashboard</h2>
            <div class="grid grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded shadow">
                    <h3 class="font-bold text-lg mb-4">En Çok Okunan 5 Haber</h3>
                    <ul class="list-decimal list-inside">
                        <?php foreach ($top_articles as $a): ?><li><?php echo htmlspecialchars($a['title']); ?></li><?php endforeach; ?>
                    </ul>
                </div>
                <div class="bg-white p-6 rounded shadow">
                    <h3 class="font-bold text-lg mb-4">Bugünkü Ziyaretçi</h3>
                    <p class="text-4xl">1.240</p>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
