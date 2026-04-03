<?php
session_start();
if (!isset($_SESSION['admin'])) { header("Location: /admin/login.php"); exit; }
require_once '../api/db.php';

// Silme işlemi
if (isset($_GET['delete'])) {
    $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
    $stmt->execute([$_GET['delete']]);
    header("Location: /admin/articles.php");
    exit;
}

$articles = $pdo->query("SELECT a.*, c.name as category_name FROM articles a LEFT JOIN categories c ON a.category_id = c.id")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-100">
    <div class="flex">
        <aside class="w-64 bg-white h-screen p-6">
            <h1 class="text-2xl font-bold mb-8">Admin Paneli</h1>
            <nav class="space-y-4">
                <a href="/admin/index.php" class="block text-gray-700">Dashboard</a>
                <a href="/admin/articles.php" class="block text-orange-600 font-bold">Haberler</a>
                <a href="/admin/categories.php" class="block text-gray-700">Kategoriler</a>
                <a href="/api/logout.php" class="block text-red-600">Çıkış</a>
            </nav>
        </aside>
        <main class="flex-grow p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold">Haberler</h2>
                <a href="/admin/article_edit.php" class="bg-orange-600 text-white px-4 py-2 rounded">Yeni Haber Ekle</a>
            </div>
            <table class="w-full bg-white rounded shadow">
                <thead><tr class="border-b"><th class="p-4 text-left">Başlık</th><th class="p-4 text-left">Kategori</th><th class="p-4 text-left">İşlemler</th></tr></thead>
                <tbody>
                    <?php foreach ($articles as $article): ?>
                    <tr class="border-b">
                        <td class="p-4"><?php echo htmlspecialchars($article['title']); ?></td>
                        <td class="p-4"><?php echo htmlspecialchars($article['category_name']); ?></td>
                        <td class="p-4">
                            <a href="/admin/article_edit.php?id=<?php echo $article['id']; ?>" class="text-blue-600 mr-2">Düzenle</a>
                            <a href="?delete=<?php echo $article['id']; ?>" class="text-red-600" onclick="return confirm('Silmek istediğine emin misin?')">Sil</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </main>
    </div>
</body>
</html>
