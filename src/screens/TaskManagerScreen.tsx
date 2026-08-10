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
  const { tasks, saveTask, toggleTask, deleteTask, triggerNotification } = useApp();

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
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/30';
      case 'MEDIUM':
        return 'bg-[#2563EB]/20 text-[#60A5FA] border-[#2563EB]/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getRevenueImpactBadge = (impact: RevenueImpact) => {
    switch (impact) {
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#F59E0B]/20 text-[#F59E0B] rounded border border-[#F59E0B]/30">$$$ High Impact</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">$$ Med Impact</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-500/20 text-slate-400 rounded border border-slate-500/30">$ Standard</span>;
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#7C3AED]" /> Task Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized business execution queue • {filteredTasks.length} tasks
          </p>
        </div>
        <NeonButton onClick={handleOpenNewModal} size="md">
          <Plus className="w-4 h-4" /> Add New Task
        </NeonButton>
      </div>

      {/* Search & Filter Controls */}
      <GlassCard className="space-y-3 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by keyword..."
              className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#0A0C14] border border-[#2E3552] rounded-xl p-1 text-xs">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-[#06B6D4] text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-[#1E2338] text-slate-400 hover:text-white border border-[#2E3552]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <GlassCard className="text-center py-12 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">No tasks found matching filters.</p>
            <NeonButton onClick={handleOpenNewModal} size="sm">
              <Plus className="w-4 h-4" /> Create First Task
            </NeonButton>
          </GlassCard>
        ) : (
          filteredTasks.map((t) => (
            <GlassCard
              key={t.id}
              className={`transition-all ${
                t.isCompleted ? 'opacity-60 bg-[#131726]/50' : 'hover:border-[#7C3AED]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      t.isCompleted
                        ? 'bg-[#00E676] border-[#00E676] text-black'
                        : 'border-slate-500 hover:border-[#7C3AED]'
                    }`}
                  >
                    {t.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-bold text-sm text-white ${
                          t.isCompleted ? 'line-through text-slate-400' : ''
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
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#1E2338] text-slate-300 rounded border border-[#2E3552]">
                        {t.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                      {getRevenueImpactBadge(t.revenueImpact)}
                      <span className="text-[11px] text-slate-500">
                        ⏱️ {t.estimatedMinutes}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(t)}
                    className="p-2 text-slate-400 hover:text-white rounded-lg bg-[#0A0C14] border border-[#2E3552] transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg bg-[#0A0C14] border border-[#2E3552] transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E3552] pb-3">
              <h2 className="font-bold text-lg text-white">
                {editingTask.id ? 'Edit Priority Task' : 'Add New Priority Task'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="e.g. Pitch custom retainer proposal to client"
                  className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Action Notes
                </label>
                <textarea
                  rows={2}
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Detailed execution steps or deliverables..."
                  className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingTask.category}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })
                    }
                    className="w-full bg-[#131726] border border-[#2E3552] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
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
