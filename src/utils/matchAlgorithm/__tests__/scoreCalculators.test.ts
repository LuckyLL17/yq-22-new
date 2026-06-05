import { describe, it, expect } from 'vitest';
import type { Person, Restaurant, WeightConfig } from '@/types';
import {
  calculateSpicyScore,
  calculateDislikesScore,
  calculateFavoriteScore,
} from '../scoreCalculators';

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
  spicyLevel: 2,
  hasVegetarianOptions: true,
  ingredients: ['辣椒', '花椒', '牛肉'],
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

describe('scoreCalculators', () => {
  describe('calculateSpicyScore', () => {
    it('should apply penalty when restaurant spiciness exceeds person tolerance', () => {
      const person = createMockPerson({ spicyLevel: 0 });
      const restaurant = createMockRestaurant({ spicyLevel: 2 });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateSpicyScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(-50);
      expect(result.reasons.length).toBe(1);
      expect(result.reasons[0]).toContain('超出接受范围');
      expect(result.detail.isPenalty).toBe(true);
      expect(result.detail.score).toBe(-50);
      expect(result.detail.category).toBe('辣度差异');
    });

    it('should apply penalty of 25 for 1 level difference', () => {
      const person = createMockPerson({ spicyLevel: 1 });
      const restaurant = createMockRestaurant({ spicyLevel: 2 });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateSpicyScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(-25);
      expect(result.detail.description).toContain('1');
    });

    it('should return zero penalty when spiciness is within tolerance', () => {
      const person = createMockPerson({ spicyLevel: 3 });
      const restaurant = createMockRestaurant({ spicyLevel: 1 });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateSpicyScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(0);
      expect(result.reasons).toEqual([]);
      expect(result.detail.isPenalty).toBe(false);
      expect(result.detail.category).toBe('辣度匹配');
    });

    it('should return zero penalty when spiciness equals tolerance', () => {
      const person = createMockPerson({ spicyLevel: 2 });
      const restaurant = createMockRestaurant({ spicyLevel: 2 });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateSpicyScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(0);
      expect(result.detail.description).toContain('可接受范围内');
    });

    it('should calculate penalty with custom weight', () => {
      const person = createMockPerson({ spicyLevel: 0 });
      const restaurant = createMockRestaurant({ spicyLevel: 3 });
      const weights = { ...DEFAULT_WEIGHTS, spicyPenalty: 10 };

      const result = calculateSpicyScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(-30);
    });

    it('should have correct maxScore of 0 for penalty case', () => {
      const person = createMockPerson({ spicyLevel: 0 });
      const restaurant = createMockRestaurant({ spicyLevel: 2 });

      const result = calculateSpicyScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.detail.maxScore).toBe(0);
    });
  });

  describe('calculateDislikesScore', () => {
    it('should apply penalty for each disliked ingredient found', () => {
      const person = createMockPerson({ dislikes: ['香菜', '葱'] });
      const restaurant = createMockRestaurant({ ingredients: ['辣椒', '香菜', '葱', '牛肉'] });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateDislikesScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(-40);
      expect(result.reasons.length).toBe(2);
      expect(result.reasons).toContain('餐厅常用食材包含忌口：香菜');
      expect(result.reasons).toContain('餐厅常用食材包含忌口：葱');
      expect(result.detail.isPenalty).toBe(true);
      expect(result.detail.score).toBe(-40);
      expect(result.detail.category).toBe('忌口食材');
    });

    it('should return zero when no dislikes are present', () => {
      const person = createMockPerson({ dislikes: [] });
      const restaurant = createMockRestaurant();
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateDislikesScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(0);
      expect(result.reasons).toEqual([]);
      expect(result.detail.isPenalty).toBe(false);
      expect(result.detail.description).toBe('未发现忌口食材');
    });

    it('should return zero when dislikes do not match any ingredients', () => {
      const person = createMockPerson({ dislikes: ['芒果', '菠萝'] });
      const restaurant = createMockRestaurant({ ingredients: ['辣椒', '牛肉'] });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateDislikesScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(0);
      expect(result.reasons).toEqual([]);
    });

    it('should match dislike as substring of ingredient', () => {
      const person = createMockPerson({ dislikes: ['辣'] });
      const restaurant = createMockRestaurant({ ingredients: ['辣椒酱', '花椒', '牛肉'] });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateDislikesScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(-20);
      expect(result.reasons.length).toBe(1);
    });

    it('should calculate penalty with custom weight', () => {
      const person = createMockPerson({ dislikes: ['香菜'] });
      const restaurant = createMockRestaurant({ ingredients: ['香菜'] });
      const weights = { ...DEFAULT_WEIGHTS, dislikePenalty: 50 };

      const result = calculateDislikesScore(person, restaurant, weights);

      expect(result.scoreDelta).toBe(-50);
    });

    it('should have correct maxScore of 0 for no-dislikes case', () => {
      const person = createMockPerson({ dislikes: [] });
      const restaurant = createMockRestaurant();

      const result = calculateDislikesScore(person, restaurant, DEFAULT_WEIGHTS);

      expect(result.detail.maxScore).toBe(0);
    });
  });

  describe('calculateFavoriteScore', () => {
    it('should return bonus when restaurant cuisine matches favorites', () => {
      const person = createMockPerson({ favorites: ['川菜', '粤菜'] });
      const restaurant = createMockRestaurant({ cuisine: '川菜' });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateFavoriteScore(person, restaurant, weights);

      expect(result).not.toBeNull();
      expect(result?.scoreDelta).toBe(10);
      expect(result?.reasons).toEqual([]);
      expect(result?.detail.isPenalty).toBe(false);
      expect(result?.detail.score).toBe(10);
      expect(result?.detail.maxScore).toBe(10);
      expect(result?.detail.category).toBe('喜欢菜系');
      expect(result?.detail.description).toContain('川菜');
    });

    it('should return null when person has no favorites', () => {
      const person = createMockPerson({ favorites: [] });
      const restaurant = createMockRestaurant({ cuisine: '川菜' });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateFavoriteScore(person, restaurant, weights);

      expect(result).toBeNull();
    });

    it('should return null when favorite cuisine does not match', () => {
      const person = createMockPerson({ favorites: ['日料', '韩料'] });
      const restaurant = createMockRestaurant({ cuisine: '川菜' });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateFavoriteScore(person, restaurant, weights);

      expect(result).toBeNull();
    });

    it('should return bonus with custom weight', () => {
      const person = createMockPerson({ favorites: ['川菜'] });
      const restaurant = createMockRestaurant({ cuisine: '川菜' });
      const weights = { ...DEFAULT_WEIGHTS, favoriteBonus: 30 };

      const result = calculateFavoriteScore(person, restaurant, weights);

      expect(result?.scoreDelta).toBe(30);
      expect(result?.detail.score).toBe(30);
      expect(result?.detail.maxScore).toBe(30);
    });

    it('should match favorite exactly (not substring)', () => {
      const person = createMockPerson({ favorites: ['川'] });
      const restaurant = createMockRestaurant({ cuisine: '川菜' });
      const weights = { ...DEFAULT_WEIGHTS };

      const result = calculateFavoriteScore(person, restaurant, weights);

      expect(result).toBeNull();
    });
  });
});
