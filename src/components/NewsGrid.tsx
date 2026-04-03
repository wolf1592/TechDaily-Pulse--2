import { useState, useEffect } from 'react';
import { fetchArticles } from '../lib/api';
import { Clock, User } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function NewsGrid() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const results = await fetchArticles();
        let fetchedArticles = results;
      
        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          fetchedArticles = fetchedArticles.filter((article: any) => 
            (article.title && article.title.toLowerCase().includes(lowerQuery)) ||
            (article.content && article.content.toLowerCase().includes(lowerQuery)) ||
            (article.categoryName && article.categoryName.toLowerCase().includes(lowerQuery))
          );
        } else {
          // Skip the first 5 as they are in FeaturedNews
          fetchedArticles = fetchedArticles.slice(5, 20);
        }
        
        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error loading articles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [searchQuery]);

  if (loading) return <div className="py-6 text-center">Yükleniyor...</div>;
  if (articles.length === 0) return (
    <div className="py-8 text-center text-gray-500">
      {searchQuery ? `"${searchQuery}" için sonuç bulunamadı.` : 'Daha fazla haber bulunmuyor.'}
    </div>
  );

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-6 border-b-2 border-gray-100 dark:border-gray-800 pb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white relative">
          {searchQuery ? `"${searchQuery}" için arama sonuçları (${articles.length})` : 'Son Haberler'}
          <span className="absolute -bottom-[10px] left-0 w-12 h-1 bg-[#ff6000]"></span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link to={`/article/${article.id}`} key={article.id} className="group cursor-pointer flex flex-col bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-800 block">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img 
                src={article.image} 
                alt={article.seo?.altText || article.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-[#ff6000] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-[#ff6000] transition-colors line-clamp-3">
                {article.title}
              </h3>
              
              <div className="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span className="font-medium">{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-1" title="Görüntülenme">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span>{Math.floor(Math.random() * 20) + 1}B</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{article.date}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {!searchQuery && articles.length >= 6 && (
        <div className="mt-8 text-center">
          <button className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Daha Fazla Haber Yükle
          </button>
        </div>
      )}
    </section>
  );
}
