# NetWatch — Next.js 15 / Vercel

Bản web thuần Next.js 15 + TypeScript, triển khai từ GitHub lên Vercel.

## Chức năng
- Nút **Đo tốc độ ngay** đo ping, jitter, download, upload từ trình duyệt tới Cloudflare.
- Kết quả cập nhật ngay sau phép đo, lịch sử trong bộ nhớ tab (tối đa 20 lượt).
- Không Python, không SQLite/database, không Excel, không EXE, không native npm addon.

## Chạy local
Yêu cầu Node.js >= 20.9 (khuyến nghị Node.js 22 LTS).

```bash
npm install
npm run dev
```
Mở http://localhost:3000

## Deploy
1. Push thư mục này lên GitHub (đặt `package.json` ở root repository).
2. Vercel > Add New > Project > Import Git Repository.
3. Framework: Next.js, Build command `npm run build`, Output directory để mặc định.
4. Deploy và gắn custom domain trong Vercel > Project > Settings > Domains.

## Giới hạn cần biết
- Phép đo chạy ở trình duyệt người dùng, **không đo server Vercel**.
- Dùng `https://speed.cloudflare.com/__down` và `/__up`. Cần Cloudflare tiếp tục cho phép truy cập CORS từ website. Nếu endpoint bị chặn, UI hiển thị lỗi rõ ràng.
- Không thể ping ICMP, truy xuất gateway LAN, đo nền khi đóng tab, hoặc ghi lịch sử lâu dài trên Vercel frontend-only.
- Không tự chạy cron/interval phía server. Có thể đo thủ công khi mở website.
- Kết quả là phép đo gần đúng, không phải kết quả chính thức của Ookla Speedtest.
