import Header from '../components/Header';
import FeaturedNews from '../components/FeaturedNews';
import NewsGrid from '../components/NewsGrid';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SeoHead from '../components/SeoHead';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <SeoHead />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 w-full">
        <FeaturedNews />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          <div className="lg:col-span-8">
            <NewsGrid />
          </div>
          <div className="lg:col-span-4 mt-6">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
