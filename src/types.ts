export type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'white-noise' | 'pink-noise' | 'brown-noise';

export type GeneratorMode = 'single' | 'binaural' | 'sweep';

export interface SolfeggioPreset {
  frequency: number;
  label: string;
  description: string;
  color: string;
}

export interface BrainwavePreset {
  range: string;
  label: string;
  carrier: number;
  beat: number;
  description: string;
  color: string;
}

export interface HearingTestPreset {
  label: string;
  frequency: number;
  description: string;
}

export interface NotePreset {
  note: string;
  frequency: number;
  isAccidental: boolean;
  keyboardKey?: string;
}
