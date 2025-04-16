import { describe, expect, test, jest } from '@jest/globals'
import { readFile, readJsonFile } from '../../src/utils/reader'
import fs from 'fs'

// Mock the fs module
jest.mock('fs')

describe('reader utility', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('readFile', () => {
    test('should read file content when file exists', () => {
      // Mock implementation
      const mockContent = 'file content'
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockContent)

      // Execute function
      const result = readFile('test-file.txt')

      // Assertions
      expect(fs.existsSync).toHaveBeenCalledWith('test-file.txt')
      expect(fs.readFileSync).toHaveBeenCalledWith('test-file.txt', 'utf8')
      expect(result).toBe(mockContent)
    })

    test('should throw error when file does not exist', () => {
      // Mock implementation
      jest.spyOn(fs, 'existsSync').mockReturnValue(false)

      // Execute and assert
      expect(() => readFile('non-existent-file.txt')).toThrow(
        'File non-existent-file.txt does not exist'
      )
      expect(fs.existsSync).toHaveBeenCalledWith('non-existent-file.txt')
      expect(fs.readFileSync).not.toHaveBeenCalled()
    })
  })

  describe('readJsonFile', () => {
    test('should parse JSON content when file contains valid JSON', () => {
      // Mock implementation
      const mockJsonString = '{"key": "value"}'
      const expectedObject = { key: 'value' }
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'readFileSync').mockReturnValue(mockJsonString)

      // Execute function
      const result = readJsonFile('test-file.json')

      // Assertions
      expect(fs.existsSync).toHaveBeenCalledWith('test-file.json')
      expect(fs.readFileSync).toHaveBeenCalledWith('test-file.json', 'utf8')
      expect(result).toEqual(expectedObject)
    })

    test('should throw error when file contains invalid JSON', () => {
      // Mock implementation
      const invalidJson = '{ invalid json }'
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'readFileSync').mockReturnValue(invalidJson)

      // Execute and assert
      expect(() => readJsonFile('invalid-json.json')).toThrow(SyntaxError)
      expect(fs.existsSync).toHaveBeenCalledWith('invalid-json.json')
      expect(fs.readFileSync).toHaveBeenCalledWith('invalid-json.json', 'utf8')
    })
  })
})
