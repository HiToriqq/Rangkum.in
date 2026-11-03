import React from 'react';
import { FileText, Globe2, FileCheck2, MessageSquare } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import type { ResultTabType } from '../../types';
import { TranscriptTab } from '../transcript/TranscriptTab';
import { TranslationTab } from '../translation/TranslationTab';
import { MinutesTab } from '../minutes/MinutesTab';
import { QaTab } from '../qa/QaTab';

export const ResultWorkspace: React.FC = () => {
  const {
    activeResultTab,
    setActiveResultTab,
    rawTranscript,
    translations,
    minutesData,
    qaMessages,
  } = useSessionStore();

  const hasTranscript = Boolean(rawTranscript.trim());
  const hasTranslation = Boolean(translations.id || translations.en);
  const hasMinutes = Boolean(minutesData);
  const hasQa = qaMessages.length > 0;

  const tabs: { id: ResultTabType; label: string; icon: React.ReactNode; hasData: boolean }[] = [
    {
      id: 'transcript',
      label: 'Transkrip',
      icon: <FileText className="w-4 h-4" />,
      hasData: hasTranscript,
    },
    {
      id: 'translation',
      label: 'Terjemahan',
      icon: <Globe2 className="w-4 h-4" />,
      hasData: hasTranslation,
    },
    {
      id: 'minutes',
      label: 'Notulen',
      icon: <FileCheck2 className="w-4 h-4" />,
      hasData: hasMinutes,
    },
    {
      id: 'qa',
      label: 'Tanya AI',
      icon: <MessageSquare className="w-4 h-4" />,
      hasData: hasQa,
    },
  ];

  return (
    <div className="bg-bg-surface rounded-2xl border border-border shadow-card overflow-hidden flex flex-col">
      {/* Tab Navigation Header */}
      <div className="border-b border-border bg-bg-base/30 px-3 sm:px-6 pt-3 flex items-center justify-between overflow-x-auto">
        <div className="flex gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeResultTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveResultTab(tab.id)}
                className={`relative flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
                  isActive
                    ? 'border-terracotta-600 text-navy-900 bg-bg-surface rounded-t-lg'
                    : 'border-transparent text-txt-muted hover:text-navy-800 hover:border-border'
                }`}
              >
                <span className={isActive ? 'text-terracotta-600' : 'text-txt-muted'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.hasData && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Data tersedia" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-6 flex-1">
        {activeResultTab === 'transcript' && <TranscriptTab />}
        {activeResultTab === 'translation' && <TranslationTab />}
        {activeResultTab === 'minutes' && <MinutesTab />}
        {activeResultTab === 'qa' && <QaTab />}
      </div>
    </div>
  );
};
