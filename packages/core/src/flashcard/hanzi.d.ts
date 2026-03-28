declare module 'hanzi' {
  export interface Definition {
    traditional: string
    simplified: string
    pinyin: string
    definition: string
  }

  export interface Decomposition {
    character: string
    components1: string[]
    components2?: string[]
    components3?: string[]
  }

  export interface FrequencyResult {
    number: string
    character: string
    count: string
    percentage: string
    pinyin: string
    meaning: string
  }

  export function start(): void
  export function definitionLookup(character: string, type?: 's' | 't'): Definition[] | null
  export function decompose(character: string, type?: number): Decomposition | null
  export function getExamples(character: string): Definition[]
  export function segment(text: string): string[]
  export function getCharacterFrequency(character: string): FrequencyResult | null
  function getCharactersWithComponent(component: string): string[]

  export default {
    start,
    definitionLookup,
    decompose,
    getExamples,
    segment,
    getCharacterFrequency,
    getCharactersWithComponent,
  }
}
