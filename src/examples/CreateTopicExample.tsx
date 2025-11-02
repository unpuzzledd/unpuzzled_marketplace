import React, { useState } from 'react';
import { CreateTopic } from '../components/CreateTopic';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  attachments: File[];
  createdAt: Date;
}

export const CreateTopicExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedTasks, setSubmittedTasks] = useState<Task[]>([]);

  const handleSubmit = (data: {
    title: string;
    description: string;
    dueDate?: string;
    attachments: File[];
  }) => {
    console.log('Task submitted:', data);
    const newTask: Task = {
      ...data,
      id: Date.now(),
      createdAt: new Date()
    };
    setSubmittedTasks([...submittedTasks, newTask]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Topic Example</h1>
          <p className="text-gray-600 mb-6">
            This example demonstrates the CreateTopic component which matches the Figma design.
          </p>

          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 bg-[#009963] text-white font-lexend font-bold rounded-xl hover:bg-[#007a4f] transition-colors"
          >
            Create New Topic
          </button>
        </div>

        {submittedTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Tasks</h2>
            <div className="space-y-4">
              {submittedTasks.map((task) => (
                <div key={task.id} className="border border-[#D9E8E3] rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-[#0F1717] mb-2">{task.title}</h3>
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

        {submittedTasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 font-lexend">
              No topics yet. Click "Create New Topic" to get started.
            </p>
          </div>
        )}
      </div>

      <CreateTopic
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
