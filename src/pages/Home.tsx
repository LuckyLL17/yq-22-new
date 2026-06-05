import { useState } from 'react';
import { Utensils, Sparkles, ArrowLeft, Users, Sliders, History, Heart, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PersonCard } from '@/components/PersonCard';
import { AddPersonForm } from '@/components/AddPersonForm';
import { RestaurantCard } from '@/components/RestaurantCard';
import { WeightAdjuster } from '@/components/WeightAdjuster';
import { useStore } from '@/store/useStore';

export default function Home() {
  const { people, removePerson, matchResults, isMatching, performMatch, clearResults } = useStore();
  const [showResults, setShowResults] = useState(false);

  const handleMatch = () => {
    performMatch();
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
    clearResults();
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
                  共找到 {matchResults.length} 家适合你们的餐厅，按匹配度排序如下：
                </p>
              </div>

              <div className="grid gap-6">
                {matchResults.map((result, index) => (
                  <RestaurantCard key={result.restaurant.id} result={result} index={index} />
                ))}
              </div>
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
