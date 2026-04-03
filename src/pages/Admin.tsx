import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, getDoc, updateDoc, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { LogOut, Plus, Trash2, Save, ChevronDown, ChevronUp, LayoutDashboard, Settings as SettingsIcon, Users, Eye, FileText, TrendingUp as TrendingIcon, PlayCircle, BarChart2, MessageSquare, TrendingUp, Sparkles, Clock, History, Search, Filter, Edit3, AlertCircle, CheckCircle2, Wand2, Image as ImageIcon, GripVertical, Palette, Type, ExternalLink, Download, CheckSquare, Square, MoreVertical, Code, Smartphone, Cpu, Gamepad, Shield } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import ReactQuill from 'react-quill-new';
import { format } from 'date-fns';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SortableCategoryItem = ({ cat, categoryStats, handleEditCategory, handleDelete }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stats = categoryStats[cat.name] || { count: 0, views: 0 };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Plus, Code, Smartphone, Cpu, Gamepad, Shield, LayoutDashboard, Settings: SettingsIcon, Users, FileText, TrendingUp: TrendingIcon, PlayCircle, BarChart2, MessageSquare
    };
    const Icon = icons[iconName] || Plus;
    return <Icon size={20} />;
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl mb-2 group">
      <div className="flex items-center space-x-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical size={20} />
        </button>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
          {getIconComponent(cat.icon)}
        </div>
        <div>
          <div className="font-bold text-gray-900 dark:text-white flex items-center">
            {cat.name}
            {cat.parentId && <span className="ml-2 text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">Alt Kategori</span>}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[200px]">{cat.description || 'Açıklama yok'}</div>
        </div>
      </div>
      <div className="flex items-center space-x-8">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900 dark:text-white">{stats.count}</div>
          <div className="text-[10px] text-gray-500 uppercase font-bold">Yazı</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900 dark:text-white">{stats.views}</div>
          <div className="text-[10px] text-gray-500 uppercase font-bold">Tık</div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleEditCategory(cat)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <Edit3 size={18} />
          </button>
          <button onClick={() => handleDelete('categories', cat.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Admin() {
  const { user, userData, isAdmin, isEditor, isAuthor, logOut } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'videos' | 'categories' | 'poll' | 'settings' | 'seo' | 'redirections' | 'users'>('dashboard');

  // Article List Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalVideos: 0,
    totalComments: 0,
    totalSubscribers: 0,
    topArticles: [] as any[]
  });

  // Form states - Articles/Videos
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'pending' | 'published'>('draft');
  const [publishedAt, setPublishedAt] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [isSeeding, setIsSeeding] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Per-Post SEO
  const [focusKeyword, setFocusKeyword] = useState('');
  const [slug, setSlug] = useState('');
  const [altText, setAltText] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [readingTimeOverride, setReadingTimeOverride] = useState('');
  const [revisions, setRevisions] = useState<any[]>([]);
  const [activeArticleTab, setActiveArticleTab] = useState<'edit' | 'seo' | 'advanced' | 'revisions'>('edit');

  // SEO Scorecard
  const seoScore = useMemo(() => {
    const scores = {
      keywordInTitle: title.toLowerCase().includes(focusKeyword.toLowerCase()) && focusKeyword !== '',
      wordCount: content.replace(/<[^>]+>/g, '').split(/\s+/).length >= 300,
      hasImage: content.includes('<img') || image !== '',
      descriptionLength: seoDescription.length >= 120 && seoDescription.length <= 160,
      titleLength: seoTitle.length >= 40 && seoTitle.length <= 60
    };
    const total = Object.values(scores).filter(Boolean).length;
    return { ...scores, total, max: Object.keys(scores).length };
  }, [title, content, focusKeyword, seoDescription, seoTitle, image]);

  // Form states - Categories
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catMetaTitle, setCatMetaTitle] = useState('');
  const [catMetaDescription, setCatMetaDescription] = useState('');
  const [catColor, setCatColor] = useState('#ff6000');
  const [comments, setComments] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [catIcon, setCatIcon] = useState('Plus');
  const [catParentId, setCatParentId] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Bulk Actions
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  // Form states - Poll
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '']);

  // Form states - Settings
  const [siteName, setSiteName] = useState('');
  const [siteLogo, setSiteLogo] = useState('');
  const [footerAbout, setFooterAbout] = useState('');
  const [newsletterText, setNewsletterText] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [rssUrl, setRssUrl] = useState('');
  const [trendTags, setTrendTags] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactLocation, setContactLocation] = useState('');
  const [showDeveloperSignature, setShowDeveloperSignature] = useState(true);
  const [footerCustomScript, setFooterCustomScript] = useState('');

  const [isDragging, setIsDragging] = useState(false);

  // Form states - SEO Settings
  const [ogImage, setOgImage] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [twitterCardType, setTwitterCardType] = useState('summary_large_image');
  const [noIndexGlobal, setNoIndexGlobal] = useState(false);
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');
  const [googleSiteVerification, setGoogleSiteVerification] = useState('');
  const [facebookPixelId, setFacebookPixelId] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [schemaSiteType, setSchemaSiteType] = useState('NewsMediaOrganization');
  const [schemaLogo, setSchemaLogo] = useState('');
  const [autoWebp, setAutoWebp] = useState(false);
  const [preconnectUrls, setPreconnectUrls] = useState('');

  // Form states - Redirections
  const [redirections, setRedirections] = useState<any[]>([]);
  const [oldUrl, setOldUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Accordion state - SEO
  const [seoAccordion, setSeoAccordion] = useState({
    og: true,
    indexing: false,
    tech: false,
    schema: false,
    perf: false
  });

  const toggleSeoAccordion = (section: keyof typeof seoAccordion) => {
    setSeoAccordion(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [users, setUsers] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [articlesRes, videosRes, categoriesRes, settingsRes, usersRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/videos'),
        fetch('/api/categories'),
        fetch('/api/settings'),
        fetch('/api/users').catch(() => ({ ok: false, json: () => [] }))
      ]);

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData);
        setStats(prev => ({ 
          ...prev, 
          totalArticles: articlesData.length,
          topArticles: [...articlesData].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5)
        }));
      }

      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData);
        setStats(prev => ({ ...prev, totalVideos: videosData.length }));
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const general = settingsData.general || {};
        setSiteName(general.siteName || '');
        setSiteLogo(general.siteLogo || '');
        setFooterAbout(general.footerAbout || '');
        setNewsletterText(general.newsletterText || '');
        setFacebookUrl(general.facebookUrl || '');
        setTwitterUrl(general.twitterUrl || '');
        setInstagramUrl(general.instagramUrl || '');
        setLinkedinUrl(general.linkedinUrl || '');
        setGithubUrl(general.githubUrl || '');
        setRssUrl(general.rssUrl || '');
        setTrendTags(general.trendTags || '');
        setContactEmail(general.contactEmail || '');
        setContactLocation(general.contactLocation || '');
        setShowDeveloperSignature(general.showDeveloperSignature !== false);
        setFooterCustomScript(general.footerCustomScript || '');

        const seo = settingsData.seo || {};
        setOgImage(seo.ogImage || '');
        setOgTitle(seo.ogTitle || '');
        setOgDescription(seo.ogDescription || '');
        setTwitterCardType(seo.twitterCardType || 'summary_large_image');
        setNoIndexGlobal(seo.noIndexGlobal || false);
        setSitemapUrl(seo.sitemapUrl || '');
        setRobotsTxt(seo.robotsTxt || '');
        setGoogleSiteVerification(seo.googleSiteVerification || '');
        setFacebookPixelId(seo.facebookPixelId || '');
        setCanonicalUrl(seo.canonicalUrl || '');
        setSchemaSiteType(seo.schemaSiteType || 'NewsMediaOrganization');
        setSchemaLogo(seo.schemaLogo || '');
        setAutoWebp(seo.autoWebp || false);
        setPreconnectUrls(seo.preconnectUrls || '');
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }

    const fetchSeoSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'seo'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOgImage(data.ogImage || '');
          setOgTitle(data.ogTitle || '');
          setOgDescription(data.ogDescription || '');
          setTwitterCardType(data.twitterCardType || 'summary_large_image');
          setNoIndexGlobal(data.noIndexGlobal || false);
          setSitemapUrl(data.sitemapUrl || '');
          setRobotsTxt(data.robotsTxt || '');
          setGoogleSiteVerification(data.googleSiteVerification || '');
          setFacebookPixelId(data.facebookPixelId || '');
          setCanonicalUrl(data.canonicalUrl || '');
          setSchemaSiteType(data.schemaSiteType || 'NewsMediaOrganization');
          setSchemaLogo(data.schemaLogo || '');
          setAutoWebp(data.autoWebp || false);
          setPreconnectUrls(data.preconnectUrls || '');
        }
      } catch (error) {
        console.error("Error fetching SEO settings:", error);
      }
    };
    fetchSeoSettings();

    // Fetch Redirections
    const unsubRedirections = onSnapshot(collection(db, 'redirections'), (snapshot) => {
      setRedirections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'redirections'));

    const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'articles'));

    const unsubVideos = onSnapshot(collection(db, 'videos'), (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'videos'));

    const unsubComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'comments'));

    const unsubSubs = onSnapshot(collection(db, 'subscribers'), (snapshot) => {
      setSubscribers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'subscribers'));

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));

    return () => {
      unsubArticles();
      unsubVideos();
      unsubComments();
      unsubSubs();
      unsubCategories();
      unsubRedirections();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Bu sayfayı görüntülemek için yönetici olmalısınız.</p>
          <button onClick={logOut} className="bg-gray-800 text-white px-4 py-2 rounded">Çıkış Yap</button>
        </div>
      </div>
    );
  }

  const generateSlug = (text: string) => {
    const trMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };
    let slugText = text;
    for (let key in trMap) {
      slugText = slugText.replace(new RegExp(key, 'g'), trMap[key]);
    }
    return slugText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleAiAssist = async (type: 'summary' | 'titles' | 'prompt' | 'fullContent' | 'suggestTitles' | 'summarize') => {
    if (!content && !['prompt', 'fullContent', 'suggestTitles', 'summarize'].includes(type)) return;
    if (!title && ['fullContent', 'suggestTitles'].includes(type)) {
      alert('Lütfen önce bir başlık girin.');
      return;
    }
    setIsAiLoading(true);
    try {
      let prompt = '';
      switch(type) {
        case 'summary':
        case 'summarize':
          prompt = `Bu teknoloji makalesi için 160 karakteri geçmeyen, SEO uyumlu bir meta açıklaması yaz: ${content.replace(/<[^>]+>/g, '').substring(0, 1000)}`;
          break;
        case 'titles':
        case 'suggestTitles':
          prompt = `Bu teknoloji makalesi için tıklanma oranı (CTR) yüksek 3 adet alternatif başlık öner. Sadece başlıkları liste halinde ver: ${content.replace(/<[^>]+>/g, '').substring(0, 1000)}`;
          break;
        case 'prompt':
          prompt = `Şu konu hakkında bir teknoloji haberi görseli oluşturmak için detaylı bir yapay zeka görsel üretim promptu (DALL-E/Midjourney) hazırla: ${title}`;
          break;
        case 'fullContent':
          prompt = `"${title}" başlığına sahip bir teknoloji haberi içeriği üret. 
           İçerik yaklaşık 1000 karakter olsun, SEO uyumlu olsun. 
           İçeriğin sonuna konuyla ilgili en az 3 adet Sıkça Sorulan Soru (FAQ) ekle. 
           İçeriği HTML formatında (<h2>, <p>, <ul>, <li> etiketlerini kullanarak) döndür. Sadece HTML içeriğini döndür, markdown veya açıklama ekleme.`;
          break;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      if (!response || !response.text) {
        throw new Error("AI yanıt vermedi veya boş yanıt döndürdü.");
      }

      const result = response.text;
      if (type === 'summary' || type === 'summarize') setSeoDescription(result.substring(0, 160));
      else if (type === 'fullContent') setContent(result);
      else alert(result);
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI işlemi sırasında bir hata oluştu.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const articleData = {
        title, slug: slug || generateSlug(title), image, category_id: category, date, content, status,
        isFeatured, isLarge: false,
        seo_focusKeyword: focusKeyword,
        seo_altText: altText,
        seo_title: seoTitle,
        seo_description: seoDescription
      };

      const url = editingId ? `/api/articles/${editingId}` : '/api/articles';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });

      if (res.ok) {
        alert(editingId ? 'Haber güncellendi!' : 'Haber eklendi!');
        fetchData();
        setEditingId(null);
        setTitle(''); setImage(''); setCategory(''); setDate(''); setContent('');
        setFocusKeyword(''); setSlug(''); setAltText(''); setSeoTitle(''); setSeoDescription('');
        setCommentsDisabled(false); setIsFeatured(false); setReadingTimeOverride('');
        setStatus('draft');
        setActiveArticleTab('edit');
      } else {
        const err = await res.json();
        alert(err.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Makale kaydedilirken hata oluştu');
    }
  };

  const handleEdit = async (article: any) => {
    setEditingId(article.id);
    setTitle(article.title || '');
    setImage(article.image || '');
    setCategory(article.category || '');
    setDate(article.date || '');
    setContent(article.content || '');
    setStatus(article.status || 'draft');
    setCommentsDisabled(article.commentsDisabled || false);
    setIsFeatured(article.isFeatured || false);
    setReadingTimeOverride(article.readingTimeOverride || '');
    setFocusKeyword(article.seo?.focusKeyword || '');
    setSlug(article.seo?.slug || '');
    setAltText(article.seo?.altText || '');
    setSeoTitle(article.seo?.seoTitle || '');
    setSeoDescription(article.seo?.seoDescription || '');
    if (article.publishedAt) {
      const d = article.publishedAt.toDate ? article.publishedAt.toDate() : new Date(article.publishedAt);
      setPublishedAt(format(d, "yyyy-MM-dd'T'HH:mm"));
    }
    
    // Fetch revisions
    const q = query(collection(db, 'articles', article.id, 'revisions'), orderBy('updatedAt', 'desc'), firestoreLimit(10));
    onSnapshot(q, (snapshot) => {
      setRevisions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setActiveTab('articles');
    setActiveArticleTab('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, image, duration, url: '' })
      });
      if (res.ok) {
        alert('Video eklendi!');
        fetchData();
        setTitle(''); setImage(''); setDuration('');
      } else {
        const err = await res.json();
        alert(err.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Video eklenirken hata oluştu');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const catData = {
        name: newCategoryName.trim(),
        description: catDescription,
        slug: catSlug || generateSlug(newCategoryName),
        metaTitle: catMetaTitle,
        metaDescription: catMetaDescription,
        color: catColor,
        icon: catIcon,
        parentId: catParentId || null,
        order: categories.length
      };

      const url = editingCatId ? `/api/categories/${editingCatId}` : '/api/categories';
      const method = editingCatId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });

      if (res.ok) {
        alert(editingCatId ? 'Kategori güncellendi!' : 'Kategori eklendi!');
        fetchData();
        setNewCategoryName('');
        setCatDescription('');
        setCatSlug('');
        setCatMetaTitle('');
        setCatMetaDescription('');
        setCatColor('#ff6000');
        setCatIcon('Plus');
        setCatParentId('');
        setEditingCatId(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu');
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCatId(cat.id);
    setNewCategoryName(cat.name || '');
    setCatDescription(cat.description || '');
    setCatSlug(cat.slug || '');
    setCatMetaTitle(cat.metaTitle || '');
    setCatMetaDescription(cat.metaDescription || '');
    setCatColor(cat.color || '#ff6000');
    setCatIcon(cat.icon || 'Plus');
    setCatParentId(cat.parentId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorderCategories = async (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = categories.findIndex(c => c.id === active.id);
      const newIndex = categories.findIndex(c => c.id === over.id);
      const newArray = arrayMove(categories, oldIndex, newIndex);
      
      // Update order in Firestore
      try {
        const updates = newArray.map((cat: any, index) => 
          updateDoc(doc(db, 'categories', cat.id), { order: index })
        );
        await Promise.all(updates);
      } catch (error) {
        console.error("Error reordering categories:", error);
      }
    }
  };

  const handleBulkAction = async (action: 'delete' | 'draft' | 'publish') => {
    if (selectedArticles.length === 0) return;
    if (action === 'delete' && !confirm(`${selectedArticles.length} makaleyi silmek istediğinize emin misiniz?`)) return;

    try {
      const updates = selectedArticles.map(id => {
        if (action === 'delete') return deleteDoc(doc(db, 'articles', id));
        return updateDoc(doc(db, 'articles', id), { 
          status: action === 'draft' ? 'draft' : 'published',
          updatedAt: serverTimestamp()
        });
      });
      await Promise.all(updates);
      setSelectedArticles([]);
      alert('İşlem başarıyla tamamlandı!');
    } catch (error) {
      console.error("Bulk action error:", error);
    }
  };

  const handleExportArticles = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(articles, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "articles_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const categoryStats = useMemo(() => {
    const stats: { [key: string]: { count: number, views: number } } = {};
    articles.forEach(art => {
      if (!stats[art.category]) stats[art.category] = { count: 0, views: 0 };
      stats[art.category].count++;
      stats[art.category].views += (art.views || 0);
    });
    return stats;
  }, [articles]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSavePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const options = pollOptions.filter(o => o.trim() !== '').map(text => ({ text, votes: 0 }));
      const res = await fetch('/api/settings/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: pollQuestion, options })
      });
      if (res.ok) {
        alert('Anket güncellendi ve oylar sıfırlandı!');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Error saving poll:', error);
      alert('Anket kaydedilirken hata oluştu');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          siteName, siteLogo, footerAbout, newsletterText, facebookUrl, twitterUrl, instagramUrl, linkedinUrl,
          githubUrl, rssUrl, trendTags, contactEmail, contactLocation, showDeveloperSignature, footerCustomScript
        })
      });
      if (res.ok) {
        alert('Ayarlar kaydedildi!');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu');
    }
  };

  const handleSaveSeoSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ogImage, ogTitle, ogDescription, twitterCardType, noIndexGlobal, sitemapUrl, robotsTxt,
          googleSiteVerification, facebookPixelId, canonicalUrl, schemaSiteType, schemaLogo, autoWebp, preconnectUrls
        })
      });
      if (res.ok) {
        alert('SEO Ayarları kaydedildi!');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      alert('SEO Ayarları kaydedilirken hata oluştu');
    }
  };

  const handleAddRedirection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldUrl || !newUrl) return;
    try {
      const res = await fetch('/api/redirections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldUrl, newUrl })
      });
      if (res.ok) {
        setOldUrl(''); setNewUrl('');
        fetchData();
      }
    } catch (error) {
      console.error('Error adding redirection:', error);
    }
  };

  const handlePingSitemap = () => {
    alert(`Sitemap (${sitemapUrl}) Google'a pinglendi! (Simülasyon)`);
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/${collectionName}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Öğe silindi!');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Silme işlemi sırasında hata oluştu');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      // Refresh users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const cats = categories.length > 0 ? categories.map(c => c.name) : ['Donanım', 'Yapay Zeka', 'Mobil Dünya', 'Oyun', 'Siber Güvenlik', 'İnceleme', 'Rehber'];
      const sampleText = `Teknoloji dünyasında her geçen gün yeni bir gelişme yaşanıyor. İnovasyon hız kesmeden devam ederken, sektörün devleri kullanıcı deneyimini iyileştirmek için kıyasıya bir rekabet içinde. Uzmanlar, önümüzdeki yıllarda bu teknolojilerin hayatımızın ayrılmaz bir parçası olacağını öngörüyor. Özellikle yapay zeka, nesnelerin interneti (IoT) ve 5G bağlantı hızları sayesinde daha önce hayal bile edemediğimiz yenilikler gerçeğe dönüşüyor. Şirketler Ar-Ge yatırımlarını artırarak geleceğin pazarında söz sahibi olmak istiyor. Tüketiciler ise bu yeniliklerin günlük hayatlarını nasıl kolaylaştıracağını merakla bekliyor. Güvenlik ve gizlilik endişeleri devam etse de, teknolojik ilerlemenin getirdiği faydalar yadsınamaz bir gerçek olarak karşımızda duruyor. `;
      const longContent = Array(20).fill(sampleText).join('<br/><br/>');

      for (let i = 1; i <= 20; i++) {
        await addDoc(collection(db, 'articles'), {
          title: `SEO Uyumlu Teknoloji Haberi ${i}: Geleceğin Teknolojileri ve Sektörel Analizler`,
          image: `https://picsum.photos/seed/tech${i}/800/450`,
          category: cats[i % cats.length],
          date: `2 Nisan 2026`,
          author: 'TechDaily Editörü',
          isFeatured: false,
          isLarge: false,
          content: `<h2>Giriş</h2><p>${sampleText}</p><h2>Sektörel Gelişmeler</h2><p>${longContent}</p>`,
          createdAt: serverTimestamp()
        });
      }
      alert('20 adet SEO uyumlu haber başarıyla eklendi!');
    } catch (error) {
      console.error('Hata:', error);
      alert('Haberler eklenirken bir hata oluştu.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            {siteLogo && <img src={siteLogo} alt="Logo" className="h-10 w-auto object-contain" />}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Paneli</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.open(`/haber/${slug || editingId}`, '_blank')}
              className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-4 py-2 rounded transition-colors hover:bg-blue-200"
              title="Önizle"
            >
              <Eye size={18} />
              <span className="text-sm font-bold">Önizle</span>
            </button>
            <span className="text-gray-600 dark:text-gray-300">Hoş geldin, {user?.email}</span>
            <button onClick={logOut} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors">
              <LogOut size={18} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { id: 'articles', label: 'Haberler', icon: <FileText size={18} /> },
              { id: 'videos', label: 'Videolar', icon: <PlayCircle size={18} /> },
              { id: 'categories', label: 'Kategoriler', icon: <Plus size={18} /> },
              { id: 'poll', label: 'Anket', icon: <BarChart2 size={18} /> },
              { id: 'redirections', label: 'Yönlendirmeler', icon: <TrendingIcon size={18} /> },
              { id: 'settings', label: 'Ayarlar', icon: <SettingsIcon size={18} /> },
              { id: 'seo', label: 'SEO Ayarları', icon: <TrendingUp size={18} /> },
              { id: 'users', label: 'Kullanıcılar', icon: <Users size={18} /> }
            ].map((tab) => (
              (tab.id === 'users' || tab.id === 'settings' || tab.id === 'seo') && !isAdmin ? null : (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition-colors ${activeTab === tab.id ? 'bg-[#ff6000] text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              )
            ))}
          </div>
          
          {activeTab === 'articles' && (
            <button 
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              {isSeeding ? 'Ekleniyor...' : '20 Örnek Haber Üret'}
            </button>
          )}
        </div>

        <div className="max-w-6xl mx-auto pb-20">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <span className="text-xs font-bold text-green-500">+12%</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalArticles}</div>
                  <div className="text-sm text-gray-500">Toplam Makale</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-[#ff6000] rounded-xl">
                      <MessageSquare size={24} />
                    </div>
                    <span className="text-xs font-bold text-green-500">+5%</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalComments}</div>
                  <div className="text-sm text-gray-500">Toplam Yorum</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                      <Users size={24} />
                    </div>
                    <span className="text-xs font-bold text-green-500">+24%</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalSubscribers}</div>
                  <div className="text-sm text-gray-500">Bülten Abonesi</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                      <Eye size={24} />
                    </div>
                    <span className="text-xs font-bold text-red-500">-2%</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">12.4K</div>
                  <div className="text-sm text-gray-500">Günlük Ziyaretçi</div>
                </div>
              </div>

              {/* Top Articles & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">En Çok Okunan Haberler</h3>
                    <button onClick={() => setActiveTab('articles')} className="text-[#ff6000] text-sm font-bold hover:underline">Tümünü Gör</button>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stats.topArticles.length > 0 ? stats.topArticles.map((art, i) => (
                      <div key={art.id} className="p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="w-8 text-xl font-black text-gray-200 dark:text-gray-700">{i + 1}</div>
                        <img src={art.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{art.title}</div>
                          <div className="text-xs text-gray-500">{art.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{art.views || Math.floor(Math.random() * 5000) + 1000}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Okunma</div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-gray-500">Veri bulunmuyor.</div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setActiveTab('articles')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-center group">
                        <Plus className="mx-auto mb-2 text-[#ff6000] group-hover:scale-110 transition-transform" size={24} />
                        <span className="text-xs font-bold">Yeni Haber</span>
                      </button>
                      <button onClick={() => setActiveTab('videos')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-center group">
                        <PlayCircle className="mx-auto mb-2 text-[#ff6000] group-hover:scale-110 transition-transform" size={24} />
                        <span className="text-xs font-bold">Yeni Video</span>
                      </button>
                      <button onClick={() => setActiveTab('poll')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-center group">
                        <BarChart2 className="mx-auto mb-2 text-[#ff6000] group-hover:scale-110 transition-transform" size={24} />
                        <span className="text-xs font-bold">Yeni Anket</span>
                      </button>
                      <button onClick={() => setActiveTab('settings')} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-center group">
                        <SettingsIcon className="mx-auto mb-2 text-[#ff6000] group-hover:scale-110 transition-transform" size={24} />
                        <span className="text-xs font-bold">Ayarlar</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#ff6000] to-[#e55600] p-6 rounded-2xl text-white shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Sistem Durumu</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="opacity-80">Firestore</span>
                        <span className="font-bold">Aktif</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="opacity-80">Auth</span>
                        <span className="font-bold">Aktif</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="opacity-80">Storage</span>
                        <span className="font-bold">Aktif</span>
                      </div>
                      <div className="pt-2 border-t border-white/20">
                        <div className="text-[10px] uppercase font-bold opacity-60">Son Güncelleme</div>
                        <div className="text-xs font-bold">{new Date().toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ARTICLES & VIDEOS TABS */}
        {(activeTab === 'articles' || activeTab === 'videos') && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Haberi Düzenle' : `Yeni ${activeTab === 'articles' ? 'Haber' : 'Video'} Ekle`}
                  </h2>
                  {editingId && (
                    <button onClick={() => { setEditingId(null); setTitle(''); setImage(''); setCategory(''); setDate(''); setContent(''); setFocusKeyword(''); setSlug(''); setAltText(''); setSeoTitle(''); setSeoDescription(''); }} className="text-gray-500 hover:text-gray-700 text-sm">Düzenlemeyi İptal Et</button>
                  )}
                </div>

                {activeTab === 'articles' && (
                  <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={() => setActiveArticleTab('edit')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeArticleTab === 'edit' ? 'border-[#ff6000] text-[#ff6000]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Düzenle</button>
                    <button type="button" onClick={() => setActiveArticleTab('seo')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeArticleTab === 'seo' ? 'border-[#ff6000] text-[#ff6000]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>SEO & Önizleme</button>
                    <button type="button" onClick={() => setActiveArticleTab('advanced')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeArticleTab === 'advanced' ? 'border-[#ff6000] text-[#ff6000]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Gelişmiş</button>
                    {editingId && <button type="button" onClick={() => setActiveArticleTab('revisions')} className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeArticleTab === 'revisions' ? 'border-[#ff6000] text-[#ff6000]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Revizyonlar</button>}
                  </div>
                )}
              </div>
              
              <form onSubmit={activeTab === 'articles' ? handleAddArticle : handleAddVideo} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  {activeArticleTab === 'edit' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Başlık</label>
                          <div className="flex space-x-2">
                            <button type="button" onClick={() => handleAiAssist('suggestTitles')} className="text-[#ff6000] hover:bg-orange-50 p-1 rounded transition-colors" title="AI Başlık Öner">
                              <Wand2 size={16} />
                            </button>
                            <button type="button" onClick={() => setSlug(generateSlug(title))} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors font-bold">
                              Slug
                            </button>
                          </div>
                        </div>
                        <input type="text" placeholder="Başlık" required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Öne Çıkan Görsel</label>
                        <div 
                          className={`border-2 border-dashed rounded-xl p-4 transition-all ${isDragging ? 'border-[#ff6000] bg-orange-50 dark:bg-orange-900/10' : 'border-gray-300 dark:border-gray-700'}`}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onload = (event) => setImage(event.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        >
                          {image ? (
                            <div className="relative group aspect-video rounded-lg overflow-hidden">
                              <img src={image} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => setImage('')} className="bg-red-600 text-white p-2 rounded-full hover:scale-110 transition-transform">
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                <ImageIcon className="text-gray-400" size={24} />
                              </div>
                              <p className="text-sm text-gray-500">Görseli buraya sürükleyin veya URL yapıştırın</p>
                              <input 
                                type="text" 
                                placeholder="Görsel URL" 
                                value={image} 
                                onChange={e => setImage(e.target.value)} 
                                className="mt-4 w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white text-xs" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {activeTab === 'articles' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                            <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white">
                              <option value="" disabled>Kategori Seçin</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">İçerik</label>
                              <button 
                                type="button" 
                                onClick={() => handleAiAssist('fullContent')} 
                                disabled={isAiLoading}
                                className="flex items-center space-x-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-[#ff6000] px-3 py-1 rounded-full hover:bg-orange-200 transition-all font-bold"
                              >
                                <Sparkles size={12} />
                                <span>{isAiLoading ? 'Üretiliyor...' : 'AI ile İçerik Üret (1000 Karakter + FAQ)'}</span>
                              </button>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                              <ReactQuill 
                                theme="snow" 
                                value={content} 
                                onChange={setContent}
                                className="h-96 dark:text-white"
                                modules={{
                                  toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                    [{'list': 'ordered'}, {'list': 'bullet'}],
                                    ['link', 'image', 'code-block'],
                                    ['clean']
                                  ],
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === 'videos' && (
                        <input type="text" placeholder="Süre (örn: 15:24)" required value={duration} onChange={e => setDuration(e.target.value)} className="border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                      )}
                    </div>
                  )}

                  {activeArticleTab === 'seo' && (
                    <div className="space-y-6">
                      {/* SERP Preview */}
                      <div className="bg-white dark:bg-[#202124] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Google Arama Önizlemesi (SERP)</h3>
                        <div className="max-w-[600px]">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs">🌐</div>
                            <div className="flex flex-col">
                              <span className="text-sm text-[#202124] dark:text-[#dadce0] leading-tight">TechDaily Pulse</span>
                              <span className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-tight">https://techdaily.com/haber/{slug || 'url-yapisi'}</span>
                            </div>
                          </div>
                          <div className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 line-clamp-1">
                            {seoTitle || title || 'Makale Başlığı Burada Görünecek'}
                          </div>
                          <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
                            {seoDescription || 'Makalenizin SEO açıklaması burada görünecek. Dikkat çekici bir özet yazarak tıklanma oranını artırabilirsiniz.'}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">SEO Ayarları</h3>
                          <div className="flex space-x-2">
                            <button type="button" onClick={() => handleAiAssist('summarize')} disabled={isAiLoading} className="flex items-center space-x-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors font-bold">
                              <Sparkles size={12} /> <span>{isAiLoading ? '...' : 'AI ile Özetle'}</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Odak Anahtar Kelime</label>
                            <input type="text" placeholder="Örn: yapay zeka, teknoloji" value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                            <input type="text" placeholder="makale-basligi" value={slug} onChange={e => setSlug(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Görsel Alt Etiketi</label>
                            <input type="text" placeholder="Görseli tanımlayan kısa metin" value={altText} onChange={e => setAltText(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SEO Başlığı</label>
                            <input type="text" placeholder="Arama sonuçlarında görünecek başlık" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SEO Açıklaması</label>
                            <textarea placeholder="Arama sonuçlarında görünecek kısa özet" value={seoDescription} onChange={e => setSeoDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white h-24" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeArticleTab === 'advanced' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Yorumlar</h4>
                            <p className="text-xs text-gray-500">Bu makale için yorumları kapat.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setCommentsDisabled(!commentsDisabled)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${commentsDisabled ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${commentsDisabled ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">Öne Çıkar</h4>
                            <p className="text-xs text-gray-500">Ana sayfada öne çıkanlar bölümünde göster.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIsFeatured(!isFeatured)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${isFeatured ? 'bg-[#ff6000]' : 'bg-gray-300 dark:bg-gray-600'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isFeatured ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">Okuma Süresi (Dakika)</label>
                          <input 
                            type="number" 
                            placeholder="Otomatik hesaplanır (Boş bırakın)" 
                            value={readingTimeOverride} 
                            onChange={e => setReadingTimeOverride(e.target.value)} 
                            className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeArticleTab === 'revisions' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">İçerik Geçmişi</h3>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        {revisions.length > 0 ? (
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {revisions.map((rev, idx) => (
                              <div key={rev.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div>
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">Versiyon {revisions.length - idx}</div>
                                  <div className="text-xs text-gray-500">
                                    {rev.updatedAt?.toDate ? format(rev.updatedAt.toDate(), 'dd MMM yyyy, HH:mm') : 'Bilinmiyor'} - {rev.author}
                                  </div>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    if (confirm('Bu versiyona geri dönmek istediğinize emin misiniz? Mevcut içerik değişecektir.')) {
                                      setContent(rev.content);
                                      setTitle(rev.title);
                                      setActiveArticleTab('edit');
                                    }
                                  }}
                                  className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-bold"
                                >
                                  Geri Yükle
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            Henüz kayıtlı bir revizyon bulunmuyor.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-4">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center"><Save size={16} className="mr-2" /> Yayınla</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Durum</label>
                      <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800 text-sm">
                        <option value="draft">Taslak</option>
                        <option value="pending">İnceleme Bekliyor</option>
                        <option value="published">Yayınlandı</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yayınlanma Tarihi</label>
                      <input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-white dark:bg-gray-800 text-sm" />
                    </div>

                    <button type="submit" className="w-full bg-[#ff6000] hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Save size={18} />
                      <span>{editingId ? 'Güncelle' : 'Kaydet'}</span>
                    </button>
                  </div>

                  {activeTab === 'articles' && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-4">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center"><TrendingIcon size={16} className="mr-2" /> SEO Puanı</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Genel Puan</span>
                          <span className={`font-bold ${seoScore.total >= 4 ? 'text-green-500' : 'text-orange-500'}`}>{seoScore.total} / {seoScore.max}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${seoScore.total >= 4 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${(seoScore.total / seoScore.max) * 100}%` }} />
                        </div>
                        
                        <ul className="space-y-1 pt-2">
                          <li className="flex items-center text-[10px]">
                            {seoScore.keywordInTitle ? <CheckCircle2 size={12} className="text-green-500 mr-2" /> : <AlertCircle size={12} className="text-gray-400 mr-2" />}
                            <span className={seoScore.keywordInTitle ? 'text-green-600' : 'text-gray-500'}>Başlıkta anahtar kelime</span>
                          </li>
                          <li className="flex items-center text-[10px]">
                            {seoScore.wordCount ? <CheckCircle2 size={12} className="text-green-500 mr-2" /> : <AlertCircle size={12} className="text-gray-400 mr-2" />}
                            <span className={seoScore.wordCount ? 'text-green-600' : 'text-gray-500'}>En az 300 kelime</span>
                          </li>
                          <li className="flex items-center text-[10px]">
                            {seoScore.hasImage ? <CheckCircle2 size={12} className="text-green-500 mr-2" /> : <AlertCircle size={12} className="text-gray-400 mr-2" />}
                            <span className={seoScore.hasImage ? 'text-green-600' : 'text-gray-500'}>Görsel kullanımı</span>
                          </li>
                          <li className="flex items-center text-[10px]">
                            {seoScore.descriptionLength ? <CheckCircle2 size={12} className="text-green-500 mr-2" /> : <AlertCircle size={12} className="text-gray-400 mr-2" />}
                            <span className={seoScore.descriptionLength ? 'text-green-600' : 'text-gray-500'}>Açıklama uzunluğu (120-160)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center"><Sparkles size={16} className="mr-2" /> AI Asistanı</h3>
                    <button type="button" onClick={() => handleAiAssist('prompt')} disabled={isAiLoading} className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <Eye size={14} className="mr-2" /> Görsel Promptu Üret
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-[300px]">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Haber başlığı veya içerik ara..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#ff6000] outline-none transition-all" 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-400" />
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[#ff6000]">
                      <option value="">Tüm Kategoriler</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[#ff6000]">
                      <option value="">Tüm Durumlar</option>
                      <option value="published">Yayında</option>
                      <option value="draft">Taslak</option>
                      <option value="pending">İncelemede</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button onClick={handleExportArticles} className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 transition-colors text-sm font-bold">
                    <Download size={18} />
                    <span>Dışa Aktar</span>
                  </button>
                  <button onClick={handleSeedData} className="flex items-center space-x-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-bold">
                    <Plus size={18} />
                    <span>Örnek Veri</span>
                  </button>
                </div>
              </div>

              {selectedArticles.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-3 border-b border-orange-100 dark:border-orange-900/30 flex items-center justify-between animate-in slide-in-from-top duration-300">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{selectedArticles.length} makale seçildi</span>
                    <div className="h-4 w-px bg-orange-200 dark:bg-orange-800" />
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleBulkAction('publish')} className="text-xs font-bold bg-white dark:bg-gray-800 text-green-600 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-900/30 hover:bg-green-50 transition-colors">Yayınla</button>
                      <button onClick={() => handleBulkAction('draft')} className="text-xs font-bold bg-white dark:bg-gray-800 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors">Taslağa Çek</button>
                      <button onClick={() => handleBulkAction('delete')} className="text-xs font-bold bg-white dark:bg-gray-800 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 transition-colors">Sil</button>
                    </div>
                  </div>
                  <button onClick={() => setSelectedArticles([])} className="text-xs font-bold text-orange-600 hover:underline">Seçimi Temizle</button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                      <th className="p-4 w-10">
                        <button 
                          onClick={() => {
                            const filteredIds = articles
                              .filter(item => {
                                const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
                                const matchesCategory = !filterCategory || item.category === filterCategory;
                                const matchesStatus = !filterStatus || item.status === filterStatus;
                                return matchesSearch && matchesCategory && matchesStatus;
                              })
                              .map(a => a.id);
                            
                            if (selectedArticles.length === filteredIds.length) setSelectedArticles([]);
                            else setSelectedArticles(filteredIds);
                          }}
                          className="text-gray-400 hover:text-[#ff6000] transition-colors"
                        >
                          {selectedArticles.length > 0 ? <CheckSquare size={20} className="text-[#ff6000]" /> : <Square size={20} />}
                        </button>
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Haber</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Yazar</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trend</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(() => {
                      const filteredItems = (activeTab === 'articles' ? articles : videos)
                        .filter(item => {
                          const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesCategory = !filterCategory || item.category === filterCategory;
                          const matchesStatus = !filterStatus || item.status === filterStatus;
                          return matchesSearch && matchesCategory && matchesStatus;
                        });

                      if (filteredItems.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="p-12 text-center">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                  <Search size={32} />
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">Sonuç Bulunamadı</div>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">Arama kriterlerinize uygun makale bulunamadı. Lütfen farklı kelimeler deneyin.</p>
                                <button onClick={() => { setSearchTerm(''); setFilterCategory(''); setFilterStatus(''); }} className="text-[#ff6000] font-bold text-sm hover:underline">Filtreleri Temizle</button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return filteredItems.map(item => (
                        <tr key={item.id} className={cn(
                          "group hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all duration-200",
                          selectedArticles.includes(item.id) && "bg-orange-50/30 dark:bg-orange-900/10"
                        )}>
                          <td className="p-4">
                            <button 
                              onClick={() => {
                                if (selectedArticles.includes(item.id)) setSelectedArticles(prev => prev.filter(id => id !== item.id));
                                else setSelectedArticles(prev => [...prev, item.id]);
                              }}
                              className="text-gray-300 group-hover:text-gray-400 transition-colors"
                            >
                              {selectedArticles.includes(item.id) ? <CheckSquare size={20} className="text-[#ff6000]" /> : <Square size={20} />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className="relative flex-shrink-0">
                                <img src={item.image} alt={item.title} className="w-20 h-12 object-cover rounded-lg shadow-sm" />
                                {item.isFeatured && (
                                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-sm">
                                    <Sparkles size={10} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#ff6000] transition-colors">{item.title}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{item.category}</span>
                                  <span className="text-gray-300 dark:text-gray-600">•</span>
                                  <span className="text-[10px] text-gray-400">{item.createdAt?.toDate ? format(item.createdAt.toDate(), 'dd.MM.yyyy') : 'Yeni'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col space-y-1">
                              <span className={cn(
                                "text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg w-fit",
                                item.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                item.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                              )}>
                                {item.status === 'published' ? 'Yayında' : item.status === 'pending' ? 'İncelemede' : 'Taslak'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                {item.author?.substring(0, 2).toUpperCase() || 'AD'}
                              </div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.author || 'Admin'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.views || 0}</span>
                                <div className="flex items-center text-[10px] text-green-500 font-bold">
                                  <TrendingUp size={10} className="mr-0.5" />
                                  <span>+12%</span>
                                </div>
                              </div>
                              {/* Sparkline Placeholder */}
                              <div className="flex items-end space-x-0.5 h-6">
                                {[4, 7, 5, 9, 6, 8, 10].map((h, i) => (
                                  <div key={i} className="w-1 bg-blue-400/30 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a href={`/haber/${item.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" title="Görüntüle">
                                <Eye size={18} />
                              </a>
                              <button onClick={() => handleEdit(item)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors" title="Düzenle">
                                <Edit3 size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  const newStatus = item.status === 'published' ? 'draft' : 'published';
                                  updateDoc(doc(db, 'articles', item.id), { status: newStatus, updatedAt: serverTimestamp() });
                                }} 
                                className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2 rounded-lg transition-colors" 
                                title={item.status === 'published' ? 'Taslağa Çek' : 'Yayınla'}
                              >
                                {item.status === 'published' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                              </button>
                              <button onClick={() => handleDelete(activeTab, item.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="Sil">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  {editingCatId ? <Edit3 className="mr-2 text-blue-500" size={20} /> : <Plus className="mr-2 text-[#ff6000]" size={20} />}
                  {editingCatId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                </h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori Adı</label>
                    <input 
                      type="text" 
                      placeholder="Örn: Yazılım" 
                      required 
                      value={newCategoryName} 
                      onChange={e => {
                        setNewCategoryName(e.target.value);
                        if (!editingCatId) setCatSlug(generateSlug(e.target.value));
                      }} 
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 bg-transparent dark:text-white focus:ring-2 focus:ring-[#ff6000] outline-none transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL Slug</label>
                    <input type="text" placeholder="yazilim" value={catSlug} onChange={e => setCatSlug(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 bg-transparent dark:text-white text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Üst Kategori</label>
                    <select value={catParentId} onChange={e => setCatParentId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 bg-transparent dark:text-white text-sm">
                      <option value="">Yok (Ana Kategori)</option>
                      {categories.filter(c => c.id !== editingCatId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center"><Palette size={12} className="mr-1" /> Renk</label>
                      <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border-none p-0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center"><Type size={12} className="mr-1" /> İkon</label>
                      <select value={catIcon} onChange={e => setCatIcon(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-transparent dark:text-white text-sm">
                        <option value="Plus">Artı</option>
                        <option value="Code">Kod</option>
                        <option value="Smartphone">Telefon</option>
                        <option value="Cpu">Donanım</option>
                        <option value="Gamepad">Oyun</option>
                        <option value="Shield">Güvenlik</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label>
                    <textarea placeholder="Kategori sayfasında görünecek açıklama..." value={catDescription} onChange={e => setCatDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 bg-transparent dark:text-white text-sm h-24" />
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">SEO Ayarları</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Başlık</label>
                      <input type="text" placeholder="Google'da görünecek başlık" value={catMetaTitle} onChange={e => setCatMetaTitle(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 bg-transparent dark:text-white text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Açıklama</label>
                      <textarea placeholder="Google'da görünecek açıklama" value={catMetaDescription} onChange={e => setCatMetaDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 bg-transparent dark:text-white text-sm h-20" />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button type="submit" className="flex-1 bg-[#ff6000] hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20">
                      {editingCatId ? 'Güncelle' : 'Kategori Ekle'}
                    </button>
                    {editingCatId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingCatId(null);
                          setNewCategoryName('');
                          setCatDescription('');
                          setCatSlug('');
                          setCatMetaTitle('');
                          setCatMetaDescription('');
                          setCatColor('#ff6000');
                          setCatIcon('Plus');
                          setCatParentId('');
                        }} 
                        className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        İptal
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mevcut Kategoriler</h2>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sıralamak için sürükleyin</div>
                </div>
                
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleReorderCategories}
                >
                  <SortableContext 
                    items={categories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <SortableCategoryItem 
                          key={cat.id} 
                          cat={cat} 
                          categoryStats={categoryStats}
                          handleEditCategory={handleEditCategory}
                          handleDelete={handleDelete}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">Henüz kategori eklenmemiş.</div>
                    )}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        )}

        {/* POLL TAB */}
        {activeTab === 'poll' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Haftanın Anketi</h2>
            <form onSubmit={handleSavePoll} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soru</label>
                <input type="text" required value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seçenekler (Boş bırakılanlar gösterilmez)</label>
                {pollOptions.map((opt, i) => (
                  <input key={i} type="text" placeholder={`Seçenek ${i+1}`} value={opt} onChange={e => {
                    const newOpts = [...pollOptions];
                    newOpts[i] = e.target.value;
                    setPollOptions(newOpts);
                  }} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white mb-2" />
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center space-x-2 bg-[#ff6000] hover:bg-orange-600 text-white px-6 py-2 rounded transition-colors">
                  <Save size={18} /> <span>Kaydet ve Oyları Sıfırla</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Genel Ayarlar</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Adı</label>
                <input type="text" required value={siteName} onChange={e => setSiteName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Logo URL</label>
                <input type="url" value={siteLogo} onChange={e => setSiteLogo(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Footer Hakkımızda Yazısı</label>
                <textarea required value={footerAbout} onChange={e => setFooterAbout(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white h-24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bülten Açıklaması</label>
                <textarea required value={newsletterText} onChange={e => setNewsletterText(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white h-16" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                <input type="url" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter URL</label>
                <input type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                <input type="url" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RSS URL</label>
                <input type="url" value={rssUrl} onChange={e => setRssUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trend Etiketler (Virgülle ayırın, örn: #AI, #Web3)</label>
                <input type="text" value={trendTags} onChange={e => setTrendTags(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İletişim E-posta</label>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasyon</label>
                  <input type="text" value={contactLocation} onChange={e => setContactLocation(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <input type="checkbox" id="showDeveloperSignature" checked={showDeveloperSignature} onChange={e => setShowDeveloperSignature(e.target.checked)} className="w-5 h-5 text-[#ff6000] rounded focus:ring-[#ff6000]" />
                <label htmlFor="showDeveloperSignature" className="text-sm font-medium text-gray-700 dark:text-gray-300">Geliştirici İmzasını Göster ("Powered by...")</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Footer Özel Script Alanı (Örn: Reklam/İzleme Kodları)</label>
                <textarea value={footerCustomScript} onChange={e => setFooterCustomScript(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white h-24 font-mono text-sm" placeholder="<script>...</script>" />
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="flex items-center space-x-2 bg-[#ff6000] hover:bg-orange-600 text-white px-6 py-2 rounded transition-colors">
                  <Save size={18} /> <span>Ayarları Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEO SETTINGS TAB */}
        {activeTab === 'seo' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">SEO ve Performans Ayarları</h2>
            <form onSubmit={handleSaveSeoSettings} className="space-y-4">
              
              {/* Section 1: Open Graph */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSeoAccordion('og')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">1. Sosyal Medya ve Paylaşım (Open Graph)</h3>
                  {seoAccordion.og ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                {seoAccordion.og && (
                  <div className="p-4 space-y-6">
                    {/* Google Snippet Preview */}
                    <div className="bg-white dark:bg-[#202124] p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Google Arama Önizlemesi</h4>
                      <div className="font-sans">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs">🌐</div>
                          <div>
                            <div className="text-sm text-[#202124] dark:text-[#dadce0] leading-tight">{siteName || 'Site Adı'}</div>
                            <div className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-tight">{canonicalUrl || 'https://site.com'}</div>
                          </div>
                        </div>
                        <div className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 truncate">
                          {ogTitle || siteName || 'Sayfa Başlığı'}
                        </div>
                        <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                          {ogDescription || 'Sayfa açıklaması burada görünecek. Arama motorları bu metni kullanarak kullanıcılara sayfanızın içeriği hakkında bilgi verir.'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG Image URL (Varsayılan Paylaşım Görseli 1200x630px)</label>
                        <input type="url" value={ogImage} onChange={e => setOgImage(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG Title</label>
                        <input type="text" value={ogTitle} onChange={e => setOgTitle(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter Card Type</label>
                        <select value={twitterCardType} onChange={e => setTwitterCardType(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white">
                          <option value="summary">Summary (Küçük Görsel)</option>
                          <option value="summary_large_image">Summary Large Image (Büyük Görsel)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OG Description</label>
                        <textarea value={ogDescription} onChange={e => setOgDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white h-20" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Indexing */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSeoAccordion('indexing')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">2. İndeksleme Kontrolleri (Robots & Sitemap)</h3>
                  {seoAccordion.indexing ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                {seoAccordion.indexing && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <input type="checkbox" id="noIndexGlobal" checked={noIndexGlobal} onChange={e => setNoIndexGlobal(e.target.checked)} className="w-5 h-5 text-[#ff6000] rounded focus:ring-[#ff6000]" />
                      <label htmlFor="noIndexGlobal" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tüm Siteyi İndekse Kapat (No-Index / No-Follow)</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sitemap.xml URL</label>
                          <input type="url" value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="https://site.com/sitemap.xml" />
                        </div>
                        <button type="button" onClick={handlePingSitemap} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors whitespace-nowrap">
                          Ping At
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Robots.txt Düzenleyici</label>
                        <textarea value={robotsTxt} onChange={e => setRobotsTxt(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white h-32 font-mono text-sm" placeholder="User-agent: *&#10;Allow: /" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Tech SEO & Tracking */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSeoAccordion('tech')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">3. Teknik SEO ve Takip Kodları</h3>
                  {seoAccordion.tech ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                {seoAccordion.tech && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Console Doğrulama (HTML Tag)</label>
                      <input type="text" value={googleSiteVerification} onChange={e => setGoogleSiteVerification(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="<meta name='google-site-verification' content='...' />" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook Pixel ID</label>
                      <input type="text" value={facebookPixelId} onChange={e => setFacebookPixelId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="1234567890" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Varsayılan Canonical URL</label>
                      <input type="url" value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="https://site.com" />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Schema */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSeoAccordion('schema')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">4. Şema Verileri (Schema Markup / JSON-LD)</h3>
                  {seoAccordion.schema ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                {seoAccordion.schema && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Tipi</label>
                      <select value={schemaSiteType} onChange={e => setSchemaSiteType(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white">
                        <option value="Organization">Organization (Kuruluş)</option>
                        <option value="NewsMediaOrganization">NewsMediaOrganization (Haber Kuruluşu)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL (Kare)</label>
                      <input type="url" value={schemaLogo} onChange={e => setSchemaLogo(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="https://..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Performance */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSeoAccordion('perf')} className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">5. Performans SEO (Web Vitals)</h3>
                  {seoAccordion.perf ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </button>
                {seoAccordion.perf && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <input type="checkbox" id="autoWebp" checked={autoWebp} onChange={e => setAutoWebp(e.target.checked)} className="w-5 h-5 text-[#ff6000] rounded focus:ring-[#ff6000]" />
                      <label htmlFor="autoWebp" className="text-sm font-medium text-gray-700 dark:text-gray-300">Görselleri Otomatik WebP'ye Çevir (Simülasyon)</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preconnect/Prefetch URL'leri (Her satıra bir URL)</label>
                      <textarea value={preconnectUrls} onChange={e => setPreconnectUrls(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white h-24 font-mono text-sm" placeholder="https://fonts.googleapis.com&#10;https://api.example.com" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button type="submit" className="flex items-center space-x-2 bg-[#ff6000] hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                  <Save size={20} /> <span>SEO Ayarlarını Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* REDIRECTIONS TAB */}
        {activeTab === 'redirections' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yeni Yönlendirme (301)</h2>
              <form onSubmit={handleAddRedirection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eski URL Yolu</label>
                  <input type="text" required value={oldUrl} onChange={e => setOldUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="/eski-haber-linki" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yeni URL Yolu</label>
                  <input type="text" required value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-transparent dark:text-white" placeholder="/yeni-haber-linki" />
                </div>
                <button type="submit" className="w-full flex justify-center items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
                  <Plus size={18} /> <span>Yönlendirme Ekle</span>
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Aktif Yönlendirmeler</h2>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="p-4 text-gray-900 dark:text-white font-semibold">Eski URL</th>
                    <th className="p-4 text-gray-900 dark:text-white font-semibold">Yeni URL</th>
                    <th className="p-4 text-gray-900 dark:text-white font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {redirections.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">Henüz yönlendirme eklenmemiş.</td>
                    </tr>
                  ) : (
                    redirections.map(red => (
                      <tr key={red.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 text-gray-800 dark:text-gray-200 font-medium break-all">{red.oldUrl}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400 break-all">{red.newUrl}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete('redirections', red.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <th className="p-4 text-gray-900 dark:text-white font-semibold">Kullanıcı</th>
                  <th className="p-4 text-gray-900 dark:text-white font-semibold">E-posta</th>
                  <th className="p-4 text-gray-900 dark:text-white font-semibold">Rol</th>
                  <th className="p-4 text-gray-900 dark:text-white font-semibold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{u.displayName || 'İsimsiz'}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="p-4">
                      <select 
                        value={u.role} 
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editör</option>
                        <option value="author">Yazar</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete('users', u.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
