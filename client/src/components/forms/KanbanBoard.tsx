import { useState, useRef, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { toast } from 'sonner';

const COLUMNS = [
  { key: 'Todo', label: 'To Do', color: 'border-t-gray-500' },
  { key: 'InProgress', label: 'In Progress', color: 'border-t-yellow-500' },
  { key: 'Done', label: 'Done', color: 'border-t-emerald-500' },
] as const;

interface Task {
  id: string;
  title: string;
  status: string;
  description?: string | null;
  assignee?: { id: string; name: string; avatar: string | null } | null;
  createdBy: { id: string; name: string };
}

interface Props {
  tasks: Task[];
  projectId: string;
  isOwner: boolean;
  onRefresh: () => void;
}

export default function KanbanBoard({ tasks, projectId, isOwner, onRefresh }: Props) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const dragItem = useRef<{ id: string; from: string } | null>(null);

  const addTask = async (status: string) => {
    if (!newTaskTitle.trim()) return;
    await api.post(`/tasks/${projectId}`, { title: newTaskTitle, status });
    setNewTaskTitle('');
    setAddingToColumn(null);
    toast.success('Task added');
    onRefresh();
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    await api.patch(`/tasks/${taskId}`, { status: newStatus });
    onRefresh();
  };

  const handleDragStart = (taskId: string, fromStatus: string) => {
    dragItem.current = { id: taskId, from: fromStatus };
  };

  const handleDrop = (toStatus: string) => {
    if (dragItem.current && dragItem.current.from !== toStatus) {
      moveTask(dragItem.current.id, toStatus);
    }
    dragItem.current = null;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.key)}
            className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.key === 'Todo' ? 'bg-gray-400' : col.key === 'InProgress' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{col.label}</h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{colTasks.length}</span>
              </div>
              {isOwner && (
                <button
                  onClick={() => setAddingToColumn(addingToColumn === col.key ? null : col.key)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none cursor-pointer"
                >
                  +
                </button>
              )}
            </div>

            <div className="p-2 space-y-2 min-h-[100px]">
              {addingToColumn === col.key && (
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-[14px] p-2 space-y-2 border border-gray-100 dark:border-gray-800">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#6C4CF1]"
                    onKeyDown={(e) => e.key === 'Enter' && addTask(col.key)}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button onClick={() => addTask(col.key)} className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white text-xs px-3 py-1.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 cursor-pointer">Add</button>
                    <button onClick={() => { setAddingToColumn(null); setNewTaskTitle(''); }} className="text-gray-400 dark:text-gray-500 text-xs px-3 py-1 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}

              {colTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  draggable
                  onDragStart={() => handleDragStart(task.id, task.status)}
                  className="bg-white dark:bg-gray-900 rounded-[14px] p-3 cursor-grab active:cursor-grabbing border border-gray-100/80 dark:border-gray-800/80 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100">{task.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    {task.assignee ? (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{task.assignee.name}</span>
                    ) : (
                      <span />
                    )}
                    <button
                      onClick={async () => { await api.delete(`/tasks/${task.id}`); onRefresh(); toast.info('Task deleted'); }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}

              {colTasks.length === 0 && addingToColumn !== col.key && (
                <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs">Drop tasks here</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
