'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  delay?: number;
  interval?: number;
}

export interface ScreensaverState {
  isActive: boolean;
  nextIndex: number | null;
  registerInteraction: () => void;
}

export function useScreensaver(
  totalImages: number,
  currentIndex: number,
  { delay = 25000, interval = 6000 }: Options = {}
): ScreensaverState {
  const [isActive, setIsActive] = useState(false);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimers();
    if (totalImages <= 1) return;
    timeoutRef.current = setTimeout(() => {
      setIsActive(true);
    }, delay);
  }, [clearTimers, delay, totalImages]);

  const registerInteraction = useCallback(() => {
    setIsActive(false);
    setNextIndex(null);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => clearTimers();
  }, [startTimer, clearTimers]);

  useEffect(() => {
    if (!isActive || totalImages <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (totalImages <= 1) return;
      let candidate = currentIndex;
      let guard = 0;
      while (candidate === currentIndex && guard < 10) {
        candidate = Math.floor(Math.random() * totalImages);
        guard += 1;
      }
      setNextIndex(candidate);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentIndex, interval, isActive, totalImages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach((eventName) => {
      window.addEventListener(eventName, registerInteraction, { passive: true });
    });
    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, registerInteraction);
      });
    };
  }, [registerInteraction]);

  return { isActive, nextIndex, registerInteraction };
}
