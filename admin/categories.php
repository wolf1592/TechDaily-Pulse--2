<?php
session_start();
if (!isset($_SESSION['admin'])) { header("Location: /admin/login.php"); exit; }
require_once '../api/db.php';

if (isset($_GET['delete'])) {
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$_GET['delete']]);
    header("Location: /admin/categories.php");
    exit;
}

$categories = $pdo->query("SELECT * FROM categories")->fetchAll();
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
                <a href="/admin/articles.php" class="block text-gray-700">Haberler</a>
                <a href="/admin/categories.php" class="block text-orange-600 font-bold">Kategoriler</a>
                <a href="/api/logout.php" class="block text-red-600">Çıkış</a>
            </nav>
        </aside>
        <main class="flex-grow p-8">
            <h2 class="text-3xl font-bold mb-6">Kategoriler</h2>
            <table class="w-full bg-white rounded shadow">
                <thead><tr class="border-b"><th class="p-4 text-left">İsim</th><th class="p-4 text-left">İşlemler</th></tr></thead>
                <tbody>
                    <?php foreach ($categories as $cat): ?>
                    <tr class="border-b">
                        <td class="p-4"><?php echo htmlspecialchars($cat['name']); ?></td>
                        <td class="p-4">
                            <a href="?delete=<?php echo $cat['id']; ?>" class="text-red-600" onclick="return confirm('Silmek istediğine emin misin?')">Sil</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </main>
    </div>
</body>
</html>
