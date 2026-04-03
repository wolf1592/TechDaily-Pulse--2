import { Search, User, Menu, Moon, Sun, Shield, X, ChevronDown, TrendingUp } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs, onSnapshot, doc } from 'firebase/firestore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [megaMenuArticles, setMegaMenuArticles] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [categories, setCategories] = useState<string[]>([
    "Donanım", "Yapay Zeka", "Mobil Dünya", "Oyun", "Siber Güvenlik", "İnceleme", "Rehber"
  ]);
  const [siteName, setSiteName] = useState('TechDaily Pulse');
  const [siteLogo, setSiteLogo] = useState('');

  const { user, signIn, logOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Settings & Categories
  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.siteName) {
          setSiteName(data.siteName);
          document.title = data.siteName;
        }
        if (data.siteLogo) {
          setSiteLogo(data.siteLogo);
        }
      }
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name);
      if (cats.length > 0) {
        setCategories(cats);
      }
    });

    return () => {
      unsubSettings();
      unsubCategories();
    };
  }, []);

  // Advanced Dark Mode Initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Instant Search (Debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const lowerQuery = searchQuery.toLowerCase();
        
        const results = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(article => 
            article.title?.toLowerCase().includes(lowerQuery) || 
            article.category?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5); // Show top 5 instant results
          
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Fetch Mega Menu Articles
  useEffect(() => {
    const fetchMegaMenuArticles = async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'), limit(4));
        const snapshot = await getDocs(q);
        setMegaMenuArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Mega menu error:", error);
      }
    };
    fetchMegaMenuArticles();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'py-0 shadow-md' : 'py-2'}`}>
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16'}`}>
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-[#ff6000] active:scale-95 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            <Link to="/" className={`font-bold text-[#ff6000] tracking-tighter hover:opacity-80 transition-all duration-300 flex items-center ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className={`${isScrolled ? 'h-8' : 'h-10'} w-auto object-contain`} />
              ) : (
                siteName
              )}
            </Link>
          </div>

          {/* Desktop Navigation with Mega Menu */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2 h-full items-center">
            {categories.slice(0, 5).map((category) => (
              <div 
                key={category}
                className="h-full flex items-center"
                onMouseEnter={() => setActiveMegaMenu(category)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <a
                  href="#"
                  className={`px-2 py-2 font-semibold text-gray-700 dark:text-gray-200 hover:text-[#ff6000] dark:hover:text-[#ff6000] transition-colors whitespace-nowrap flex items-center ${isScrolled ? 'text-xs' : 'text-sm'}`}
                >
                  {category}
                  <ChevronDown size={14} className="ml-1 opacity-50" />
                </a>

                {/* Mega Menu Dropdown */}
                {activeMegaMenu === category && (
                  <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 shadow-xl p-6 grid grid-cols-4 gap-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="col-span-1 border-r border-gray-100 dark:border-gray-800 pr-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <TrendingUp size={18} className="mr-2 text-[#ff6000]" />
                        {category} Trendleri
                      </h3>
                      <ul className="space-y-3">
                        <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#ff6000] dark:hover:text-[#ff6000] transition-colors">En Çok Okunanlar</a></li>
                        <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#ff6000] dark:hover:text-[#ff6000] transition-colors">Haftanın Özetleri</a></li>
                        <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#ff6000] dark:hover:text-[#ff6000] transition-colors">Editörün Seçimi</a></li>
                        <li><a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#ff6000] dark:hover:text-[#ff6000] transition-colors">Video İncelemeler</a></li>
                      </ul>
                    </div>
                    <div className="col-span-3 grid grid-cols-3 gap-4">
                      {megaMenuArticles.slice(0, 3).map(article => (
                        <Link to={`/article/${article.id}`} key={article.id} className="group block">
                          <div className="aspect-video rounded-lg overflow-hidden mb-3">
                            <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#ff6000] transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            
            {/* Inline Expanding Search */}
            <div className="hidden sm:block relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Haber ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className={`bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-transparent focus:border-[#ff6000]/50 rounded-full py-1.5 pl-9 pr-4 outline-none text-sm transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-64 bg-white dark:bg-[#222] shadow-inner' : 'w-40 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchOpen ? 'text-[#ff6000]' : 'text-gray-500 dark:text-gray-400'}`} size={16} />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>

              {/* Quick Results Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hızlı Sonuçlar</span>
                  </div>
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-gray-500">Aranıyor...</div>
                  ) : searchResults.length > 0 ? (
                    <ul className="max-h-[60vh] overflow-y-auto">
                      {searchResults.map(result => (
                        <li key={result.id}>
                          <Link 
                            to={`/article/${result.id}`} 
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                          >
                            <img src={result.image} alt="" className="w-12 h-12 object-cover rounded-md mr-3" loading="lazy" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#ff6000] transition-colors truncate">{result.title}</h4>
                              <span className="text-[10px] font-medium text-[#ff6000] uppercase">{result.category}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">Sonuç bulunamadı.</div>
                  )}
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full p-3 text-center text-sm font-bold text-[#ff6000] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border-t border-gray-100 dark:border-gray-800"
                  >
                    Tüm sonuçları gör
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#ff6000] transition-all active:scale-95 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isAdmin && (
              <Link to="/admin" className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#ff6000] transition-all active:scale-95 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:block">
                <Shield size={20} />
              </Link>
            )}

            {user ? (
              <button onClick={logOut} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg transition-all active:scale-95 text-sm font-medium">
                <User size={18} />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            ) : (
              <button onClick={signIn} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg transition-all active:scale-95 text-sm font-medium">
                <User size={18} />
                <span className="hidden sm:inline">Giriş Yap</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1">
              <form onSubmit={handleSearchSubmit} className="px-4 mb-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Haber ara..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-transparent rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#ff6000]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </form>
              {categories.map((category) => (
                <a
                  key={category}
                  href="#"
                  className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#ff6000] rounded-lg mx-2 transition-colors"
                >
                  {category}
                </a>
              ))}
              {isAdmin && (
                <Link to="/admin" className="px-4 py-3 text-base font-medium text-[#ff6000] hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg mx-2 transition-colors">
                  Admin Paneli
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
