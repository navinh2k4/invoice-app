import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, Download, RefreshCw, Sparkles, X, Edit3, Eye, MessageCircle, 
  Image as ImageIcon, Lightbulb, ShieldAlert, HeartHandshake, User, 
  Megaphone, Store, CalendarClock, ScanBarcode, Smartphone, Maximize, 
  Trash2, Plus, Package, FileText, Share2
} from 'lucide-react';

// --- CONFIGURATION: ENVIRONMENT VARIABLES ---
const getApiKey = () => {
  let key = "";
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      key = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {}
  if (!key) {
    try {
      if (typeof process !== 'undefined' && process.env) {
          key = process.env.REACT_APP_GEMINI_API_KEY || 
                process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
                process.env.GEMINI_API_KEY || ""; 
      }
    } catch (e) {}
  }
  return key;
};

const apiKey = getApiKey();

// --- DATA ---
const BARCODE_DB = {
    '8934868541315': { name: 'Dầu ăn Tường An 1L', unit: 'Chai', price: 45000 },
    '8935016800096': { name: 'Nước mắm Nam Ngư 750ml', unit: 'Chai', price: 32000 },
    '8934561608034': { name: 'Bột giặt OMO Sạch Cực Nhanh 6kg', unit: 'Túi', price: 215000 },
    '8934673678326': { name: 'Mì Hảo Hảo Tôm Chua Cay', unit: 'Thùng', price: 115000 },
    '8934588013149': { name: 'Nước ngọt Coca-Cola 1.5L', unit: 'Chai', price: 20000 },
    '1000000000001': { name: 'APN Mepix 247 (Sâu cuốn lá)', unit: 'Chai', price: 150000 },
    '1000000000002': { name: 'Cabophos 500ml', unit: 'Chai', price: 85000 },
    '1000000000003': { name: 'Anvil 5SC (Syngenta)', unit: 'Chai', price: 260000 },
    '1000000000004': { name: 'Nativo 750WG (Bayer)', unit: 'Gói', price: 45000 },
};

const PAPER_TYPES = {
  'a4': { name: 'A4', format: 'a4', orientation: 'portrait', width: '210mm', height: '297mm', pixelWidth: 794 }, // ~96dpi
  'a5': { name: 'A5', format: 'a5', orientation: 'portrait', width: '148mm', height: '210mm', pixelWidth: 559 },
};

const STORE_MODES = {
  'pesticide': { label: 'Thuốc BVTV', headerTitle: 'HÓA ĐƠN THUỐC BVTV', context: 'cửa hàng vật tư nông nghiệp', defaultItems: [{ id: 1, name: 'APN Mepix 247', unit: 'Chai', qty: 40, price: 150000, barcode: '1000000000001' }, { id: 2, name: 'Cabophos 500ml', unit: 'Chai', qty: 24, price: 85000, barcode: '1000000000002' }] },
  'grocery': { label: 'Tạp Hóa', headerTitle: 'HÓA ĐƠN BÁN LẺ', context: 'cửa hàng tạp hóa', defaultItems: [{ id: 1, name: 'Dầu ăn Tường An 1L', unit: 'Chai', qty: 10, price: 45000, barcode: '8934868541315' }, { id: 2, name: 'Nước mắm Nam Ngư', unit: 'Chai', qty: 5, price: 32000, barcode: '8935016800096' }] },
  'vet': { label: 'Thú Y', headerTitle: 'HÓA ĐƠN THÚ Y', context: 'cửa hàng thuốc thú y', defaultItems: [{ id: 1, name: 'Cám heo Con Cò', unit: 'Bao', qty: 5, price: 280000, barcode: '' }, { id: 2, name: 'Thuốc tẩy giun', unit: 'Lọ', qty: 20, price: 15000, barcode: '' }] },
  'wedding': { label: 'Dịch Vụ Cưới', headerTitle: 'HÓA ĐƠN DỊCH VỤ', context: 'dịch vụ cưới hỏi', defaultItems: [{ id: 1, name: 'Mâm quả Rồng Phụng', unit: 'Cặp', qty: 1, price: 3500000, barcode: '' }] }
};

const DAILY_LIMIT = 30;

// --- COMPONENT LOAD AI ---
const AILoader = ({ message }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
    <div className="bg-white/90 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center"><Sparkles size={18} className="text-purple-600 animate-pulse" /></div>
      </div>
      <div className="text-center">
        <h3 className="font-bold text-gray-800">Gemini AI Đang Xử Lý</h3>
        <p className="text-sm text-gray-600 mt-1 animate-pulse">{message}</p>
      </div>
    </div>
  </div>
);

export default function App() {
  // --- STATE ---
  const [storeMode, setStoreMode] = useState('pesticide');
  const [items, setItems] = useState(STORE_MODES['pesticide'].defaultItems);
  const [shopName, setShopName] = useState('ĐẠI LÝ THÀNH ĐẠT');
  const [shopSlogan, setShopSlogan] = useState('Uy tín - Chất lượng - Tận tâm');
  const [shopPhone, setShopPhone] = useState('0909 123 456');
  const [shopAddress, setShopAddress] = useState('123 Đường ABC, Huyện XYZ');
  const [customerName, setCustomerName] = useState('Khách Lẻ');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [note, setNote] = useState('Kiểm hàng kỹ trước khi nhận');
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [invoiceCode, setInvoiceCode] = useState('HD001');
  const [bankInfo, setBankInfo] = useState('• Ngân hàng: Agribank\n• STK: 123456789\n• CTK: NGUYEN VAN A');
  const [showBankInfo, setShowBankInfo] = useState(true);
  
  // Settings
  const [paperType, setPaperType] = useState('a4');
  const [isEditMode, setIsEditMode] = useState(true);
  const [exportMode, setExportMode] = useState('invoice'); // 'invoice' | 'delivery'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAutoFit, setIsAutoFit] = useState(true); // Default auto-fit on mobile
  const [isExporting, setIsExporting] = useState(false); // Trạng thái đang xuất file

  // AI & Logic State
  const [aiStatus, setAiStatus] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [advisorContent, setAdvisorContent] = useState('');
  const [advisorTitle, setAdvisorTitle] = useState('');
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgModalTitle, setMsgModalTitle] = useState('');
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [amountInWords, setAmountInWords] = useState('');
  const [usageCount, setUsageCount] = useState(0);

  // Refs
  const noteRef = useRef(null);
  const scanInputRef = useRef(null);
  const paperContainerRef = useRef(null);

  // --- RESPONSIVE SCALING LOGIC ---
  useEffect(() => {
    const handleResize = () => {
      if (isAutoFit && paperContainerRef.current) {
        const containerWidth = paperContainerRef.current.offsetWidth;
        const paperPixelWidth = PAPER_TYPES[paperType].pixelWidth; // Width in pixels for A4/A5
        const padding = 32; // 16px padding each side
        
        // Calculate scale needed to fit paper into container
        let scale = (containerWidth - padding) / paperPixelWidth;
        // Cap scale at 1 (don't zoom in larger than actual size automatically)
        if (scale > 1) scale = 1;
        setZoomLevel(scale);
      } else if (!isAutoFit) {
        setZoomLevel(1);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init on mount
    return () => window.removeEventListener('resize', handleResize);
  }, [paperType, isAutoFit]);

  // --- AI & HELPERS ---
  const callGemini = async (prompt, imageData = null) => {
    const key = apiKey;
    if (!key) { alert("Thiếu API Key!"); return null; }
    if (usageCount >= DAILY_LIMIT) { alert("Hết lượt miễn phí hôm nay!"); return null; }

    try {
      let payload = { contents: [{ parts: [{ text: prompt }] }] };
      if (imageData) {
         payload.contents[0].parts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.data } });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Lỗi AI");
      setUsageCount(p => p + 1);
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) { alert("Lỗi: " + e.message); return null; }
  };

  const handleSmartImport = async () => {
      if (!importText.trim()) return;
      setAiStatus("Đang đọc đơn hàng...");
      const prompt = `Trích xuất thông tin đơn hàng từ text sau: "${importText}". Ngữ cảnh: ${STORE_MODES[storeMode].label}. Trả về JSON: {"customer": "...", "address": "...", "phone": "...", "items": [{"name": "...", "unit": "...", "qty": 1, "price": 0}]}. Lưu ý "k"=nghìn, "tr"=triệu.`;
      try {
        const res = await callGemini(prompt);
        if (res) {
            const json = JSON.parse(res.replace(/```json|```/g, '').trim());
            if (json.customer) setCustomerName(json.customer);
            if (json.address) setCustomerAddress(json.address);
            if (json.items) {
                setItems(prev => [...prev, ...json.items.map(i => ({ ...i, id: Date.now() + Math.random(), barcode: '' }))]);
                setShowImportModal(false); setImportText('');
            }
        }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    const code = scanInput.trim();
    if (!code) return;
    const existing = items.findIndex(i => i.barcode === code);
    if (existing !== -1) {
        const newItems = [...items]; newItems[existing].qty++;
        setItems(newItems);
        setLastScanned({ status: 'success', msg: `+1 ${newItems[existing].name}` });
    } else if (BARCODE_DB[code]) {
        const item = { ...BARCODE_DB[code], id: Date.now(), qty: 1, barcode: code };
        setItems([...items, item]);
        setLastScanned({ status: 'success', msg: `Mới: ${item.name}` });
    } else {
        if(confirm("Mã mới! Thêm sản phẩm trống?")) {
            setItems([...items, { id: Date.now(), name: 'Sản phẩm mới', unit: 'Cái', qty: 1, price: 0, barcode: code }]);
            setShowScanModal(false);
        } else {
            setLastScanned({ status: 'error', msg: 'Không tìm thấy!' });
        }
    }
    setScanInput('');
  };

  // --- EXPORT & SHARE FUNCTION ---
  const handleExport = (action, mode = 'invoice') => {
    // action: 'print' | 'pdf' | 'share'
    if (isExporting) return;
    setIsExporting(true);
    
    setIsEditMode(false);
    setExportMode(mode); 
    
    // Force scale to 1 for high quality
    const prevScale = zoomLevel;
    const prevAutoFit = isAutoFit;
    setZoomLevel(1);
    setIsAutoFit(false);

    const fileNamePrefix = mode === 'delivery' ? 'PXK' : 'HD';
    const fileName = `${fileNamePrefix}_${invoiceCode}_${paperType.toUpperCase()}.pdf`;

    // Wait for render update
    setTimeout(() => {
        const element = noteRef.current;
        const opt = { 
            margin: 0, 
            filename: fileName, 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, scrollX: 0, scrollY: 0, useCORS: true }, 
            jsPDF: { unit: 'mm', format: PAPER_TYPES[paperType].format, orientation: 'portrait' } 
        };

        const processHTML2PDF = () => {
            const worker = window.html2pdf().set(opt).from(element);
            
            if (action === 'print') {
                worker.save().then(() => {
                    window.print();
                    finishExport();
                });
            } else if (action === 'pdf') {
                worker.save().then(finishExport);
            } else if (action === 'share') {
                // Generate Blob for sharing
                worker.output('blob').then(async (blob) => {
                    const file = new File([blob], fileName, { type: 'application/pdf' });
                    
                    // Create share message
                    const msg = `Gửi bạn ${mode === 'invoice' ? 'hóa đơn' : 'phiếu xuất'} ${invoiceCode}.\n` + 
                                (mode === 'invoice' ? `Tổng tiền: ${formatMoney(totalPrice)}đ.\n\n${bankInfo}` : `Vui lòng kiểm tra số lượng hàng hóa.`);

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Gửi Hóa Đơn',
                                text: msg
                            });
                        } catch (err) {
                            console.log('Share canceled or failed', err);
                        }
                    } else {
                        // Fallback if sharing not supported
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        navigator.clipboard.writeText(msg);
                        alert('Thiết bị không hỗ trợ chia sẻ trực tiếp.\nĐã tải file PDF và COPY sẵn nội dung tin nhắn.\nHãy mở Zalo/Messenger và dán nhé!');
                    }
                    finishExport();
                });
            }
        };

        if (window.html2pdf) {
            processHTML2PDF();
        } else {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = processHTML2PDF;
            document.body.appendChild(script);
        }

    }, 800); // Increased delay slightly to ensure rendering

    const finishExport = () => {
        setIsExporting(false);
        setIsEditMode(true); 
        setIsAutoFit(prevAutoFit); 
        setZoomLevel(prevScale); 
        setExportMode('invoice');
    };
  };

  // AI Actions (Simplified for brevity)
  const quickAI = async (prompt, title) => {
      setAiStatus("Đang suy nghĩ...");
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) {
          if (title.includes("Tin nhắn") || title.includes("Thơ")) { setGeneratedMsg(res); setMsgModalTitle(title); setShowMsgModal(true); }
          else { setAdvisorContent(res); setAdvisorTitle(title); setShowAdvisorModal(true); }
      }
      return res; // Returned result for chaining
  };

  const handleGenerateSlogan = async () => {
      setAiStatus("Đang sáng tạo slogan...");
      const prompt = `Sáng tạo slogan ngắn gọn (dưới 12 từ), vần điệu cho shop "${shopName}". Ngành hàng ${STORE_MODES[storeMode].label}.`;
      const res = await callGemini(prompt);
      if (res) {
          let clean = res.trim();
          if (clean.startsWith('"')) clean = clean.slice(1, -1);
          setShopSlogan(clean);
      }
      setAiStatus(null);
  };

  // Calculations
  const totalQty = items.reduce((s, i) => s + Number(i.qty), 0);
  const totalPrice = items.reduce((s, i) => s + (Number(i.qty) * Number(i.price)), 0);
  const formatMoney = (n) => new Intl.NumberFormat('vi-VN').format(n);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans print:bg-white text-gray-800">
      {aiStatus && <AILoader message={aiStatus} />}
      {isExporting && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center flex-col text-white">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Đang tạo file PDF...</p>
          </div>
      )}

      {/* --- MOBILE-OPTIMIZED TOOLBAR --- */}
      <div className="sticky top-0 z-50 bg-white shadow-md border-b print:hidden">
         {/* Top Row: Brand & Main Actions */}
         <div className="flex items-center justify-between p-2 px-3">
             <div className="flex items-center gap-2 overflow-hidden">
                 <div className="bg-purple-100 p-2 rounded-lg"><Store className="text-purple-600" size={20}/></div>
                 <select value={storeMode} onChange={(e) => {setStoreMode(e.target.value); setItems(STORE_MODES[e.target.value].defaultItems)}} className="font-bold text-sm bg-transparent outline-none truncate max-w-[120px]">
                     {Object.entries(STORE_MODES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                 </select>
             </div>
             
             <div className="flex gap-2">
                 <button onClick={() => {setShowScanModal(true); setTimeout(()=>scanInputRef.current?.focus(), 100)}} className="bg-blue-600 text-white p-2 rounded-lg shadow-sm active:scale-95"><ScanBarcode size={20}/></button>
                 <button onClick={() => setShowImportModal(true)} className="bg-purple-600 text-white p-2 rounded-lg shadow-sm active:scale-95"><Sparkles size={20}/></button>
                 <button onClick={() => setIsEditMode(!isEditMode)} className={`p-2 rounded-lg ${isEditMode ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{isEditMode ? <Edit3 size={20}/> : <Eye size={20}/>}</button>
             </div>
         </div>

         {/* Middle Row: View, Paper & Export Controls */}
         <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-100 gap-2 overflow-x-auto no-scrollbar">
             {/* Zoom Controls */}
             <div className="flex items-center bg-gray-100 rounded-lg p-1 shrink-0">
                 <button onClick={() => setIsAutoFit(true)} className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold ${isAutoFit ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Smartphone size={14}/> Auto</button>
                 <button onClick={() => setIsAutoFit(false)} className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold ${!isAutoFit ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Maximize size={14}/> 100%</button>
             </div>

             {/* Paper Size Selector */}
             <div className="flex items-center bg-gray-100 rounded-lg p-1 shrink-0">
                 <button onClick={() => setPaperType('a4')} className={`px-2 py-1.5 rounded text-xs font-bold transition-all ${paperType === 'a4' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}>A4</button>
                 <div className="w-px h-3 bg-gray-300 mx-1"></div>
                 <button onClick={() => setPaperType('a5')} className={`px-2 py-1.5 rounded text-xs font-bold transition-all ${paperType === 'a5' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}>A5</button>
             </div>

             {/* Export Buttons */}
             <div className="flex gap-2 shrink-0">
                 <button onClick={() => handleExport('share', 'invoice')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm active:scale-95 animate-pulse-once"><Share2 size={14}/> Gửi Zalo</button>
                 <button onClick={() => handleExport('pdf', 'delivery')} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200"><Package size={14}/> Kho</button>
                 <button onClick={() => handleExport('pdf', 'invoice')} className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-200"><Download size={14}/> Lưu</button>
             </div>
         </div>

         {/* Bottom Row: Scrollable AI Tools */}
         <div className="flex gap-4 p-2 overflow-x-auto bg-gray-50 no-scrollbar items-center">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">AI Tools:</span>
             <button onClick={() => quickAI(`Gợi ý chiến lược bán hàng cho khách ${customerName} mua ${items.map(i=>i.name).join(', ')}`, "Tư vấn chiến lược")} className="flex flex-col items-center gap-1 min-w-[60px] text-gray-600 hover:text-yellow-600"><Lightbulb size={20}/><span className="text-[10px]">Tư vấn</span></button>
             <button onClick={() => quickAI(`Viết status Facebook khoe đơn hàng gồm: ${items.map(i=>i.name).join(', ')}`, "Tin nhắn Khoe đơn")} className="flex flex-col items-center gap-1 min-w-[60px] text-gray-600 hover:text-blue-600"><Megaphone size={20}/><span className="text-[10px]">Khoe đơn</span></button>
             <button onClick={() => quickAI(`Dự báo khi nào khách ${customerName} cần mua lại các món: ${items.map(i=>i.name).join(', ')}`, "Dự báo mua lại")} className="flex flex-col items-center gap-1 min-w-[60px] text-gray-600 hover:text-green-600"><CalendarClock size={20}/><span className="text-[10px]">Dự báo</span></button>
             <button onClick={() => quickAI(`Viết tin nhắn Zalo gửi hóa đơn cho ${customerName}, tổng ${formatMoney(totalPrice)}đ.`, "Tin nhắn Zalo")} className="flex flex-col items-center gap-1 min-w-[60px] text-gray-600 hover:text-blue-600"><MessageCircle size={20}/><span className="text-[10px]">Zalo</span></button>
             <button onClick={() => quickAI(`Đánh giá rủi ro đơn hàng ${formatMoney(totalPrice)}đ`, "Rủi ro")} className="flex flex-col items-center gap-1 min-w-[60px] text-gray-600 hover:text-red-600"><ShieldAlert size={20}/><span className="text-[10px]">Rủi ro</span></button>
         </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-auto bg-gray-200 p-2 md:p-8 flex justify-center items-start" ref={paperContainerRef}>
        
        {/* INVOICE PAPER WRAPPER - HANDLES SCALING */}
        <div 
            style={{ 
                width: PAPER_TYPES[paperType].width, 
                minHeight: PAPER_TYPES[paperType].height,
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center', // Scale from top center
                marginBottom: `${(PAPER_TYPES[paperType].pixelWidth * (1 - zoomLevel))}px` // Compensate for white space
            }}
            className="bg-white shadow-xl transition-transform duration-200 ease-out origin-top"
            ref={noteRef}
        >
            <div className={`${paperType === 'a5' ? 'p-6' : 'p-10'} h-full relative`}>
                {/* Header */}
                <div className="flex justify-between border-b-2 border-gray-800 pb-4 mb-6">
                    <div className="w-[60%]">
                        <input value={shopName} onChange={e=>setShopName(e.target.value)} className="w-full text-xl md:text-2xl font-bold uppercase outline-none bg-transparent placeholder-gray-300" placeholder="TÊN CỬA HÀNG"/>
                        <div className="flex items-center gap-1">
                            <input value={shopSlogan} onChange={e=>setShopSlogan(e.target.value)} className="w-full text-sm italic text-gray-500 outline-none bg-transparent mt-1" placeholder="Slogan..."/>
                            <button onClick={handleGenerateSlogan} className="text-purple-500 print:hidden opacity-50 hover:opacity-100" data-html2canvas-ignore="true" title="Tạo Slogan AI"><Sparkles size={14}/></button>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <div className="flex gap-1"><span className="font-semibold shrink-0">SĐT:</span><input value={shopPhone} onChange={e=>setShopPhone(e.target.value)} className="w-full outline-none bg-transparent"/></div>
                            <div className="flex gap-1"><span className="font-semibold shrink-0">ĐC:</span><input value={shopAddress} onChange={e=>setShopAddress(e.target.value)} className="w-full outline-none bg-transparent"/></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase">
                            {exportMode === 'delivery' ? 'PHIẾU XUẤT KHO' : STORE_MODES[storeMode].headerTitle}
                        </h2>
                        <div className="text-sm mt-2 flex flex-col items-end gap-1">
                            <div className="flex items-center justify-end gap-1"><span className="text-gray-500">Số:</span><input value={invoiceCode} onChange={e=>setInvoiceCode(e.target.value)} className="w-20 text-right font-mono font-bold text-red-600 outline-none bg-transparent"/></div>
                            <div className="flex items-center justify-end gap-1"><span className="text-gray-500">Ngày:</span><input value={date} onChange={e=>setDate(e.target.value)} className="w-24 text-right outline-none bg-transparent"/></div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6 grid grid-cols-1 gap-2 text-sm">
                    {/* Always show Name */}
                    <div className="flex gap-2 items-center border-b border-dotted border-gray-300 pb-1">
                        <span className="font-bold w-20 shrink-0 text-gray-700">Khách hàng:</span>
                        <input value={customerName} onChange={e=>setCustomerName(e.target.value)} className={`w-full outline-none font-medium text-gray-900 ${isEditMode ? 'bg-blue-50/50 rounded px-1' : 'bg-transparent'}`} placeholder="Nhập tên khách..."/>
                        <button onClick={() => quickAI(`Phân tích chân dung khách hàng tên "${customerName}"`, "Chân dung")} className="text-blue-500 print:hidden opacity-50 hover:opacity-100" data-html2canvas-ignore="true"><User size={14}/></button>
                    </div>

                    {/* Show Phone if Edit Mode OR has value */}
                    {(isEditMode || customerPhone) && (
                        <div className="flex gap-2 items-center border-b border-dotted border-gray-300 pb-1">
                            <span className="font-bold w-20 shrink-0 text-gray-700">Điện thoại:</span>
                            <input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className={`w-full outline-none text-gray-900 ${isEditMode ? 'bg-blue-50/50 rounded px-1' : 'bg-transparent'}`} placeholder="Nhập SĐT..."/>
                        </div>
                    )}

                    {/* Show Address if Edit Mode OR has value */}
                    {(isEditMode || customerAddress) && (
                        <div className="flex gap-2 items-center border-b border-dotted border-gray-300 pb-1">
                            <span className="font-bold w-20 shrink-0 text-gray-700">Địa chỉ:</span>
                            <input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className={`w-full outline-none text-gray-900 ${isEditMode ? 'bg-blue-50/50 rounded px-1' : 'bg-transparent'}`} placeholder="Nhập địa chỉ..."/>
                        </div>
                    )}

                    {/* Show Note if Edit Mode OR has value */}
                    {(isEditMode || note) && (
                        <div className="flex gap-2 items-center border-b border-dotted border-gray-300 pb-1">
                            <span className="font-bold w-20 shrink-0 text-gray-700">Ghi chú:</span>
                            <input value={note} onChange={e=>setNote(e.target.value)} className="w-full outline-none italic text-gray-600 bg-transparent" placeholder="Ghi chú..."/>
                            <button onClick={() => quickAI(`Viết câu chúc ngắn gọn cho đơn hàng này`, "Gợi ý Ghi chú").then(t => t && setNote(t))} className="text-purple-500 print:hidden opacity-50 hover:opacity-100" data-html2canvas-ignore="true"><Sparkles size={14}/></button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-gray-800 mb-4 text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="border border-gray-400 p-2 w-10">STT</th>
                            <th className="border border-gray-400 p-2 text-left">Tên Hàng Hóa</th>
                            <th className="border border-gray-400 p-2 w-14">ĐVT</th>
                            <th className="border border-gray-400 p-2 w-14">SL</th>
                            {exportMode === 'invoice' && <th className="border border-gray-400 p-2 w-24 text-right">Đơn Giá</th>}
                            {exportMode === 'invoice' && <th className="border border-gray-400 p-2 w-28 text-right">Thành Tiền</th>}
                            <th className="border border-gray-400 p-1 w-8 print:hidden" data-html2canvas-ignore="true"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={item.id} className="group">
                                <td className="border border-gray-400 p-2 text-center text-gray-500">{idx + 1}</td>
                                <td className="border border-gray-400 p-1">
                                    <input value={item.name} onChange={e=>{const n=[...items];n[idx].name=e.target.value;setItems(n)}} className={`w-full p-1 outline-none ${isEditMode ? 'bg-yellow-50/30' : 'bg-transparent'}`}/>
                                    {item.barcode && <div className="text-[10px] text-gray-400 pl-1">{item.barcode}</div>}
                                </td>
                                <td className="border border-gray-400 p-1"><input value={item.unit} onChange={e=>{const n=[...items];n[idx].unit=e.target.value;setItems(n)}} className="w-full text-center p-1 outline-none bg-transparent"/></td>
                                <td className="border border-gray-400 p-1"><input type="number" value={item.qty} onChange={e=>{const n=[...items];n[idx].qty=e.target.value;setItems(n)}} className="w-full text-center font-bold p-1 outline-none bg-transparent"/></td>
                                {exportMode === 'invoice' && (
                                    <>
                                    <td className="border border-gray-400 p-1"><input value={new Intl.NumberFormat('vi-VN').format(item.price)} onChange={e=>{const val=e.target.value.replace(/\D/g,'');const n=[...items];n[idx].price=val;setItems(n)}} className="w-full text-right p-1 outline-none bg-transparent"/></td>
                                    <td className="border border-gray-400 p-2 text-right font-medium">{formatMoney(item.qty * item.price)}</td>
                                    </>
                                )}
                                <td className="border border-gray-400 p-1 text-center print:hidden" data-html2canvas-ignore="true"><button onClick={()=>setItems(items.filter(i=>i.id!==item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="font-bold bg-gray-50">
                        <tr>
                            <td colSpan={2} className="border border-gray-400 p-2 text-center uppercase text-gray-600">Tổng Cộng</td>
                            <td className="border border-gray-400 p-2"></td>
                            <td className="border border-gray-400 p-2 text-center">{totalQty}</td>
                            {exportMode === 'invoice' && (
                                <>
                                <td className="border border-gray-400 p-2"></td>
                                <td className="border border-gray-400 p-2 text-right text-lg text-blue-800">{formatMoney(totalPrice)}</td>
                                </>
                            )}
                            <td className="border border-gray-400 p-2 print:hidden" data-html2canvas-ignore="true"></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Actions Row (Add Item) */}
                <div className="flex gap-2 mb-4 print:hidden" data-html2canvas-ignore="true">
                    <button onClick={()=>setItems([...items, {id:Date.now(), name:'', unit:'Cái', qty:1, price:0}])} className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100"><Plus size={14}/> Thêm hàng</button>
                    <button onClick={()=>setItems(STORE_MODES[storeMode].defaultItems)} className="flex items-center gap-1 text-xs font-bold bg-gray-50 text-gray-600 px-3 py-2 rounded hover:bg-gray-100"><RefreshCw size={14}/> Reset</button>
                </div>

                {/* Money in Words - Hide in Delivery Mode */}
                {exportMode === 'invoice' && (
                    <div className="mb-6">
                        <div className="flex gap-2 items-end text-sm mb-2">
                            <span className="font-bold shrink-0">Bằng chữ:</span>
                            <span className="flex-1 border-b border-dotted border-gray-400 italic text-gray-700">{amountInWords || '.............................................................'}</span>
                            <button onClick={() => quickAI(`Đọc số tiền ${totalPrice} thành chữ tiếng Việt (viết hoa chữ cái đầu)`, "Đọc tiền").then(t => t && setAmountInWords(t))} className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold print:hidden" data-html2canvas-ignore="true">AI</button>
                        </div>
                        {showBankInfo && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 text-sm flex gap-2">
                                <div className="font-bold text-gray-500 uppercase text-xs w-24 shrink-0 pt-1">Thanh toán:</div>
                                <textarea value={bankInfo} onChange={e=>setBankInfo(e.target.value)} className="w-full bg-transparent outline-none resize-none text-gray-700 h-16" />
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="grid grid-cols-3 gap-4 text-center mt-8 text-xs uppercase font-bold text-gray-600">
                    <div><p>Người Lập Phiếu</p><p className="italic font-normal text-gray-400 mt-16">(Ký, họ tên)</p></div>
                    <div><p>Người Giao Hàng</p><p className="italic font-normal text-gray-400 mt-16">(Ký, họ tên)</p></div>
                    <div><p>{exportMode === 'invoice' ? 'Khách Hàng' : 'Người Nhận'}</p><p className="italic font-normal text-gray-400 mt-16">(Ký, họ tên)</p></div>
                </div>
            </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2 text-blue-600"><ScanBarcode/> Quét Barcode</h3><button onClick={()=>setShowScanModal(false)}><X/></button></div>
                <form onSubmit={handleScanSubmit}>
                    <input ref={scanInputRef} autoFocus value={scanInput} onChange={e=>setScanInput(e.target.value)} className="w-full border-2 border-blue-200 rounded-lg p-3 text-lg font-mono font-bold outline-none mb-4" placeholder="Nhập mã..."/>
                    {lastScanned && <div className={`p-2 rounded mb-4 text-sm font-bold ${lastScanned.status==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{lastScanned.msg}</div>}
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Xác Nhận</button>
                </form>
            </div>
        </div>
      )}
      
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2 text-purple-600"><Sparkles/> AI Nhập Liệu</h3><button onClick={()=>setShowImportModal(false)}><X/></button></div>
                <textarea value={importText} onChange={e=>setImportText(e.target.value)} className="w-full border p-3 h-32 rounded mb-4" placeholder="Dán tin nhắn đặt hàng vào đây..."/>
                <div className="flex justify-end gap-2"><button onClick={handleSmartImport} className="bg-purple-600 text-white px-4 py-2 rounded font-bold">Phân Tích</button></div>
            </div>
        </div>
      )}

      {(showMsgModal || showAdvisorModal) && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col max-h-[80vh]">
                <div className="flex justify-between mb-4 shrink-0">
                    <h3 className="font-bold flex gap-2 text-green-700">{showMsgModal ? <MessageCircle/> : <Lightbulb/>} {showMsgModal ? msgModalTitle : advisorTitle}</h3>
                    <button onClick={()=>{setShowMsgModal(false); setShowAdvisorModal(false)}}><X/></button>
                </div>
                <div className="overflow-y-auto flex-1 p-4 bg-gray-50 rounded border border-gray-100">
                    {showMsgModal ? <textarea readOnly className="w-full h-full bg-transparent outline-none resize-none" value={generatedMsg}/> : <div dangerouslySetInnerHTML={{__html: advisorContent}}/>}
                </div>
                {showMsgModal && <button onClick={()=>{navigator.clipboard.writeText(generatedMsg); alert('Đã copy!')}} className="mt-4 w-full bg-green-600 text-white py-2 rounded font-bold">Sao Chép</button>}
            </div>
        </div>
      )}

    </div>
  );
}