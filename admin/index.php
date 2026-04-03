<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header("Location: /admin/login.php");
    exit;
}
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
                <a href="/admin/categories.php" class="block text-gray-700">Kategoriler</a>
                <a href="/api/logout.php" class="block text-red-600">Çıkış</a>
            </nav>
        </aside>
        <main class="flex-grow p-8">
            <h2 class="text-3xl font-bold mb-6">Dashboard</h2>
            <p>Hoş geldin, <?php echo htmlspecialchars($_SESSION['admin']['email']); ?></p>
        </main>
    </div>
</body>
</html>
