"use client";

import dynamic from 'next/dynamic';

const DeepfakeAudio = dynamic(() => import('@/pages/DeepfakeAudio'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center text-white">
      Preparing audio studio…
    </div>
  )
});

export default function DeepfakeAudioPage() {
  return <DeepfakeAudio />;
}
