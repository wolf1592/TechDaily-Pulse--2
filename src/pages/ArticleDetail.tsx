import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleById, fetchArticles } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import SeoHead from '../components/SeoHead';
import { Clock, User, Share2, MessageSquare, Twitter, Linkedin, ChevronRight, Settings, Type, Maximize2, X, MessageCircle, TrendingUp as TrendingIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, signIn } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  
  // Reading Mode States
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('sans');
  const [showSettings, setShowSettings] = useState(false);
  
  // Share Bar State
  const [showShareBar, setShowShareBar] = useState(false);
  
  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const scrollPercent = (scrolled / scrollHeight) * 100;
      setShowShareBar(scrollPercent > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [toc, setToc] = useState<{id: string, text: string}[]>([]);
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const data = await fetchArticleById(id);
        if (data) {
          setArticle(data);

          // Process content for Table of Contents
          if (data.content) {
            const tocItems: {id: string, text: string}[] = [];
            const newContent = data.content.replace(/<h2>(.*?)<\/h2>/g, (match: string, p1: string, offset: number) => {
              const headingId = `heading-${offset}`;
              tocItems.push({ id: headingId, text: p1 });
              return `<h2 id="${headingId}" class="scroll-mt-24 font-bold text-2xl mt-8 mb-4 text-gray-900 dark:text-white">${p1}</h2>`;
            });
            setToc(tocItems);
            setProcessedContent(newContent);
          }

          // Fetch Related Articles
          const allArticles = await fetchArticles();
          const related = allArticles
            .filter(a => a.category === data.category && a.id !== id)
            .slice(0, 3);
          setRelatedArticles(related);

          // Fetch Comments
          const commentsRes = await fetch(`/api/articles/${id}/comments`);
          if (commentsRes.ok) {
            setComments(await commentsRes.json());
          }
        }
      } catch (error) {
        console.error('Error loading article detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Scroll Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll) * 100);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !id) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment.trim(),
          authorName: user.displayName || 'İsimsiz Kullanıcı'
        })
      });
      
      if (res.ok) {
        setNewComment('');
        // Refresh comments
        const commentsRes = await fetch(`/api/articles/${id}/comments`);
        if (commentsRes.ok) {
          setComments(await commentsRes.json());
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-xl mb-8"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-4">
            <div className="h-[600px] bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!article) return <div className="min-h-screen flex items-center justify-center dark:bg-[#121212] dark:text-white">Haber bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 relative">
      <SeoHead 
        title={article.seo?.seoTitle || article.title} 
        description={article.seo?.seoDescription || article.content?.substring(0, 160)} 
        image={article.image} 
        type="article"
        articleData={article}
      />
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-[#ff6000] z-[60] transition-all duration-150 ease-out" 
        style={{ width: `${scrollProgress}%` }} 
      />

      <Header />

      {/* Sticky Share Bar */}
      <AnimatePresence>
        {showShareBar && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col space-y-4"
          >
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative"
              title="X'te Paylaş"
            >
              <Twitter size={20} />
              <span className="absolute left-14 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">X'te Paylaş</span>
            </button>
            <button 
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`, '_blank')}
              className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative"
              title="WhatsApp'ta Paylaş"
            >
              <MessageCircle size={20} />
              <span className="absolute left-14 bg-[#25D366] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">WhatsApp'ta Paylaş</span>
            </button>
            <button 
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="w-12 h-12 bg-[#0077b5] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform group relative"
              title="LinkedIn'de Paylaş"
            >
              <Linkedin size={20} />
              <span className="absolute left-14 bg-[#0077b5] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">LinkedIn'de Paylaş</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button className="absolute top-6 right-6 text-white hover:text-[#ff6000] transition-colors">
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightboxImage} 
              alt="Full view" 
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="max-w-7xl mx-auto px-4 w-full py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-[#ff6000] transition-colors">Anasayfa</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-[#ff6000] transition-colors cursor-pointer">{article.category}</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-gray-900 dark:text-gray-200 truncate max-w-[200px] sm:max-w-md">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <article className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 relative">
              {/* Reading Mode Settings Toggle */}
              <div className="absolute top-6 right-6 z-10">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-[#ff6000] transition-colors"
                  title="Okuma Ayarları"
                >
                  <Settings size={20} />
                </button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute top-12 right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 space-y-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Yazı Tipi</div>
                        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                          <button 
                            onClick={() => setFontFamily('sans')}
                            className={`flex-1 py-1 text-xs font-bold rounded ${fontFamily === 'sans' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                          >
                            Sans
                          </button>
                          <button 
                            onClick={() => setFontFamily('serif')}
                            className={`flex-1 py-1 text-xs font-serif font-bold rounded ${fontFamily === 'serif' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                          >
                            Serif
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase mb-2">Yazı Boyutu</div>
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="p-2 hover:text-[#ff6000]"><Type size={14} /></button>
                          <span className="text-xs font-bold">{fontSize}px</span>
                          <button onClick={() => setFontSize(Math.min(24, fontSize + 2))} className="p-2 hover:text-[#ff6000]"><Type size={18} /></button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <span className="inline-block bg-[#ff6000] text-white text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                    {article.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-auto">
                      <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${article.title}`} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-[#1da1f2] transition-colors active:scale-95">
                        <Twitter size={16} />
                      </a>
                      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${article.title}`} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-[#0a66c2] transition-colors active:scale-95">
                        <Linkedin size={16} />
                      </a>
                      <a href={`https://api.whatsapp.com/send?text=${article.title} ${shareUrl}`} target="_blank" rel="noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:text-[#25d366] transition-colors active:scale-95">
                        <Share2 size={16} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="aspect-[16/9] w-full mb-8 rounded-lg overflow-hidden group relative">
                  <img 
                    src={article.image} 
                    alt={article.seo?.altText || article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button 
                      onClick={() => setLightboxImage(article.image)}
                      className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ff6000] hover:scale-110 active:scale-95"
                      title="Görseli Büyüt"
                    >
                      <Maximize2 size={32} />
                    </button>
                  </div>
                </div>

                {/* Table of Contents */}
                {toc.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">İçindekiler</h3>
                    <ul className="space-y-2">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a 
                            href={`#${item.id}`} 
                            className="text-[#ff6000] hover:underline text-sm font-medium flex items-center"
                          >
                            <ChevronRight size={14} className="mr-1" />
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div 
                  className={`prose prose-lg dark:prose-invert max-w-none prose-a:text-[#ff6000] prose-headings:font-bold prose-img:rounded-xl ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: processedContent || article.content || '<p>İçerik bulunamadı.</p>' }}
                />

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="text-2xl font-bold mb-8 flex items-center">
                      <TrendingIcon size={24} className="mr-2 text-[#ff6000]" /> Bunu okuyanlar şunları da okudu
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedArticles.map(rel => (
                        <Link key={rel.id} to={`/article/${rel.id}`} className="group">
                          <div className="aspect-video rounded-xl overflow-hidden mb-3">
                            <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <h4 className="font-bold text-sm leading-snug group-hover:text-[#ff6000] transition-colors line-clamp-2">{rel.title}</h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* Comments Section */}
            <div className="mt-8 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <div className="flex items-center space-x-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <MessageSquare className="text-[#ff6000]" size={24} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Yorumlar ({comments.length})</h3>
              </div>

              {user ? (
                <form onSubmit={handleAddComment} className="mb-8">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Düşüncelerinizi paylaşın..."
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#ff6000] focus:border-transparent outline-none resize-none h-24 mb-3 transition-all"
                    required
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-[#ff6000] hover:bg-[#e55600] disabled:bg-orange-300 text-white font-bold py-2 px-6 rounded-lg transition-colors active:scale-95"
                    >
                      {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center mb-8 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Yorum yapabilmek için giriş yapmalısınız.</p>
                  <button 
                    onClick={signIn}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-2 px-6 rounded-lg transition-colors active:scale-95"
                  >
                    Google ile Giriş Yap
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">İlk yorumu siz yapın!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-600 dark:text-gray-300 font-bold">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-900 dark:text-white">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
