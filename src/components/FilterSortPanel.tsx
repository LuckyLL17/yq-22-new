import { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ArrowUpDown, Star, MapPin, DollarSign, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterConfig, SortField, SortOrder, PriceLevel, DEFAULT_FILTER_CONFIG, PRICE_LABELS, SORT_FIELD_LABELS } from '@/types';

interface FilterSortPanelProps {
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
}

const SORT_FIELDS: SortField[] = ['matchScore', 'rating', 'distance', 'priceLevel'];
const PRICE_LEVELS: PriceLevel[] = [1, 2, 3, 4];
const DISTANCE_OPTIONS = [1, 2, 3, 5, 10];
const RATING_OPTIONS = [4.0, 4.5, 4.8];
const MATCH_SCORE_OPTIONS = [60, 70, 80, 90];

export function FilterSortPanel({ filterConfig, onFilterChange }: FilterSortPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isDefault = 
    filterConfig.sortField === DEFAULT_FILTER_CONFIG.sortField &&
    filterConfig.sortOrder === DEFAULT_FILTER_CONFIG.sortOrder &&
    filterConfig.priceRange[0] === DEFAULT_FILTER_CONFIG.priceRange[0] &&
    filterConfig.priceRange[1] === DEFAULT_FILTER_CONFIG.priceRange[1] &&
    filterConfig.maxDistance === DEFAULT_FILTER_CONFIG.maxDistance &&
    filterConfig.minRating === DEFAULT_FILTER_CONFIG.minRating &&
    filterConfig.minMatchScore === DEFAULT_FILTER_CONFIG.minMatchScore;

  const handleSortChange = (field: SortField) => {
    let order: SortOrder = 'desc';
    if (filterConfig.sortField === field) {
      order = filterConfig.sortOrder === 'desc' ? 'asc' : 'desc';
    }
    if (field === 'distance' || field === 'priceLevel') {
      if (filterConfig.sortField === field) {
        order = filterConfig.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        order = 'asc';
      }
    }
    onFilterChange({ ...filterConfig, sortField: field, sortOrder: order });
  };

  const handleReset = () => {
    onFilterChange({ ...DEFAULT_FILTER_CONFIG });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: PriceLevel | null) => {
    const newRange: [PriceLevel | null, PriceLevel | null] = [...filterConfig.priceRange];
    if (type === 'min') {
      newRange[0] = value;
      if (value !== null && newRange[1] !== null && value > newRange[1]) {
        newRange[1] = value;
      }
    } else {
      newRange[1] = value;
      if (value !== null && newRange[0] !== null && value < newRange[0]) {
        newRange[0] = value;
      }
    }
    onFilterChange({ ...filterConfig, priceRange: newRange });
  };

  const getSortIcon = (field: SortField) => {
    if (filterConfig.sortField !== field) return null;
    return filterConfig.sortOrder === 'desc' ? '↓' : '↑';
  };

  const activeFiltersCount = [
    filterConfig.priceRange[0] !== null || filterConfig.priceRange[1] !== null,
    filterConfig.maxDistance !== null,
    filterConfig.minRating !== null,
    filterConfig.minMatchScore !== null,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-8 animate-fade-in-up">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <SlidersHorizontal size={20} className="text-orange-600" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-semibold text-gray-800">筛选与排序</h3>
            <p className="text-sm text-gray-500">
              按 {SORT_FIELD_LABELS[filterConfig.sortField]} {filterConfig.sortOrder === 'desc' ? '从高到低' : '从低到高'}
              {activeFiltersCount > 0 && ` · ${activeFiltersCount} 个筛选条件`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              重置
            </button>
          )}
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-6 border-t border-gray-100 pt-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <ArrowUpDown size={16} className="text-gray-500" />
              排序方式
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {SORT_FIELDS.map((field) => {
                const isActive = filterConfig.sortField === field;
                return (
                  <button
                    key={field}
                    onClick={() => handleSortChange(field)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {field === 'matchScore' && <Sparkles size={18} />}
                    {field === 'rating' && <Star size={18} />}
                    {field === 'distance' && <MapPin size={18} />}
                    {field === 'priceLevel' && <DollarSign size={18} />}
                    <span className="text-xs font-medium">
                      {SORT_FIELD_LABELS[field]}
                    </span>
                    {isActive && (
                      <span className="text-xs opacity-80">
                        {getSortIcon(field)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-gray-500" />
              价格区间
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-12">最低</span>
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => handlePriceRangeChange('min', null)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                      filterConfig.priceRange[0] === null
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    不限
                  </button>
                  {PRICE_LEVELS.map((level) => (
                    <button
                      key={`min-${level}`}
                      onClick={() => handlePriceRangeChange('min', level)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                        filterConfig.priceRange[0] === level
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {PRICE_LABELS[level]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-12">最高</span>
                <div className="flex-1 flex gap-2">
                  <button
                    onClick={() => handlePriceRangeChange('max', null)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                      filterConfig.priceRange[1] === null
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    不限
                  </button>
                  {PRICE_LEVELS.map((level) => (
                    <button
                      key={`max-${level}`}
                      onClick={() => handlePriceRangeChange('max', level)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                        filterConfig.priceRange[1] === level
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {PRICE_LABELS[level]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              距离范围
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterChange({ ...filterConfig, maxDistance: null })}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterConfig.maxDistance === null
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                不限
              </button>
              {DISTANCE_OPTIONS.map((dist) => (
                <button
                  key={dist}
                  onClick={() => onFilterChange({ ...filterConfig, maxDistance: dist })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filterConfig.maxDistance === dist
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dist} 公里内
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Star size={16} className="text-gray-500" />
              最低评分
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterChange({ ...filterConfig, minRating: null })}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterConfig.minRating === null
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                不限
              </button>
              {RATING_OPTIONS.map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFilterChange({ ...filterConfig, minRating: rating })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filterConfig.minRating === rating
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating} 分以上
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-gray-500" />
              最低匹配度
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onFilterChange({ ...filterConfig, minMatchScore: null })}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterConfig.minMatchScore === null
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                不限
              </button>
              {MATCH_SCORE_OPTIONS.map((score) => (
                <button
                  key={score}
                  onClick={() => onFilterChange({ ...filterConfig, minMatchScore: score })}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filterConfig.minMatchScore === score
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {score} 分以上
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
