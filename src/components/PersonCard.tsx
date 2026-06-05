import { X, Leaf, Flame } from 'lucide-react';
import { Person, SPICY_LABELS } from '@/types';

interface PersonCardProps {
  person: Person;
  onRemove: () => void;
  index: number;
}

export function PersonCard({ person, onRemove, index }: PersonCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-5 card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
            {person.avatar}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-gray-800">
              {person.name}
            </h3>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="tag bg-orange-100 text-orange-700">
          <Flame size={14} className="mr-1" />
          {SPICY_LABELS[person.preferences.spicyLevel]}
        </span>

        {person.preferences.isVegetarian && (
          <span className="tag bg-green-100 text-green-700">
            <Leaf size={14} className="mr-1" />
            素食
          </span>
        )}

        {person.preferences.dislikes.map((dislike) => (
          <span key={dislike} className="tag bg-red-100 text-red-700">
            不吃{dislike}
          </span>
        ))}

        {person.preferences.allergies.map((allergy) => (
          <span key={allergy} className="tag bg-purple-100 text-purple-700">
            过敏：{allergy}
          </span>
        ))}

        {person.preferences.favorites.map((fav) => (
          <span key={fav} className="tag bg-blue-100 text-blue-700">
            爱吃{fav}
          </span>
        ))}
      </div>
    </div>
  );
}
