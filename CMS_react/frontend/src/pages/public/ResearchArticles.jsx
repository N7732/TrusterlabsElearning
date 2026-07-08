import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, Search, Filter } from 'lucide-react';
import { apiClient, getImageUrl } from '../../api/apiClient';
import image1 from '../../assets/image1.jpg';

const ResearchArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/research/publications/');
      if (res && res.results) {
        setArticles(res.results.filter(a => a.is_published));
      } else if (Array.isArray(res)) {
        setArticles(res.filter(a => a.is_published));
      }
    } catch (error) {
      console.error("Failed to fetch research articles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#030712] min-h-[calc(100vh-64px)] font-['Work_Sans',sans-serif] pb-20">
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10 relative text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-cyber opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Insights & Publications</h2>
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Research Articles
          </h1>
          <p className="text-lg text-gray-400">
            Dive into our repository of whitepapers, threat intelligence reports, and security analyses crafted by TrusterLabs' elite research team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search articles, topics, or authors..." 
              className="w-full bg-[#111827] border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
            <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#111827] border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors w-full md:w-auto justify-center">
            <Filter size={18} />
            <span>Filter by Category</span>
          </button>
        </div>

        {/* Featured Article */}
        <div className="mb-16">
          {loading ? (
            <div className="bg-[#111827] rounded-2xl border border-white/10 p-12 text-center text-gray-400">Loading featured report...</div>
          ) : articles.length > 0 ? (
            <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden group hover:border-[#D4AF37]/30 transition-colors cursor-pointer flex flex-col md:flex-row">
              <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto bg-slate-900">
                <img src={articles[0].image ? getImageUrl(articles[0].image) : image1} alt="Featured" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Featured Report
                </div>
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-[#D4AF37] text-sm font-semibold mb-2">Latest Research</span>
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-[#D4AF37] transition-colors">{articles[0].title}</h3>
                <p className="text-gray-400 mb-6 line-clamp-3">
                  {articles[0].abstract}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span>By {articles[0].authors}</span>
                  <span>•</span>
                  <span>{articles[0].publication_date}</span>
                </div>
                {articles[0].document ? (
                  <a href={getImageUrl(articles[0].document)} target="_blank" rel="noreferrer" className="text-white font-bold flex items-center gap-2 group-hover:gap-3 transition-all hover:text-[#D4AF37]">
                    Download Report <ChevronRight size={18} className="text-[#D4AF37]" />
                  </a>
                ) : (
                  <span className="text-white font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Read Abstract <ChevronRight size={18} className="text-[#D4AF37]" />
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] rounded-2xl border border-white/10 p-12 text-center text-gray-500">No published articles yet.</div>
          )}
        </div>

        {/* Article Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            null // Loading handled by featured block
          ) : articles.length > 1 ? (
            articles.slice(1).map((article) => (
              <div key={article.id} className="bg-[#111827] rounded-xl border border-white/10 p-6 group hover:border-[#D4AF37]/30 transition-colors cursor-pointer flex flex-col h-full">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full">Research</span>
                  <FileText size={16} className="text-gray-500" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-[#D4AF37] transition-colors">{article.title}</h4>
                <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">{article.abstract}</p>
                <div className="border-t border-white/5 pt-4 mt-auto">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.authors}</span>
                    <div className="flex items-center gap-2">
                      <span>{article.publication_date}</span>
                    </div>
                  </div>
                </div>
                {article.document && (
                  <div className="mt-4">
                    <a href={getImageUrl(article.document)} target="_blank" rel="noreferrer" className="text-[#D4AF37] text-sm font-bold flex items-center gap-1 hover:underline">
                      Download PDF <ChevronRight size={14} />
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : null}
        </div>
        
        <div className="mt-12 text-center">
          <button className="bg-transparent border border-white/20 text-white hover:bg-white/5 font-bold py-3 px-8 rounded-lg transition-colors">
            Load More Articles
          </button>
        </div>

      </section>
    </div>
  );
};

export default ResearchArticles;
