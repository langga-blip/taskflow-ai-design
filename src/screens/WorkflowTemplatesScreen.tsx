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
        className={`border ${
          isLight
            ? 'bg-gradient-to-br from-purple-50 via-white to-purple-50 border-purple-200'
            : 'border-[#A78BFA]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]'
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap border ${
              selectedCategory === c.id
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                : isLight
                ? 'bg-white text-slate-700 hover:text-purple-900 border-purple-200'
                : 'bg-[#131726] text-slate-400 hover:text-white border-[#2E3552]'
            }`}
          >
            {c.label}
          </button>
        ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border ${
              isLight ? 'bg-white border-purple-300 text-slate-900' : 'bg-[#0A0C14] border-[#2E3552] text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-purple-100' : 'border-[#2E3552]'}`}>
              <div>
                <span className={`text-[10px] font-bold ${isLight ? 'text-purple-700' : 'text-[#06B6D4]'}`}>
                  {selectedTemplate.category}
                </span>
                <h2 className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedTemplate.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className={`p-2 rounded-xl border cursor-pointer ${
                  isLight ? 'bg-slate-100 border-purple-200 text-slate-600 hover:text-slate-900' : 'bg-[#131726] border-[#2E3552] text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {selectedTemplate.description}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className={`text-xs font-bold ${isLight ? 'text-purple-900' : 'text-purple-300'}`}>
                Included Automation Steps ({selectedTemplate.tasks.length}):
              </h4>
              {selectedTemplate.tasks.map((task, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-[#131726] border-[#2E3552]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {idx + 1}. {task.title}
                    </span>
                    <span className="text-[10px] text-purple-600 font-semibold">{task.estimatedMinutes}m</span>
                  </div>
                  {task.description && (
                    <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{task.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#131726] text-slate-300'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddWorkflow(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#8B5CF6] text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Activate All Steps
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
