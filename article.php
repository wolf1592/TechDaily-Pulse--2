<?php
require_once 'api/db.php';
require_once 'header.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    header("Location: /");
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
$stmt->execute([$id]);
$article = $stmt->fetch();

if (!$article) {
    echo "<h1>Haber bulunamadı</h1>";
} else {
    $related = $pdo->prepare("SELECT * FROM articles WHERE category_id = ? AND id != ? LIMIT 3");
    $related->execute([$article['category_id'], $id]);
    $related_articles = $related->fetchAll();
?>
    <div id="content-area" class="max-w-3xl mx-auto">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-4xl font-bold"><?php echo htmlspecialchars($article['title']); ?></h1>
            <div class="flex gap-2">
                <button onclick="changeFontSize(1)" class="bg-gray-200 px-2 rounded">A+</button>
                <button onclick="changeFontSize(-1)" class="bg-gray-200 px-2 rounded">A-</button>
                <button onclick="toggleFont()" class="bg-gray-200 px-2 rounded">Font</button>
            </div>
        </div>
        <img src="<?php echo htmlspecialchars($article['image']); ?>" class="w-full mb-6 cursor-pointer" onclick="openLightbox(this.src)">
        <div id="article-text" class="text-lg leading-relaxed"><?php echo nl2br(htmlspecialchars($article['content'])); ?></div>
    </div>

    <!-- Sharing Bar -->
    <div id="sharing-bar" class="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 transition-opacity duration-500">
        <a href="#" class="bg-blue-600 text-white p-3 rounded-full">X</a>
        <a href="#" class="bg-green-500 text-white p-3 rounded-full">W</a>
        <a href="#" class="bg-blue-800 text-white p-3 rounded-full">L</a>
    </div>

    <!-- Related Content -->
    <div class="max-w-3xl mx-auto mt-12">
        <h3 class="text-2xl font-bold mb-4">Bunu okuyanlar şunları da okudu</h3>
        <div class="grid grid-cols-3 gap-4">
            <?php foreach ($related_articles as $r): ?>
                <a href="/web/2/article.php?id=<?php echo $r['id']; ?>" class="block bg-white p-4 rounded shadow"><?php echo htmlspecialchars($r['title']); ?></a>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Lightbox -->
    <div id="lightbox" class="fixed inset-0 bg-black bg-opacity-80 hidden flex items-center justify-center z-50" onclick="this.classList.add('hidden')">
        <img id="lightbox-img" class="max-w-full max-h-full">
    </div>

    <script>
        window.onscroll = () => {
            if (window.scrollY > document.body.scrollHeight * 0.5) {
                document.getElementById('sharing-bar').classList.remove('opacity-0');
            }
        };
        function changeFontSize(delta) {
            const el = document.getElementById('article-text');
            const size = parseInt(window.getComputedStyle(el).fontSize);
            el.style.fontSize = (size + delta) + 'px';
        }
        function toggleFont() {
            document.getElementById('article-text').classList.toggle('font-serif');
        }
        function openLightbox(src) {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').classList.remove('hidden');
        }
    </script>
<?php } ?>

require_once 'footer.php';
?>
