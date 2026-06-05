export type SpicyLevel = 0 | 1 | 2 | 3;

export interface Person {
  id: string;
  name: string;
  avatar: string;
  preferences: {
    spicyLevel: SpicyLevel;
    isVegetarian: boolean;
    dislikes: string[];
    allergies: string[];
    favorites: string[];
  };
}

export type PriceLevel = 1 | 2 | 3 | 4;

export interface Dish {
  name: string;
  image: string;
  price: string;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  spicyLevel: SpicyLevel;
  hasVegetarianOptions: boolean;
  ingredients: string[];
  tags: string[];
  rating: number;
  address: string;
  priceLevel: PriceLevel;
  distance: number;
  dishes: Dish[];
  similarRestaurantIds: string[];
  alternativeRestaurantIds: string[];
}

export interface ScoreDetail {
  category: string;
  score: number;
  maxScore: number;
  description: string;
  isPenalty: boolean;
}

export interface PersonScoreDetail {
  personId: string;
  personName: string;
  personAvatar: string;
  totalScore: number;
  baseScore: number;
  details: ScoreDetail[];
  reasons: string[];
  isSatisfied: boolean;
}

export interface DissatisfiedPerson {
  personId: string;
  personName: string;
  reasons: string[];
}

export interface MatchResult {
  restaurant: Restaurant;
  matchScore: number;
  satisfiedPeople: string[];
  dissatisfiedPeople: DissatisfiedPerson[];
  personScores: PersonScoreDetail[];
}

export const SPICY_LABELS: Record<SpicyLevel, string> = {
  0: "不辣",
  1: "微辣",
  2: "中辣",
  3: "重辣",
};

export const COMMON_DISLIKES = [
  "香菜",
  "葱",
  "蒜",
  "姜",
  "韭菜",
  "芹菜",
  "洋葱",
  "青椒",
];

export const COMMON_ALLERGIES = [
  "海鲜",
  "花生",
  "牛奶",
  "鸡蛋",
  "小麦",
  "大豆",
  "坚果",
];

export const CUISINE_TYPES = [
  "川菜",
  "粤菜",
  "湘菜",
  "江浙菜",
  "东北菜",
  "日料",
  "韩料",
  "西餐",
  "素食",
  "火锅",
  "烧烤",
  "快餐",
];

export interface WeightConfig {
  spicyPenalty: number;
  dislikePenalty: number;
  favoriteBonus: number;
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  spicyPenalty: 25,
  dislikePenalty: 20,
  favoriteBonus: 10,
};

export const WEIGHT_LABELS: Record<keyof WeightConfig, { label: string; description: string }> = {
  spicyPenalty: {
    label: "辣度差异惩罚",
    description: "每超出一个辣度等级扣除的分数",
  },
  dislikePenalty: {
    label: "忌口食材惩罚",
    description: "每发现一个忌口食材扣除的分数",
  },
  favoriteBonus: {
    label: "喜欢菜系加成",
    description: "匹配到喜欢菜系时增加的分数",
  },
};

export interface MatchRecord {
  id: string;
  timestamp: number;
  people: Person[];
  matchResults: MatchResult[];
  weights: WeightConfig;
  topRestaurantName: string;
  topMatchScore: number;
}

export interface HistoryState {
  records: MatchRecord[];
  selectedRecords: string[];
}

export interface FavoriteState {
  restaurantIds: string[];
  selectedIds: string[];
}

export interface BlacklistState {
  restaurantIds: string[];
  selectedIds: string[];
}

export interface VoteRule {
  allowMultiple: boolean;
  maxVotesPerPerson: number;
  hideResultsUntilEnd: boolean;
  endTime?: number;
}

export interface Vote {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  restaurantIds: string[];
  rules: VoteRule;
  votes: Record<string, string[]>;
  isActive: boolean;
  createdAt: number;
  endedAt?: number;
}

export interface VoteState {
  votes: Vote[];
  currentVoteId: string | null;
}

export type SortField = 'matchScore' | 'rating' | 'distance' | 'priceLevel';
export type SortOrder = 'asc' | 'desc';

export interface FilterConfig {
  sortField: SortField;
  sortOrder: SortOrder;
  priceRange: [PriceLevel | null, PriceLevel | null];
  maxDistance: number | null;
  minRating: number | null;
  minMatchScore: number | null;
}

export const DEFAULT_FILTER_CONFIG: FilterConfig = {
  sortField: 'matchScore',
  sortOrder: 'desc',
  priceRange: [null, null],
  maxDistance: null,
  minRating: null,
  minMatchScore: null,
};

export const PRICE_LABELS: Record<PriceLevel, string> = {
  1: '¥',
  2: '¥¥',
  3: '¥¥¥',
  4: '¥¥¥¥',
};

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  matchScore: '匹配度',
  rating: '评分',
  distance: '距离',
  priceLevel: '价格',
};

export type MatchStep = 'collecting' | 'filtering' | 'scoring' | 'calculating' | 'sorting' | 'complete';

export interface MatchStepInfo {
  key: MatchStep;
  label: string;
  description: string;
  icon: string;
}

export const MATCH_STEPS: MatchStepInfo[] = [
  { key: 'collecting', label: '收集偏好', description: '整理所有人的饮食偏好', icon: '📋' },
  { key: 'filtering', label: '筛选餐厅', description: '排除不符合基本条件的餐厅', icon: '🔍' },
  { key: 'scoring', label: '计算分数', description: '为每个人计算匹配分数', icon: '📊' },
  { key: 'calculating', label: '综合评估', description: '计算团队整体匹配度', icon: '⚖️' },
  { key: 'sorting', label: '排序结果', description: '按匹配度从高到低排序', icon: '🏆' },
  { key: 'complete', label: '匹配完成', description: '为您找到最佳餐厅', icon: '✨' },
];
