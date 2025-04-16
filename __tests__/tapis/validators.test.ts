import { describe, expect, test } from '@jest/globals'
import { isTapisAppSpec } from '../../src/tapis/validators.js'

describe('Tapis validators', () => {
  describe('isTapisAppSpec', () => {
    test('should return true for valid Tapis app spec', () => {
      // Mock data
      const mockTapisSpec = {
        type: 'tapis-app',
        name: 'test-app',
        version: '1.0.0',
        runtime: 'CONTAINER'
      }

      // Execute function
      const result = isTapisAppSpec(mockTapisSpec)

      // Assertions
      expect(result).toBe(true)
    })

    test('should return false for non-Tapis app spec', () => {
      // Mock data
      const mockInvalidSpec = {
        name: 'test-app',
        version: '1.0.0'
        // Missing type: 'tapis-app'
      }

      // Execute function
      const result = isTapisAppSpec(mockInvalidSpec)

      // Assertions
      expect(result).toBe(false)
    })

    test('should return false for spec with wrong type', () => {
      // Mock data
      const mockWrongTypeSpec = {
        type: 'not-tapis-app',
        name: 'test-app',
        version: '1.0.0'
      }

      // Execute function
      const result = isTapisAppSpec(mockWrongTypeSpec)

      // Assertions
      expect(result).toBe(false)
    })

    test('should handle null or undefined type', () => {
      // Mock data
      const mockNullTypeSpec = {
        type: null,
        name: 'test-app',
        version: '1.0.0'
      } as unknown as Record<string, unknown>

      // Execute function
      const result = isTapisAppSpec(mockNullTypeSpec)

      // Assertions
      expect(result).toBe(false)
    })
  })
})
