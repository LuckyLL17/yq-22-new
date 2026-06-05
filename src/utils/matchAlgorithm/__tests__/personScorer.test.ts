import { describe, it, expect } from 'vitest';
import type { Person, Restaurant, WeightConfig } from '@/types';
import { BASE_SCORE } from '../constants';
import { calculatePersonScore } from '../personScorer';

const DEFAULT_WEIGHTS: WeightConfig = {
  spicyPenalty: 25,
  dislikePenalty: 20,
  favoriteBonus: 10,
};

const createMockPerson = (overrides: Partial<Person['preferences']> = {}): Person => ({
  id: 'test-person-1',
  name: '测试用户',
  avatar: '',
  preferences: {
    spicyLevel: 0,
    isVegetarian: false,
    dislikes: [],
    allergies: [],
    favorites: [],
    ...overrides,
  },
});

const createMockRestaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  id: 'test-restaurant-1',
  name: '测试餐厅',
  image: '',
  cuisine: '川菜',
  spicyLevel: 0,
  hasVegetarianOptions: true,
  ingredients: ['蔬菜', '豆腐'],
  tags: [],
  rating: 4.5,
  address: '',
  priceLevel: 2,
  distance: 1.0,
  dishes: [],
  similarRestaurantIds: [],
  alternativeRestaurantIds: [],
  ...overrides,
});

describe('personScorer', () => {
  describe('calculatePersonScore', () => {
    it('should return base score for a perfect match with no penalties or bonuses', () => {
      const person = createMockPerson();
      const restaurant = createMockRestaurant();

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(BASE_SCORE);
      expect(result.reasons).toEqual([]);
      expect(result.details.length).toBeGreaterThan(0);
      expect(result.details[0].category).toBe('基础分');
      expect(result.details[0].score).toBe(BASE_SCORE);
    });

    it('should return score 0 when hard constraint fails (vegetarian)', () => {
      const person = createMockPerson({ isVegetarian: true });
      const restaurant = createMockRestaurant({ hasVegetarianOptions: false });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(0);
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toContain('素食');
      expect(result.details.length).toBeGreaterThan(1);
    });

    it('should return score 0 when hard constraint fails (allergies)', () => {
      const person = createMockPerson({ allergies: ['花生'] });
      const restaurant = createMockRestaurant({ ingredients: ['花生', '蔬菜'] });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(0);
      expect(result.reasons.some((r) => r.includes('过敏源'))).toBe(true);
    });

    it('should apply spicy penalty when restaurant is too spicy', () => {
      const person = createMockPerson({ spicyLevel: 0 });
      const restaurant = createMockRestaurant({ spicyLevel: 2 });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(BASE_SCORE - 50);
      expect(result.reasons.some((r) => r.includes('辣'))).toBe(true);
    });

    it('should apply dislike penalty', () => {
      const person = createMockPerson({ dislikes: ['香菜'] });
      const restaurant = createMockRestaurant({ ingredients: ['香菜', '蔬菜'] });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(BASE_SCORE - 20);
      expect(result.reasons.some((r) => r.includes('忌口'))).toBe(true);
    });

    it('should apply favorite bonus when cuisine matches', () => {
      const person = createMockPerson({
        spicyLevel: 0,
        favorites: ['川菜'],
      });
      const restaurant = createMockRestaurant({
        cuisine: '川菜',
        spicyLevel: 1,
      });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(BASE_SCORE - 25 + 10);
      const hasFavoriteDetail = result.details.some((d) => d.category === '喜欢菜系');
      expect(hasFavoriteDetail).toBe(true);
    });

    it('should combine multiple penalties', () => {
      const person = createMockPerson({
        spicyLevel: 0,
        dislikes: ['香菜'],
      });
      const restaurant = createMockRestaurant({
        spicyLevel: 2,
        ingredients: ['香菜', '辣椒'],
      });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(BASE_SCORE - 50 - 20);
      expect(result.reasons.length).toBe(2);
    });

    it('should combine penalties and bonus', () => {
      const person = createMockPerson({
        spicyLevel: 1,
        dislikes: ['香菜'],
        favorites: ['川菜'],
      });
      const restaurant = createMockRestaurant({
        cuisine: '川菜',
        spicyLevel: 2,
        ingredients: ['香菜', '辣椒'],
      });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(BASE_SCORE - 25 - 20 + 10);
    });

    it('should clamp score to 0 when penalties exceed base score', () => {
      const person = createMockPerson({
        spicyLevel: 0,
        dislikes: ['香菜', '葱', '蒜', '姜'],
      });
      const restaurant = createMockRestaurant({
        spicyLevel: 3,
        ingredients: ['香菜', '葱', '蒜', '姜', '辣椒'],
      });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.score).toBe(0);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should clamp score to BASE_SCORE when bonus would exceed it', () => {
      const person = createMockPerson({
        favorites: ['川菜', '粤菜'],
      });
      const restaurant = createMockRestaurant({
        cuisine: '川菜',
        spicyLevel: 0,
      });

      const result = calculatePersonScore(person, restaurant, {
        ...DEFAULT_WEIGHTS,
        favoriteBonus: 50,
      });

      expect(result.score).toBe(BASE_SCORE);
      expect(result.score).toBeLessThanOrEqual(BASE_SCORE);
    });

    it('should include base score detail', () => {
      const person = createMockPerson();
      const restaurant = createMockRestaurant();

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      const baseDetail = result.details.find((d) => d.category === '基础分');
      expect(baseDetail).toBeDefined();
      expect(baseDetail?.score).toBe(BASE_SCORE);
      expect(baseDetail?.maxScore).toBe(BASE_SCORE);
      expect(baseDetail?.isPenalty).toBe(false);
    });

    it('should include spicy detail when penalty applies', () => {
      const person = createMockPerson({ spicyLevel: 0 });
      const restaurant = createMockRestaurant({ spicyLevel: 2 });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      const spicyDetail = result.details.find((d) => d.category === '辣度差异');
      expect(spicyDetail).toBeDefined();
      expect(spicyDetail?.isPenalty).toBe(true);
    });

    it('should include spicy match detail when no penalty', () => {
      const person = createMockPerson({ spicyLevel: 3 });
      const restaurant = createMockRestaurant({ spicyLevel: 1 });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      const spicyDetail = result.details.find((d) => d.category === '辣度匹配');
      expect(spicyDetail).toBeDefined();
      expect(spicyDetail?.isPenalty).toBe(false);
    });

    it('should include favorite detail when cuisine matches', () => {
      const person = createMockPerson({ favorites: ['川菜'] });
      const restaurant = createMockRestaurant({ cuisine: '川菜' });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      const favoriteDetail = result.details.find((d) => d.category === '喜欢菜系');
      expect(favoriteDetail).toBeDefined();
      expect(favoriteDetail?.score).toBe(10);
    });

    it('should not include favorite detail when no match', () => {
      const person = createMockPerson({ favorites: ['日料'] });
      const restaurant = createMockRestaurant({ cuisine: '川菜' });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      const favoriteDetail = result.details.find((d) => d.category === '喜欢菜系');
      expect(favoriteDetail).toBeUndefined();
    });

    it('should work with custom weights', () => {
      const customWeights: WeightConfig = {
        spicyPenalty: 10,
        dislikePenalty: 30,
        favoriteBonus: 15,
      };
      const person = createMockPerson({
        spicyLevel: 0,
        dislikes: ['香菜', '葱'],
        favorites: ['川菜'],
      });
      const restaurant = createMockRestaurant({
        cuisine: '川菜',
        spicyLevel: 3,
        ingredients: ['香菜', '葱', '辣椒'],
      });

      const result = calculatePersonScore(person, restaurant, customWeights);

      expect(result.score).toBe(BASE_SCORE - 30 - 60 + 15);
    });

    it('should include vegetarian detail when person is vegetarian', () => {
      const person = createMockPerson({ isVegetarian: true });
      const restaurant = createMockRestaurant({ hasVegetarianOptions: true });

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      const vegDetail = result.details.find((d) => d.category === '素食选项');
      expect(vegDetail).toBeDefined();
    });

    it('should not include vegetarian detail when person is not vegetarian', () => {
      const person = createMockPerson({ isVegetarian: false });
      const restaurant = createMockRestaurant();

      const result = calculatePersonScore(person, restaurant, DEFAULT_WEIGHTS);

      const vegDetail = result.details.find((d) => d.category === '素食选项');
      expect(vegDetail).toBeUndefined();
    });

    it('should have score of 0 exactly when penalties exactly equal base score', () => {
      const person = createMockPerson({ spicyLevel: 0 });
      const restaurant = createMockRestaurant({ spicyLevel: 4 as 0 });

      const result = calculatePersonScore(person, restaurant, {
        ...DEFAULT_WEIGHTS,
        spicyPenalty: 25,
      });

      expect(result.score).toBe(0);
    });
  });
});
