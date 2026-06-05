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
