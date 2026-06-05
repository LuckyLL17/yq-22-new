import { Person, Restaurant, MatchResult, SPICY_LABELS, WeightConfig, DEFAULT_WEIGHTS, PersonScoreDetail, ScoreDetail } from '@/types';
import { RESTAURANTS } from '@/data/restaurants';

export const FAVORITE_BONUS = 15;

function calculatePersonScore(
  person: Person,
  restaurant: Restaurant,
  weights: WeightConfig
): { score: number; reasons: string[]; details: ScoreDetail[] } {
  let score = 100;
  const reasons: string[] = [];
  const details: ScoreDetail[] = [];

  details.push({
    category: '基础分',
    score: 100,
    maxScore: 100,
    description: '初始匹配分数',
    isPenalty: false,
  });

  if (person.preferences.isVegetarian && !restaurant.hasVegetarianOptions) {
    details.push({
      category: '素食选项',
      score: -100,
      maxScore: 0,
      description: '餐厅没有素食选项，无法匹配',
      isPenalty: true,
    });
    return { score: 0, reasons: ['餐厅没有素食选项'], details };
  }

  for (const allergy of person.preferences.allergies) {
    if (restaurant.ingredients.some((ing) => ing.includes(allergy))) {
      details.push({
        category: '过敏源',
        score: -100,
        maxScore: 0,
        description: `含有过敏源：${allergy}`,
        isPenalty: true,
      });
      return { score: 0, reasons: [`餐厅菜品含有过敏源：${allergy}`], details };
    }
  }

  if (restaurant.spicyLevel > person.preferences.spicyLevel) {
    const spicyDiff = restaurant.spicyLevel - person.preferences.spicyLevel;
    const penalty = spicyDiff * weights.spicyPenalty;
    score -= penalty;
    reasons.push(
      `餐厅是${SPICY_LABELS[restaurant.spicyLevel]}，超出接受范围（可接受${
        SPICY_LABELS[person.preferences.spicyLevel]
      }）`
    );
    details.push({
      category: '辣度差异',
      score: -penalty,
      maxScore: 0,
      description: `超出${spicyDiff}个辣度等级，每级扣${weights.spicyPenalty}分`,
      isPenalty: true,
    });
  } else {
    details.push({
      category: '辣度匹配',
      score: 0,
      maxScore: 0,
      description: `餐厅${SPICY_LABELS[restaurant.spicyLevel]}在可接受范围内（可接受${SPICY_LABELS[person.preferences.spicyLevel]}）`,
      isPenalty: false,
    });
  }

  let dislikeCount = 0;
  for (const dislike of person.preferences.dislikes) {
    if (restaurant.ingredients.some((ing) => ing.includes(dislike))) {
      score -= weights.dislikePenalty;
      reasons.push(`餐厅常用食材包含忌口：${dislike}`);
      dislikeCount++;
    }
  }
  if (dislikeCount > 0) {
    details.push({
      category: '忌口食材',
      score: -(dislikeCount * weights.dislikePenalty),
      maxScore: 0,
      description: `发现${dislikeCount}种忌口食材，每种扣${weights.dislikePenalty}分`,
      isPenalty: true,
    });
  } else {
    details.push({
      category: '忌口食材',
      score: 0,
      maxScore: 0,
      description: '未发现忌口食材',
      isPenalty: false,
    });
  }

  if (
    person.preferences.favorites.length > 0 &&
    person.preferences.favorites.includes(restaurant.cuisine)
  ) {
    score += weights.favoriteBonus;
    details.push({
      category: '喜欢菜系',
      score: weights.favoriteBonus,
      maxScore: weights.favoriteBonus,
      description: `匹配到喜欢的菜系：${restaurant.cuisine}`,
      isPenalty: false,
    });
  }

  if (person.preferences.isVegetarian && restaurant.hasVegetarianOptions) {
    details.push({
      category: '素食选项',
      score: 0,
      maxScore: 0,
      description: '餐厅提供素食选项',
      isPenalty: false,
    });
  }

  return { score: Math.max(0, Math.min(100, score)), reasons, details };
}

export function matchRestaurants(
  people: Person[],
  weights: WeightConfig = DEFAULT_WEIGHTS,
  favoriteIds: string[] = [],
  blacklistIds: string[] = []
): MatchResult[] {
  if (people.length === 0) return [];

  const results: MatchResult[] = [];

  for (const restaurant of RESTAURANTS) {
    if (blacklistIds.includes(restaurant.id)) {
      continue;
    }

    let totalScore = 0;
    const satisfiedPeople: string[] = [];
    const dissatisfiedPeople: {
      personId: string;
      personName: string;
      reasons: string[];
    }[] = [];
    const personScores: PersonScoreDetail[] = [];

    let hasZeroScore = false;

    for (const person of people) {
      const { score, reasons, details } = calculatePersonScore(person, restaurant, weights);
      const isSatisfied = score >= 70;

      personScores.push({
        personId: person.id,
        personName: person.name,
        personAvatar: person.avatar,
        totalScore: score,
        baseScore: 100,
        details,
        reasons,
        isSatisfied,
      });

      if (score === 0) {
        hasZeroScore = true;
        dissatisfiedPeople.push({
          personId: person.id,
          personName: person.name,
          reasons,
        });
      } else {
        totalScore += score;
        if (isSatisfied) {
          satisfiedPeople.push(person.name);
        } else {
          dissatisfiedPeople.push({
            personId: person.id,
            personName: person.name,
            reasons,
          });
        }
      }
    }

    if (hasZeroScore) continue;

    let avgScore = Math.round(totalScore / people.length);

    if (favoriteIds.includes(restaurant.id)) {
      avgScore = Math.min(100, avgScore + FAVORITE_BONUS);
    }

    results.push({
      restaurant,
      matchScore: avgScore,
      satisfiedPeople,
      dissatisfiedPeople,
      personScores,
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
