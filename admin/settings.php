<?php
require_once '../api/db.php';

// Tabloyu oluştur (yoksa)
$pdo->exec("CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE,
    value TEXT
)");

// Başlangıç değeri ekle (yoksa)
$pdo->exec("INSERT IGNORE INTO settings (key_name, value) VALUES ('whatsapp_number', '905550000000')");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare("UPDATE settings SET value = ? WHERE key_name = 'whatsapp_number'");
    $stmt->execute([$_POST['whatsapp_number']]);
    $message = "Ayarlar güncellendi.";
}

$stmt = $pdo->query("SELECT value FROM settings WHERE key_name = 'whatsapp_number'");
$whatsapp_number = $stmt->fetchColumn();
?>
<!DOCTYPE html>
<html lang="tr">
<head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-100">
    <div class="flex">
        <aside class="w-64 bg-white h-screen p-6">
            <h1 class="text-2xl font-bold mb-8">Admin Paneli</h1>
            <nav class="space-y-4">
                <a href="/web/2/admin/index.php" class="block text-gray-700">Dashboard</a>
                <a href="/web/2/admin/articles.php" class="block text-gray-700">Haberler</a>
                <a href="/web/2/admin/categories.php" class="block text-gray-700">Kategoriler</a>
                <a href="/web/2/admin/settings.php" class="block text-orange-600 font-bold">Ayarlar</a>
            </nav>
        </aside>
        <main class="flex-grow p-8">
            <h2 class="text-3xl font-bold mb-6">Ayarlar</h2>
            <?php if (isset($message)) echo "<p class='text-green-600 mb-4'>$message</p>"; ?>
            <form method="POST" class="bg-white p-6 rounded shadow">
                <label class="block mb-2">WhatsApp Numarası (Örn: 905550000000)</label>
                <input type="text" name="whatsapp_number" value="<?php echo htmlspecialchars($whatsapp_number); ?>" class="w-full p-2 mb-4 border rounded" required>
                <button type="submit" class="bg-orange-600 text-white px-4 py-2 rounded">Kaydet</button>
            </form>
        </main>
    </div>
</body>
</html>
