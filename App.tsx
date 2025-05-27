
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import WordListItem from './components/WordListItem';
import ExplanationModal from './components/ExplanationModal';
import { euskaraWords } from './data';
import { euskaraVerbs } from './verbData';
import { WordPair, Suffix, SearchMode } from './types';

const KERIA_EXPLANATION = `Atzizki honek «nolakotasuna» adierazten du, baina beti gaitzespen-kutsu batekin.
Alde horretatik, -tasun atzizkiaren aurkaria litzateke.

Adibideak:
* erosotasun (comodidad) / *erosokeria* (dejadez)
* harrotasuna (orgullo) / *harrokeria* (fanfarronería)
* itsutasuna (ceguera) / *itsukeria* (obcecación)
* zikinkeria (suciedad, porquería)
* alferkeria (pereza, holgazanería)`;

interface SuffixDetail {
  value: Suffix;
  name: string;
  explanation: string;
}

const SUFFIX_DETAILS_LIST: SuffixDetail[] = [
  { value: 'kor', name: '-kor', explanation: 'Joera edo zaletasuna adierazten du. Nolakotasuna adierazten duten izenondoak sortzeko erabiltzen da.\n\nAdibideak:\n* beldur*kor* (beldurtia)\n* gizalege*kor* (gizalegezkoa)\n* lagun*kor* (lagunkoia)\n* umore*kor* (umoretsua)' },
  { value: 'pen', name: '-pen', explanation: 'Ekintza edo sentimendu baten ondorioa edo emaitza adierazten du. Aditzoinari gehitzen zaio izen abstraktuak sortzeko.\n\nAdibideak:\n* itxaro*pen* (itxarotearen ondorioa)\n* ikus*pen* (ikustearen ondorioa)\n* senti*pen* (sentitzearen ondorioa)\n* oroi*pen* (oroitzearen ondorioa)\n* gara*pen* (garatzearen ondorioa)' },
  { value: 'garri', name: '-garri', explanation: 'Zerbait eragiten edo sortzen duena, edo zerbaitetarako egokia dena adierazten du.\n\nAdibideak:\n* erabil*garri* (erabil daitekeena)\n* ikus*garri* (ikus daitekeena, ikustekoa)\n* ezin sinetsiz*garri* (sinestezina)\n* onar*garri* (onartzeko modukoa)' },
  { value: 'keta', name: '-keta', explanation: 'Ekintza edo prozesu bat adierazten du, askotan modu intentsiboan edo errepikakorrean.\n\nAdibideak:\n* berri*keta* (berriketan aritzea)\n* azter*keta* (aztertzea)\n* hausnar*keta* (hausnartzea)\n* lehia*keta* (lehian aritzea)' },
  { value: 'ezin', name: '-ezin', explanation: 'Ezintasuna edo zerbait egiteko ezintasuna adierazten du. Askotan aditz-izenarekin batera erabiltzen da.\n\nAdibideak:\n* *ezin* etorri (etortzeko ezintasuna)\n* *ezin* egin (egiteko ezintasuna)\n* *ezin* sinetsi (sinesteko ezintasuna)\n* *ezin* ikusi (ikusteko ezintasuna)' },
  { value: 'keria', name: '-keria', explanation: KERIA_EXPLANATION },
  { value: 'men', name: '-men', explanation: 'Ekintza baten ondorioa, emaitza edo horrekin lotutako kontzeptu abstraktua adierazten du.\n\nAdibideak:\n* agindu*men* (agintzeko ahalmena)\n* ezagu*men* (ezagutzeko gaitasuna)\n* uler*men* (ulertzeko gaitasuna)\n* eska*men* (eskatzea)' },
  { value: 'aldi', name: '-aldi', explanation: 'Denbora-tartea edo gertaera bat adierazten du.\n\nAdibideak:\n* denbor*aldi* (denbora tartea)\n* gazt*aldi* (gaztaroa)\n* ekaitz*aldi* (ekaitz garaia)\n* goiz*aldi* (goizeko tartea)' },
  { value: 'tegi', name: '-tegi', explanation: 'Lekua edo zerbait gordetzeko tokia adierazten du.\n\nAdibideak:\n* liburu*tegi* (liburuak gordetzeko tokia)\n* lan*tegi* (lan egiteko tokia)\n* abel*tegi* (abelgorriak gordetzeko tokia)\n* har*tegi* (harria ateratzeko tokia)' },
  { value: 'buru', name: '-buru', explanation: 'Joera, zaletasuna edo kualitate bat adierazten du, askotan pertsona bati lotuta.\n\nAdibideak:\n* lotsa*buru* (lotsatia)\n* harro*buru* (harroa)\n* lan*buru* (langilea)\n* buruargi (listo)' },
  { value: 'erraz', name: '-erraz', explanation: 'Modua edo erraztasuna adierazten du. \'Erraz\' hitzarekin lotuta dago.\n\nAdibideak:\n* uler*erraz* (ulertzeko erraza)\n* eusk*erraz* (euskaraz erraz egiten duena)\n* jan*erraz* (jateko erraza)' },
  { value: 'kuntza', name: '-kuntza', explanation: 'Ekintza, prozesua edo jarduera baten emaitza edo multzoa adierazten du. Izen abstraktuak sortzen ditu.\n\nAdibideak:\n* hez*kuntza* (heztearen ekintza)\n* sor*kuntza* (sortzearen ekintza)\n* iker*kuntza* (ikertzearen ekintza)' },
  { value: 'kizun', name: '-kizun', explanation: 'Egin behar den zerbait edo etorkizuneko ekintza bat adierazten du.\n\nAdibideak:\n* egin*kizun* (egitekoa)\n* ikus*kizun* (ikuskizuna)\n* galde*kizun* (galdera)' },
  { value: 'kide', name: '-kide', explanation: 'Parte-hartzea, kidetasuna edo talde berekoa izatea adierazten du.\n\nAdibideak:\n* lan*kide* (laneko laguna)\n* bidai*kide* (bidaia laguna)\n* ikas*kide* (ikasketetako laguna)' },
  { value: 'bera', name: '-bera', explanation: 'Joera edo sentikortasuna adierazten du. \'Bera\' hitzak \'sentibera\' esan nahi du batzuetan.\n\nAdibideak:\n* lotsa*bera* (lotsatia)\n* min*bera* (erraz min hartzen duena)\n* maite*bera* (erraz maitemintzen dena)' },
  { value: 'aro', name: '-aro', explanation: 'Denbora-tarte, garai edo aro bat adierazten du.\n\nAdibideak:\n* haurtz*aro* (haurra izateko garaia)\n* gazt*aro* (gaztea izateko garaia)\n* ud*aro* (uda garaia)' },
  { value: 'kada', name: '-kada', explanation: 'Kolpea, ekintza edo kopuru bat adieraz dezake.\n\nAdibideak:\n* osti*kada* (ostiko baten kolpea)\n* besark*ada* (besarkada)\n* mil*aka* (milako kopurua)' },
  { value: 'mendu', name: '-mendu', explanation: 'Ekintza baten emaitza, egoera edo prozesua adierazten du. Izen abstraktuak sortzeko erabiltzen da.\n\nAdibideak:\n* gara*mendu* (garatzea)\n* alda*mendu* (aldatzea)\n* senti*mendu* (sentitzea)' },
  { value: 'gune', name: '-gune', explanation: 'Lekua, tokia edo eremu bat adierazten du.\n\nAdibideak:\n* lan*gune* (lan egiteko tokia)\n* atseden*gune* (atseden hartzeko tokia)\n* bil*gune* (biltzeko tokia)' },
  { value: 'tasun', name: '-tasun', explanation: 'Nolakotasuna, egoera edo kualitatea adierazten du. Izen abstraktuak sortzen ditu.\n\nAdibideak:\n* eder*tasun* (ederra izatea)\n* zorion*tasun* (zoriontsu izatea)\n* anai*tasun* (anaiarteko harremana)' },
];

const allWordsData: WordPair[] = [...euskaraWords, ...euskaraVerbs].filter(
  (word, index, self) =>
    index === self.findIndex((w) => w.basque === word.basque && w.spanish === word.spanish)
).sort((a,b) => a.basque.localeCompare(b.basque));


const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('general');
  const [selectedSuffix, setSelectedSuffix] = useState<Suffix>(null);
  const [filteredWords, setFilteredWords] = useState<WordPair[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', explanation: '' });

  useEffect(() => {
    if (!searchTerm && searchMode === 'general' && !selectedSuffix) {
      setFilteredWords([]); 
      return;
    }

    let results = allWordsData;

    if (searchMode === 'suffix' && selectedSuffix) {
      results = results.filter(wordPair => {
        const basqueWordPart = wordPair.basque.split(',')[0].trim();
        // Ensure basqueWordPart is long enough and does not start with a hyphen (common for suffixes)
        if (basqueWordPart.length >= selectedSuffix.length && !basqueWordPart.startsWith('-')) {
          return basqueWordPart.toLowerCase().endsWith(selectedSuffix.toLowerCase());
        }
        return false;
      });
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(word => {
        const matchesBasque = word.basque.toLowerCase().startsWith(lowerSearchTerm) ||
                              (word.synonyms_basque && word.synonyms_basque.toLowerCase().startsWith(lowerSearchTerm));

        // Tokenize Spanish fields and check for exact word match
        const spanishTextWords = (word.spanish || "").toLowerCase().split(/[^a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ]+/).filter(w => w.length > 0);
        const synonymSpanishTextWords = (word.synonyms_spanish || "").toLowerCase().split(/[^a-zA-Z0-9ñÑáéíóúüÁÉÍÓÚÜ]+/).filter(w => w.length > 0);
        
        const matchesSpanish = spanishTextWords.includes(lowerSearchTerm) ||
                               (word.synonyms_spanish && synonymSpanishTextWords.includes(lowerSearchTerm));
                               
        return matchesBasque || matchesSpanish;
      });
    }
    
    setFilteredWords(results);
  }, [searchTerm, searchMode, selectedSuffix]);
  
  const handleShowExplanation = (suffix: Suffix) => {
    const detail = SUFFIX_DETAILS_LIST.find(d => d.value === suffix);
    if (detail) {
      setModalContent({ title: detail.name, explanation: detail.explanation });
      setIsModalOpen(true);
    }
  };

  const handleSuffixSelection = (suffix: Suffix) => {
    setSelectedSuffix(suffix);
    if (suffix) {
      setSearchMode('suffix'); 
    } else if (searchMode === 'suffix' && !suffix) {
       setSearchMode('general'); 
    }
  };


  return (
    <div className="min-h-screen text-slate-100 flex flex-col items-center p-4">
      <header className="w-full max-w-3xl mx-auto my-8 text-center">
        <h1 className="text-5xl font-bold text-teal-400 mb-4">Hiztegia</h1>
        <p className="text-xl text-teal-300">Euskara - Gaztelania</p>
      </header>

      <div className="w-full max-w-xl mx-auto mb-8 p-6 bg-slate-800 rounded-xl shadow-2xl">
        <input
          type="search"
          placeholder="Bilatu hitzak..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          aria-label="Bilaketa-barra"
        />
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <label className="text-slate-300">Bilaketa modua:</label>
            <select 
              value={searchMode}
              onChange={(e) => {
                const newMode = e.target.value as SearchMode;
                setSearchMode(newMode);
                if (newMode === 'general') {
                  setSelectedSuffix(null); 
                } else if (newMode === 'suffix' && !selectedSuffix) {
                  // Optionally select the first suffix if switching to suffix mode and none is selected
                  setSelectedSuffix(SUFFIX_DETAILS_LIST[0]?.value || null); 
                }
              }}
              className="p-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500"
              aria-label="Bilaketa modua hautatu"
            >
              <option value="general">Orokorra</option>
              <option value="suffix">Atzizkika</option>
            </select>
          </div>

          {searchMode === 'suffix' && (
            <div className="flex items-center space-x-2">
              <select
                value={selectedSuffix || ''}
                onChange={(e) => handleSuffixSelection(e.target.value as Suffix)}
                className="p-2 bg-slate-700 text-slate-100 border border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500"
                aria-label="Atzizkia hautatu"
              >
                <option value="">-- Hautatu Atzizkia --</option>
                {SUFFIX_DETAILS_LIST.map(detail => (
                  <option key={detail.value} value={detail.value || ''}>{detail.name}</option>
                ))}
              </select>
              {selectedSuffix && SUFFIX_DETAILS_LIST.find(s => s.value === selectedSuffix)?.explanation && (
                <button
                  onClick={() => handleShowExplanation(selectedSuffix)}
                  className="p-2 bg-orange-500 hover:bg-orange-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  aria-label={`${selectedSuffix} atzizkiaren azalpena erakutsi`}
                >
                  Azalpena
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto flex-grow">
        {filteredWords.length > 0 ? (
          <div className="space-y-4">
            {filteredWords.map(wordPair => (
              <WordListItem key={wordPair.id} wordPair={wordPair} searchTerm={searchTerm} />
            ))}
          </div>
        ) : (
          (searchTerm || (searchMode === 'suffix' && selectedSuffix)) && ( // Show "no results" only if there was an active search criteria
            <p className="text-center text-slate-400 text-lg mt-8">Ez da emaitzarik aurkitu.</p>
          )
        )}
         {!searchTerm && searchMode === 'general' && !selectedSuffix && (
          <p className="text-center text-slate-400 text-lg mt-8">
            Idatzi bilaketa-koadroan hitz bat aurkitzeko edo hautatu atzizki bat.
          </p>
        )}
      </main>

      <footer className="text-center py-6 mt-12 w-full">
        <p className="text-sm text-slate-400">
          © 2025 Hiztegia Euskara-Gaztelania. Eskubide guztiak erreserbatuta.
        </p>
      </footer>

      <ExplanationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        explanation={modalContent.explanation}
      />
    </div>
  );
};

export default App;
