import * as core from '@actions/core'
import { isTapisApp } from './tapis/validators.js'
import { readJsonFile } from './utils/reader.js'
import create from './tapis/apps/create.js'
import { Apps } from '@tapis/tapis-typescript'

/**
 * The main function for the action.
 * Creates a Tapis app using the provided specification file.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const tapisAppSpec: string = core.getInput('tapis_app_spec')
    const tapisToken: string = core.getInput('TAPIS_TOKEN', { required: true })
    const tapisBasePath: string =
      core.getInput('TAPIS_BASE_PATH') || 'https://portals.tapis.io/v3'
    const dockerImageTags: string = core.getInput('docker_image_tags', {
      required: true
    })

    // Get the first tag from the list
    const tags = dockerImageTags.split(',')
    if (tags.length === 0) {
      throw new Error('No Docker image tags provided')
    }
    const imageTag = tags[0]

    const tapisAppSpecContent = readJsonFile(tapisAppSpec)

    if (!isTapisApp(tapisAppSpecContent)) {
      throw new Error('File is not a valid Tapis app spec')
    }

    // Update the container image in the app spec with the first tag
    const updatedAppSpec = {
      ...tapisAppSpecContent,
      containerImage: imageTag
    }

    // Create the Tapis app
    const result = await create(
      updatedAppSpec as unknown as Apps.ReqPostApp,
      tapisBasePath,
      tapisToken
    )

    // Log the result structure for debugging
    core.debug(`Tapis app creation result: ${JSON.stringify(result)}`)

    // Set outputs for other workflow steps to use
    core.setOutput('app_result', JSON.stringify(result))
    core.info(`Successfully created Tapis app with image: ${imageTag}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
