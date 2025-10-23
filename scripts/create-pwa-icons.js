#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * این اسکریپت آیکون‌های مختلف اندازه برای PWA ایجاد می‌کند
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// اندازه‌های مورد نیاز برای PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// آیکون‌های shortcut
const shortcutIcons = [
  { name: 'shortcut-services.png', size: 96 },
  { name: 'shortcut-blog.png', size: 96 },
  { name: 'shortcut-contact.png', size: 96 }
];

// آیکون‌های action
const actionIcons = [
  { name: 'action-view.png', size: 24 },
  { name: 'action-close.png', size: 24 }
];

// Screenshots
const screenshots = [
  { name: 'desktop-screenshot.png', width: 1280, height: 720 },
  { name: 'mobile-screenshot.png', width: 375, height: 667 }
];

// SVG template برای آیکون اصلی
const createMainIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007bff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="url(#bg)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Gear Icon -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Main gear body -->
    <circle cx="0" cy="0" r="${size * 0.15}" fill="#ffffff" opacity="0.9"/>
    
    <!-- Gear teeth -->
    <g fill="#ffffff" opacity="0.8">
      <!-- Top teeth -->
      <rect x="-${size * 0.02}" y="-${size * 0.25}" width="${size * 0.04}" height="${size * 0.08}" rx="${size * 0.01}"/>
      <rect x="-${size * 0.02}" y="${size * 0.17}" width="${size * 0.04}" height="${size * 0.08}" rx="${size * 0.01}"/>
      
      <!-- Side teeth -->
      <rect x="-${size * 0.25}" y="-${size * 0.02}" width="${size * 0.08}" height="${size * 0.04}" rx="${size * 0.01}"/>
      <rect x="${size * 0.17}" y="-${size * 0.02}" width="${size * 0.08}" height="${size * 0.04}" rx="${size * 0.01}"/>
      
      <!-- Diagonal teeth -->
      <rect x="-${size * 0.18}" y="-${size * 0.18}" width="${size * 0.06}" height="${size * 0.03}" rx="${size * 0.01}" transform="rotate(-45)"/>
      <rect x="${size * 0.12}" y="${size * 0.12}" width="${size * 0.06}" height="${size * 0.03}" rx="${size * 0.01}" transform="rotate(-45)"/>
      <rect x="${size * 0.18}" y="-${size * 0.18}" width="${size * 0.06}" height="${size * 0.03}" rx="${size * 0.01}" transform="rotate(45)"/>
      <rect x="-${size * 0.12}" y="${size * 0.12}" width="${size * 0.06}" height="${size * 0.03}" rx="${size * 0.01}" transform="rotate(45)"/>
    </g>
    
    <!-- Center hole -->
    <circle cx="0" cy="0" r="${size * 0.06}" fill="#007bff"/>
  </g>
  
  <!-- Text -->
  <text x="${size/2}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold" text-anchor="middle" fill="#ffffff">سایدا</text>
</svg>
`;

// SVG template برای آیکون shortcut
const createShortcutSVG = (size, type) => {
  const icons = {
    services: `
      <g transform="translate(${size/2}, ${size/2})">
        <circle cx="0" cy="0" r="${size * 0.2}" fill="#007bff" opacity="0.9"/>
        <rect x="-${size * 0.08}" y="-${size * 0.08}" width="${size * 0.16}" height="${size * 0.16}" fill="#ffffff" rx="${size * 0.02}"/>
        <rect x="-${size * 0.06}" y="-${size * 0.06}" width="${size * 0.12}" height="${size * 0.12}" fill="#007bff" rx="${size * 0.01}"/>
      </g>
    `,
    blog: `
      <g transform="translate(${size/2}, ${size/2})">
        <circle cx="0" cy="0" r="${size * 0.2}" fill="#28a745" opacity="0.9"/>
        <rect x="-${size * 0.12}" y="-${size * 0.08}" width="${size * 0.24}" height="${size * 0.16}" fill="#ffffff" rx="${size * 0.02}"/>
        <rect x="-${size * 0.1}" y="-${size * 0.06}" width="${size * 0.2}" height="${size * 0.12}" fill="#28a745" rx="${size * 0.01}"/>
        <line x1="-${size * 0.06}" y1="-${size * 0.02}" x2="${size * 0.06}" y2="-${size * 0.02}" stroke="#ffffff" stroke-width="${size * 0.01}"/>
        <line x1="-${size * 0.06}" y1="0" x2="${size * 0.06}" y2="0" stroke="#ffffff" stroke-width="${size * 0.01}"/>
        <line x1="-${size * 0.06}" y1="${size * 0.02}" x2="${size * 0.06}" y2="${size * 0.02}" stroke="#ffffff" stroke-width="${size * 0.01}"/>
      </g>
    `,
    contact: `
      <g transform="translate(${size/2}, ${size/2})">
        <circle cx="0" cy="0" r="${size * 0.2}" fill="#dc3545" opacity="0.9"/>
        <circle cx="0" cy="-${size * 0.05}" r="${size * 0.08}" fill="#ffffff"/>
        <path d="M-${size * 0.12},${size * 0.05} Q0,${size * 0.15} ${size * 0.12},${size * 0.05}" stroke="#ffffff" stroke-width="${size * 0.02}" fill="none"/>
      </g>
    `
  };
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="url(#bg-${type})" rx="${size * 0.1}"/>
      
      ${icons[type]}
    </svg>
  `;
};

// SVG template برای screenshot
const createScreenshotSVG = (width, height, type) => {
  const isMobile = type === 'mobile';
  const headerHeight = isMobile ? height * 0.15 : height * 0.12;
  const contentHeight = height - headerHeight;
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-screenshot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#007bff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg-screenshot)" rx="${isMobile ? 8 : 12}"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="${width}" height="${headerHeight}" fill="url(#header-gradient)" rx="${isMobile ? 8 : 12}"/>
      
      <!-- Logo in header -->
      <circle cx="${isMobile ? 30 : 50}" cy="${headerHeight/2}" r="${isMobile ? 12 : 20}" fill="#ffffff" opacity="0.9"/>
      <circle cx="${isMobile ? 30 : 50}" cy="${headerHeight/2}" r="${isMobile ? 8 : 12}" fill="#007bff"/>
      
      <!-- Title -->
      <text x="${isMobile ? 50 : 80}" y="${headerHeight/2 + (isMobile ? 4 : 6)}" font-family="Arial, sans-serif" font-size="${isMobile ? 12 : 18}" font-weight="bold" fill="#ffffff">
        پلتفرم مهندسی سایدا
      </text>
      
      <!-- Content area -->
      <rect x="${isMobile ? 10 : 20}" y="${headerHeight + 10}" width="${width - (isMobile ? 20 : 40)}" height="${contentHeight - 20}" fill="#ffffff" rx="${isMobile ? 4 : 8}" opacity="0.9"/>
      
      <!-- Content elements -->
      ${isMobile ? `
        <!-- Mobile content -->
        <rect x="${width/2 - 30}" y="${headerHeight + 30}" width="60" height="40" fill="#007bff" opacity="0.1" rx="4"/>
        <text x="${width/2}" y="${headerHeight + 55}" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#007bff">خدمات</text>
        
        <rect x="${width/2 - 30}" y="${headerHeight + 80}" width="60" height="40" fill="#28a745" opacity="0.1" rx="4"/>
        <text x="${width/2}" y="${headerHeight + 105}" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#28a745">مقالات</text>
        
        <rect x="${width/2 - 30}" y="${headerHeight + 130}" width="60" height="40" fill="#dc3545" opacity="0.1" rx="4"/>
        <text x="${width/2}" y="${headerHeight + 155}" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#dc3545">تماس</text>
      ` : `
        <!-- Desktop content -->
        <rect x="40" y="${headerHeight + 30}" width="200" height="120" fill="#007bff" opacity="0.1" rx="8"/>
        <text x="140" y="${headerHeight + 100}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#007bff">خدمات تخصصی مهندسی</text>
        
        <rect x="260" y="${headerHeight + 30}" width="200" height="120" fill="#28a745" opacity="0.1" rx="8"/>
        <text x="360" y="${headerHeight + 100}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#28a745">مقالات و منابع علمی</text>
        
        <rect x="480" y="${headerHeight + 30}" width="200" height="120" fill="#dc3545" opacity="0.1" rx="8"/>
        <text x="580" y="${headerHeight + 100}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#dc3545">تماس با ما</text>
      `}
      
      <!-- Footer -->
      <rect x="${isMobile ? 10 : 20}" y="${height - 30}" width="${width - (isMobile ? 20 : 40)}" height="20" fill="#6c757d" opacity="0.1" rx="${isMobile ? 4 : 8}"/>
      <text x="${width/2}" y="${height - 15}" font-family="Arial, sans-serif" font-size="${isMobile ? 8 : 12}" text-anchor="middle" fill="#6c757d">saydatech.ir</text>
    </svg>
  `;
};

// SVG template برای آیکون action
const createActionSVG = (size, type) => {
  const icons = {
    view: `
      <g transform="translate(${size/2}, ${size/2})">
        <circle cx="0" cy="0" r="${size * 0.4}" fill="#007bff" opacity="0.9"/>
        <path d="M-${size * 0.15},-${size * 0.15} L${size * 0.15},-${size * 0.15} L${size * 0.15},${size * 0.15} L-${size * 0.15},${size * 0.15} Z" fill="#ffffff"/>
        <circle cx="0" cy="0" r="${size * 0.05}" fill="#007bff"/>
      </g>
    `,
    close: `
      <g transform="translate(${size/2}, ${size/2})">
        <circle cx="0" cy="0" r="${size * 0.4}" fill="#dc3545" opacity="0.9"/>
        <path d="M-${size * 0.1},-${size * 0.1} L${size * 0.1},${size * 0.1} M${size * 0.1},-${size * 0.1} L-${size * 0.1},${size * 0.1}" stroke="#ffffff" stroke-width="${size * 0.03}" stroke-linecap="round"/>
      </g>
    `
  };
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${icons[type]}
    </svg>
  `;
};

// تابع برای ایجاد فایل‌های آیکون
const createIconFiles = () => {
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  // ایجاد پوشه icons اگر وجود ندارد
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  console.log('🎨 Creating PWA icons...');
  
  // ایجاد آیکون‌های اصلی
  iconSizes.forEach(({ size, name }) => {
    const svgContent = createMainIconSVG(size);
    const filePath = path.join(iconsDir, name);
    fs.writeFileSync(filePath, svgContent);
    console.log(`✅ Created ${name} (${size}x${size})`);
  });
  
  // ایجاد آیکون‌های shortcut
  shortcutIcons.forEach(({ name, size }) => {
    const type = name.replace('shortcut-', '').replace('.png', '');
    const svgContent = createShortcutSVG(size, type);
    const filePath = path.join(iconsDir, name);
    fs.writeFileSync(filePath, svgContent);
    console.log(`✅ Created ${name} (${size}x${size})`);
  });
  
  // ایجاد آیکون‌های action
  actionIcons.forEach(({ name, size }) => {
    const type = name.replace('action-', '').replace('.png', '');
    const svgContent = createActionSVG(size, type);
    const filePath = path.join(iconsDir, name);
    fs.writeFileSync(filePath, svgContent);
    console.log(`✅ Created ${name} (${size}x${size})`);
  });
  
  // ایجاد screenshots
  const screenshotsDir = path.join(__dirname, 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  screenshots.forEach(({ name, width, height }) => {
    const type = name.includes('mobile') ? 'mobile' : 'desktop';
    const svgContent = createScreenshotSVG(width, height, type);
    const filePath = path.join(screenshotsDir, name);
    fs.writeFileSync(filePath, svgContent);
    console.log(`✅ Created ${name} (${width}x${height})`);
  });
  
  console.log('🎉 All PWA icons and screenshots created successfully!');
  console.log(`📁 Icons saved in: ${iconsDir}`);
  console.log(`📁 Screenshots saved in: ${screenshotsDir}`);
};

// اجرای اسکریپت
createIconFiles();

export { createIconFiles };
