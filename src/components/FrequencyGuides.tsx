import React from 'react';
import { SolfeggioPreset, BrainwavePreset, HearingTestPreset } from '../types';

interface FrequencyGuidesProps {
  onSolfeggioSelect: (frequency: number) => void;
  onBinauralSelect: (carrier: number, beat: number) => void;
  onSingleSelect: (frequency: number) => void;
  currentFrequency: number;
}

const SOLFEGGIO_PRESETS: SolfeggioPreset[] = [
  { frequency: 174, label: '174 Hz', description: '缓解痛苦与压力 (Pain Relief / Grounding)', color: 'from-[#5A5A40]/5 to-[#5A5A40]/12 text-[#5A5A40] border-[#5A5A40]/20' },
  { frequency: 285, label: '285 Hz', description: '细胞与组织修复 (Cell & Tissue Healing)', color: 'from-[#8C6D58]/5 to-[#8C6D58]/12 text-[#8C6D58] border-[#8C6D58]/20' },
  { frequency: 396, label: '396 Hz', description: '消除恐惧与负面罪恶感 (Liberating Guilt & Fear)', color: 'from-[#A37B45]/5 to-[#A37B45]/12 text-[#A37B45] border-[#A37B45]/20' },
  { frequency: 417, label: '417 Hz', description: '促进变革与释放创伤 (Facilitating Change & Cleansing)', color: 'from-[#5A5A40]/5 to-[#5A5A40]/12 text-[#5A5A40] border-[#5A5A40]/20' },
  { frequency: 432, label: '432 Hz', description: '宇宙自然谐振之音 (Cosmic Tuning / Deep Peace)', color: 'from-[#4E6E5D]/5 to-[#4E6E5D]/12 text-[#4E6E5D] border-[#4E6E5D]/20' },
  { frequency: 528, label: '528 Hz', description: '爱的信频 & DNA 奇迹修复 (Transformation & DNA Miracle)', color: 'from-[#8C6D58]/5 to-[#8C6D58]/12 text-[#8C6D58] border-[#8C6D58]/20' },
  { frequency: 639, label: '639 Hz', description: '促进人际合唱与心灵连接 (Connecting & Relationships)', color: 'from-[#A37B45]/5 to-[#A37B45]/12 text-[#A37B45] border-[#A37B45]/20' },
  { frequency: 741, label: '741 Hz', description: '排毒、净化与觉醒直觉 (Awakening Intuition)', color: 'from-[#4E6E5D]/5 to-[#4E6E5D]/12 text-[#4E6E5D] border-[#4E6E5D]/20' },
  { frequency: 852, label: '852 Hz', description: '引导灵性觉悟与回归灵性 (Returning to Spiritual Order)', color: 'from-[#5A5A40]/5 to-[#5A5A40]/12 text-[#5A5A40] border-[#5A5A40]/20' },
  { frequency: 963, label: '963 Hz', description: '松果体激活 & 宇宙神圣合一 (Crown Chakra & Divine Awake)', color: 'from-[#8C6D58]/5 to-[#8C6D58]/12 text-[#8C6D58] border-[#8C6D58]/20' },
];

const BRAINWAVE_PRESETS: BrainwavePreset[] = [
  { range: 'δ Delta (1-4Hz)', label: '深度睡眠脑波 (0.5 - 4 Hz)', carrier: 120, beat: 2, description: '有助于深度无梦睡眠、免疫系统恢复与身体修复。建议佩戴耳机。', color: 'border-[#5A5A40]/20 hover:border-[#5A5A40]' },
  { range: 'θ Theta (4-8Hz)', label: '深度冥想与潜意识 (4 - 8 Hz)', carrier: 140, beat: 6, description: '激发艺术灵感、减轻压力、高阶超觉冥想与REM睡眠。', color: 'border-[#8C6D58]/20 hover:border-[#8C6D58]' },
  { range: 'α Alpha (8-12Hz)', label: '阿尔法放松波 (8 - 12 Hz)', carrier: 200, beat: 10, description: '静息状态、轻度放松、平静、信息高效吸收与舒缓焦虑。', color: 'border-[#4E6E5D]/20 hover:border-[#4E6E5D]' },
  { range: 'β Beta (12-30Hz)', label: '清醒专注与逻辑思维 (12 - 30 Hz)', carrier: 240, beat: 18, description: '高阶认知力、逻辑推理、决策能力与解决复杂问题。', color: 'border-[#A37B45]/20 hover:border-[#A37B45]' },
  { range: 'γ Gamma (30-50Hz)', label: '超高认知与信息整合 (&gt;30 Hz)', carrier: 300, beat: 40, description: '极致专注、提升记忆力和感官整合速度，大脑极高协调状态。', color: 'border-[#5A5A40]/20 hover:border-[#5A5A40]' },
];

const PRACTICAL_PRESETS: HearingTestPreset[] = [
  { label: '440 Hz (标准A调音标高)', frequency: 440, description: '乐器及声学界统一调音参考标准 A4' },
  { label: '1000 Hz (设备标准正弦基准音)', frequency: 1000, description: '工业音频设备调试与声响测试标准 1kHz' },
  { label: '8000 Hz (极细微高频率波)', frequency: 8000, description: '高频音频表现能力及耳机响应测试' },
  { label: '12000 Hz (听神经驱赶蚊虫实验)', frequency: 12000, description: '高阶超生频率模拟，声学避障测试' },
  { label: '15000 Hz (听力年龄自测 - 青年)', frequency: 15000, description: '检测随着年龄衰退的高频听觉阈值(通常&lt;30岁可见)' },
  { label: '18000 Hz (极限驱狗或未成年听力)', frequency: 18000, description: '普通音响还原物理极限，一般大于三十岁很难感知' },
];

export default function FrequencyGuides({
  onSolfeggioSelect,
  onBinauralSelect,
  onSingleSelect,
  currentFrequency
}: FrequencyGuidesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. Solfeggio Section */}
      <div className="flex flex-col gap-3 bg-white p-6 rounded-[28px] border border-[#e5e5df] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-sm uppercase font-serif tracking-wider text-[#4a4a3f] font-semibold flex items-center gap-1.5">
            ✨ 1. 索尔费乔古老疗愈频率 (Solfeggio Frequencies)
          </span>
          <span className="text-[10px] text-[#5A5A40] font-mono tracking-tighter shrink-0 bg-[#5A5A40]/10 border border-[#5A5A40]/20 px-2 py-0.5 rounded">
            自然量子谐振
          </span>
        </div>
        <p className="text-[11px] text-[#4a4a3f]/70 leading-relaxed -mt-1.5">
          在替代医学中，这些神圣频率被认为具有特定的生物净化、能量平衡、情感自愈以及身体频率调协作用。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {SOLFEGGIO_PRESETS.map((p) => {
            const isCurrent = Math.abs(currentFrequency - p.frequency) < 0.1;
            return (
              <button
                id={`solfeggio-${p.frequency}`}
                key={p.frequency}
                onClick={() => onSolfeggioSelect(p.frequency)}
                className={`group text-left px-3 py-2 rounded-lg border text-xs flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isCurrent 
                    ? 'bg-gradient-to-r ' + p.color + ' border-[#5A5A40] scale-[1.02] shadow-[0_2px_8px_rgba(90,90,64,0.1)] font-medium text-[#4a4a3f]' 
                    : 'bg-[#fafaf9] border-[#e5e5df] text-[#4a4a3f]/85 hover:bg-[#edebe4]/55 hover:border-[#c5c5be] hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`font-mono text-xs font-bold ${isCurrent ? 'text-[#5A5A40]' : 'text-[#4a4a3f] group-hover:text-[#5A5A40]'}`}>
                    {p.label}
                  </span>
                  <span className="text-[9px] opacity-70 border border-[#e5e5df] px-1 py-0.1 select-none rounded bg-[#edebe4]/50">
                    疗愈调
                  </span>
                </div>
                <span className="text-[10px] text-[#4a4a3f]/60 mt-1 line-clamp-1 group-hover:text-[#4a4a3f]/80">
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Binaural Beats & Practical Presets */}
      <div className="flex flex-col gap-6">
        
        {/* Brainwave Binaural Beats */}
        <div className="flex flex-col gap-3 bg-white p-6 rounded-[28px] border border-[#e5e5df] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm uppercase font-serif tracking-wider text-[#4a4a3f] font-semibold flex items-center gap-1.5">
              🧠 2. 脑波特定共振差频 (Binaural Beats)
            </span>
            <span className="text-[10px] text-[#5A5A40] font-mono tracking-tighter bg-[#edebe4] border border-[#e5e5df] px-2 py-0.5 rounded">
              立体声差频
            </span>
          </div>
          <p className="text-[11px] text-[#4a4a3f]/70 leading-relaxed -mt-1.5">
            双耳节拍是指当两只耳朵听到频率相差较小的音调（例如左耳 200 Hz，右耳 210 Hz）时，大脑会自动感知到一只存在干涉的、等同于双耳差值（10 Hz）的脑波波长差频。
          </p>

          <div className="flex flex-col gap-2 mt-1">
            {BRAINWAVE_PRESETS.map((p) => {
              return (
                <button
                  id={`brainwave-${p.beat}`}
                  key={p.range}
                  onClick={() => onBinauralSelect(p.carrier, p.beat)}
                  className={`group text-left p-2.5 rounded-lg border bg-[#fafaf9] border-[#e5e5df] text-[#4a4a3f]/85 hover:bg-[#edebe4]/50 hover:border-[#c5c5be] transition-all cursor-pointer flex flex-col gap-0.5`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs text-[#4a4a3f] group-hover:text-[#5A5A40] font-mono">
                      {p.range}
                    </span>
                    <span className="text-[9px] bg-[#edebe4] text-[#4a4a3f]/80 px-2 py-0.5 rounded font-mono">
                      基频: {p.carrier}Hz | 差频: +{p.beat}Hz
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#4a4a3f]/70 mt-1 font-normal group-hover:text-[#4a4a3f]/90">
                    {p.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Practical tests */}
        <div className="flex flex-col gap-3 bg-white p-6 rounded-[28px] border border-[#e5e5df] shadow-xs">
          <span className="text-sm uppercase font-serif tracking-wider text-[#4a4a3f] font-semibold">
            🔊 3. 声学实用波频与听力测试 (Acoustic Utilities)
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {PRACTICAL_PRESETS.map((p) => {
              const isCurrent = Math.abs(currentFrequency - p.frequency) < 0.1;
              return (
                <button
                  id={`practical-${p.frequency}`}
                  key={p.frequency}
                  onClick={() => onSingleSelect(p.frequency)}
                  className={`group text-left px-3 py-2 rounded-lg border text-xs flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#5A5A40] scale-[1.01]'
                      : 'bg-[#fafaf9] border-[#e5e5df] text-[#4a4a3f]/80 hover:bg-[#edebe4]/50 hover:border-[#c5c5be]'
                  }`}
                >
                  <span className={`font-mono text-[11px] font-semibold ${isCurrent ? 'text-[#5A5A40]' : 'text-[#4a4a3f] group-hover:text-[#5A5A40]'}`}>
                    {p.label}
                  </span>
                  <span className="text-[9.5px] text-[#4a4a3f]/60 mt-0.5 line-clamp-1 group-hover:text-[#4a4a3f]/80">
                    {p.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
