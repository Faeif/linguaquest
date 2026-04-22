import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function loadPrompt(filename: string): string {
  const promptPath = join(process.cwd(), 'prompts', 'companion', filename)
  return readFileSync(promptPath, 'utf-8').trim()
}

export const PROFILE_BUILDER_PROMPT = loadPrompt('profile-builder.md')
export const ORCHESTRATOR_PROMPT = loadPrompt('orchestrator.md')
export const CONVERSATION_ENGINE_PROMPT = loadPrompt('conversation-engine.md')
