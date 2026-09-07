import { describe, it, expect } from 'vitest';
import { normalizeList, normalizeItem, normalizeError } from '../utils/normalize';

describe('Tier 3 Frontend Tests: Defensive Normalization Utilities', () => {

  describe('normalizeList', () => {
    it('should return empty array for null, undefined, numbers, strings, and non-array types', () => {
      expect(normalizeList(null)).toEqual([]);
      expect(normalizeList(undefined)).toEqual([]);
      expect(normalizeList('not an array')).toEqual([]);
      expect(normalizeList(42)).toEqual([]);
      expect(normalizeList(true)).toEqual([]);
      expect(normalizeList({})).toEqual([]);
    });

    it('should return the original array if already an array', () => {
      const sample = [{ id: 1 }, { id: 2 }];
      expect(normalizeList(sample)).toEqual(sample);
    });

    it('should extract arrays from common API envelope keys', () => {
      expect(normalizeList({ paths: [{ id: 'p1' }] })).toEqual([{ id: 'p1' }]);
      expect(normalizeList({ modules: [{ id: 'm1' }] })).toEqual([{ id: 'm1' }]);
      expect(normalizeList({ sections: [{ id: 's1' }] })).toEqual([{ id: 's1' }]);
      expect(normalizeList({ topics: [{ id: 't1' }] })).toEqual([{ id: 't1' }]);
      expect(normalizeList({ notes: [{ id: 'n1' }] })).toEqual([{ id: 'n1' }]);
      expect(normalizeList({ resources: [{ id: 'r1' }] })).toEqual([{ id: 'r1' }]);
      expect(normalizeList({ playgrounds: [{ id: 'pg1' }] })).toEqual([{ id: 'pg1' }]);
      expect(normalizeList({ quizzes: [{ id: 'q1' }] })).toEqual([{ id: 'q1' }]);
      expect(normalizeList({ items: ['item1', 'item2'] })).toEqual(['item1', 'item2']);
    });

    it('should extract array from nested data envelopes', () => {
      const nested = {
        data: {
          paths: [{ id: 'p1' }, { id: 'p2' }],
        },
      };
      expect(normalizeList(nested)).toEqual([{ id: 'p1' }, { id: 'p2' }]);

      const directNestedData = {
        data: ['a', 'b', 'c'],
      };
      expect(normalizeList(directNestedData)).toEqual(['a', 'b', 'c']);
    });

    it('should honor preferredKeys when passed', () => {
      const payload = {
        customList: [{ val: 100 }],
        items: [{ val: 200 }],
      };
      expect(normalizeList(payload, 'customList')).toEqual([{ val: 100 }]);
    });
  });

  describe('normalizeItem', () => {
    it('should return null for null, undefined, primitives, and arrays', () => {
      expect(normalizeItem(null)).toBeNull();
      expect(normalizeItem(undefined)).toBeNull();
      expect(normalizeItem('string')).toBeNull();
      expect(normalizeItem(123)).toBeNull();
      expect(normalizeItem([1, 2, 3])).toBeNull();
    });

    it('should unwrap item from { data: item } envelope', () => {
      const wrapped = { data: { id: 'lp-1', title: 'React Guide' } };
      expect(normalizeItem(wrapped)).toEqual({ id: 'lp-1', title: 'React Guide' });
    });

    it('should return plain object if already unwrapped', () => {
      const item = { id: 'lp-1', title: 'React Guide' };
      expect(normalizeItem(item)).toEqual(item);
    });
  });

  describe('normalizeError', () => {
    it('should normalize null/undefined into standard unknown error', () => {
      const result = normalizeError(null);
      expect(result.status).toBe(0);
      expect(result.title).toBe('Unknown Error');
      expect(result.message).toContain('Please try again');
    });

    it('should normalize plain string error', () => {
      const result = normalizeError('Something went wrong');
      expect(result.message).toBe('Something went wrong');
    });

    it('should normalize HTTP 404 error with correct flags', () => {
      const err = {
        response: {
          status: 404,
          data: { message: 'Learning path not found' },
        },
      };
      const result = normalizeError(err);
      expect(result.status).toBe(404);
      expect(result.isNotFound).toBe(true);
      expect(result.title).toContain('404');
      expect(result.message).toBe('Learning path not found');
    });

    it('should normalize HTTP 401 unauthorized error', () => {
      const err = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
      };
      const result = normalizeError(err);
      expect(result.status).toBe(401);
      expect(result.isUnauthorized).toBe(true);
      expect(result.title).toContain('401');
    });

    it('should normalize HTTP 403 forbidden error', () => {
      const err = {
        response: {
          status: 403,
          data: { message: 'Admin access required' },
        },
      };
      const result = normalizeError(err);
      expect(result.status).toBe(403);
      expect(result.isForbidden).toBe(true);
      expect(result.title).toContain('403');
    });

    it('should normalize HTTP 400 validation error with nested errors array', () => {
      const err = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            errors: ['Title is required', 'Email is invalid'],
          },
        },
      };
      const result = normalizeError(err);
      expect(result.status).toBe(400);
      expect(result.isValidationError).toBe(true);
      expect(result.errors).toEqual(['Title is required', 'Email is invalid']);
    });

    it('should normalize network error', () => {
      const err = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };
      const result = normalizeError(err);
      expect(result.isNetworkError).toBe(true);
      expect(result.title).toBe('Connection Problem');
      expect(result.message).toContain('internet connection');
    });

    it('should return already normalized error directly without reprocessing', () => {
      const firstPass = normalizeError('Oops');
      expect(firstPass._isNormalized).toBe(true);
      const secondPass = normalizeError(firstPass);
      expect(secondPass).toBe(firstPass);
    });
  });

});
