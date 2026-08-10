import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskCategory, WorkflowTemplate } from '../types';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { Layers, Plus, Check, Cloud, Sparkles, Filter, Eye } from 'lucide-react';

export const WorkflowTemplatesScreen: React.FC = () => {
  const { workflowTemplates, addWorkflowTemplateToDashboard } = useApp();

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
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <GlassCard className="border-[#A78BFA]/40 bg-gradient-to-br from-[#131726] via-[#131726] to-[#1E2338]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-xs font-bold border border-[#7C3AED]/30">
              <Layers className="w-3.5 h-3.5" /> 50+ Business Playbook Library
            </div>
            <h1 className="text-2xl font-extrabold text-white">Automated Workflow Templates</h1>
            <p className="text-xs text-slate-400">
              Instant 1-click execution workflows for cold outreach, onboarding, finance & sales
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0A0C14] border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
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
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === c.id
                ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                : 'bg-[#131726] text-slate-400 hover:text-white border border-[#2E3552]'
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
              className="space-y-3 flex flex-col justify-between hover:border-[#7C3AED]/60"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1E2338] text-[#A78BFA] rounded border border-[#2E3552]">
                    {t.category}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#F59E0B]/20 text-[#F59E0B] rounded border border-[#F59E0B]/30">
                    $$$ High Impact
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white leading-snug">{t.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
              </div>

              <div className="pt-2 border-t border-[#2E3552] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedTemplate(t)}
                  className="text-xs font-semibold text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View {t.tasks.length} Steps
                </button>

                <button
                  onClick={() => handleAddWorkflow(t)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#7C3AED] hover:bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#06B6D4]">{selectedTemplate.category}</span>
                <h2 className="font-bold text-lg text-white">{selectedTemplate.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-300">{selectedTemplate.description}</p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-xs font-semibold text-slate-400">Action Steps:</span>
              {selectedTemplate.tasks.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#131726] border border-[#2E3552] rounded-xl flex items-center gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-white font-medium">{step}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <NeonButton
                onClick={() => {
                  handleAddWorkflow(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                size="md"
                fullWidth
              >
                <Plus className="w-4 h-4" /> Add Workflow to My Tasks
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
