export function parseCommand(text: string): { command: string; args: string } {
  const trimmed = text.trim()
  const spaceIdx = trimmed.indexOf(' ')
  const rawCommand = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
  const command = rawCommand.split('@')[0].toLowerCase()
  const args = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim()
  return { command, args }
}
