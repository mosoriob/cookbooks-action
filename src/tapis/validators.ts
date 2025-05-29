const isTapisApp = (content: Record<string, unknown>): boolean => {
  if (
    !content.id ||
    !content.version ||
    !content.description ||
    !content.owner ||
    !content.runtime ||
    !content.jobType ||
    !content.jobAttributes
  )
    return false
  return true
}

export { isTapisApp }
