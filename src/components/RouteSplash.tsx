import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Lightweight overlay shown briefly on route changes
const RouteSplash = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show overlay on every route change
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 700); // ~0.7s
    return () => clearTimeout(t);
  }, [location.key]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[900] pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/70 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default RouteSplash;


