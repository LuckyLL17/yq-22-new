import { Person, Restaurant, SPICY_LABELS, WeightConfig, ScoreDetail } from '@/types';

export interface ScoreItemResult {
  scoreDelta: number;
  reasons: string[];
  detail: ScoreDetail;
}

export function calculateSpicyScore(
  person: Person,
  restaurant: Restaurant,
  weights: WeightConfig
): ScoreItemResult {
  if (restaurant.spicyLevel > person.preferences.spicyLevel) {
    const spicyDiff = restaurant.spicyLevel - person.preferences.spicyLevel;
    const penalty = spicyDiff * weights.spicyPenalty;
    return {
      scoreDelta: -penalty,
      reasons: [
        `餐厅是${SPICY_LABELS[restaurant.spicyLevel]}，超出接受范围（可接受${SPICY_LABELS[person.preferences.spicyLevel]}）`,
      ],
      detail: {
        category: '辣度差异',
        score: -penalty,
        maxScore: 0,
        description: `超出${spicyDiff}个辣度等级，每级扣${weights.spicyPenalty}分`,
        isPenalty: true,
      },
    };
  }

  return {
    scoreDelta: 0,
    reasons: [],
    detail: {
      category: '辣度匹配',
      score: 0,
      maxScore: 0,
      description: `餐厅${SPICY_LABELS[restaurant.spicyLevel]}在可接受范围内（可接受${SPICY_LABELS[person.preferences.spicyLevel]}）`,
      isPenalty: false,
    },
  };
}

export function calculateDislikesScore(
  person: Person,
  restaurant: Restaurant,
  weights: WeightConfig
): ScoreItemResult {
  const dislikedIngredients: string[] = [];

  for (const dislike of person.preferences.dislikes) {
    if (restaurant.ingredients.some((ing) => ing.includes(dislike))) {
      dislikedIngredients.push(dislike);
    }
  }

  const dislikeCount = dislikedIngredients.length;

  if (dislikeCount > 0) {
    const totalPenalty = dislikeCount * weights.dislikePenalty;
    const reasons = dislikedIngredients.map((d) => `餐厅常用食材包含忌口：${d}`);
    return {
      scoreDelta: -totalPenalty,
      reasons,
      detail: {
        category: '忌口食材',
        score: -totalPenalty,
        maxScore: 0,
        description: `发现${dislikeCount}种忌口食材，每种扣${weights.dislikePenalty}分`,
        isPenalty: true,
      },
    };
  }

  return {
    scoreDelta: 0,
    reasons: [],
    detail: {
      category: '忌口食材',
      score: 0,
      maxScore: 0,
      description: '未发现忌口食材',
      isPenalty: false,
    },
  };
}

export function calculateFavoriteScore(
  person: Person,
  restaurant: Restaurant,
  weights: WeightConfig
): ScoreItemResult | null {
  if (
    person.preferences.favorites.length > 0 &&
    person.preferences.favorites.includes(restaurant.cuisine)
  ) {
    return {
      scoreDelta: weights.favoriteBonus,
      reasons: [],
      detail: {
        category: '喜欢菜系',
        score: weights.favoriteBonus,
        maxScore: weights.favoriteBonus,
        description: `匹配到喜欢的菜系：${restaurant.cuisine}`,
        isPenalty: false,
      },
    };
  }
  return null;
}
