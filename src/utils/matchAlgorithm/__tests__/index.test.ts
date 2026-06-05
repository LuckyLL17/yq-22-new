import { describe, it, expect } from 'vitest';
import {
  FAVORITE_BONUS,
  matchRestaurants,
  calculatePersonScore,
  checkVegetarianConstraint,
  checkAllergiesConstraint,
  checkAllHardConstraints,
  calculateSpicyScore,
  calculateDislikesScore,
  calculateFavoriteScore,
} from '../index';

describe('matchAlgorithm index exports', () => {
  describe('constants exports', () => {
    it('should export FAVORITE_BONUS', () => {
      expect(FAVORITE_BONUS).toBeDefined();
      expect(typeof FAVORITE_BONUS).toBe('number');
    });
  });

  describe('function exports', () => {
    it('should export matchRestaurants function', () => {
      expect(matchRestaurants).toBeDefined();
      expect(typeof matchRestaurants).toBe('function');
    });

    it('should export calculatePersonScore function', () => {
      expect(calculatePersonScore).toBeDefined();
      expect(typeof calculatePersonScore).toBe('function');
    });

    it('should export checkVegetarianConstraint function', () => {
      expect(checkVegetarianConstraint).toBeDefined();
      expect(typeof checkVegetarianConstraint).toBe('function');
    });

    it('should export checkAllergiesConstraint function', () => {
      expect(checkAllergiesConstraint).toBeDefined();
      expect(typeof checkAllergiesConstraint).toBe('function');
    });

    it('should export checkAllHardConstraints function', () => {
      expect(checkAllHardConstraints).toBeDefined();
      expect(typeof checkAllHardConstraints).toBe('function');
    });

    it('should export calculateSpicyScore function', () => {
      expect(calculateSpicyScore).toBeDefined();
      expect(typeof calculateSpicyScore).toBe('function');
    });

    it('should export calculateDislikesScore function', () => {
      expect(calculateDislikesScore).toBeDefined();
      expect(typeof calculateDislikesScore).toBe('function');
    });

    it('should export calculateFavoriteScore function', () => {
      expect(calculateFavoriteScore).toBeDefined();
      expect(typeof calculateFavoriteScore).toBe('function');
    });
  });
});
