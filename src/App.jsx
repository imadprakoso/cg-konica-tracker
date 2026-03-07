import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, CheckCircle, Settings, Printer, PlusCircle, RotateCcw, BarChart3, Info, Lock, Unlock, Trash2, X, Pencil, Calendar, Filter, FileText, AlertTriangle, FileWarning, Eye, Sun, Moon, LayoutDashboard, DollarSign, Activity, TrendingUp, PieChart } from 'lucide-react';

// --- KONEKSI SUPABASE VIA REST API ---
// PENTING: Saat di-copy ke VS Code (Lokal/Production), ubah 2 baris di bawah ini menjadi:
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = 'https://wtslqxjwjqyjgcapfrrz.supabase.co';
const supabaseKey = 'sb_publishable_HyWB1TfQr-N514kXP3qVjA_uqAlox-A';

const supabaseHeaders = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json'
};

// --- PENGATURAN ADMIN ---
const ADMIN_PASSWORD = 'admin'; // Ubah password admin di sini

// --- Konfigurasi Lifetime Suku Cadang ---
const PART_LIFETIMES = {
  "Toner Cyan": 14000, "Toner Magenta": 14000, "Toner Yellow": 14000, "Toner Black": 14000,
  "Drum Unit Cyan": 40000, "Drum Unit Magenta": 40000, "Drum Unit Yellow": 40000, "Drum Unit Black": 40000,
  "Developing Unit Cyan": 200000, "Developing Unit Magenta": 200000, "Developing Unit Yellow": 200000, "Developing Unit Black": 200000,
  "Developer Cyan": 100000, "Developer Magenta": 100000, "Developer Yellow": 100000, "Developer Black": 100000,
  "Charging Corona Cyan": 40000, "Charging Corona Magenta": 40000, "Charging Corona Yellow": 40000, "Charging Corona Black": 40000,
  "Fuser Unit": 200000, "Transfer Belt Unit": 200000, "Blade": 100000
};

// --- Helper Tanggal ---
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getNowDateTimeStr = () => {
  const d = new Date();
  return `${getTodayStr()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const formatDateToLocale = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export default function App() {
  // --- State Dark Mode dengan Logika AM/PM ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      } else {
        const hour = new Date().getHours();
        return hour >= 12;
      }
    }
    return false;
  });

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // --- State Pengaturan Harga per Klik (Disimpan di Local Storage) ---
  const [clickPrice, setClickPrice] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPrice = localStorage.getItem('clickPrice');
      return savedPrice ? parseInt(savedPrice) : 1000;
    }
    return 1000;
  });
  const [adminPriceInput, setAdminPriceInput] = useState(clickPrice.toString());

  // --- HELPER CLASS WARNA DINAMIS ---
  const cls = {
    appBg: isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800',
    cardBg: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100',
    cardHeader: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50/50 border-slate-100',
    textMain: isDarkMode ? 'text-white' : 'text-slate-800',
    textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    textMuted: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    input: isDarkMode ? 'bg-slate-900 border-slate-600 text-white focus:ring-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-indigo-500',
    inputDisabled: isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-60' : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60',
    btnSec: isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200',
    tableHead: isDarkMode ? 'bg-slate-800/90 text-slate-400 border-slate-700' : 'bg-white text-slate-500 border-slate-100',
    tableRow: isDarkMode ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50/80',
    tableDiv: isDarkMode ? 'divide-slate-700/50' : 'divide-slate-100',
    modalBg: isDarkMode ? 'bg-slate-900/80' : 'bg-slate-900/50',

    // Tab States
    tabAct: isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700',
    tabActRose: isDarkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700',
    tabInact: isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50',

    // Colors
    indigoText: isDarkMode ? 'text-indigo-400' : 'text-indigo-600',
    indigoIcon: isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600',
    indigoCard: isDarkMode ? 'bg-indigo-900/30 border-indigo-800/50' : 'bg-indigo-50/80 border-indigo-100',

    roseText: isDarkMode ? 'text-rose-400' : 'text-rose-600',
    roseIcon: isDarkMode ? 'bg-rose-900/50 text-rose-400' : 'bg-rose-100 text-rose-600',
    roseCard: isDarkMode ? 'bg-rose-900/20 border-rose-800/50' : 'bg-rose-50/80 border-rose-100',

    amberText: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    amberCard: isDarkMode ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50/80 border-amber-100',

    blueCard: isDarkMode ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50/80 border-blue-100',
    emeraldCard: isDarkMode ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-emerald-50/80 border-emerald-100',
    emeraldText: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',

    lockOverlay: isDarkMode ? 'bg-slate-900/80 text-slate-400' : 'bg-white/80 text-slate-500',

    // Chart Specific
    chartTooltip: isDarkMode ? 'bg-slate-700 text-white shadow-lg border border-slate-600' : 'bg-slate-800 text-white shadow-lg border border-slate-700',
    chartBar: isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-500 hover:bg-indigo-400',
    chartAxisLine: isDarkMode ? 'border-slate-700' : 'border-slate-200'
  };

  // --- State Aplikasi Pokok ---
  const [history, setHistory] = useState([]);
  const [replacementHistory, setReplacementHistory] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [replacements, setReplacements] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // --- Form State Klik Mesin ---
  const [operator, setOperator] = useState('');
  const [newClicks, setNewClicks] = useState('');
  const [dateType, setDateType] = useState('Hari Ini');
  const [replacePart, setReplacePart] = useState('');
  const [replaceOperator, setReplaceOperator] = useState('');

  // --- Form State Error Log ---
  const [errorForm, setErrorForm] = useState({
    tgl: getTodayStr(), nomor_invoice: '', divisi: 'CG', nama_konsumen: '', nama_produk: '',
    qty_kesalahan: '', kerugian_bahan: '', kerugian_jasa: '', kategori_kesalahan: 'Kesesuaian/Ketepatan',
    jenis_kesalahan: 'Machine Error', deskripsi_kesalahan: '', penyebab: '', pencegahan_solusi: '',
    penyelesaian: 'Cetak Ulang', pic: ''
  });

  // --- UI Tabs & Filters (Set Dashboard as Default) ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportPeriod, setReportPeriod] = useState('week'); // Default week agar grafik terlihat bagus
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // --- Admin State & Modals ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPwdInput, setAdminPwdInput] = useState('');

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, type: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });
  const [editFormClick, setEditFormClick] = useState({ dateFor: '', operator: '', totalClicks: '' });

  // State untuk Detail & Edit Modal Error Log
  const [errorDetailModal, setErrorDetailModal] = useState({ isOpen: false, item: null });
  const [editErrorModal, setEditErrorModal] = useState({ isOpen: false, item: null });
  const [editErrorForm, setEditErrorForm] = useState({
    tgl: '', nomor_invoice: '', divisi: 'CG', nama_konsumen: '', nama_produk: '',
    qty_kesalahan: '', kerugian_bahan: '', kerugian_jasa: '', kategori_kesalahan: 'Kesesuaian/Ketepatan',
    jenis_kesalahan: 'Machine Error', deskripsi_kesalahan: '', penyebab: '', pencegahan_solusi: '',
    penyelesaian: 'Cetak Ulang', pic: ''
  });

  const [toast, setToast] = useState(null);

  // --- Fetch Semua Data ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const historyRes = fetch(`${supabaseUrl}/rest/v1/click_history?select=*&order=total_clicks.asc`, { headers: supabaseHeaders });
      const partRes = fetch(`${supabaseUrl}/rest/v1/part_replacements?select=*&order=replaced_at_click.asc`, { headers: supabaseHeaders });
      const errorRes = fetch(`${supabaseUrl}/rest/v1/error_logs?select=*&order=tgl.desc`, { headers: supabaseHeaders });

      const [resH, resP, resE] = await Promise.all([historyRes, partRes, errorRes]);

      if (resH.ok) {
        const data = await resH.json();
        setHistory(data.map(item => ({
          id: item.id, dateStr: item.date_str, dateFor: item.date_for, operator: item.operator,
          totalClicks: item.total_clicks, dailyClicks: item.daily_clicks
        })));
      }

      if (resP.ok) {
        const data = await resP.json();
        setReplacementHistory(data.map(item => ({
          id: item.id, partName: item.part_name, replacedAtClick: item.replaced_at_click,
          operator: item.operator, createdAt: item.created_at
        })));
        const repl = {};
        Object.keys(PART_LIFETIMES).forEach(p => repl[p] = 0);
        data.forEach(item => {
          if (!repl[item.part_name] || item.replaced_at_click > repl[item.part_name]) repl[item.part_name] = item.replaced_at_click;
        });
        setReplacements(repl);
      }

      if (resE.ok) {
        const data = await resE.json();
        setErrorLogs(data);
      }

    } catch (err) {
      console.error("Error fetching:", err);
      showToast("Koneksi ke Supabase gagal.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const sortedHistory = useMemo(() => [...history].sort((a, b) => a.totalClicks - b.totalClicks), [history]);
  const currentTotalClicks = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].totalClicks : 0;

  // --- LOGIKA MULTIPLIER PUNISHMENT ERROR ---
  const currentMultiplier = useMemo(() => {
    if (!errorForm.pic || !errorForm.deskripsi_kesalahan) return 1;

    const picLower = errorForm.pic.toLowerCase().trim();
    const deskripsiLower = errorForm.deskripsi_kesalahan.toLowerCase().trim();

    if (deskripsiLower === '') return 1;

    const previousErrors = errorLogs.filter(e =>
      e.pic && e.pic.toLowerCase().trim() === picLower &&
      e.deskripsi_kesalahan && e.deskripsi_kesalahan.toLowerCase().trim() === deskripsiLower
    );
    return previousErrors.length + 1;
  }, [errorForm.pic, errorForm.deskripsi_kesalahan, errorLogs]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPwdInput === ADMIN_PASSWORD) {
      setIsAdmin(true); setShowLoginModal(false); setAdminPwdInput(''); showToast("Berhasil masuk Mode Admin");
    } else { showToast("Password Admin Salah!", "error"); }
  };

  // --- Update Harga Per Klik (Admin) ---
  const handleUpdatePrice = (e) => {
    e.preventDefault();
    const newPrice = parseInt(adminPriceInput);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setClickPrice(newPrice);
      localStorage.setItem('clickPrice', newPrice.toString());
      showToast("Harga per klik berhasil diperbarui!");
    } else {
      showToast("Masukkan nominal harga yang valid!", "error");
    }
  };

  // --- Fungsi Hapus Terpadu (Admin) ---
  const confirmDelete = (item, type) => { setDeleteModal({ isOpen: true, item, type }); };
  const executeDelete = async () => {
    const { item, type } = deleteModal;
    let endpoint = '';
    if (type === 'click') endpoint = 'click_history';
    else if (type === 'part') endpoint = 'part_replacements';
    else if (type === 'error') endpoint = 'error_logs';

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}?id=eq.${item.id}`, { method: 'DELETE', headers: supabaseHeaders });
      if (!response.ok) throw new Error("Gagal menghapus data");

      if (type === 'click') setHistory(history.filter(h => h.id !== item.id));
      else if (type === 'part') {
        const newHist = replacementHistory.filter(h => h.id !== item.id);
        setReplacementHistory(newHist);
        const repl = {}; Object.keys(PART_LIFETIMES).forEach(p => repl[p] = 0);
        newHist.forEach(h => { if (!repl[h.partName] || h.replacedAtClick > repl[h.partName]) repl[h.partName] = h.replacedAtClick; });
        setReplacements(repl);
      }
      else if (type === 'error') setErrorLogs(errorLogs.filter(e => e.id !== item.id));

      showToast("Data berhasil dihapus!");
    } catch (err) {
      showToast("Gagal menghapus dari database cloud.", "error");
    } finally {
      setDeleteModal({ isOpen: false, item: null, type: '' });
    }
  };

  // --- Fungsi Simpan Klik Harian ---
  const handleSaveData = async (e) => {
    e.preventDefault();
    if (!operator || !newClicks || isNaN(newClicks)) return showToast("Lengkapi form dengan benar!", "error");
    const clickInt = parseInt(newClicks);
    if (clickInt <= currentTotalClicks && history.length > 0) return showToast(`Klik harus > ${currentTotalClicks}`, "error");

    const targetDateFor = dateType === 'Kemarin' ? getYesterdayStr() : getTodayStr();
    let clicksBeforeTarget = 0;
    const historyByDate = [...history].sort((a, b) => new Date(a.dateFor) - new Date(b.dateFor));
    for (let i = historyByDate.length - 1; i >= 0; i--) {
      if (new Date(historyByDate[i].dateFor) < new Date(targetDateFor)) { clicksBeforeTarget = historyByDate[i].totalClicks; break; }
    }
    if (clicksBeforeTarget === 0 && historyByDate.length > 0) clicksBeforeTarget = historyByDate[0].totalClicks;

    let dailyC = history.length === 0 ? 0 : clickInt - clicksBeforeTarget;
    const newEntryDb = { date_str: getNowDateTimeStr(), date_for: targetDateFor, operator, total_clicks: clickInt, daily_clicks: dailyC > 0 ? dailyC : 0 };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/click_history`, { method: 'POST', headers: { ...supabaseHeaders, 'Prefer': 'return=representation' }, body: JSON.stringify(newEntryDb) });
      if (!res.ok) throw new Error("Error db");
      const data = await res.json();
      const ins = data && data.length > 0 ? data[0] : newEntryDb;
      setHistory([...history, { id: ins.id, dateStr: ins.date_str, dateFor: ins.date_for, operator: ins.operator, totalClicks: ins.total_clicks, dailyClicks: ins.daily_clicks }]);
      setOperator(''); setNewClicks(''); setDateType('Hari Ini'); showToast(`Data tersimpan!`);
    } catch (err) { showToast("Gagal menyimpan data klik", "error"); }
  };

  // --- Fungsi Reset Part ---
  const handleReplacePart = async (e) => {
    e.preventDefault();
    if (!isAdmin) return showToast("Hanya Admin yang bisa reset part!", "error");
    if (!replacePart) return showToast("Pilih part yang diganti!", "error");
    if (!replaceOperator) return showToast("Nama operator wajib diisi!", "error");

    const newReplacementDb = {
      part_name: replacePart,
      replaced_at_click: currentTotalClicks,
      operator: replaceOperator
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/part_replacements`, {
        method: 'POST',
        headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(newReplacementDb)
      });
      if (!response.ok) throw new Error("Gagal reset part");

      const data = await response.json();
      const insertedData = data && data.length > 0 ? {
        id: data[0].id,
        partName: data[0].part_name,
        replacedAtClick: data[0].replaced_at_click,
        operator: data[0].operator,
        createdAt: data[0].created_at
      } : {
        id: Date.now(), partName: replacePart, replacedAtClick: currentTotalClicks, operator: replaceOperator, createdAt: new Date().toISOString()
      };

      setReplacementHistory([...replacementHistory, insertedData]);
      setReplacements({ ...replacements, [replacePart]: currentTotalClicks });
      setReplacePart('');
      setReplaceOperator('');
      showToast(`Suku cadang ${replacePart} berhasil direset!`);
    } catch (err) {
      showToast("Gagal mereset part ke database.", "error");
    }
  };

  // --- Fungsi Simpan Error Log ---
  const handleSaveErrorLog = async (e) => {
    e.preventDefault();
    if (!errorForm.nama_konsumen || !errorForm.nama_produk || !errorForm.pic) return showToast("Nama Konsumen, Produk, dan PIC wajib diisi!", "error");

    const kerugianBahan = parseFloat(errorForm.kerugian_bahan) || 0;
    const kerugianJasa = parseFloat(errorForm.kerugian_jasa) || 0;

    const hitungKerugianTotal = (kerugianBahan + kerugianJasa) * currentMultiplier;
    const finalPenyelesaian = currentMultiplier > 1
      ? `${errorForm.penyelesaian} [PUNISHMENT ${currentMultiplier}X LIPAT]`
      : errorForm.penyelesaian;

    const payload = {
      ...errorForm,
      qty_kesalahan: parseInt(errorForm.qty_kesalahan) || 0,
      kerugian_bahan: kerugianBahan,
      kerugian_jasa: kerugianJasa,
      jumlah_kerugian: hitungKerugianTotal,
      penyelesaian: finalPenyelesaian
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/error_logs`, {
        method: 'POST', headers: { ...supabaseHeaders, 'Prefer': 'return=representation' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal simpan log error");
      const data = await res.json();
      setErrorLogs([data[0], ...errorLogs]);
      showToast(currentMultiplier > 1 ? `Log dicatat! Dikenakan Punishment ${currentMultiplier}x.` : "Log Error berhasil dicatat!");
      setErrorForm({ ...errorForm, nomor_invoice: '', nama_konsumen: '', nama_produk: '', qty_kesalahan: '', kerugian_bahan: '', kerugian_jasa: '', deskripsi_kesalahan: '', penyebab: '', pencegahan_solusi: '', pic: '' });
    } catch (err) { showToast("Gagal menyimpan log error", "error"); }
  };

  // --- Fungsi Edit Riwayat Klik ---
  const confirmEditClick = (item) => {
    setEditFormClick({ dateFor: item.dateFor, operator: item.operator, totalClicks: item.totalClicks });
    setEditModal({ isOpen: true, item });
  };
  const executeEditClick = async (e) => {
    e.preventDefault();
    const { item } = editModal;
    const newTotal = parseInt(editFormClick.totalClicks);

    if (isNaN(newTotal)) return showToast("Total klik harus angka!", "error");

    let clicksBeforeTarget = 0;
    const historyByDate = [...history].filter(h => h.id !== item.id).sort((a, b) => new Date(a.dateFor) - new Date(b.dateFor));
    for (let i = historyByDate.length - 1; i >= 0; i--) {
      if (new Date(historyByDate[i].dateFor) < new Date(editFormClick.dateFor)) {
        clicksBeforeTarget = historyByDate[i].totalClicks;
        break;
      }
    }
    if (clicksBeforeTarget === 0 && historyByDate.length > 0) clicksBeforeTarget = historyByDate[0].totalClicks;

    let newDaily = newTotal - clicksBeforeTarget;
    if (history.length <= 1) newDaily = 0;

    const updatePayload = {
      date_for: editFormClick.dateFor,
      operator: editFormClick.operator,
      total_clicks: newTotal,
      daily_clicks: newDaily > 0 ? newDaily : 0
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/click_history?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(updatePayload)
      });
      if (!response.ok) throw new Error("Gagal mengupdate data");
      const data = await response.json();

      if (data && data.length > 0) {
        const updatedItem = data[0];
        setHistory(history.map(h => h.id === item.id ? {
          ...h, dateFor: updatedItem.date_for, operator: updatedItem.operator,
          totalClicks: updatedItem.total_clicks, dailyClicks: updatedItem.daily_clicks
        } : h));
      }
      showToast("Data berhasil diupdate!");
    } catch (err) {
      showToast("Gagal mengupdate database.", "error");
    } finally {
      setEditModal({ isOpen: false, item: null });
    }
  };

  // --- Fungsi Edit Error Log ---
  const confirmEditError = (item) => {
    setEditErrorForm({
      tgl: item.tgl || '',
      nomor_invoice: item.nomor_invoice || '',
      divisi: item.divisi || 'CG',
      nama_konsumen: item.nama_konsumen || '',
      nama_produk: item.nama_produk || '',
      qty_kesalahan: item.qty_kesalahan || '',
      kerugian_bahan: item.kerugian_bahan || '',
      kerugian_jasa: item.kerugian_jasa || '',
      kategori_kesalahan: item.kategori_kesalahan || 'Kesesuaian/Ketepatan',
      jenis_kesalahan: item.jenis_kesalahan || 'Machine Error',
      deskripsi_kesalahan: item.deskripsi_kesalahan || '',
      penyebab: item.penyebab || '',
      pencegahan_solusi: item.pencegahan_solusi || '',
      penyelesaian: item.penyelesaian || 'Cetak Ulang',
      pic: item.pic || ''
    });
    setEditErrorModal({ isOpen: true, item });
  };

  const executeEditError = async (e) => {
    e.preventDefault();
    const { item } = editErrorModal;

    if (!editErrorForm.nama_konsumen || !editErrorForm.nama_produk || !editErrorForm.pic) {
      return showToast("Nama Konsumen, Produk, dan PIC wajib diisi!", "error");
    }

    const kb = parseFloat(editErrorForm.kerugian_bahan) || 0;
    const kj = parseFloat(editErrorForm.kerugian_jasa) || 0;

    let mult = 1;
    const picLower = editErrorForm.pic.toLowerCase().trim();
    const deskripsiLower = editErrorForm.deskripsi_kesalahan.toLowerCase().trim();
    if (deskripsiLower !== '') {
      const previousErrors = errorLogs.filter(err =>
        err.id !== item.id &&
        err.pic && err.pic.toLowerCase().trim() === picLower &&
        err.deskripsi_kesalahan && err.deskripsi_kesalahan.toLowerCase().trim() === deskripsiLower
      );
      mult = previousErrors.length + 1;
    }

    const totalKerugian = (kb + kj) * mult;
    const finalPenyelesaian = mult > 1 && !editErrorForm.penyelesaian.includes('PUNISHMENT')
      ? `${editErrorForm.penyelesaian} [PUNISHMENT ${mult}X LIPAT]`
      : editErrorForm.penyelesaian;

    const payload = {
      tgl: editErrorForm.tgl,
      nomor_invoice: editErrorForm.nomor_invoice,
      divisi: editErrorForm.divisi,
      nama_konsumen: editErrorForm.nama_konsumen,
      nama_produk: editErrorForm.nama_produk,
      qty_kesalahan: parseInt(editErrorForm.qty_kesalahan) || 0,
      kerugian_bahan: kb,
      kerugian_jasa: kj,
      kategori_kesalahan: editErrorForm.kategori_kesalahan,
      jenis_kesalahan: editErrorForm.jenis_kesalahan,
      deskripsi_kesalahan: editErrorForm.deskripsi_kesalahan,
      pencegahan_solusi: editErrorForm.pencegahan_solusi,
      penyelesaian: finalPenyelesaian,
      pic: editErrorForm.pic,
      jumlah_kerugian: totalKerugian
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/error_logs?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Gagal mengupdate data error");
      const data = await response.json();

      if (data && data.length > 0) {
        setErrorLogs(errorLogs.map(err => err.id === item.id ? data[0] : err));
      }
      showToast("Log Error berhasil diupdate!");
    } catch (err) {
      showToast("Gagal mengupdate database.", "error");
    } finally {
      setEditErrorModal({ isOpen: false, item: null });
    }
  };

  // --- Filter Laporan & Dashboard ---
  const filteredData = (dataArray, dateField) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return dataArray.filter(item => {
      if (!item[dateField]) return true;
      const itemDate = new Date(item[dateField]); itemDate.setHours(0, 0, 0, 0);
      if (reportPeriod === 'today') return itemDate.getTime() === today.getTime();
      if (reportPeriod === 'week') { const lw = new Date(today); lw.setDate(today.getDate() - 7); return itemDate >= lw && itemDate <= today; }
      if (reportPeriod === 'month') return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      if (reportPeriod === 'custom') {
        if (!customStart || !customEnd) return true;
        const st = new Date(customStart); st.setHours(0, 0, 0, 0);
        const ed = new Date(customEnd); ed.setHours(23, 59, 59, 999);
        return itemDate >= st && itemDate <= ed;
      }
      return true;
    });
  };

  const reportClicks = filteredData(sortedHistory, 'dateFor').reverse();
  const totalReportUsage = reportClicks.reduce((sum, item) => sum + item.dailyClicks, 0);
  const reportReplacements = filteredData(replacementHistory, 'createdAt').reverse();
  const reportErrors = filteredData(errorLogs, 'tgl');
  const totalRupiahKerugian = reportErrors.reduce((sum, item) => sum + Number(item.jumlah_kerugian), 0);

  // Pendapatan Kotor (Gross) Dashboard = Total Pemakaian (di filter) x Harga per Klik
  const totalGrossRevenue = totalReportUsage * clickPrice;

  // --- Data Status Part ---
  const partData = Object.keys(PART_LIFETIMES).map(partName => {
    const lifetime = PART_LIFETIMES[partName];
    const usage = Math.max(0, currentTotalClicks - (replacements[partName] || 0));
    const remainingPercent = Math.max(0, ((lifetime - usage) / lifetime) * 100);
    let color = 'bg-emerald-500'; if (remainingPercent <= 10) color = 'bg-rose-500'; else if (remainingPercent <= 25) color = 'bg-amber-500';
    return { name: partName, usage, remainingPercent: remainingPercent.toFixed(1), estimatedReplace: (replacements[partName] || 0) + lifetime, color };
  });

  // --- DATA PROCESSING UNTUK VISUALISASI CHART ---

  // 1. Data Grafik Tren Klik (Bar Chart)
  const clickChartData = useMemo(() => {
    const grouped = {};
    // Sort chronological for charting
    const ascendingClicks = [...reportClicks].sort((a, b) => new Date(a.dateFor) - new Date(b.dateFor));

    ascendingClicks.forEach(item => {
      const date = item.dateFor;
      if (!grouped[date]) grouped[date] = 0;
      grouped[date] += item.dailyClicks;
    });

    // Convert object to array
    let chartArray = Object.keys(grouped).map(date => {
      const d = new Date(date);
      const shortDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      return { fullDate: date, shortDate: shortDate, total: grouped[date] };
    });

    // Jika data terlalu banyak (misal custom range panjang), kita batasi tampilannya di chart agar rapi
    if (chartArray.length > 14) {
      chartArray = chartArray.slice(chartArray.length - 14); // Ambil 14 hari terakhir saja untuk grafik
    }
    return chartArray;
  }, [reportClicks]);

  const maxClickChart = clickChartData.length > 0 ? Math.max(...clickChartData.map(d => d.total)) : 0;

  // 2. Data Komposisi Error (Horizontal Stacked Bar)
  const errorChartData = useMemo(() => {
    const grouped = {};
    reportErrors.forEach(item => {
      const type = item.jenis_kesalahan || 'Lainnya';
      if (!grouped[type]) grouped[type] = 0;
      grouped[type] += Number(item.jumlah_kerugian);
    });

    const colors = {
      'Machine Error': 'bg-blue-500 dark:bg-blue-600',
      'Human Error': 'bg-rose-500 dark:bg-rose-600',
      'Print Test': 'bg-amber-500 dark:bg-amber-600',
      'Lainnya': 'bg-slate-400 dark:bg-slate-600'
    };

    return Object.keys(grouped).map(type => ({
      name: type,
      value: grouped[type],
      color: colors[type] || 'bg-indigo-500'
    })).sort((a, b) => b.value - a.value); // Urutkan dari kerugian terbesar
  }, [reportErrors]);


  if (isLoading) return <div className={`min-h-screen ${cls.appBg} flex items-center justify-center`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className={`min-h-screen ${cls.appBg} font-sans p-4 md:p-8 relative pb-20 transition-colors duration-300`}>

      {/* Modal Hapus Global */}
      {deleteModal.isOpen && (
        <div className={`fixed inset-0 ${cls.modalBg} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <div className={`${cls.cardBg} rounded-xl shadow-xl w-full max-w-sm p-6 text-center border`}>
            <div className={`mx-auto w-12 h-12 ${cls.roseIcon} rounded-full flex items-center justify-center mb-4`}><AlertCircle className="w-6 h-6" /></div>
            <h3 className={`text-lg font-bold ${cls.textMain} mb-2`}>Hapus Data?</h3>
            <p className={`${cls.textSub} text-sm mb-6`}>Tindakan ini akan menghapus data secara permanen dari database.</p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteModal({ isOpen: false, item: null, type: '' })} className={`flex-1 py-2.5 border ${cls.btnSec} rounded-lg font-medium transition-colors`}>Batal</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit History Klik */}
      {editModal.isOpen && (
        <div className={`fixed inset-0 ${cls.modalBg} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <div className={`${cls.cardBg} rounded-xl shadow-xl w-full max-w-md p-6 relative border`}>
            <button onClick={() => setEditModal({ isOpen: false, item: null })} className={`absolute top-4 right-4 ${cls.textMuted} hover:${cls.textMain}`}><X className="w-5 h-5" /></button>
            <div className="flex items-center space-x-3 mb-6">
              <Pencil className={`w-6 h-6 ${cls.indigoText}`} />
              <h2 className={`text-xl font-bold ${cls.textMain}`}>Edit Data Riwayat Klik</h2>
            </div>
            <form onSubmit={executeEditClick} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${cls.textSub} mb-1`}>Berlaku Untuk Tanggal</label>
                <input type="date" value={editFormClick.dateFor} onChange={(e) => setEditFormClick({ ...editFormClick, dateFor: e.target.value })} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${cls.input}`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium ${cls.textSub} mb-1`}>Nama Operator</label>
                <input type="text" value={editFormClick.operator} onChange={(e) => setEditFormClick({ ...editFormClick, operator: e.target.value })} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${cls.input}`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium ${cls.textSub} mb-1`}>Total Klik Mesin</label>
                <input type="number" value={editFormClick.totalClicks} onChange={(e) => setEditFormClick({ ...editFormClick, totalClicks: e.target.value })} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 font-mono ${cls.input}`} required />
              </div>
              <button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Error Log */}
      {editErrorModal.isOpen && (
        <div className={`fixed inset-0 ${cls.modalBg} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <div className={`${cls.cardBg} rounded-xl shadow-xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh] border`}>
            <button onClick={() => setEditErrorModal({ isOpen: false, item: null })} className={`absolute top-4 right-4 ${cls.textMuted} hover:${cls.textMain}`}><X className="w-5 h-5" /></button>
            <div className={`flex items-center space-x-3 mb-6 border-b ${cls.tableDiv} pb-4`}>
              <Pencil className={`w-6 h-6 ${cls.roseText}`} />
              <h2 className={`text-xl font-bold ${cls.textMain}`}>Edit Data Log Error</h2>
            </div>

            <form onSubmit={executeEditError} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-4">
                <div className={`${cls.cardHeader} p-3 rounded-lg border`}>
                  <h4 className={`font-semibold ${cls.textMain} mb-3 text-xs uppercase tracking-wider`}>Detail Order</h4>
                  <div className="space-y-3">
                    <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Tanggal Kejadian</label><input type="date" value={editErrorForm.tgl} onChange={e => setEditErrorForm({ ...editErrorForm, tgl: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                    <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>No. Invoice CRM</label><input type="text" value={editErrorForm.nomor_invoice} onChange={e => setEditErrorForm({ ...editErrorForm, nomor_invoice: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} /></div>
                    <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Nama Konsumen</label><input type="text" value={editErrorForm.nama_konsumen} onChange={e => setEditErrorForm({ ...editErrorForm, nama_konsumen: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                    <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Nama Barang / Produk</label><input type="text" value={editErrorForm.nama_produk} onChange={e => setEditErrorForm({ ...editErrorForm, nama_produk: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`${cls.cardHeader} p-3 rounded-lg border`}>
                  <h4 className={`font-semibold ${cls.textMain} mb-3 text-xs uppercase tracking-wider`}>Analisis Kesalahan</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Kategori</label>
                        <select value={editErrorForm.kategori_kesalahan} onChange={e => setEditErrorForm({ ...editErrorForm, kategori_kesalahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`}>
                          <option value="Kesesuaian/Ketepatan">Kesesuaian/Ketepatan</option><option value="Kualitas">Kualitas</option><option value="Desain">Desain</option><option value="Bahan">Bahan</option><option value="Prosedur/Proses">Prosedur/Proses</option>
                        </select>
                      </div>
                      <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Jenis</label>
                        <select value={editErrorForm.jenis_kesalahan} onChange={e => setEditErrorForm({ ...editErrorForm, jenis_kesalahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`}>
                          <option value="Machine Error">Machine Error</option><option value="Human Error">Human Error</option><option value="Print Test">Print Test</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Qty Rusak</label><input type="number" value={editErrorForm.qty_kesalahan} onChange={e => setEditErrorForm({ ...editErrorForm, qty_kesalahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                      <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>PIC Terlibat</label><input type="text" value={editErrorForm.pic} onChange={e => setEditErrorForm({ ...editErrorForm, pic: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div><label className={`text-xs font-medium ${cls.roseText} block mb-1`}>Rugi Bahan (Rp)</label><input type="number" value={editErrorForm.kerugian_bahan} onChange={e => setEditErrorForm({ ...editErrorForm, kerugian_bahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} placeholder="0" /></div>
                      <div><label className={`text-xs font-medium ${cls.roseText} block mb-1`}>Rugi Jasa (Rp)</label><input type="number" value={editErrorForm.kerugian_jasa} onChange={e => setEditErrorForm({ ...editErrorForm, kerugian_jasa: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} placeholder="0" /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col h-full justify-between">
                <div className={`${cls.cardHeader} p-3 rounded-lg border flex-grow`}>
                  <h4 className={`font-semibold ${cls.textMain} mb-3 text-xs uppercase tracking-wider`}>Evaluasi & Tindakan</h4>
                  <div className="space-y-3">
                    <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Deskripsi Kesalahan</label><textarea value={editErrorForm.deskripsi_kesalahan} onChange={e => setEditErrorForm({ ...editErrorForm, deskripsi_kesalahan: e.target.value })} className={`w-full p-2 border rounded text-xs focus:outline-none focus:ring-2 ${cls.input}`} rows="2"></textarea></div>
                    <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Pencegahan / Solusi</label><textarea value={editErrorForm.pencegahan_solusi} onChange={e => setEditErrorForm({ ...editErrorForm, pencegahan_solusi: e.target.value })} className={`w-full p-2 border rounded text-xs focus:outline-none focus:ring-2 ${cls.input}`} rows="2"></textarea></div>
                    <div><label className={`text-xs font-medium ${cls.textSub} block mb-1`}>Penyelesaian Akhir</label><input type="text" value={editErrorForm.penyelesaian} onChange={e => setEditErrorForm({ ...editErrorForm, penyelesaian: e.target.value })} className={`w-full p-2 border rounded text-xs focus:outline-none focus:ring-2 ${cls.input}`} /></div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center shadow-sm">
                  <CheckCircle className="w-5 h-5 mr-2" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Error Log */}
      {errorDetailModal.isOpen && errorDetailModal.item && (
        <div className={`fixed inset-0 ${cls.modalBg} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <div className={`${cls.cardBg} rounded-xl shadow-xl w-full max-w-2xl p-0 relative overflow-hidden flex flex-col max-h-[90vh] border`}>
            <div className={`${cls.roseCard} p-4 md:p-6 flex items-center justify-between sticky top-0 z-10 border-b`}>
              <div className="flex items-center space-x-3">
                <div className={`${cls.cardBg} p-2 rounded-lg shadow-sm border`}>
                  <AlertTriangle className={`w-6 h-6 ${cls.roseText}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${cls.textMain}`}>Detail Investigasi Kesalahan</h2>
                  <p className={`text-xs ${cls.textSub} mt-0.5`}>Laporan tanggal: {formatDateToLocale(errorDetailModal.item.tgl)}</p>
                </div>
              </div>
              <button onClick={() => setErrorDetailModal({ isOpen: false, item: null })} className={`${cls.textMuted} ${cls.btnSec} p-2 rounded-full transition-colors`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 md:p-6 overflow-y-auto text-sm ${cls.cardHeader}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-4">
                  <div className={`${cls.cardBg} p-4 rounded-xl border shadow-sm`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${cls.textSub} mb-3 border-b ${cls.tableDiv} pb-2`}>Informasi Pesanan</h3>
                    <div className="space-y-3">
                      <div>
                        <p className={`text-xs ${cls.textSub}`}>Nomor Invoice CRM</p>
                        <p className={`font-mono font-medium ${cls.indigoText}`}>{errorDetailModal.item.nomor_invoice || '-'}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${cls.textSub}`}>Nama Konsumen</p>
                        <p className={`font-medium ${cls.textMain}`}>{errorDetailModal.item.nama_konsumen}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${cls.textSub}`}>Nama Produk</p>
                        <p className={`font-medium ${cls.textMain}`}>{errorDetailModal.item.nama_produk}</p>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <div className="flex-1">
                          <p className={`text-xs ${cls.textSub}`}>Divisi</p>
                          <span className={`inline-block px-2 py-0.5 ${cls.cardHeader} rounded text-xs font-medium ${cls.textMain}`}>{errorDetailModal.item.divisi}</span>
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs ${cls.textSub}`}>PIC / Operator</p>
                          <p className={`font-medium ${cls.textMain}`}>{errorDetailModal.item.pic}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${cls.roseCard} p-4 rounded-xl border shadow-sm`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${cls.roseText} mb-3 border-b ${cls.tableDiv} pb-2`}>Dampak Finansial</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className={`text-xs ${cls.textSub}`}>Rugi Bahan</p>
                        <p className={`font-mono ${cls.textMain}`}>Rp {Number(errorDetailModal.item.kerugian_bahan).toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${cls.textSub}`}>Rugi Jasa</p>
                        <p className={`font-mono ${cls.textMain}`}>Rp {Number(errorDetailModal.item.kerugian_jasa).toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    {(() => {
                      const base = Number(errorDetailModal.item.kerugian_bahan) + Number(errorDetailModal.item.kerugian_jasa);
                      const total = Number(errorDetailModal.item.jumlah_kerugian);
                      const mult = (base > 0 && total > base) ? Math.round(total / base) : 1;

                      return (
                        <div className={`p-3 rounded-lg border flex flex-col justify-between ${mult > 1 ? 'bg-rose-600 border-rose-700 text-white' : `${cls.cardBg}`}`}>
                          <div className="flex justify-between items-center w-full">
                            <span className={`text-xs font-bold ${mult > 1 ? 'text-rose-100' : cls.roseText}`}>Total Kerugian</span>
                            <span className="font-mono font-bold text-lg">Rp {total.toLocaleString('id-ID')}</span>
                          </div>
                          {mult > 1 && (
                            <div className="mt-1 pt-1 border-t border-rose-500 text-xs font-medium text-rose-100 text-right">
                              Termasuk Penalty {mult}x Lipat!
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`${cls.cardBg} p-4 rounded-xl border shadow-sm h-full`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${cls.textSub} mb-3 border-b ${cls.tableDiv} pb-2`}>Analisis & Penyelesaian</h3>
                    <div className="space-y-4">

                      <div className="flex gap-2">
                        <div className={`flex-1 ${cls.amberCard} px-3 py-2 rounded-lg border`}>
                          <p className={`text-[10px] ${cls.amberText} uppercase font-bold mb-0.5`}>Kategori</p>
                          <p className={`font-medium ${cls.textMain} text-xs`}>{errorDetailModal.item.kategori_kesalahan}</p>
                        </div>
                        <div className={`flex-1 ${cls.blueCard} px-3 py-2 rounded-lg border`}>
                          <p className={`text-[10px] ${cls.indigoText} uppercase font-bold mb-0.5`}>Jenis Error</p>
                          <p className={`font-medium ${cls.textMain} text-xs`}>{errorDetailModal.item.jenis_kesalahan}</p>
                        </div>
                      </div>

                      <div>
                        <p className={`text-xs ${cls.textSub} mb-1`}>Deskripsi / Penyebab Utama</p>
                        <div className={`${cls.cardHeader} p-3 rounded-lg border ${cls.textMain} text-xs leading-relaxed font-bold`}>
                          {errorDetailModal.item.deskripsi_kesalahan || errorDetailModal.item.penyebab || <i>Belum ada deskripsi.</i>}
                        </div>
                      </div>

                      <div>
                        <p className={`text-xs ${cls.textSub} mb-1`}>Solusi / Langkah Pencegahan</p>
                        <div className={`${cls.emeraldCard} p-3 rounded-lg border ${cls.textMain} text-xs leading-relaxed font-medium`}>
                          {errorDetailModal.item.pencegahan_solusi || <i>Belum ada solusi yang dicatat.</i>}
                        </div>
                      </div>

                      <div className={`pt-2 flex justify-between items-center border-t ${cls.tableDiv}`}>
                        <div>
                          <p className={`text-xs ${cls.textSub}`}>Penyelesaian Akhir</p>
                          <p className={`font-medium ${errorDetailModal.item.penyelesaian?.includes('PUNISHMENT') ? `${cls.roseText} font-bold` : cls.textMain}`}>
                            {errorDetailModal.item.penyelesaian || 'Cetak Ulang'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs ${cls.textSub}`}>Qty Rusak</p>
                          <p className={`font-bold ${cls.roseText} text-lg`}>{errorDetailModal.item.qty_kesalahan} <span className="text-xs font-normal">lembar</span></p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className={`${cls.cardBg} border-t p-4 text-center rounded-b-xl`}>
              <button onClick={() => setErrorDetailModal({ isOpen: false, item: null })} className={`px-6 py-2 font-medium rounded-lg transition-colors text-sm ${cls.btnSec}`}>
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Login Admin */}
      {showLoginModal && (
        <div className={`fixed inset-0 ${cls.modalBg} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <div className={`${cls.cardBg} rounded-xl shadow-xl w-full max-w-sm p-6 relative border`}>
            <button onClick={() => setShowLoginModal(false)} className={`absolute top-4 right-4 ${cls.textMuted} hover:${cls.textMain}`}><X className="w-5 h-5" /></button>
            <div className="flex items-center space-x-3 mb-6">
              <Lock className={`w-6 h-6 ${cls.indigoText}`} />
              <h2 className={`text-xl font-bold ${cls.textMain}`}>Otorisasi Admin</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input type="password" value={adminPwdInput} onChange={(e) => setAdminPwdInput(e.target.value)} autoFocus className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${cls.input}`} placeholder="Masukkan password..." />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">Buka Kunci</button>
            </form>
          </div>
        </div>
      )}

      {/* Notifikasi */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg text-white transition-all ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />} {toast.message}
        </div>
      )}

      {/* HEADER UTAMA & TOTAL MESIN GLOBAL */}
      <div className={`flex flex-col xl:flex-row justify-between items-center mb-6 p-4 md:p-6 rounded-xl shadow-sm border transition-colors gap-4 ${cls.cardBg}`}>

        {/* Kiri: Logo & Judul */}
        <div className="flex items-center space-x-4 w-full xl:w-auto justify-center xl:justify-start">
          <div className={`p-3 rounded-xl flex-shrink-0 ${cls.indigoIcon}`}>
            <Printer className="w-8 h-8" />
          </div>
          <div>
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${cls.textMain}`}>Konica Tracker ERP</h1>
            <p className={`text-xs md:text-sm ${cls.textSub}`}>Monitoring Mesin & Log Kesalahan Operasional</p>
          </div>
        </div>

        {/* Kanan: Widget Total Mesin, Dark Mode & Login */}
        <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto">

          {/* BIG CARD: Total Mesin (Permanen di Header) */}
          <div className={`flex items-center space-x-3 py-2 px-4 rounded-lg border shadow-sm transition-colors ${cls.cardHeader}`}>
            <div className={`p-2 rounded-lg hidden sm:block ${cls.cardBg}`}>
              <Activity className={`w-5 h-5 md:w-6 md:h-6 ${cls.indigoText}`} />
            </div>
            <div className="text-left">
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${cls.textSub}`}>Total Mesin (Lifetime)</p>
              <h3 className={`text-lg md:text-2xl font-bold font-mono leading-none ${cls.textMain}`}>
                {currentTotalClicks.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Toggle Dark Mode */}
          <button onClick={toggleTheme} className={`p-2.5 rounded-lg transition-colors border shadow-sm ${cls.btnSec}`} title="Toggle Tema Gelap/Terang">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin Toggle */}
          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} className={`py-2.5 px-4 rounded-lg font-medium text-sm border flex items-center shadow-sm transition-colors ${cls.roseCard} ${cls.roseText}`}>
              <Unlock className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Admin Mode</span>
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className={`py-2.5 px-4 rounded-lg font-medium text-sm border flex items-center shadow-sm transition-colors ${cls.btnSec}`}>
              <Lock className="w-4 h-4 mr-1 md:mr-2" /> <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Kolom Kiri: Input Cepat */}
        <div className="space-y-6">
          <div className={`p-5 rounded-xl shadow-sm border transition-colors ${cls.cardBg}`}>
            <h2 className={`font-bold mb-4 flex items-center ${cls.textMain}`}><PlusCircle className={`w-4 h-4 mr-2 ${cls.indigoText}`} /> Input Shift</h2>
            <form onSubmit={handleSaveData} className="space-y-4 text-sm">
              <div>
                <select value={dateType} onChange={(e) => setDateType(e.target.value)} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`}>
                  <option value="Hari Ini">Data Hari Ini</option>
                  <option value="Kemarin">Data Kemarin</option>
                </select>
              </div>
              <div>
                <input type="text" value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="Nama Operator" className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} />
              </div>
              <div>
                <input type="number" value={newClicks} onChange={(e) => setNewClicks(e.target.value)} placeholder={`Total Klik Mesin Saat Ini`} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 font-bold ${cls.input}`} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded transition-colors flex justify-center items-center"><CheckCircle className="w-4 h-4 mr-2" />Simpan Klik</button>
            </form>
          </div>

          <div className={`p-5 rounded-xl shadow-sm border relative overflow-hidden transition-colors ${cls.cardBg}`}>
            {!isAdmin && <div className={`absolute inset-0 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center ${cls.lockOverlay}`}><Lock className="w-6 h-6 mb-1" /> <span className="text-xs font-medium">Akses Terkunci</span></div>}
            <h2 className={`font-bold mb-4 flex items-center ${cls.textMain}`}><RotateCcw className={`w-4 h-4 mr-2 ${cls.amberText}`} /> Reset Part</h2>
            <form onSubmit={handleReplacePart} className="space-y-4 text-sm">
              <select disabled={!isAdmin} value={replacePart} onChange={(e) => setReplacePart(e.target.value)} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${isAdmin ? cls.input : cls.inputDisabled}`}>
                <option value="">Pilih Part...</option>
                {Object.keys(PART_LIFETIMES).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input disabled={!isAdmin} type="text" value={replaceOperator} onChange={(e) => setReplaceOperator(e.target.value)} placeholder="Nama Teknisi" className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${isAdmin ? cls.input : cls.inputDisabled}`} />
              <button type="submit" disabled={!isAdmin} className={`w-full font-medium py-2 rounded transition-colors ${isAdmin ? `${cls.amberCard} ${cls.amberText}` : cls.inputDisabled}`}>Reset Sekarang</button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan Utama: Area TABS */}
        <div className="lg:col-span-3 space-y-4">

          {/* Navigation Tabs */}
          <div className={`flex rounded-xl shadow-sm border p-1 overflow-x-auto hide-scrollbar transition-colors ${cls.cardBg}`}>
            <button onClick={() => setActiveTab('dashboard')} className={`flex-1 min-w-[150px] px-4 py-2.5 rounded-lg text-sm font-medium flex justify-center items-center whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? cls.tabAct : cls.tabInact}`}><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</button>
            <button onClick={() => setActiveTab('monitoring')} className={`flex-1 min-w-[150px] px-4 py-2.5 rounded-lg text-sm font-medium flex justify-center items-center whitespace-nowrap transition-colors ${activeTab === 'monitoring' ? cls.tabAct : cls.tabInact}`}><Settings className="w-4 h-4 mr-2" /> Umur Part</button>
            <button onClick={() => setActiveTab('error_log')} className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-lg text-sm font-medium flex justify-center items-center whitespace-nowrap transition-colors ${activeTab === 'error_log' ? cls.tabActRose : cls.tabInact}`}><FileWarning className="w-4 h-4 mr-2" /> Log Kesalahan (Error)</button>
            <button onClick={() => setActiveTab('report')} className={`flex-1 min-w-[160px] px-4 py-2.5 rounded-lg text-sm font-medium flex justify-center items-center whitespace-nowrap transition-colors ${activeTab === 'report' ? cls.tabAct : cls.tabInact}`}><FileText className="w-4 h-4 mr-2" /> Laporan & Filter</button>
          </div>

          {/* AREA GLOBAL FILTER (Muncul di Dashboard & Report) */}
          {(activeTab === 'dashboard' || activeTab === 'report') && (
            <div className={`p-4 md:px-6 md:py-4 rounded-xl border shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors ${cls.cardBg}`}>
              <div className="flex items-center space-x-2">
                <Filter className={`w-5 h-5 ${cls.indigoText}`} />
                <h2 className={`text-lg font-bold ${cls.textMain}`}>
                  {activeTab === 'dashboard' ? 'Periode Summary' : 'Filter Multi-Laporan'}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`font-medium hidden md:inline ${cls.textSub}`}>Periode:</span>
                <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className={`py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 ${cls.input}`}>
                  <option value="today">Hari Ini</option><option value="week">7 Hari Terakhir</option><option value="month">Bulan Ini</option><option value="custom">Pilih Tanggal...</option>
                </select>
                {reportPeriod === 'custom' && (
                  <div className={`flex items-center space-x-2 border rounded-lg px-2 py-1 ${cls.cardBg}`}>
                    <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className={`border-none bg-transparent text-sm focus:ring-0 p-1 ${cls.textMain}`} />
                    <span className={cls.textMuted}>-</span>
                    <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className={`border-none bg-transparent text-sm focus:ring-0 p-1 ${cls.textMain}`} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 0: Dashboard (BARU) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Kartu Summary Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card: Pemakaian Kertas */}
                <div className={`p-6 rounded-xl border shadow-sm transition-colors ${cls.indigoCard}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className={`text-sm font-medium ${cls.indigoText} mb-1`}>Total Klik Tercetak</p>
                      <h3 className={`text-3xl font-bold font-mono ${cls.textMain}`}>{totalReportUsage.toLocaleString()}</h3>
                    </div>
                    <div className={`p-3 rounded-lg ${cls.cardBg}`}>
                      <Printer className={`w-6 h-6 ${cls.indigoText}`} />
                    </div>
                  </div>
                  <div className={`text-xs ${cls.textSub}`}>Pemakaian dalam periode yang dipilih</div>
                </div>

                {/* Card: Estimasi Pendapatan */}
                <div className={`p-6 rounded-xl border shadow-sm transition-colors ${cls.emeraldCard}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className={`text-sm font-medium ${cls.emeraldText} mb-1`}>Estimasi Pendapatan</p>
                      <h3 className={`text-3xl font-bold font-mono ${cls.textMain}`}>Rp {totalGrossRevenue.toLocaleString('id-ID')}</h3>
                    </div>
                    <div className={`p-3 rounded-lg ${cls.cardBg}`}>
                      <DollarSign className={`w-6 h-6 ${cls.emeraldText}`} />
                    </div>
                  </div>
                  <div className={`text-xs ${cls.textSub}`}>Dikalkulasi: {totalReportUsage.toLocaleString()} klik x Rp {clickPrice.toLocaleString('id-ID')}</div>
                </div>

              </div>

              {/* ROW GRAFIK VISUAL (CUSTOM NATIVE CSS CHART) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Bar Chart - Tren Pemakaian Harian (Lebar 2 Kolom) */}
                <div className={`col-span-1 lg:col-span-2 p-6 rounded-xl border shadow-sm ${cls.cardBg}`}>
                  <div className="flex items-center space-x-2 mb-6">
                    <TrendingUp className={`w-5 h-5 ${cls.indigoText}`} />
                    <h3 className={`font-bold ${cls.textMain}`}>Tren Pemakaian Klik Harian</h3>
                  </div>

                  <div className={`h-48 flex items-end gap-1.5 mt-4 relative border-b pb-1 ${cls.chartAxisLine}`}>
                    {clickChartData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip Hover */}
                        <div className={`absolute -top-10 opacity-0 group-hover:opacity-100 text-xs py-1 px-2 rounded pointer-events-none z-10 transition-opacity whitespace-nowrap ${cls.chartTooltip}`}>
                          {d.fullDate}: <span className="font-bold">{d.total.toLocaleString()}</span> klik
                        </div>
                        {/* Balok Grafik (Bar) */}
                        <div className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ease-out ${cls.chartBar}`} style={{ height: maxClickChart > 0 ? `${(d.total / maxClickChart) * 100}%` : '0%' }}></div>
                        {/* Tanggal X-Axis */}
                        <div className={`text-[9px] md:text-[10px] mt-2 ${cls.textSub} truncate w-full text-center hidden sm:block`}>{d.shortDate}</div>
                      </div>
                    ))}
                    {clickChartData.length === 0 && <div className={`w-full text-center self-center text-sm ${cls.textMuted}`}>Tidak ada data tren di periode ini.</div>}
                  </div>
                </div>

                {/* Horizontal Stacked Bar - Komposisi Error (Lebar 1 Kolom) */}
                <div className={`col-span-1 p-6 rounded-xl border shadow-sm flex flex-col ${cls.cardBg}`}>
                  <div className="flex items-center space-x-2 mb-6">
                    <PieChart className={`w-5 h-5 ${cls.roseText}`} />
                    <h3 className={`font-bold ${cls.textMain}`}>Komposisi Kerugian Error</h3>
                  </div>

                  {errorChartData.length > 0 ? (
                    <div className="space-y-6 flex-grow flex flex-col justify-center">
                      {/* Horizontal Stack Bar (Mirip Donut Chart 1D) */}
                      <div className={`h-5 flex rounded-full overflow-hidden w-full ${cls.cardHeader}`}>
                        {errorChartData.map((d, i) => (
                          <div key={i} className={`h-full ${d.color} transition-all duration-500`} style={{ width: totalRupiahKerugian > 0 ? `${(d.value / totalRupiahKerugian) * 100}%` : '0%' }}></div>
                        ))}
                      </div>

                      {/* Legend Informasi */}
                      <div className="space-y-3">
                        {errorChartData.map((d, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${d.color}`}></div>
                              <span className={`text-xs md:text-sm font-medium ${cls.textSub}`}>{d.name}</span>
                            </div>
                            <div className="text-right flex items-center">
                              <span className={`text-xs md:text-sm font-bold font-mono ${cls.textMain}`}>Rp {(d.value / 1000).toFixed(0)}k</span>
                              <span className={`text-[10px] w-10 text-right ml-1 ${cls.textMuted}`}>{totalRupiahKerugian > 0 ? ((d.value / totalRupiahKerugian) * 100).toFixed(0) : 0}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={`h-full flex items-center justify-center text-sm py-10 ${cls.textMuted}`}>
                      Hebat! Tidak ada error.
                    </div>
                  )}
                </div>
              </div>

              {/* Sekilas Informasi / Tips di Dashboard */}
              <div className={`p-5 rounded-xl border flex items-start space-x-4 ${cls.cardBg}`}>
                <div className={`p-3 rounded-full ${cls.amberCard} flex-shrink-0`}>
                  <Info className={`w-6 h-6 ${cls.amberText}`} />
                </div>
                <div>
                  <h4 className={`font-bold ${cls.textMain} mb-1`}>Pusat Kendali Eksekutif</h4>
                  <p className={`text-sm ${cls.textSub} leading-relaxed`}>
                    Halaman ini menampilkan kalkulasi pendapatan kotor berdasarkan jumlah klik yang diinput operator dikalikan dengan tarif per klik saat ini <b>(Rp {clickPrice.toLocaleString('id-ID')})</b>.
                    Untuk mengubah tarif, silakan Login sebagai Admin dan sesuaikan pada panel bagian bawah.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Monitoring Part */}
          {activeTab === 'monitoring' && (
            <div className={`rounded-xl shadow-sm border overflow-hidden animate-in fade-in duration-300 transition-colors ${cls.cardBg}`}>
              <div className={`p-4 md:p-6 border-b flex justify-between items-center ${cls.cardHeader}`}>
                <div className="flex items-center space-x-2">
                  <Settings className={`w-5 h-5 ${cls.textSub}`} />
                  <h2 className={`text-lg font-bold ${cls.textMain}`}>Status Suku Cadang</h2>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className={`sticky top-0 z-10 shadow-sm border-b ${cls.tableHead}`}>
                    <tr>
                      <th className="px-6 py-4 font-semibold">Nama Suku Cadang</th>
                      <th className="px-6 py-4 font-semibold text-right">Dipakai</th>
                      <th className="px-6 py-4 font-semibold">Indikator Sisa Umur</th>
                      <th className="px-6 py-4 font-semibold text-right">Est. Ganti</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${cls.tableDiv}`}>
                    {partData.map((part, idx) => (
                      <tr key={idx} className={`transition-colors ${cls.tableRow}`}>
                        <td className={`px-6 py-3 font-medium ${cls.textMain}`}>{part.name}</td>
                        <td className={`px-6 py-3 text-right font-mono ${cls.textSub}`}>{part.usage.toLocaleString()}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            <div className={`w-full rounded-full h-2.5 mr-3 overflow-hidden ${cls.cardHeader}`}><div className={`h-2.5 rounded-full ${part.color} transition-all duration-500`} style={{ width: `${part.remainingPercent}%` }}></div></div>
                            <span className={`text-xs font-bold w-12 text-right ${part.remainingPercent <= 10 ? cls.roseText : (part.remainingPercent <= 25 ? cls.amberText : 'text-emerald-500')}`}>{part.remainingPercent}%</span>
                          </div>
                        </td>
                        <td className={`px-6 py-3 text-right font-mono ${cls.textSub}`}>{part.estimatedReplace.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Log Error */}
          {activeTab === 'error_log' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${cls.cardBg}`}>
                <div className={`p-4 md:p-6 border-b ${cls.roseCard}`}>
                  <h3 className={`font-bold flex items-center ${cls.textMain}`}><AlertTriangle className={`w-5 h-5 mr-2 ${cls.roseText}`} /> Form Pencatatan Kesalahan (Error Log)</h3>
                  <p className={`text-xs mt-1 ml-7 ${cls.textSub}`}>Catat semua kesalahan operasional, mesin, atau desain untuk evaluasi kerugian.</p>
                </div>
                <div className="p-4 md:p-6">
                  <form onSubmit={handleSaveErrorLog} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

                    {/* ALERT WARNING PUNISHMENT */}
                    {currentMultiplier > 1 && errorForm.pic && errorForm.deskripsi_kesalahan && (
                      <div className={`col-span-1 md:col-span-3 p-3 rounded-lg flex items-center shadow-sm animate-in fade-in border ${cls.roseCard} ${cls.roseText}`}>
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">
                          Peringatan: Ini adalah kesalahan dengan deskripsi <strong>"{errorForm.deskripsi_kesalahan}"</strong> ke-{currentMultiplier} untuk PIC <strong>{errorForm.pic.toUpperCase()}</strong>.
                          Sistem akan otomatis mengenakan <span className="font-bold underline">PUNISHMENT {currentMultiplier}X LIPAT</span> pada jumlah kerugian!
                        </p>
                      </div>
                    )}

                    {/* Kolom 1: Info Order */}
                    <div className="space-y-4">
                      <div className={`p-3 rounded-lg border ${cls.cardHeader}`}>
                        <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wider ${cls.textMain}`}>Detail Order</h4>
                        <div className="space-y-3">
                          <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Tanggal Kejadian</label><input type="date" value={errorForm.tgl} onChange={e => setErrorForm({ ...errorForm, tgl: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                          <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>No. Invoice CRM</label><input type="text" value={errorForm.nomor_invoice} onChange={e => setErrorForm({ ...errorForm, nomor_invoice: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} placeholder="Misal: INV-12345" /></div>
                          <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Nama Konsumen</label><input type="text" value={errorForm.nama_konsumen} onChange={e => setErrorForm({ ...errorForm, nama_konsumen: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                          <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Nama Barang / Produk</label><input type="text" value={errorForm.nama_produk} onChange={e => setErrorForm({ ...errorForm, nama_produk: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} placeholder="Ketik jenis cetakan..." required /></div>
                        </div>
                      </div>
                    </div>

                    {/* Kolom 2: Analisis Kesalahan */}
                    <div className="space-y-4">
                      <div className={`p-3 rounded-lg border ${cls.cardHeader}`}>
                        <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wider ${cls.textMain}`}>Analisis Kesalahan</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Kategori</label>
                              <select value={errorForm.kategori_kesalahan} onChange={e => setErrorForm({ ...errorForm, kategori_kesalahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`}>
                                <option value="Kesesuaian/Ketepatan">Kesesuaian/Ketepatan</option><option value="Kualitas">Kualitas</option><option value="Desain">Desain</option><option value="Bahan">Bahan</option><option value="Prosedur/Proses">Prosedur/Proses</option>
                              </select>
                            </div>
                            <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Jenis</label>
                              <select value={errorForm.jenis_kesalahan} onChange={e => setErrorForm({ ...errorForm, jenis_kesalahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`}>
                                <option value="Machine Error">Machine Error</option><option value="Human Error">Human Error</option><option value="Print Test">Print Test</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Qty Rusak</label><input type="number" value={errorForm.qty_kesalahan} onChange={e => setErrorForm({ ...errorForm, qty_kesalahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} required /></div>
                            <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>PIC Terlibat</label><input type="text" value={errorForm.pic} onChange={e => setErrorForm({ ...errorForm, pic: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} placeholder="Ketik nama..." required /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div><label className={`text-xs font-medium ${cls.roseText} block mb-1`}>Rugi Bahan (Rp)</label><input type="number" value={errorForm.kerugian_bahan} onChange={e => setErrorForm({ ...errorForm, kerugian_bahan: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} placeholder="0" /></div>
                            <div><label className={`text-xs font-medium ${cls.roseText} block mb-1`}>Rugi Jasa (Rp)</label><input type="number" value={errorForm.kerugian_jasa} onChange={e => setErrorForm({ ...errorForm, kerugian_jasa: e.target.value })} className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${cls.input}`} placeholder="0" /></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Kolom 3: Evaluasi & Solusi */}
                    <div className="space-y-4 flex flex-col h-full justify-between">
                      <div className={`p-3 rounded-lg border flex-grow ${cls.cardHeader}`}>
                        <h4 className={`font-semibold mb-3 text-xs uppercase tracking-wider ${cls.textMain}`}>Evaluasi & Tindakan</h4>
                        <div className="space-y-3">
                          <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Deskripsi Kesalahan</label><textarea value={errorForm.deskripsi_kesalahan} onChange={e => setErrorForm({ ...errorForm, deskripsi_kesalahan: e.target.value })} className={`w-full p-2 border rounded text-xs focus:outline-none focus:ring-2 ${cls.input}`} rows="3" placeholder="Ceritakan masalah..."></textarea></div>
                          <div><label className={`text-xs font-medium block mb-1 ${cls.textSub}`}>Pencegahan / Solusi</label><textarea value={errorForm.pencegahan_solusi} onChange={e => setErrorForm({ ...errorForm, pencegahan_solusi: e.target.value })} className={`w-full p-2 border rounded text-xs focus:outline-none focus:ring-2 ${cls.input}`} rows="3" placeholder="Langkah agar tidak terulang..."></textarea></div>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center shadow-sm">
                        <CheckCircle className="w-5 h-5 mr-2" /> {currentMultiplier > 1 ? `Simpan & Terapkan Penalty ${currentMultiplier}x` : 'Simpan Log Error'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Laporan & Filter */}
          {activeTab === 'report' && (
            <div className={`rounded-xl shadow-sm border overflow-hidden animate-in fade-in duration-300 transition-colors ${cls.cardBg}`}>
              <div className="p-4 md:p-6 space-y-8">

                {/* --- Laporan 1: Klik Mesin --- */}
                <div className={`border rounded-xl overflow-hidden shadow-sm ${cls.indigoCard}`}>
                  <div className={`px-4 py-3 flex flex-col sm:flex-row justify-between sm:items-center border-b gap-2 ${cls.indigoCard}`}>
                    <div className={`flex items-center space-x-2 font-bold ${cls.indigoText}`}>
                      <Printer className="w-4 h-4" /> <span>Laporan Pemakaian Mesin</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${cls.cardBg} ${cls.indigoText}`}>
                      Total: {totalReportUsage.toLocaleString()} klik
                    </div>
                  </div>
                  <div className={`overflow-x-auto max-h-[300px] overflow-y-auto ${cls.cardBg}`}>
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className={`sticky top-0 border-b z-10 ${cls.tableHead}`}>
                        <tr><th className="px-4 py-2.5 font-medium">Tgl Input</th><th className="px-4 py-2.5 font-medium">Berlaku Untuk</th><th className="px-4 py-2.5 font-medium">Operator</th><th className="px-4 py-2.5 font-medium text-right">Total Mesin</th><th className="px-4 py-2.5 font-medium text-right">Pemakaian</th></tr>
                      </thead>
                      <tbody className={`divide-y ${cls.tableDiv}`}>
                        {reportClicks.map(item => (
                          <tr key={item.id} className={`transition-colors ${cls.tableRow}`}>
                            <td className={`px-4 py-2 text-xs ${cls.textSub}`}>{item.dateStr.split(' ')[0]}</td><td className={`px-4 py-2 font-medium ${cls.textMain}`}>{item.dateFor}</td><td className={`px-4 py-2 ${cls.textSub}`}>{item.operator}</td><td className={`px-4 py-2 text-right font-mono ${cls.textMuted}`}>{item.totalClicks.toLocaleString()}</td><td className={`px-4 py-2 text-right font-mono font-bold ${cls.indigoText}`}>+{item.dailyClicks.toLocaleString()}</td>
                          </tr>
                        ))}
                        {reportClicks.length === 0 && <tr><td colSpan="5" className={`text-center py-6 ${cls.textMuted}`}>Tidak ada data pemakaian di periode ini.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* --- Laporan 2: Error Log --- */}
                <div className={`border rounded-xl overflow-hidden shadow-sm ${cls.roseCard}`}>
                  <div className={`px-4 py-3 flex flex-col sm:flex-row justify-between sm:items-center border-b gap-2 ${cls.roseCard}`}>
                    <div className={`flex items-center space-x-2 font-bold ${cls.roseText}`}>
                      <FileWarning className="w-4 h-4" /> <span>Laporan Kesalahan (Error Log)</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${cls.cardBg} ${cls.roseText}`}>
                      Est. Rugi: Rp {totalRupiahKerugian.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className={`overflow-x-auto max-h-[300px] overflow-y-auto ${cls.cardBg}`}>
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className={`sticky top-0 border-b z-10 ${cls.tableHead}`}>
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Tanggal</th>
                          <th className="px-4 py-2.5 font-medium">No. Invoice</th>
                          <th className="px-4 py-2.5 font-medium">Konsumen/Produk</th>
                          <th className="px-4 py-2.5 font-medium">Jenis Error</th>
                          <th className="px-4 py-2.5 font-medium text-right">Rugi (Rp)</th>
                          <th className="px-4 py-2.5 font-medium">PIC</th>
                          <th className="px-4 py-2.5 font-medium text-center">Detail</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${cls.tableDiv}`}>
                        {reportErrors.map(item => {
                          const baseLoss = Number(item.kerugian_bahan) + Number(item.kerugian_jasa);
                          const isPunished = baseLoss > 0 && Number(item.jumlah_kerugian) > baseLoss;
                          const mult = isPunished ? Math.round(Number(item.jumlah_kerugian) / baseLoss) : 1;

                          return (
                            <tr key={item.id} className={`transition-colors group ${cls.tableRow}`}>
                              <td className={`px-4 py-2 text-xs ${cls.textSub}`}>{formatDateToLocale(item.tgl)}</td>
                              <td className={`px-4 py-2 font-mono text-xs ${cls.indigoText}`}>{item.nomor_invoice || '-'}</td>
                              <td className="px-4 py-2">
                                <div className={`font-medium ${cls.textMain}`}>{item.nama_konsumen}</div>
                                <div className={`text-xs truncate max-w-[150px] ${cls.textSub}`}>{item.nama_produk}</div>
                              </td>
                              <td className="px-4 py-2 text-xs">
                                <span className={`px-2 py-0.5 rounded ${cls.cardHeader} ${cls.textMain}`}>{item.jenis_kesalahan}</span>
                              </td>
                              <td className="px-4 py-2 text-right">
                                <div className={`font-mono font-medium ${isPunished ? cls.roseText : cls.textMain}`}>
                                  {Number(item.jumlah_kerugian).toLocaleString('id-ID')}
                                </div>
                                {isPunished && (
                                  <div className={`text-[10px] font-bold border rounded px-1 mt-0.5 inline-block ${cls.roseCard} ${cls.roseText}`}>
                                    Penalty {mult}x
                                  </div>
                                )}
                              </td>
                              <td className={`px-4 py-2 ${cls.textSub}`}>{item.pic}</td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => setErrorDetailModal({ isOpen: true, item: item })}
                                  className={`p-1.5 rounded transition-colors md:opacity-70 md:group-hover:opacity-100 ${cls.indigoText} ${cls.btnSec}`}
                                  title="Lihat Detail Investigasi"
                                >
                                  <Eye className="w-4 h-4 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                        {reportErrors.length === 0 && <tr><td colSpan="7" className={`text-center py-6 ${cls.textMuted}`}>Alhamdulillah, tidak ada error di periode ini.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* --- Laporan 3: Ganti Part --- */}
                <div className={`border rounded-xl overflow-hidden shadow-sm ${cls.amberCard}`}>
                  <div className={`px-4 py-3 flex flex-col sm:flex-row justify-between sm:items-center border-b gap-2 ${cls.amberCard}`}>
                    <div className={`flex items-center space-x-2 font-bold ${cls.amberText}`}>
                      <RotateCcw className="w-4 h-4" /> <span>Riwayat Pergantian Part Mesin</span>
                    </div>
                  </div>
                  <div className={`overflow-x-auto max-h-[250px] overflow-y-auto ${cls.cardBg}`}>
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className={`sticky top-0 border-b z-10 ${cls.tableHead}`}>
                        <tr><th className="px-4 py-2.5 font-medium">Tanggal Ganti</th><th className="px-4 py-2.5 font-medium">Suku Cadang</th><th className="px-4 py-2.5 font-medium">Teknisi / PIC</th><th className="px-4 py-2.5 font-medium text-right">Di Klik Ke-</th></tr>
                      </thead>
                      <tbody className={`divide-y ${cls.tableDiv}`}>
                        {reportReplacements.map(item => (
                          <tr key={item.id} className={`transition-colors ${cls.tableRow}`}>
                            <td className={`px-4 py-2 text-xs ${cls.textSub}`}>{formatDateToLocale(item.createdAt)}</td><td className={`px-4 py-2 font-medium ${cls.amberText}`}>{item.partName}</td><td className={`px-4 py-2 ${cls.textSub}`}>{item.operator}</td><td className={`px-4 py-2 text-right font-mono ${cls.textMuted}`}>{item.replacedAtClick.toLocaleString()}</td>
                          </tr>
                        ))}
                        {reportReplacements.length === 0 && <tr><td colSpan="4" className={`text-center py-6 ${cls.textMuted}`}>Tidak ada pergantian part di periode ini.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- ADMIN PANEL KHUSUS PENGATURAN, EDIT & HAPUS DATA --- */}
      {isAdmin && (
        <div className={`mt-10 border rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors ${cls.cardBg} border-rose-200 dark:border-rose-900/50`}>
          <div className={`p-4 border-b flex items-center justify-between ${cls.roseCard}`}>
            <div className={`flex items-center space-x-2 ${cls.roseText}`}>
              <Settings className="w-5 h-5" />
              <h2 className="font-bold text-lg">Admin Panel: Pengaturan & Manajemen Data</h2>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${cls.roseCard} border ${cls.roseText}`}>Superuser Area</span>
          </div>

          <div className="p-4 md:p-6 space-y-6">

            {/* Pengaturan Sistem */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cls.cardHeader}`}>
              <div>
                <h3 className={`font-bold ${cls.textMain}`}>Pengaturan Sistem (Tarif per Klik)</h3>
                <p className={`text-xs mt-1 ${cls.textSub}`}>Harga ini akan digunakan untuk mengkalkulasi total estimasi pendapatan kotor di halaman Dashboard Summary.</p>
              </div>
              <form onSubmit={handleUpdatePrice} className="flex items-center space-x-2 w-full md:w-auto">
                <div className="relative">
                  <span className={`absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-medium ${cls.textMuted}`}>Rp</span>
                  <input type="number" value={adminPriceInput} onChange={(e) => setAdminPriceInput(e.target.value)} className={`w-32 pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono ${cls.input}`} placeholder="1000" />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">Simpan Harga</button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Tabel Edit/Hapus Klik */}
              <div className={`border rounded-xl overflow-hidden flex flex-col ${cls.cardHeader}`}>
                <div className={`px-4 py-3 font-bold border-b text-sm flex items-center ${cls.textMain} ${cls.tableDiv}`}><Printer className={`w-4 h-4 mr-2 ${cls.textSub}`} /> Data Klik Mesin</div>
                <div className={`overflow-y-auto h-[350px] ${cls.cardBg}`}>
                  {sortedHistory.slice().reverse().map(h => (
                    <div key={h.id} className={`flex justify-between items-center p-3 border-b text-sm transition-colors ${cls.tableDiv} ${cls.tableRow}`}>
                      <div className="truncate">
                        <div className={`font-medium ${cls.textMain}`}>{h.dateFor}</div>
                        <div className={`text-xs ${cls.textSub}`}>{h.operator} • {h.totalClicks.toLocaleString()}k</div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button onClick={() => confirmEditClick(h)} className={`p-1.5 rounded transition-colors ${cls.btnSec} ${cls.indigoText}`}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => confirmDelete(h, 'click')} className={`p-1.5 rounded transition-colors ${cls.btnSec} ${cls.roseText}`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabel Hapus Error Log */}
              <div className={`border rounded-xl overflow-hidden flex flex-col ${cls.cardHeader}`}>
                <div className={`px-4 py-3 font-bold border-b text-sm flex items-center ${cls.textMain} ${cls.tableDiv}`}><AlertTriangle className={`w-4 h-4 mr-2 ${cls.roseText}`} /> Data Log Error</div>
                <div className={`overflow-y-auto h-[350px] ${cls.cardBg}`}>
                  {errorLogs.map(h => (
                    <div key={h.id} className={`flex justify-between items-center p-3 border-b text-sm transition-colors ${cls.tableDiv} ${cls.tableRow}`}>
                      <div className="truncate pr-2">
                        <div className={`font-medium truncate ${cls.textMain}`}>{h.nama_konsumen}</div>
                        <div className={`text-xs ${cls.textSub}`}>{formatDateToLocale(h.tgl)} • {h.jenis_kesalahan}</div>
                      </div>
                      <div className="flex space-x-1 ml-2 flex-shrink-0">
                        <button onClick={() => confirmEditError(h)} className={`p-1.5 rounded transition-colors ${cls.btnSec} ${cls.indigoText}`} title="Edit Data Ini"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => confirmDelete(h, 'error')} className={`p-1.5 rounded transition-colors ${cls.btnSec} ${cls.roseText}`} title="Hapus Data Ini"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {errorLogs.length === 0 && <div className={`p-4 text-center text-sm ${cls.textMuted}`}>Belum ada data error.</div>}
                </div>
              </div>

              {/* Tabel Hapus Part */}
              <div className={`border rounded-xl overflow-hidden flex flex-col ${cls.cardHeader}`}>
                <div className={`px-4 py-3 font-bold border-b text-sm flex items-center ${cls.textMain} ${cls.tableDiv}`}><RotateCcw className={`w-4 h-4 mr-2 ${cls.amberText}`} /> Data Ganti Part</div>
                <div className={`overflow-y-auto h-[350px] ${cls.cardBg}`}>
                  {replacementHistory.slice().reverse().map(h => (
                    <div key={h.id} className={`flex justify-between items-center p-3 border-b text-sm transition-colors ${cls.tableDiv} ${cls.tableRow}`}>
                      <div className="truncate pr-2">
                        <div className={`font-medium truncate ${cls.amberText}`}>{h.partName}</div>
                        <div className={`text-xs ${cls.textSub}`}>{formatDateToLocale(h.createdAt)} • Oleh: {h.operator}</div>
                      </div>
                      <button onClick={() => confirmDelete(h, 'part')} className={`p-1.5 rounded transition-colors flex-shrink-0 ${cls.btnSec} ${cls.roseText}`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className={`mt-8 text-center text-xs flex justify-center items-center ${cls.textMuted}`}>
        <Info className="w-3 h-3 mr-1" /> Konica Tracker ERP terhubung dengan Supabase
      </div>

    </div>
  );
}