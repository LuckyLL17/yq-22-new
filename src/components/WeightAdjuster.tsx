import { useState } from 'react';
import { Settings, RotateCcw, Flame, Ban, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { WeightConfig, WEIGHT_LABELS, DEFAULT_WEIGHTS } from '@/types';

const WEIGHT_RANGES: Record<keyof WeightConfig, { min: number; max: number; step: number }> = {
  spicyPenalty: { min: 5, max: 50, step: 5 },
  dislikePenalty: { min: 5, max: 40, step: 5 },
  favoriteBonus: { min: 0, max: 30, step: 5 },
};

const WEIGHT_COLORS: Record<keyof WeightConfig, string> = {
  spicyPenalty: 'from-orange-400 to-red-500',
  dislikePenalty: 'from-red-400 to-rose-500',
  favoriteBonus: 'from-pink-400 to-rose-400',
};

const WEIGHT_ICONS: Record<keyof WeightConfig, typeof Flame> = {
  spicyPenalty: Flame,
  dislikePenalty: Ban,
  favoriteBonus: Heart,
};

export function WeightAdjuster() {
  const [isOpen, setIsOpen] = useState(false);
  const { weights, updateWeight, resetWeights } = useStore();

  const weightKeys = Object.keys(weights) as (keyof WeightConfig)[];

  const getPercentage = (key: keyof WeightConfig, value: number) => {
    const { min, max } = WEIGHT_RANGES[key];
    return ((value - min) / (max - min)) * 100;
  };

  const isDefault = weightKeys.every((key) => weights[key] === DEFAULT_WEIGHTS[key]);

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden animate-fade-in-up">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Settings size={20} className="text-primary-600" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-semibold text-gray-800">匹配权重设置</h3>
            <p className="text-sm text-gray-500">
              {isDefault ? '使用默认权重' : '已自定义权重'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetWeights();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              重置
            </button>
          )}
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-6 border-t border-gray-100 pt-4">
          {weightKeys.map((key) => {
            const Icon = WEIGHT_ICONS[key];
            const { label, description } = WEIGHT_LABELS[key];
            const { min, max, step } = WEIGHT_RANGES[key];
            const value = weights[key];
            const percentage = getPercentage(key, value);

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className="text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">{label}</span>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                    {value} 分
                  </span>
                </div>

                <div className="relative">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${WEIGHT_COLORS[key]} rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => updateWeight(key, parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>{min}</span>
                  <span className="text-gray-500 font-medium">
                    默认: {DEFAULT_WEIGHTS[key]}
                  </span>
                  <span>{max}</span>
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">权重影响预览</h4>
            <div className="grid grid-cols-3 gap-2">
              {weightKeys.map((key) => {
                const { label } = WEIGHT_LABELS[key];
                const percentage = getPercentage(key, weights[key]);
                const defaultPercentage = getPercentage(key, DEFAULT_WEIGHTS[key]);
                const diff = percentage - defaultPercentage;

                return (
                  <div
                    key={key}
                    className="p-3 bg-gray-50 rounded-xl text-center"
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {label.replace('惩罚', '').replace('加成', '')}
                    </div>
                    <div className="font-bold text-lg text-gray-800">
                      {weights[key]}
                    </div>
                    {diff !== 0 && (
                      <div
                        className={`text-xs ${
                          diff > 0 ? 'text-green-500' : 'text-orange-500'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}
                        {diff > 0 ? '更高' : '更低'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
