Hướng Dẫn Deploy App Hóa Đơn Lên Vercel

Dưới đây là các bước chi tiết để bạn đưa ứng dụng này từ code máy lên internet.

Bước 1: Chuẩn bị Source Code ở Local

Tạo một thư mục mới trên máy tính của bạn (ví dụ: invoice-app), sau đó tạo các file sau bên trong thư mục đó.

1.1 package.json

Tạo file package.json với nội dung sau để khai báo các thư viện cần thiết.

{
  "name": "invoice-maker-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.300.0",
    "html2pdf.js": "^0.10.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0"
  }
}


1.2 vite.config.js

Cấu hình công cụ build Vite.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
})


1.3 Cấu hình Tailwind CSS

Bạn cần tạo 2 file để Tailwind hoạt động.

File tailwind.config.js:

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


File postcss.config.js:

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}


1.4 index.html (Nằm ở thư mục gốc)

<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Công Cụ Tạo Hóa Đơn - Thành Đạt</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>


1.5 Thư mục src

Tạo thư mục tên là src. Bên trong tạo 3 file:

File src/index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;


File src/main.jsx:

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


File src/App.jsx:
Copy toàn bộ nội dung code React (file App.jsx) mà tôi đã cung cấp ở trên và dán vào đây.

Bước 2: Cài đặt và Chạy thử

Mở Terminal (Command Prompt) tại thư mục dự án:

Chạy lệnh npm install để tải thư viện.

Chạy lệnh npm run dev để chạy thử dưới local.

Bước 3: Đẩy lên GitHub

Tạo một Repository mới trên GitHub (chế độ Public).

Ở thư mục dự án, chạy các lệnh:

git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin [https://github.com/](https://github.com/)<tên-user-của-bạn>/<tên-repo>.git
git push -u origin main


(Lưu ý: Nhớ tạo file .gitignore và thêm node_modules vào đó để không upload thư mục nặng này lên).

Bước 4: Deploy lên Vercel

Truy cập vercel.com và đăng nhập bằng GitHub.

Bấm nút "Add New..." -> "Project".

Chọn Repo GitHub bạn vừa tạo.

Ở mục Environment Variables (Quan trọng để AI hoạt động):

Key: VITE_GEMINI_API_KEY

Value: AIzaSy... (Điền API Key Gemini của bạn vào đây).

Bấm Deploy.

Sau khoảng 1 phút, Vercel sẽ cung cấp cho bạn một đường link (ví dụ: invoice-app.vercel.app). Bạn có thể gửi link này cho mọi người sử dụng!