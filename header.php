<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ea580c">
    <link rel="manifest" href="/web/2/manifest.json">
    <title>TechDaily Pulse</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); }
        .dark .glass { background: rgba(31, 41, 55, 0.7); }
    </style>
    <script>
        // Dark Mode Logic
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    </script>
</head>
<body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <!-- Progress Bar -->
    <div id="progress-bar" class="fixed top-0 left-0 h-1 bg-orange-500 z-50" style="width: 0%;"></div>

    <header class="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
        <nav class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-8">
                <a href="/web/2/" class="text-2xl font-bold text-orange-600">TechDaily Pulse</a>
                <!-- News Ticker -->
                <div class="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm overflow-hidden h-8 w-64">
                    <span class="text-orange-600 font-bold flex-shrink-0">Trend:</span>
                    <div id="ticker" class="relative h-full w-full">
                        <span class="absolute w-full transition-all duration-500">Yapay zeka devrimi başlıyor!</span>
                        <span class="absolute w-full transition-all duration-500 opacity-0">Yeni nesil otomobiller yolda!</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <?php session_start(); if (isset($_SESSION['admin'])): ?>
                    <a href="/web/2/admin/index.php" class="text-orange-600 font-bold text-sm">Admin Paneli</a>
                <?php endif; ?>
                <input type="text" id="search-input" placeholder="Haber ara..." class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm w-32 focus:w-64 transition-all duration-300">
                <button onclick="toggleDarkMode()" class="text-gray-600 dark:text-gray-300 text-xl">🌙</button>
            </div>
        </nav>
        <!-- Navbar Menu -->
        <div class="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
            <div class="max-w-7xl mx-auto px-4 py-2 flex gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                <a href="/web/2/category.php?slug=yapay-zeka" class="hover:text-orange-600">Yapay Zeka</a>
                <a href="/web/2/category.php?slug=otomobil" class="hover:text-orange-600">Otomobil</a>
                <a href="/web/2/category.php?slug=donanim" class="hover:text-orange-600">Donanım</a>
                <a href="/web/2/category.php?slug=mobil" class="hover:text-orange-600">Mobil</a>
                <a href="/web/2/category.php?slug=oyun" class="hover:text-orange-600">Oyun</a>
                <a href="/web/2/category.php?slug=siber-guvenlik" class="hover:text-orange-600">Siber Güvenlik</a>
            </div>
        </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-8">
    <script>
        function toggleDarkMode() {
            document.documentElement.classList.toggle('dark');
            localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        // Progress Bar Logic
        window.onscroll = function() {
            var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var scrolled = (winScroll / height) * 100;
            document.getElementById("progress-bar").style.width = scrolled + "%";
        };
        // Ticker Logic
        let tickerIndex = 0;
        const tickerItems = document.querySelectorAll('#ticker span:not(:first-child)');
        setInterval(() => {
            tickerItems.forEach((item, index) => {
                item.style.opacity = index === tickerIndex ? '1' : '0';
            });
            tickerIndex = (tickerIndex + 1) % tickerItems.length;
        }, 3000);
    </script>
