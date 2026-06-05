import { Person, Restaurant, WeightConfig, ScoreDetail } from '@/types';
import { BASE_SCORE } from './constants';
import { checkAllHardConstraints } from './hardConstraints';
import {
  calculateSpicyScore,
  calculateDislikesScore,
  calculateFavoriteScore,
} from './scoreCalculators';

export interface PersonScoreResult {
  score: number;
  reasons: string[];
  details: ScoreDetail[];
}

export function calculatePersonScore(
  person: Person,
  restaurant: Restaurant,
  weights: WeightConfig
): PersonScoreResult {
  const details: ScoreDetail[] = [];
  const reasons: string[] = [];

  details.push({
    category: '基础分',
    score: BASE_SCORE,
    maxScore: BASE_SCORE,
    description: '初始匹配分数',
    isPenalty: false,
  });

  const hardConstraintResult = checkAllHardConstraints(person, restaurant);
  details.push(...hardConstraintResult.details);
  if (!hardConstraintResult.passed) {
    if (hardConstraintResult.reason) {
      reasons.push(hardConstraintResult.reason);
    }
    return { score: 0, reasons, details };
  }

  const spicyResult = calculateSpicyScore(person, restaurant, weights);
  let score = BASE_SCORE + spicyResult.scoreDelta;
  reasons.push(...spicyResult.reasons);
  details.push(spicyResult.detail);

  const dislikesResult = calculateDislikesScore(person, restaurant, weights);
  score += dislikesResult.scoreDelta;
  reasons.push(...dislikesResult.reasons);
  details.push(dislikesResult.detail);

  const favoriteResult = calculateFavoriteScore(person, restaurant, weights);
  if (favoriteResult) {
    score += favoriteResult.scoreDelta;
    details.push(favoriteResult.detail);
  }

  return {
    score: Math.max(0, Math.min(BASE_SCORE, score)),
    reasons,
    details,
  };
}
