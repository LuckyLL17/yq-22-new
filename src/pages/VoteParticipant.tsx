import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Vote, Users, CheckCircle, Clock, User, Trophy, Crown, RefreshCw, Square } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { RESTAURANTS } from '@/data/restaurants';

export default function VoteParticipant() {
  const { voteId } = useParams<{ voteId: string }>();
  const { getVote, castVote, votes, endVote } = useStore();
  const [voterName, setVoterName] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voterId] = useState(() => {
    const storedCreatorId = voteId ? localStorage.getItem('vote_creator_' + voteId) : null;
    return storedCreatorId || 'voter-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const vote = votes.find(v => v.id === voteId);
  const isCreator = vote && vote.creatorId === voterId;

  const refresh = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  useEffect(() => {
    if (vote && vote.votes[voterId]) {
      setHasVoted(true);
      setSelectedRestaurants(vote.votes[voterId]);
    }
  }, [vote, voterId, lastUpdate]);

  if (!vote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Vote size={36} className="text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">投票不存在</h3>
          <p className="text-gray-500 mb-8">该投票链接无效或已被删除</p>
          <Link to="/vote-manager" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
            <ArrowLeft size={20} />
            返回投票管理
          </Link>
        </div>
      </div>
    );
  }

  const restaurants = vote.restaurantIds.map(id => RESTAURANTS.find(r => r.id === id)).filter(Boolean);
  const totalVoters = Object.keys(vote.votes).length;

  const getVoteResults = () => {
    const results: Record<string, number> = {};
    vote.restaurantIds.forEach(id => { results[id] = 0; });
    Object.values(vote.votes).forEach(votedIds => {
      votedIds.forEach(id => { results[id] = (results[id] || 0) + 1; });
    });
    return Object.entries(results).sort((a, b) => b[1] - a[1]);
  };

  const results = getVoteResults();
  const winner = results[0];
  const winnerRestaurant = RESTAURANTS.find(r => r.id === winner?.[0]);

  const toggleRestaurant = (id: string) => {
    if (!vote.isActive || hasVoted) return;

    if (vote.rules.allowMultiple) {
      if (selectedRestaurants.includes(id)) {
        setSelectedRestaurants(prev => prev.filter(r => r !== id));
      } else if (selectedRestaurants.length < vote.rules.maxVotesPerPerson) {
        setSelectedRestaurants(prev => [...prev, id]);
      }
    } else {
      setSelectedRestaurants([id]);
    }
  };

  const handleSubmitVote = () => {
    if (selectedRestaurants.length === 0) {
      alert('请至少选择一家餐厅');
      return;
    }
    if (!voterName.trim()) {
      alert('请输入您的名字');
      return;
    }
    castVote(vote.id, voterId, selectedRestaurants);
    setHasVoted(true);
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const canSeeResults = !vote.rules.hideResultsUntilEnd || !vote.isActive || isCreator;

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/vote-manager" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft size={20} />
              <span>返回</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-gray-800">餐厅投票</h1>
              {isCreator && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Crown size={12} />
                  创建者
                </span>
              )}
            </div>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-6 text-white mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <Vote size={24} />
            <h2 className="font-display font-bold text-xl">{vote.title}</h2>
          </div>
          <p className="text-white/80 text-sm mb-4">
            创建者：{vote.creatorName} · {formatDate(vote.createdAt)}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{totalVoters} 人已投票</span>
              </div>
              <div className="flex items-center gap-2">
                {vote.isActive ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>进行中</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    <span>已结束</span>
                  </>
                )}
              </div>
            </div>
            {isCreator && (
              <div className="flex items-center gap-2">
                <button
                  onClick={refresh}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="刷新"
                >
                  <RefreshCw size={18} />
                </button>
                {vote.isActive && (
                  <button
                    onClick={() => endVote(vote.id)}
                    className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Square size={14} />
                    结束投票
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {vote.isActive && !hasVoted ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">您的名字</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <input
                  type="text"
                  value={voterName}
                  onChange={e => setVoterName(e.target.value)}
                  placeholder="请输入您的名字"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">
                  {vote.rules.allowMultiple
                    ? `选择餐厅（最多 ${vote.rules.maxVotesPerPerson} 家）`
                    : '选择一家餐厅'}
                </h3>
                <span className="text-sm text-gray-500">
                  已选 {selectedRestaurants.length} / {vote.rules.allowMultiple ? vote.rules.maxVotesPerPerson : 1}
                </span>
              </div>

              <div className="space-y-3">
                {restaurants.map((restaurant, index) => restaurant && (
                  <button
                    key={restaurant.id}
                    onClick={() => toggleRestaurant(restaurant.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRestaurants.includes(restaurant.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedRestaurants.includes(restaurant.id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedRestaurants.includes(restaurant.id) && (
                        <CheckCircle size={16} className="text-white" />
                      )}
                    </div>
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{restaurant.name}</h4>
                      <p className="text-sm text-gray-500">
                        {restaurant.cuisine} · {restaurant.tags?.[0] || ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitVote}
              disabled={selectedRestaurants.length === 0}
              className="w-full btn-primary text-lg py-5 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={24} />
              提交投票
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {hasVoted && vote.isActive && (
              <div className="bg-green-50 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">投票成功！</h3>
                  <p className="text-green-600 text-sm">感谢您的参与，等待投票结束后查看结果</p>
                </div>
              </div>
            )}

            {canSeeResults && (
              <div className="bg-white rounded-2xl p-6 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">
                    {vote.isActive ? '实时投票进度' : '投票结果'}
                  </h3>
                  {isCreator && vote.rules.hideResultsUntilEnd && vote.isActive && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      仅创建者可见
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {results.map(([restaurantId, count], index) => {
                    const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
                    const percentage = totalVoters > 0 ? (count / totalVoters) * 100 : 0;
                    const isWinner = index === 0 && !vote.isActive;
                    return (
                      <div
                        key={restaurantId}
                        className={`relative p-4 rounded-xl overflow-hidden animate-fade-in-up ${
                          isWinner
                            ? 'bg-yellow-50 border-2 border-yellow-300'
                            : 'bg-gray-50'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div
                          className="absolute inset-0 bg-primary-200 opacity-30 transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isWinner
                              ? 'bg-yellow-400 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isWinner ? <Trophy size={20} /> : index + 1}
                          </div>
                          <img
                            src={restaurant?.image}
                            alt={restaurant?.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 flex items-center gap-2">
                              {restaurant?.name}
                              {isWinner && (
                                <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                                  胜出
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {count} 票 · {percentage.toFixed(0)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary-600">{count}</span>
                            <p className="text-xs text-gray-500">票</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!canSeeResults && (
              <div className="bg-orange-50 rounded-2xl p-8 text-center">
                <Clock size={48} className="text-orange-500 mx-auto mb-4" />
                <h3 className="font-bold text-orange-800 text-lg mb-2">结果已隐藏</h3>
                <p className="text-orange-600">投票结束后将展示最终结果</p>
              </div>
            )}

            {!vote.isActive && winnerRestaurant && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy size={28} />
                  <h3 className="font-display font-bold text-2xl">最终胜出</h3>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={winnerRestaurant.image}
                    alt={winnerRestaurant.name}
                    className="w-24 h-24 rounded-xl object-cover shadow-lg"
                  />
                  <div>
                    <h4 className="font-bold text-2xl mb-1">{winnerRestaurant.name}</h4>
                    <p className="text-white/80 mb-2">
                      {winnerRestaurant.cuisine} · {winner?.[1]} 票
                    </p>
                    <p className="text-white/70 text-sm">{winnerRestaurant.address}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-gray-500" />
                参与投票的成员
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(vote.votes).map(([id, votedIds]) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full"
                  >
                    <div className="w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center">
                      <User size={12} className="text-primary-600" />
                    </div>
                    <span className="text-sm text-gray-700">
                      {id === voterId ? '(你)' : '成员'} · {votedIds.length}票
                    </span>
                  </div>
                ))}
                {totalVoters === 0 && (
                  <p className="text-gray-500 text-sm">暂无投票</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
