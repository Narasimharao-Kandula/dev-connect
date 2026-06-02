import Lottie from 'lottie-react';

const loadingDots = {
  v: '5.5.0',
  fr: 30,
  ip: 0,
  op: 40,
  w: 120,
  h: 60,
  nm: 'Loading Dots',
  ddd: 0,
  assets: [],
  layers: [
    { ddd: 0, ind: 1, ty: 4, nm: 'Dot 1', sr: 1, ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [30, 40, 0] }, s: { a: 0, k: [100, 100, 100] }, r: { a: 0, k: 0 } }, shapes: [{ ty: 'el', d: 1, s: { a: 0, k: [16, 16] }, p: { a: 0, k: [0, 0] }, nm: 'Ellipse', ks: { a: 0, k: 100 } }], ef: [], ao: 0, ip: 0, op: 40, st: 0, bm: 0 },
    { ddd: 0, ind: 2, ty: 4, nm: 'Dot 2', sr: 1, ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [60, 40, 0] }, s: { a: 1, k: [{ t: 0, s: [60, 60, 100] }, { t: 10, s: [100, 100, 100] }, { t: 20, s: [60, 60, 100] }, { t: 40, s: [60, 60, 100] }] }, r: { a: 0, k: 0 } }, shapes: [{ ty: 'el', d: 1, s: { a: 0, k: [16, 16] }, p: { a: 0, k: [0, 0] }, nm: 'Ellipse', ks: { a: 0, k: 100 } }], ef: [], ao: 0, ip: 0, op: 40, st: 0, bm: 0 },
    { ddd: 0, ind: 3, ty: 4, nm: 'Dot 3', sr: 1, ks: { o: { a: 0, k: 100 }, p: { a: 0, k: [90, 40, 0] }, s: { a: 1, k: [{ t: 0, s: [60, 60, 100] }, { t: 10, s: [60, 60, 100] }, { t: 20, s: [100, 100, 100] }, { t: 30, s: [60, 60, 100] }, { t: 40, s: [60, 60, 100] }] }, r: { a: 0, k: 0 } }, shapes: [{ ty: 'el', d: 1, s: { a: 0, k: [16, 16] }, p: { a: 0, k: [0, 0] }, nm: 'Ellipse', ks: { a: 0, k: 100 } }], ef: [], ao: 0, ip: 0, op: 40, st: 0, bm: 0 },
  ],
};

export default function LottieLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={loadingDots as any}
        loop
        autoplay
        style={{ width: 120, height: 60 }}
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <LottieLoader />
      <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse-soft">Loading...</p>
    </div>
  );
}
