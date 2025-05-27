
import React from 'react';
import { WordPair } from '../types';

interface WordListItemProps {
  wordPair: WordPair;
  searchTerm: string;
}

const WordListItem: React.FC<WordListItemProps> = ({ wordPair, searchTerm }) => {
  const highlightText = (text: string | undefined, term: string, isSpanish: boolean) => {
    if (!text || !term || term.trim() === "") {
      return text;
    }
    const lowerTerm = term.toLowerCase();

    if (isSpanish) {
      const wordsInText = text.toLowerCase().split(/[^a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ]+/).filter(w => w.length > 0);
      if (!wordsInText.includes(lowerTerm)) {
        return text; 
      }

      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
      const regex = new RegExp(`(\\b${escapedTerm}\\b)`, 'gi'); // 'g' for all occurrences, 'i' for case-insensitive
      
      const parts = text.split(regex);
      
      return parts.map((part, index) => {
        if (part.toLowerCase() === lowerTerm) {
          return <span key={index} className="bg-teal-500 text-slate-900 font-bold px-1 rounded-sm">{part}</span>;
        }
        return part;
      }).filter(part => part !== ''); // Filter out empty strings that can result from split
    } else { // Basque: startsWith logic
      const lowerText = text.toLowerCase();
      if (lowerText.startsWith(lowerTerm)) {
        const matchedPart = text.substring(0, term.length);
        const restOfText = text.substring(term.length);
        return (
          <>
            <span className="bg-teal-500 text-slate-900 font-bold px-1 rounded-sm">{matchedPart}</span>
            {restOfText}
          </>
        );
      }
    }
    return text;
  };

  return (
    <div className="bg-slate-800 shadow-lg rounded-lg p-6 transition-all duration-200 hover:shadow-teal-500/30 hover:ring-1 hover:ring-teal-500">
      <h3 className="text-2xl font-semibold text-teal-400 mb-2 break-words">
        {highlightText(wordPair.basque, searchTerm, false)}
      </h3>
      <p className="text-slate-300 whitespace-pre-line break-words">
        {highlightText(wordPair.spanish, searchTerm, true)}
      </p>
      {wordPair.synonyms_basque && (
        <p className="text-sm text-slate-400 mt-2 break-words">
          <strong className="text-teal-500">Euskarazko sinonimoak:</strong> {highlightText(wordPair.synonyms_basque, searchTerm, false)}
        </p>
      )}
      {wordPair.synonyms_spanish && (
        <p className="text-sm text-slate-400 mt-1 break-words">
          <strong className="text-teal-500">Gaztelaniazko sinonimoak:</strong> {highlightText(wordPair.synonyms_spanish, searchTerm, true)}
        </p>
      )}
    </div>
  );
};

export default WordListItem;
