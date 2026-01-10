# Smart Invoice Maker AI

_Ứng dụng tạo hóa đơn và quản lý bán hàng thông minh, tích hợp Google Gemini AI để tự động hóa quy trình nhập liệu, chăm sóc khách hàng và tối ưu vận hành cho các cửa hàng bán lẻ đa ngành hàng._

# Live Demo: https://hoadon.nguyenanvinh.id.vn

# Tính Năng Nổi Bật

## Sức mạnh AI (Powered by Gemini 1.5 Flash)

_Ứng dụng sử dụng LLM để thực hiện các tác vụ phức tạp:_

### Trích xuất đơn hàng thông minh: Tự động bóc tách thông tin khách hàng, sản phẩm, giá tiền từ đoạn tin nhắn văn bản hoặc hình ảnh (đơn viết tay/screenshot).

### Tư vấn bán hàng: Phân tích đơn hàng để gợi ý chiến lược Upsell/Cross-sell, phân tích chân dung khách hàng.

### Sáng tạo nội dung: Tự động viết mô tả sản phẩm, bài đăng Facebook/Zalo khoe đơn, làm thơ tặng khách.

### Hỗ trợ vận hành: Đánh giá rủi ro bom hàng, hướng dẫn đóng gói an toàn, tạo nội dung tem dán vận chuyển.

### Chăm sóc khách hàng: Soạn kịch bản gọi điện, tin nhắn nhắc nợ khéo léo, email báo giá chuyên nghiệp.

### Dịch thuật & Chuẩn hóa: Dịch hóa đơn sang tiếng Anh, chuẩn hóa địa chỉ hành chính, sửa lỗi chính tả tên sản phẩm.

## Quản lý Đa Ngành Hàng (Multi-Store Modes)

### Hỗ trợ chuyển đổi nhanh giao diện và ngữ cảnh AI cho 4 mô hình kinh doanh:
- Thuốc Bảo Vệ Thực Vật (Mặc định)
- Tạp Hóa & Gia Dụng
- Thú Y & Thức Ăn Chăn Nuôi
- Dịch Vụ Cưới & Mâm Quả

### Tiện ích Hóa Đơn
- Tự động đọc số tiền thành chữ.
- Tính toán tổng tiền tự động.
- Xuất file PDF chuẩn khổ A4/A5.
- Hỗ trợ in trực tiếp hoặc chia sẻ nhanh qua Zalo (Mobile).
- Tùy chỉnh thông tin cửa hàng, logo, slogan.

## Công Nghệ Sử Dụng (Tech Stack)
- Frontend: React (Vite)
- Styling: Tailwind CSS (Responsive Design)
- Icons: Lucide React
- AI Integration: Google Generative AI SDK (Gemini 1.5 Flash)
- PDF Generation: html2pdf.js
- Deployment: Vercel (CI/CD Automated)

## Cài Đặt & Chạy Local

Để chạy dự án này trên máy tính của bạn:

### Clone repository:
```
git clone https://github.com/navinh2k4/invoice-app.git

cd invoice-app
```

### Cài đặt dependencies:
```
npm install
```

### Cấu hình biến môi trường:
Tạo file .env tại thư mục gốc và thêm API Key Gemini của bạn:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Chạy dự án:
```
npm run dev
```

Truy cập http://localhost:5173 để xem kết quả.

## Quy Trình Deploy (CI/CD)

Dự án được thiết lập quy trình triển khai tự động:

Code được push lên nhánh main trên GitHub.

Vercel tự động trigger build.

Nếu build thành công, phiên bản mới sẽ được live tại production domain.

### Cấu hình Vercel:

Framework Preset: Vite

Environment Variables: Cần add VITE_GEMINI_API_KEY vào phần Settings của dự án trên Vercel.

## Screenshots

(Bạn có thể thêm ảnh chụp màn hình ứng dụng tại đây để README sinh động hơn)

## Đóng Góp

Mọi ý kiến đóng góp hoặc báo lỗi vui lòng tạo Issue hoặc gửi Pull Request.

Phát triển bởi navinh2k4 Infra Intern