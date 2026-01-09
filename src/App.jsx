import React, { useState, useRef, useEffect } from 'react';
import { Printer, FileDown, Plus, Trash2, Download, RefreshCw, PlusCircle, Sparkles, X, Minus, Wand2, Edit3, Settings, Eye, MessageCircle, Copy, Check, Share2, ChevronDown, Zap } from 'lucide-react';

// Cấu hình các khổ giấy phổ biến
const PAPER_TYPES = {
  'a4': { name: 'A4 (Dọc)', format: 'a4', orientation: 'portrait', width: '210mm', height: '297mm', previewWidth: '190mm' },
  'a5_land': { name: 'A5 (Ngang)', format: 'a5', orientation: 'landscape', width: '210mm', height: '148mm', previewWidth: '190mm' },
  'a5_port': { name: 'A5 (Dọc)', format: 'a5', orientation: 'portrait', width: '148mm', height: '210mm', previewWidth: '128mm' },
  'letter': { name: 'Letter (Mỹ)', format: 'letter', orientation: 'portrait', width: '216mm', height: '279mm', previewWidth: '196mm' },
  'legal': { name: 'Legal (Mỹ)', format: 'legal', orientation: 'portrait', width: '216mm', height: '356mm', previewWidth: '196mm' },
};

// Giới hạn Free Tier của Gemini Flash
const DAILY_LIMIT = 1500;

// --- COMPONENT LOAD AI XỊN XÒ ---
const AILoader = ({ message }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
    <div className="bg-white/90 p-6 rounded-2xl shadow-2xl border border-purple-100 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles size={24} className="text-purple-600 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Gemini AI Đang Xử Lý
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-medium animate-pulse">{message || "Đang phân tích dữ liệu..."}</p>
      </div>
    </div>
  </div>
);

export default function InvoiceMakerApp() {
  // --- STATE DỮ LIỆU ---
  const initialData = [
    { id: 1, name: 'APN Mepix 247', unit: 'Chai', qty: 40, price: 150000 },
    { id: 2, name: 'Cabophos 500ml', unit: 'Chai', qty: 24, price: 85000 },
    { id: 3, name: 'Nutri active APN 500ml', unit: 'Chai', qty: 24, price: 120000 },
  ];

  const [shopName, setShopName] = useState('ĐẠI LÝ THÀNH ĐẠT');
  const [shopPhone, setShopPhone] = useState('0357041668');
  const [shopAddress, setShopAddress] = useState('Số 125, DT685, xã Kiến Đức, tỉnh Lâm Đồng');

  const [customerName, setCustomerName] = useState('Khách Sỉ');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [items, setItems] = useState(initialData);
  const [note, setNote] = useState('Kiểm hàng kỹ trước khi nhận');
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [invoiceCode, setInvoiceCode] = useState('HD001');
  
  const [showBankInfo, setShowBankInfo] = useState(true);
  const [bankInfo, setBankInfo] = useState('• Ngân hàng: Agribank\n• Số tài khoản: 5300205625965\n• Chủ tài khoản: NGUYEN THANH TUNG');

  // Cấu hình & Trạng thái
  const [paperType, setPaperType] = useState('a4'); 
  const [exportMode, setExportMode] = useState('full'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountInWords, setAmountInWords] = useState(''); 
  const [isEditMode, setIsEditMode] = useState(true); 

  // AI States & Usage Tracking
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [aiStatus, setAiStatus] = useState(null); 
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState(0); // Bộ đếm usage
  
  const noteRef = useRef(null);

  // --- INIT USAGE COUNTER ---
  useEffect(() => {
      // Logic: Kiểm tra ngày, nếu qua ngày mới thì reset về 0
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const storedDate = localStorage.getItem('gemini_usage_date');
      const storedCount = parseInt(localStorage.getItem('gemini_usage_count') || '0');

      if (storedDate !== today) {
          localStorage.setItem('gemini_usage_date', today);
          localStorage.setItem('gemini_usage_count', '0');
          setUsageCount(0);
      } else {
          setUsageCount(storedCount);
      }
  }, []);

  const incrementUsage = () => {
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('gemini_usage_count', newCount.toString());
  };

  // --- HELPER FORMAT SỐ ---
  const formatNumberWithDots = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // --- GEMINI API HELPERS ---
  const callGemini = async (prompt) => {
      // 1. Kiểm tra giới hạn Usage
      if (usageCount >= DAILY_LIMIT) {
          alert(`⚠️ ĐÃ ĐẠT GIỚI HẠN MIỄN PHÍ TRONG NGÀY!\n\nBạn đã sử dụng ${usageCount}/${DAILY_LIMIT} lượt hôm nay.\nĐây là giới hạn của gói Gemini Free, không phải lỗi ứng dụng.\nVui lòng quay lại vào ngày mai.`);
          return null;
      }

      let apiKey = "";
      try {
          if (typeof import.meta !== 'undefined' && import.meta.env) {
              apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          }
      } catch (e) { console.warn("Dev mode: Missing env"); }

      if (!apiKey) apiKey = ""; 

      if (!apiKey) {
          alert("⚠️ Chưa cấu hình API Key! Vui lòng thêm VITE_GEMINI_API_KEY vào biến môi trường.");
          return null;
      }

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        // 2. Xử lý lỗi Rate Limit từ phía Google (429)
        if (response.status === 429) {
            throw new Error("Hệ thống đang bận (Quá nhiều yêu cầu trong 1 phút). Vui lòng đợi 30 giây rồi thử lại.");
        }

        const data = await response.json();
        if (!data.candidates?.length) throw new Error("No AI response");
        
        // 3. Tăng bộ đếm khi thành công
        incrementUsage();
        
        return data.candidates[0].content.parts[0].text;
      } catch (error) { 
          console.error("Gemini Error:", error); 
          alert("Lỗi kết nối AI: " + error.message);
          return null; 
      }
  };

  // --- AI HANDLERS ---
  const handleSmartImport = async () => {
      if (!importText.trim()) return;
      setAiStatus("Đang đọc & bóc tách đơn hàng...");
      
      const prompt = `
        Bạn là một trợ lý bán hàng thông minh. Nhiệm vụ của bạn là bóc tách thông tin từ tin nhắn đặt hàng.
        Văn bản đầu vào: "${importText}"
        Hãy trích xuất và trả về JSON (chỉ JSON):
        {
          "customer": "Tên khách",
          "address": "Địa chỉ",
          "phone": "SĐT",
          "items": [ { "name": "Tên SP", "unit": "ĐVT", "qty": số lượng, "price": đơn giá (số) } ]
        }
        Lưu ý: "k" = nghìn (260k -> 260000), "tr" = triệu.
      `;

      try {
          const res = await callGemini(prompt);
          if (res) {
              const jsonStr = res.replace(/```json|```/g, '').trim();
              const startBrace = jsonStr.indexOf('{');
              const endBrace = jsonStr.lastIndexOf('}');
              
              if (startBrace !== -1 && endBrace !== -1) {
                  const cleanJson = jsonStr.substring(startBrace, endBrace + 1);
                  const data = JSON.parse(cleanJson);
                  
                  if (data.customer) setCustomerName(data.customer);
                  if (data.address) setCustomerAddress(data.address);
                  if (data.phone) setCustomerPhone(data.phone);

                  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
                       const newItems = data.items.map(i => ({
                           id: Date.now() + Math.random(),
                           name: typeof i.name === 'string' ? i.name : 'Sản phẩm mới',
                           unit: typeof i.unit === 'string' ? i.unit : 'Cái',
                           qty: Number(i.qty) || 1,
                           price: Number(i.price) || 0
                       }));
                       setItems(prev => [...prev, ...newItems]);
                       setShowImportModal(false); 
                       setImportText('');
                  } else {
                      alert("Không tìm thấy sản phẩm nào trong tin nhắn.");
                  }
              }
          }
      } catch (e) { console.error(e); alert("Lỗi xử lý AI: " + e.message); } finally { setAiStatus(null); }
  };

  const handleGenerateNote = async () => {
      setAiStatus("Đang suy nghĩ lời chúc hay...");
      const itemsStr = items.map(i => i.name).join(", ");
      const prompt = `
        Hãy viết DUY NHẤT 1 câu ghi chú ngắn gọn (dưới 15 từ) để in lên hóa đơn gửi cho khách hàng tên là "${customerName}".
        Khách vừa mua các món: ${itemsStr}.
        Yêu cầu: Chỉ trả về nội dung câu nói, KHÔNG dùng dấu ngoặc kép.
      `;
      try {
          const res = await callGemini(prompt);
          if (res) {
              let cleanNote = res.trim();
              if (cleanNote.startsWith('"') && cleanNote.endsWith('"')) cleanNote = cleanNote.slice(1, -1);
              setNote(cleanNote);
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleNumberToWords = async () => {
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      if (total === 0) return;
      setAiStatus("Đang đọc số tiền thành chữ...");
      const res = await callGemini(`Đọc số tiền ${total} thành chữ tiếng Việt (viết hoa đầu, kết thúc 'đồng'). Chỉ trả về text.`);
      if (res) setAmountInWords(res.trim());
      setAiStatus(null);
  };

  const handleFixProductNames = async () => {
      setAiStatus("Đang sửa lỗi chính tả & viết hoa...");
      const names = items.map(i => i.name);
      const res = await callGemini(`Chuẩn hóa tên (Viết Hoa Chữ Đầu, Sửa Chính Tả): ${JSON.stringify(names)}. Trả về JSON Array of Strings.`);
      if (res) {
          try {
            const jsonStr = res.replace(/```json|```/g, '').trim().match(/\[.*\]/s)?.[0] || '[]';
            const fixed = JSON.parse(jsonStr);
            if (fixed.length === items.length) {
                setItems(items.map((it, idx) => ({ 
                    ...it, 
                    name: (typeof fixed[idx] === 'string') ? fixed[idx] : (fixed[idx]?.name || it.name) 
                })));
            }
          } catch(e) { console.error("Parse error", e); }
      }
      setAiStatus(null);
  };

  const handleDraftMessage = async () => {
      setAiStatus("Đang soạn tin nhắn Zalo...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const totalFormatted = formatCurrency(total);
      const prompt = `
        Hãy đóng vai chủ cửa hàng "${shopName}", soạn một tin nhắn Zalo ngắn gọn gửi cho khách hàng "${customerName}".
        Thông tin: Đã lên đơn ${invoiceCode}. Tổng tiền: ${totalFormatted}. CK: "${bankInfo.replace(/\n/g, ', ')}".
        Yêu cầu: Thân thiện, chuyên nghiệp, chỉ trả về nội dung tin nhắn.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { setGeneratedMsg(res.trim()); setShowMsgModal(true); } 
      else { alert("AI đang bận, vui lòng thử lại!"); }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedMsg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // --- DATA HANDLERS ---
  const totalQty = items.reduce((s, i) => s + Number(i.qty), 0);
  const totalPrice = items.reduce((s, i) => s + (Number(i.qty) * Number(i.price)), 0);
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleItemChange = (id, field, val) => {
      setItems(items.map(i => i.id === id ? { ...i, [field]: (field==='qty'||field==='price') ? Math.max(0, val) : val } : i));
      if (field === 'price' || field === 'qty') setAmountInWords('');
  };
  const addItem = () => { setItems([...items, { id: Date.now(), name: '', unit: 'Cái', qty: 1, price: 0 }]); setAmountInWords(''); };
  const removeItem = (id) => { setItems(prev => prev.length===1 ? [{id: Date.now(), name:'', unit:'', qty:1, price:0}] : prev.filter(i=>i.id!==id)); setAmountInWords(''); };
  const resetData = () => { if(confirm("Xóa dữ liệu?")) { setItems([{ id: Date.now(), name: '', unit: '', qty: 1, price: 0 }]); setAmountInWords(''); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); } };

  // --- SMART SHARE ZALO ---
  const handleShareZalo = () => {
      if (isProcessing) return;
      setIsProcessing(true);
      setIsEditMode(false); 

      setTimeout(() => {
          const element = noteRef.current;
          const config = PAPER_TYPES[paperType];
          const filename = `HoaDon_${invoiceCode}.pdf`;
          
          const opt = {
              margin: 5, filename: filename,
              image: { type: 'jpeg', quality: 1 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: config.format, orientation: config.orientation }
          };

          const processBlob = (blob) => {
              const file = new File([blob], filename, { type: 'application/pdf' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  navigator.share({ files: [file], title: 'Gửi hóa đơn', text: `Gửi bạn hóa đơn ${invoiceCode}. Tổng tiền: ${formatCurrency(totalPrice)}` })
                  .then(() => alert("Đã chia sẻ thành công!"))
                  .catch(() => {})
                  .finally(() => { setIsProcessing(false); setIsEditMode(true); });
              } else {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
                  const msg = `Gửi bạn hóa đơn ${invoiceCode}.\nTổng tiền: ${formatCurrency(totalPrice)}\n\n${bankInfo}`;
                  navigator.clipboard.writeText(msg);
                  alert("Đã tải file PDF và COPY tin nhắn.\n\nBạn hãy mở Zalo PC -> Dán tin nhắn (Ctrl+V) và Kéo file PDF vào để gửi!");
                  setIsProcessing(false); setIsEditMode(true);
              }
          };

          if (window.html2pdf) {
              window.html2pdf().set(opt).from(element).output('blob').then(processBlob);
          } else {
              const script = document.createElement('script');
              script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
              script.onload = () => { window.html2pdf().set(opt).from(element).output('blob').then(processBlob); };
              document.body.appendChild(script);
          }
      }, 500);
  };

  // --- EXPORT ---
  const handleExport = (mode, action) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setExportMode(mode);
      setIsEditMode(false); 
      
      setTimeout(() => {
          const element = noteRef.current;
          const config = PAPER_TYPES[paperType];
          const opt = {
              margin: 5, filename: `${mode==='full'?'HOADON':'PHIEU'}_${invoiceCode}.pdf`,
              image: { type: 'jpeg', quality: 1 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: config.format, orientation: config.orientation }
          };

          const done = () => { setIsProcessing(false); setExportMode('full'); setIsEditMode(true); }; 

          if (action === 'print') { window.print(); done(); } 
          else {
              if (!window.html2pdf) {
                  const script = document.createElement('script');
                  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
                  script.onload = () => { window.html2pdf().set(opt).from(element).save().then(done).catch(done); };
                  document.body.appendChild(script);
              } else { window.html2pdf().set(opt).from(element).save().then(done).catch(done); }
          }
      }, 500);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 font-sans print:bg-white print:p-0">
      
      {/* --- AI LOADING OVERLAY --- */}
      {aiStatus && <AILoader message={aiStatus} />}

      {/* --- MODAL IMPORT --- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2 text-purple-700"><Sparkles/> Nhập AI</h3><button onClick={()=>setShowImportModal(false)}><X/></button></div>
                <textarea className="w-full border p-3 h-32 rounded outline-none focus:ring-2 focus:ring-purple-200" placeholder='Ví dụ: "Lấy cho anh Dũng Quận 7 10 chai Anvil 260k"' value={importText} onChange={e=>setImportText(e.target.value)}></textarea>
                <div className="flex justify-end gap-2 mt-4"><button onClick={()=>setShowImportModal(false)} className="px-4 py-2 bg-gray-100 rounded">Hủy</button><button onClick={handleSmartImport} disabled={!importText.trim()} className="px-4 py-2 bg-purple-600 text-white rounded">Phân tích</button></div>
            </div>
        </div>
      )}

      {/* --- MODAL MESSAGE --- */}
      {showMsgModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between mb-4">
                    <h3 className="font-bold flex gap-2 text-blue-600"><MessageCircle/> Soạn Tin Nhắn</h3>
                    <button onClick={()=>setShowMsgModal(false)}><X/></button>
                </div>
                <div className="relative">
                    <textarea readOnly className="w-full border p-3 h-48 rounded outline-none bg-gray-50 text-sm font-medium" value={generatedMsg}></textarea>
                    <button onClick={copyToClipboard} className="absolute bottom-2 right-2 flex items-center gap-1 bg-white border shadow px-2 py-1 rounded text-xs font-bold text-gray-700 hover:bg-gray-100">
                        {copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>} {copied ? 'Đã chép' : 'Sao chép'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- TOOLBAR --- */}
      <div className="w-full max-w-5xl bg-white p-3 rounded-lg shadow-md mb-6 print:hidden border sticky top-0 z-50 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2 items-center">
            {/* Hiển thị Usage AI */}
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${usageCount >= DAILY_LIMIT ? 'bg-red-100 text-red-600 border-red-200' : 'bg-purple-50 text-purple-700 border-purple-100'}`} title="Số lượt dùng AI hôm nay">
                <Zap size={14} fill={usageCount >= DAILY_LIMIT ? "currentColor" : "none"}/>
                <span>{usageCount}/{DAILY_LIMIT}</span>
            </div>

            <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${isEditMode ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-600'}`}>
                {isEditMode ? <><Edit3 size={16}/> Sửa</> : <><Eye size={16}/> Xem</>}
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-sm font-bold"><Sparkles size={16}/> Nhập</button>
            <button onClick={handleDraftMessage} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-bold"><MessageCircle size={16}/> Soạn Tin</button>
            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-bold"><Plus size={16}/> Thêm</button>
            <button onClick={()=>removeItem(items[items.length-1].id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-bold"><Minus size={16}/> Xóa</button>
            
            <div className="relative">
                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-bold text-gray-700 cursor-pointer border border-transparent hover:border-gray-300 group">
                    <span>{PAPER_TYPES[paperType]?.name}</span>
                    <ChevronDown size={14}/>
                    <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
                        {Object.keys(PAPER_TYPES).map(key => (<option key={key} value={key}>{PAPER_TYPES[key].name}</option>))}
                    </select>
                </div>
            </div>

             <button onClick={() => setShowBankInfo(!showBankInfo)} className={`p-2 rounded ${showBankInfo ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`} title="Bật/Tắt Thông tin Ngân hàng"><Settings size={18}/></button>
             <button onClick={resetData} className="text-gray-500 p-2"><RefreshCw size={18}/></button>
        </div>
        <div className="flex gap-2">
             <button onClick={handleShareZalo} disabled={isProcessing} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium flex gap-1 items-center shadow-sm">
                <Share2 size={16}/> <span className="hidden sm:inline">Gửi Zalo</span>
            </button>

             <div className="flex bg-blue-50 rounded-lg p-1 border border-blue-100">
                <button onClick={() => handleExport('delivery', 'pdf')} disabled={isProcessing} className="px-3 py-1.5 text-blue-700 text-sm font-medium flex gap-1"><FileDown size={16}/> Kho</button>
                <div className="w-px bg-blue-200 mx-1"></div>
                <button onClick={() => handleExport('delivery', 'print')} disabled={isProcessing} className="px-2 text-blue-700"><Printer size={16}/></button>
            </div>
            <div className="flex bg-purple-50 rounded-lg p-1 border border-purple-100">
                <button onClick={() => handleExport('full', 'pdf')} disabled={isProcessing} className="px-3 py-1.5 text-purple-700 text-sm font-medium flex gap-1"><Download size={16}/> Hóa Đơn</button>
                <div className="w-px bg-purple-200 mx-1"></div>
                <button onClick={() => handleExport('full', 'print')} disabled={isProcessing} className="px-2 text-purple-700"><Printer size={16}/></button>
            </div>
        </div>
      </div>

      {/* --- INVOICE PAPER --- */}
      <div className="w-full overflow-auto flex justify-center pb-20">
        <div 
            ref={noteRef} 
            className={`bg-white p-8 shadow-2xl print:shadow-none transition-all duration-300 relative ${isEditMode ? 'ring-2 ring-orange-100' : ''}`} 
            style={{ 
                width: PAPER_TYPES[paperType]?.previewWidth, 
                minHeight: (PAPER_TYPES[paperType]?.orientation === 'landscape' ? '148mm' : '297mm')
            }}
        >
            
            {/* HEADER (EDITABLE) */}
            <div className="flex justify-between border-b-2 border-gray-800 pb-4 mb-4">
                <div className="flex-1">
                    <input 
                        value={shopName} 
                        onChange={e => setShopName(e.target.value)} 
                        className={`w-full text-xl font-bold uppercase text-gray-800 bg-transparent outline-none ${isEditMode ? 'placeholder-gray-300 border-b border-dashed border-gray-300' : ''}`} 
                        placeholder="TÊN CỬA HÀNG"
                    />
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm text-gray-600 shrink-0">SĐT:</span>
                        <input value={shopPhone} onChange={e => setShopPhone(e.target.value)} className={`w-full text-sm text-gray-600 bg-transparent outline-none ${isEditMode ? 'border-b border-dashed border-gray-300' : ''}`} placeholder="Số điện thoại cửa hàng"/>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600 shrink-0">ĐC:</span>
                        <input value={shopAddress} onChange={e => setShopAddress(e.target.value)} className={`w-full text-sm text-gray-600 bg-transparent outline-none ${isEditMode ? 'border-b border-dashed border-gray-300' : ''}`} placeholder="Địa chỉ cửa hàng"/>
                    </div>
                </div>
                <div className="text-right ml-4">
                    <h2 className="text-xl font-bold uppercase">{exportMode === 'full' ? 'HÓA ĐƠN' : 'PHIẾU KHO'}</h2>
                    <div className="text-sm mt-1">
                        <div className="flex justify-end gap-1"><span className="text-gray-600">Số:</span><input value={invoiceCode} onChange={(e)=>setInvoiceCode(e.target.value)} className={`font-bold text-red-600 w-20 text-right outline-none ${isEditMode ? 'bg-yellow-50' : 'bg-transparent'}`}/></div>
                        <div className="flex justify-end gap-1"><span className="text-gray-600">Ngày:</span><input value={date} onChange={(e)=>setDate(e.target.value)} className={`w-24 text-right outline-none ${isEditMode ? 'bg-yellow-50' : 'bg-transparent'}`}/></div>
                    </div>
                </div>
            </div>

            {/* CUSTOMER INFO (EXTENDED) */}
            <div className="mb-6 text-sm">
                <div className="flex gap-2 items-center mb-1">
                    <span className="font-bold w-24 shrink-0">Khách hàng:</span>
                    <input value={customerName} onChange={e=>setCustomerName(e.target.value)} className={`flex-1 outline-none font-medium ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Tên khách hàng"/>
                </div>
                <div className="flex gap-2 items-center mb-1">
                    <span className="font-bold w-24 shrink-0">Điện thoại:</span>
                    <input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className={`flex-1 outline-none ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Số điện thoại khách (nếu có)"/>
                </div>
                 <div className="flex gap-2 items-center mb-1">
                    <span className="font-bold w-24 shrink-0">Địa chỉ:</span>
                    <input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className={`flex-1 outline-none ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Địa chỉ khách hàng (nếu có)"/>
                </div>
                <div className="flex gap-2 items-center relative">
                    <span className="font-bold w-24 shrink-0">Ghi chú:</span>
                    <input value={note} onChange={(e)=>setNote(e.target.value)} className={`flex-1 outline-none italic pr-8 ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Ghi chú đơn hàng"/>
                    <button onClick={handleGenerateNote} disabled={aiStatus !== null} data-html2canvas-ignore="true" className="absolute right-0 text-purple-500 print:hidden opacity-50 hover:opacity-100"><Sparkles size={14}/></button>
                </div>
            </div>

            {/* PRODUCT TABLE */}
            <table className="w-full border-collapse border border-gray-800 mb-4 text-sm">
                <thead>
                    <tr className="bg-gray-200 text-xs font-bold uppercase group">
                        <th className="border border-gray-400 p-2 w-10 text-center">STT</th>
                        <th className="border border-gray-400 p-2 text-left relative">
                            Tên sản phẩm 
                            <button onClick={handleFixProductNames} disabled={aiStatus !== null} data-html2canvas-ignore="true" className="absolute right-1 top-1 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"><Wand2 size={14}/></button>
                        </th>
                        <th className="border border-gray-400 p-2 w-16 text-center">ĐVT</th>
                        <th className="border border-gray-400 p-2 w-16 text-center">SL</th>
                        {exportMode === 'full' && <><th className="border border-gray-400 p-2 w-24 text-right">Đơn giá</th><th className="border border-gray-400 p-2 w-28 text-right">Thành tiền</th></>}
                        {exportMode === 'delivery' && <th className="border border-gray-400 p-2 w-32 text-center">Thực nhận</th>}
                        <th className="border border-gray-400 p-2 w-8 print:hidden" data-html2canvas-ignore="true"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-yellow-50">
                            <td className="border border-gray-400 p-2 text-center">{idx + 1}</td>
                            <td className="border border-gray-400 p-1"><input value={item.name} onChange={(e)=>handleItemChange(item.id, 'name', e.target.value)} className={`w-full outline-none px-1 ${isEditMode ? 'bg-white' : 'bg-transparent'}`} placeholder="Tên SP"/></td>
                            <td className="border border-gray-400 p-1"><input value={item.unit} onChange={(e)=>handleItemChange(item.id, 'unit', e.target.value)} className={`w-full text-center outline-none ${isEditMode ? 'bg-white' : 'bg-transparent'}`}/></td>
                            <td className="border border-gray-400 p-1"><input type="number" value={item.qty} onChange={(e)=>handleItemChange(item.id, 'qty', e.target.value)} className={`w-full text-center font-bold outline-none ${isEditMode ? 'bg-white' : 'bg-transparent'}`}/></td>
                            {exportMode === 'full' && <>
                                <td className="border border-gray-400 p-1">
                                    <input 
                                        type="text" 
                                        value={formatNumberWithDots(item.price)} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\./g, '');
                                            if (/^\d*$/.test(val)) {
                                                handleItemChange(item.id, 'price', val === '' ? 0 : parseInt(val, 10));
                                            }
                                        }}
                                        className={`w-full text-right outline-none ${isEditMode ? 'bg-white' : 'bg-transparent'}`}
                                        placeholder="0"
                                    />
                                </td>
                                <td className="border border-gray-400 p-2 text-right">{formatCurrency(item.qty * item.price)}</td>
                            </>}
                            {exportMode === 'delivery' && <td className="border border-gray-400 p-2"></td>}
                            <td className="border border-gray-400 p-1 text-center print:hidden" data-html2canvas-ignore="true"><button onClick={()=>removeItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button></td>
                        </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold border-t-2 border-gray-800">
                        <td className="border border-gray-400 p-2 text-center" colSpan={2}>TỔNG CỘNG</td>
                        <td className="border border-gray-400 p-2"></td>
                        <td className="border border-gray-400 p-2 text-center text-lg">{totalQty}</td>
                        {exportMode === 'full' && <><td className="border border-gray-400 p-2"></td><td className="border border-gray-400 p-2 text-right text-lg text-blue-800">{formatCurrency(totalPrice)}</td></>}
                        {exportMode === 'delivery' && <td className="border border-gray-400 p-2"></td>}
                        <td className="border border-gray-400 p-2 print:hidden" data-html2canvas-ignore="true"></td>
                    </tr>
                </tbody>
            </table>

            {/* AMOUNT IN WORDS & BANK INFO */}
            {exportMode === 'full' && (
                <div className="mb-4">
                     {/* Bằng chữ */}
                    <div className="text-sm italic flex gap-2 items-center mb-2">
                        <span className="font-bold not-italic">Bằng chữ:</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{amountInWords || '...................................................'}</span>
                        <button onClick={handleNumberToWords} disabled={aiStatus !== null || totalPrice === 0} data-html2canvas-ignore="true" className="text-purple-600 bg-purple-50 border px-2 py-0.5 rounded text-xs font-bold print:hidden flex gap-1 items-center hover:bg-purple-100"><Sparkles size={10}/> AI</button>
                    </div>

                    {/* Thông tin chuyển khoản (Editable) */}
                    {showBankInfo && (
                        <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-300 text-sm">
                            <div className="flex gap-2 font-bold mb-1 text-gray-700 uppercase text-xs">Thông tin thanh toán:</div>
                            <textarea 
                                value={bankInfo} 
                                onChange={(e) => setBankInfo(e.target.value)} 
                                className={`w-full bg-transparent outline-none resize-none text-gray-800 leading-snug ${isEditMode ? 'bg-white p-1 border rounded h-16' : 'h-auto overflow-hidden'}`}
                                rows={isEditMode ? 3 : 1}
                            />
                        </div>
                    )}
                </div>
            )}
            
            <hr className="border-gray-300 my-4 border-dashed"/>

            {/* FOOTER */}
            <div className="grid grid-cols-3 gap-4 text-center mt-2 text-xs uppercase font-bold text-gray-700">
                <div><p>Người Lập</p><p className="italic font-normal text-gray-400 mt-12">(Ký tên)</p></div>
                <div><p>Giao Hàng</p><p className="italic font-normal text-gray-400 mt-12">(Ký tên)</p></div>
                <div><p>{exportMode === 'full' ? 'Khách Hàng' : 'Nhận Hàng'}</p><p className="italic font-normal text-gray-400 mt-12">(Ký tên)</p></div>
            </div>
        </div>
      </div>
    </div>
  );
}
