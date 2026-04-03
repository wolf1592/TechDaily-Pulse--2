<?php
session_set_cookie_params(0, '/');
session_name('ADMIN_SESSION');
session_start();
if (!isset($_SESSION['admin'])) { header("Location: login.php"); exit; }
require_once '../api/db.php';

// Veritabanı şemasını güncelle
$pdo->exec("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role ENUM('editor', 'author') DEFAULT 'author'
)");

$pdo->exec("CREATE TABLE IF NOT EXISTS article_revisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
)");

$pdo->exec("ALTER TABLE articles 
    ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
    ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255),
    ADD COLUMN IF NOT EXISTS status ENUM('draft', 'pending', 'published') DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS publish_at DATETIME NULL
");

$article = null;
if (isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $article = $stmt->fetch();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'];
    $content = $_POST['content'];
    $category_id = $_POST['category_id'];
    $image = $_POST['image'];
    $slug = $_POST['slug'];
    $seo_title = $_POST['seo_title'];
    $seo_description = $_POST['seo_description'];
    $alt_text = $_POST['alt_text'];
    $status = $_POST['status'];
    $publish_at = $_POST['publish_at'];

    if (isset($_GET['id'])) {
        // Versiyon kaydet
        $stmt = $pdo->prepare("INSERT INTO article_revisions (article_id, content) VALUES (?, ?)");
        $stmt->execute([$_GET['id'], $article['content']]);

        $stmt = $pdo->prepare("UPDATE articles SET title = ?, content = ?, category_id = ?, image = ?, slug = ?, seo_title = ?, seo_description = ?, alt_text = ?, status = ?, publish_at = ? WHERE id = ?");
        $stmt->execute([$title, $content, $category_id, $image, $slug, $seo_title, $seo_description, $alt_text, $status, $publish_at, $_GET['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO articles (title, content, category_id, image, slug, seo_title, seo_description, alt_text, status, publish_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $content, $category_id, $image, $slug, $seo_title, $seo_description, $alt_text, $status, $publish_at]);
    }
    header("Location: /web/2/admin/articles.php");
    exit;
}

$categories = $pdo->query("SELECT * FROM categories")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
    <script>
        tinymce.init({
            selector: 'textarea[name="content"]',
            plugins: 'image code',
            toolbar: 'image code',
            images_upload_url: '/web/2/admin/upload.php',
            automatic_uploads: true,
            setup: function (editor) {
                editor.on('change', function () {
                    updateSEOScore();
                });
            }
        });

        function updateSEOScore() {
            const content = tinymce.activeEditor.getContent();
            const wordCount = content.split(' ').length;
            const title = document.querySelector('input[name="title"]').value;
            const scoreEl = document.getElementById('seo-score');
            
            let score = 0;
            if (wordCount > 300) score += 50;
            if (title.length > 10) score += 50;
            
            scoreEl.innerText = 'SEO Puanı: ' + score;
            scoreEl.className = score >= 100 ? 'text-green-600' : 'text-red-600';
        }
    </script>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto grid grid-cols-3 gap-8">
        <div class="col-span-2 bg-white p-8 rounded shadow">
            <h2 class="text-2xl font-bold mb-6"><?php echo $article ? 'Haberi Düzenle' : 'Yeni Haber Ekle'; ?></h2>
            <form method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="title" value="<?php echo $article['title'] ?? ''; ?>" placeholder="Başlık" class="col-span-2 p-2 border rounded" required>
                <input type="text" name="slug" value="<?php echo $article['slug'] ?? ''; ?>" placeholder="Slug (URL)" class="col-span-2 p-2 border rounded">
                <textarea name="content" class="col-span-2 h-64"><?php echo $article['content'] ?? ''; ?></textarea>
                
                <select name="category_id" class="p-2 border rounded" required>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?php echo $cat['id']; ?>" <?php echo ($article && $article['category_id'] == $cat['id']) ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($cat['name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <input type="text" name="image" value="<?php echo $article['image'] ?? ''; ?>" placeholder="Görsel URL" class="p-2 border rounded">
                <input type="text" name="alt_text" value="<?php echo $article['alt_text'] ?? ''; ?>" placeholder="Görsel Alt Metni" class="p-2 border rounded">
                
                <input type="text" name="seo_title" value="<?php echo $article['seo_title'] ?? ''; ?>" placeholder="SEO Başlığı" class="p-2 border rounded">
                <input type="text" name="seo_description" value="<?php echo $article['seo_description'] ?? ''; ?>" placeholder="SEO Açıklaması" class="p-2 border rounded">
                
                <select name="status" class="p-2 border rounded">
                    <option value="draft" <?php echo ($article && $article['status'] == 'draft') ? 'selected' : ''; ?>>Taslak</option>
                    <option value="pending" <?php echo ($article && $article['status'] == 'pending') ? 'selected' : ''; ?>>İnceleme Bekliyor</option>
                    <option value="published" <?php echo ($article && $article['status'] == 'published') ? 'selected' : ''; ?>>Yayında</option>
                </select>
                <input type="datetime-local" name="publish_at" value="<?php echo $article['publish_at'] ? date('Y-m-d\TH:i', strtotime($article['publish_at'])) : ''; ?>" class="p-2 border rounded">
                
                <button type="submit" class="col-span-2 bg-orange-600 text-white px-4 py-2 rounded">Kaydet</button>
            </form>
        </div>
        <div class="bg-white p-6 rounded shadow">
            <h3 class="font-bold text-lg mb-4">AI Asistanı & SEO</h3>
            <div id="seo-score" class="text-xl font-bold mb-4">SEO Puanı: 0</div>
            <button type="button" class="w-full bg-blue-600 text-white p-2 rounded mb-2">AI Başlık Öner</button>
            <button type="button" class="w-full bg-blue-600 text-white p-2 rounded">AI Açıklama Oluştur</button>
        </div>
    </div>
</body>
</html>
