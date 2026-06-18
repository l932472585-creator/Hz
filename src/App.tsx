import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Activity, 
  Brain, 
  Timer, 
  RefreshCw, 
  Info, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import useSoundEngine from './hooks/useSoundEngine';
import AcousticVisualizer from './components/AcousticVisualizer';
import PianoRoll from './components/PianoRoll';
import FrequencyGuides from './components/FrequencyGuides';
import { WaveType } from './types';

// Logarithmic slider helpers for premium feel. Human hearing ranges from 1Hz to 20,000Hz
const MIN_FREQ = 1;
const MAX_FREQ = 20000;

// Logarithmic slider value conversion
const logToFreq = (val: number): number => {
  // val is 0 to 100
  const minLog = Math.log(MIN_FREQ);
  const maxLog = Math.log(MAX_FREQ);
  const scale = (maxLog - minLog) / 100;
  return Math.round(Math.exp(minLog + scale * val));
};

const freqToLog = (freq: number): number => {
  const minLog = Math.log(MIN_FREQ);
  const maxLog = Math.log(MAX_FREQ);
  const scale = (maxLog - minLog) / 100;
  const clampedFreq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
  return (Math.log(clampedFreq) - minLog) / scale;
};

export default function App() {
  const {
    isPlaying,
    mode,
    setMode,
    frequency,
    setFrequency,
    waveType,
    setWaveType,
    volume,
    setVolume,
    
    // Binaural Beats
    carrierFreq,
    setCarrierFreq,
    beatFreq,
    setBeatFreq,
    
    // Sweeps
    sweepStart,
    setSweepStart,
    sweepEnd,
    setSweepEnd,
    sweepDuration,
    setSweepDuration,
    sweepProgress,
    sweepType,
    setSweepType,

    analyserNode,
    play,
    stop,
  } = useSoundEngine();

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [activePianoNote, setActivePianoNote] = useState<string | null>(null);

  // Mute / Unmute handler
  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Logarithmic slider onChange
  const handleLogSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    const newFreq = logToFreq(rawVal);
    setFrequency(newFreq);
  };

  // Quick preset triggers via guides
  const handleSolfeggioSelect = (freq: number) => {
    setMode('single');
    setWaveType('sine');
    setFrequency(freq);
    play();
  };

  const handleBinauralSelect = (carrier: number, beat: number) => {
    setMode('binaural');
    setWaveType('sine');
    setCarrierFreq(carrier);
    setBeatFreq(beat);
    play();
  };

  const handleSingleSelect = (freq: number) => {
    setMode('single');
    setWaveType('sine');
    setFrequency(freq);
    play();
  };

  const handlePianoNoteSelect = (freq: number, noteName: string) => {
    setMode('single');
    // Sine or triangle generally sound best for clean musical keys
    if (waveType.includes('noise')) {
      setWaveType('sine');
    }
    setFrequency(freq);
    setActivePianoNote(noteName);
    play();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#4a4a3f] flex flex-col font-sans selection:bg-[#5A5A40]/20 selection:text-[#4a4a3f]">
      
      {/* 1. Header Navigation and Info bar */}
      <header className="border-b border-[#e5e5df] bg-white/70 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#5A5A40] flex items-center justify-center shadow-xs">
              <Activity className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight font-serif text-[#4a4a3f]">
                AcousticWave Pro
              </h1>
              <p className="text-[10px] text-[#4a4a3f]/75 font-mono tracking-wide -mt-0.5">
                高精度声音频率和波形合成器
              </p>
            </div>
          </div>

          {/* Quick status displays */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono">
            <span className="text-[10px] shrink-0 bg-white border border-[#e5e5df] text-[#4a4a3f]/80 px-2.5 py-1 rounded-full">
              系统: <span className="text-[#5A5A40] font-bold">延迟优化</span>
            </span>
            <span className="text-[10px] shrink-0 bg-white border border-[#e5e5df] text-[#4a4a3f]/80 px-2.5 py-1 rounded-full">
              采样率: <span className="text-[#5A5A40]">{typeof window !== 'undefined' ? '48.0 kHz' : '自动'}</span>
            </span>
            <span className="text-[10px] shrink-0 bg-white border border-[#e5e5df] text-[#4a4a3f]/80 px-2.5 py-1 rounded-full">
              状态: <span className={isPlaying ? 'text-[#5A5A40] font-bold animate-pulse' : 'text-[#8C6D58]'}>{isPlaying ? '● 正在输出' : '■ 待命'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Canvas Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Top visualizer and controls layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Visualizer panel & Main mode options (7 spans on LG screen) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Visualizer Display Box */}
            <div className="bg-white p-5 rounded-[28px] border border-[#e5e5df] shadow-xs">
              <AcousticVisualizer 
                analyserNode={analyserNode} 
                isPlaying={isPlaying} 
                waveType={mode === 'binaural' ? 'sine' : waveType} 
              />
              
              {/* Context info under visualizer */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-[#edebe4] pt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#4a4a3f]/60 font-mono uppercase">当前模式</span>
                  <span className="text-[11px] font-mono font-semibold text-[#4a4a3f] mt-1 capitalize">
                    {mode === 'single' ? '单频连续音' : mode === 'binaural' ? '双耳共振脑波' : '扫频测试'}
                  </span>
                </div>
                <div className="flex flex-col border-x border-[#edebe4]">
                  <span className="text-[9px] text-[#4a4a3f]/60 font-mono src-mono uppercase">输出频率</span>
                  <span className="text-[11px] font-mono font-bold text-[#5A5A40] mt-1">
                    {mode === 'binaural' ? `${carrierFreq}Hz + ${beatFreq}Hz` : `${frequency} Hz`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#4a4a3f]/60 font-mono uppercase">振幅等级</span>
                  <span className="text-[11px] font-mono font-semibold text-[#4a4a3f] mt-1">
                    {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="bg-white/80 p-1.5 rounded-[20px] border border-[#e5e5df] flex gap-1">
              <button
                id="tab-mode-single"
                onClick={() => { setMode('single'); activePianoNote && setActivePianoNote(null); }}
                className={`flex-1 py-3 px-3 rounded-[14px] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'single'
                    ? 'bg-[#5A5A40] text-white shadow-xs font-bold'
                    : 'text-[#4a4a3f]/75 hover:text-[#4a4a3f] hover:bg-[#edebe4]/50'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                单频连续音
              </button>
              
              <button
                id="tab-mode-binaural"
                onClick={() => { setMode('binaural'); activePianoNote && setActivePianoNote(null); }}
                className={`flex-1 py-3 px-3 rounded-[14px] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'binaural'
                    ? 'bg-[#5A5A40] text-white shadow-xs font-bold'
                    : 'text-[#4a4a3f]/75 hover:text-[#4a4a3f] hover:bg-[#edebe4]/50'
                }`}
              >
                <Brain className="h-3.5 w-3.5" />
                双耳节拍脑波
              </button>

              <button
                id="tab-mode-sweep"
                onClick={() => { setMode('sweep'); activePianoNote && setActivePianoNote(null); }}
                className={`flex-1 py-3 px-3 rounded-[14px] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'sweep'
                    ? 'bg-[#5A5A40] text-white shadow-xs font-bold'
                    : 'text-[#4a4a3f]/75 hover:text-[#4a4a3f] hover:bg-[#edebe4]/50'
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                自动扫频工具
              </button>
            </div>

            {/* Mode Specific Controller panels */}
            <div className="bg-white p-6 rounded-[28px] border border-[#e5e5df] shadow-xs flex flex-col gap-5 min-h-[220px]">
              
              {/* TABS A: Single Mode */}
              {mode === 'single' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a3f] font-serif">
                      波形与连续发生器控制 (Oscillator Control)
                    </h3>
                    <p className="text-[11px] text-[#4a4a3f]/70 mt-1">
                      调节基本声音发生参数。正弦波声音圆润柔和，方波亮丽锋锐，三角波明暗适中，各色噪波适合屏蔽环境杂音与白噪声屏蔽。
                    </p>
                  </div>

                  {/* Waveform Selector Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {([
                      { id: 'sine', label: '正弦波 Pure Sine', icon: '∿', color: 'text-[#5A5A40] border-[#5A5A40]/30 bg-[#5A5A40]/5' },
                      { id: 'triangle', label: '三角波 Triangle', icon: '▲', color: 'text-[#4E6E5D] border-[#4E6E5D]/30 bg-[#4E6E5D]/5' },
                      { id: 'sawtooth', label: '锯齿波 Sawtooth', icon: '◤', color: 'text-[#A37B45] border-[#A37B45]/30 bg-[#A37B45]/5' },
                      { id: 'square', label: '方波 Rect Square', icon: '█', color: 'text-[#8C6D58] border-[#8C6D58]/30 bg-[#8C6D58]/5' },
                    ] as const).map(w => (
                      <button
                        id={`wave-btn-${w.id}`}
                        key={w.id}
                        onClick={() => setWaveType(w.id)}
                        className={`py-3 px-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                          waveType === w.id
                            ? `${w.color} border-[#5A5A40] font-semibold scale-[1.01] shadow-xs`
                            : 'bg-[#fafaf9] border-[#e5e5df] text-[#4a4a3f]/75 hover:bg-[#edebe4]/50 hover:text-[#4a4a3f]'
                        }`}
                      >
                        <span className="text-lg font-mono font-black">{w.icon}</span>
                        <span className="text-[10px] truncate max-w-full font-medium">{w.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Noise Addition */}
                  <div className="flex flex-col gap-1.5 pt-3 border-t border-[#edebe4]">
                    <span className="text-[10px] text-[#4a4a3f]/60 uppercase font-mono">
                      或选择背景助眠各色噪音系列:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: 'white-noise', label: '白噪音 White' },
                        { id: 'pink-noise', label: '粉红噪音 Pink' },
                        { id: 'brown-noise', label: '褐红/深空 Brown' }
                      ] as const).map(n => (
                        <button
                          id={`noise-btn-${n.id}`}
                          key={n.id}
                          onClick={() => setWaveType(n.id)}
                          className={`py-2 px-2 rounded-lg border text-[10px] font-medium transition-all text-center cursor-pointer ${
                            waveType === n.id
                              ? 'bg-[#8C6D58]/10 text-[#8C6D58] border-[#8C6D58] shadow-xs font-semibold'
                              : 'bg-[#fafaf9] border-[#e5e5df] text-[#4a4a3f]/70 hover:bg-[#edebe4]/50'
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TABS B: Binaural Beats Mode */}
              {mode === 'binaural' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] font-serif">
                      双耳立体声差频发生器 (Binaural Beats)
                    </h3>
                    <p className="text-[11px] text-[#4a4a3f]/70 mt-1">
                      为两耳分别输入微小差异的纯正弦波，大脑将融合出特定疗愈脑波共鸣频率。
                      <span className="text-[#8C6D58]">（※ 强烈建议佩戴立体声耳机，否则将失去差频体验）</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fafaf9] p-4 rounded-2xl border border-[#e5e5df]">
                    {/* Left setting (Carrier) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#4a4a3f]/60">
                          左耳基准载体频率 (Carrier)
                        </span>
                        <span className="text-xs font-mono font-bold text-[#4a4a3f]">{carrierFreq} Hz</span>
                      </div>
                      <input
                        id="slider-carrier"
                        type="range"
                        min="50"
                        max="1000"
                        step="1"
                        value={carrierFreq}
                        onChange={(e) => setCarrierFreq(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-lg"
                      />
                    </div>

                    {/* Right setting (Beat frequency difference) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#4a4a3f]/60">
                          大脑感合共振差频 (Beat Delta)
                        </span>
                        <span className="text-xs font-mono font-bold text-[#5A5A40]">+{beatFreq} Hz</span>
                      </div>
                      <input
                        id="slider-beat"
                        type="range"
                        min="1"
                        max="50"
                        step="0.5"
                        value={beatFreq}
                        onChange={(e) => setBeatFreq(parseFloat(e.target.value))}
                        className="w-full h-1.5 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Math diagram of ears */}
                  <div className="text-[10px] text-[#4a4a3f]/80 font-mono flex items-center justify-center gap-3 bg-[#fafaf9] p-2.5 rounded-xl border border-[#e5e5df] leading-normal">
                    <span className="text-[#4a4a3f]/60">左耳: {carrierFreq}Hz</span>
                    <ArrowRight className="h-3 w-3 text-[#5A5A40]" />
                    <span className="text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-0.5 rounded border border-[#5A5A40]/25 font-bold">
                      感知差频: {beatFreq}Hz {
                        beatFreq <= 4 ? '(Delta睡眠波)' : 
                        beatFreq <= 8 ? '(Theta冥想波)' : 
                        beatFreq <= 12 ? '(Alpha放松波)' : 
                        beatFreq <= 30 ? '(Beta专注波)' : '(Gamma灵高认知波)'
                      }
                    </span>
                    <ArrowRight className="h-3 w-3 text-[#5A5A40]" />
                    <span className="text-[#4a4a3f]/60">右耳: {carrierFreq + beatFreq}Hz</span>
                  </div>
                </div>
              )}

              {/* TABS C: Sweep Mode */}
              {mode === 'sweep' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a3f] font-serif">
                      高精度扫频设置器 (Audio Sweep System)
                    </h3>
                    <p className="text-[11px] text-[#4a4a3f]/70 mt-1">
                      让频率在设定时间内连续滑动，用于测量房间频率共振点、扬声器声学极限以及人耳极高听频限。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fafaf9] p-4 rounded-xl border border-[#e5e5df]">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-mono text-[#4a4a3f]/60">起始频率</label>
                      <input
                        id="input-sweep-start"
                        type="number"
                        min="20"
                        max="20000"
                        value={sweepStart}
                        onChange={(e) => setSweepStart(Math.max(1, parseInt(e.target.value) || 20))}
                        className="w-full text-xs bg-white border border-[#e5e5df] px-2 py-1.5 rounded-lg font-mono text-[#4a4a3f]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-mono text-[#4a4a3f]/60">终止频率</label>
                      <input
                        id="input-sweep-end"
                        type="number"
                        min="20"
                        max="20000"
                        value={sweepEnd}
                        onChange={(e) => setSweepEnd(Math.max(1, parseInt(e.target.value) || 20000))}
                        className="w-full text-xs bg-white border border-[#e5e5df] px-2 py-1.5 rounded-lg font-mono text-[#4a4a3f]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-mono text-[#4a4a3f]/60">扫频时长</label>
                      <input
                        id="input-sweep-duration"
                        type="number"
                        min="1"
                        max="120"
                        value={sweepDuration}
                        onChange={(e) => setSweepDuration(Math.max(1, Math.min(120, parseInt(e.target.value) || 10)))}
                        className="w-full text-xs bg-white border border-[#e5e5df] px-2 py-1.5 rounded-lg font-mono text-[#4a4a3f]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-mono text-[#4a4a3f]/60">滑动曲线</label>
                      <select
                        id="select-sweep-curve"
                        value={sweepType}
                        onChange={(e) => setSweepType(e.target.value as 'linear' | 'exponential')}
                        className="w-full text-xs bg-white border border-[#e5e5df] px-2 py-1 rounded-lg font-semibold text-[#4a4a3f]/80 cursor-pointer"
                      >
                        <option value="exponential">对数(推荐听力)</option>
                        <option value="linear">线性(声学测量)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sweep active progress bar indicator */}
                  {isPlaying && sweepProgress > 0 && (
                    <div className="flex flex-col gap-1 mt-1 transition-all">
                      <div className="flex justify-between text-[10px] font-mono text-[#4a4a3f]/80">
                        <span>正在进行精密声学段扫频...</span>
                        <span>{Math.round(sweepProgress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#edebe4] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#5A5A40] to-[#8C6D58] rounded-full transition-all duration-75"
                          style={{ width: `${sweepProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* RIGHT: Master frequency settings & Level adjustments (5 spans on LG screen) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Master Play / Main Controller block */}
            <div className="bg-white p-6 rounded-[28px] border border-[#e5e5df] shadow-xs flex flex-col gap-5">
              
              {/* Giant Play Switcher */}
              <div className="flex items-center gap-3">
                {isPlaying ? (
                  <button
                    id="btn-global-stop"
                    onClick={stop}
                    className="flex-1 flex items-center justify-center gap-3 bg-[#8C6D58] hover:bg-[#7D5F4A] text-white font-serif font-semibold py-4 px-4 rounded-2xl shadow-xs transition-all border-b-4 border-[#5E4432] active:scale-[0.98] cursor-pointer"
                  >
                    <Square className="h-5 w-5 fill-white text-white" />
                    <span>停止声音输出</span>
                  </button>
                ) : (
                  <button
                    id="btn-global-play"
                    onClick={play}
                    className="flex-1 flex items-center justify-center gap-3 bg-[#5A5A40] hover:bg-[#4D4D36] text-white font-serif font-semibold py-4 px-4 rounded-2xl shadow-xs transition-all border-b-4 border-[#3D3D2B] active:scale-[0.98] cursor-pointer"
                  >
                    <Play className="h-5 w-5 fill-white text-white" />
                    <span>开启声音发生</span>
                  </button>
                )}
              </div>

              {/* Volume Mixer Controls */}
              <div id="volume-control-container" className="bg-[#fafaf9] p-4 rounded-2xl border border-[#e5e5df] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase font-serif tracking-wider font-semibold text-[#4a4a3f]/75">
                    🎚️ 发生器总输出振幅 (Volume Gain)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#4a4a3f]">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    id="btn-volume-mute"
                    onClick={toggleMute}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isMuted || volume === 0
                        ? 'bg-[#8C6D58]/10 border-[#8C6D58] text-[#8C6D58]'
                        : 'bg-white border-[#e5e5df] text-[#4a4a3f]/80 hover:text-[#4a4a3f]'
                    }`}
                    title={isMuted ? '取消静音' : '静音'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  <input
                    id="slider-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      const newV = parseFloat(e.target.value);
                      setVolume(newV);
                      if (newV > 0) setIsMuted(false);
                    }}
                    className="flex-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Main Frequency slider block (only matters for Single Mode) */}
              {mode === 'single' && (
                <div id="frequency-dial-container" className="bg-[#fafaf9] p-4 rounded-2xl border border-[#e5e5df] flex flex-col gap-4">
                  
                  {/* Detailed LCD Number Box */}
                  <div className="flex flex-col items-center justify-center py-5 bg-white border border-[#e5e5df] rounded-2xl shadow-xs relative overflow-hidden group">
                    <div className="absolute top-2 left-3 text-[8px] font-mono text-[#4a4a3f]/40 tracking-widest select-none">
                      OSC FREQUENCY METER
                    </div>
                    {waveType.includes('noise') ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl font-serif tracking-wide text-[#8C6D58] font-bold uppercase animate-pulse">
                          {waveType === 'white-noise' ? '白色噪音' : waveType === 'pink-noise' ? '粉色噪音' : '褐色噪音'}
                        </span>
                        <span className="text-[10px] text-[#4a4a3f]/60 font-mono mt-1">
                          全频谱随机掩蔽声波
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <input
                            id="input-precise-frequency"
                            type="number"
                            min="1"
                            max="20000"
                            value={frequency}
                            onChange={(e) => setFrequency(Math.max(1, Math.min(20000, parseInt(e.target.value) || 440)))}
                            className="text-4xl md:text-5xl font-mono text-center font-bold tracking-tight text-[#5A5A40] bg-transparent border-b border-transparent focus:border-[#5A5A40] focus:outline-none w-48 transition-all shrink-0 selection:bg-[#5A5A40]/10"
                          />
                          <span className="text-lg font-mono font-bold text-[#4a4a3f]/50 select-none">
                            Hz
                          </span>
                        </div>

                        {activePianoNote && (
                          <span className="text-[11px] bg-[#5A5A40]/10 border border-[#5A5A40]/25 text-[#5A5A40] px-2.5 py-0.5 rounded-full font-mono mt-2 inline-block">
                            最近钢琴键符: {activePianoNote}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Frequency log slider (perfect logarithmic control) */}
                  {!waveType.includes('noise') && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#4a4a3f]/50 select-none">
                        <span>1 Hz (次声波)</span>
                        <span>440 Hz (标准)</span>
                        <span>20 kHz (超声极限)</span>
                      </div>

                      <input
                        id="slider-frequency-logarithmic"
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={freqToLog(frequency)}
                        onChange={handleLogSliderChange}
                        className="w-full cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Micro fine adjustments */}
                  {!waveType.includes('noise') && (
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        { delta: -100, label: '-100Hz' },
                        { delta: -10, label: '-10Hz' },
                        { delta: -1, label: '-1Hz' },
                        { delta: 1, label: '+1Hz' },
                        { delta: 10, label: '+10Hz' },
                        { delta: 100, label: '+100Hz' },
                      ].map((adj) => (
                        <button
                          id={`adj-${adj.delta}`}
                          key={adj.delta}
                          onClick={() => setFrequency(prev => Math.max(1, Math.min(20000, prev + adj.delta)))}
                          className="px-2 py-1 bg-white hover:bg-[#edebe4]/50 border border-[#e5e5df] text-[10px] font-mono rounded text-[#4a4a3f]/80 transition-all select-none cursor-pointer"
                        >
                          {adj.label}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* Mode guidelines text helper */}
              <div className="bg-[#fafaf9] p-4.5 rounded-2xl border border-[#e5e5df] flex gap-3 text-xs leading-relaxed text-[#4a4a3f]/80">
                <Info className="h-5 w-5 text-[#5A5A40] shrink-0 mt-0.5" />
                <div>
                  <span className="font-serif font-semibold text-[#4a4a3f]">使用小贴士:</span>
                  <p className="mt-1">
                    人耳通常的听力范围是 <code className="text-[#8C6D58] font-mono">20 Hz ~ 20,000 Hz</code>。随着年龄增长以及耳道自然劳损，人们能听到的高频上限会明显下降。测试高频时请将音量调小，合理保护听力。
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* 3. Musical Element: Piano keyboard scale */}
        <section className="bg-white p-5 rounded-[28px] border border-[#e5e5df] shadow-xs">
          <PianoRoll 
            onNoteSelect={handlePianoNoteSelect} 
            activeFrequency={frequency} 
            isPlaying={isPlaying && mode === 'single' && !waveType.includes('noise')}
          />
        </section>

        {/* 4. Complete detailed frequency presets and instructions */}
        <section id="frequency-guides-container">
          <FrequencyGuides 
            onSolfeggioSelect={handleSolfeggioSelect}
            onBinauralSelect={handleBinauralSelect}
            onSingleSelect={handleSingleSelect}
            currentFrequency={frequency}
          />
        </section>

      </main>

      {/* 5. Footer */}
      <footer className="border-t border-[#e5e5df] bg-white/50 py-6 px-4 text-center mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#4a4a3f]/70">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5A5A40]"></span>
            <span>AcousticWave Pro Studio v2.4 • 零延迟数字信号生成器</span>
          </div>
          <div className="font-mono text-[#4a4a3f]/60 max-w-lg text-left sm:text-right leading-relaxed">
            科学及健康提示: 所有功能均基于现代物理/数字信号合成及医学差频实验资料，不可作为精确医疗器械诊断结论
          </div>
        </div>
      </footer>

    </div>
  );
}
