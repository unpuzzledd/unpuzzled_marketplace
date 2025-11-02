import React, { useState } from 'react';
import { CreateTopic } from '../components/CreateTopic';
import { UpdateTopic } from '../components/UpdateTopic';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  attachments: File[];
  createdAt: Date;
}

export const UpdateTopicExample: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateSubmit = (data: {
    title: string;
    description: string;
    dueDate?: string;
    attachments: File[];
  }) => {
    const newTask: Task = {
      ...data,
      id: Date.now(),
      createdAt: new Date()
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateSubmit = (data: {
    title: string;
    description: string;
    dueDate?: string;
    attachments: File[];
  }) => {
    if (selectedTask) {
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, ...data }
          : task
      ));
      setSelectedTask(null);
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsUpdateOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic Management Example</h1>
          <p className="text-gray-600 mb-6">
            This example demonstrates both CreateTopic and UpdateTopic components matching the Figma design.
          </p>
          
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-[#009963] text-white font-lexend font-bold rounded-xl hover:bg-[#007a4f] transition-colors"
          >
            Create New Topic
          </button>
        </div>

        {tasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Topics</h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border border-[#D9E8E3] rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-[#0F1717] flex-1">{task.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="px-3 py-1 bg-[#F0F5F2] text-[#0F1717] font-lexend font-bold text-sm rounded-lg hover:bg-[#E0E8E5] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 font-lexend font-bold text-sm rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-[#5E8C7D] mb-2">{task.description}</p>
                  {task.dueDate && (
                    <p className="text-sm text-[#5E8C7D] mb-2">
                      <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  {task.attachments.length > 0 && (
                    <div className="text-sm text-[#5E8C7D]">
                      <strong>Attachments:</strong> {task.attachments.length} file(s)
                      <ul className="list-disc list-inside ml-4">
                        {task.attachments.map((file: File, index: number) => (
                          <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {task.createdAt.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 font-lexend">
              No topics yet. Click "Create New Topic" to get started.
            </p>
          </div>
        )}
      </div>

      <CreateTopic
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <UpdateTopic
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdateSubmit}
        initialData={selectedTask || undefined}
      />
    </div>
  );
};
