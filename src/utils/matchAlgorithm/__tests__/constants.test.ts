import { describe, it, expect } from 'vitest';
import { FAVORITE_BONUS, BASE_SCORE, SATISFIED_THRESHOLD } from '../constants';

describe('matchAlgorithm constants', () => {
  describe('FAVORITE_BONUS', () => {
    it('should be defined and equal to 15', () => {
      expect(FAVORITE_BONUS).toBeDefined();
      expect(FAVORITE_BONUS).toBe(15);
    });

    it('should be a number', () => {
      expect(typeof FAVORITE_BONUS).toBe('number');
    });
  });

  describe('BASE_SCORE', () => {
    it('should be defined and equal to 100', () => {
      expect(BASE_SCORE).toBeDefined();
      expect(BASE_SCORE).toBe(100);
    });

    it('should be a number', () => {
      expect(typeof BASE_SCORE).toBe('number');
    });
  });

  describe('SATISFIED_THRESHOLD', () => {
    it('should be defined and equal to 70', () => {
      expect(SATISFIED_THRESHOLD).toBeDefined();
      expect(SATISFIED_THRESHOLD).toBe(70);
    });

    it('should be a number', () => {
      expect(typeof SATISFIED_THRESHOLD).toBe('number');
    });
  });

  describe('constant relationships', () => {
    it('BASE_SCORE should be greater than SATISFIED_THRESHOLD', () => {
      expect(BASE_SCORE).toBeGreaterThan(SATISFIED_THRESHOLD);
    });

    it('FAVORITE_BONUS should be positive', () => {
      expect(FAVORITE_BONUS).toBeGreaterThan(0);
    });
  });
});
