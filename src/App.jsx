import React, { useState, useRef, useEffect } from 'react';
import { Printer, FileDown, Plus, Trash2, Download, RefreshCw, PlusCircle, Sparkles, X, Minus, Wand2, Edit3, Settings, Eye, MessageCircle, Copy, Check, Share2, ChevronDown, Zap, Image as ImageIcon, Lightbulb, Globe, Tag, MapPin, Percent, Mail, Megaphone, BookOpen, ShieldAlert, Package, PhoneCall, ShieldCheck, CalendarClock, HeartHandshake, User, FileText, LayoutTemplate, FileSignature, BellRing, CloudSun, Box, Feather, Video, LifeBuoy, Store, CalendarDays, Ticket } from 'lucide-react';

// Cấu hình các khổ giấy phổ biến
const PAPER_TYPES = {
  'a4': { name: 'A4 (Dọc)', format: 'a4', orientation: 'portrait', width: '210mm', height: '297mm', previewWidth: '190mm' },
  'a5_land': { name: 'A5 (Ngang)', format: 'a5', orientation: 'landscape', width: '210mm', height: '148mm', previewWidth: '190mm' },
  'a5_port': { name: 'A5 (Dọc)', format: 'a5', orientation: 'portrait', width: '148mm', height: '210mm', previewWidth: '128mm' },
  'letter': { name: 'Letter (Mỹ)', format: 'letter', orientation: 'portrait', width: '216mm', height: '279mm', previewWidth: '196mm' },
  'legal': { name: 'Legal (Mỹ)', format: 'legal', orientation: 'portrait', width: '216mm', height: '356mm', previewWidth: '196mm' },
};

// CẤU HÌNH CÁC PHIÊN BẢN CỬA HÀNG (STORE MODES)
const STORE_MODES = {
  'pesticide': {
    label: 'Thuốc BVTV',
    headerTitle: 'HÓA ĐƠN THUỐC BVTV',
    context: 'cửa hàng vật tư nông nghiệp, thuốc bảo vệ thực vật',
    defaultItems: [
      { id: 1, name: 'APN Mepix 247', unit: 'Chai', qty: 40, price: 150000 },
      { id: 2, name: 'Cabophos 500ml', unit: 'Chai', qty: 24, price: 85000 },
      { id: 3, name: 'Nutri active APN', unit: 'Chai', qty: 24, price: 120000 },
    ]
  },
  'grocery': {
    label: 'Tạp Hóa & Gia Dụng',
    headerTitle: 'HÓA ĐƠN BÁN LẺ',
    context: 'cửa hàng tạp hóa, siêu thị mini, bán thực phẩm và đồ gia dụng',
    defaultItems: [
      { id: 1, name: 'Dầu ăn Tường An 1L', unit: 'Chai', qty: 10, price: 45000 },
      { id: 2, name: 'Nước mắm Nam Ngư', unit: 'Chai', qty: 5, price: 32000 },
      { id: 3, name: 'Bột giặt OMO 5kg', unit: 'Túi', qty: 2, price: 185000 },
    ]
  },
  'vet': {
    label: 'Thú Y & Chăn Nuôi',
    headerTitle: 'HÓA ĐƠN THÚ Y - THỨC ĂN',
    context: 'cửa hàng thuốc thú y và thức ăn chăn nuôi (cám, bắp, lúa, gạo)',
    defaultItems: [
      { id: 1, name: 'Cám heo Con Cò', unit: 'Bao', qty: 5, price: 280000 },
      { id: 2, name: 'Thuốc tẩy giun sán', unit: 'Lọ', qty: 20, price: 15000 },
      { id: 3, name: 'Bắp hạt sấy khô', unit: 'Kg', qty: 50, price: 8000 },
    ]
  },
  'wedding': {
    label: 'Hoa Cưới & Mâm Quả',
    headerTitle: 'HÓA ĐƠN DỊCH VỤ CƯỚI',
    context: 'dịch vụ trang trí tiệc cưới, làm hoa cưới và mâm quả rồng phụng',
    defaultItems: [
      { id: 1, name: 'Mâm quả Rồng Phụng VIP', unit: 'Cặp', qty: 1, price: 3500000 },
      { id: 2, name: 'Hoa cầm tay cô dâu', unit: 'Bó', qty: 1, price: 500000 },
      { id: 3, name: 'Xe hoa trang trí', unit: 'Gói', qty: 1, price: 1200000 },
    ]
  }
};

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
  const [storeMode, setStoreMode] = useState('pesticide'); // Mặc định là thuốc BVTV

  const [shopName, setShopName] = useState('ĐẠI LÝ THÀNH ĐẠT');
  const [shopSlogan, setShopSlogan] = useState('Uy tín tạo niềm tin - Chất lượng làm nên thương hiệu');
  const [shopPhone, setShopPhone] = useState('0357041668');
  const [shopAddress, setShopAddress] = useState('Số 125, DT685, xã Kiến Đức, tỉnh Lâm Đồng');

  const [customerName, setCustomerName] = useState('Khách Sỉ');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [items, setItems] = useState(STORE_MODES['pesticide'].defaultItems);
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
  const [shippingTags, setShippingTags] = useState([]); 

  // AI States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgModalTitle, setMsgModalTitle] = useState('Soạn Tin Nhắn'); 
  const [showAdvisorModal, setShowAdvisorModal] = useState(false); 
  const [advisorTitle, setAdvisorTitle] = useState('Tư Vấn Bán Hàng AI'); 
  const [advisorContent, setAdvisorContent] = useState(''); 
  const [importText, setImportText] = useState('');
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [aiStatus, setAiStatus] = useState(null); 
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState(0); 
  
  const noteRef = useRef(null);
  const fileInputRef = useRef(null); 

  // --- INIT USAGE COUNTER ---
  useEffect(() => {
      const today = new Date().toLocaleDateString('en-CA'); 
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

  // --- HANDLE MODE SWITCH ---
  const handleModeChange = (mode) => {
    setStoreMode(mode);
    setItems(STORE_MODES[mode].defaultItems);
    setAmountInWords('');
    setShippingTags([]);
    // Reset note nếu cần
    setNote('Kiểm hàng kỹ trước khi nhận');
  };

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
  const callGemini = async (prompt, imageBase64 = null) => {
      if (usageCount >= DAILY_LIMIT) {
          alert(`⚠️ ĐÃ ĐẠT GIỚI HẠN MIỄN PHÍ TRONG NGÀY!`);
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
        const parts = [{ text: prompt }];
        if (imageBase64) {
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: parts }] })
        });
        
        if (response.status === 429) throw new Error("Hệ thống đang bận. Vui lòng thử lại sau 30s.");

        const data = await response.json();
        if (!data.candidates?.length) throw new Error("No AI response");
        
        incrementUsage();
        return data.candidates[0].content.parts[0].text;
      } catch (error) { 
          console.error("Gemini Error:", error); 
          alert("Lỗi kết nối AI: " + error.message);
          return null; 
      }
  };

  // --- AI HANDLERS (ĐÃ CẬP NHẬT CONTEXT) ---
  const getContextPrompt = () => {
    return `Bạn đang là trợ lý AI cho một ${STORE_MODES[storeMode].context}. `;
  };

  const handleSmartImport = async () => {
      if (!importText.trim()) return;
      setAiStatus("Đang đọc & bóc tách đơn hàng...");
      
      const prompt = `
        ${getContextPrompt()}
        Nhiệm vụ: Bóc tách thông tin từ tin nhắn đặt hàng của khách.
        Văn bản đầu vào: "${importText}"
        Trả về JSON (chỉ JSON):
        {
          "customer": "Tên khách",
          "address": "Địa chỉ",
          "phone": "SĐT",
          "items": [ { "name": "Tên SP", "unit": "ĐVT", "qty": số lượng, "price": đơn giá (số) } ]
        }
        Lưu ý: "k"=000, "tr"=000000. Nếu là tên sản phẩm, hãy sửa lỗi chính tả cho phù hợp với ngành hàng ${STORE_MODES[storeMode].label}.
      `;

      try {
          const res = await callGemini(prompt);
          if (res) processAIResult(res);
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setAiStatus("Đang đọc ảnh đơn hàng...");
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
          const prompt = `
            ${getContextPrompt()}
            Hãy nhìn vào hình ảnh (có thể là đơn viết tay). Trích xuất thông tin đơn hàng và trả về JSON:
            {
              "customer": "Tên khách (nếu có)",
              "address": "Địa chỉ (nếu có)",
              "phone": "SĐT (nếu có)",
              "items": [ { "name": "Tên SP", "unit": "ĐVT", "qty": số lượng (số), "price": đơn giá (số) } ]
            }
            Hãy đoán tên sản phẩm dựa trên ngữ cảnh ngành hàng: ${STORE_MODES[storeMode].label}.
          `;
          
          try {
              const res = await callGemini(prompt, base64String);
              if (res) processAIResult(res);
          } catch (e) { console.error(e); } finally { 
              setAiStatus(null); 
              if(fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsDataURL(file);
  };

  const processAIResult = (res) => {
      const jsonStr = res.replace(/```json|```/g, '').trim();
      const startBrace = jsonStr.indexOf('{');
      const endBrace = jsonStr.lastIndexOf('}');
      
      if (startBrace !== -1 && endBrace !== -1) {
          const cleanJson = jsonStr.substring(startBrace, endBrace + 1);
          try {
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
                  alert("AI không tìm thấy sản phẩm nào.");
              }
          } catch (e) { alert("Lỗi đọc dữ liệu AI."); }
      } else {
          alert("AI không trả về đúng định dạng.");
      }
  };

  const handleTranslateInvoice = async () => {
      setAiStatus("Đang dịch sang Tiếng Anh...");
      const itemList = items.map(i => ({ name: i.name, unit: i.unit }));
      const prompt = `
        Dịch các thông tin sau sang Tiếng Anh chuẩn thương mại.
        Ngữ cảnh: ${STORE_MODES[storeMode].context}.
        1. Ghi chú: "${note}"
        2. Danh sách hàng: ${JSON.stringify(itemList)}
        Trả về JSON: { "note": "...", "items": [ { "name": "...", "unit": "..." } ] }
        Chỉ trả về JSON.
      `;

      try {
          const res = await callGemini(prompt);
          if (res) {
              const jsonStr = res.replace(/```json|```/g, '').trim().match(/\{.*\}/s)?.[0];
              if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  if (data.note) setNote(data.note);
                  if (data.items && Array.isArray(data.items) && data.items.length === items.length) {
                      setItems(items.map((it, idx) => ({
                          ...it,
                          name: data.items[idx].name || it.name,
                          unit: data.items[idx].unit || it.unit
                      })));
                  }
              }
          }
      } catch (e) { console.error(e); alert("Lỗi dịch thuật"); } finally { setAiStatus(null); }
  };

  const handleSmartTags = async () => {
      setAiStatus("Đang phân tích tính chất hàng hóa...");
      const itemNames = items.map(i => i.name).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Dựa trên danh sách: "${itemNames}".
        Đưa ra các thẻ cảnh báo vận chuyển (Shipping Tags) bằng Tiếng Việt (IN HOA) phù hợp với loại hàng hóa này.
        Ví dụ BVTV: [ĐỘC HẠI], [DỄ VỠ]. Ví dụ Đồ tươi: [HÀNG TƯƠI SỐNG], [NHẸ TAY].
        Trả về JSON Array of Strings.
      `;

      try {
          const res = await callGemini(prompt);
          if (res) {
              const jsonStr = res.replace(/```json|```/g, '').trim().match(/\[.*\]/s)?.[0] || '[]';
              const tags = JSON.parse(jsonStr);
              setShippingTags(tags);
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleFixAddress = async () => {
      if (!customerAddress.trim()) return;
      setAiStatus("Đang chuẩn hóa địa chỉ...");
      const prompt = `
        Chuẩn hóa địa chỉ sau về định dạng hành chính Việt Nam đầy đủ.
        Địa chỉ gốc: "${customerAddress}"
        Chỉ trả về nội dung địa chỉ mới, KHÔNG giải thích.
      `;
      try {
          const res = await callGemini(prompt);
          if (res) setCustomerAddress(res.trim());
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleSuggestDiscount = async () => {
      setAiStatus("Đang tính toán mức giảm giá...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const prompt = `
        ${getContextPrompt()}
        Đơn hàng: ${formatCurrency(total)}. Khách: ${customerName}.
        Gợi ý mức chiết khấu/quà tặng ngắn gọn để chốt đơn. Dưới 20 từ.
      `;
      try {
          const res = await callGemini(prompt);
          if (res) alert(`💡 Gợi ý từ AI:\n\n${res.trim()}`);
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleGenerateSlogan = async () => {
      setAiStatus("Đang sáng tạo slogan...");
      const prompt = `
        ${getContextPrompt()}
        Sáng tạo slogan ngắn gọn (dưới 12 từ), vần điệu cho shop "${shopName}".
        Phong cách: Uy tín, phù hợp với ngành hàng ${STORE_MODES[storeMode].label}.
        Chỉ trả về slogan, KHÔNG ngoặc kép.
      `;
      try {
          const res = await callGemini(prompt);
          if (res) {
              let clean = res.trim();
              if (clean.startsWith('"')) clean = clean.slice(1, -1);
              setShopSlogan(clean);
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleAskAdvisor = async () => {
      setAiStatus("Đang phân tích chiến lược bán hàng...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const prompt = `
        ${getContextPrompt()}
        Dựa trên đơn hàng: Khách ${customerName}, SP: ${JSON.stringify(items.map(i => ({name: i.name, qty: i.qty, price: i.price})))}.
        Đóng vai chuyên gia tư vấn trong lĩnh vực ${STORE_MODES[storeMode].label}, cho 3 lời khuyên ngắn (HTML <b>, <ul>): 1. Nhận định, 2. Bán thêm, 3. Chăm sóc.
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle('Tư Vấn Bán Hàng AI');
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  // --- NEW: DỰ BÁO MÙA VỤ ---
  const handleSeasonalTrend = async () => {
      setAiStatus("Đang phân tích xu hướng...");
      const itemList = items.map(i => i.name).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Dựa trên danh sách sản phẩm: ${itemList}.
        Hãy đóng vai chuyên gia thị trường của ngành ${STORE_MODES[storeMode].label}.
        Đưa ra nhận định về mùa vụ/xu hướng hiện tại.
        Gợi ý sản phẩm bán kèm (Cross-sell) hiệu quả.
        Trả về HTML ngắn gọn (<b>, <ul>, <li>).
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle(`Xu Hướng ${STORE_MODES[storeMode].label}`);
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  // --- NEW: TIN NHẮN NHẮC NỢ ---
  const handleDebtReminder = async () => {
      setAiStatus("Đang soạn tin nhắn nhắc nợ khéo...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const prompt = `
        Soạn tin nhắn Zalo nhắc khách hàng "${customerName}" thanh toán cho đơn hàng mã "${invoiceCode}".
        Tổng tiền nợ: ${formatCurrency(total)}.
        Ngành hàng: ${STORE_MODES[storeMode].label}.
        Yêu cầu: Cực kỳ khéo léo, lịch sự, giữ mối quan hệ. Ngắn gọn.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Tin Nhắn Nhắc Nợ Khéo');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleSuggestCombo = async () => {
      setAiStatus("Đang thiết kế Combo khuyến mãi...");
      const itemList = items.map(i => i.name).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Dựa trên các sản phẩm: ${itemList}.
        Hãy gợi ý 3 ý tưởng tạo 'Combo Khuyến Mãi' hấp dẫn.
        Trả về HTML đơn giản (<b>, <ul>, <li>).
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle('Gợi Ý Combo Khuyến Mãi');
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleReorderPrediction = async () => {
      setAiStatus("Đang dự báo thời gian khách mua lại...");
      const itemList = JSON.stringify(items.map(i => ({name: i.name, qty: i.qty, unit: i.unit})));
      const prompt = `
        ${getContextPrompt()}
        Dựa trên danh sách: ${itemList}.
        Ước lượng thời gian sử dụng và gợi ý thời điểm gọi lại mời mua thêm.
        Trả về phân tích ngắn gọn (HTML <b>, <ul>).
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle('Dự Báo Tái Tiêu Dùng');
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleRiskCheck = async () => {
      setAiStatus("Đang đánh giá rủi ro đơn hàng...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const prompt = `
        Phân tích rủi ro đơn hàng (Ngành: ${STORE_MODES[storeMode].label}):
        - Khách: ${customerName}, SĐT: ${customerPhone}, ĐC: ${customerAddress}
        - Tổng tiền: ${formatCurrency(total)}
        - Hàng hóa: ${JSON.stringify(items.map(i=>i.name))}

        Trả về đánh giá ngắn gọn (HTML):
        - 🛡️ **Mức độ rủi ro**: [Thấp/Trung Bình/Cao]
        - 📝 **Lý do**: Tại sao?
        - ✅ **Khuyến nghị**: Nên làm gì?
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle('Đánh Giá Rủi Ro Đơn Hàng');
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleCustomerPersona = async () => {
      setAiStatus("Đang phác họa chân dung khách hàng...");
      const itemList = JSON.stringify(items.map(i => ({name: i.name, qty: i.qty})));
      const prompt = `
        ${getContextPrompt()}
        Dựa trên đơn hàng: Khách "${customerName}" mua: ${itemList}.
        Phân tích chân dung khách hàng này (Persona).
        Trả về HTML ngắn gọn (<b>, <ul>): Ai? Quan tâm gì? Cách tiếp cận?
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle('Chân Dung Khách Hàng');
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  const handleProductDescription = async () => {
      setAiStatus("Đang viết bài đăng bán hàng...");
      const itemsStr = items.map(i => i.name).slice(0, 5).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Viết một đoạn mô tả sản phẩm hấp dẫn để đăng bán trên Facebook/Shopee cho các món: "${itemsStr}".
        Yêu cầu: Tiêu đề giật tít, công dụng chính, CTA, Hashtag. Dùng icon sinh động.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Bài Đăng Bán Hàng');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleGenerateNote = async () => {
      setAiStatus("Đang suy nghĩ lời chúc hay...");
      const itemsStr = items.map(i => i.name).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Viết DUY NHẤT 1 câu ghi chú ngắn gọn (dưới 15 từ) cho khách "${customerName}" mua: ${itemsStr}. 
        Chỉ trả về nội dung, KHÔNG ngoặc kép.
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
      const res = await callGemini(`Chuẩn hóa tên (Viết Hoa Chữ Đầu, Sửa Chính Tả): ${JSON.stringify(names)}. Trả về JSON Array of Strings. Ngữ cảnh: ${STORE_MODES[storeMode].label}.`);
      if (res) {
          try {
            const jsonStr = res.replace(/```json|```/g, '').trim().match(/\[.*\]/s)?.[0] || '[]';
            const fixed = JSON.parse(jsonStr);
            if (fixed.length === items.length) {
                // Sửa lỗi object invalid as child bằng cách ép kiểu string
                setItems(items.map((it, idx) => ({ 
                    ...it, 
                    name: typeof fixed[idx] === 'string' ? fixed[idx] : (fixed[idx]?.name || it.name) 
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
        ${getContextPrompt()}
        Hãy đóng vai chủ cửa hàng "${shopName}", soạn tin nhắn Zalo ngắn gọn gửi khách "${customerName}". 
        Thông tin: Đơn ${invoiceCode}, Tổng ${totalFormatted}, CK: "${bankInfo.replace(/\n/g, ', ')}". 
        Yêu cầu: Thân thiện, chuyên nghiệp.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Soạn Tin Zalo');
          setShowMsgModal(true); 
      } else { alert("AI đang bận, vui lòng thử lại!"); }
  };

  const handleDraftEmail = async () => {
      setAiStatus("Đang soạn Email chuyên nghiệp...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const totalFormatted = formatCurrency(total);
      const itemList = items.map(i => `- ${i.name} (${i.qty} ${i.unit}): ${formatCurrency(i.price)}`).join("\n");
      
      const prompt = `
        ${getContextPrompt()}
        Đóng vai chủ cửa hàng "${shopName}", soạn một Email gửi hóa đơn cho khách hàng "${customerName}".
        Thông tin:
        - Tiêu đề: Hóa đơn #${invoiceCode}
        - Chi tiết: ${itemList}
        - Tổng: ${totalFormatted}
        - CK: "${bankInfo.replace(/\n/g, ', ')}"
        - SĐT: ${shopPhone}, ĐC: ${shopAddress}.
        Chỉ trả về nội dung Body email.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Soạn Email');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  // --- NEW: SOẠN HỢP ĐỒNG ---
  const handleDraftContract = async () => {
      setAiStatus("Đang soạn thảo hợp đồng...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const itemList = items.map(i => `- ${i.name} (${i.qty} ${i.unit}): ${formatCurrency(i.price)}`).join("\n");
      
      const prompt = `
        Soạn một 'Hợp Đồng Mua Bán Hàng Hóa' ngắn gọn, chuẩn pháp lý giữa:
        - Bên A (Bán): ${shopName} (SĐT: ${shopPhone}, ĐC: ${shopAddress})
        - Bên B (Mua): ${customerName} (SĐT: ${customerPhone}, ĐC: ${customerAddress})
        - Ngành hàng: ${STORE_MODES[storeMode].label}
        
        Nội dung chính:
        1. Danh sách hàng hóa:
        ${itemList}
        2. Tổng giá trị: ${formatCurrency(total)} (Bằng chữ: ${amountInWords || '...'})
        3. Phương thức thanh toán: Chuyển khoản (Thông tin: ${bankInfo.replace(/\n/g, ', ')})
        4. Giao hàng & Bảo hành: Giao tận nơi, bảo hành theo quy định.
        5. Cam kết chung: Hai bên cam kết thực hiện đúng thỏa thuận.
        
        Chỉ trả về nội dung văn bản hợp đồng.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Hợp Đồng Mua Bán');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleSocialPost = async () => {
      setAiStatus("Đang viết status 'khoe đơn'...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const itemsStr = items.map(i => i.name).slice(0, 5).join(", "); 
      
      const prompt = `
        ${getContextPrompt()}
        Hãy viết một status Facebook/Zalo ngắn gọn, vui vẻ để khoe đơn hàng mới của shop "${shopName}".
        Thông tin đơn: Khách "${customerName[0]}***" (đã che tên), mua các món: ${itemsStr}... Tổng trị giá: ${formatCurrency(total)}.
        Yêu cầu: 
        - Giọng văn hào hứng, biết ơn khách.
        - Dùng nhiều icon sinh động 🚀🔥📦.
        - Thêm hashtag phù hợp.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Bài Đăng Khoe Đơn');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleLabelSummary = async () => {
      setAiStatus("Đang tóm tắt để in tem...");
      const itemsStr = items.map(i => `${i.qty} ${i.unit} ${i.name}`).join(", ");
      
      const prompt = `
        Tóm tắt danh sách hàng hóa này thành một câu cực ngắn (dưới 50 ký tự) để ghi lên phiếu gửi hàng (Tem vận chuyển).
        Danh sách: "${itemsStr}".
        Ví dụ output: 10 chai Anvil + 2 bao NPK.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Nội Dung Tem Dán');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleUsageGuide = async () => {
      setAiStatus("Đang tra cứu hướng dẫn sử dụng...");
      const itemsStr = items.map(i => i.name).join(", ");
      
      const prompt = `
        ${getContextPrompt()}
        Dựa trên danh sách sản phẩm: "${itemsStr}".
        Hãy soạn một "Hướng dẫn sử dụng nhanh & Lưu ý an toàn" ngắn gọn cho khách hàng.
        Trình bày gạch đầu dòng rõ ràng từng món.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Hướng Dẫn Sử Dụng');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleCallScript = async () => {
      setAiStatus("Đang soạn kịch bản gọi xác nhận...");
      const total = items.reduce((s, i) => s + (i.qty * i.price), 0);
      const prompt = `
        Soạn kịch bản gọi điện xác nhận đơn hàng cho nhân viên shop "${shopName}".
        Khách: ${customerName}, SĐT: ${customerPhone}.
        Đơn: ${invoiceCode}, Tổng: ${formatCurrency(total)}.
        Ngành: ${STORE_MODES[storeMode].label}.
        Yêu cầu: Lịch sự, ngắn gọn, chốt nhanh địa chỉ và thời gian giao hàng.
        Trả về text kịch bản.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Kịch Bản Gọi Xác Nhận');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleWarrantyPolicy = async () => {
      setAiStatus("Đang soạn chính sách bảo hành...");
      const itemsStr = items.map(i => i.name).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Dựa trên danh sách sản phẩm: "${itemsStr}".
        Hãy soạn một "Chính sách Bảo hành & Đổi trả" ngắn gọn, hợp lý cho shop "${shopName}".
        Trả về dạng gạch đầu dòng.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Chính Sách Bảo Hành');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  const handleThankYouLetter = async () => {
      setAiStatus("Đang soạn thư cảm ơn...");
      const prompt = `
        ${getContextPrompt()}
        Soạn một bức thư cảm ơn ngắn gọn, chân thành để in và bỏ vào hộp hàng gửi cho khách hàng "${customerName}".
        Shop: "${shopName}".
        Nội dung: Cảm ơn đã tin tưởng, mong khách hài lòng, nhắc nhẹ khách đánh giá 5 sao nếu ưng ý.
        Giọng văn: Ấm áp, trân trọng.
      `;
      const res = await callGemini(prompt);
      setAiStatus(null);
      if (res) { 
          setGeneratedMsg(res.trim()); 
          setMsgModalTitle('Thư Cảm Ơn');
          setShowMsgModal(true); 
      } else { alert("AI đang bận."); }
  };

  // --- NEW: KỊCH BẢN LIVESTREAM ---
  const handleLivestreamScript = async () => {
      setAiStatus("Đang viết kịch bản Livestream...");
      const itemsStr = items.map(i => i.name).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Tôi muốn livestream bán các sản phẩm: "${itemsStr}".
        Hãy viết một kịch bản livestream ngắn (khoảng 3-5 phút) thật sôi động, hấp dẫn.
        Bao gồm: Chào hỏi năng lượng, Giới thiệu công dụng, Deal hời/Minigame, Kêu gọi chốt đơn.
        Trả về định dạng HTML đơn giản (<b>, <ul>, <p>).
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
               setAdvisorTitle('Kịch Bản Livestream Bán Hàng');
               setAdvisorContent(res); 
               setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  // --- NEW: GỠ RỐI KHIẾU NẠI ---
  const handleComplaintSolver = async () => {
      setAiStatus("Đang tìm cách xoa dịu khách hàng...");
      const prompt = `
        ${getContextPrompt()}
        Khách hàng đang phàn nàn về đơn hàng này.
        Hãy soạn 3 mẫu tin nhắn phản hồi để xử lý khủng hoảng:
        1. 🐢 Giao chậm.
        2. 📦 Hàng lỗi/Móp.
        3. 😠 Khách nóng giận vô cớ.
        Giọng văn: Cầu thị, nhận trách nhiệm, đặt quyền lợi khách lên đầu.
        Trả về định dạng HTML.
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
               setAdvisorTitle('Gỡ Rối & Xử Lý Khiếu Nại');
               setAdvisorContent(res); 
               setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  // --- NEW: TRỢ LÝ ĐÓNG GÓI ---
  const handlePackagingGuide = async () => {
      setAiStatus("Đang tính toán phương án đóng gói...");
      const itemsStr = items.map(i => `${i.qty} ${i.unit} ${i.name}`).join(", ");
      const prompt = `
        Đóng vai chuyên gia logistic. Dựa trên đơn hàng: "${itemsStr}".
        Ngành: ${STORE_MODES[storeMode].label}.
        Hướng dẫn chi tiết cách đóng gói đơn hàng này để gửi chuyển phát nhanh an toàn nhất.
        Lưu ý đặc tính sản phẩm (dễ vỡ, nặng, tươi sống...).
        Đưa ra các bước: Chuẩn bị vật liệu, Sắp xếp, Gia cố.
        Trả về HTML (<ul>, <li>, <b>).
      `;
      try {
          const res = await callGemini(prompt);
          if (res) {
               setAdvisorTitle('Hướng Dẫn Đóng Gói An Toàn');
               setAdvisorContent(res);
               setShowAdvisorModal(true);
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  // --- NEW: LÀM THƠ TẶNG KHÁCH ---
  const handleMakePoem = async () => {
      setAiStatus("Đang xuất khẩu thành thơ...");
      const itemsStr = items.map(i => i.name).join(", ");
      const prompt = `
        ${getContextPrompt()}
        Hãy sáng tác một bài thơ ngắn (khoảng 4 câu) để cảm ơn khách hàng tên "${customerName}".
        Nội dung lồng ghép khéo léo việc khách đã mua: ${itemsStr}.
        Giọng điệu: Vui vẻ, hào sảng.
        Chỉ trả về nội dung thơ.
      `;
      try {
          const res = await callGemini(prompt);
          if (res) {
              setGeneratedMsg(res.trim());
              setMsgModalTitle('Thơ Cảm Ơn Khách Hàng');
              setShowMsgModal(true);
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  // --- NEW: LÊN LỊCH CHĂM SÓC (CARE SCHEDULE) ---
  const handleCareSchedule = async () => {
      setAiStatus("Đang lập lịch trình chăm sóc...");
      const itemList = JSON.stringify(items.map(i => ({name: i.name, qty: i.qty})));
      const prompt = `
        ${getContextPrompt()}
        Dựa trên đơn hàng của khách "${customerName}" (Sản phẩm: ${itemList}).
        Hãy lập một lịch trình chăm sóc khách hàng sau bán (After-sales) trong 30 ngày.
        Ví dụ: Ngày 1 (Cảm ơn), Ngày 7 (Hỏi thăm sử dụng), Ngày 30 (Mời mua lại).
        Trả về HTML (<ul>, <li>).
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle('Lịch Trình Chăm Sóc Khách Hàng');
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
  };

  // --- NEW: TẠO MÃ GIẢM GIÁ (COUPON) ---
  const handleCouponGenerator = async () => {
      setAiStatus("Đang sáng tạo mã giảm giá...");
      const prompt = `
        Hãy sáng tạo 5 ý tưởng Mã Giảm Giá (Coupon Code) độc đáo dành riêng cho khách "${customerName}" của shop "${shopName}".
        Ngành: ${STORE_MODES[storeMode].label}.
        Mã nên ngắn gọn, dễ nhớ, mang tính cá nhân hóa.
        Trả về HTML (<ul>, <li>).
      `;
      try {
          const res = await callGemini(prompt);
          if (res) { 
              setAdvisorTitle('Mã Giảm Giá Độc Quyền');
              setAdvisorContent(res); 
              setShowAdvisorModal(true); 
          }
      } catch (e) { console.error(e); } finally { setAiStatus(null); }
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
  const resetData = () => { if(confirm("Xóa dữ liệu?")) { setItems([{ id: Date.now(), name: '', unit: '', qty: 1, price: 0 }]); setAmountInWords(''); setCustomerName(''); setCustomerPhone(''); setCustomerAddress(''); setShippingTags([]); setShopSlogan(''); } };

  // --- SMART SHARE ZALO ---
  const handleShareZalo = () => {
      if (isProcessing) return;
      setIsProcessing(true);
      setIsEditMode(false); 

      setTimeout(() => {
          const element = noteRef.current;
          const config = PAPER_TYPES[paperType];
          const filename = `HoaDon_${invoiceCode}.pdf`;
          const opt = { margin: 5, filename: filename, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: config.format, orientation: config.orientation } };
          const processBlob = (blob) => {
              const file = new File([blob], filename, { type: 'application/pdf' });
              if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: 'Gửi hóa đơn', text: `Gửi bạn hóa đơn ${invoiceCode}` }).then(() => alert("Thành công!")).catch(() => {}).finally(() => { setIsProcessing(false); setIsEditMode(true); }); } 
              else { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); const msg = `Gửi bạn hóa đơn ${invoiceCode}.\nTổng: ${formatCurrency(totalPrice)}\n\n${bankInfo}`; navigator.clipboard.writeText(msg); alert("Đã tải PDF và COPY tin nhắn Zalo!"); setIsProcessing(false); setIsEditMode(true); }
          };
          if (window.html2pdf) { window.html2pdf().set(opt).from(element).output('blob').then(processBlob); } else { const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"; script.onload = () => { window.html2pdf().set(opt).from(element).output('blob').then(processBlob); }; document.body.appendChild(script); }
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
          const opt = { margin: 5, filename: `${mode==='full'?'HOADON':'PHIEU'}_${invoiceCode}.pdf`, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: config.format, orientation: config.orientation } };
          const done = () => { setIsProcessing(false); setExportMode('full'); setIsEditMode(true); }; 
          if (action === 'print') { window.print(); done(); } 
          else { if (!window.html2pdf) { const script = document.createElement('script'); script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"; script.onload = () => { window.html2pdf().set(opt).from(element).save().then(done).catch(done); }; document.body.appendChild(script); } else { window.html2pdf().set(opt).from(element).save().then(done).catch(done); } }
      }, 500);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 font-sans print:bg-white print:p-0">
      {aiStatus && <AILoader message={aiStatus} />}

      {/* --- MODAL IMPORT --- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2 text-purple-700"><Sparkles/> Nhập Đơn Hàng</h3><button onClick={()=>setShowImportModal(false)}><X/></button></div>
                <textarea className="w-full border p-3 h-24 rounded outline-none focus:ring-2 focus:ring-purple-200 mb-4" placeholder='Dán tin nhắn vào đây... Ví dụ: "Lấy cho anh Dũng 10 chai Anvil 260k"' value={importText} onChange={e=>setImportText(e.target.value)}></textarea>
                <div className="flex items-center justify-center w-full mb-4">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6"><ImageIcon className="w-8 h-8 text-gray-400 mb-2"/><p className="text-sm text-gray-500"><span className="font-semibold">Bấm để tải ảnh lên</span> (Hóa đơn tay/Tin nhắn)</p></div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
                <div className="flex justify-end gap-2"><button onClick={()=>setShowImportModal(false)} className="px-4 py-2 bg-gray-100 rounded">Hủy</button><button onClick={handleSmartImport} disabled={!importText.trim()} className="px-4 py-2 bg-purple-600 text-white rounded">Phân tích Text</button></div>
            </div>
        </div>
      )}

      {/* --- MODAL ADVISOR --- */}
      {showAdvisorModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2 text-yellow-600 text-xl"><Lightbulb/> {advisorTitle}</h3><button onClick={()=>setShowAdvisorModal(false)}><X/></button></div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: advisorContent }}></div>
                <div className="mt-4 text-right"><button onClick={()=>setShowAdvisorModal(false)} className="px-4 py-2 bg-gray-200 rounded font-medium hover:bg-gray-300">Đóng</button></div>
            </div>
        </div>
      )}

      {/* --- MODAL MESSAGE --- */}
      {showMsgModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2 text-blue-600"><MessageCircle/> {msgModalTitle}</h3><button onClick={()=>setShowMsgModal(false)}><X/></button></div>
                <div className="relative"><textarea readOnly className="w-full border p-3 h-64 rounded outline-none bg-gray-50 text-sm font-medium" value={generatedMsg}></textarea><button onClick={copyToClipboard} className="absolute bottom-2 right-2 flex items-center gap-1 bg-white border shadow px-2 py-1 rounded text-xs font-bold text-gray-700 hover:bg-gray-100">{copied ? <Check size={14} className="text-green-600"/> : <Copy size={14}/>} {copied ? 'Đã chép' : 'Sao chép'}</button></div>
            </div>
        </div>
      )}

      {/* --- TOOLBAR --- */}
      <div className="w-full max-w-5xl bg-white p-3 rounded-lg shadow-md mb-6 print:hidden border sticky top-0 z-50 flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2 items-center">
            {/* STORE SWITCHER (NEW) */}
            <div className="relative group mr-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-sm font-bold shadow-sm">
                   <Store size={16}/> {STORE_MODES[storeMode].label} <ChevronDown size={14}/>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 hidden group-hover:block">
                    {Object.keys(STORE_MODES).map(key => (
                        <button key={key} onClick={() => handleModeChange(key)} className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 ${storeMode === key ? 'bg-orange-100 font-bold text-orange-700' : 'text-gray-700'}`}>
                            {STORE_MODES[key].label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${usageCount >= DAILY_LIMIT ? 'bg-red-100 text-red-600' : 'bg-purple-50 text-purple-700'}`}><Zap size={14}/> <span>{usageCount}/{DAILY_LIMIT}</span></div>
            <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${isEditMode ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-100 text-gray-600'}`}>{isEditMode ? <><Edit3 size={16}/> Sửa</> : <><Eye size={16}/> Xem</>}</button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            
            {/* Nhập AI */}
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-sm font-bold hover:bg-purple-100 transition-all" title="Nhập đơn hàng (Text/Ảnh)"><Sparkles size={16}/> Nhập</button>
            
            {/* Nhóm chức năng Tư vấn & Hỗ trợ */}
            <div className="flex items-center bg-yellow-50 rounded-full p-0.5 border border-yellow-100">
                <button onClick={handleAskAdvisor} className="p-1.5 text-yellow-700 hover:bg-yellow-100 rounded-full transition-all" title="Tư vấn bán hàng"><Lightbulb size={16}/></button>
                <button onClick={handleCustomerPersona} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-all" title="Phân tích chân dung khách hàng"><User size={16}/></button>
                <button onClick={handleRiskCheck} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-all" title="Đánh giá rủi ro bom hàng"><ShieldAlert size={16}/></button>
                <button onClick={handleTranslateInvoice} className="p-1.5 text-indigo-700 hover:bg-indigo-100 rounded-full transition-all" title="Dịch tiếng Anh"><Globe size={16}/></button>
                <button onClick={handleSuggestCombo} className="p-1.5 text-pink-600 hover:bg-pink-100 rounded-full transition-all" title="Gợi ý Combo khuyến mãi"><LayoutTemplate size={16}/></button>
                <button onClick={handleReorderPrediction} className="p-1.5 text-green-700 hover:bg-green-100 rounded-full transition-all" title="Dự báo tái tiêu dùng"><CalendarClock size={16}/></button>
                <button onClick={handleSeasonalTrend} className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-full transition-all" title="Dự báo mùa vụ (Mới)"><CloudSun size={16}/></button>
                <button onClick={handleCareSchedule} className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-full transition-all" title="Lịch chăm sóc khách hàng (Mới)"><CalendarDays size={16}/></button>
                <button onClick={handleCouponGenerator} className="p-1.5 text-fuchsia-600 hover:bg-fuchsia-100 rounded-full transition-all" title="Tạo mã giảm giá độc đáo (Mới)"><Ticket size={16}/></button>
            </div>
            
            {/* Nhóm nút Giao tiếp & Hướng dẫn & In Tem */}
            <div className="flex items-center bg-blue-50 rounded-full p-0.5 border border-blue-100">
                <button onClick={handleDraftMessage} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Soạn tin Zalo"><MessageCircle size={16}/></button>
                <button onClick={handleDebtReminder} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-all" title="Tin nhắn nhắc nợ"><BellRing size={16}/></button>
                <button onClick={handleDraftEmail} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Soạn Email"><Mail size={16}/></button>
                <button onClick={handleCallScript} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Kịch bản gọi điện"><PhoneCall size={16}/></button>
                <button onClick={handleSocialPost} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Tạo bài khoe đơn"><Megaphone size={16}/></button>
                <button onClick={handleLivestreamScript} className="p-1.5 text-pink-600 hover:bg-pink-100 rounded-full transition-all" title="Kịch bản Livestream"><Video size={16}/></button>
                <button onClick={handleProductDescription} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Tạo mô tả sản phẩm"><FileText size={16}/></button>
                <button onClick={handleUsageGuide} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Tạo hướng dẫn sử dụng"><BookOpen size={16}/></button>
                <button onClick={handleComplaintSolver} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-all" title="Gỡ rối khiếu nại"><LifeBuoy size={16}/></button>
                <button onClick={handleWarrantyPolicy} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Chính sách bảo hành"><ShieldCheck size={16}/></button>
                <button onClick={handleDraftContract} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Soạn hợp đồng mua bán"><FileSignature size={16}/></button>
                <button onClick={handleThankYouLetter} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Thư cảm ơn"><HeartHandshake size={16}/></button>
                <button onClick={handlePackagingGuide} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Hướng dẫn đóng gói"><Box size={16}/></button>
                <button onClick={handleMakePoem} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Làm thơ tặng khách"><Feather size={16}/></button>
                <button onClick={handleLabelSummary} className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-full transition-all" title="Tạo nội dung in tem dán"><Package size={16}/></button>
            </div>

            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-bold"><Plus size={16}/> Thêm</button>
            <button onClick={()=>removeItem(items[items.length-1].id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-bold"><Minus size={16}/> Xóa</button>
            
            <div className="relative"><div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-bold text-gray-700 cursor-pointer border border-transparent hover:border-gray-300 group"><span>{PAPER_TYPES[paperType]?.name}</span><ChevronDown size={14}/><select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">{Object.keys(PAPER_TYPES).map(key => (<option key={key} value={key}>{PAPER_TYPES[key].name}</option>))}</select></div></div>
             <button onClick={() => setShowBankInfo(!showBankInfo)} className={`p-2 rounded ${showBankInfo ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}><Settings size={18}/></button>
             <button onClick={resetData} className="text-gray-500 p-2"><RefreshCw size={18}/></button>
        </div>
        <div className="flex gap-2">
             <button onClick={handleShareZalo} disabled={isProcessing} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm font-medium flex gap-1 items-center shadow-sm"><Share2 size={16}/> <span className="hidden sm:inline">Gửi Zalo</span></button>
             <div className="flex bg-blue-50 rounded-lg p-1 border border-blue-100"><button onClick={() => handleExport('delivery', 'pdf')} disabled={isProcessing} className="px-3 py-1.5 text-blue-700 text-sm font-medium flex gap-1"><FileDown size={16}/> Kho</button><div className="w-px bg-blue-200 mx-1"></div><button onClick={() => handleExport('delivery', 'print')} disabled={isProcessing} className="px-2 text-blue-700"><Printer size={16}/></button></div>
            <div className="flex bg-purple-50 rounded-lg p-1 border border-purple-100"><button onClick={() => handleExport('full', 'pdf')} disabled={isProcessing} className="px-3 py-1.5 text-purple-700 text-sm font-medium flex gap-1"><Download size={16}/> Hóa Đơn</button><div className="w-px bg-purple-200 mx-1"></div><button onClick={() => handleExport('full', 'print')} disabled={isProcessing} className="px-2 text-purple-700"><Printer size={16}/></button></div>
        </div>
      </div>

      {/* --- INVOICE PAPER --- */}
      <div className="w-full overflow-auto flex justify-center pb-20">
        <div 
            ref={noteRef} 
            className={`bg-white p-8 shadow-2xl print:shadow-none transition-all duration-300 relative ${isEditMode ? 'ring-2 ring-orange-100' : ''}`} 
            style={{ width: PAPER_TYPES[paperType]?.previewWidth, minHeight: (PAPER_TYPES[paperType]?.orientation === 'landscape' ? '148mm' : '297mm') }}
        >
            {/* HEADER */}
            <div className="flex justify-between border-b-2 border-gray-800 pb-4 mb-4">
                <div className="flex-1">
                    <input value={shopName} onChange={e => setShopName(e.target.value)} className={`w-full text-xl font-bold uppercase text-gray-800 bg-transparent outline-none ${isEditMode ? 'placeholder-gray-300 border-b border-dashed border-gray-300' : ''}`} placeholder="TÊN CỬA HÀNG" />
                    
                    {/* SLOGAN */}
                    <div className="flex items-center gap-1 mb-2">
                        <input value={shopSlogan} onChange={e => setShopSlogan(e.target.value)} className={`w-full text-sm italic text-gray-500 bg-transparent outline-none ${isEditMode ? 'border-b border-dashed border-gray-300' : ''}`} placeholder="Slogan cửa hàng..."/>
                        <button onClick={handleGenerateSlogan} disabled={aiStatus !== null} data-html2canvas-ignore="true" className="text-purple-500 hover:text-purple-700 opacity-50 hover:opacity-100 print:hidden" title="Tạo Slogan AI"><Sparkles size={14}/></button>
                    </div>

                    <div className="flex items-center gap-1 mt-1"><span className="text-sm text-gray-600 shrink-0">SĐT:</span><input value={shopPhone} onChange={e => setShopPhone(e.target.value)} className={`w-full text-sm text-gray-600 bg-transparent outline-none ${isEditMode ? 'border-b border-dashed border-gray-300' : ''}`} placeholder="Số điện thoại"/></div>
                    <div className="flex items-center gap-1"><span className="text-sm text-gray-600 shrink-0">ĐC:</span><input value={shopAddress} onChange={e => setShopAddress(e.target.value)} className={`w-full text-sm text-gray-600 bg-transparent outline-none ${isEditMode ? 'border-b border-dashed border-gray-300' : ''}`} placeholder="Địa chỉ"/></div>
                </div>
                <div className="text-right ml-4">
                    {/* TIÊU ĐỀ HÓA ĐƠN THAY ĐỔI THEO MODE */}
                    <h2 className="text-xl font-bold uppercase">{STORE_MODES[storeMode].headerTitle}</h2>
                    <div className="text-sm mt-1">
                        <div className="flex justify-end gap-1"><span className="text-gray-600">Số:</span><input value={invoiceCode} onChange={(e)=>setInvoiceCode(e.target.value)} className={`font-bold text-red-600 w-20 text-right outline-none ${isEditMode ? 'bg-yellow-50' : 'bg-transparent'}`}/></div>
                        <div className="flex justify-end gap-1"><span className="text-gray-600">Ngày:</span><input value={date} onChange={(e)=>setDate(e.target.value)} className={`w-24 text-right outline-none ${isEditMode ? 'bg-yellow-50' : 'bg-transparent'}`}/></div>
                    </div>
                </div>
            </div>

            {/* CUSTOMER INFO */}
            <div className="mb-6 text-sm">
                <div className="flex gap-2 items-center mb-1"><span className="font-bold w-24 shrink-0">Khách hàng:</span><input value={customerName} onChange={e=>setCustomerName(e.target.value)} className={`flex-1 outline-none font-medium ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Tên khách hàng"/></div>
                <div className="flex gap-2 items-center mb-1"><span className="font-bold w-24 shrink-0">Điện thoại:</span><input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className={`flex-1 outline-none ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Số điện thoại"/></div>
                 <div className="flex gap-2 items-center mb-1">
                    <span className="font-bold w-24 shrink-0">Địa chỉ:</span><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className={`flex-1 outline-none ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Địa chỉ"/>
                    <button onClick={handleFixAddress} disabled={aiStatus !== null} data-html2canvas-ignore="true" className="text-blue-500 hover:text-blue-700 ml-2" title="Chuẩn hóa địa chỉ"><MapPin size={14}/></button>
                 </div>
                <div className="flex gap-2 items-center relative"><span className="font-bold w-24 shrink-0">Ghi chú:</span><input value={note} onChange={(e)=>setNote(e.target.value)} className={`flex-1 outline-none italic pr-8 ${isEditMode ? 'bg-blue-50 px-1 rounded' : 'bg-transparent border-b border-dotted border-gray-400'}`} placeholder="Ghi chú đơn hàng"/><button onClick={handleGenerateNote} disabled={aiStatus !== null} data-html2canvas-ignore="true" className="absolute right-0 text-purple-500 print:hidden opacity-50 hover:opacity-100"><Sparkles size={14}/></button></div>
            </div>

            {/* SHIPPING TAGS */}
            {shippingTags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 items-center border-l-4 border-orange-400 pl-3 bg-orange-50 p-2 rounded">
                    <span className="text-xs font-bold text-orange-600 flex gap-1"><Tag size={14}/> LƯU Ý VẬN CHUYỂN:</span>
                    {shippingTags.map((tag, idx) => (
                        <span key={idx} className="text-xs font-bold bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded shadow-sm">{tag}</span>
                    ))}
                </div>
            )}

            {/* TABLE */}
            <table className="w-full border-collapse border border-gray-800 mb-4 text-sm">
                <thead>
                    <tr className="bg-gray-200 text-xs font-bold uppercase group">
                        <th className="border border-gray-400 p-2 w-10 text-center">STT</th>
                        <th className="border border-gray-400 p-2 text-left relative">Tên sản phẩm 
                            <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                <button onClick={handleFixProductNames} disabled={aiStatus !== null} data-html2canvas-ignore="true" className="text-purple-500 hover:text-purple-700" title="Chuẩn hóa tên"><Wand2 size={14}/></button>
                                <button onClick={handleSmartTags} disabled={aiStatus !== null} data-html2canvas-ignore="true" className="text-orange-500 hover:text-orange-700" title="Gắn thẻ vận chuyển"><Tag size={14}/></button>
                            </div>
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
                                <td className="border border-gray-400 p-1"><input type="text" value={formatNumberWithDots(item.price)} onChange={(e) => { const val = e.target.value.replace(/\./g, ''); if (/^\d*$/.test(val)) handleItemChange(item.id, 'price', val === '' ? 0 : parseInt(val, 10)); }} className={`w-full text-right outline-none ${isEditMode ? 'bg-white' : 'bg-transparent'}`} placeholder="0"/></td>
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
                        {exportMode === 'full' && <>
                            <td className="border border-gray-400 p-2"></td>
                            <td className="border border-gray-400 p-2 text-right text-lg text-blue-800 relative group">
                                {formatCurrency(totalPrice)}
                                <button onClick={handleSuggestDiscount} data-html2canvas-ignore="true" className="absolute right-0 top-0 -mt-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden" title="Gợi ý chiết khấu"><Percent size={14}/></button>
                            </td>
                        </>}
                        {exportMode === 'delivery' && <td className="border border-gray-400 p-2"></td>}
                        <td className="border border-gray-400 p-2 print:hidden" data-html2canvas-ignore="true"></td>
                    </tr>
                </tbody>
            </table>

            {/* AMOUNT WORDS & BANK */}
            {exportMode === 'full' && (
                <div className="mb-4">
                    <div className="text-sm italic flex gap-2 items-center mb-2">
                        <span className="font-bold not-italic">Bằng chữ:</span>
                        <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{amountInWords || '...................................................'}</span>
                        <button onClick={handleNumberToWords} disabled={aiStatus !== null || totalPrice === 0} data-html2canvas-ignore="true" className="text-purple-600 bg-purple-50 border px-2 py-0.5 rounded text-xs font-bold print:hidden flex gap-1 items-center hover:bg-purple-100"><Sparkles size={10}/> AI</button>
                    </div>
                    {showBankInfo && (
                        <div className="bg-gray-50 p-2 rounded border border-dashed border-gray-300 text-sm">
                            <div className="flex gap-2 font-bold mb-1 text-gray-700 uppercase text-xs">Thông tin thanh toán:</div>
                            <textarea value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className={`w-full bg-transparent outline-none resize-none text-gray-800 leading-snug ${isEditMode ? 'bg-white p-1 border rounded h-16' : 'h-auto overflow-hidden'}`} rows={isEditMode ? 3 : 1}/>
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