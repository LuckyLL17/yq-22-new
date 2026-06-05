import { Person, Restaurant, ScoreDetail } from '@/types';

export interface HardConstraintResult {
  passed: boolean;
  reason?: string;
  detail?: ScoreDetail;
}

export function checkVegetarianConstraint(
  person: Person,
  restaurant: Restaurant
): HardConstraintResult {
  if (person.preferences.isVegetarian && !restaurant.hasVegetarianOptions) {
    return {
      passed: false,
      reason: '餐厅没有素食选项',
      detail: {
        category: '素食选项',
        score: -100,
        maxScore: 0,
        description: '餐厅没有素食选项，无法匹配',
        isPenalty: true,
      },
    };
  }

  if (person.preferences.isVegetarian && restaurant.hasVegetarianOptions) {
    return {
      passed: true,
      detail: {
        category: '素食选项',
        score: 0,
        maxScore: 0,
        description: '餐厅提供素食选项',
        isPenalty: false,
      },
    };
  }

  return { passed: true };
}

export function checkAllergiesConstraint(
  person: Person,
  restaurant: Restaurant
): HardConstraintResult {
  for (const allergy of person.preferences.allergies) {
    if (restaurant.ingredients.some((ing) => ing.includes(allergy))) {
      return {
        passed: false,
        reason: `餐厅菜品含有过敏源：${allergy}`,
        detail: {
          category: '过敏源',
          score: -100,
          maxScore: 0,
          description: `含有过敏源：${allergy}`,
          isPenalty: true,
        },
      };
    }
  }
  return { passed: true };
}

export function checkAllHardConstraints(
  person: Person,
  restaurant: Restaurant
): { passed: boolean; reason?: string; details: ScoreDetail[] } {
  const details: ScoreDetail[] = [];

  const vegetarianResult = checkVegetarianConstraint(person, restaurant);
  if (vegetarianResult.detail) {
    details.push(vegetarianResult.detail);
  }
  if (!vegetarianResult.passed) {
    return { passed: false, reason: vegetarianResult.reason, details };
  }

  const allergiesResult = checkAllergiesConstraint(person, restaurant);
  if (allergiesResult.detail) {
    details.push(allergiesResult.detail);
  }
  if (!allergiesResult.passed) {
    return { passed: false, reason: allergiesResult.reason, details };
  }

  return { passed: true, details };
}
