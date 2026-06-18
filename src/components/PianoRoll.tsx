import React, { useEffect } from 'react';
import { NotePreset } from '../types';

interface PianoRollProps {
  onNoteSelect: (frequency: number, noteName: string) => void;
  activeFrequency: number;
  isPlaying: boolean;
}

const NOTES_DATA: NotePreset[] = [
  { note: 'C4', frequency: 261.63, isAccidental: false, keyboardKey: 'A' },
  { note: 'C#4', frequency: 277.18, isAccidental: true, keyboardKey: 'W' },
  { note: 'D4', frequency: 293.66, isAccidental: false, keyboardKey: 'S' },
  { note: 'D#4', frequency: 311.13, isAccidental: true, keyboardKey: 'E' },
  { note: 'E4', frequency: 329.63, isAccidental: false, keyboardKey: 'D' },
  { note: 'F4', frequency: 349.23, isAccidental: false, keyboardKey: 'F' },
  { note: 'F#4', frequency: 369.99, isAccidental: true, keyboardKey: 'T' },
  { note: 'G4', frequency: 392.00, isAccidental: false, keyboardKey: 'G' },
  { note: 'G#4', frequency: 415.30, isAccidental: true, keyboardKey: 'Y' },
  { note: 'A4', frequency: 440.00, isAccidental: false, keyboardKey: 'H' },
  { note: 'A#4', frequency: 466.16, isAccidental: true, keyboardKey: 'U' },
  { note: 'B4', frequency: 493.88, isAccidental: false, keyboardKey: 'J' },
  { note: 'C5', frequency: 523.25, isAccidental: false, keyboardKey: 'K' },
  { note: 'C#5', frequency: 554.37, isAccidental: true, keyboardKey: 'O' },
  { note: 'D5', frequency: 587.33, isAccidental: false, keyboardKey: 'L' },
  { note: 'D#5', frequency: 622.25, isAccidental: true, keyboardKey: 'P' },
  { note: 'E5', frequency: 659.25, isAccidental: false, keyboardKey: ';' },
  { note: 'F5', frequency: 698.46, isAccidental: false },
  { note: 'F#5', frequency: 739.99, isAccidental: true },
  { note: 'G5', frequency: 783.99, isAccidental: false },
  { note: 'G#5', frequency: 830.61, isAccidental: true },
  { note: 'A5', frequency: 880.00, isAccidental: false },
  { note: 'A#5', frequency: 932.33, isAccidental: true },
  { note: 'B5', frequency: 987.77, isAccidental: false }
];

export default function PianoRoll({ onNoteSelect, activeFrequency, isPlaying }: PianoRollProps) {
  
  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const keyChar = e.key.toUpperCase();
      const matchedNote = NOTES_DATA.find(n => n.keyboardKey === keyChar);
      
      if (matchedNote) {
        onNoteSelect(matchedNote.frequency, matchedNote.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNoteSelect]);

  // We find active status by matching frequency within ±0.2 Hz tolerance for rounding
  const isFreqActive = (freq: number) => {
    return isPlaying && Math.abs(activeFrequency - freq) < 0.2;
  };

  // Group notes into pairs of white keys, and absolute positioned black keys to render a realistic piano
  const whiteKeys = NOTES_DATA.filter(n => !n.isAccidental);

  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs uppercase font-serif tracking-wider text-[#4a4a3f] font-semibold">
          🎹 钢琴键盘音高快捷区 (C4 - B5)
        </span>
        <span className="text-[10px] bg-[#edebe4] text-[#4a4a3f]/85 font-mono scale-95 border border-[#e5e5df] px-2 py-0.5 rounded-full">
          支持电脑键盘 A-S-D-F 弹奏
        </span>
      </div>

      {/* The Piano Container raises black keys smoothly with relative/absolute styling */}
      <div id="piano-roll-keyboard" className="relative select-none flex h-28 md:h-36 w-full rounded-[24px] bg-[#edebe4] border border-[#e5e5df] shadow-xs overflow-hidden p-1.5 pb-2">
        {/* We draw the white keys first */}
        <div className="flex w-full h-full relative z-0 gap-1">
          {whiteKeys.map((item, idx) => {
            const isActive = isFreqActive(item.frequency);
            return (
              <button
                id={`piano-key-${item.note}`}
                key={item.note}
                onClick={() => onNoteSelect(item.frequency, item.note)}
                className={`flex-1 flex flex-col justify-end items-center pb-2.5 rounded-md transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-t from-[#5A5A40] via-[#7A7A5A] to-white text-white border-b-4 border-[#3D3D2B] scale-[0.98]'
                    : 'bg-gradient-to-b from-[#fafaf9] to-white text-[#4a4a3f] hover:from-white hover:to-[#fafaf9] border-b-2 border-[#e5e5df] active:scale-[0.98]'
                }`}
                style={{
                  boxShadow: isActive ? '0 0 10px rgba(90, 90, 64, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              >
                <span className="font-semibold text-[10px] md:text-xs pointer-events-none truncate select-none">
                  {item.note}
                </span>
                {item.keyboardKey && (
                  <span className={`text-[8px] md:text-[9px] font-mono select-none px-1 py-0.5 rounded pointer-events-none ${isActive ? 'bg-[#5A5A40]/30 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {item.keyboardKey}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Absolute overlay of black keys positioned at correct offsets */}
        <div className="absolute top-1.5 left-1.5 right-1.5 h-[62%] pointer-events-none z-10 flex">
          {NOTES_DATA.map((item, index) => {
            if (!item.isAccidental) return null;

            let leftPercent = 0;
            switch (item.note) {
              case 'C#4': leftPercent = (1 / 14) * 100 - 2.5; break;
              case 'D#4': leftPercent = (2 / 14) * 100 - 2.5; break;
              case 'F#4': leftPercent = (4 / 14) * 100 - 2.5; break;
              case 'G#4': leftPercent = (5 / 14) * 100 - 2.5; break;
              case 'A#4': leftPercent = (6 / 14) * 100 - 2.5; break;
              case 'C#5': leftPercent = (8 / 14) * 100 - 2.5; break;
              case 'D#5': leftPercent = (9 / 14) * 100 - 2.5; break;
              case 'F#5': leftPercent = (11 / 14) * 100 - 2.5; break;
              case 'G#5': leftPercent = (12 / 14) * 100 - 2.5; break;
              case 'A#5': leftPercent = (13 / 14) * 100 - 2.5; break;
            }

            const isActive = isFreqActive(item.frequency);

            return (
              <button
                id={`piano-black-key-${item.note}`}
                key={item.note}
                onClick={() => onNoteSelect(item.frequency, item.note)}
                className={`absolute w-[4.8%] h-full rounded-b pointer-events-auto transition-all ${
                  isActive
                    ? 'bg-[#7A7A5A] scale-[0.98] border-b-2 border-[#3D3D2B]'
                    : 'bg-[#2E2E20] hover:bg-[#3D3D2B] border-b-4 border-[#1E1E15] active:scale-[0.98]'
                }`}
                style={{
                  left: `${leftPercent}%`,
                  boxShadow: isActive ? '0 0 8px rgba(90, 90, 64, 0.4)' : '0 2px 4px rgba(0,0,0,0.15)',
                }}
              >
                <div className="h-full flex flex-col justify-end items-center pb-2 text-[8px] md:text-[9.5px] font-semibold text-slate-350 pointer-events-none select-none">
                  <span className="truncate max-w-full">{item.note}</span>
                  {item.keyboardKey && (
                    <span className="opacity-50 text-[7px] pointer-events-none">{item.keyboardKey}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
