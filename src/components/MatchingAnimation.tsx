import { MATCH_STEPS, MatchStep } from '@/types';
import { useStore } from '@/store/useStore';
import { Check, Loader2 } from 'lucide-react';

interface MatchingAnimationProps {
  compact?: boolean;
}

export function MatchingAnimation({ compact = false }: MatchingAnimationProps) {
  const { currentMatchStep, people } = useStore();
  
  const currentIndex = MATCH_STEPS.findIndex(s => s.key === currentMatchStep);
  
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
          {MATCH_STEPS[currentIndex]?.icon || '✨'}
        </div>
        <div>
          <p className="font-medium text-gray-800">
            {MATCH_STEPS[currentIndex]?.label || '匹配中...'}
          </p>
          <p className="text-sm text-gray-500">
            {MATCH_STEPS[currentIndex]?.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center mb-8 animate-pulse shadow-lg shadow-primary-500/30">
        <span className="text-5xl">
          {MATCH_STEPS[currentIndex]?.icon || '✨'}
        </span>
      </div>
      
      <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">
        {MATCH_STEPS[currentIndex]?.label || '正在匹配'}
      </h2>
      <p className="text-gray-500 mb-8 text-center">
        {MATCH_STEPS[currentIndex]?.description || '请稍候...'}
      </p>
      
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">分析进度</span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round(((currentIndex + 1) / MATCH_STEPS.length) * 100)}%
          </span>
        </div>
        
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / MATCH_STEPS.length) * 100}%` }}
          />
        </div>
        
        <div className="space-y-3">
          {MATCH_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div 
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-primary-50 border border-primary-200' 
                    : isCompleted 
                    ? 'bg-green-50' 
                    : 'bg-gray-50 opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <Check size={16} />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{step.icon}</span>
                    <span className={`font-medium ${
                      isCurrent ? 'text-primary-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    isCurrent ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
        <span>正在分析</span>
        <span className="font-medium text-gray-600">{people.length}</span>
        <span>人的口味偏好</span>
      </div>
    </div>
  );
}
