import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskCategory, TaskPriority, RevenueImpact } from '../types';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import {
  CheckSquare,
  Plus,
  Search,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const TaskManagerScreen: React.FC = () => {
  const { userProfile, tasks, saveTask, toggleTask, deleteTask, triggerNotification } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    revenueImpact: 'MEDIUM',
    dueDate: 'Today',
    estimatedMinutes: 30,
  });

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'MARKETING', label: 'Marketing' },
    { id: 'SALES', label: 'Sales' },
    { id: 'FINANCE', label: 'Finance' },
    { id: 'CLIENT_MANAGEMENT', label: 'Client Ops' },
    { id: 'OPERATIONS', label: 'Operations' },
    { id: 'CONTENT', label: 'Content' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (selectedStatus === 'ACTIVE' && t.isCompleted) return false;
    if (selectedStatus === 'COMPLETED' && !t.isCompleted) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenNewModal = () => {
    setEditingTask({
      title: '',
      description: '',
      category: 'GENERAL',
      priority: 'HIGH',
      revenueImpact: 'HIGH',
      dueDate: 'Today',
      estimatedMinutes: 30,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask.title?.trim()) return;

    saveTask(editingTask);
    triggerNotification('Task Saved', `Updated "${editingTask.title}" in Task Manager.`, 'SYSTEM');
    setIsModalOpen(false);
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return isLight
          ? 'bg-red-100 text-red-800 border-red-300 font-bold'
          : 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return isLight
          ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
          : 'bg-purple-600/20 text-purple-300 border-purple-500/40';
      case 'MEDIUM':
        return isLight
          ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
          : 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'LOW':
      default:
        return isLight
          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
          : 'bg-amber-400/20 text-amber-300 border-amber-400/40';
    }
  };

  const getRevenueImpactBadge = (impact: RevenueImpact) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span
            className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${
              isLight
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30'
            }`}
          >
            $$$ High Impact
          </span>
        );
      case 'MEDIUM':
        return (
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
              isLight
                ? 'bg-cyan-100 text-cyan-950 border-cyan-300'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            $$ Med Impact
          </span>
        );
      default:
        return (
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
              isLight
                ? 'bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            }`}
          >
            $ Standard
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in overflow-x-hidden max-w-full">
      {/* Top Header Controls - Centered Add New Task Button with Purple Pulse Glow */}
      <GlassCard className="flex flex-col items-center justify-center text-center p-6 space-y-4 animate-glow-purple">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className={`text-2xl sm:text-3xl font-extrabold flex items-center justify-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <CheckSquare className="w-7 h-7 text-[#7C3AED]" /> Task Manager
          </h1>
          <p className={`text-xs sm:text-sm mt-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Prioritized business execution queue • {filteredTasks.length} tasks
          </p>
        </div>

        <div className="w-full flex items-center justify-center pt-1">
          <NeonButton onClick={handleOpenNewModal} size="md" className="px-6 py-2.5 shadow-lg">
            <Plus className="w-4 h-4" /> Add New Task
          </NeonButton>
        </div>
      </GlassCard>

      {/* Search & Filter Controls */}
      <GlassCard className="space-y-3 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by keyword..."
              className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs border focus:outline-none focus:border-[#7C3AED] ${
                isLight
                  ? 'bg-white border-purple-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#0A0C14] border-[#2E3552] text-white placeholder-slate-500'
              }`}
            />
          </div>

          <div
            className={`flex items-center gap-1 border rounded-xl p-1 text-xs ${
              isLight ? 'bg-slate-100 border-purple-200' : 'bg-[#0A0C14] border-[#2E3552]'
            }`}
          >
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((status) => {
              const isActive = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#06B6D4] text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : isLight
                    ? 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                    : 'bg-[#1E2338] text-slate-400 hover:text-white border border-[#2E3552]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <GlassCard className="text-center py-12 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              No tasks found matching filters.
            </p>
            <NeonButton onClick={handleOpenNewModal} size="sm">
              <Plus className="w-4 h-4" /> Create First Task
            </NeonButton>
          </GlassCard>
        ) : (
          filteredTasks.map((t) => (
            <GlassCard
              key={t.id}
              className={`transition-all ${
                t.isCompleted
                  ? isLight
                    ? 'opacity-60 bg-slate-100/70'
                    : 'opacity-60 bg-[#131726]/50'
                  : 'hover:border-[#7C3AED]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      t.isCompleted
                        ? 'bg-[#00E676] border-[#00E676] text-black'
                        : isLight
                        ? 'border-purple-300 hover:border-[#7C3AED]'
                        : 'border-slate-500 hover:border-[#7C3AED]'
                    }`}
                  >
                    {t.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-bold text-sm ${
                          t.isCompleted
                            ? 'line-through text-slate-400'
                            : isLight
                            ? 'text-slate-900'
                            : 'text-white'
                        }`}
                      >
                        {t.title}
                      </h3>
                      {t.isAiGenerated && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#7C3AED]/20 text-[#A78BFA] rounded flex items-center gap-1 border border-[#7C3AED]/30">
                          <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                      )}
                    </div>

                    {t.description && (
                      <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                          isLight
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : 'bg-[#1E2338] text-slate-300 border-[#2E3552]'
                        }`}
                      >
                        {t.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                      {getRevenueImpactBadge(t.revenueImpact)}
                      <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                        ⏱️ {t.estimatedMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(t)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white border-purple-200 text-slate-600 hover:text-purple-700 hover:border-purple-300'
                        : 'bg-[#0A0C14] border-[#2E3552] text-slate-400 hover:text-white'
                    }`}
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white border-purple-200 text-slate-400 hover:text-red-500 hover:border-red-300'
                        : 'bg-[#0A0C14] border-[#2E3552] text-slate-500 hover:text-red-400'
                    }`}
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border ${
              isLight ? 'bg-white border-purple-300 text-slate-900' : 'bg-[#0A0C14] border-[#2E3552] text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-purple-100' : 'border-[#2E3552]'}`}>
              <h2 className="font-bold text-lg">
                {editingTask.id ? 'Edit Priority Task' : 'Add New Priority Task'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-xl border text-slate-400 hover:text-white cursor-pointer ${
                  isLight ? 'bg-slate-100 border-purple-200 text-slate-600 hover:text-slate-900' : 'bg-[#131726] border-[#2E3552]'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="e.g. Pitch custom retainer proposal to client"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-[#7C3AED] ${
                    isLight ? 'bg-slate-50 border-purple-200 text-slate-900 placeholder-slate-400' : 'bg-[#131726] border-[#2E3552] text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Description / Action Notes
                </label>
                <textarea
                  rows={2}
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Detailed execution steps or deliverables..."
                  className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-[#7C3AED] ${
                    isLight ? 'bg-slate-50 border-purple-200 text-slate-900 placeholder-slate-400' : 'bg-[#131726] border-[#2E3552] text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Category
                  </label>
                  <select
                    value={editingTask.category}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })
                    }
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-[#7C3AED] ${
                      isLight ? 'bg-slate-50 border-purple-200 text-slate-900' : 'bg-[#131726] border-[#2E3552] text-white'
                    }`}
                  >
                    <option value="MARKETING">MARKETING</option>
                    <option value="SALES">SALES</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="CLIENT_MANAGEMENT">CLIENT OPS</option>
                    <option value="OPERATIONS">OPERATIONS</option>
                    <option value="CONTENT">CONTENT</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })
                    }
                    className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Revenue Impact
                  </label>
                  <select
                    value={editingTask.revenueImpact}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        revenueImpact: e.target.value as RevenueImpact,
                      })
                    }
                    className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="HIGH">$$$ HIGH</option>
                    <option value="MEDIUM">$$ MEDIUM</option>
                    <option value="LOW">$ LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    value={editingTask.estimatedMinutes}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, estimatedMinutes: Number(e.target.value) })
                    }
                    className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="pt-3">
                <NeonButton type="submit" size="md" fullWidth>
                  Save Priority Task
                </NeonButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
