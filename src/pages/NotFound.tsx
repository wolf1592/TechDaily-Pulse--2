import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Search, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative inline-block mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="text-9xl font-black text-gray-200 dark:text-gray-800 select-none"
              >
                404
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="bg-[#ff6000] p-4 rounded-2xl shadow-xl rotate-12"
                >
                  <AlertCircle size={48} className="text-white" />
                </motion.div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Eyvah! Sayfa Teknolojik Bir Karadeliğe Düştü
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Aradığınız içerik sunucularımızda bulunamadı veya başka bir boyuta taşındı. 
              Belki de henüz icat edilmedi!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 bg-[#ff6000] hover:bg-[#e55600] text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-500/20"
              >
                <Home size={20} />
                <span>Anasayfaya Dön</span>
              </Link>
              <button 
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
              >
                <Search size={20} />
                <span>Geri Git</span>
              </button>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Search size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Arama Yapın</h3>
                <p className="text-sm text-gray-500">Sitemizdeki binlerce teknoloji haberi arasında arama yapabilirsiniz.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingIcon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Popüler Haberler</h3>
                <p className="text-sm text-gray-500">Günün en çok okunan teknoloji gelişmelerine göz atın.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Home size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Kategoriler</h3>
                <p className="text-sm text-gray-500">Yapay zeka, mobil, oyun ve daha fazlasını keşfedin.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrendingIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
