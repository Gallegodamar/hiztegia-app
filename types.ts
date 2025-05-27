export interface WordPair {
  id: number;
  basque: string;
  spanish: string;
  synonyms_basque?: string;
  synonyms_spanish?: string;
}

export type SearchMode = 'general' | 'suffix';

export type Suffix = 
  'kor' | 
  'pen' | 
  'garri' | 
  'keta' | 
  'ezin' | 
  'keria' | 
  'men' | 
  'aldi' | 
  'tegi' | 
  'buru' |
  'erraz' |
  'kuntza' |
  'kizun' |
  'kide' |
  'bera' |
  'aro' |
  'kada' |
  'mendu' |
  'gune' |
  'tasun' |
  null;
