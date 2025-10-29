import { useEffect, useState } from 'react';

const SplashIntro = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide after short delay or when app becomes interactive
    const timer = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div className="flex flex-col items-center gap-4 select-none">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/80" />
          </div>
          <div className="absolute -inset-2 animate-[ping_1.5s_ease-in-out_infinite] rounded-3xl bg-white/10" />
        </div>
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">پلتفرم مهندسی سایدا</h1>
          <p className="text-white/80 text-sm mt-1">در حال بارگذاری...</p>
        </div>
        <div className="w-40 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-white/90 rounded-full animate-[slide_1.2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default SplashIntro;


