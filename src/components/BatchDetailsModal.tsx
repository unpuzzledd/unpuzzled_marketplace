interface BatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: {
    id: string;
    name: string;
    teacher: string;
    students: number;
  } | null;
}

export const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({ isOpen, onClose, batch }) => {
  if (!isOpen || !batch) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex w-[603px] p-16 flex-col items-start gap-6 rounded-xl bg-[#F7FCFA]">
        {/* Header */}
        <div className="flex h-[72px] p-4 justify-between items-center self-stretch">
          <h2 className="w-[288px] font-lexend text-[32px] font-bold leading-10 text-[#0F1717]">{batch.name}</h2>
          <button onClick={onClose}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L24 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M24 8L8 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-start gap-[19px] self-stretch">
          {/* Teacher and Activity */}
          <div className="flex max-w-[480px] px-3 py-4 items-end content-end gap-4 self-stretch flex-wrap">
            <div className="flex w-[186px] px-5 flex-col items-start gap-1 border-l border-[rgba(0,0,0,0.17)]">
              <span className="self-stretch font-lexend text-base font-bold leading-6 text-[#638778]">Assigned Teacher</span>
              <span className="self-stretch font-lexend text-base font-normal leading-6 text-black">Olivia Bennett</span>
            </div>
            <div className="flex w-[186px] px-5 flex-col items-start gap-1 border-l border-[rgba(0,0,0,0.17)]">
              <span className="self-stretch font-lexend text-base font-bold leading-6 text-[#638778]">Activity</span>
              <span className="self-stretch font-lexend text-base font-normal leading-6 text-black">Chess</span>
            </div>
          </div>

          {/* Student List */}
          <div className="flex max-w-[480px] px-3 py-4 items-end content-end gap-4 self-stretch flex-wrap">
            <div className="flex px-5 flex-col items-start gap-[10px] border-l border-[rgba(0,0,0,0.17)]">
              <span className="self-stretch font-lexend text-base font-bold leading-6 text-[#638778]">Student List</span>
              <p className="w-[411px] font-lexend text-base font-normal leading-6 text-black">
                Olivia Bennett, Aryan, Mahesh, Nikhil, Neeraj, Sudhanshu, Olivia Bennett, Aryan, Mahesh, Nikhil, Neeraj, Sudhanshu, Olivia Bennett, Aryan, Mahesh, Nikhil, Neeraj, Sudhanshu, 
              </p>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex max-w-[480px] px-3 py-4 items-end content-end gap-4 self-stretch flex-wrap">
            <div className="flex px-5 flex-col items-start gap-[10px] border-l border-[rgba(0,0,0,0.17)]">
              <span className="self-stretch font-lexend text-base font-bold leading-6 text-[#638778]">Start Date</span>
              <p className="w-[411px] font-lexend text-base font-normal leading-6 text-black">22 Aug, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
