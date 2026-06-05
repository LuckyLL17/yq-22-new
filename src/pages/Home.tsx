import { useState, useMemo } from 'react';
import { Utensils, Sparkles, ArrowLeft, Users, Sliders, History, Heart, Ban, Vote, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PersonCard } from '@/components/PersonCard';
import { AddPersonForm } from '@/components/AddPersonForm';
import { RestaurantCard } from '@/components/RestaurantCard';
import { WeightAdjuster } from '@/components/WeightAdjuster';
import { FilterSortPanel } from '@/components/FilterSortPanel';
import { useStore } from '@/store/useStore';
import { VoteRule, FilterConfig, DEFAULT_FILTER_CONFIG, MatchResult } from '@/types';

export default function Home() {
  const navigate = useNavigate();
  const { people, removePerson, matchResults, isMatching, performMatch, clearResults, createVote } = useStore();
  const [showResults, setShowResults] = useState(false);
  const [showQuickVote, setShowQuickVote] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [voteRules, setVoteRules] = useState<VoteRule>({
    allowMultiple: true,
    maxVotesPerPerson: 2,
    hideResultsUntilEnd: true,
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({ ...DEFAULT_FILTER_CONFIG });

  const filteredAndSortedResults = useMemo(() => {
    let results = [...matchResults];

    if (filterConfig.priceRange[0] !== null) {
      results = results.filter(r => r.restaurant.priceLevel >= filterConfig.priceRange[0]!);
    }
    if (filterConfig.priceRange[1] !== null) {
      results = results.filter(r => r.restaurant.priceLevel <= filterConfig.priceRange[1]!);
    }

    if (filterConfig.maxDistance !== null) {
      results = results.filter(r => r.restaurant.distance <= filterConfig.maxDistance!);
    }

    if (filterConfig.minRating !== null) {
      results = results.filter(r => r.restaurant.rating >= filterConfig.minRating!);
    }

    if (filterConfig.minMatchScore !== null) {
      results = results.filter(r => r.matchScore >= filterConfig.minMatchScore!);
    }

    results.sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (filterConfig.sortField) {
        case 'matchScore':
          aVal = a.matchScore;
          bVal = b.matchScore;
          break;
        case 'rating':
          aVal = a.restaurant.rating;
          bVal = b.restaurant.rating;
          break;
        case 'distance':
          aVal = a.restaurant.distance;
          bVal = b.restaurant.distance;
          break;
        case 'priceLevel':
          aVal = a.restaurant.priceLevel;
          bVal = b.restaurant.priceLevel;
          break;
        default:
          aVal = a.matchScore;
          bVal = b.matchScore;
      }

      return filterConfig.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return results;
  }, [matchResults, filterConfig]);

  const handleMatch = () => {
    performMatch();
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
    clearResults();
    setFilterConfig({ ...DEFAULT_FILTER_CONFIG });
  };

  const handleQuickCreateVote = () => {
    if (!creatorName.trim()) {
      alert('请输入您的名字');
      return;
    }
    const restaurantIds = filteredAndSortedResults.slice(0, 5).map(r => r.restaurant.id);
    if (restaurantIds.length === 0) {
      alert('当前筛选条件下没有餐厅可供选择');
      return;
    }
    const voteId = createVote(
      '今晚去哪里吃？',
      restaurantIds,
      voteRules,
      creatorName
    );
    navigate(`/vote/${voteId}`);
  };

  if (showResults) {
    return (
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
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

        <main className="max-w-4xl mx-auto px-4 py-8">
          {isMatching ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-6" />
              <p className="text-lg text-gray-600">正在为您匹配最佳餐厅...</p>
              <p className="text-sm text-gray-400 mt-2">分析 {people.length} 人的口味偏好</p>
            </div>
          ) : matchResults.length > 0 ? (
            <>
              <div className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-6 text-white mb-8 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles size={24} />
                  <h2 className="font-display font-bold text-xl">匹配完成！</h2>
                </div>
                <p className="text-white/80">
                  共找到 {matchResults.length} 家适合你们的餐厅
                  {filteredAndSortedResults.length !== matchResults.length && (
                    <span className="ml-1">（筛选后显示 {filteredAndSortedResults.length} 家）</span>
                  )}
                </p>
              </div>

              <FilterSortPanel
                filterConfig={filterConfig}
                onFilterChange={setFilterConfig}
              />

              <div className="bg-white rounded-2xl p-6 card-shadow mb-8 animate-fade-in-up">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Vote size={20} className="text-primary-500" />
                  发起团队投票
                </h3>
                {showQuickVote ? (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-500">
                      将前 5 家餐厅加入投票，让团队成员一起决定
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">您的称呼</label>
                      <input
                        type="text"
                        value={creatorName}
                        onChange={e => setCreatorName(e.target.value)}
                        placeholder="输入您的名字"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      <h4 className="font-medium text-gray-800">投票规则设置</h4>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="font-medium text-gray-800 text-sm">允许多选</span>
                          <p className="text-xs text-gray-500">每人可以选择多家餐厅</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={voteRules.allowMultiple}
                          onChange={e => setVoteRules(r => ({ ...r, allowMultiple: e.target.checked }))}
                          className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                        />
                      </label>
                      {voteRules.allowMultiple && (
                        <div className="pl-7">
                          <label className="block text-sm font-medium text-gray-700 mb-2">每人最多投票数</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={voteRules.maxVotesPerPerson}
                            onChange={e => setVoteRules(r => ({ ...r, maxVotesPerPerson: Math.max(1, Math.min(5, parseInt(e.target.value) || 1)) }))}
                            className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                          />
                        </div>
                      )}
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="font-medium text-gray-800 text-sm">结束后显示结果</span>
                          <p className="text-xs text-gray-500">投票结束前不显示实时票数（创建者仍可查看）</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={voteRules.hideResultsUntilEnd}
                          onChange={e => setVoteRules(r => ({ ...r, hideResultsUntilEnd: e.target.checked }))}
                          className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                        />
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowQuickVote(false)}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleQuickCreateVote}
                        className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        创建投票
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQuickVote(true)}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-primary-200 text-primary-600 font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Vote size={20} />
                    快速发起投票
                  </button>
                )}
              </div>

              {filteredAndSortedResults.length > 0 ? (
                <div className="grid gap-6">
                  {filteredAndSortedResults.map((result, index) => (
                    <RestaurantCard key={result.restaurant.id} result={result} index={index} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center card-shadow">
                  <p className="text-gray-500 mb-4">没有符合筛选条件的餐厅</p>
                  <button
                    onClick={() => setFilterConfig({ ...DEFAULT_FILTER_CONFIG })}
                    className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    重置筛选条件
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">没有找到合适的餐厅，试试调整条件？</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-48">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-orange-500 to-yellow-500 opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-end gap-2 mb-8">
            <Link
              to="/vote-manager"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-colors shadow-sm border border-gray-100"
            >
              <Vote size={18} />
              <span className="text-sm font-medium">投票管理</span>
            </Link>
            <Link
              to="/favorites"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-colors shadow-sm border border-gray-100"
            >
              <Heart size={18} />
              <span className="text-sm font-medium">收藏</span>
            </Link>
            <Link
              to="/blacklist"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-colors shadow-sm border border-gray-100"
            >
              <Ban size={18} />
              <span className="text-sm font-medium">黑名单</span>
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-colors shadow-sm border border-gray-100"
            >
              <History size={18} />
              <span className="text-sm font-medium">历史记录</span>
            </Link>
          </div>
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-6 shadow-lg shadow-primary-500/30">
              <Utensils size={32} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-800 mb-4">
              吃饭匹配神器
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              添加参与人员，设置饮食偏好，一键为你们匹配最合适的餐厅 🍽️
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
            <h2 className="font-display font-bold text-xl text-gray-800">
              参与人员
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({people.length} 人)
              </span>
            </h2>
          </div>

          {people.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {people.map((person, index) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onRemove={() => removePerson(person.id)}
                  index={index}
                />
              ))}
            </div>
          )}

          <AddPersonForm />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Sliders size={20} className="text-orange-600" />
            </div>
            <h2 className="font-display font-bold text-xl text-gray-800">
              匹配权重设置
            </h2>
          </div>
          <WeightAdjuster />
        </div>
      </main>

      {people.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleMatch}
              disabled={isMatching}
              className="w-full btn-primary text-lg py-5 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3"
            >
              <Sparkles size={24} />
              开始匹配餐厅
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
