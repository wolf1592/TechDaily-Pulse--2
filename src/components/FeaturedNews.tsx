import { useState, useEffect } from 'react';
import { fetchArticles } from '../lib/api';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock } from 'lucide-react';

export default function FeaturedNews() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isTrendOpen, setIsTrendOpen] = useState(false);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const results = await fetchArticles();
        setArticles(results);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  useEffect(() => {
    if (articles.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % articles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [articles]);

  if (loading) return (
    <div className="py-6 max-w-7xl mx-auto px-4">
      <div className="animate-pulse flex flex-col lg:flex-row gap-6 lg:h-[500px]">
        <div className="flex-1 h-[400px] lg:h-full bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
          {[1,2,3,4].map(i => <div key={i} className="flex-1 min-h-[100px] bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>)}
        </div>
      </div>
    </div>
  );
  
  if (articles.length === 0) return <div className="py-6 h-96 flex items-center justify-center">Henüz haber bulunmuyor.</div>;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 5);

  return (
    <section className="py-6 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[500px]">
        {/* Main Featured Article (approx 66%) */}
        <div className="lg:col-span-8 relative group overflow-hidden rounded-2xl shadow-xl h-[400px] lg:h-full">
          <Link to={`/article/${mainArticle.id}`} className="block w-full h-full">
            <div className="w-full h-full">
              <img 
                src={mainArticle.image} 
                alt={mainArticle.seo?.altText || mainArticle.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            </div>
          </Link>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full pointer-events-none">
            {/* Badges & Ticker */}
            <div className="flex items-center gap-3 mb-4 relative w-full pointer-events-auto">
              {/* Glassmorphism Category Badge */}
              <Link to={`/?q=${mainArticle.category}`} className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg hover:bg-white/30 transition-colors flex-shrink-0">
                {mainArticle.category}
              </Link>
              
              {/* Trend Badge / Dropdown Toggle */}
              <div className="relative flex-shrink-0">
                <button 
                  onClick={(e) => { e.preventDefault(); setIsTrendOpen(!isTrendOpen); }}
                  className="inline-flex items-center bg-[#ff6000]/90 backdrop-blur-md border border-[#ff6000]/50 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg hover:bg-[#ff6000] transition-colors relative"
                >
                  <TrendingUp size={14} className="mr-1.5" /> Trend Haber
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </button>

                {/* Trend Dropdown Modal */}
                {isTrendOpen && (
                  <div className="absolute bottom-full left-0 mb-3 w-72 sm:w-80 bg-black/70 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 p-4 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="font-bold text-white mb-3 border-b border-white/20 pb-2 flex items-center">
                      <TrendingUp size={16} className="mr-2 text-[#ff6000]" /> Haftanın Trendleri
                    </h4>
                    <div className="space-y-3">
                      {articles.slice(0, 5).map(a => (
                        <Link key={a.id} to={`/article/${a.id}`} className="block group/item">
                          <h5 className="text-sm font-medium text-gray-300 group-hover/item:text-white group-hover/item:underline line-clamp-2 transition-colors">{a.title}</h5>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* News Ticker */}
              <div className="hidden sm:block flex-1 overflow-hidden h-8 relative ml-2">
                <div 
                  key={tickerIndex} 
                  className="absolute inset-0 flex items-center text-sm font-medium text-white/90 animate-in slide-in-from-bottom-4 fade-in duration-500"
                >
                  <Link to={`/article/${articles[tickerIndex]?.id}`} className="hover:text-[#ff6000] hover:underline truncate block w-full drop-shadow-md transition-colors">
                    {articles[tickerIndex]?.title}
                  </Link>
                </div>
              </div>
            </div>

            <Link to={`/article/${mainArticle.id}`} className="block pointer-events-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight group-hover:text-gray-200 transition-colors drop-shadow-lg">
                {mainArticle.title}
              </h2>
            </Link>
            
            <div className="mt-4 flex flex-wrap items-center gap-4 pointer-events-auto">
              <Link to={`/article/${mainArticle.id}`} className="bg-[#ff6000] hover:bg-[#e55600] text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors inline-flex items-center">
                Detayları Oku
              </Link>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors" aria-label="Share on Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </button>
                <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors" aria-label="Share on LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                </button>
              </div>
              <div className="ml-auto flex items-center text-gray-300 text-sm font-medium space-x-4 drop-shadow-md">
                <span className="flex items-center"><Clock size={14} className="mr-1.5" /> 6 dk okuma</span>
                <span>{mainArticle.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Articles Grid (approx 33%) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          {sideArticles.map((article) => (
            <Link to={`/article/${article.id}`} key={article.id} className="group flex-1 flex items-center bg-white dark:bg-[#1a1a1a] rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#ff6000]/30 dark:hover:border-[#ff6000]/30 border-l-4 border-l-transparent hover:border-l-[#ff6000] transition-all">
              <div className="relative w-28 sm:w-32 h-full min-h-[80px] flex-shrink-0 rounded-xl overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.seo?.altText || article.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-1.5 left-1.5 bg-[#ff6000] text-white p-1 rounded-full shadow-md">
                  <TrendingUp size={12} />
                </div>
              </div>
              <div className="ml-4 flex-1 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-[#ff6000] uppercase tracking-wider mb-1.5 block">
                  {article.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-[#ff6000] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center"><Clock size={12} className="mr-1" /> 4 dk</span>
                  <span className="flex items-center" title="Görüntülenme"><svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> {Math.floor(Math.random() * 40) + 10}B</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
