import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Users, Star, MapPin, AlertCircle, CheckCircle, Utensils, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { MatchResult, SPICY_LABELS, PRICE_LABELS, MatchRecord } from '@/types';
import { MatchScore } from '@/components/MatchScore';
import { ShareButton } from '@/components/ShareButton';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MatchShare() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { historyRecords, people: storePeople, matchResults: storeMatchResults } = useStore();
  const [record, setRecord] = useState<MatchRecord | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (recordId) {
      const found = historyRecords.find(r => r.id === recordId);
      if (found) {
        setRecord(found);
        return;
      }
    }
    
    if (storeMatchResults.length > 0 && storePeople.length > 0) {
      setRecord({
        id: 'current',
        timestamp: Date.now(),
        people: storePeople,
        matchResults: storeMatchResults,
        weights: { spicyPenalty: 25, dislikePenalty: 20, favoriteBonus: 10 },
        topRestaurantName: storeMatchResults[0]?.restaurant.name || '',
        topMatchScore: storeMatchResults[0]?.matchScore || 0,
      });
    }
  }, [recordId, historyRecords, storePeople, storeMatchResults]);

  const shareUrl = recordId 
    ? `${window.location.origin}/share/${recordId}`
    : window.location.href;

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Utensils size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">未找到匹配记录</h2>
          <p className="text-gray-500 mb-6">该分享链接可能已失效或记录已被删除</p>
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            去匹配餐厅
          </Link>
        </div>
      </div>
    );
  }

  const topResult = record.matchResults[0];

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>返回</span>
            </button>
            <h1 className="font-display font-bold text-xl text-gray-800">匹配结果</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-6 text-white mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={24} />
            <h2 className="font-display font-bold text-xl">匹配完成！</h2>
          </div>
          <p className="text-white/80 mb-4">
            共找到 {record.matchResults.length} 家适合你们的餐厅
          </p>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {record.people.length} 人参与
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(record.timestamp)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {record.people.map((person) => (
            <span
              key={person.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-gray-700 shadow-sm"
            >
              <span>{person.avatar}</span>
              <span>{person.name}</span>
            </span>
          ))}
        </div>

        {topResult && (
          <div className="bg-white rounded-2xl p-5 card-shadow mb-6 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span>🏆</span>
              </div>
              <span className="font-bold text-gray-800">最佳匹配</span>
            </div>
            
            <div className="flex gap-4">
              <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                <img
                  src={topResult.restaurant.image}
                  alt={topResult.restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <MatchScore score={topResult.matchScore} size="sm" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {topResult.restaurant.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star size={14} className="fill-current" />
                    {topResult.restaurant.rating}
                  </span>
                  <span>•</span>
                  <span>{topResult.restaurant.cuisine}</span>
                  <span>•</span>
                  <span>{SPICY_LABELS[topResult.restaurant.spicyLevel]}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-orange-500 font-medium">
                    {PRICE_LABELS[topResult.restaurant.priceLevel]}
                  </span>
                  <span className="flex items-center gap-1 text-blue-500">
                    <MapPin size={14} />
                    {topResult.restaurant.distance}km
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <ShareButton
                topResult={topResult}
                people={record.people}
                shareUrl={shareUrl}
                totalResults={record.matchResults.length}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span>📋</span>
            全部匹配结果
          </h3>
          
          {record.matchResults.slice(1).map((result, index) => (
            <ResultCard
              key={result.restaurant.id}
              result={result}
              index={index + 1}
              isExpanded={expandedIndex === index + 1}
              onToggle={() => setExpandedIndex(expandedIndex === index + 1 ? null : index + 1)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

interface ResultCardProps {
  result: MatchResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function ResultCard({ result, index, isExpanded, onToggle }: ResultCardProps) {
  const { restaurant, matchScore, satisfiedPeople, dissatisfiedPeople } = result;

  return (
    <div className="bg-white rounded-2xl overflow-hidden card-shadow animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-4">
        <div className="flex gap-4">
          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1">
              <MatchScore score={matchScore} size="sm" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 mb-1">
              {restaurant.name}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-0.5 text-yellow-500">
                <Star size={12} className="fill-current" />
                {restaurant.rating}
              </span>
              <span>•</span>
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span>{PRICE_LABELS[restaurant.priceLevel]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{satisfiedPeople.length} 人满意</span>
              {dissatisfiedPeople.length > 0 && (
                <span className="text-red-400">{dissatisfiedPeople.length} 人不满意</span>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in-up">
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin size={14} />
              <span>{restaurant.address}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {restaurant.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {dissatisfiedPeople.length > 0 && (
              <div className="bg-red-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-red-600 font-medium text-sm mb-2">
                  <AlertCircle size={14} />
                  <span>不满意原因</span>
                </div>
                <div className="space-y-1">
                  {dissatisfiedPeople.map((person) => (
                    <div key={person.personId} className="text-xs text-red-700">
                      <span className="font-medium">{person.personName}：</span>
                      <span>{person.reasons.join('、')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {satisfiedPeople.length > 0 && (
              <div className="bg-green-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-green-600 font-medium text-sm mb-2">
                  <CheckCircle size={14} />
                  <span>满意的人</span>
                </div>
                <p className="text-xs text-green-700">
                  {satisfiedPeople.join('、')}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onToggle}
          className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          {isExpanded ? '收起详情' : '查看详情'}
        </button>
      </div>
    </div>
  );
}
