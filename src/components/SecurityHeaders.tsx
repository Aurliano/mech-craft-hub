import React, { useEffect } from 'react';

interface SecurityHeadersProps {
  children: React.ReactNode;
}

const SecurityHeaders: React.FC<SecurityHeadersProps> = ({ children }) => {
  useEffect(() => {
    // Set security headers via meta tags
    const setSecurityMetaTags = () => {
      // Note: CSP and X-Frame-Options should be set via HTTP headers, not meta tags
      // These are set by the backend SecurityHeadersMiddleware
      // We only set meta tags for client-side headers that are allowed in meta tags

      // X-Content-Type-Options
      let contentTypeMeta = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
      if (!contentTypeMeta) {
        contentTypeMeta = document.createElement('meta');
        contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
        document.head.appendChild(contentTypeMeta);
      }
      contentTypeMeta.setAttribute('content', 'nosniff');

      // X-XSS-Protection
      let xssMeta = document.querySelector('meta[http-equiv="X-XSS-Protection"]');
      if (!xssMeta) {
        xssMeta = document.createElement('meta');
        xssMeta.setAttribute('http-equiv', 'X-XSS-Protection');
        document.head.appendChild(xssMeta);
      }
      xssMeta.setAttribute('content', '1; mode=block');

      // Referrer Policy
      let referrerMeta = document.querySelector('meta[name="referrer"]');
      if (!referrerMeta) {
        referrerMeta = document.createElement('meta');
        referrerMeta.setAttribute('name', 'referrer');
        document.head.appendChild(referrerMeta);
      }
      referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');

      // Permissions Policy
      let permissionsMeta = document.querySelector('meta[http-equiv="Permissions-Policy"]');
      if (!permissionsMeta) {
        permissionsMeta = document.createElement('meta');
        permissionsMeta.setAttribute('http-equiv', 'Permissions-Policy');
        document.head.appendChild(permissionsMeta);
      }
      permissionsMeta.setAttribute('content',
        "geolocation=(), " +
        "microphone=(), " +
        "camera=(), " +
        "payment=(), " +
        "usb=(), " +
        "magnetometer=(), " +
        "gyroscope=(), " +
        "speaker=(), " +
        "vibrate=(), " +
        "fullscreen=(self), " +
        "sync-xhr=()"
      );
    };

    setSecurityMetaTags();

    // Disable right-click context menu in production
    const disableContextMenu = (e: MouseEvent) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+U in production
    const disableDevTools = (e: KeyboardEvent) => {
      if (import.meta.env.PROD) {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault();
        }
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', disableContextMenu);
    document.addEventListener('keydown', disableDevTools);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', disableDevTools);
    };
  }, []);

  return <>{children}</>;
};

export default SecurityHeaders;
