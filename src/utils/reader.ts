import fs from 'fs'

export const readFile = (filePath: string): string => {
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${filePath} does not exist`)
  }

  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf8')
  return fileContent
}

export const readJsonFile = <T = Record<string, unknown>>(
  filePath: string
): T => {
  const fileContent = readFile(filePath)
  return JSON.parse(fileContent)
}
