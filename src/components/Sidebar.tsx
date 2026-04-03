import React, { useState, useEffect } from 'react';
import { fetchArticles, fetchVideos, fetchSettings } from '../lib/api';
import { PlayCircle, TrendingUp, Mail, BarChart2, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const [videos, setVideos] = useState<any[]>([]);
  const [trendArticles, setTrendArticles] = useState<any[]>([]);
  const [pollVoted, setPollVoted] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [poll, setPoll] = useState<any>(null);
  const [newsletterText, setNewsletterText] = useState('En güncel teknoloji haberleri ve incelemeler her hafta e-posta kutunda!');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [articles, vids, settings] = await Promise.all([
          fetchArticles(),
          fetchVideos(),
          fetchSettings()
        ]);
        setTrendArticles(articles.slice(0, 5));
        setVideos(vids.slice(0, 4));
        if (settings.poll) setPoll(settings.poll);
        if (settings.general?.newsletterText) setNewsletterText(settings.general.newsletterText);
      } catch (error) {
        console.error('Error loading sidebar data:', error);
      }
    };
    loadData();
  }, []);

  const handleVote = async (index: number) => {
    if (pollVoted || !poll) return;
    setPollVoted(true);
    try {
      await fetch('/api/settings/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex: index })
      });
      // Refresh poll data
      const settings = await fetchSettings();
      if (settings.poll) setPoll(settings.poll);
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add logic to subscribe
    setSubscribed(true);
  };

  const formatCryptoName = (symbol: string) => {
    return symbol.replace('USDT', '');
  };

  return (
    <aside className="space-y-8 sticky top-24">
      {/* Live Crypto Widget */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2">
          <DollarSign className="text-[#ff6000]" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Canlı Piyasalar</h3>
        </div>
        <div className="p-4 space-y-3">
          {cryptoData.length > 0 ? cryptoData.map((coin) => {
            const isPositive = parseFloat(coin.priceChangePercent) >= 0;
            return (
              <div key={coin.symbol} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span className="font-bold text-gray-700 dark:text-gray-300">{formatCryptoName(coin.symbol)}</span>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">${parseFloat(coin.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex justify-between items-center p-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Widget */}
      <div className="bg-gradient-to-br from-[#ff6000] to-[#e55600] rounded-xl p-6 text-white shadow-md">
        <div className="flex items-center space-x-2 mb-4">
          <Mail size={24} />
          <h3 className="text-xl font-bold">Bültene Abone Ol</h3>
        </div>
        <p className="text-sm text-white/90 mb-4">
          {newsletterText}
        </p>
        {subscribed ? (
          <div className="bg-white/20 rounded-lg p-3 text-center font-medium animate-in fade-in zoom-in duration-300">
            Aboneliğiniz başarıyla alındı!
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <input 
              type="email" 
              placeholder="E-posta adresiniz" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
            <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 rounded-lg transition-colors active:scale-95">
              Kayıt Ol
            </button>
          </form>
        )}
      </div>

      {/* Poll Widget */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2">
          <BarChart2 className="text-[#ff6000]" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Haftanın Anketi</h3>
        </div>
        <div className="p-5">
          {poll ? (
            <>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {poll.question}
              </h4>
              {pollVoted ? (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {poll.options.map((option: any, index: number) => {
                    const percent = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-400">
                          <span>{option.text}</span><span>{percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-[#ff6000] h-2 rounded-full" style={{width: `${percent}%`}}></div>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-center text-xs text-gray-500 mt-4">Toplam {poll.totalVotes} oy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {poll.options.map((option: any, index: number) => (
                    <button 
                      key={index}
                      onClick={() => handleVote(index)}
                      className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#ff6000] dark:hover:border-[#ff6000] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-sm text-gray-700 dark:text-gray-300 active:scale-95"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-sm text-center">Anket yükleniyor...</div>
          )}
        </div>
      </div>

      {/* Trend Haberler Widget */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2">
          <TrendingUp className="text-[#ff6000]" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trend Haberler</h3>
        </div>
        <div className="p-4 space-y-4">
          {trendArticles.length === 0 ? (
            <div className="text-gray-500 text-sm">Henüz haber bulunmuyor.</div>
          ) : (
            trendArticles.map((article, index) => (
              <Link to={`/article/${article.id}`} key={article.id} className="group cursor-pointer flex space-x-3 relative pl-3 border-l-2 border-transparent hover:border-[#ff6000] transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#ff6000] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                <div className="flex-shrink-0 w-6 text-center">
                  <span className="text-xl font-bold text-gray-200 dark:text-gray-700 group-hover:text-[#ff6000] transition-colors">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug group-hover:text-[#ff6000] transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center" title="Görüntülenme">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> 
                      {Math.floor(Math.random() * 40) + 10}B
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Popular Videos Widget */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-2">
          <PlayCircle className="text-[#ff6000]" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popüler Videolar</h3>
        </div>
        <div className="p-4 space-y-4">
          {videos.length === 0 ? (
            <div className="text-gray-500 text-sm">Henüz video bulunmuyor.</div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="group cursor-pointer flex space-x-3">
                <div className="relative w-24 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <img 
                    src={video.image} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <PlayCircle className="text-white opacity-80 group-hover:opacity-100" size={24} />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded font-medium">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug group-hover:text-[#ff6000] transition-colors line-clamp-3">
                    {video.title}
                  </h4>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
