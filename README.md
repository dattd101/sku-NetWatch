# NetWatch — Next.js 15 / Vercel

Web đo tốc độ mạng từ trình duyệt: Download, Upload, Ping, Jitter; tự động đo mỗi 10 phút khi tab còn hoạt động; lịch sử trong phiên và tải Excel.

## Cài đặt

Node.js 20.9+ (khuyến nghị Node.js 22 LTS):

```bash
npm install
npm run dev
npm run build
```

## Deploy GitHub → Vercel

1. Push **nội dung thư mục NetWatch-Vercel** lên root của GitHub repository (hoặc chọn Root Directory tương ứng trên Vercel).
2. Import repository vào Vercel, chọn **Framework Preset: Next.js**.
3. **Output Directory: Default / để trống**. Không nhập `public` hay `.next`.
4. Build Command: `npm run build` (hoặc Default); Install Command: `npm install` (hoặc Default).
5. Deploy. Nếu dự án Vercel cũ có Output Directory = `public`, **phải xóa override trong Project Settings → Build and Deployment → Build Settings**, rồi redeploy. File `vercel.json` không thể tự xóa setting đã lưu trên dashboard.

`vercel.json` xác định framework Next.js, không chỉ định outputDirectory. Next.js dùng output build do adapter Vercel quản lý.

## Lưu ý

Tự động đo chỉ chạy khi tab còn mở và browser cho phép chạy timer. Excel tạo ngay trong trình duyệt bằng `xlsx`; không dùng database, Python hay exe.
