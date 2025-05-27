
import React, { useEffect, useRef } from 'react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  explanation: string;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, title, explanation }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

 const formatText = (text: string) => {
    return text
      .split('\n')
      .map((line, index, arr) => {
        // Regex to find bold (**text**) and italic (*text*)
        const boldRegex = /\*\*(.*?)\*\*/g;
        const italicRegex = /\*(.*?)\*/g;
        
        let processedLine = line.replace(boldRegex, '<strong>$1</strong>');
        processedLine = processedLine.replace(italicRegex, '<em>$1</em>');

        // Handle bullet points
        if (processedLine.trim().startsWith('•') || processedLine.trim().startsWith(' •')) {
          return <li key={index} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: processedLine.trim().substring(1).trim() }} />;
        }
        // Specific handling for lines that start with '*' which are intended as list items but not italicized
        if (line.trim().startsWith('* ') && !line.includes('<em>') && !line.includes('<strong>') && !line.match(italicRegex) && !line.match(boldRegex)  ) {
           return <li key={index} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: line.trim().substring(1).trim() }} />;
        }

        // Add margin-bottom to paragraphs unless it's the last line or followed by a list item
        const isLastLine = index === arr.length - 1;
        const nextLineIsListItem = arr[index+1] && (arr[index+1].trim().startsWith('•') || arr[index+1].trim().startsWith('* '));
        const marginBottomClass = (isLastLine || nextLineIsListItem) ? '' : 'mb-2';
        
        return <p key={index} className={marginBottomClass} dangerouslySetInnerHTML={{ __html: processedLine }} />;
      });
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explanation-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-slate-800 p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-100 border border-slate-700"
      >
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <h2 id="explanation-modal-title" className="text-3xl font-bold text-teal-400">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-3xl leading-none"
            aria-label="Itxi azalpena"
          >
            &times;
          </button>
        </div>
        <div className="prose prose-lg prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
          {formatText(explanation)}
        </div>
        <button
          onClick={onClose}
          className="mt-8 py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
        >
          Ulertuta
        </button>
      </div>
    </div>
  );
};

export default ExplanationModal;