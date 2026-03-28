declare module 'hanzi' {
  interface Definition {
    traditional: string
    simplified: string
    pinyin: string
    definition: string
  }

  interface Decomposition {
    character: string
    components1: string[]
    components2?: string[]
    components3?: string[]
  }

  interface FrequencyResult {
    number: string
    character: string
    count: string
    percentage: string
    pinyin: string
    meaning: string
  }

  function start(): void
  function definitionLookup(character: string, type?: 's' | 't'): Definition[] | null
  function decompose(character: string, type?: number): Decomposition | null
  function getExamples(character: string): Definition[]
  function segment(text: string): string[]
  function getCharacterFrequency(character: string): FrequencyResult | null
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
