/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { wait } from '../__fixtures__/wait.js'

// Create mock for readJsonFile
const readJsonFile = jest.fn().mockImplementation(() => ({
  id: 'test-app',
  version: '1.0.0',
  description: 'Test app',
  owner: 'test-owner',
  enabled: true,
  runtime: 'SINGULARITY',
  jobType: 'BATCH',
  jobAttributes: {
    execSystemId: 'ls6',
    execSystemExecDir: '${JobWorkingDir}',
    execSystemInputDir: '${JobWorkingDir}',
    execSystemOutputDir: '${JobWorkingDir}/output'
  }
}))

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/utils/reader.js', () => ({
  readJsonFile
}))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation((name) => {
      if (name === 'milliseconds') return '500'
      if (name === 'tapis_app_spec') return 'path/to/app-spec.json'
      if (name === 'TAPIS_TOKEN') return 'test-token'
      return ''
    })

    // Mock the wait function so that it does not actually wait.
    wait.mockImplementation(() => Promise.resolve('done!'))

    // Reset the readJsonFile mock
    readJsonFile.mockReset().mockReturnValue({
      id: 'test-app',
      version: '1.0.0',
      description: 'Test app',
      owner: 'test-owner',
      enabled: true,
      runtime: 'SINGULARITY',
      jobType: 'BATCH',
      jobAttributes: {
        execSystemId: 'ls6',
        execSystemExecDir: '${JobWorkingDir}',
        execSystemInputDir: '${JobWorkingDir}',
        execSystemOutputDir: '${JobWorkingDir}/output'
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Sets the time output', async () => {
    await run()

    // Verify readJsonFile was called with the correct path
    expect(readJsonFile).toHaveBeenCalledWith('path/to/app-spec.json')

    // Verify debug logs were called
    expect(core.debug).toHaveBeenCalledWith('Waiting 500 milliseconds ...')
    expect(core.debug).toHaveBeenCalledTimes(3) // Three debug calls in the function

    // Verify the time output was set.
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'time',
      // Simple regex to match a time string in the format HH:MM:SS.
      expect.stringMatching(/^\d{2}:\d{2}:\d{2}/)
    )
  })

  it('Sets a failed status when TAPIS_TOKEN is not provided', async () => {
    // Mock input to not return TAPIS_TOKEN
    core.getInput.mockImplementation((name) => {
      if (name === 'milliseconds') return '500'
      if (name === 'tapis_app_spec') return 'path/to/app-spec.json'
      if (name === 'TAPIS_TOKEN') return ''
      return ''
    })

    await run()

    // Verify that the action was marked as failed
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: TAPIS_TOKEN'
    )
  })

  it('Sets a failed status when milliseconds is not a number', async () => {
    // Mock input to return invalid milliseconds
    core.getInput.mockImplementation((name) => {
      if (name === 'milliseconds') return 'this is not a number'
      if (name === 'tapis_app_spec') return 'path/to/app-spec.json'
      if (name === 'TAPIS_TOKEN') return 'test-token'
      return ''
    })

    // Clear the wait mock and return a rejected promise.
    wait
      .mockClear()
      .mockRejectedValueOnce(new Error('milliseconds is not a number'))

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'milliseconds is not a number'
    )
  })

  it('Sets a failed status when tapis app spec is invalid', async () => {
    // Mock readJsonFile to return invalid spec
    readJsonFile.mockReturnValue({
      name: 'test-app',
      non_property: 'non_property'
    })

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(
      1,
      'File is not a valid Tapis app spec'
    )
  })

  it('Sets a failed status when file reading fails', async () => {
    // Mock readJsonFile to throw an error
    readJsonFile.mockImplementation(() => {
      throw new Error('File reading error')
    })

    await run()

    // Verify that the action was marked as failed
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'File reading error')
  })
})
