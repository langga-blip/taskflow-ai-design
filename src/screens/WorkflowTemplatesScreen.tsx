import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkflowTemplate } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Layers, Plus, Check, Eye, X } from 'lucide-react';

export const WorkflowTemplatesScreen: React.FC = () => {
  const { userProfile, workflowTemplates, addWorkflowTemplateToDashboard } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Playbooks (50+)' },
    { id: 'MARKETING', label: 'Marketing' },
    { id: 'SALES', label: 'Sales' },
    { id: 'FINANCE', label: 'Finance' },
    { id: 'CLIENT_MANAGEMENT', label: 'Client Ops' },
    { id: 'OPERATIONS', label: 'Operations' },
    { id: 'CONTENT', label: 'Content' },
  ];

  const filteredTemplates = workflowTemplates.filter((t) => {
    if (selectedCategory === 'ALL') return true;
    return t.category === selectedCategory;
  });

  const handleAddWorkflow = (template: WorkflowTemplate) => {
    addWorkflowTemplateToDashboard(template);
    setAddedIds((prev) => new Set(prev).add(template.id));
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in overflow-x-hidden max-w-full">
      {/* Header Banner */}
      <GlassCard
        className={`border animate-glow-amber ${
          isLight
            ? 'bg-gradient-to-br from-purple-50 via-white to-purple-50 border-amber-300/80'
            : 'border-[#F59E0B]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isLight
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : 'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/30'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 50+ Business Playbook Library
            </div>
            <h1 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Automated Workflow Templates
            </h1>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Instant 1-click execution workflows for cold outreach, onboarding, finance & sales
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-[#0A0C14] border-emerald-500/30 text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Cloud Firestore Synced
          </div>
        </div>
      </GlassCard>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {categories.map((c) => {
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                  : isLight
                  ? 'bg-white text-slate-700 hover:text-purple-900 border-purple-200'
                  : 'bg-[#131726] text-slate-400 hover:text-white border-[#2E3552]'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredTemplates.map((t) => {
          const isAdded = addedIds.has(t.id);
          return (
            <GlassCard
              key={t.id}
              className={`space-y-3 flex flex-col justify-between transition-colors ${
                isLight ? 'hover:border-purple-300' : 'hover:border-[#7C3AED]/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                      isLight
                        ? 'bg-purple-50 text-purple-900 border-purple-200'
                        : 'bg-[#1E2338] text-[#A78BFA] border-[#2E3552]'
                    }`}
                  >
                    {t.category}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#F59E0B]/20 text-[#F59E0B] rounded border border-[#F59E0B]/30">
                    $$$ High Impact
                  </span>
                </div>

                <h3 className={`font-bold text-sm leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {t.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t.description}
                </p>
              </div>

              <div
                className={`pt-2 border-t flex items-center justify-between gap-2 ${
                  isLight ? 'border-purple-100' : 'border-[#2E3552]'
                }`}
              >
                <button
                  onClick={() => setSelectedTemplate(t)}
                  className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    isLight ? 'text-purple-700 hover:underline' : 'text-[#06B6D4] hover:underline'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> View {t.tasks.length} Steps
                </button>

                <button
                  onClick={() => handleAddWorkflow(t)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                      : 'bg-[#7C3AED] hover:bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Activated
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Activate
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Workflow Steps Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 pb-24 sm:pb-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[68vh] sm:max-h-[78vh] border relative animate-scale-up ${
              isLight ? 'bg-white border-purple-300 text-slate-900' : 'bg-[#0A0C14] border-[#2E3552] text-white'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between pb-2 mb-2 border-b shrink-0 ${isLight ? 'border-purple-100' : 'border-[#2E3552]'}`}>
              <div>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isLight ? 'text-purple-700' : 'text-[#06B6D4]'}`}>
                  {selectedTemplate.category}
                </span>
                <h2 className={`font-bold text-base sm:text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedTemplate.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className={`p-1.5 sm:p-2 rounded-xl border cursor-pointer transition-colors ${
                  isLight ? 'bg-slate-100 border-purple-200 text-slate-600 hover:text-slate-900' : 'bg-[#131726] border-[#2E3552] text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs mb-2 shrink-0 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {selectedTemplate.description}
            </p>

            {/* Scrollable Steps List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 my-1 pb-2">
              <h4 className={`text-xs font-bold sticky top-0 py-1.5 backdrop-blur-md z-10 ${isLight ? 'text-purple-900 bg-white/95' : 'text-purple-300 bg-[#0A0C14]/95'}`}>
                Included Automation Steps ({selectedTemplate.tasks.length}):
              </h4>
              {selectedTemplate.tasks.map((task, idx) => {
                const stepText = typeof task === 'string' ? task : (task as any).title || String(task);
                return (
                  <div
                    key={idx}
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs transition-colors ${
                      isLight
                        ? 'bg-purple-50/70 border-purple-200 text-slate-800'
                        : 'bg-[#131726] border-[#2E3552] text-slate-200 hover:border-[#7C3AED]/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-[10px] font-extrabold flex items-center justify-center border border-[#7C3AED]/40 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-0.5">
                        <p className={`font-semibold leading-snug text-xs sm:text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {stepText}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Step {idx + 1} of {selectedTemplate.tasks.length} • Actionable Execution Task
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className={`flex items-center justify-end gap-2 pt-2.5 mt-2 border-t shrink-0 bg-inherit rounded-b-3xl ${isLight ? 'border-purple-100' : 'border-[#2E3552]'}`}>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#131726] hover:bg-[#1E2338] text-slate-300'
                }`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddWorkflow(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-xs sm:text-sm font-extrabold cursor-pointer shadow-lg hover:brightness-110 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Activate All Steps</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
