import { useState, useRef, useEffect } from 'react';

export default function ValidationModal({
  isOpen,
  title,
  question,
  correctAnswer,
  onSuccess,
  onCancel,
  onError,
}) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (input.trim() === correctAnswer) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      onError?.();
      setTimeout(() => setError(false), 600);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-strong rounded-3xl p-6 max-w-sm w-full animate-bounce-in shadow-2xl border-white/20">
        <h3 className="text-white text-lg font-bold mb-1 text-center">{title}</h3>
        <p className="text-white/50 text-sm mb-4 text-center">{question}</p>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="请输入答案..."
            className={`w-full px-4 py-3 rounded-xl bg-white/10 border text-white text-center text-base outline-none transition-all duration-300 placeholder:text-white/30 ${
              error
                ? 'border-red-400 animate-shake bg-red-500/10'
                : 'border-white/15 focus:border-white/40 focus:bg-white/15'
            }`}
          />
          {error && (
            <p className="text-red-300 text-xs mt-1.5 text-center animate-fade-in">
              ✗ 答案错误，请重试
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-all duration-200 border border-white/10"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-sm font-bold transition-all duration-200 active:scale-95"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
