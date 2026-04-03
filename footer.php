    </main>
    <footer class="bg-gray-800 text-white p-6 text-center">
        <p>&copy; 2026 Haber Sitesi</p>
    </footer>
    <?php
    require_once 'api/db.php';
    $stmt = $pdo->query("SELECT value FROM settings WHERE key_name = 'whatsapp_number'");
    $whatsapp_number = $stmt->fetchColumn();
    ?>
    <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp_number); ?>" target="_blank" class="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.03 2C6.5 2 2 6.5 2 12.03c0 1.95.53 3.8 1.45 5.4L2 22l4.78-1.45c1.55.9 3.35 1.4 5.25 1.4 5.53 0 10.03-4.5 10.03-10.03S17.56 2 12.03 2zm0 1.8c4.55 0 8.23 3.68 8.23 8.23 0 4.55-3.68 8.23-8.23 8.23-1.7 0-3.28-.5-4.65-1.35l-3.3 1 1-3.3c-.85-1.37-1.35-2.95-1.35-4.65 0-4.55 3.68-8.23 8.23-8.23zM8.5 8.5c-.2 0-.5.1-.7.3-.2.2-.5.6-.5 1 0 .4.3.8.5 1 .2.2.5.3.7.3.2 0 .5-.1.7-.3.2-.2.5-.6.5-1 0-.4-.3-.8-.5-1-.2-.2-.5-.3-.7-.3zm7 0c-.2 0-.5.1-.7.3-.2.2-.5.6-.5 1 0 .4.3.8.5 1 .2.2.5.3.7.3.2 0 .5-.1.7-.3.2-.2.5-.6.5-1 0-.4-.3-.8-.5-1-.2-.2-.5-.3-.7-.3zm-3.5 6c-1.5 0-2.8 1.1-3.2 2.5h6.4c-.4-1.4-1.7-2.5-3.2-2.5z"/></svg>
    </a>
</body>
</html>
