import { Person, Restaurant, MatchResult, SPICY_LABELS } from '@/types';
import { RESTAURANTS } from '@/data/restaurants';

function calculatePersonScore(
  person: Person,
  restaurant: Restaurant
): { score: number; reasons: string[] } {
  let score = 100;
  const reasons: string[] = [];

  if (person.preferences.isVegetarian && !restaurant.hasVegetarianOptions) {
    return { score: 0, reasons: ['餐厅没有素食选项'] };
  }

  for (const allergy of person.preferences.allergies) {
    if (restaurant.ingredients.some((ing) => ing.includes(allergy))) {
      return { score: 0, reasons: [`餐厅菜品含有过敏源：${allergy}`] };
    }
  }

  if (restaurant.spicyLevel > person.preferences.spicyLevel) {
    const spicyDiff = restaurant.spicyLevel - person.preferences.spicyLevel;
    score -= spicyDiff * 25;
    reasons.push(
      `餐厅是${SPICY_LABELS[restaurant.spicyLevel]}，超出接受范围（可接受${
        SPICY_LABELS[person.preferences.spicyLevel]
      }）`
    );
  }

  for (const dislike of person.preferences.dislikes) {
    if (restaurant.ingredients.some((ing) => ing.includes(dislike))) {
      score -= 20;
      reasons.push(`餐厅常用食材包含忌口：${dislike}`);
    }
  }

  if (
    person.preferences.favorites.length > 0 &&
    person.preferences.favorites.includes(restaurant.cuisine)
  ) {
    score += 10;
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

export function matchRestaurants(people: Person[]): MatchResult[] {
  if (people.length === 0) return [];

  const results: MatchResult[] = [];

  for (const restaurant of RESTAURANTS) {
    let totalScore = 0;
    const satisfiedPeople: string[] = [];
    const dissatisfiedPeople: {
      personId: string;
      personName: string;
      reasons: string[];
    }[] = [];

    let hasZeroScore = false;

    for (const person of people) {
      const { score, reasons } = calculatePersonScore(person, restaurant);

      if (score === 0) {
        hasZeroScore = true;
        dissatisfiedPeople.push({
          personId: person.id,
          personName: person.name,
          reasons,
        });
      } else {
        totalScore += score;
        if (score >= 70) {
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

    const avgScore = Math.round(totalScore / people.length);

    results.push({
      restaurant,
      matchScore: avgScore,
      satisfiedPeople,
      dissatisfiedPeople,
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
