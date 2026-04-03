<?php
session_set_cookie_params(0, '/');
session_name('ADMIN_SESSION');
session_start();
if (!isset($_SESSION['admin'])) { header("Location: login.php"); exit; }
require_once '../api/db.php';

// Tabloyu oluştur (yoksa)
$pdo->exec("CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE,
    value TEXT
)");

// Başlangıç değerlerini ekle (yoksa)
$keys = ['whatsapp_number', 'instagram_url', 'linkedin_url', 'github_url', 'rss_url', 'footer_copyright', 'footer_powered_by', 'footer_custom_script', 'newsletter_title', 'footer_tags'];
foreach ($keys as $key) {
    $pdo->exec("INSERT IGNORE INTO settings (key_name, value) VALUES ('$key', '')");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach ($keys as $key) {
        if (isset($_POST[$key])) {
            $stmt = $pdo->prepare("UPDATE settings SET value = ? WHERE key_name = ?");
            $stmt->execute([$_POST[$key], $key]);
        }
    }
    $message = "Ayarlar güncellendi.";
}

$settings = [];
$stmt = $pdo->query("SELECT key_name, value FROM settings");
while ($row = $stmt->fetch()) {
    $settings[$row['key_name']] = $row['value'];
}
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
            <form method="POST" class="bg-white p-6 rounded shadow space-y-4">
                <h3 class="font-bold text-lg">İletişim & Sosyal Medya</h3>
                <input type="text" name="whatsapp_number" value="<?php echo htmlspecialchars($settings['whatsapp_number']); ?>" placeholder="WhatsApp (90555...)" class="w-full p-2 border rounded">
                <input type="text" name="instagram_url" value="<?php echo htmlspecialchars($settings['instagram_url']); ?>" placeholder="Instagram URL" class="w-full p-2 border rounded">
                <input type="text" name="linkedin_url" value="<?php echo htmlspecialchars($settings['linkedin_url']); ?>" placeholder="LinkedIn URL" class="w-full p-2 border rounded">
                <input type="text" name="github_url" value="<?php echo htmlspecialchars($settings['github_url']); ?>" placeholder="GitHub URL" class="w-full p-2 border rounded">
                <input type="text" name="rss_url" value="<?php echo htmlspecialchars($settings['rss_url']); ?>" placeholder="RSS URL" class="w-full p-2 border rounded">
                
                <h3 class="font-bold text-lg pt-4">Footer Ayarları</h3>
                <input type="text" name="newsletter_title" value="<?php echo htmlspecialchars($settings['newsletter_title']); ?>" placeholder="Newsletter Başlığı" class="w-full p-2 border rounded">
                <input type="text" name="footer_tags" value="<?php echo htmlspecialchars($settings['footer_tags']); ?>" placeholder="Etiketler (Virgülle ayırın)" class="w-full p-2 border rounded">
                <input type="text" name="footer_copyright" value="<?php echo htmlspecialchars($settings['footer_copyright']); ?>" placeholder="Copyright Metni" class="w-full p-2 border rounded">
                <input type="text" name="footer_powered_by" value="<?php echo htmlspecialchars($settings['footer_powered_by']); ?>" placeholder="Powered By Metni" class="w-full p-2 border rounded">
                <textarea name="footer_custom_script" placeholder="Özel Script (Facebook Pixel vb.)" class="w-full p-2 border rounded h-32"><?php echo htmlspecialchars($settings['footer_custom_script']); ?></textarea>
                
                <button type="submit" class="bg-orange-600 text-white px-4 py-2 rounded">Kaydet</button>
            </form>
        </main>
    </div>
</body>
</html>
