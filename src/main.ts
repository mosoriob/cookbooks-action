import * as core from '@actions/core'
import { wait } from './wait.js'
import { isTapisApp } from './tapis/validators.js'
import { readJsonFile } from './utils/reader.js'
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    const tapisAppSpec: string = core.getInput('tapis_app_spec')
    const tapisToken: string = core.getInput('TAPIS_TOKEN', { required: true })
    const tapisAppSpecContent = readJsonFile(tapisAppSpec)

    if (!isTapisApp(tapisAppSpecContent)) {
      throw new Error('File is not a valid Tapis app spec')
    }

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Waiting ${ms} milliseconds ...`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
