import React from 'react';
import { FileText, Globe2, FileCheck2, MessageSquare } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import type { ResultTabType } from '../../types';
import { TranscriptTab } from '../transcript/TranscriptTab';
import { TranslationTab } from '../translation/TranslationTab';
import { MinutesTab } from '../minutes/MinutesTab';
import { QaTab } from '../qa/QaTab';

export const ResultWorkspace: React.FC = () => {
  const { activeResultTab, setActiveResultTab, rawTranscript, translations, minutesData, qaMessages } = useSessionStore();

  const tabs: { id: ResultTabType; label: string; icon: React.ReactNode; hasData: boolean }[] = [
    { id: 'transcript',  label: 'Transkrip',  icon: <FileText className="w-3.5 h-3.5" />,    hasData: Boolean(rawTranscript.trim()) },
    { id: 'translation', label: 'Terjemahan', icon: <Globe2 className="w-3.5 h-3.5" />,      hasData: Boolean(translations.id || translations.en) },
    { id: 'minutes',     label: 'Notulen',    icon: <FileCheck2 className="w-3.5 h-3.5" />,  hasData: Boolean(minutesData) },
    { id: 'qa',          label: 'Tanya AI',   icon: <MessageSquare className="w-3.5 h-3.5" />, hasData: qaMessages.length > 0 },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-glass flex flex-col">
      {/* Tab Bar */}
      <div className="border-b border-white/[0.07] px-3 sm:px-4 pt-1.5 flex items-center gap-0.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeResultTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveResultTab(tab.id)}
              className={`relative flex items-center gap-1.5 py-2.5 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold transition-all duration-200 border-b-2 -mb-px whitespace-nowrap ${
                isActive
                  ? 'border-terracotta-500 text-txt-primary'
                  : 'border-transparent text-txt-muted hover:text-txt-primary/80 hover:border-white/20'
              }`}
            >
              <span className={`shrink-0 transition-colors ${isActive ? 'text-terracotta-500' : 'text-txt-light'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.hasData && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1">
        {activeResultTab === 'transcript'  && <TranscriptTab />}
        {activeResultTab === 'translation' && <TranslationTab />}
        {activeResultTab === 'minutes'     && <MinutesTab />}
        {activeResultTab === 'qa'          && <QaTab />}
      </div>
    </div>
  );
};
