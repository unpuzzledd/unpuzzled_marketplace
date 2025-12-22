import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ViewTopicProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ViewTopic: React.FC<ViewTopicProps> = ({ isOpen = true, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleComplete = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="w-full max-w-[603px] h-[823px] flex flex-col items-start gap-6 rounded-xl bg-[#F7FCFA] p-16 font-lexend overflow-y-auto"
      >
        <div className="flex h-[72px] p-4 justify-between items-center self-stretch">
          <h1 className="w-[288px] text-[32px] font-bold leading-10 text-[#0F1717]">
            View Topic
          </h1>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8L24 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M24 8L8 24" stroke="#00241E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-start self-stretch">
          <div className="flex flex-col items-start gap-[-16px] self-stretch">
            <div className="flex max-w-[480px] p-3 px-4 items-end content-end gap-4 self-stretch flex-wrap">
              <div className="flex min-w-[160px] flex-col items-start flex-1">
                <div className="flex pb-2 flex-col items-start self-stretch">
                  <h2 className="self-stretch text-[20px] font-bold leading-normal text-[#1C1D1D]">
                    Understanding Chess Openings
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex max-w-[480px] p-3 px-4 items-end content-end gap-4 self-stretch flex-wrap">
              <div className="flex min-w-[160px] flex-col items-start flex-1">
                <div className="flex pb-2 flex-col items-start self-stretch">
                  <p className="self-stretch text-base font-normal leading-6 text-black opacity-80">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex max-w-[480px] p-3 px-4 items-end content-end gap-4 self-stretch flex-wrap">
            <div className="flex min-w-[160px] flex-col items-start flex-1">
              <div className="flex pb-2 flex-col items-start self-stretch">
                <p className="self-stretch text-base font-medium leading-6 text-[#0F1717]">
                  Due Date:  22' Aug 2025
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-[-14px] self-stretch">
            <div className="flex p-3 px-4 justify-center items-center gap-2 self-stretch">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/1d2b450752a6788ecc324edd141e60f54a6992de?width=435" 
                alt="Topic image 1" 
                className="h-[138px] flex-1 rounded-[7px] object-cover"
              />
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/04fcc64002280148dead709631762db53f6e7523?width=435" 
                alt="Topic image 2" 
                className="h-[138px] flex-1 rounded-[7px] object-cover"
              />
            </div>
            <div className="flex p-3 px-4 justify-center items-center gap-2 self-stretch">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/283984517e59a51ffe539a94d0f7687adddc6b99?width=435" 
                alt="Topic image 3" 
                className="h-[138px] flex-1 rounded-[7px] object-cover"
              />
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/27e8770a817f68e54382ce2375caa9be9886df14?width=435" 
                alt="Topic image 4" 
                className="h-[138px] flex-1 rounded-[7px] object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex p-0 px-4 items-center gap-4 self-stretch">
          <button 
            onClick={handleCancel}
            className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 rounded-xl bg-[#F0F5F2] hover:bg-[#E5F5F0] transition-colors"
          >
            <span className="text-sm font-bold leading-[21px] text-[#0F1717] overflow-hidden text-ellipsis whitespace-nowrap text-center">
              Cancel
            </span>
          </button>
          <button 
            onClick={handleComplete}
            className="flex h-10 min-w-[84px] max-w-[480px] px-4 justify-center items-center flex-1 rounded-xl bg-[#009963] hover:bg-[#007a4d] transition-colors"
          >
            <span className="text-sm font-bold leading-[21px] text-white overflow-hidden text-ellipsis whitespace-nowrap text-center">
              Complete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTopic;
