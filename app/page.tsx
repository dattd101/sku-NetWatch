'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { speedTest, type SpeedResult } from './speedtest';
const number = (v?: number) => v === undefined ? '—' : v.toFixed(2);
const INTERVAL_MS = 10 * 60 * 1000;

export default function Home() {
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [history, setHistory] = useState<SpeedResult[]>([]);
  const [status, setStatus] = useState('Sẵn sàng đo tốc độ Internet.');
  const [running, setRunning] = useState(false);
  const [automatic, setAutomatic] = useState(false);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [online, setOnline] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runningRef = useRef(false);
  const automaticRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setStatus('Đang bắt đầu phép đo...');
    try {
      const data = await speedTest(setStatus, controller.signal);
      if (controller.signal.aborted) return;
      setResult(data);
      setHistory(prev => [data, ...prev]);
      setStatus('Đo hoàn tất! Kết quả đã cập nhật trực tiếp trên màn hình.');
    } catch (e) {
      setStatus(controller.signal.aborted ? 'Đã hủy phép đo.' : `Đo thất bại: ${e instanceof Error ? e.message : String(e)}.`);
    } finally {
      runningRef.current = false;
      setRunning(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      clearInterval(clock);
      if (intervalRef.current) clearInterval(intervalRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function toggleAutomatic() {
    if (automaticRef.current) {
      automaticRef.current = false;
      setAutomatic(false);
      setNextAt(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus('Đã tắt tự động đo.');
      return;
    }
    automaticRef.current = true;
    setAutomatic(true);
    setNextAt(Date.now() + INTERVAL_MS);
    if (!runningRef.current) void run();
    intervalRef.current = setInterval(() => {
      setNextAt(Date.now() + INTERVAL_MS);
      if (navigator.onLine && !runningRef.current) void run();
    }, INTERVAL_MS);
  }

  async function exportExcel() {
    if (!history.length) return;
    const XLSX = await import('xlsx');
    const rows = [...history].reverse().map((x, i) => ({
      'STT': i + 1,
      'Thời gian': new Date(x.at).toLocaleString('vi-VN'),
      'Download (Mbps)': x.download,
      'Upload (Mbps)': x.upload,
      'Ping (ms)': x.ping,
      'Jitter (ms)': x.jitter,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = [{ wch: 8 }, { wch: 23 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 14 }];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Lich su do');
    XLSX.writeFile(book, `NetWatch-LichSu-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const remaining = nextAt === null ? null : Math.max(0, Math.ceil((nextAt - now) / 1000));
  const countdown = remaining === null ? '' : `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`;

  return <>
    <header>
      <div><h1>◉ NetWatch <span className="green">Next.js 15</span></h1></div>
      <div className="row">
        <span className={online ? 'green' : 'red'}>{online === null ? 'Đang kiểm tra' : online ? '● Trình duyệt online' : '● Trình duyệt offline'}</span>
        <button onClick={() => void run()} disabled={running}>{running ? 'Đang đo...' : '▶ Đo tốc độ ngay'}</button>
        <button className={automatic ? 'danger' : 'secondary'} onClick={toggleAutomatic}>{automatic ? '■ Tắt tự động đo' : '↻ Tự động đo mỗi 10 phút'}</button>
        {running && <button className="secondary" onClick={() => abortRef.current?.abort()}>Hủy</button>}
      </div>
    </header>
    <main>
      {automatic && <p className="auto-status">● Đang bật tự động đo mỗi 10 phút · Lần đo kế tiếp sau <strong>{countdown}</strong></p>}
      <p role="status" aria-live="polite" id="notice">{status}</p>
      <h2>Kết quả đo gần nhất</h2>
      <section className="grid">
        <div className="card"><small>Download</small><div className="value">{number(result?.download)}</div><small>Mbps</small></div>
        <div className="card"><small>Upload</small><div className="value">{number(result?.upload)}</div><small>Mbps</small></div>
        <div className="card"><small>Ping</small><div className="value">{number(result?.ping)}</div><small>ms</small></div>
        <div className="card"><small>Jitter</small><div className="value">{number(result?.jitter)}</div><small>ms</small></div>
      </section>
      <div className="card">
        <div className="history-header"><h2>Lịch sử đo trong phiên</h2><div className="row"><button className="secondary" disabled={!history.length} onClick={() => void exportExcel()}>↓ Tải file Excel</button>{history.length > 0 && <button className="secondary" onClick={() => { setHistory([]); setResult(null); setStatus('Đã xóa kết quả trong phiên.'); }}>Xóa lịch sử phiên</button>}</div></div>
        <div className="scroll"><table><thead><tr><th>Thời gian</th><th>Download (Mbps)</th><th>Upload (Mbps)</th><th>Ping (ms)</th><th>Jitter (ms)</th></tr></thead><tbody>{history.length ? history.map((x, i) => <tr key={`${x.at}-${i}`}><td>{new Date(x.at).toLocaleString('vi-VN')}</td><td>{number(x.download)}</td><td>{number(x.upload)}</td><td>{number(x.ping)}</td><td>{number(x.jitter)}</td></tr>) : <tr><td colSpan={5}>Chưa có phép đo nào</td></tr>}</tbody></table></div>
      </div>
    </main>
  </>;
}
