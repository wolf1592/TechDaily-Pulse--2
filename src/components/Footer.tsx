import { Facebook, Twitter, Instagram, Youtube, Linkedin, Github, Rss, ArrowUp, Mail, MapPin, ShieldCheck, Sun, Moon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [settings, setSettings] = useState<any>({
    siteName: 'TechDaily Pulse',
    footerAbout: "Türkiye'nin en güncel ve samimi teknoloji haberleri, inceleme videoları ve çok daha fazlası.",
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    rssUrl: '',
    trendTags: '',
    contactEmail: '',
    contactLocation: '',
    showDeveloperSignature: true,
    footerCustomScript: '',
    newsletterText: 'Teknoloji nabzını kaçırmayın'
  });

  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [btcPrice, setBtcPrice] = useState<string>('Yükleniyor...');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial dark mode
    setIsDark(document.documentElement.classList.contains('dark'));

    const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings((prev: any) => ({ ...prev, ...docSnap.data() }));
      }
    });

    // Mock BTC Price fetch
    const fetchBtc = async () => {
      try {
        const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
        const data = await res.json();
        setBtcPrice(`$${data.bpi.USD.rate_float.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      } catch (e) {
        setBtcPrice('$65,432.10'); // Fallback
      }
    };
    fetchBtc();

    return () => unsub();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('loading');
    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        createdAt: serverTimestamp()
      });
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    } catch (error) {
      console.error("Error subscribing:", error);
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const tags = settings.trendTags ? settings.trendTags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 mt-12 relative">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between border border-gray-700 shadow-lg">
          <div className="mb-6 md:mb-0 md:mr-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">{settings.newsletterText || 'Teknoloji nabzını kaçırmayın'}</h3>
            <p className="text-gray-400 text-sm">En güncel haberler ve özel içerikler her hafta e-posta kutunuzda.</p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md flex relative">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz..." 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-l-lg py-3 px-4 focus:outline-none focus:border-[#ff6000] transition-colors"
            />
            <button 
              type="submit" 
              disabled={subscribeStatus === 'loading'}
              className="bg-[#ff6000] hover:bg-[#e55600] text-white font-bold py-3 px-6 rounded-r-lg transition-colors whitespace-nowrap disabled:opacity-70"
            >
              {subscribeStatus === 'loading' ? 'Bekleyin...' : subscribeStatus === 'success' ? 'Kaydedildi!' : 'Abone Ol'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 border-b border-gray-800 pb-8">
          {/* About & Contact */}
          <div className="col-span-1 md:col-span-4">
            <span className="text-3xl font-bold text-[#ff6000] tracking-tighter block mb-4">
              {settings.siteName}
            </span>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {settings.footerAbout}
            </p>
            
            {(settings.contactEmail || settings.contactLocation) && (
              <div className="space-y-2 mb-6">
                {settings.contactEmail && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <Mail size={16} className="mr-2 text-[#ff6000]" />
                    <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition-colors">{settings.contactEmail}</a>
                  </div>
                )}
                {settings.contactLocation && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin size={16} className="mr-2 text-[#ff6000]" />
                    <span>{settings.contactLocation}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-[#1877f2]">
                  <Facebook size={18} />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-[#1da1f2]">
                  <Twitter size={18} />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-[#e1306c]">
                  <Instagram size={18} />
                </a>
              )}
              {settings.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-[#0a66c2]">
                  <Linkedin size={18} />
                </a>
              )}
              {settings.githubUrl && (
                <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-[#333]">
                  <Github size={18} />
                </a>
              )}
              {settings.rssUrl && (
                <a href={settings.rssUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors bg-gray-800 p-2 rounded-full hover:bg-[#f26522]">
                  <Rss size={18} />
                </a>
              )}
            </div>
          </div>
          
          {/* Categories */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-lg font-bold mb-4 text-white">Kategoriler</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/?q=Donanım" className="hover:text-[#ff6000] transition-colors">Donanım</Link></li>
              <li><Link to="/?q=Yapay Zeka" className="hover:text-[#ff6000] transition-colors">Yapay Zeka</Link></li>
              <li><Link to="/?q=Mobil" className="hover:text-[#ff6000] transition-colors">Mobil Dünya</Link></li>
              <li><Link to="/?q=Oyun" className="hover:text-[#ff6000] transition-colors">Oyun</Link></li>
              <li><Link to="/?q=Siber Güvenlik" className="hover:text-[#ff6000] transition-colors">Siber Güvenlik</Link></li>
            </ul>
          </div>
          
          {/* Corporate */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-lg font-bold mb-4 text-white">Kurumsal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Künye</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
            </ul>
            <div className="mt-6 flex items-center text-xs text-gray-500 bg-gray-800/50 p-2 rounded border border-gray-700 w-fit">
              <ShieldCheck size={14} className="mr-1.5 text-gray-400" />
              <span>DMCA Protected</span>
            </div>
          </div>
          
          {/* Tags & Market */}
          <div className="col-span-1 md:col-span-4">
            {tags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-4 text-white">Trend Etiketler</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, i: number) => (
                    <Link key={i} to={`/?q=${tag.replace('#', '')}`} className="bg-gray-800 hover:bg-[#ff6000] text-gray-300 hover:text-white text-xs font-medium py-1.5 px-3 rounded-full transition-colors border border-gray-700 hover:border-[#ff6000]">
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Piyasa</h4>
              <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between border border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#f7931a]/20 flex items-center justify-center mr-3">
                    <span className="text-[#f7931a] font-bold text-sm">₿</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Bitcoin (BTC)</div>
                    <div className="text-sm font-bold text-white">{btcPrice}</div>
                  </div>
                </div>
                <div className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded">Canlı</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-2 md:space-y-0 text-center md:text-left">
            <p>© {new Date().getFullYear()} {settings.siteName}. Tüm hakları saklıdır.</p>
            <div className="hidden md:block w-1 h-1 bg-gray-700 rounded-full"></div>
            <a href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</a>
            {settings.showDeveloperSignature && (
              <>
                <div className="hidden md:block w-1 h-1 bg-gray-700 rounded-full"></div>
                <p>Powered by React & Firebase</p>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span>{isDark ? 'Açık Mod' : 'Karanlık Mod'}</span>
            </button>
            <button 
              onClick={scrollToTop}
              className="bg-gray-800 hover:bg-[#ff6000] text-gray-400 hover:text-white p-2 rounded-full transition-colors border border-gray-700 hover:border-[#ff6000]"
              aria-label="Yukarı Çık"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Custom Footer Script Injection */}
      {settings.footerCustomScript && (
        <div dangerouslySetInnerHTML={{ __html: settings.footerCustomScript }} />
      )}
    </footer>
  );
}
