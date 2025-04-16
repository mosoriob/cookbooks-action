const isTapisAppSpec = (content: Record<string, unknown>): boolean => {
  return content.type === 'tapis-app'
}

export { isTapisAppSpec }
