import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface VersionInfo {
  version: string;
  buildTime: string;
}

const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

const VersionChecker: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);

  const checkForUpdate = async (isInitial = false) => {
    try {
      // Append timestamp to prevent caching of the version file itself
      const response = await fetch(`/version.json?t=${new Date().getTime()}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) return;
      
      const newVersionInfo: VersionInfo = await response.json();
      
      if (isInitial) {
        setCurrentVersion(newVersionInfo);
      } else if (currentVersion) {
        if (
          newVersionInfo.version !== currentVersion.version || 
          newVersionInfo.buildTime !== currentVersion.buildTime
        ) {
          toast.info("نسخه جدید در دسترس است", {
            description: "برای دریافت آخرین تغییرات لطفا صفحه را رفرش کنید",
            action: {
              label: "رفرش",
              onClick: () => window.location.reload(),
            },
            duration: Infinity, // Stay until clicked
          });
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  useEffect(() => {
    // Initial check
    checkForUpdate(true);

    // Interval check
    const intervalId = setInterval(() => checkForUpdate(), CHECK_INTERVAL);

    // Check on focus
    const handleFocus = () => checkForUpdate();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentVersion]); // Re-run when currentVersion changes to ensure we compare against latest

  return null;
};

export default VersionChecker;
