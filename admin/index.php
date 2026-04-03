<?php
require_once '../api/db.php';
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
            <p>Hoş geldin, yönetici.</p>
        </main>
    </div>
</body>
</html>
