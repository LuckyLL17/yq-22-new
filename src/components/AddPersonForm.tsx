import { useState } from 'react';
import { Plus, X, Flame, Leaf, Ban, AlertTriangle, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { SpicyLevel, COMMON_DISLIKES, COMMON_ALLERGIES, CUISINE_TYPES } from '@/types';

export function AddPersonForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [spicyLevel, setSpicyLevel] = useState<SpicyLevel>(1);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const addPerson = useStore((state) => state.addPerson);

  const handleSubmit = () => {
    if (!name.trim()) return;

    addPerson({
      name: name.trim(),
      avatar: '',
      preferences: {
        spicyLevel,
        isVegetarian,
        dislikes,
        allergies,
        favorites,
      },
    });

    setName('');
    setSpicyLevel(1);
    setIsVegetarian(false);
    setDislikes([]);
    setAllergies([]);
    setFavorites([]);
    setIsOpen(false);
  };

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white border-2 border-dashed border-primary-300 rounded-2xl p-6 text-primary-500 hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 group"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-display font-semibold text-lg">添加参与人员</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 card-shadow animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl text-gray-800">添加新成员</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入姓名..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Flame size={18} className="text-orange-500" />
            辣度接受程度
          </label>
          <div className="flex gap-2">
            {([0, 1, 2, 3] as SpicyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setSpicyLevel(level)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  spicyLevel === level
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level === 0 ? '不辣' : level === 1 ? '微辣' : level === 2 ? '中辣' : '重辣'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Leaf size={18} className="text-green-500" />
            饮食类型
          </label>
          <button
            onClick={() => setIsVegetarian(!isVegetarian)}
            className={`w-full py-3 rounded-xl font-medium transition-all ${
              isVegetarian
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isVegetarian ? '🌱 素食主义者' : '🥩 正常饮食'}
          </button>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Ban size={18} className="text-red-500" />
            忌口（不吃什么）
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_DISLIKES.map((item) => (
              <button
                key={item}
                onClick={() => toggleItem(item, dislikes, setDislikes)}
                className={`tag ${
                  dislikes.includes(item)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <AlertTriangle size={18} className="text-purple-500" />
            过敏源
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((item) => (
              <button
                key={item}
                onClick={() => toggleItem(item, allergies, setAllergies)}
                className={`tag ${
                  allergies.includes(item)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Heart size={18} className="text-pink-500" />
            喜欢的菜系（可选）
          </label>
          <div className="flex flex-wrap gap-2">
            {CUISINE_TYPES.map((item) => (
              <button
                key={item}
                onClick={() => toggleItem(item, favorites, setFavorites)}
                className={`tag ${
                  favorites.includes(item)
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} className="inline mr-2" />
          确认添加
        </button>
      </div>
    </div>
  );
}
