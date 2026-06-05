import { describe, it, expect } from 'vitest';
import type { Person, Restaurant } from '@/types';
import {
  checkVegetarianConstraint,
  checkAllergiesConstraint,
  checkAllHardConstraints,
} from '../hardConstraints';

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

describe('hardConstraints', () => {
  describe('checkVegetarianConstraint', () => {
    it('should return passed=false when person is vegetarian and restaurant has no vegetarian options', () => {
      const person = createMockPerson({ isVegetarian: true });
      const restaurant = createMockRestaurant({ hasVegetarianOptions: false });

      const result = checkVegetarianConstraint(person, restaurant);

      expect(result.passed).toBe(false);
      expect(result.reason).toBe('餐厅没有素食选项');
      expect(result.detail).toBeDefined();
      expect(result.detail?.isPenalty).toBe(true);
      expect(result.detail?.score).toBe(-100);
      expect(result.detail?.category).toBe('素食选项');
    });

    it('should return passed=true with detail when person is vegetarian and restaurant has vegetarian options', () => {
      const person = createMockPerson({ isVegetarian: true });
      const restaurant = createMockRestaurant({ hasVegetarianOptions: true });

      const result = checkVegetarianConstraint(person, restaurant);

      expect(result.passed).toBe(true);
      expect(result.detail).toBeDefined();
      expect(result.detail?.isPenalty).toBe(false);
      expect(result.detail?.score).toBe(0);
      expect(result.detail?.description).toContain('素食选项');
    });

    it('should return passed=true without detail when person is not vegetarian', () => {
      const person = createMockPerson({ isVegetarian: false });
      const restaurant = createMockRestaurant({ hasVegetarianOptions: false });

      const result = checkVegetarianConstraint(person, restaurant);

      expect(result.passed).toBe(true);
      expect(result.detail).toBeUndefined();
      expect(result.reason).toBeUndefined();
    });

    it('should return passed=true without detail when non-vegetarian person at vegetarian restaurant', () => {
      const person = createMockPerson({ isVegetarian: false });
      const restaurant = createMockRestaurant({ hasVegetarianOptions: true });

      const result = checkVegetarianConstraint(person, restaurant);

      expect(result.passed).toBe(true);
      expect(result.detail).toBeUndefined();
    });
  });

  describe('checkAllergiesConstraint', () => {
    it('should return passed=false when restaurant contains an allergen', () => {
      const person = createMockPerson({ allergies: ['花生', '海鲜'] });
      const restaurant = createMockRestaurant({ ingredients: ['辣椒', '花生', '牛肉'] });

      const result = checkAllergiesConstraint(person, restaurant);

      expect(result.passed).toBe(false);
      expect(result.reason).toContain('花生');
      expect(result.detail).toBeDefined();
      expect(result.detail?.isPenalty).toBe(true);
      expect(result.detail?.score).toBe(-100);
    });

    it('should return passed=false when multiple allergens exist but catches first one', () => {
      const person = createMockPerson({ allergies: ['海鲜', '花生'] });
      const restaurant = createMockRestaurant({ ingredients: ['虾', '海鲜', '花生'] });

      const result = checkAllergiesConstraint(person, restaurant);

      expect(result.passed).toBe(false);
      expect(result.reason).toContain('海鲜');
    });

    it('should return passed=true when person has no allergies', () => {
      const person = createMockPerson({ allergies: [] });
      const restaurant = createMockRestaurant({ ingredients: ['花生', '海鲜'] });

      const result = checkAllergiesConstraint(person, restaurant);

      expect(result.passed).toBe(true);
      expect(result.detail).toBeUndefined();
    });

    it('should return passed=true when allergies do not match any ingredients', () => {
      const person = createMockPerson({ allergies: ['芒果', '菠萝'] });
      const restaurant = createMockRestaurant({ ingredients: ['辣椒', '牛肉', '蔬菜'] });

      const result = checkAllergiesConstraint(person, restaurant);

      expect(result.passed).toBe(true);
      expect(result.detail).toBeUndefined();
    });

    it('should match allergen as substring of ingredient', () => {
      const person = createMockPerson({ allergies: ['辣'] });
      const restaurant = createMockRestaurant({ ingredients: ['辣椒酱', '花椒'] });

      const result = checkAllergiesConstraint(person, restaurant);

      expect(result.passed).toBe(false);
      expect(result.reason).toContain('辣');
    });
  });

  describe('checkAllHardConstraints', () => {
    it('should return passed=true when all constraints are satisfied', () => {
      const person = createMockPerson({
        isVegetarian: true,
        allergies: [],
      });
      const restaurant = createMockRestaurant({
        hasVegetarianOptions: true,
        ingredients: ['蔬菜', '豆腐'],
      });

      const result = checkAllHardConstraints(person, restaurant);

      expect(result.passed).toBe(true);
      expect(result.details.length).toBeGreaterThan(0);
      expect(result.reason).toBeUndefined();
    });

    it('should fail early when vegetarian constraint fails', () => {
      const person = createMockPerson({
        isVegetarian: true,
        allergies: ['花生'],
      });
      const restaurant = createMockRestaurant({
        hasVegetarianOptions: false,
        ingredients: ['花生'],
      });

      const result = checkAllHardConstraints(person, restaurant);

      expect(result.passed).toBe(false);
      expect(result.reason).toBe('餐厅没有素食选项');
      expect(result.details.length).toBe(1);
      expect(result.details[0].category).toBe('素食选项');
    });

    it('should fail on allergies when vegetarian passes but allergies fail', () => {
      const person = createMockPerson({
        isVegetarian: true,
        allergies: ['花生'],
      });
      const restaurant = createMockRestaurant({
        hasVegetarianOptions: true,
        ingredients: ['蔬菜', '花生'],
      });

      const result = checkAllHardConstraints(person, restaurant);

      expect(result.passed).toBe(false);
      expect(result.reason).toContain('花生');
      expect(result.details.length).toBe(2);
    });

    it('should include vegetarian detail only when person is vegetarian', () => {
      const person = createMockPerson({
        isVegetarian: false,
        allergies: [],
      });
      const restaurant = createMockRestaurant();

      const result = checkAllHardConstraints(person, restaurant);

      expect(result.passed).toBe(true);
      expect(result.details.length).toBe(0);
    });

    it('should return empty details array for non-vegetarian with no allergies', () => {
      const person = createMockPerson({
        isVegetarian: false,
        allergies: [],
      });
      const restaurant = createMockRestaurant();

      const result = checkAllHardConstraints(person, restaurant);

      expect(result.details).toEqual([]);
    });
  });
});
