import { Person, Restaurant, MatchResult, WeightConfig, DEFAULT_WEIGHTS, PersonScoreDetail } from '@/types';
import { RESTAURANTS } from '@/data/restaurants';
import { FAVORITE_BONUS, SATISFIED_THRESHOLD, BASE_SCORE } from './constants';
import { calculatePersonScore } from './personScorer';

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

    const matchResult = calculateRestaurantMatch(restaurant, people, weights, favoriteIds);
    if (matchResult) {
      results.push(matchResult);
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

function calculateRestaurantMatch(
  restaurant: Restaurant,
  people: Person[],
  weights: WeightConfig,
  favoriteIds: string[]
): MatchResult | null {
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
    const isSatisfied = score >= SATISFIED_THRESHOLD;

    personScores.push({
      personId: person.id,
      personName: person.name,
      personAvatar: person.avatar,
      totalScore: score,
      baseScore: BASE_SCORE,
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

  if (hasZeroScore) return null;

  let avgScore = Math.round(totalScore / people.length);

  if (favoriteIds.includes(restaurant.id)) {
    avgScore = Math.min(100, avgScore + FAVORITE_BONUS);
  }

  return {
    restaurant,
    matchScore: avgScore,
    satisfiedPeople,
    dissatisfiedPeople,
    personScores,
  };
}
