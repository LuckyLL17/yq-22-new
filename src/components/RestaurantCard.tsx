import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  AlertCircle,
  CheckCircle,
  Heart,
  Ban,
  DollarSign,
  Users,
  UtensilsCrossed,
  Sparkles,
  ArrowRightLeft,
  Clock,
} from 'lucide-react';
import { MatchResult, SPICY_LABELS, PRICE_LABELS, Restaurant } from '@/types';
import { MatchScore } from './MatchScore';
import { useStore } from '@/store/useStore';
import { RESTAURANTS } from '@/data/restaurants';

interface RestaurantCardProps {
  result: MatchResult;
  index: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function PersonScoreItem({ personScore }: { personScore: MatchResult['personScores'][0] }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        personScore.isSatisfied
          ? 'bg-green-50 border-green-100'
          : 'bg-red-50 border-red-100'
      }`}
    >
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <img
          src={personScore.personAvatar}
          alt={personScore.personName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-800">{personScore.personName}</span>
            <span className={`font-bold text-lg ${getScoreColor(personScore.totalScore)}`}>
              {personScore.totalScore}分
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(
                personScore.totalScore
              )}`}
              style={{ width: `${personScore.totalScore}%` }}
            />
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
        />
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3 animate-fade-in-up">
          {personScore.details.map((detail, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {detail.isPenalty ? (
                  <span className="text-red-500">-</span>
                ) : (
                  <span className="text-green-500">+</span>
                )}
                <span className="text-gray-600">{detail.category}</span>
              </div>
              <span
                className={`font-medium ${
                  detail.isPenalty ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {detail.isPenalty ? '' : '+'}
                {detail.score !== 0 ? detail.score : detail.maxScore > 0 ? `+${detail.maxScore}` : '0'}
              </span>
            </div>
          ))}

          {personScore.reasons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <p className="text-xs text-gray-500 mb-2">扣分说明：</p>
              <div className="space-y-1">
                {personScore.reasons.map((reason, idx) => (
                  <p key={idx} className="text-xs text-red-600 flex items-start gap-1">
                    <span>•</span>
                    <span>{reason}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniRestaurantCard({ restaurant, onClick }: { restaurant: Restaurant; onClick?: () => void }) {
  const { isFavorite, isBlacklisted, toggleFavorite, toggleBlacklist } = useStore();
  const favorited = isFavorite(restaurant.id);
  const blacklisted = isBlacklisted(restaurant.id);

  return (
    <div
      className="flex-shrink-0 w-40 rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-28 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(restaurant.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Heart size={12} className={favorited ? 'fill-current' : ''} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBlacklist(restaurant.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-sm transition-all ${
              blacklisted
                ? 'bg-gray-800 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <Ban size={12} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-medium text-gray-800 text-sm truncate">{restaurant.name}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-0.5">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            {restaurant.rating}
          </span>
          <span>•</span>
          <span>{PRICE_LABELS[restaurant.priceLevel]}</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
          <MapPin size={10} />
          <span>{restaurant.distance}km</span>
        </div>
      </div>
    </div>
  );
}

function DishCard({ dish }: { dish: Restaurant['dishes'][0] }) {
  return (
    <div className="flex-shrink-0 w-36 rounded-xl overflow-hidden bg-white border border-gray-100">
      <div className="relative h-32 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
          {dish.price}
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-medium text-gray-800 text-sm truncate">{dish.name}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{dish.description}</p>
      </div>
    </div>
  );
}

export function RestaurantCard({ result, index }: RestaurantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'scores' | 'dishes' | 'similar' | 'alternatives'>('scores');
  const { restaurant, matchScore, satisfiedPeople, dissatisfiedPeople, personScores } = result;
  const { isFavorite, isBlacklisted, toggleFavorite, toggleBlacklist } = useStore();
  const favorited = isFavorite(restaurant.id);
  const blacklisted = isBlacklisted(restaurant.id);

  const similarRestaurants = restaurant.similarRestaurantIds
    .map((id) => RESTAURANTS.find((r) => r.id === id))
    .filter(Boolean) as Restaurant[];

  const alternativeRestaurants = restaurant.alternativeRestaurantIds
    .map((id) => RESTAURANTS.find((r) => r.id === id))
    .filter(Boolean) as Restaurant[];

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setActiveTab('scores');
    }
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={handleCardClick}>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin size={14} />
            <span>{restaurant.address}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              <DollarSign size={14} />
              {PRICE_LABELS[restaurant.priceLevel]}
            </span>
            <span className="flex items-center gap-1 text-blue-500">
              <MapPin size={14} />
              {restaurant.distance}km
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="tag bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle size={16} />
            <span>{satisfiedPeople.length}人满意</span>
          </div>
          {dissatisfiedPeople.length > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle size={16} />
              <span>{dissatisfiedPeople.length}人可能不满意</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-500">
            <Users size={16} />
            <span>共{personScores.length}人</span>
          </div>
        </div>

        <button
          onClick={handleCardClick}
          className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-700 transition-colors border-t border-gray-100"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={18} />
              收起详情
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              查看详细分析
            </>
          )}
        </button>

        {isExpanded && (
          <div className="pt-4 border-t border-gray-100 animate-fade-in-up">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {[
                { key: 'scores', label: '得分详情', icon: Users },
                { key: 'dishes', label: '菜品预览', icon: UtensilsCrossed },
                { key: 'similar', label: '相似推荐', icon: Sparkles },
                { key: 'alternatives', label: '替代方案', icon: ArrowRightLeft },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'scores' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <Users size={18} className="text-primary-500" />
                    每个人的详细得分
                  </h4>
                  <span className="text-xs text-gray-400">点击展开详情</span>
                </div>
                {personScores.map((ps) => (
                  <PersonScoreItem key={ps.personId} personScore={ps} />
                ))}
              </div>
            )}

            {activeTab === 'dishes' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <UtensilsCrossed size={18} className="text-orange-500" />
                  招牌菜品预览
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {restaurant.dishes.map((dish, idx) => (
                    <DishCard key={idx} dish={dish} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-500" />
                  相似口味推荐
                </h4>
                <p className="text-sm text-gray-500">
                  与{restaurant.name}口味相近的餐厅
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {similarRestaurants.map((r) => (
                    <MiniRestaurantCard key={r.id} restaurant={r} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'alternatives' && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-blue-500" />
                  替代方案
                </h4>
                <p className="text-sm text-gray-500">
                  如果不想吃{restaurant.cuisine}，可以试试这些
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {alternativeRestaurants.map((r) => (
                    <MiniRestaurantCard key={r.id} restaurant={r} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3">餐厅常用食材</h4>
              <div className="flex flex-wrap gap-2">
                {restaurant.ingredients.map((ing) => (
                  <span key={ing} className="tag bg-orange-50 text-orange-600">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
