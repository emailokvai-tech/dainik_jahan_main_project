/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Newspaper, Globe, TrendingUp, Menu, Search, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category: string;
  isBreaking?: boolean;
}

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const q = query(
      collection(db, 'articles'),
      orderBy('publishedAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedArticles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      setArticles(fetchedArticles);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', 'World', 'Politics', 'Business', 'Technology', 'Science'];

  return (
    <div className="min-h-screen bg-guardian-bg font-serif text-guardian-text">
      {/* Header */}
      <header className="border-b border-guardian-border bg-guardian-paper">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 cursor-pointer hover:text-guardian-blue transition-colors" />
            <Search className="w-5 h-5 cursor-pointer hidden md:block hover:text-guardian-blue" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-guardian-blue font-sans uppercase">
            DAINIK JAHAN
          </h1>

          <div className="flex items-center gap-4">
            <button className="hidden md:block px-4 py-1.5 border border-guardian-blue text-guardian-blue text-sm font-sans font-bold rounded-full hover:bg-guardian-blue hover:text-white transition-all">
              Subscribe
            </button>
            <div className="text-sm font-sans font-medium text-guardian-muted hidden lg:block">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <ul className="flex gap-6 py-3 text-sm font-sans font-bold border-t border-guardian-border whitespace-nowrap">
            {categories.map(cat => (
              <li 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer transition-colors ${selectedCategory === cat ? 'text-guardian-blue border-b-2 border-guardian-blue' : 'hover:text-guardian-blue'}`}
              >
                {cat.toUpperCase()}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-guardian-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Story */}
            <div className="lg:col-span-8 space-y-8">
              {articles.length > 0 && (
                <motion.article 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="guardian-card"
                >
                  <div className="flex items-center gap-2 text-guardian-blue font-sans font-bold text-sm mb-3">
                    <TrendingUp className="w-4 h-4" />
                    <span>TOP STORY</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4 hover:text-guardian-blue cursor-pointer">
                    {articles[0].title}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                       {articles[0].imageUrl && (
                        <div className="aspect-video overflow-hidden mb-4 bg-gray-200">
                          <img 
                            src={articles[0].imageUrl} 
                            alt={articles[0].title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <p className="text-lg text-[#333] leading-relaxed mb-4 line-clamp-3">
                        {articles[0].excerpt || articles[0].content}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-sans text-guardian-muted">
                        <span className="font-bold text-guardian-text">{articles[0].source.toUpperCase()}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(articles[0].publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              )}

              {/* Secondary Stories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {articles.slice(1, 7).map((article, idx) => (
                  <motion.div 
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="guardian-card"
                  >
                    <div className="text-guardian-blue font-sans font-bold text-xs mb-2">
                      {article.category.toUpperCase()}
                    </div>
                    {article.imageUrl && (
                      <div className="aspect-[16/9] overflow-hidden mb-3 bg-gray-200">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold leading-snug mb-2 hover:text-guardian-blue cursor-pointer line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-[#333] text-sm line-clamp-3 mb-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <span className="text-[10px] font-sans font-bold text-guardian-muted">
                      {article.source.toUpperCase()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-[#E9F1F8] p-4 border-t-2 border-guardian-blue">
                <h3 className="text-sm font-sans font-bold text-guardian-blue flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4" /> WORLD NEWS
                </h3>
                <div className="space-y-4">
                  {articles.slice(7, 15).map((article, idx) => (
                    <div key={article.id} className={`pb-4 ${idx !== 7 ? 'border-b border-guardian-border' : ''}`}>
                      <h4 className="font-bold text-base leading-tight hover:text-guardian-blue cursor-pointer line-clamp-2">
                        {article.title}
                      </h4>
                      <div className="mt-1 text-[10px] font-sans text-guardian-muted">
                        {new Date(article.publishedAt).toLocaleDateString()} • {article.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#DCDCDC] p-4">
                <h3 className="text-sm font-sans font-bold mb-4">OPINION</h3>
                <div className="space-y-6">
                   <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Author" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm leading-tight">The digital revolution is only just beginning</h5>
                      <p className="text-xs text-[#005689] mt-1">Felix Wright</p>
                    </div>
                   </div>
                   <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" alt="Author" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm leading-tight">Why global trade requires a new perspective</h5>
                      <p className="text-xs text-[#005689] mt-1">Emma Chen</p>
                    </div>
                   </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#052962] text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 font-sans tracking-tighter">DAINIK JAHAN</h2>
          <div className="flex justify-center gap-8 text-sm font-sans font-bold mb-8 opacity-80 overflow-x-auto pb-4">
            <a href="#" className="hover:underline">ABOUT US</a>
            <a href="#" className="hover:underline">CONTACT</a>
            <a href="#" className="hover:underline">PRIVACY POLICY</a>
            <a href="#" className="hover:underline">ADVERTISE</a>
            <a href="#" className="hover:underline">NEWSLETTERS</a>
          </div>
          <p className="text-xs opacity-60 font-sans">
            © {new Date().getFullYear()} Dainik Jahan. All rights reserved. Registered in International Media Network.
          </p>
        </div>
      </footer>
    </div>
  );
}
