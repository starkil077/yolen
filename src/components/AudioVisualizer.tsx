import React from 'react';

interface AudioVisualizerProps {
  fftData: Uint8Array;
  barCount?: number;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  fftData,
  barCount = 28,
  height = 56,
}) => {
  // Sample bars from fftData
  const bars: number[] = [];
  const step = Math.max(1, Math.floor(fftData.length / barCount));

  for (let i = 0; i < barCount; i++) {
    const val = fftData[i * step] || 0;
    // Normalize to 0.1 to 1.0 fraction
    const frac = Math.max(0.12, Math.min(1.0, val / 255));
    bars.push(frac);
  }

  return (
    <div
      className="flex items-center justify-center gap-1 w-full select-none"
      style={{ height: `${height}px` }}
    >
      {bars.map((frac, index) => (
        <div
          key={index}
          className="w-1.5 rounded-full bg-gradient-to-t from-cyan-400 via-sky-500 to-violet-500 transition-all duration-100 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
          style={{
            height: `${Math.round(frac * height)}px`,
            opacity: Math.max(0.4, frac),
          }}
        />
      ))}
    </div>
  );
};
