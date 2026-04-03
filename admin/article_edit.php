<?php
require_once '../api/db.php';

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

    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("UPDATE articles SET title = ?, content = ?, category_id = ?, image = ? WHERE id = ?");
        $stmt->execute([$title, $content, $category_id, $image, $_GET['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO articles (title, content, category_id, image) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $content, $category_id, $image]);
    }
    header("Location: /web/2/admin/articles.php");
    exit;
}

$categories = $pdo->query("SELECT * FROM categories")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-100 p-8">
    <div class="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h2 class="text-2xl font-bold mb-6"><?php echo $article ? 'Haberi Düzenle' : 'Yeni Haber Ekle'; ?></h2>
        <form method="POST">
            <input type="text" name="title" value="<?php echo $article['title'] ?? ''; ?>" placeholder="Başlık" class="w-full p-2 mb-4 border rounded" required>
            <textarea name="content" placeholder="İçerik" class="w-full p-2 mb-4 border rounded h-40" required><?php echo $article['content'] ?? ''; ?></textarea>
            <select name="category_id" class="w-full p-2 mb-4 border rounded" required>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?php echo $cat['id']; ?>" <?php echo ($article && $article['category_id'] == $cat['id']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($cat['name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
            <input type="text" name="image" value="<?php echo $article['image'] ?? ''; ?>" placeholder="Görsel URL" class="w-full p-2 mb-4 border rounded">
            <button type="submit" class="bg-orange-600 text-white px-4 py-2 rounded">Kaydet</button>
            <a href="/web/2/admin/articles.php" class="text-gray-600 ml-4">İptal</a>
        </form>
    </div>
</body>
</html>
