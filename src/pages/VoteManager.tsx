import { useState } from 'react';
import { ArrowLeft, Plus, Vote, Users, Clock, CheckCircle, Copy, Trash2, Play, Square, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { RESTAURANTS } from '@/data/restaurants';
import { VoteRule } from '@/types';

export default function VoteManager() {
  const navigate = useNavigate();
  const { votes, createVote, endVote, deleteVote, matchResults } = useStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [voteTitle, setVoteTitle] = useState('餐厅投票');
  const [creatorName, setCreatorName] = useState('');
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [rules, setRules] = useState<VoteRule>({
    allowMultiple: true,
    maxVotesPerPerson: 3,
    hideResultsUntilEnd: true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const availableRestaurants = matchResults.length > 0
    ? matchResults.map(r => r.restaurant)
    : RESTAURANTS.slice(0, 5);

  const handleCreateVote = () => {
    if (selectedRestaurants.length === 0) {
      alert('请至少选择一家餐厅');
      return;
    }
    if (!creatorName.trim()) {
      alert('请输入创建者名称');
      return;
    }
    const voteId = createVote(voteTitle, selectedRestaurants, rules, creatorName);
    setShowCreateForm(false);
    setSelectedRestaurants([]);
    setCreatorName('');
    navigate(`/vote/${voteId}`);
  };

  const toggleRestaurant = (id: string) => {
    setSelectedRestaurants(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleCopyLink = (voteId: string) => {
    const link = `${window.location.origin}/vote/${voteId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(voteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getVoteResults = (vote: typeof votes[0]) => {
    const results: Record<string, number> = {};
    vote.restaurantIds.forEach(id => { results[id] = 0; });
    Object.values(vote.votes).forEach(votedIds => {
      votedIds.forEach(id => { results[id] = (results[id] || 0) + 1; });
    });
    return Object.entries(results).sort((a, b) => b[1] - a[1]);
  };

  const getTotalVoters = (vote: typeof votes[0]) => Object.keys(vote.votes).length;

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (showCreateForm) {
    return (
      <div className="min-h-screen pb-8">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setShowCreateForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} /><span>返回</span>
              </button>
              <h1 className="font-display font-bold text-xl text-gray-800">创建投票</h1>
              <div className="w-16" />
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h3 className="font-bold text-gray-800 mb-4">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">投票标题</label>
                  <input type="text" value={voteTitle} onChange={e => setVoteTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">您的称呼</label>
                  <input type="text" value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="输入您的名字" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h3 className="font-bold text-gray-800 mb-4">投票规则</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div><span className="font-medium text-gray-800">允许多选</span><p className="text-sm text-gray-500">每人可以选择多家餐厅</p></div>
                  <input type="checkbox" checked={rules.allowMultiple} onChange={e => setRules(r => ({ ...r, allowMultiple: e.target.checked }))} className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500" />
                </label>
                {rules.allowMultiple && (
                  <div className="pl-7">
                    <label className="block text-sm font-medium text-gray-700 mb-2">每人最多投票数</label>
                    <input type="number" min={1} max={selectedRestaurants.length || 10} value={rules.maxVotesPerPerson} onChange={e => setRules(r => ({ ...r, maxVotesPerPerson: Math.max(1, parseInt(e.target.value) || 1) }))} className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none" />
                  </div>
                )}
                <label className="flex items-center justify-between cursor-pointer">
                  <div><span className="font-medium text-gray-800">结束后显示结果</span><p className="text-sm text-gray-500">投票结束前不显示实时票数</p></div>
                  <input type="checkbox" checked={rules.hideResultsUntilEnd} onChange={e => setRules(r => ({ ...r, hideResultsUntilEnd: e.target.checked }))} className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500" />
                </label>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <h3 className="font-bold text-gray-800 mb-4">选择餐厅（已选 {selectedRestaurants.length} 家）</h3>
              <div className="grid gap-3">
                {availableRestaurants.map(restaurant => (
                  <label key={restaurant.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRestaurants.includes(restaurant.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="checkbox" checked={selectedRestaurants.includes(restaurant.id)} onChange={() => toggleRestaurant(restaurant.id)} className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500" />
                    <img src={restaurant.image} alt={restaurant.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1"><h4 className="font-medium text-gray-800">{restaurant.name}</h4><p className="text-sm text-gray-500">{restaurant.cuisine} · {restaurant.tags?.[0] || ''}</p></div>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleCreateVote} disabled={selectedRestaurants.length === 0} className="w-full btn-primary text-lg py-5 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus size={24} />创建投票
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft size={20} /><span>返回</span>
            </Link>
            <h1 className="font-display font-bold text-xl text-gray-800">投票管理</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {votes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><Vote size={36} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">暂无投票</h3>
            <p className="text-gray-500 mb-8">创建一个投票，让大家一起决定去哪里吃</p>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              <Plus size={20} />创建投票
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {votes.map(vote => {
              const results = getVoteResults(vote);
              const totalVoters = getTotalVoters(vote);
              const winner = results[0];
              const winnerRestaurant = RESTAURANTS.find(r => r.id === winner?.[0]);
              return (
                <div key={vote.id} className="bg-white rounded-2xl overflow-hidden card-shadow animate-fade-in-up">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${vote.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {vote.isActive ? '进行中' : '已结束'}
                          </span>
                          {vote.rules.hideResultsUntilEnd && vote.isActive && (<span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">结果隐藏</span>)}
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{vote.title}</h3>
                        <p className="text-sm text-gray-500">创建者：{vote.creatorName} · {formatDate(vote.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopyLink(vote.id)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500" title="复制投票链接">
                          {copiedId === vote.id ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                        {vote.isActive && (
                          <button onClick={() => endVote(vote.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500" title="结束投票">
                            <Square size={20} />
                          </button>
                        )}
                        <button onClick={() => deleteVote(vote.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500" title="删除投票">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><Users size={16} /><span>{totalVoters} 人已投票</span></div>
                      <div className="flex items-center gap-1"><Vote size={16} /><span>{vote.restaurantIds.length} 家餐厅</span></div>
                      {vote.rules.allowMultiple && (<div className="flex items-center gap-1"><Play size={16} /><span>最多 {vote.rules.maxVotesPerPerson} 票</span></div>)}
                    </div>
                    {(!vote.rules.hideResultsUntilEnd || !vote.isActive) && (
                      <div className="space-y-2">
                        {results.map(([restaurantId, count], index) => {
                          const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
                          const percentage = totalVoters > 0 ? (count / totalVoters) * 100 : 0;
                          return (
                            <div key={restaurantId} className={`relative p-3 rounded-xl overflow-hidden ${index === 0 && !vote.isActive ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                              <div className="absolute inset-0 bg-primary-200 opacity-30 transition-all duration-500" style={{ width: `${percentage}%` }} />
                              <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 && !vote.isActive ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}>{index + 1}</span>
                                  <span className="font-medium text-gray-800">{restaurant?.name || restaurantId}</span>
                                </div>
                                <span className="font-bold text-primary-600">{count} 票</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {vote.rules.hideResultsUntilEnd && vote.isActive && (
                      <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <Clock size={24} className="text-orange-500 mx-auto mb-2" />
                        <p className="text-orange-700 text-sm">投票结束后显示结果</p>
                      </div>
                    )}
                    {!vote.isActive && winnerRestaurant && (
                      <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={20} />
                          <span className="font-bold">胜出餐厅</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <img src={winnerRestaurant.image} alt={winnerRestaurant.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-bold text-lg">{winnerRestaurant.name}</h4>
                            <p className="text-white/80 text-sm">{winnerRestaurant.cuisine} · {winner?.[1]} 票</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                    <button onClick={() => navigate(`/vote/${vote.id}`)} className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
                      <Share2 size={18} />查看投票详情
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      {votes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setShowCreateForm(true)} className="w-full btn-primary text-lg py-5 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2">
              <Plus size={24} />创建新投票
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
