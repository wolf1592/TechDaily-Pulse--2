<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechDaily Pulse</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
                <div class="flex gap-6 text-gray-600 dark:text-gray-300">
                    <a href="/web/2/category.php?slug=yapay-zeka" class="hover:text-orange-600">Yapay Zeka</a>
                    <a href="/web/2/category.php?slug=otomobil" class="hover:text-orange-600">Otomobil</a>
                    <a href="/web/2/category.php?slug=donanim" class="hover:text-orange-600">Donanım</a>
                    <a href="/web/2/category.php?slug=mobil" class="hover:text-orange-600">Mobil</a>
                    <a href="/web/2/category.php?slug=yazilim" class="hover:text-orange-600">Yazılım</a>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <input type="text" id="search-input" placeholder="Haber ara..." class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm">
                <button onclick="toggleDarkMode()" class="text-gray-600 dark:text-gray-300">🌙</button>
            </div>
        </nav>
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
    </script>
