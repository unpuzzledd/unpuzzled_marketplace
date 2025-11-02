import React, { useState, useRef } from 'react';

interface CreateTopicProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    dueDate?: string;
    attachments: File[];
  }) => void;
}

export const CreateTopic: React.FC<CreateTopicProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      dueDate: dueDate || undefined,
      attachments
    });
    handleCancel();
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setAttachments([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[#F7FCFA] rounded-xl w-full max-w-[603px] flex flex-col gap-6"
        style={{ padding: '64px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex h-[72px] px-4 justify-between items-center">
          <h2 className="text-[#0F1717] font-lexend text-[32px] font-bold leading-[40px]">
            Create Topic
          </h2>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L24 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M24 8L8 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Task Title */}
          <div className="flex flex-col max-w-[480px] px-4 py-3">
            <div className="flex flex-col flex-1 min-w-[160px]">
              <div className="flex pb-2 flex-col">
                <label className="text-[#0F1717] font-lexend text-base font-normal leading-6">
                  Task Title
                </label>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter  task title"
                className="h-14 px-[15px] rounded-xl border border-[#D9E8E3] bg-white text-[#0F1717] placeholder:text-[#5E8C7D] font-lexend text-base leading-6 focus:outline-none focus:ring-2 focus:ring-[#009963] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col max-w-[480px] px-4 py-3">
            <div className="flex flex-col flex-1 min-w-[160px]">
              <div className="flex pb-2 flex-col">
                <label className="text-[#0F1717] font-lexend text-base font-normal leading-6">
                  Description
                </label>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter  Description"
                className="min-h-[144px] px-[15px] py-[15px] rounded-xl border border-[#D9E8E3] bg-white text-[#0F1717] placeholder:text-[#5E8C7D] font-lexend text-base leading-6 resize-none focus:outline-none focus:ring-2 focus:ring-[#009963] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="flex flex-col max-w-[480px] px-4 py-3">
            <div className="flex flex-col flex-1 min-w-[160px]">
              <div className="flex pb-2 flex-col">
                <label className="text-[#0F1717] font-lexend text-base font-normal leading-6">
                  Due Date (Optional)
                </label>
              </div>
              <div className="flex rounded-xl">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 h-14 px-[15px] pr-2 rounded-l-xl border-t border-b border-l border-[#D9E8E3] bg-white text-[#0F1717] placeholder:text-[#5E8C7D] font-lexend text-base leading-6 focus:outline-none focus:ring-2 focus:ring-[#009963] focus:z-10"
                  style={{
                    colorScheme: 'light'
                  }}
                />
                <div className="flex items-center justify-center pr-[15px] rounded-r-xl border-t border-r border-b border-[#D9E8E3] bg-white">
                  <div className="h-6 w-6 flex items-center justify-center">
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16.5 2H14.25V1.25C14.25 0.835786 13.9142 0.5 13.5 0.5C13.0858 0.5 12.75 0.835786 12.75 1.25V2H5.25V1.25C5.25 0.835786 4.91421 0.5 4.5 0.5C4.08579 0.5 3.75 0.835786 3.75 1.25V2H1.5C0.671573 2 0 2.67157 0 3.5V18.5C0 19.3284 0.671573 20 1.5 20H16.5C17.3284 20 18 19.3284 18 18.5V3.5C18 2.67157 17.3284 2 16.5 2V2ZM3.75 3.5V4.25C3.75 4.66421 4.08579 5 4.5 5C4.91421 5 5.25 4.66421 5.25 4.25V3.5H12.75V4.25C12.75 4.66421 13.0858 5 13.5 5C13.9142 5 14.25 4.66421 14.25 4.25V3.5H16.5V6.5H1.5V3.5H3.75ZM16.5 18.5H1.5V8H16.5V18.5V18.5ZM7.5 10.25V16.25C7.5 16.6642 7.16421 17 6.75 17C6.33579 17 6 16.6642 6 16.25V11.4631L5.58562 11.6713C5.2149 11.8566 4.76411 11.7063 4.57875 11.3356C4.39339 10.9649 4.54365 10.5141 4.91437 10.3287L6.41438 9.57875C6.64695 9.46237 6.92322 9.47478 7.14442 9.61155C7.36563 9.74832 7.50019 9.98993 7.5 10.25V10.25ZM13.0462 13.1047L11.25 15.5H12.75C13.1642 15.5 13.5 15.8358 13.5 16.25C13.5 16.6642 13.1642 17 12.75 17H9.75C9.46592 17 9.20622 16.8395 9.07918 16.5854C8.95214 16.3313 8.97955 16.0273 9.15 15.8L11.8481 12.2028C12.0153 11.9802 12.0455 11.6833 11.9264 11.4316C11.8073 11.1799 11.5586 11.0149 11.2804 11.003C11.0023 10.9912 10.7404 11.1344 10.6003 11.375C10.4702 11.6146 10.2203 11.7647 9.94765 11.7671C9.675 11.7694 9.42256 11.6236 9.28836 11.3863C9.15415 11.1489 9.15933 10.8574 9.30188 10.625C9.81125 9.74353 10.849 9.31391 11.8324 9.57743C12.8158 9.84095 13.4997 10.7319 13.5 11.75C13.5016 12.2391 13.3421 12.7152 13.0462 13.1047V13.1047Z" fill="#5E8C7D"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Attachments */}
          <div className="flex px-4 py-3 justify-center items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 min-w-[84px] max-w-[480px] px-4 items-center justify-center gap-2 rounded-lg bg-[#F0F5F2] hover:bg-[#E0E8E5] transition-colors"
            >
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.59792 15.3384L13.1736 9.04397C13.9631 8.28825 13.9631 7.06299 13.1736 6.30727C12.3842 5.55156 11.1041 5.55155 10.3146 6.30727L3.78656 12.5561C2.28652 13.9919 2.28652 16.3199 3.78656 17.7558C5.2866 19.1916 7.71864 19.1916 9.21868 17.7558L15.8421 11.4158C18.0526 9.29976 18.0526 5.86903 15.8421 3.75302C13.6315 1.63701 10.0474 1.63701 7.83682 3.75302L2.5 8.86152" stroke="#0F1717" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[#0F1717] text-center font-lexend text-sm font-bold leading-[21px]">
                Upload Attachments
              </span>
            </button>
            
            {attachments.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[#5E8C7D] text-center font-lexend text-xs leading-[21px] truncate">
                  {attachments[0].name.length > 12 
                    ? attachments[0].name.substring(0, 9) + '...' 
                    : attachments[0].name}
                </span>
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.99963 0C13.9026 0 17.7359 2.23654 19.8942 6.55273C20.0349 6.83419 20.0349 7.16579 19.8942 7.44727C17.736 11.7638 13.9027 14 9.99963 14C6.09662 13.9999 2.26326 11.7636 0.105103 7.44727C-0.0354665 7.16585 -0.0355938 6.83411 0.105103 6.55273C2.26327 2.2365 6.09666 0.000127203 9.99963 0ZM9.99963 4C8.34302 4.00021 6.99982 5.34338 6.99963 7C6.99963 8.65677 8.34291 9.99979 9.99963 10C11.6565 10 12.9996 8.6569 12.9996 7C12.9995 5.34326 11.6564 4 9.99963 4Z" fill="#5E8C7D"/>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex px-4 items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 rounded-xl bg-[#F0F5F2] hover:bg-[#E0E8E5] transition-colors"
            >
              <span className="text-[#0F1717] text-center font-lexend text-sm font-bold leading-[21px]">
                Cancel
              </span>
            </button>
            <button
              type="submit"
              className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 rounded-xl bg-[#009963] hover:bg-[#007a4f] transition-colors"
            >
              <span className="text-white text-center font-lexend text-sm font-bold leading-[21px]">
                Create Task
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
