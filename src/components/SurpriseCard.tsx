import { useState, useEffect } from 'react';
import { Star, MapPin, DollarSign, ChefHat, Sparkles } from 'lucide-react';
import { Restaurant, SPICY_LABELS, PRICE_LABELS } from '@/types';

interface SurpriseCardProps {
  restaurant: Restaurant | null;
  isFlipped: boolean;
  onClick?: () => void;
  isAnimating?: boolean;
}

export function SurpriseCard({ restaurant, isFlipped, onClick, isAnimating }: SurpriseCardProps) {
  const [showFront, setShowFront] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      const timer = setTimeout(() => setShowFront(true), 400);
      return () => clearTimeout(timer);
    } else {
      setShowFront(false);
    }
  }, [isFlipped]);

  return (
    <div
      className={`perspective-1000 w-full max-w-sm mx-auto cursor-pointer ${
        isAnimating ? 'pointer-events-none' : ''
      }`}
      onClick={onClick}
    >
      <div
        className={`relative w-full aspect-[3/4] transform-style-3d transition-transform duration-500 ${
          isFlipped ? 'animate-flip-card' : ''
        }`}
      >
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full rounded-3xl bg-gradient-to-br from-primary-500 via-orange-500 to-yellow-500 p-1">
            <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-primary-600 to-orange-600 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-8 left-8 text-6xl">✨</div>
                <div className="absolute top-20 right-12 text-4xl">🎯</div>
                <div className="absolute bottom-24 left-12 text-5xl">🍽️</div>
                <div className="absolute bottom-8 right-8 text-6xl">🎉</div>
                <div className="absolute top-1/2 left-4 text-3xl">⭐</div>
                <div className="absolute top-1/3 right-6 text-4xl">🌟</div>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 animate-pulse">
                  <ChefHat size={48} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  随机惊喜
                </h3>
                <p className="text-white/80 text-sm mb-6">
                  点击抽取今日餐厅
                </p>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <Sparkles size={14} />
                  <span>每日三次机会</span>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-white/40"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 backface-hidden rotate-y-180">
          {restaurant && showFront && (
            <div className="w-full h-full rounded-3xl bg-white card-shadow overflow-hidden animate-celebrate">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    今日推荐
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display font-bold text-xl text-white mb-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <span>{restaurant.cuisine}</span>
                    <span>•</span>
                    <span>{SPICY_LABELS[restaurant.spicyLevel]}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-800">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <DollarSign size={16} className="text-orange-500" />
                    <span>{PRICE_LABELS[restaurant.priceLevel]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin size={16} className="text-blue-500" />
                    <span>{restaurant.distance}km</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
                  <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{restaurant.address}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">招牌菜品</h4>
                  <div className="space-y-2">
                    {restaurant.dishes.slice(0, 2).map((dish, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {dish.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {dish.description}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-orange-500">
                          {dish.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
