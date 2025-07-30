"use client";

import { useState, useEffect, useCallback } from 'react';

export interface UseCountdownOptions {
  initialTime: number; // in seconds
  onComplete?: () => void;
  autoStart?: boolean;
}

export const useCountdown = ({ 
  initialTime, 
  onComplete, 
  autoStart = true 
}: UseCountdownOptions) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  const start = useCallback(() => {
    setIsActive(true);
    setIsCompleted(false);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setTimeLeft(newTime ?? initialTime);
    setIsActive(false);
    setIsCompleted(false);
  }, [initialTime]);

  const restart = useCallback((newTime?: number) => {
    reset(newTime);
    setIsActive(true);
  }, [reset]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const formatTimeVerbose = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }, []);

  return {
    timeLeft,
    isActive,
    isCompleted,
    start,
    pause,
    reset,
    restart,
    formatTime: formatTime(timeLeft),
    formatTimeVerbose: formatTimeVerbose(timeLeft),
    percentage: ((initialTime - timeLeft) / initialTime) * 100
  };
};