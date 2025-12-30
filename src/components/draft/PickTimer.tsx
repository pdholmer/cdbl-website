import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatTimeRemaining, getTimerStatus } from "@/utils/draftUtils";

interface PickTimerProps {
  timeLimit: number; // in seconds
  isMyTurn: boolean;
  isPaused: boolean;
  onTimeExpired?: () => void;
  pickStartTime?: Date;
}

export const PickTimer = ({
  timeLimit,
  isMyTurn,
  isPaused,
  onTimeExpired,
  pickStartTime
}: PickTimerProps) => {
  const [remainingTime, setRemainingTime] = useState(timeLimit);

  const calculateRemainingTime = useCallback(() => {
    if (!pickStartTime) return timeLimit;
    const elapsed = Math.floor((Date.now() - pickStartTime.getTime()) / 1000);
    return Math.max(0, timeLimit - elapsed);
  }, [pickStartTime, timeLimit]);

  useEffect(() => {
    setRemainingTime(calculateRemainingTime());
  }, [pickStartTime, calculateRemainingTime]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeExpired?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTimeExpired]);

  const status = getTimerStatus(remainingTime, timeLimit);
  const progressPercent = (remainingTime / timeLimit) * 100;

  const statusColors = {
    normal: {
      bg: 'bg-green-500',
      text: 'text-green-700',
      ring: 'ring-green-500/30'
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-700',
      ring: 'ring-yellow-500/30'
    },
    critical: {
      bg: 'bg-red-500',
      text: 'text-red-700',
      ring: 'ring-red-500/30'
    }
  };

  const colors = statusColors[status];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300",
        isMyTurn && status === 'critical' && "animate-pulse",
        isMyTurn ? "ring-4 " + colors.ring : "ring-1 ring-border"
      )}
    >
      {/* Circular progress indicator */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
            className={cn(
              "transition-all duration-1000",
              colors.text
            )}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "text-2xl font-bold tabular-nums",
            colors.text
          )}>
            {formatTimeRemaining(remainingTime)}
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-2 text-sm text-muted-foreground">
        {isPaused ? (
          <span className="text-yellow-600">Draft Paused</span>
        ) : isMyTurn ? (
          <span className={cn("font-semibold", colors.text)}>Your Pick!</span>
        ) : (
          <span>Waiting...</span>
        )}
      </div>
    </div>
  );
};
