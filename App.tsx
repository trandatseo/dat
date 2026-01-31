
import React, { useState, useCallback, useRef } from 'react';
import { AppStatus, PaintResult } from './types';
import { processPaintColor } from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMime, setOriginalMime] = useState<string>('');
  const [colorPrompt, setColorPrompt] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [results, setResults] = useState<PaintResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setOriginalMime(file.type);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!originalImage || !colorPrompt) {
      setErrorMsg("Vui lòng tải ảnh và nhập mô tả màu sắc.");
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setErrorMsg(null);

    try {
      const resultUrl = await processPaintColor(originalImage, originalMime, colorPrompt);
      
      const newResult: PaintResult = {
        id: Date.now().toString(),
        originalUrl: originalImage,
        resultUrl: resultUrl,
        colorPrompt: colorPrompt,
        timestamp: Date.now(),
      };

      setResults(prev => [newResult, ...prev]);
      setStatus(AppStatus.IDLE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalMime('');
    setColorPrompt('');
    setStatus(AppStatus.IDLE);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">PaintVisualizer <span className="text-indigo-600">AI</span></h1>
          </div>
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Làm mới
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Phối Màu Sơn Nhà Trong Tích Tắc</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Công nghệ AI tiên tiến giúp bạn thay đổi diện mạo ngôi nhà chỉ với một bức ảnh. Tải ảnh lên và bắt đầu sáng tạo ngay.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Input Controls */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">1. Tải ảnh không gian của bạn</label>
              
              {!originalImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                >
                  <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-600">Nhấn để chọn ảnh hoặc kéo thả</span>
                  <p className="text-xs text-slate-400 mt-2">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                </div>
              ) : (
                <div className="relative group">
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-64 object-cover rounded-xl border border-slate-200"
                  />
                  <button 
                    onClick={() => setOriginalImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">2. Bạn muốn phối màu gì?</label>
              <textarea 
                value={colorPrompt}
                onChange={(e) => setColorPrompt(e.target.value)}
                placeholder="Ví dụ: Phối màu xanh dương pastel cho bức tường chính, hoặc màu kem sữa cho toàn bộ phòng khách..."
                className="w-full p-4 border border-slate-200 rounded-xl min-h-[120px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700 resize-none transition-all"
              />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {['Màu xám tối hiện đại', 'Xanh Sage thư giãn', 'Kem ấm áp', 'Trắng tinh khôi'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setColorPrompt(tag)}
                    className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={status === AppStatus.PROCESSING || !originalImage || !colorPrompt}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                status === AppStatus.PROCESSING || !originalImage || !colorPrompt
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {status === AppStatus.PROCESSING ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý phối màu...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.285a2 2 0 01-1.96 0l-.628-.285a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-.311.222a2 2 0 00-.762 2.106l1.233 4.52a2 2 0 001.937 1.47h11.74a2 2 0 001.937-1.47l1.233-4.52a2 2 0 00-.762-2.106l-.311-.222z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8v4.172a2 2 0 00.586 1.414l2.828 2.828A2 2 0 007.828 17h8.344a2 2 0 001.414-.586l2.828-2.828A2 2 0 0021 12.172V8m-18 0V5a2 2 0 012-2h14a2 2 0 012 2v3m-18 0h18" />
                  </svg>
                  Bắt đầu phối màu ngay
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right: Results / Info */}
          <div className="space-y-6">
            <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-4">Mẹo chọn màu từ chuyên gia</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <p className="text-indigo-100 text-sm italic">"Hãy thử sử dụng tông màu lạnh cho phòng ngủ để tạo cảm giác thư thái, dễ ngủ hơn."</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <p className="text-indigo-100 text-sm italic">"Màu trắng hoặc kem sáng giúp các căn hộ nhỏ trông rộng rãi và thoáng đãng hơn hẳn."</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <p className="text-indigo-100 text-sm italic">"Đừng quên nguyên tắc 60-30-10: 60% màu chủ đạo, 30% màu bổ trợ và 10% màu nhấn."</p>
                </li>
              </ul>
            </div>

            {results.length === 0 && (
              <div className="border border-slate-200 bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">Kết quả phối màu sẽ xuất hiện ở đây</p>
              </div>
            )}
          </div>
        </div>

        {/* History / Gallery Section */}
        {results.length > 0 && (
          <section className="mt-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 border-b border-slate-200 pb-4">Kết quả đã thực hiện</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
              {results.map((res) => (
                <div key={res.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 group">
                  <div className="grid grid-cols-2 h-64 sm:h-80">
                    <div className="relative">
                      <img src={res.originalUrl} alt="Original" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Gốc</div>
                    </div>
                    <div className="relative border-l-2 border-white">
                      <img src={res.resultUrl} alt="Result" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-lg">Mới</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">YÊU CẦU:</span>
                        <p className="text-slate-700 font-medium leading-tight">{res.colorPrompt}</p>
                      </div>
                      <a 
                        href={res.resultUrl} 
                        download={`paint-result-${res.id}.png`}
                        className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl hover:bg-indigo-100 transition-colors flex-shrink-0"
                        title="Tải xuống"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-400">{new Date(res.timestamp).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Actions (Mobile) */}
      {status === AppStatus.PROCESSING && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
          <div className="flex items-center justify-center gap-3">
             <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-semibold text-slate-700">Đang tạo phối màu mới...</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-2">© 2024 PaintVisualizer AI. Powered by Gemini Pro.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-xs text-slate-400 hover:text-indigo-600">Điều khoản sử dụng</a>
            <a href="#" className="text-xs text-slate-400 hover:text-indigo-600">Chính sách bảo mật</a>
            <a href="#" className="text-xs text-slate-400 hover:text-indigo-600">Hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
