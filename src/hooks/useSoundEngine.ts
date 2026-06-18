import { useState, useEffect, useRef, useCallback } from 'react';
import { WaveType, GeneratorMode } from '../types';

export default function useSoundEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<GeneratorMode>('single');
  const [frequency, setFrequency] = useState<number>(440); // Single oscillator frequency
  const [waveType, setWaveType] = useState<WaveType>('sine');
  const [volume, setVolume] = useState<number>(0.5); // Range 0-1
  
  // Binaural settings
  const [carrierFreq, setCarrierFreq] = useState<number>(200);
  const [beatFreq, setBeatFreq] = useState<number>(10); // yields 210Hz on right, 200Hz on left (10Hz delta)
  
  // Sweep settings
  const [sweepStart, setSweepStart] = useState<number>(100);
  const [sweepEnd, setSweepEnd] = useState<number>(12000);
  const [sweepDuration, setSweepDuration] = useState<number>(10); // seconds
  const [sweepProgress, setSweepProgress] = useState<number>(0); // 0 to 100
  const [sweepType, setSweepType] = useState<'linear' | 'exponential'>('exponential');

  // Web Audio Context Objects held in Refs to persist over re-renders
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Oscillator Refs (Single Mode / Sweep Mode)
  const oscRef = useRef<OscillatorNode | null>(null);
  
  // Binaural Oscillator Refs
  const binLeftOscRef = useRef<OscillatorNode | null>(null);
  const binRightOscRef = useRef<OscillatorNode | null>(null);
  const binLeftGainRef = useRef<GainNode | null>(null);
  const binRightGainRef = useRef<GainNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);

  // Noise source Ref
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Sweep animation frame/timer
  const sweepIntervalRef = useRef<number | null>(null);
  const sweepStartTimeRef = useRef<number | null>(null);

  // Initialize Audio Context lazily on user interaction
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;

    // Create the audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Create central master masterGain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGainRef.current = masterGain;

    // Create shared analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024; // clean resolution for sound visualizer
    analyserRef.current = analyser;

    // Connect flow: Master -> Analyser -> Speakers
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    return ctx;
  }, [volume]);

  // Handle live volume change smoothly to avoid clicking noises
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.01);
    }
  }, [volume]);

  // Fully stop all current oscillators and noise generators
  const stopAllSources = useCallback(() => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch (e) {}
      oscRef.current.disconnect();
      oscRef.current = null;
    }

    if (binLeftOscRef.current) {
      try { binLeftOscRef.current.stop(); } catch (e) {}
      binLeftOscRef.current.disconnect();
      binLeftOscRef.current = null;
    }

    if (binRightOscRef.current) {
      try { binRightOscRef.current.stop(); } catch (e) {}
      binRightOscRef.current.disconnect();
      binRightOscRef.current = null;
    }

    if (binLeftGainRef.current) {
      binLeftGainRef.current.disconnect();
      binLeftGainRef.current = null;
    }

    if (binRightGainRef.current) {
      binRightGainRef.current.disconnect();
      binRightGainRef.current = null;
    }

    if (mergerRef.current) {
      mergerRef.current.disconnect();
      mergerRef.current = null;
    }

    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch (e) {}
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }

    if (sweepIntervalRef.current) {
      clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }

    setIsPlaying(false);
    setSweepProgress(0);
  }, []);

  // Play White/Pink/Brown noise buffers
  const playNoiseBuffer = useCallback((ctx: AudioContext, type: 'white-noise' | 'pink-noise' | 'brown-noise') => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds loops cleanly
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0; // used for pink or brown filtering

    if (type === 'white-noise') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2.0 - 1.0;
      }
    } else if (type === 'pink-noise') {
      // Pink Noise approximation filter (Paul Kellet's refined method)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2.0 - 1.0;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // normalise scale
        b6 = white * 0.115926;
      }
    } else if (type === 'brown-noise') {
      // Brown Noise: Brown noise has spectral density inversely proportional to square of frequency
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2.0 - 1.0;
        output[i] = (lastOut + (0.02 * white)) / 1.002;
        lastOut = output[i];
        output[i] *= 3.5; // normalise volume
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    if (masterGainRef.current) {
      source.connect(masterGainRef.current);
    }

    source.start(0);
    noiseSourceRef.current = source;
  }, []);

  // Update dynamic pitch in continuous single oscillator mode
  useEffect(() => {
    if (isPlaying && mode === 'single' && oscRef.current && audioCtxRef.current) {
      // Smooth set frequency to avoid pops
      oscRef.current.frequency.setTargetAtTime(frequency, audioCtxRef.current.currentTime, 0.02);
    }
  }, [frequency, isPlaying, mode]);

  // Update oscillator waveform selection dynamically
  useEffect(() => {
    if (isPlaying && mode === 'single' && oscRef.current) {
      if (waveType === 'sine' || waveType === 'square' || waveType === 'triangle' || waveType === 'sawtooth') {
        oscRef.current.type = waveType;
      } else {
        // Wave changed to active noise: need to reconstruct
        // Handled cleanly by resetting audio playing type
        stopAllSources();
        // restart with noise
        setTimeout(() => startAudio(), 50);
      }
    }
  }, [waveType]);

  // Update Binaural frequencies dynamically
  useEffect(() => {
    if (isPlaying && mode === 'binaural' && binLeftOscRef.current && binRightOscRef.current && audioCtxRef.current) {
      binLeftOscRef.current.frequency.setTargetAtTime(carrierFreq, audioCtxRef.current.currentTime, 0.02);
      binRightOscRef.current.frequency.setTargetAtTime(carrierFreq + beatFreq, audioCtxRef.current.currentTime, 0.02);
    }
  }, [carrierFreq, beatFreq, isPlaying, mode]);

  // Main playback starter
  const startAudio = useCallback(() => {
    try {
      const ctx = initAudio();
      
      // Ensure audio context is running (overcomes browser autoplay blocks)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAllSources();

      if (mode === 'single') {
        if (waveType === 'sine' || waveType === 'square' || waveType === 'triangle' || waveType === 'sawtooth') {
          // Construct Single Oscillator
          const osc = ctx.createOscillator();
          osc.type = waveType;
          osc.frequency.setValueAtTime(frequency, ctx.currentTime);
          
          if (masterGainRef.current) {
            osc.connect(masterGainRef.current);
          }
          
          osc.start();
          oscRef.current = osc;
        } else {
          // Noise Playback
          playNoiseBuffer(ctx, waveType);
        }
      } 
      
      else if (mode === 'binaural') {
        // Binaural Beats requires separate Channel Layout
        // Left goes to Left Channel of speakers, Right goes to Right Channel
        const leftOsc = ctx.createOscillator();
        leftOsc.type = 'sine'; // Binaural is best and standard with pure sine waves
        leftOsc.frequency.setValueAtTime(carrierFreq, ctx.currentTime);

        const rightOsc = ctx.createOscillator();
        rightOsc.type = 'sine';
        rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq, ctx.currentTime);

        const leftGain = ctx.createGain();
        const rightGain = ctx.createGain();

        // Standardise independent levels
        leftGain.gain.setValueAtTime(1.0, ctx.currentTime);
        rightGain.gain.setValueAtTime(1.0, ctx.currentTime);

        // Merger combines two mono signals into active stereo streams
        const merger = ctx.createChannelMerger(2);

        // Connect channels
        leftOsc.connect(leftGain);
        rightOsc.connect(rightGain);

        leftGain.connect(merger, 0, 0); // inputs Left to channel index 0 of merger
        rightGain.connect(merger, 0, 1); // inputs Right to channel index 1 of merger

        if (masterGainRef.current) {
          merger.connect(masterGainRef.current);
        }

        leftOsc.start();
        rightOsc.start();

        binLeftOscRef.current = leftOsc;
        binRightOscRef.current = rightOsc;
        binLeftGainRef.current = leftGain;
        binRightGainRef.current = rightGain;
        mergerRef.current = merger;
      } 
      
      else if (mode === 'sweep') {
        // Frequency Sweep Mode
        const osc = ctx.createOscillator();
        // Sweeps must be continuous waveforms (typically sine)
        osc.type = waveType === 'sine' || waveType === 'square' || waveType === 'triangle' || waveType === 'sawtooth' ? waveType : 'sine';
        
        const startTime = ctx.currentTime;
        const endTime = startTime + sweepDuration;

        osc.frequency.setValueAtTime(sweepStart, startTime);
        
        if (sweepType === 'exponential') {
          // Guard values to make sure they are non-zero for calculations
          const s = sweepStart <= 0 ? 0.1 : sweepStart;
          const e = sweepEnd <= 0 ? 0.1 : sweepEnd;
          osc.frequency.setValueAtTime(s, startTime);
          osc.frequency.exponentialRampToValueAtTime(e, endTime);
        } else {
          osc.frequency.linearRampToValueAtTime(sweepEnd, endTime);
        }

        if (masterGainRef.current) {
          osc.connect(masterGainRef.current);
        }

        osc.start(startTime);
        oscRef.current = osc;

        // Auto stop after duration expires
        osc.onended = () => {
          stopAllSources();
        };

        // Track live sweep frequency for UI display and progress updating
        sweepStartTimeRef.current = Date.now();
        const tickRate = 50; // every 50ms
        
        sweepIntervalRef.current = window.setInterval(() => {
          if (!sweepStartTimeRef.current) return;
          const elapsed = (Date.now() - sweepStartTimeRef.current) / 1000;
          const ratio = Math.min(elapsed / sweepDuration, 1.0);
          
          setSweepProgress(ratio * 100);

          // Calculate approximate current frequency for drawing
          let currentF = sweepStart;
          if (sweepType === 'exponential') {
            const s = sweepStart <= 0 ? 1 : sweepStart;
            const e = sweepEnd <= 0 ? 1 : sweepEnd;
            currentF = s * Math.pow(e / s, ratio);
          } else {
            currentF = sweepStart + (sweepEnd - sweepStart) * ratio;
          }
          setFrequency(Math.round(currentF));

          if (ratio >= 1.0) {
            stopAllSources();
          }
        }, tickRate);
      }

      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to start audio generator:', err);
    }
  }, [initAudio, mode, frequency, waveType, carrierFreq, beatFreq, sweepStart, sweepEnd, sweepDuration, sweepType, stopAllSources, playNoiseBuffer]);

  // Automatic clean up on component deep unmount
  useEffect(() => {
    return () => {
      stopAllSources();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopAllSources]);

  return {
    isPlaying,
    mode,
    setMode,
    frequency,
    setFrequency,
    waveType,
    setWaveType,
    volume,
    setVolume,
    
    // Binaural parameters
    carrierFreq,
    setCarrierFreq,
    beatFreq,
    setBeatFreq,
    
    // Sweep parameters
    sweepStart,
    setSweepStart,
    sweepEnd,
    setSweepEnd,
    sweepDuration,
    setSweepDuration,
    sweepProgress,
    sweepType,
    setSweepType,

    // Web audio analyser pass through
    analyserNode: analyserRef.current,

    // Actions
    play: startAudio,
    stop: stopAllSources,
  };
}
