    </main>
    <footer class="bg-gray-800 text-white pt-12 pb-6">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <!-- Newsletter -->
            <div class="col-span-1 md:col-span-2">
                <h3 class="text-lg font-bold mb-4"><?php echo htmlspecialchars($settings['newsletter_title'] ?: 'Teknoloji nabzını kaçırmayın'); ?></h3>
                <form class="flex gap-2">
                    <input type="email" placeholder="E-posta adresiniz" class="flex-grow p-2 rounded text-gray-900">
                    <button class="bg-orange-600 px-4 py-2 rounded">Abone Ol</button>
                </form>
            </div>
            <!-- Social & Tags -->
            <div>
                <h3 class="text-lg font-bold mb-4">Takipte Kal</h3>
                <div class="flex gap-4 mb-4">
                    <?php if ($settings['instagram_url']) echo '<a href="'.$settings['instagram_url'].'">Instagram</a>'; ?>
                    <?php if ($settings['linkedin_url']) echo '<a href="'.$settings['linkedin_url'].'">LinkedIn</a>'; ?>
                    <?php if ($settings['github_url']) echo '<a href="'.$settings['github_url'].'">GitHub</a>'; ?>
                    <?php if ($settings['rss_url']) echo '<a href="'.$settings['rss_url'].'">RSS</a>'; ?>
                </div>
                <div class="flex flex-wrap gap-2">
                    <?php 
                    $tags = explode(',', $settings['footer_tags']);
                    foreach ($tags as $tag) {
                        if (trim($tag)) echo '<span class="bg-gray-700 px-2 py-1 rounded text-xs">#'.trim($tag).'</span>';
                    }
                    ?>
                </div>
            </div>
            <!-- Institutional -->
            <div>
                <h3 class="text-lg font-bold mb-4">Kurumsal</h3>
                <ul class="space-y-2 text-sm">
                    <li><a href="/web/2/kunye.php">Künye</a></li>
                    <li><a href="#">DMCA / Telif</a></li>
                </ul>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 border-t border-gray-700 pt-6 flex justify-between items-center text-sm text-gray-400">
            <p><?php echo htmlspecialchars($settings['footer_copyright']); ?></p>
            <p><?php echo htmlspecialchars($settings['footer_powered_by']); ?></p>
            <div class="flex gap-4">
                <a href="/web/2/sitemap.xml">Sitemap</a>
                <button onclick="toggleDarkMode()">Tema Değiştir</button>
            </div>
        </div>
    </footer>

    <!-- Back to Top -->
    <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="fixed bottom-20 right-6 bg-gray-700 text-white p-3 rounded-full shadow-lg">↑</button>

    <!-- WhatsApp -->
    <a href="https://wa.me/<?php echo htmlspecialchars($settings['whatsapp_number']); ?>" target="_blank" class="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50">
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.03 2C6.5 2 2 6.5 12.03c0 1.95.53 3.8 1.45 5.4L2 22l4.78-1.45c1.55.9 3.35 1.4 5.25 1.4 5.53 0 10.03-4.5 10.03-10.03S17.56 2 12.03 2zm0 1.8c4.55 0 8.23 3.68 8.23 8.23 0 4.55-3.68 8.23-8.23 8.23-1.7 0-3.28-.5-4.65-1.35l-3.3 1 1-3.3c-.85-1.37-1.35-2.95-1.35-4.65 0-4.55 3.68-8.23 8.23-8.23zM8.5 8.5c-.2 0-.5.1-.7.3-.2.2-.5.6-.5 1 0 .4.3.8.5 1 .2.2.5.3.7.3.2 0 .5-.1.7-.3.2-.2.5-.6.5-1 0-.4-.3-.8-.5-1-.2-.2-.5-.3-.7-.3zm7 0c-.2 0-.5.1-.7.3-.2.2-.5.6-.5 1 0 .4.3.8.5 1 .2.2.5.3.7.3.2 0 .5-.1.7-.3.2-.2.5-.6.5-1 0-.4-.3-.8-.5-1-.2-.2-.5-.3-.7-.3zm-3.5 6c-1.5 0-2.8 1.1-3.2 2.5h6.4c-.4-1.4-1.7-2.5-3.2-2.5z"/></svg>
    </a>

    <!-- Custom Script -->
    <?php echo $settings['footer_custom_script']; ?>
</body>
</html>
