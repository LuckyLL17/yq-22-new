interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MatchScore({ score, size = 'md', showLabel = true }: MatchScoreProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRingColor = () => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getRingColor()} p-1`}
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold">
          <span className={getScoreColor()}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 mt-1">匹配度</span>
      )}
    </div>
  );
}
