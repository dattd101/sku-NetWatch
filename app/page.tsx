'use client';
import { useEffect, useRef, useState } from 'react';
import { speedTest, type SpeedResult } from './speedtest';
const number = (v?:number) => v === undefined ? '—' : v.toFixed(2);
export default function Home() {
  const [result,setResult] = useState<SpeedResult|null>(null);
  const [history,setHistory] = useState<SpeedResult[]>([]);
  const [status,setStatus] = useState('Sẵn sàng đo tốc độ Internet.');
  const [running,setRunning] = useState(false);
  const [online,setOnline] = useState<boolean|null>(null);
  const abortRef = useRef<AbortController|null>(null);
  useEffect(()=>{
    const update=()=>setOnline(navigator.onLine);
    update();window.addEventListener('online',update);window.addEventListener('offline',update);
    return ()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);abortRef.current?.abort();};
  },[]);
  async function run() {
    if (running) return;
    const controller = new AbortController();abortRef.current=controller;
    setRunning(true);setStatus('Đang bắt đầu phép đo...');
    try {
      const data=await speedTest(setStatus,controller.signal);
      if(controller.signal.aborted)return;
      setResult(data);setHistory(prev=>[data,...prev].slice(0,20));
      setStatus('Đo hoàn tất! Kết quả đã cập nhật trực tiếp trên màn hình.');
    } catch(e) {
      setStatus(controller.signal.aborted?'Đã hủy phép đo.':`Đo thất bại: ${e instanceof Error?e.message:String(e)}. Kiểm tra kết nối và quyền truy cập speed.cloudflare.com.`);
    } finally {setRunning(false);abortRef.current=null;}
  }
  return <>
    <header><div><h1>◉ NetWatch <span className="green">Next.js 15</span></h1><small>Speed Test · GitHub + Vercel</small></div><div className="row"><span className={online?'green':'red'}>{online===null?'Đang kiểm tra':online?'● Trình duyệt online':'● Trình duyệt offline'}</span><button onClick={run} disabled={running}>{running?'Đang đo...':'▶ Đo tốc độ ngay'}</button>{running&&<button className="secondary" onClick={()=>abortRef.current?.abort()}>Hủy</button>}</div></header>
    <main><p role="status" aria-live="polite" id="notice">{status}</p>
      <div className="card" style={{borderLeft:'4px solid #16ae83'}}><b>Đo trực tiếp trong trình duyệt:</b> Kết quả hiển thị ngay sau khi đo xong, không dùng Python, database, Excel hoặc file EXE. Dữ liệu lịch sử chỉ giữ trong tab hiện tại.</div>
      <h2>Kết quả đo gần nhất</h2><section className="grid">
        <div className="card"><small>Download</small><div className="value">{number(result?.download)}</div><small>Mbps</small></div>
        <div className="card"><small>Upload</small><div className="value">{number(result?.upload)}</div><small>Mbps</small></div>
        <div className="card"><small>Ping</small><div className="value">{number(result?.ping)}</div><small>ms</small></div>
        <div className="card"><small>Jitter</small><div className="value">{number(result?.jitter)}</div><small>ms</small></div>
      </section>
      <div className="card"><h2>Lịch sử đo trong phiên</h2><div className="scroll"><table><thead><tr><th>Thời gian</th><th>Download (Mbps)</th><th>Upload (Mbps)</th><th>Ping (ms)</th><th>Jitter (ms)</th></tr></thead><tbody>{history.length?history.map((x,i)=><tr key={`${x.at}-${i}`}><td>{new Date(x.at).toLocaleString('vi-VN')}</td><td>{number(x.download)}</td><td>{number(x.upload)}</td><td>{number(x.ping)}</td><td>{number(x.jitter)}</td></tr>):<tr><td colSpan={5}>Chưa có phép đo nào</td></tr>}</tbody></table></div>{history.length>0&&<button className="secondary" onClick={()=>{setHistory([]);setResult(null);setStatus('Đã xóa kết quả trong phiên.');}}>Xóa lịch sử phiên</button>}</div>
      <div className="card"><h2>Lưu ý khi triển khai Vercel</h2><p>Phép đo sử dụng endpoint công khai của Cloudflare từ trình duyệt người truy cập, nên phản ánh đường truyền của người đó, không phải đường truyền máy chủ Vercel. Tốc độ có thể khác ứng dụng Ookla; kết quả phụ thuộc trình duyệt, CORS và đường truyền đến Cloudflare.</p><p>Website không thể ping ICMP hoặc xác định gateway LAN của người dùng từ trình duyệt. Giám sát liên tục khi đóng tab cũng không thể thực hiện với phiên bản frontend-only này.</p></div>
    </main>
  </>;
}
