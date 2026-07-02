import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, FileText, Plus, TrendingUp, 
  AlertTriangle, DollarSign, Truck, ArrowUpRight, ArrowDownRight,
  Trash2, Edit3, Search, Download, Sparkles, MessageSquare, 
  Loader2, Send, BookOpen, X, RefreshCw, Users, Calendar, 
  ChevronLeft, ChevronRight, BarChart3, PieChart, Target, 
  Share2, Megaphone, Database, Globe, CheckCircle2, Menu,
  Layers, ShoppingBag, Wallet, Star, Video, Lightbulb, Handshake,
  FileUp, ClipboardList, Filter, FileSpreadsheet, Info, Briefcase
} from 'lucide-react';

// Firebase Imports (safe check)
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, query, setDoc, getDocs, writeBatch 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

// --- CONFIGURAÇÃO FIREBASE COM SELEÇÃO DE MODO ---
let app = null;
let auth = null;
let db = null;
let isDemoMode = false;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'paz-bookstore-v3-final';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    isDemoMode = true;
  }
} catch (e) {
  isDemoMode = true;
  console.log("Modo de Portfólio Ativo: Sem ligação ao banco de dados de produção.");
}

// --- DADOS FICTÍCIOS DE DEMONSTRAÇÃO (RECRUTADOR) ---
const MOCK_PRODUCTS = [
  { id: 'p1', name: "1984 - George Orwell", author: "George Orwell", isbn: "9788535914849", supplier: "Editora Companhia das Letras", stock: 12, cost: 15.00, price: 39.90, category: "Livros", type: "Próprio", sku: "LIV-1984" },
  { id: 'p2', name: "O Senhor dos Anéis (Volume Único)", author: "J.R.R. Tolkien", isbn: "9788595086357", supplier: "HarperCollins", stock: 3, cost: 45.00, price: 119.90, category: "Livros", type: "Próprio", sku: "LIV-SDA" },
  { id: 'p3', name: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", isbn: "9788522031429", supplier: "Editora Harper", stock: 25, cost: 8.00, price: 24.90, category: "Livros", type: "Consignado", deadline: "2026-12-15", returnStatus: "Pendente", sku: "LIV-PEQ" },
  { id: 'p4', name: "Caderno de Couro Artesanal Paz", author: "Artesanal", isbn: "85002001", supplier: "Oficina Paz", stock: 8, cost: 12.00, price: 35.00, category: "Acessórios", type: "Próprio", sku: "ACE-CAD" },
  { id: 'p5', name: "Mulheres que Correm com os Lobos", author: "Clarissa Pinkola Estés", isbn: "9788532525369", supplier: "Editora Rocco", stock: 1, cost: 25.00, price: 64.90, category: "Livros", type: "Consignado", deadline: "2026-08-30", returnStatus: "Pendente", sku: "LIV-LOBOS" }
];

const MOCK_SALES = [
  { id: 's1', productId: 'p1', productName: "1984 - George Orwell", qty: 2, price: 39.90, cost: 15.00, date: new Date().toISOString(), payment: "Pix", type: "Livros" },
  { id: 's2', productId: 'p3', productName: "O Pequeno Príncipe", qty: 1, price: 24.90, cost: 8.00, date: new Date(Date.now() - 24*60*60*1000).toISOString(), payment: "Cartão", type: "Livros" },
  { id: 's3', productId: 'p4', productName: "Caderno de Couro Artesanal Paz", qty: 1, price: 35.00, cost: 12.00, date: new Date(Date.now() - 48*60*60*1000).toISOString(), payment: "Dinheiro", type: "Acessórios" }
];

const MARKETING_CALENDAR = {
  0: { event: "Volta às Aulas", products: "Planners, Cadernos", video: "Tour pelos planners", salesTip: "Packs de Produtividade." },
  1: { event: "Dia dos Namorados & Romance", products: "Romances, Poesia", video: "Melhores livros para chorar", salesTip: "Marcador de oferta." },
  2: { event: "Dia da Mulher", products: "Biografias Femininas", video: "Homenagem a autoras", salesTip: "Semana 'Autoras Inspiradoras'." },
  3: { event: "Dia Mundial do Livro", products: "Clássicos, Lançamentos", video: "Minha estante dos sonhos", salesTip: "Sorteio de box literário." },
  4: { event: "Dia das Mães", products: "Culinária, Crónicas", video: "Leituras que minha mãe amou", salesTip: "Embalagem de oferta grátis." },
  5: { event: "Namorados BR", products: "Romances contemporâneos", video: "Blind Date with a Book", salesTip: "Combo romântico." },
  6: { event: "Férias de Julho", products: "Sagas de Fantasia", video: "Desafio 24h de leitura", salesTip: "Promoção livros de bolso." },
  7: { event: "Dia dos Pais", products: "Biografias, Suspense", video: "Livros perfeitos para pais", salesTip: "Compre 2 leve 3." },
  8: { event: "Primavera Literária", products: "Poesia, Nacionais", video: "Recomendações leves de primavera", salesTip: "Feira do livro usado." },
  9: { event: "Halloween / Terror", products: "Suspense, Stephen King", video: "Leituras arrepiantes com vela", salesTip: "Brinde doce literário." },
  10: { event: "Black Friday", products: "Box de livros completos", video: "Guia de promoções imperdíveis", salesTip: "Acesso antecipado WhatsApp." },
  11: { event: "Natal e Amigo Secreto", products: "Destaques do ano, Capa Dura", video: "Wrap with me (embrulhando livros)", salesTip: "Kits prontos para presente." }
};

// --- COMPONENTES DE UI ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2rem] border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, colorClass, trend }) => (
  <Card className="p-6 transition-all hover:shadow-xl hover:-translate-y-1 border-b-4" style={{ borderBottomColor: trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#3b82f6' }}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>
        <Icon size={24} className={colorClass} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-black p-1.5 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </span>
      )}
    </div>
    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-3xl font-black text-slate-950 tracking-tighter">{value}</h3>
  </Card>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dados dinâmicos de estado (começam com Mock se não houver Firebase)
  const [products, setProducts] = useState(isDemoMode ? MOCK_PRODUCTS : []);
  const [sales, setSales] = useState(isDemoMode ? MOCK_SALES : []);
  const [loading, setLoading] = useState(!isDemoMode);
  
  const [isAuthReady, setIsAuthReady] = useState(isDemoMode);
  const [syncError, setSyncError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Pesquisa Dinâmica
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("all");

  // Modais
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Pricing
  const [modalCost, setModalCost] = useState(0);
  const [modalMarkup, setModalMarkup] = useState(100); 
  const [modalPrice, setModalPrice] = useState(0);

  // IA
  const [aiInsight, setAiInsight] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // --- AUTENTICAÇÃO REAL (SÓ SE NÃO FOR MODO DEMO) ---
  useEffect(() => {
    if (isDemoMode) {
      setUser({ uid: 'recrutador_temp', email: 'recrutador@lumina.com' });
      setIsAuthReady(true);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const initAuth = async () => {
      try {
        if (isMounted) setSyncError(null);
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        if (isMounted) setSyncError("Modo de Portfólio Offline ativado por questões de segurança.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        if (currentUser) setIsAuthReady(true);
      }
    });
    return () => { isMounted = false; unsubscribe(); };
  }, []);

  // --- SINCRONIZAÇÃO REAL (SÓ SE NÃO FOR MODO DEMO) ---
  useEffect(() => {
    if (isDemoMode || !user || !isAuthReady) return;
    setLoading(true);

    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      const prodsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prodsData);
      setLoading(false);
    }, (err) => {
      console.log("Fallback para modo portfólio:", err);
    });

    const salesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sales');
    const unsubSales = onSnapshot(salesRef, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(salesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    });

    return () => { unsubProducts(); unsubSales(); };
  }, [user, isAuthReady]);

  // Pricing Sync
  useEffect(() => {
    if (editingProduct) {
      setModalCost(editingProduct.cost || 0);
      setModalPrice(editingProduct.price || 0);
      const m = editingProduct.cost > 0 ? ((editingProduct.price - editingProduct.cost) / editingProduct.cost) * 100 : 100;
      setModalMarkup(parseFloat(m.toFixed(2)));
    } else {
      setModalCost(0);
      setModalPrice(0);
      setModalMarkup(100);
    }
  }, [editingProduct, showProductModal]);

  // --- LÓGICA DE PESQUISA ---
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => {
      const matchName = p.name?.toLowerCase().includes(term);
      const matchAuthor = p.author?.toLowerCase().includes(term);
      const matchIsbn = p.isbn?.toLowerCase().includes(term);
      const matchSupplier = p.supplier?.toLowerCase().includes(term);
      
      if (searchCriteria === 'name') return matchName;
      if (searchCriteria === 'author') return matchAuthor;
      if (searchCriteria === 'isbn') return matchIsbn;
      if (searchCriteria === 'supplier') return matchSupplier;
      return matchName || matchAuthor || matchIsbn || matchSupplier;
    });
  }, [products, searchTerm, searchCriteria]);

  // --- CÁLCULOS FINANCEIROS ---
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === selectedDate.getMonth() && 
             saleDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [sales, selectedDate]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, sale) => acc + (Number(sale.price) * Number(sale.qty)), 0);
    const totalCost = filteredSales.reduce((acc, sale) => acc + (Number(sale.cost) * Number(sale.qty)), 0);
    const totalProfit = totalRevenue - totalCost;
    const lowStockCount = products.filter(p => p.stock <= 5).length;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    return { totalRevenue, totalProfit, totalCost, lowStockCount, margin };
  }, [filteredSales, products]);

  // --- GESTÃO DE CONSIGNADOS ---
  const consignData = useMemo(() => {
    const consignProducts = products.filter(p => p.type === 'Consignado');
    let totalToPay = 0;
    let totalStockReturnVal = 0;
    const items = consignProducts.map(p => {
      const unitsSold = sales.filter(s => s.productId === p.id).reduce((acc, s) => acc + s.qty, 0);
      const toPay = unitsSold * p.cost;
      const stockValue = p.stock * p.cost;
      totalToPay += toPay;
      totalStockReturnVal += stockValue;
      return { ...p, unitsSold, toPay, stockValue };
    });
    return { items, totalToPay, totalStockReturnVal };
  }, [products, sales]);

  // --- IMPORT/EXPORT CSV ---
  const exportToCSV = () => {
    if (products.length === 0) return;
    const headers = ["Nome", "Autor", "ISBN", "Fornecedor", "Stock", "Custo", "Preco", "Categoria", "Tipo", "Data Limite"];
    const rows = products.map(p => [
      p.name, p.author || "", p.isbn || "", p.supplier || "", p.stock, p.cost, p.price, p.category, p.type, p.deadline || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_paz_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBulkData = async (jsonText) => {
    setIsProcessing(true);
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) throw new Error("Formato inválido.");
      
      if (isDemoMode) {
        // Modo offline: simulação local para o recrutador testar
        const updatedProducts = [...products];
        data.forEach(item => {
          const idx = updatedProducts.findIndex(p => p.sku === item.sku || p.isbn === item.isbn);
          if (idx !== -1) {
            updatedProducts[idx] = { ...updatedProducts[idx], ...item };
          } else {
            updatedProducts.push({
              id: `p-${Math.random()}`,
              name: item.name,
              author: item.author || "Desconhecido",
              isbn: item.isbn || "S/N",
              supplier: item.supplier || "",
              deadline: item.deadline || "",
              stock: Number(item.stock) || 0,
              price: Number(item.price) || 0,
              cost: Number(item.cost) || 0,
              category: item.category || 'Livros',
              type: item.type || 'Próprio'
            });
          }
        });
        setProducts(updatedProducts);
        setShowImportModal(false);
        return;
      }

      // Modo online: Realiza batch no Firebase
      const batch = writeBatch(db);
      data.forEach(item => {
        const existing = products.find(p => p.sku === item.sku || (p.isbn && p.isbn === item.isbn));
        if (existing) {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', existing.id);
          batch.update(docRef, { 
            stock: Number(item.stock) || existing.stock, 
            price: Number(item.price) || existing.price, 
            cost: Number(item.cost) || existing.cost,
            supplier: item.supplier || existing.supplier || "",
            deadline: item.deadline || existing.deadline || ""
          });
        } else {
          const docRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
          batch.set(docRef, { 
            name: item.name, 
            author: item.author || "",
            isbn: item.isbn || "",
            supplier: item.supplier || "",
            deadline: item.deadline || "",
            returnStatus: "Pendente",
            sku: item.sku || `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            stock: Number(item.stock) || 0, 
            price: Number(item.price) || 0, 
            cost: Number(item.cost) || 0,
            category: item.category || 'Geral',
            type: item.type || 'Próprio',
            createdAt: new Date().toISOString()
          });
        }
      });
      await batch.commit();
      setShowImportModal(false);
    } catch (err) {
      setSyncError("Erro de importação. Verifique a sintaxe JSON.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ACTIONS ---
  const registerSale = async (saleData) => {
    const product = products.find(p => p.id === saleData.productId);
    if (!product || product.stock < saleData.qty) return;

    if (isDemoMode) {
      const newSale = {
        id: `s-${Math.random()}`,
        productId: product.id,
        productName: product.name,
        qty: Number(saleData.qty),
        price: Number(product.price),
        cost: Number(product.cost),
        date: new Date().toISOString(),
        payment: saleData.payment,
        type: product.category
      };
      setSales([newSale, ...sales]);
      setProducts(products.map(p => p.id === product.id ? { ...p, stock: p.stock - saleData.qty } : p));
      setShowSaleModal(false);
      return;
    }

    setIsProcessing(true);
    try {
      const salesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sales');
      await addDoc(salesRef, {
        productId: product.id, productName: product.name,
        qty: Number(saleData.qty), price: Number(product.price), cost: Number(product.cost),
        date: new Date().toISOString(), payment: saleData.payment,
        type: product.category, userId: user.uid
      });
      const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', product.id);
      await updateDoc(prodRef, { stock: Number(product.stock) - Number(saleData.qty) });
      setShowSaleModal(false);
    } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  const saveProduct = async (productData) => {
    if (isDemoMode) {
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        setEditingProduct(null);
      } else {
        setProducts([...products, { id: `p-${Math.random()}`, ...productData }]);
      }
      setShowProductModal(false);
      return;
    }

    try {
      if (editingProduct) {
        const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', editingProduct.id);
        await updateDoc(prodRef, productData);
        setEditingProduct(null);
      } else {
        const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
        await addDoc(productsRef, { ...productData, createdAt: new Date().toISOString() });
      }
      setShowProductModal(false);
    } catch (err) { console.error(err); }
  };

  const confirmDelete = async () => {
    if (isDemoMode && productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
      return;
    }

    if (productToDelete && user && isAuthReady) {
      try {
        const prodRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', productToDelete.id);
        await deleteDoc(prodRef);
        setShowDeleteModal(false);
        setProductToDelete(null);
      } catch (err) { console.error(err); }
    }
  };

  const callGemini = async (prompt, systemInstruction = "") => {
    const apiKey = ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } }) });
      if (response.ok) {
        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      return "Estou analisando a sua loja no modo Portfólio.";
    } catch (error) { return "Simulador IA Ativo."; }
  };

  const generateBusinessInsight = async () => {
    setLoadingAi(true);
    const res = await callGemini(`Faturação R$ ${stats.totalRevenue}, Lucro R$ ${stats.totalProfit}.`, "Analista sénior de negócios.");
    setAiInsight(res);
    setLoadingAi(false);
  };

  const handleChat = async () => {
    if (!chatMessage) return;
    const msg = chatMessage;
    setChatMessage("");
    setChatHistory([...chatHistory, { role: 'user', text: msg }]);
    setLoadingAi(true);
    const res = await callGemini(msg, "Analista de sistemas Lumina IA.");
    setChatHistory(prev => [...prev, { role: 'ai', text: res }]);
    setLoadingAi(false);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const getMonthName = () => selectedDate.toLocaleString('pt-PT', { month: 'long', year: 'numeric' });

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-4 p-4 rounded-[1.5rem] transition-all flex-1 md:flex-none ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgb(37,99,235,0.3)] scale-105' 
          : 'text-slate-400 hover:bg-white hover:text-blue-600'
      }`}
    >
      <Icon size={22} className={activeTab === id ? "animate-pulse" : ""} />
      <span className="text-[10px] md:text-sm font-black uppercase tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-24 md:pb-0">
      
      {/* HEADER EXCLUSIVO PARA RECRUTADOR */}
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-2 px-6 z-[100] text-center flex items-center justify-center gap-3 shadow-md">
           <Briefcase size={16} className="animate-bounce" />
           <span className="text-xs font-black uppercase tracking-widest">Modo Portfólio Ativado (Dados de Demonstração Seguros)</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`w-72 bg-white border-r-2 border-slate-100 p-8 hidden md:flex flex-col shadow-sm ${isDemoMode ? 'pt-16' : ''}`}>
        <div className="flex items-center space-x-3 mb-12 px-2">
          <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-100 rotate-3"><BookOpen className="text-white" size={26} /></div>
          <div><h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">Paz ERP</h1><span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Lumina v4.4 Pro</span></div>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <NavItem id="calendar" icon={Calendar} label="Calendário" />
          <NavItem id="consignados" icon={Handshake} label="Consignados" />
          <NavItem id="products" icon={Package} label="Inventário" />
          <NavItem id="sales" icon={ShoppingCart} label="Caixa" />
          <NavItem id="assistant" icon={MessageSquare} label="Lumina IA" />
        </nav>
        <div className="mt-auto pt-6 border-t-2 border-slate-50">
           <div className={`p-4 rounded-3xl flex items-center gap-3 ${isDemoMode ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-blue-500' : 'bg-emerald-500 shadow-md animate-pulse'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest">{isDemoMode ? 'Modo Demo' : 'Ligado'}</span>
           </div>
        </div>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t-2 border-slate-100 z-50 flex items-center justify-around px-2 py-4 shadow-2xl">
        <NavItem id="dashboard" icon={LayoutDashboard} label="Home" />
        <NavItem id="consignados" icon={Handshake} label="Consig" />
        <NavItem id="products" icon={Package} label="Stock" />
        <NavItem id="sales" icon={ShoppingCart} label="Caixa" />
        <NavItem id="assistant" icon={MessageSquare} label="IA" />
      </div>

      <main className={`flex-1 overflow-y-auto p-4 md:p-12 ${isDemoMode ? 'md:pt-20 pt-16' : ''}`}>
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="w-full md:w-auto text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-950 tracking-tighter mb-1 capitalize">{activeTab === 'consignados' ? 'Consignados' : activeTab === 'calendar' ? 'Marketing' : activeTab === 'dashboard' ? 'Painel' : activeTab}</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{getMonthName()}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-1.5 flex items-center gap-2">
              <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all"><ChevronLeft size={20} /></button>
              <span className="px-4 text-[11px] font-black text-slate-900 uppercase tracking-widest">Navegar</span>
              <button onClick={() => changeMonth(1)} className="p-3 hover:bg-blue-50 text-blue-600 rounded-2xl transition-all"><ChevronRight size={20} /></button>
            </div>
            <button onClick={() => setShowSaleModal(true)} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"><Plus size={20} /> Nova Venda</button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-blue-600"><RefreshCw className="animate-spin" size={56} /></div>
        ) : (
          <div className="animate-in fade-in duration-700">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard label="Receita Bruta" value={`R$ ${stats.totalRevenue.toFixed(2)}`} icon={Wallet} colorClass="text-blue-600" trend="up" />
                  <StatCard label="Lucro Real" value={`R$ ${stats.totalProfit.toFixed(2)}`} icon={TrendingUp} colorClass="text-emerald-600" trend="up" />
                  <StatCard label="Stock Crítico" value={stats.lowStockCount} icon={AlertTriangle} colorClass="text-orange-500" trend={stats.lowStockCount > 0 ? "down" : "up"} />
                  <StatCard label="Margem" value={`${stats.margin.toFixed(1)}%`} icon={Target} colorClass="text-indigo-600" />
                </div>
                <Card className="bg-slate-950 p-8 md:p-12 relative overflow-hidden group text-white">
                   <div className="flex items-center gap-4 mb-6"><div className="bg-blue-600 p-2.5 rounded-xl"><Sparkles size={24} /></div><h3 className="text-2xl font-black uppercase">IA Lumina</h3></div>
                   <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-blue-50 text-sm italic mb-8">{aiInsight || "Análise o desempenho com a nossa inteligência de portfólio."}</div>
                   <button onClick={generateBusinessInsight} disabled={loadingAi} className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black text-xs uppercase">{loadingAi ? <Loader2 className="animate-spin" size={18} /> : "Consultar IA"}</button>
                </Card>
              </div>
            )}

            {activeTab === 'calendar' && (
               <Card className="p-10 bg-gradient-to-br from-white to-blue-50">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black uppercase shadow-lg">{selectedDate.toLocaleString('pt-PT', { month: 'short' })}</div>
                        <h3 className="text-3xl font-black text-slate-950">{MARKETING_CALENDAR[selectedDate.getMonth()]?.event || 'Planeamento'}</h3>
                     </div>
                     <Star className="text-yellow-400 fill-yellow-400" size={32} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="flex items-start gap-4"><div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Layers size={20} /></div><div><h4 className="font-black text-xs uppercase mb-1">Stock Foco</h4><p className="text-sm font-bold text-slate-500">{MARKETING_CALENDAR[selectedDate.getMonth()]?.products}</p></div></div>
                        <div className="flex items-start gap-4"><div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Lightbulb size={20} /></div><div><h4 className="font-black text-xs uppercase mb-1">Ação Comercial</h4><p className="text-sm font-bold text-slate-500">{MARKETING_CALENDAR[selectedDate.getMonth()]?.salesTip}</p></div></div>
                     </div>
                     <div className="bg-white p-6 rounded-[2rem] border-2 border-blue-100">
                        <div className="flex items-center gap-3 mb-4"><Video className="text-rose-500" size={24} /><h4 className="font-black text-xs">Ideia de Conteúdo</h4></div>
                        <p className="text-sm font-black text-slate-700 italic border-l-4 border-rose-500 pl-4 py-2">"{MARKETING_CALENDAR[selectedDate.getMonth()]?.video}"</p>
                     </div>
                  </div>
               </Card>
            )}

            {activeTab === 'consignados' && (
              <div className="space-y-8 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard label="A Pagar Fornecedores" value={`R$ ${consignData.totalToPay.toFixed(2)}`} icon={DollarSign} colorClass="text-emerald-600" />
                  <StatCard label="Valor Total em Stock" value={`R$ ${consignData.totalStockReturnVal.toFixed(2)}`} icon={Package} colorClass="text-blue-600" />
                </div>
                <Card>
                  <div className="p-10 border-b-2 flex items-center justify-between">
                    <div><h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">Itens Consignados</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controlo de devolução física</p></div>
                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase">{consignData.items.length} Fornecedores</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase border-b-2"><th className="px-10 py-6">Item</th><th className="px-10 py-6 text-center">Status Devolução</th><th className="px-10 py-6 text-center">Data Limite</th><th className="px-10 py-6 text-center">Stock</th><th className="px-10 py-6 text-right">Liquidar (R$)</th></tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-50">
                        {consignData.items.map(item => (
                          <tr key={item.id} className="hover:bg-blue-50/30 transition-all">
                            <td className="px-10 py-8"><p className="font-black text-slate-950 text-lg">{item.name}</p><span className="text-[10px] text-blue-400 font-black">{item.supplier || "Externo"}</span></td>
                            <td className="px-10 py-8 text-center"><span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-black text-[9px] uppercase">{item.returnStatus || 'Pendente'}</span></td>
                            <td className="px-10 py-8 text-center font-bold text-slate-500">{item.deadline || 'Sem data'}</td>
                            <td className="px-10 py-8 text-center font-black">{item.stock}</td>
                            <td className="px-10 py-8 text-right"><span className="text-lg font-black text-blue-700">R$ {item.toPay.toFixed(2)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'products' && (
              <Card className="mb-12">
                <div className="p-10 border-b-2 flex flex-col xl:flex-row gap-6 bg-slate-50/10">
                  <div className="flex flex-1 gap-2">
                       <div className="relative flex-1">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                          <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Procurar no acervo..." 
                            className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] outline-none font-bold shadow-inner" 
                          />
                       </div>
                       <select 
                         value={searchCriteria}
                         onChange={(e) => setSearchCriteria(e.target.value)}
                         className="bg-white border-2 border-slate-100 px-6 py-4 rounded-[2rem] font-black text-[10px] uppercase outline-none text-slate-500"
                       >
                          <option value="all">Tudo</option>
                          <option value="name">Título</option>
                          <option value="author">Autor</option>
                          <option value="isbn">ISBN</option>
                       </select>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={exportToCSV} className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-5 rounded-[2rem] font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-50 shadow-md"><FileSpreadsheet size={18} /> Exportar</button>
                    <button onClick={() => setShowImportModal(true)} className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-5 rounded-[2rem] font-black text-xs uppercase flex items-center gap-2 hover:bg-slate-50 shadow-md"><FileUp size={18} /> Importar</button>
                    <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="bg-slate-950 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase shadow-xl hover:bg-slate-800 transition-all">Novo Item</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase border-b-2"><th className="px-10 py-6">Produto</th><th className="px-10 py-6">Identificadores</th><th className="px-10 py-6 text-center">Stock</th><th className="px-10 py-6 text-right">Preço</th><th className="px-10 py-6 text-right">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-50">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-10 py-8">
                            <p className="font-black text-slate-950 text-xl tracking-tighter">{p.name}</p>
                            <div className="flex items-center gap-2"><span className="text-[10px] font-black text-blue-600 uppercase">{p.category}</span><span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${p.type === 'Consignado' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-400'}`}>{p.type}</span></div>
                          </td>
                          <td className="px-10 py-8 text-xs font-bold text-slate-500">ISBN: {p.isbn || '---'}<br />SKU: {p.sku || '---'}</td>
                          <td className="px-10 py-8 text-center"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto font-black ${p.stock <= 5 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-white text-slate-900 border-2'}`}>{p.stock}</div></td>
                          <td className="px-10 py-8 text-right font-black text-slate-950 text-2xl tracking-tighter">R$ {Number(p.price).toFixed(2)}</td>
                          <td className="px-10 py-8 text-right"><div className="flex justify-end gap-3"><button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="p-4 text-slate-400 hover:text-blue-600"><Edit3 size={20} /></button><button onClick={() => { setProductToDelete(p); setShowDeleteModal(true); }} className="p-4 text-slate-400 hover:text-rose-600"><Trash2 size={20} /></button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'sales' && (
              <Card>
                <div className="p-10 border-b-2 border-slate-100 bg-blue-600 text-white">
                   <h3 className="font-black text-xl uppercase tracking-tighter leading-none mb-1">Caixa Registado</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{filteredSales.length} Pedidos Processados</p>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <tbody className="divide-y-2 divide-slate-50">
                         {filteredSales.map(s => (
                           <tr key={s.id} className="hover:bg-slate-50/40 transition-all">
                              <td className="px-10 py-8 font-mono text-[11px] text-slate-400 uppercase">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                              <td className="px-10 py-8"><p className="font-black text-lg text-slate-900">{s.productName}</p><span className="text-[10px] font-black text-slate-300 uppercase">{s.payment}</span></td>
                              <td className="px-10 py-8 text-center font-black text-slate-700">{s.qty} un.</td>
                              <td className="px-10 py-8 text-right font-black text-blue-600 text-2xl tracking-tighter">R$ {(s.price * s.qty).toFixed(2)}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </Card>
            )}

            {activeTab === 'assistant' && (
              <Card className="h-[700px] flex flex-col shadow-2xl">
                <div className="p-10 border-b-2 bg-slate-950 text-white flex items-center gap-5"><div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg"><Sparkles size={28} /></div><h3 className="font-black text-xl tracking-tight uppercase">Lumina Assistant</h3></div>
                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-6 rounded-[2rem] text-sm shadow-xl ${msg.role === 'user' ? 'bg-blue-600 text-white font-black' : 'bg-white font-bold'}`}>{msg.text}</div></div>
                  ))}
                  {loadingAi && <div className="p-4"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}
                </div>
                <div className="p-10 border-t-2 bg-white flex gap-4"><input value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} placeholder="Pergunte aqui..." className="flex-1 bg-slate-50 rounded-3xl px-8 py-5 outline-none font-bold" /><button onClick={handleChat} className="bg-blue-600 text-white p-5 rounded-3xl hover:bg-blue-700 transition-all"><Send size={28} /></button></div>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* MODAL: IMPORTAÇÃO */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b-2 flex justify-between items-center bg-blue-600 text-white">
                <div className="flex items-center gap-4"><ClipboardList size={24} /><h3 className="text-xl font-black uppercase">Importação de Lotes</h3></div>
                <button onClick={() => setShowImportModal(false)}><X size={24} /></button>
             </div>
             <div className="p-8 space-y-6">
                <textarea 
                  id="bulkData"
                  placeholder='Exemplo: [{"name": "Livro X", "isbn": "978123...", "stock": 10, "price": 40, "supplier": "Editora Exemplo"}]'
                  className="w-full h-64 bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 font-mono text-xs outline-none focus:border-blue-300 transition-all shadow-inner"
                ></textarea>
                <div className="flex gap-4">
                   <button onClick={() => setShowImportModal(false)} className="flex-1 py-5 bg-slate-100 rounded-3xl font-black uppercase text-xs text-slate-500">Cancelar</button>
                   <button 
                     onClick={() => importBulkData(document.getElementById('bulkData').value)}
                     className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs shadow-xl"
                   >
                     Sincronizar Tudo
                   </button>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* MODAL: VENDA */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 z-50">
          <Card className="w-full max-w-md animate-in slide-in-from-bottom-full rounded-t-[3rem] md:rounded-[3rem]">
            <div className="p-10 border-b-2 bg-blue-600 text-white flex justify-between items-center"><h3 className="text-2xl font-black uppercase">Lançar Caixa</h3><button onClick={() => setShowSaleModal(false)}><X size={20} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); registerSale({ productId: fd.get('productId'), qty: Number(fd.get('qty')), payment: fd.get('payment') }); }} className="p-10 space-y-8">
              <select name="productId" className="w-full border-2 bg-slate-50 p-5 rounded-2xl font-black text-slate-900 appearance-none shadow-inner">
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} ({p.stock} un.)</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-6"><input name="qty" type="number" min="1" defaultValue="1" required className="w-full border-2 bg-slate-50 p-5 rounded-2xl font-black text-center text-xl shadow-inner" /><select name="payment" className="w-full border-2 bg-slate-50 p-5 rounded-2xl font-black shadow-inner appearance-none"><option>Pix</option><option>Cartão</option><option>Dinheiro</option></select></div>
              <button className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all">Concluir Transação</button>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: PRODUTO */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 z-50">
          <Card className="w-full max-w-2xl h-[95vh] md:h-auto overflow-hidden animate-in slide-in-from-bottom-full rounded-t-[3rem] md:rounded-[3rem]">
            <div className="p-10 border-b-2 bg-slate-50 flex justify-between items-center"><h3 className="text-2xl font-black text-slate-950 uppercase">{editingProduct ? 'Editar' : 'Novo'} Item</h3><button onClick={() => setShowProductModal(false)}><X size={26} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); saveProduct({ name: fd.get('name'), author: fd.get('author'), isbn: fd.get('isbn'), supplier: fd.get('supplier'), deadline: fd.get('deadline'), returnStatus: fd.get('returnStatus') || 'Pendente', category: fd.get('category'), sku: fd.get('sku'), stock: Number(fd.get('stock')), cost: parseFloat(fd.get('cost')), price: parseFloat(fd.get('price')), type: fd.get('type') }); }} className="p-10 space-y-8 overflow-y-auto max-h-[calc(95vh-120px)] shadow-inner">
              <input name="name" defaultValue={editingProduct?.name} required className="w-full border-2 bg-slate-50 p-6 rounded-3xl font-black outline-none focus:bg-white text-xl" placeholder="Nome do Livro..." />
              <div className="grid grid-cols-2 gap-6">
                 <input name="author" defaultValue={editingProduct?.author} className="w-full border-2 bg-slate-50 p-4 rounded-xl font-black" placeholder="Autor" />
                 <input name="isbn" defaultValue={editingProduct?.isbn} className="w-full border-2 bg-slate-50 p-4 rounded-xl font-black" placeholder="ISBN" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <select name="category" defaultValue={editingProduct?.category} className="bg-slate-50 p-5 rounded-2xl font-black border-2">{optionCategorys}</select>
                 <select name="type" defaultValue={editingProduct?.type} className="bg-slate-50 p-5 rounded-2xl font-black border-2"><option>Próprio</option><option>Consignado</option></select>
              </div>
              <div className="bg-blue-600 p-8 rounded-[2.5rem] grid grid-cols-3 gap-4">
                 <div className="text-center"><label className="text-[9px] font-black text-blue-100 uppercase mb-2 block">Custo (R$)</label><input name="cost" type="number" step="0.01" value={modalCost} onChange={(e) => setModalCost(parseFloat(e.target.value) || 0)} required className="w-full bg-white/10 border-2 border-white/20 text-white p-4 rounded-2xl font-black text-center outline-none" /></div>
                 <div className="text-center"><label className="text-[9px] font-black text-blue-100 uppercase mb-2 block">Markup %</label><input type="number" step="0.1" value={modalMarkup} onChange={(e) => { const m = parseFloat(e.target.value) || 0; setModalMarkup(m); setModalPrice(parseFloat((modalCost * (1 + m / 100)).toFixed(2))); }} className="w-full bg-white text-blue-900 p-4 rounded-2xl font-black outline-none text-center shadow-inner" /></div>
                 <div className="text-center"><label className="text-[9px] font-black text-blue-100 uppercase mb-2 block">Venda (R$)</label><input name="price" type="number" step="0.01" value={modalPrice} onChange={(e) => setModalPrice(parseFloat(e.target.value) || 0)} required className="w-full bg-emerald-500 text-white p-4 rounded-2xl font-black text-center shadow-lg outline-none" /></div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Configurações de Fornecedor / Consignado</p>
                 <div className="grid grid-cols-2 gap-4">
                    <input name="supplier" defaultValue={editingProduct?.supplier} className="bg-white p-4 rounded-xl border-2 font-bold" placeholder="Distribuidora / Editora" />
                    <input name="deadline" type="date" defaultValue={editingProduct?.deadline} className="bg-white p-4 rounded-xl border-2 font-bold" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6"><input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full bg-slate-50 p-5 rounded-2xl font-black border-2 text-center text-xl" placeholder="Stock" /><input name="sku" defaultValue={editingProduct?.sku} required className="w-full bg-slate-50 p-5 rounded-2xl font-black border-2 text-center text-xl" placeholder="Referência SKU" /></div>
              <button className="w-full bg-slate-950 text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all">Sincronizar Acervo</button>
            </form>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]">
          <Card className="w-full max-w-sm p-12 text-center">
             <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Trash2 size={40} /></div>
             <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tighter uppercase">Eliminar?</h3>
             <div className="grid grid-cols-2 gap-4"><button onClick={() => setShowDeleteModal(false)} className="py-5 bg-slate-100 rounded-3xl font-black text-slate-400 uppercase tracking-widest text-[10px]">Não</button><button onClick={confirmDelete} className="py-5 bg-rose-600 text-white rounded-3xl font-black shadow-2xl uppercase tracking-widest text-[10px]">Sim</button></div>
          </Card>
        </div>
      )}
    </div>
  );
};

const optionCategorys = [<option key="liv">Livros</option>, <option key="rou">Roupas</option>, <option key="ace">Acessórios</option>, <option key="pap">Papelaria</option>, <option key="dig">Digital</option>];

export default App;