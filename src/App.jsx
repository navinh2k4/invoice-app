import React, { useState, useRef } from 'react';
import { Printer, FileDown, Plus, Trash2, FileSpreadsheet, Download, RefreshCw, PlusCircle, Sparkles, X, Minus, Wand2 } from 'lucide-react';

export default function InvoiceMakerApp() {
  // Dữ liệu mẫu ban đầu
  const initialData = [
    { id: 1, name: 'APN Mepix 247', unit: 'Chai', qty: 40, price: 150000 },
    { id: 2, name: 'Cabophos 500ml', unit: 'Chai', qty: 24, price: 85000 },
    { id: 3, name: 'Nutri active APN 500ml', unit: 'Chai', qty: 24, price: 120000 },
  ];

  const [items, setItems] = useState(initialData);
  const [customer, setCustomer] = useState('Khách Sỉ');
  const [note, setNote] = useState('Kiểm hàng kỹ trước khi nhận');
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));
  const [invoiceCode, setInvoiceCode] = useState('HD001');
  const [paperSize, setPaperSize] = useState('a5'); 
  const [exportMode, setExportMode] = useState('full'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountInWords, setAmountInWords] = useState(''); 
  
  // AI States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [isWordsLoading, setIsWordsLoading] = useState(false);
  const [isFixingNames, setIsFixingNames] = useState(false);
  
  const noteRef = useRef(null);

  // --- GEMINI API HELPERS ---
  const callGemini = async (prompt) => {
      // Sử dụng empty string để môi trường runtime tự động inject key
      const apiKey = ""; 
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("Không nhận được phản hồi từ AI");
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      } catch (error) {
          console.error("Gemini API Error:", error);
          throw error;
      }
  };

  // --- CÁC HÀM XỬ LÝ AI ---
  const handleSmartImport = async () => {
      if (!importText.trim()) return;
      setIsAiLoading(true);
      
      const prompt = `
        Bạn là trợ lý ảo giúp trích xuất đơn hàng.
        Phân tích đoạn văn bản sau và trả về một danh sách JSON các mặt hàng.
        Văn bản input: "${importText}"
        Yêu cầu output JSON (Array): [{ "name": "...", "unit": "...", "qty": number, "price": number }]
        Chỉ trả về JSON Array, không thêm markdown.
      `;

      try {
          const result = await callGemini(prompt);
          if (result) {
              let cleanJson = result.replace(/```json|```/g, '').trim();
              const startIndex = cleanJson.indexOf('[');
              const endIndex = cleanJson.lastIndexOf(']');
              
              if (startIndex !== -1 && endIndex !== -1) {
                  cleanJson = cleanJson.substring(startIndex, endIndex + 1);
                  const parsedItems = JSON.parse(cleanJson);
                  if (Array.isArray(parsedItems)) {
                      const newItems = parsedItems.map(item => ({
                          id: Date.now() + Math.random(),
                          name: item.name || 'Sản phẩm mới',
                          unit: item.unit || 'Cái',
                          qty: Math.max(0, Number(item.qty) || 1),
                          price: Math.max(0, Number(item.price) || 0)
                      }));
                      setItems(prev => [...prev, ...newItems]);
                      setImportText('');
                      setShowImportModal(false);
                  }
              } else {
                  alert("Không tìm thấy dữ liệu hợp lệ.");
              }
          }
      } catch (error) {
          alert("Lỗi AI: " + error.message);
      } finally {
          setIsAiLoading(false);
      }
  };

  const handleGenerateNote = async () => {
      setIsNoteLoading(true);
      const productList = items.map(i => i.name).join(", ");
      const prompt = `Viết 1 câu ghi chú ngắn (dưới 15 từ) cho khách tên "${customer}" vừa mua: ${productList}. Mục đích: Cảm ơn/Dặn dò. Chỉ trả về nội dung text.`;
      try {
          const result = await callGemini(prompt);
          if (result) setNote(result.trim());
      } catch (error) { console.error(error); } finally { setIsNoteLoading(false); }
  };

  const handleNumberToWords = async () => {
      if (items.reduce((sum, item) => sum + (item.qty * item.price), 0) === 0) return;
      setIsWordsLoading(true);
      const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
      const prompt = `Đọc số tiền: ${total} thành chữ tiếng Việt (viết hoa đầu, kết thúc 'đồng'). Chỉ trả về text.`;
      try {
          const result = await callGemini(prompt);
          if (result) setAmountInWords(result.trim());
      } catch (error) { console.error(error); } finally { setIsWordsLoading(false); }
  };

  const handleFixProductNames = async () => {
      setIsFixingNames(true);
      const names = items.map(i => i.name);
      const prompt = `Chuẩn hóa danh sách tên này (Sửa chính tả, Viết Hoa Chữ Cái Đầu): ${JSON.stringify(names)}. Trả về JSON Array string.`;
      try {
          const result = await callGemini(prompt);
          if (result) {
              let cleanJson = result.replace(/```json|```/g, '').trim();
              const startIndex = cleanJson.indexOf('[');
              const endIndex = cleanJson.lastIndexOf(']');
              if (startIndex !== -1 && endIndex !== -1) {
                  const fixedNames = JSON.parse(cleanJson.substring(startIndex, endIndex + 1));
                  if (Array.isArray(fixedNames)) {
                      setItems(items.map((item, index) => ({ ...item, name: fixedNames[index] || item.name })));
                  }
              }
          }
      } catch (error) { alert("Lỗi khi chuẩn hóa."); } finally { setIsFixingNames(false); }
  };

  // --- HELPER FUNCTIONS ---
  const totalQty = items.reduce((sum, item) => sum + Number(item.qty), 0);
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleItemChange = (id, field, value) => {
    let newValue = value;
    if (field === 'qty' || field === 'price') newValue = Math.max(0, newValue);
    setItems(items.map(item => item.id === id ? { ...item, [field]: newValue } : item));
    if (field === 'price' || field === 'qty') setAmountInWords(''); 
  };

  const addItem = () => { setItems([...items, { id: Date.now(), name: '', unit: 'Cái', qty: 1, price: 0 }]); setAmountInWords(''); };
  const removeLastItem = () => { setItems(prev => prev.length <= 1 ? [{ id: Date.now(), name: '', unit: '', qty: 1, price: 0 }] : prev.slice(0, -1)); setAmountInWords(''); };
  const removeItem = (id) => { setItems(prev => prev.length === 1 ? [{ id: Date.now(), name: '', unit: '', qty: 1, price: 0 }] : prev.filter(i => i.id !== id)); setAmountInWords(''); };
  const resetData = () => { if(confirm("Xóa hết dữ liệu?")) { setItems([{ id: Date.now(), name: '', unit: '', qty: 1, price: 0 }]); setAmountInWords(''); }};

  const handleExport = (mode, action) => {
    if (isProcessing) return;
    setExportMode(mode);
    setIsProcessing(true);
    
    setTimeout(() => {
        const element = noteRef.current;
        const isA5 = paperSize === 'a5';
        const prefix = mode === 'full' ? 'HOADON' : 'PHIEU_GIAO_HANG';
        const opt = {
            margin: 5,
            filename: `${prefix}_${invoiceCode}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: isA5 ? 'a5' : 'a4', orientation: isA5 ? 'landscape' : 'portrait' }
        };

        const done = () => { setIsProcessing(false); setExportMode('full'); };

        if (action === 'print') {
            window.print();
            done();
        } else if (action === 'pdf') {
             // Sử dụng CDN thay vì import
             if (!window.html2pdf) {
                const script = document.createElement('script');
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
                script.onload = () => {
                    window.html2pdf().set(opt).from(element).save().then(done).catch(done);
                };
                document.body.appendChild(script);
            } else {
                window.html2pdf().set(opt).from(element).save().then(done).catch(done);
            }
        }
    }, 600); 
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 font-sans print:bg-white print:p-0">
      {/* --- MODAL IMPORT --- */}
      {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-purple-700"><Sparkles size={20} /> Nhập Nhanh</h3>
                      <button onClick={() => setShowImportModal(false)}><X size={20}/></button>
                  </div>
                  <textarea className="w-full border p-3 h-32 rounded focus:ring-2 focus:ring-purple-200 outline-none" placeholder='Ví dụ: "Lấy 5 chai thuốc sâu 150k"' value={importText} onChange={(e) => setImportText(e.target.value)}></textarea>
                  <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded">Hủy</button>
                      <button onClick={handleSmartImport} disabled={isAiLoading || !importText.trim()} className="px-4 py-2 bg-purple-600 text-white rounded flex items-center gap-2">{isAiLoading ? '...' : 'Phân tích'}</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- TOOLBAR --- */}
      <div className="w-full max-w-5xl bg-white p-4 rounded-lg shadow-md mb-6 print:hidden border sticky top-0 z-50 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2 items-center">
            <h2 className="font-bold text-gray-800 text-lg hidden sm:block mr-2">Hóa Đơn</h2>
            <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-sm font-bold"><Sparkles size={16}/> Nhập AI</button>
            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-bold"><Plus size={16}/> Thêm</button>
            <button onClick={removeLastItem} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-bold"><Minus size={16}/> Xóa</button>
            <div className="flex bg-gray-100 rounded p-1">
                <button onClick={() => setPaperSize('a5')} className={`px-2 py-1 text-xs rounded ${paperSize === 'a5' ? 'bg-white shadow font-bold text-blue-600' : 'text-gray-500'}`}>A5 Ngang</button>
                <button onClick={() => setPaperSize('a4')} className={`px-2 py-1 text-xs rounded ${paperSize === 'a4' ? 'bg-white shadow font-bold text-blue-600' : 'text-gray-500'}`}>A4 Dọc</button>
            </div>
            <button onClick={resetData} className="text-gray-500 p-2"><RefreshCw size={18}/></button>
        </div>
        <div className="flex gap-2">
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

      {/* --- PREVIEW --- */}
      <div className="w-full overflow-auto flex justify-center pb-20">
        <div ref={noteRef} className="bg-white p-8 shadow-2xl print:shadow-none transition-all duration-300 relative" style={{ width: '190mm', minHeight: paperSize === 'a5' ? '148mm' : '297mm' }}>
            {/* Header Bill */}
            <div className="flex justify-between border-b-2 border-gray-800 pb-4 mb-4">
                <div>
                    <h1 className="text-xl font-bold uppercase text-gray-800">Cửa Hàng Thành Đạt</h1>
                    <p className="text-sm text-gray-600">SĐT: 0357041668</p>
                    <p className="text-sm text-gray-600">ĐC: 125, DT685, Kiến Đức, Lâm Đồng</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase">{exportMode === 'full' ? 'HÓA ĐƠN' : 'PHIẾU KHO'}</h2>
                    <div className="text-sm mt-1">
                        <p>Số: <input value={invoiceCode} onChange={(e)=>setInvoiceCode(e.target.value)} className="font-bold text-red-600 w-20 text-right outline-none"/></p>
                        <p>Ngày: <input value={date} onChange={(e)=>setDate(e.target.value)} className="w-24 text-right outline-none"/></p>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="mb-6 space-y-2">
                <div className="flex"><span className="font-bold w-24 text-sm">Khách hàng:</span><input value={customer} onChange={(e)=>setCustomer(e.target.value)} className="flex-1 border-b border-dotted outline-none font-medium"/></div>
                <div className="flex relative">
                    <span className="font-bold w-24 text-sm">Ghi chú:</span>
                    <input value={note} onChange={(e)=>setNote(e.target.value)} className="flex-1 border-b border-dotted outline-none italic text-sm pr-8"/>
                    <button onClick={handleGenerateNote} disabled={isNoteLoading} className="absolute right-0 text-purple-500 print:hidden">{isNoteLoading ? <RefreshCw size={14} className="animate-spin"/> : <Sparkles size={14}/>}</button>
                </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-gray-800 mb-4 text-sm">
                <thead>
                    <tr className="bg-gray-200 text-xs font-bold uppercase group">
                        <th className="border p-2 w-10 text-center">STT</th>
                        <th className="border p-2 text-left relative">Tên sản phẩm 
                            <button onClick={handleFixProductNames} disabled={isFixingNames} className="absolute right-1 top-1 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"><Wand2 size={14}/></button>
                        </th>
                        <th className="border p-2 w-16 text-center">ĐVT</th>
                        <th className="border p-2 w-16 text-center">SL</th>
                        {exportMode === 'full' && <><th className="border p-2 w-24 text-right">Đơn giá</th><th className="border p-2 w-28 text-right">Thành tiền</th></>}
                        {exportMode === 'delivery' && <th className="border p-2 w-32 text-center">Thực nhận</th>}
                        <th className="border p-2 w-8 print:hidden"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-yellow-50">
                            <td className="border p-2 text-center">{idx + 1}</td>
                            <td className="border p-1"><input value={item.name} onChange={(e)=>handleItemChange(item.id, 'name', e.target.value)} className="w-full bg-transparent outline-none"/></td>
                            <td className="border p-1"><input value={item.unit} onChange={(e)=>handleItemChange(item.id, 'unit', e.target.value)} className="w-full bg-transparent text-center outline-none"/></td>
                            <td className="border p-1"><input type="number" value={item.qty} onChange={(e)=>handleItemChange(item.id, 'qty', e.target.value)} className="w-full bg-transparent text-center font-bold outline-none"/></td>
                            {exportMode === 'full' && <>
                                <td className="border p-1"><input type="number" value={item.price} onChange={(e)=>handleItemChange(item.id, 'price', e.target.value)} className="w-full bg-transparent text-right outline-none"/></td>
                                <td className="border p-2 text-right">{formatCurrency(item.qty * item.price)}</td>
                            </>}
                            {exportMode === 'delivery' && <td className="border p-2"></td>}
                            <td className="border p-1 text-center print:hidden"><button onClick={()=>removeItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button></td>
                        </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                        <td className="border p-2 text-center" colSpan={2}>TỔNG CỘNG</td>
                        <td className="border p-2"></td>
                        <td className="border p-2 text-center text-lg">{totalQty}</td>
                        {exportMode === 'full' && <><td className="border p-2"></td><td className="border p-2 text-right text-lg text-blue-800">{formatCurrency(totalPrice)}</td></>}
                        {exportMode === 'delivery' && <td className="border p-2"></td>}
                        <td className="border p-2 print:hidden"></td>
                    </tr>
                </tbody>
            </table>

            {/* Words */}
            {exportMode === 'full' && (
                <div className="mb-4 text-sm italic flex gap-2 items-center border-b pb-2">
                    <span className="font-bold not-italic">Bằng chữ:</span>
                    <span className="flex-1">{amountInWords || '...................................................'}</span>
                    <button onClick={handleNumberToWords} disabled={isWordsLoading || totalPrice === 0} className="text-purple-600 bg-purple-50 border px-2 py-0.5 rounded text-xs font-bold print:hidden flex gap-1 items-center">{isWordsLoading ? '...' : <><Sparkles size={10}/> AI</>}</button>
                </div>
            )}

            {/* Footer */}
            <div className="grid grid-cols-3 gap-4 text-center mt-8 text-xs uppercase font-bold">
                <div><p>Người Lập</p><p className="italic font-normal text-gray-400 mt-10">(Ký tên)</p></div>
                <div><p>Giao Hàng</p><p className="italic font-normal text-gray-400 mt-10">(Ký tên)</p></div>
                <div><p>{exportMode === 'full' ? 'Khách Hàng' : 'Nhận Hàng'}</p><p className="italic font-normal text-gray-400 mt-10">(Ký tên)</p></div>
            </div>
        </div>
      </div>
    </div>
  );
}