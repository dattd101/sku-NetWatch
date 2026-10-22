export type SpeedResult = { at: string; download: number; upload: number; ping: number; jitter: number };
const ORIGIN = 'https://speed.cloudflare.com';
const timeoutMs = 18000;
async function timedFetch(url: string, options: RequestInit = {}, signal?: AbortSignal): Promise<{bytes:number; seconds:number}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const start = performance.now();
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    return { bytes: buffer.byteLength, seconds: Math.max((performance.now() - start) / 1000, 0.001) };
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
function mbps(bytes: number, seconds: number) { return Math.round((bytes * 8 / seconds / 1_000_000) * 100) / 100; }
export async function speedTest(onStep: (step:string)=>void, signal: AbortSignal): Promise<SpeedResult> {
  onStep('Đang đo ping và jitter...');
  const samples: number[] = [];
  for (let i=0; i<5; i++) {
    const r = await timedFetch(`${ORIGIN}/__down?bytes=0&r=${Math.random()}`, {}, signal);
    samples.push(r.seconds * 1000);
  }
  const ping = samples.reduce((a,b)=>a+b,0)/samples.length;
  const jitter = samples.slice(1).reduce((a,b,i)=>a+Math.abs(b-samples[i]),0)/(samples.length-1);
  onStep('Đang đo Download...');
  let downBytes=0, downSeconds=0;
  for (const size of [1_000_000, 5_000_000, 10_000_000]) {
    const r = await timedFetch(`${ORIGIN}/__down?bytes=${size}&r=${Math.random()}`, {}, signal);
    downBytes+=r.bytes; downSeconds+=r.seconds;
  }
  onStep('Đang đo Upload...');
  let upBytes=0, upSeconds=0;
  for (const size of [500_000, 1_000_000, 2_000_000]) {
    const body = new Uint8Array(size);
    const r = await timedFetch(`${ORIGIN}/__up?r=${Math.random()}`, { method:'POST', body }, signal);
    // The response size is not the uploaded payload size.
    upBytes += size; upSeconds += r.seconds;
  }
  return {at:new Date().toISOString(), download:mbps(downBytes,downSeconds), upload:mbps(upBytes,upSeconds), ping:+ping.toFixed(2), jitter:+jitter.toFixed(2)};
}
