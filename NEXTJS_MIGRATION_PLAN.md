# 🚀 Next.js Migration & IT-Tools Integration Plan

This plan outlines the steps to migrate the existing React/Vite project to Next.js (App Router) and integrate comprehensive tools inspired by IT-Tools.tech.

## 1. Project Restructuring (Next.js App Router)

The project will move from `src/App.tsx` (SPA) to Next.js App Router structure:

*   **`src/app/layout.tsx`**: Root layout with `ThemeContext` provider, Sidebar, and global styles.
*   **`src/app/page.tsx`**: Dashboard / Landing page.
*   **`src/app/[tool]/page.tsx`**: Dynamic route for individual tools (SEO friendly).
*   **`src/components/*`**: All existing components will be moved here and adapted to be Client Components (`'use client'`).

## 2. Feature Roadmap (Existing + IT-Tools Integration)

We will combine existing "Gravity Utils" features with "IT-Tools" inspired additions:

### 🔹 Category: Converter (Dönüştürücüler)
*   [x] **JSON <> YAML** (Existing)
*   [ ] **JSON <> XML** (New - IT-Tools)
*   [ ] **JSON <> TOML** (New - IT-Tools)
*   [x] **Base64 String Encoder/Decoder** (Existing)
*   [x] **Base64 File Converter** (Existing)
*   [ ] **Date/Time Converter** (New - IT-Tools: Epoch, ISO8601, RFC2822)
*   [ ] **Color Converter** (New - IT-Tools: HEX, RGB, HSL, CMYK)
*   [x] **Unit Converter** (Existing)
*   [x] **Case Converter** (Existing)

### 🔹 Category: Web & URL
*   [x] **URL Encoder/Decoder** (Existing)
*   [ ] **HTML Entity Encoder/Decoder** (New - IT-Tools)
*   [ ] **User Agent Parser** (New - IT-Tools)
*   [ ] **HTTP Status Codes** (New - IT-Tools: Reference list)
*   [x] **JWT Debugger** (Existing)
*   [x] **Favicon Generator** (Existing)
*   [x] **Social Media Resizer** (Existing)

### 🔹 Category: Development (Geliştirici)
*   [x] **JSON Formatter/Minifier** (Existing)
*   [ ] **SQL Formatter** (New - IT-Tools)
*   [ ] **XML Formatter** (New - IT-Tools)
*   [ ] **Docker Run to Compose** (New - IT-Tools)
*   [ ] **Crontab Generator** (New - IT-Tools)
*   [ ] **Chmod Calculator** (New - IT-Tools)
*   [x] **Uuid Generator** (Existing - V1, V4)
*   [ ] **Lorem Ipsum Generator** (New - IT-Tools)
*   [ ] **Diff Viewer** (New - IT-Tools: Compare two texts)

### 🔹 Category: Images & Media
*   [x] **Image Compressor/Optimizer** (Existing)
*   [x] **QR Code Generator/Scanner** (Existing)
*   [x] **Exif Cleaner** (Existing)
*   [ ] **SVG Placeholder Generator** (New - IT-Tools)
*   [x] **PDF Tools** (Existing: Merge, Split, Compress, Watermark)
*   [x] **Office Tools** (Existing: Word/Excel/PPT <> PDF)

### 🔹 Category: Crypto & Security
*   [x] **Hash Generator** (Existing: MD5, SHA1, SHA256, SHA512)
*   [ ] **HMAC Generator** (New - IT-Tools)
*   [ ] **Bcrypt Generator** (New - IT-Tools)
*   [x] **File Encryptor/Decryptor** (Existing: AES-GCM)
*   [ ] **Password Generator** (New - IT-Tools)
*   [ ] **RSA Key Generator** (New - IT-Tools)

## 3. Migration Steps

1.  **Dependencies:** Remove `vite`, `@vitejs/*`. Install `next`, `react`, `react-dom`, `eslint-config-next`.
2.  **Config:** Create `next.config.js`, update `tsconfig.json`, `tailwind.config.ts`.
3.  **Refactoring:**
    *   Move `index.css` to `src/app/globals.css`.
    *   Create `src/app/layout.tsx`.
    *   Refactor `App.tsx` routing logic to Next.js dynamic routes `[tool]/page.tsx`.
4.  **Implementation:** Build missing IT-Tools features.
5.  **Optimization:** Ensure all tools are SEO-ready with specific metadata.

## 4. Technical Requirements

*   **Framework:** Next.js 14+ (App Router)
*   **Styling:** Tailwind CSS + Shadcn/UI (Concept)
*   **Icons:** Lucide React
*   **Deployment:** Vercel / Netlify / Docker compatible.
