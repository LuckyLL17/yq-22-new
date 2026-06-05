import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, MapPin, AlertCircle, CheckCircle, Heart, Ban } from 'lucide-react';
import { MatchResult, SPICY_LABELS } from '@/types';
import { MatchScore } from './MatchScore';
import { useStore } from '@/store/useStore';

interface RestaurantCardProps {
  result: MatchResult;
  index: number;
}

export function RestaurantCard({ result, index }: RestaurantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { restaurant, matchScore, satisfiedPeople, dissatisfiedPeople } = result;
  const { isFavorite, isBlacklisted, toggleFavorite, toggleBlacklist } = useStore();
  const favorited = isFavorite(restaurant.id);
  const blacklisted = isBlacklisted(restaurant.id);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(restaurant.id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
            title={favorited ? '取消收藏' : '收藏'}
          >
            <Heart size={18} className={favorited ? 'fill-current' : ''} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBlacklist(restaurant.id);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${
              blacklisted
                ? 'bg-gray-800 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
            title={blacklisted ? '取消拉黑' : '拉黑'}
          >
            <Ban size={18} />
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <MatchScore score={matchScore} size="lg" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="font-display font-bold text-xl text-white">{restaurant.name}</h3>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {restaurant.rating}
            </span>
            <span>•</span>
            <span>{restaurant.cuisine}</span>
            <span>•</span>
            <span>{SPICY_LABELS[restaurant.spicyLevel]}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin size={14} />
          <span>{restaurant.address}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="tag bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        {dissatisfiedPeople.length > 0 && (
          <div className="bg-red-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
              <AlertCircle size={18} />
              <span>注意：{dissatisfiedPeople.length} 人可能不满意</span>
            </div>
            <div className="space-y-2">
              {dissatisfiedPeople.slice(0, isExpanded ? undefined : 2).map((person) => (
                <div key={person.personId} className="text-sm text-red-700">
                  <span className="font-medium">{person.personName}：</span>
                  <span>{person.reasons.join('、')}</span>
                </div>
              ))}
              {dissatisfiedPeople.length > 2 && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  查看全部 {dissatisfiedPeople.length} 条
                </button>
              )}
            </div>
          </div>
        )}

        {satisfiedPeople.length > 0 && (
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
              <CheckCircle size={18} />
              <span>{satisfiedPeople.length} 人满意</span>
            </div>
            <div className="text-sm text-green-700">
              {satisfiedPeople.join('、')}
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={18} />
              收起详情
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              查看详情
            </>
          )}
        </button>

        {isExpanded && (
          <div className="pt-4 border-t border-gray-100 animate-fade-in-up">
            <h4 className="font-medium text-gray-700 mb-2">餐厅常用食材</h4>
            <div className="flex flex-wrap gap-2">
              {restaurant.ingredients.map((ing) => (
                <span key={ing} className="tag bg-orange-50 text-orange-600">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
