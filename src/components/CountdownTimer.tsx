import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetTime: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(targetTime: number): TimeLeft {
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

export function CountdownTimer({ targetTime, size = 'md', showLabel = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetTime));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetTime));
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  const boxClasses = {
    sm: 'px-2 py-1 rounded',
    md: 'px-3 py-2 rounded-lg',
    lg: 'px-4 py-3 rounded-xl',
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  if (timeLeft.isPast) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${sizeClasses[size]}`}>
        <Clock size={iconSize[size]} />
        <span>聚餐已开始</span>
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 2;

  return (
    <div className="flex flex-col gap-2">
      {showLabel && (
        <div className={`flex items-center gap-2 ${isUrgent ? 'text-orange-600' : 'text-gray-600'} ${sizeClasses[size]}`}>
          <Clock size={iconSize[size]} />
          <span className="font-medium">距离聚餐还有</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <div className={`flex flex-col items-center ${boxClasses[size]} ${isUrgent ? 'bg-orange-100' : 'bg-primary-100'}`}>
            <span className={`font-bold ${sizeClasses[size]} ${isUrgent ? 'text-orange-700' : 'text-primary-700'}`}>
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-500">天</span>
          </div>
        )}
        <div className={`flex flex-col items-center ${boxClasses[size]} ${isUrgent ? 'bg-orange-100' : 'bg-primary-100'}`}>
          <span className={`font-bold font-mono ${sizeClasses[size]} ${isUrgent ? 'text-orange-700' : 'text-primary-700'}`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500">时</span>
        </div>
        <span className={`font-bold ${sizeClasses[size]} ${isUrgent ? 'text-orange-400' : 'text-primary-400'}`}>:</span>
        <div className={`flex flex-col items-center ${boxClasses[size]} ${isUrgent ? 'bg-orange-100' : 'bg-primary-100'}`}>
          <span className={`font-bold font-mono ${sizeClasses[size]} ${isUrgent ? 'text-orange-700' : 'text-primary-700'}`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500">分</span>
        </div>
        <span className={`font-bold ${sizeClasses[size]} ${isUrgent ? 'text-orange-400' : 'text-primary-400'}`}>:</span>
        <div className={`flex flex-col items-center ${boxClasses[size]} ${isUrgent ? 'bg-orange-100 animate-pulse' : 'bg-primary-100'}`}>
          <span className={`font-bold font-mono ${sizeClasses[size]} ${isUrgent ? 'text-orange-700' : 'text-primary-700'}`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500">秒</span>
        </div>
      </div>
    </div>
  );
}
