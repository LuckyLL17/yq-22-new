import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Heart, Ban, Info, Star, MapPin, DollarSign, UtensilsCrossed, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SurpriseCard } from '@/components/SurpriseCard';
import { Celebration } from '@/components/Celebration';
import { useStore } from '@/store/useStore';
import { Restaurant, SPICY_LABELS, PRICE_LABELS } from '@/types';

export default function SurprisePage() {
  const navigate = useNavigate();
  const {
    getSurpriseDrawCount,
    canDrawSurprise,
    drawSurpriseRestaurant,
    getCurrentSurpriseRestaurant,
    resetSurpriseForNewDay,
    toggleFavorite,
    isFavorite,
    isBlacklisted,
    toggleBlacklist,
  } = useStore();

  const [drawCount, setDrawCount] = useState(0);
  const [canDraw, setCanDraw] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [blacklisted, setBlacklisted] = useState(false);

  useEffect(() => {
    resetSurpriseForNewDay();
    setDrawCount(getSurpriseDrawCount());
    setCanDraw(canDrawSurprise());

    const savedRestaurant = getCurrentSurpriseRestaurant();
    if (savedRestaurant && getSurpriseDrawCount() > 0) {
      setCurrentRestaurant(savedRestaurant);
      setIsFlipped(true);
      setFavorited(isFavorite(savedRestaurant.id));
      setBlacklisted(isBlacklisted(savedRestaurant.id));
    }
  }, [resetSurpriseForNewDay, getSurpriseDrawCount, canDrawSurprise, getCurrentSurpriseRestaurant, isFavorite, isBlacklisted]);

  const handleDraw = () => {
    if (isAnimating || !canDraw) return;

    setIsAnimating(true);
    setShowDetail(false);

    if (isFlipped) {
      setIsFlipped(false);
      setTimeout(() => {
        performDraw();
      }, 800);
    } else {
      performDraw();
    }
  };

  const performDraw = () => {
    const restaurant = drawSurpriseRestaurant();
    if (restaurant) {
      setCurrentRestaurant(restaurant);
      setFavorited(isFavorite(restaurant.id));
      setBlacklisted(isBlacklisted(restaurant.id));

      setTimeout(() => {
        setIsFlipped(true);
      }, 300);

      setTimeout(() => {
        setShowCelebration(true);
        setIsAnimating(false);
        setDrawCount(getSurpriseDrawCount());
        setCanDraw(canDrawSurprise());
      }, 1000);

      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    } else {
      setIsAnimating(false);
      setCanDraw(false);
    }
  };

  const handleCardClick = () => {
    if (isFlipped && currentRestaurant && !isAnimating) {
      setShowDetail(!showDetail);
    } else if (!isFlipped) {
      handleDraw();
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRestaurant) {
      toggleFavorite(currentRestaurant.id);
      setFavorited(!favorited);
    }
  };

  const handleToggleBlacklist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRestaurant) {
      toggleBlacklist(currentRestaurant.id);
      setBlacklisted(!blacklisted);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Celebration active={showCelebration} duration={3000} />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <h1 className="font-display font-bold text-xl text-gray-800">随机惊喜</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-orange-600 text-sm font-medium mb-4">
            <Clock size={16} />
            <span>今日剩余 {3 - drawCount} 次机会</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">
            今天吃什么？交给运气吧！
          </h2>
          <p className="text-gray-500">
            点击卡片抽取一家随机餐厅，每天有3次机会
          </p>
        </div>

        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  num <= drawCount
                    ? 'bg-primary-500 text-white'
                    : num === drawCount + 1 && canDraw
                    ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-300'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SurpriseCard
            restaurant={currentRestaurant}
            isFlipped={isFlipped}
            onClick={handleCardClick}
            isAnimating={isAnimating}
          />
        </div>

        <div className="flex justify-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {!isFlipped ? (
            <button
              onClick={handleDraw}
              disabled={!canDraw || isAnimating}
              className={`px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
                canDraw && !isAnimating
                  ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-white hover:shadow-xl hover:shadow-primary-500/30 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isAnimating ? (
                <>
                  <RefreshCw size={24} className="animate-spin" />
                  抽取中...
                </>
              ) : canDraw ? (
                <>
                  <span className="text-2xl">🎰</span>
                  开始抽取
                </>
              ) : (
                <>
                  <span className="text-2xl">😔</span>
                  今日次数已用完
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleDraw}
                disabled={!canDraw || isAnimating}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  canDraw && !isAnimating
                    ? 'bg-white text-primary-600 border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={20} className={isAnimating ? 'animate-spin' : ''} />
                {canDraw ? '再抽一次' : '次数用完'}
              </button>
              <button
                onClick={() => setShowDetail(!showDetail)}
                className="px-6 py-3 rounded-xl font-medium bg-primary-500 text-white flex items-center gap-2 hover:bg-primary-600 transition-all"
              >
                <Info size={20} />
                {showDetail ? '收起详情' : '查看详情'}
              </button>
            </>
          )}
        </div>

        {isFlipped && currentRestaurant && showDetail && (
          <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
                <UtensilsCrossed size={24} className="text-primary-500" />
                餐厅详情
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-all ${
                    favorited
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={favorited ? '取消收藏' : '收藏'}
                >
                  <Heart size={20} className={favorited ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={handleToggleBlacklist}
                  className={`p-2 rounded-full transition-all ${
                    blacklisted
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={blacklisted ? '取消拉黑' : '拉黑'}
                >
                  <Ban size={20} />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={currentRestaurant.image}
                  alt={currentRestaurant.name}
                  className="w-full h-48 rounded-xl object-cover mb-4"
                />
                <h4 className="font-bold text-lg text-gray-800 mb-2">
                  {currentRestaurant.name}
                </h4>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star size={16} className="fill-current" />
                    {currentRestaurant.rating}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{currentRestaurant.cuisine}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{SPICY_LABELS[currentRestaurant.spicyLevel]}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <MapPin size={16} />
                  <span>{currentRestaurant.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-orange-500 font-medium">
                    <DollarSign size={16} />
                    {PRICE_LABELS[currentRestaurant.priceLevel]}
                  </span>
                  <span className="flex items-center gap-1 text-blue-500">
                    <MapPin size={16} />
                    {currentRestaurant.distance}km
                  </span>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-3">招牌菜品</h5>
                <div className="space-y-3">
                  {currentRestaurant.dishes.map((dish, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{dish.name}</p>
                        <p className="text-sm text-gray-500 truncate">{dish.description}</p>
                      </div>
                      <span className="text-orange-500 font-medium">{dish.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h5 className="font-medium text-gray-700 mb-3">餐厅标签</h5>
              <div className="flex flex-wrap gap-2">
                {currentRestaurant.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h5 className="font-medium text-gray-700 mb-3">常用食材</h5>
              <div className="flex flex-wrap gap-2">
                {currentRestaurant.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {!canDraw && !isFlipped && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center animate-fade-in-up">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="font-bold text-lg text-yellow-800 mb-2">
              今日抽取次数已用完
            </h3>
            <p className="text-yellow-600 text-sm">
              明天再来试试手气吧！每天0点重置机会
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
