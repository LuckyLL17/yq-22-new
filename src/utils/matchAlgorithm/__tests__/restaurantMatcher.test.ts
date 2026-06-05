import { describe, it, expect } from 'vitest';
import type { Person, WeightConfig } from '@/types';
import { DEFAULT_WEIGHTS } from '@/types';
import { RESTAURANTS } from '@/data/restaurants';
import { matchRestaurants } from '../restaurantMatcher';
import { FAVORITE_BONUS, BASE_SCORE, SATISFIED_THRESHOLD } from '../constants';

const createMockPerson = (
  id: string,
  name: string,
  overrides: Partial<Person['preferences']> = {}
): Person => ({
  id,
  name,
  avatar: '',
  preferences: {
    spicyLevel: 3,
    isVegetarian: false,
    dislikes: [],
    allergies: [],
    favorites: [],
    ...overrides,
  },
});

describe('restaurantMatcher', () => {
  describe('matchRestaurants', () => {
    it('should return empty array when no people provided', () => {
      const result = matchRestaurants([], DEFAULT_WEIGHTS);
      expect(result).toEqual([]);
    });

    it('should use default weights when not provided', () => {
      const person = createMockPerson('p1', '张三');
      const result = matchRestaurants([person]);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.matchScore).toBeGreaterThanOrEqual(0);
        expect(r.matchScore).toBeLessThanOrEqual(100);
      });
    });

    it('should use default favoriteIds and blacklistIds when not provided', () => {
      const person = createMockPerson('p1', '张三');
      const result = matchRestaurants([person], DEFAULT_WEIGHTS);

      expect(result.length).toBe(RESTAURANTS.length);
    });

    it('should exclude blacklisted restaurants', () => {
      const person = createMockPerson('p1', '张三');
      const blacklistIds = ['1', '2'];
      const result = matchRestaurants([person], DEFAULT_WEIGHTS, [], blacklistIds);

      const blacklistedInResult = result.filter((r) => blacklistIds.includes(r.restaurant.id));
      expect(blacklistedInResult).toEqual([]);
      expect(result.length).toBe(RESTAURANTS.length - blacklistIds.length);
    });

    it('should return all restaurants when no blacklist', () => {
      const person = createMockPerson('p1', '张三');
      const result = matchRestaurants([person], DEFAULT_WEIGHTS, [], []);

      expect(result.length).toBe(RESTAURANTS.length);
    });

    it('should sort results by matchScore descending', () => {
      const person = createMockPerson('p1', '张三');
      const result = matchRestaurants([person], DEFAULT_WEIGHTS);

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].matchScore).toBeGreaterThanOrEqual(result[i + 1].matchScore);
      }
    });

    it('should apply favorite bonus to favorite restaurants', () => {
      const person = createMockPerson('p1', '张三', { spicyLevel: 3 });
      const favoriteIds = ['1'];
      const result = matchRestaurants([person], DEFAULT_WEIGHTS, favoriteIds);

      const favRestaurant = result.find((r) => r.restaurant.id === '1');
      expect(favRestaurant).toBeDefined();

      const nonFavRestaurant = result.find(
        (r) => r.restaurant.id !== '1' && r.matchScore < 85
      );
      if (nonFavRestaurant) {
        expect(favRestaurant!.matchScore).toBeGreaterThan(nonFavRestaurant.matchScore);
      }
    });

    it('should clamp favorite bonus to max 100', () => {
      const person = createMockPerson('p1', '张三', {
        spicyLevel: 3,
        favorites: ['素食'],
      });
      const favRestaurant = RESTAURANTS.find((r) => r.cuisine === '素食');
      expect(favRestaurant).toBeDefined();

      const favoriteIds = [favRestaurant!.id];
      const result = matchRestaurants([person], DEFAULT_WEIGHTS, favoriteIds);

      const matched = result.find((r) => r.restaurant.id === favRestaurant!.id);
      expect(matched).toBeDefined();
      expect(matched!.matchScore).toBeLessThanOrEqual(100);
      expect(matched!.matchScore).toBe(100);
    });

    it('should exclude restaurants where any person has zero score', () => {
      const vegetarianPerson = createMockPerson('p1', '素食者', {
      isVegetarian: true,
      spicyLevel: 0,
    });
    const result = matchRestaurants([vegetarianPerson], DEFAULT_WEIGHTS);

    const nonVegRestaurants = RESTAURANTS.filter((r) => !r.hasVegetarianOptions);
    nonVegRestaurants.forEach((r) => {
      const matched = result.find((m) => m.restaurant.id === r.id);
      expect(matched).toBeUndefined();
    });
  });

    it('should calculate average score for multiple people', () => {
      const person1 = createMockPerson('p1', '张三', { spicyLevel: 3 });
      const person2 = createMockPerson('p2', '李四', { spicyLevel: 3 });
      const result = matchRestaurants([person1, person2], DEFAULT_WEIGHTS);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.personScores.length).toBe(2);
        expect(r.personScores[0].personId).toBe('p1');
        expect(r.personScores[1].personId).toBe('p2');
      });
    });

    it('should correctly classify satisfied and dissatisfied people', () => {
      const satisfiedPerson = createMockPerson('p1', '满意的人', { spicyLevel: 3 });
      const dissatisfiedPerson = createMockPerson('p2', '不满意的人', {
        spicyLevel: 0,
        dislikes: ['香菜', '葱', '蒜', '辣椒', '花椒'],
      });

      const result = matchRestaurants(
        [satisfiedPerson, dissatisfiedPerson],
        DEFAULT_WEIGHTS
      );

      const sichuanRestaurant = result.find((r) => r.restaurant.id === '1');
      if (sichuanRestaurant) {
        expect(sichuanRestaurant.satisfiedPeople).toContain('满意的人');
        expect(sichuanRestaurant.dissatisfiedPeople.length).toBeGreaterThan(0);
        const dissatisfied = sichuanRestaurant.dissatisfiedPeople.find(
          (d) => d.personName === '不满意的人'
        );
        expect(dissatisfied).toBeDefined();
        expect(dissatisfied!.reasons.length).toBeGreaterThan(0);
      }
    });

    it('should include person score details', () => {
      const person = createMockPerson('p1', '张三');
      const result = matchRestaurants([person], DEFAULT_WEIGHTS);

      expect(result.length).toBeGreaterThan(0);
      const firstResult = result[0];
      expect(firstResult.personScores.length).toBe(1);
      expect(firstResult.personScores[0].totalScore).toBeGreaterThan(0);
      expect(firstResult.personScores[0].baseScore).toBe(BASE_SCORE);
      expect(firstResult.personScores[0].details.length).toBeGreaterThan(0);
      expect(firstResult.personScores[0].isSatisfied).toBeDefined();
    });

    it('should round average score', () => {
      const person1 = createMockPerson('p1', '张三', { spicyLevel: 3 });
      const person2 = createMockPerson('p2', '李四', { spicyLevel: 2 });
      const result = matchRestaurants([person1, person2], DEFAULT_WEIGHTS);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(Number.isInteger(r.matchScore)).toBe(true);
      });
    });

    it('should return null match for restaurant where one person fails hard constraint', () => {
      const normalPerson = createMockPerson('p1', '正常人');
      const allergicPerson = createMockPerson('p2', '过敏的人', {
        allergies: ['海鲜'],
      });

      const result = matchRestaurants([normalPerson, allergicPerson], DEFAULT_WEIGHTS);

      const seafoodRestaurant = result.find((r) => r.restaurant.id === '6');
      expect(seafoodRestaurant).toBeUndefined();
    });

    it('should work with custom weights', () => {
      const customWeights: WeightConfig = {
        spicyPenalty: 50,
        dislikePenalty: 30,
        favoriteBonus: 20,
      };
      const person = createMockPerson('p1', '张三', { spicyLevel: 0 });
      const result = matchRestaurants([person], customWeights);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.matchScore).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return fewer results when many restaurants excluded due to zero scores', () => {
      const superAllergicPerson = createMockPerson('p1', '超级过敏', {
        allergies: ['海鲜', '花生', '牛奶', '鸡蛋', '小麦', '大豆', '坚果', '辣椒'],
      });
      const result = matchRestaurants([superAllergicPerson], DEFAULT_WEIGHTS);

      expect(result.length).toBeLessThan(RESTAURANTS.length);
    });
  });

  describe('MatchResult structure', () => {
    it('should have correct structure for each result', () => {
      const person = createMockPerson('p1', '张三');
      const result = matchRestaurants([person], DEFAULT_WEIGHTS);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r).toHaveProperty('restaurant');
        expect(r).toHaveProperty('matchScore');
        expect(r).toHaveProperty('satisfiedPeople');
        expect(r).toHaveProperty('dissatisfiedPeople');
        expect(r).toHaveProperty('personScores');
        expect(Array.isArray(r.satisfiedPeople)).toBe(true);
        expect(Array.isArray(r.dissatisfiedPeople)).toBe(true);
        expect(Array.isArray(r.personScores)).toBe(true);
      });
    });

    it('dissatisfiedPeople should have correct structure', () => {
      const person = createMockPerson('p1', '张三', {
        spicyLevel: 0,
        dislikes: ['香菜', '葱', '蒜'],
      });
      const result = matchRestaurants([person], DEFAULT_WEIGHTS);

      const sichuan = result.find((r) => r.restaurant.id === '1');
      if (sichuan && sichuan.dissatisfiedPeople.length > 0) {
        const dp = sichuan.dissatisfiedPeople[0];
        expect(dp).toHaveProperty('personId');
        expect(dp).toHaveProperty('personName');
        expect(dp).toHaveProperty('reasons');
        expect(Array.isArray(dp.reasons)).toBe(true);
      }
    });

    it('personScores should have correct structure', () => {
      const person = createMockPerson('p1', '张三');
      const result = matchRestaurants([person], DEFAULT_WEIGHTS);

      const firstResult = result[0];
      const ps = firstResult.personScores[0];
      expect(ps).toHaveProperty('personId');
      expect(ps).toHaveProperty('personName');
      expect(ps).toHaveProperty('personAvatar');
      expect(ps).toHaveProperty('totalScore');
      expect(ps).toHaveProperty('baseScore');
      expect(ps).toHaveProperty('details');
      expect(ps).toHaveProperty('reasons');
      expect(ps).toHaveProperty('isSatisfied');
    });
  });

  describe('edge cases', () => {
    it('should handle single person matching', () => {
      const person = createMockPerson('p1', '单独的人');
      const result = matchRestaurants([person]);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].personScores.length).toBe(1);
    });

    it('should handle all restaurants with vegetarian only vegetarian restaurants for vegetarian person', () => {
      const vegPerson = createMockPerson('p1', '素食者', {
        isVegetarian: true,
        spicyLevel: 3,
      });
      const result = matchRestaurants([vegPerson]);

      const vegRestaurants = RESTAURANTS.filter((r) => r.hasVegetarianOptions);
      expect(result.length).toBe(vegRestaurants.length);

      result.forEach((r) => {
        expect(r.restaurant.hasVegetarianOptions).toBe(true);
      });
    });

    it('should have FAVORITE_BONUS consistent with constants', () => {
      expect(FAVORITE_BONUS).toBe(15);
      expect(BASE_SCORE).toBe(100);
      expect(SATISFIED_THRESHOLD).toBe(70);
    });
  });
});
