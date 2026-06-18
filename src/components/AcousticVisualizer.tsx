import React, { useEffect, useRef } from 'react';

interface AcousticVisualizerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  waveType: string;
}

export default function AcousticVisualizer({ analyserNode, isPlaying, waveType }: AcousticVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get limits
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 1024;
    const timeDataArray = new Uint8Array(bufferLength);
    const freqDataArray = new Uint8Array(bufferLength);

    const drawGrid = (width: number, height: number) => {
      ctx.strokeStyle = 'rgba(90, 90, 64, 0.04)';
      ctx.lineWidth = 1;

      // Vertical lines
      const verticalLines = 12;
      for (let i = 1; i < verticalLines; i++) {
        const x = (width / verticalLines) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      const horizontalLines = 8;
      for (let i = 1; i < horizontalLines; i++) {
        const y = (height / horizontalLines) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center crosshair
      ctx.strokeStyle = 'rgba(90, 90, 64, 0.08)';
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw elegant carbon grid background
      drawGrid(width, height);

      // Organic colors
      let mainBrandColor = '#5A5A40'; // Sage Green
      let waveStrokeStyle = '#5A5A40'; 

      if (waveType === 'square') {
        waveStrokeStyle = '#8C6D58'; // Clay / Terracotta
      } else if (waveType === 'triangle') {
        waveStrokeStyle = '#4E6E5D'; // Forest Green
      } else if (waveType === 'sawtooth') {
        waveStrokeStyle = '#A37B45'; // Amber Ochre
      } else if (waveType.includes('noise')) {
        waveStrokeStyle = '#7F7F70'; // Warm stone grey
      }

      if (!isPlaying || !analyserNode) {
        // Draw flat line when not playing
        ctx.beginPath();
        ctx.strokeStyle = '#c5c5be'; 
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Silent text indicators
        ctx.fillStyle = '#7F7F70';
        ctx.font = '11px font-sans, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SIGNAL IDLE • STANDBY', width / 2, height / 2 + 25);

        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Fetch web audio analytical data
      analyserNode.getByteTimeDomainData(timeDataArray);
      analyserNode.getByteFrequencyData(freqDataArray);

      // --- 2. Draw Frequency Spectrum Filled Area (Bottom) ---
      ctx.beginPath();
      const barWidth = width / bufferLength;
      let x = 0;

      // Start path at bottom left
      ctx.moveTo(0, height);

      for (let i = 0; i < bufferLength; i++) {
        const value = freqDataArray[i] / 255.0;
        const y = height - value * (height * 0.7); // scale spectrum to 70% of height

        // Curve or path to spectrum points
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += barWidth;
      }
      ctx.lineTo(width, height);
      ctx.closePath();

      // Premium glowing linear gradient for fill
      const fillGradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
      fillGradient.addColorStop(0, 'rgba(90, 90, 64, 0.12)'); // Sage soft fill
      fillGradient.addColorStop(1, 'rgba(90, 90, 64, 0.01)');
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // --- 3. Draw Oscilloscope Time-Domain wave (Top) ---
      ctx.beginPath();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = waveStrokeStyle;

      const sliceWidth = width / bufferLength;
      let waveX = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeDataArray[i] / 128.0; // range 0 to 2
        const y = v * (height / 2); // vertical scaling

        if (i === 0) {
          ctx.moveTo(waveX, y);
        } else {
          ctx.lineTo(waveX, y);
        }

        waveX += sliceWidth;
      }

      ctx.stroke();

      // Live tag indicator
      ctx.fillStyle = waveStrokeStyle;
      ctx.font = '700 9px font-sans, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('● LIVE WAVEFORM', width - 15, 20);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isPlaying, waveType]);

  return (
    <div id="visualizer-container" className="relative w-full h-48 md:h-60 rounded-[28px] bg-white border border-[#e5e5df] overflow-hidden shadow-xs flex items-center justify-center">
      <div className="absolute top-3.5 left-4 z-10 flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5A5A40]/50 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-[#5A5A40]' : 'bg-[#c5c5be]'}`}></span>
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#4a4a3f]/60">
          OSCILLOSCOPE / SPECTROGRAM
        </span>
      </div>

      <canvas
        id="audio-visualizer-canvas"
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
