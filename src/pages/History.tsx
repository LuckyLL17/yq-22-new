import { useState } from 'react';
import {
  ArrowLeft,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  X,
  Users,
  Star,
  Clock,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { MatchRecord } from '@/types';
import { RestaurantCard } from '@/components/RestaurantCard';
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

function RecordDetail({ record }: { record: MatchRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <span className="text-sm font-medium text-gray-700">查看完整匹配结果</span>
        {expanded ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="p-4 space-y-4 bg-white">
          {record.matchResults[0] && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">分享匹配结果</h4>
              <ShareButton
                topResult={record.matchResults[0]}
                people={record.people}
                shareUrl={window.location.origin + '/share/' + record.id}
                totalResults={record.matchResults.length}
              />
            </div>
          )}
          <div className="grid gap-4">
            {record.matchResults.map((result, index) => (
              <RestaurantCard key={result.restaurant.id} result={result} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const {
    historyRecords,
    selectedHistoryIds,
    toggleHistorySelection,
    selectAllHistory,
    clearHistorySelection,
    deleteHistoryRecord,
    deleteSelectedHistoryRecords,
    clearAllHistory,
  } = useStore();

  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);

  const hasSelection = selectedHistoryIds.length > 0;
  const allSelected =
    historyRecords.length > 0 && selectedHistoryIds.length === historyRecords.length;

  const handleDeleteSelected = () => {
    deleteSelectedHistoryRecords();
    setShowDeleteSelectedConfirm(false);
  };

  const handleClearAll = () => {
    clearAllHistory();
    setShowClearAllConfirm(false);
  };

  const handleDeleteSingle = (id: string) => {
    deleteHistoryRecord(id);
    setRecordToDelete(null);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      clearHistorySelection();
    } else {
      selectAllHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
              <History size={20} />
              历史记录
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {historyRecords.length > 0 && (
        <div className="sticky top-[73px] z-40 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {allSelected ? (
                <CheckSquare size={18} className="text-primary-500" />
              ) : (
                <Square size={18} />
              )}
              <span>全选</span>
            </button>
            <div className="flex items-center gap-2">
              {hasSelection && (
                <span className="text-sm text-gray-500">
                  已选 {selectedHistoryIds.length} 项
                </span>
              )}
              {hasSelection && (
                <button
                  onClick={() => setShowDeleteSelectedConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  删除选中
                </button>
              )}
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6">
        {historyRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <History size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">暂无历史记录</h3>
            <p className="text-gray-500 mb-6">完成餐厅匹配后，记录会自动保存到这里</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-2.5"
            >
              去匹配餐厅
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {historyRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleHistorySelection(record.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {selectedHistoryIds.includes(record.id) ? (
                        <CheckSquare size={20} className="text-primary-500" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {record.topRestaurantName}
                            </h3>
                            <span className="flex-shrink-0 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                              {record.topMatchScore} 分
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDate(record.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {record.people.length} 人
                            </span>
                            <span className="flex items-center gap-1">
                              <Star size={14} />
                              {record.matchResults.length} 家餐厅
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {record.people.map((person) => (
                              <span
                                key={person.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                              >
                                <span>{person.avatar}</span>
                                <span>{person.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/share/${record.id}`);
                            }}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                            title="查看分享页面"
                          >
                            <Share2 size={18} />
                          </button>
                          <button
                            onClick={() => setRecordToDelete(record.id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除记录"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <RecordDetail record={record} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800">删除记录</h3>
            </div>
            <p className="text-gray-600 mb-6">确定要删除这条匹配记录吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRecordToDelete(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteSingle(recordToDelete)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800">清空所有记录</h3>
            </div>
            <p className="text-gray-600 mb-6">确定要清空所有历史记录吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSelectedConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-gray-800">删除选中记录</h3>
            </div>
            <p className="text-gray-600 mb-6">
              确定要删除选中的 {selectedHistoryIds.length} 条记录吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteSelectedConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
