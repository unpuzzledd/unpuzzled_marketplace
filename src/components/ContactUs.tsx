import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ContactUsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[960px] max-h-[90vh] overflow-y-auto bg-[#F7FCFA] rounded-[24px] p-16 font-lexend">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-[42px]">
          <h1 className="text-[64px] font-bold leading-normal text-[#0F1717]">
            Contact Us
          </h1>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-2 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-8 w-8 text-[#00241E] stroke-2" />
          </button>
        </div>

        {/* Separator line */}
        <div className="h-px bg-black opacity-20 mb-[42px]"></div>

        {/* Subtitle */}
        <p className="text-base font-normal leading-6 text-[#0F1717] mb-[42px]">
          We're here to help! Reach out to us through the following channels.
        </p>

        {/* Contact Information */}
        <div className="flex items-start gap-6 mb-[42px]">
          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-lg bg-[#F0F5F2]">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M19 0.5H1C0.585786 0.5 0.25 0.835786 0.25 1.25V14C0.25 14.8284 0.921573 15.5 1.75 15.5H18.25C19.0784 15.5 19.75 14.8284 19.75 14V1.25C19.75 0.835786 19.4142 0.5 19 0.5ZM10 8.48281L2.92844 2H17.0716L10 8.48281ZM7.25406 8L1.75 13.0447V2.95531L7.25406 8ZM8.36406 9.01719L9.48906 10.0531C9.77592 10.3165 10.2166 10.3165 10.5034 10.0531L11.6284 9.01719L17.0659 14H2.92844L8.36406 9.01719ZM12.7459 8L18.25 2.95437V13.0456L12.7459 8Z" fill="#0F1717"/>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-medium leading-6 text-[#0F1717]">
                Email
              </div>
              <div className="text-sm font-normal leading-[21px] text-[#5E8C7D]">
                support@unpuzzleclub.com
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-lg bg-[#F0F5F2]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.5856 11.5787L12.5856 10.0787C12.3453 9.95897 12.0592 9.97685 11.8356 10.1256L10.4584 11.0444C9.82624 10.6968 9.30598 10.1766 8.95844 9.54438L9.87719 8.16719C10.026 7.94361 10.0438 7.65755 9.92406 7.41719L8.42406 4.41719C8.29723 4.16104 8.03583 3.99926 7.75 4C5.67893 4 4 5.67893 4 7.75C4.00517 12.3042 7.69579 15.9948 12.25 16C14.3211 16 16 14.3211 16 12.25C16.0002 11.9658 15.8398 11.7059 15.5856 11.5787ZM12.25 14.5C8.52379 14.4959 5.50413 11.4762 5.5 7.75C5.4997 6.67735 6.25664 5.75363 7.30844 5.54313L8.38469 7.69938L7.46875 9.0625C7.32974 9.27102 7.30407 9.53518 7.40031 9.76656C7.93692 11.0419 8.95152 12.0565 10.2269 12.5931C10.459 12.6937 10.7262 12.6704 10.9375 12.5312L12.3072 11.6181L14.4634 12.6944C14.2513 13.7475 13.3243 14.5037 12.25 14.5ZM10 0.25C6.57597 0.249253 3.40249 2.04466 1.63954 4.97997C-0.123413 7.91527 -0.217421 11.5602 1.39188 14.5825L0.327812 17.7747C0.148045 18.3137 0.288308 18.9081 0.69011 19.3099C1.09191 19.7117 1.68626 19.852 2.22531 19.6722L5.4175 18.6081C8.99938 20.5133 13.3867 20.0013 16.4336 17.3225C19.4806 14.6438 20.5503 10.3582 19.1197 6.56183C17.689 2.76543 14.057 0.251664 10 0.25ZM10 18.25C8.54967 18.251 7.12478 17.8691 5.86938 17.1428C5.68344 17.035 5.46018 17.0121 5.25625 17.08L1.75 18.25L2.91906 14.7437C2.98723 14.5399 2.9647 14.3167 2.85719 14.1306C0.987404 10.8979 1.52233 6.8124 4.16133 4.17005C6.80034 1.52772 10.8852 0.98763 14.1202 2.85333C17.3553 4.71903 18.9336 8.52517 17.9682 12.1327C17.0028 15.7402 13.7345 18.2494 10 18.25Z" fill="#0F1717"/>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-medium leading-6 text-[#0F1717]">
                WhatsApp
              </div>
              <div className="text-sm font-normal leading-[21px] text-[#5E8C7D]">
                +91 8660-4966-05
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold leading-[23px] text-[#0F1717]">
            Connect on Social Media
          </h2>
          
          <div className="flex w-full max-w-[448px] items-center gap-[7px]">
            {/* YouTube */}
            <div className="flex h-[89px] py-[10px] flex-col items-center gap-2 flex-1 rounded-lg border border-[#D9E8E3] bg-white">
              <div className="flex p-[10px] flex-col items-center rounded-[20px] bg-[#F0F5F2]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="10" fill="#383D38"/>
                  <path d="M16.295 7.9275C16.2163 7.1679 16.047 6.3282 15.4239 5.8869C14.9413 5.5447 14.3069 5.532 13.7147 5.5327C12.4629 5.5327 11.2104 5.5348 9.95857 5.5356C8.75449 5.537 7.5504 5.5377 6.34642 5.5391C5.84342 5.5391 5.35451 5.5004 4.88731 5.7183C4.48623 5.9052 4.17222 6.2607 3.98323 6.6563C3.72123 7.2066 3.66642 7.8298 3.63478 8.4384C3.57648 9.5465 3.58282 10.6575 3.65241 11.7649C3.70361 12.573 3.83361 13.4661 4.45808 13.9812C5.01168 14.4372 5.79281 14.4597 6.51082 14.4604C8.78963 14.4625 11.0692 14.4646 13.3488 14.4661C13.641 14.4668 13.9459 14.4611 14.2437 14.4288C14.8296 14.3656 15.3881 14.1976 15.7646 13.7634C16.1446 13.3256 16.2423 12.7164 16.2999 12.1394C16.4404 10.7397 16.439 9.3266 16.295 7.9275ZM8.64071 11.9617V8.0371L12.0379 9.999L8.64071 11.9617Z" fill="white"/>
                </svg>
              </div>
              <div className="text-sm font-medium leading-[21px] text-[#0F1717] text-center">
                YouTube
              </div>
            </div>

            {/* Instagram */}
            <div className="flex h-[89px] py-[10px] flex-col items-center gap-2 flex-1 rounded-lg border border-[#D9E8E3] bg-white">
              <div className="flex p-[10px] flex-col items-center rounded-[20px] bg-[#F0F5F2]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="10" fill="#383D38"/>
                  <path d="M12.8437 4.0688H6.65701C4.94778 4.0688 3.55732 5.4597 3.55732 7.1694V12.8311C3.55732 14.5408 4.94778 15.9316 6.65701 15.9316H12.8437C14.5529 15.9316 15.9434 14.5408 15.9434 12.8311V7.1694C15.9434 5.4597 14.5529 4.0688 12.8437 4.0688ZM4.65085 7.1694C4.65085 6.063 5.55091 5.1626 6.65701 5.1626H12.8437C13.9498 5.1626 14.8499 6.063 14.8499 7.1694V12.8311C14.8499 13.9375 13.9498 14.8379 12.8437 14.8379H6.65701C5.55091 14.8379 4.65085 13.9375 4.65085 12.8311V7.1694Z" fill="white"/>
                  <path d="M9.75049 12.8839C11.3399 12.8839 12.6337 11.5904 12.6337 9.9998C12.6337 8.4092 11.3405 7.1157 9.75049 7.1157C8.16043 7.1157 6.86731 8.4092 6.86731 9.9998C6.86731 11.5904 8.16043 12.8839 9.75049 12.8839ZM9.75049 8.2102C10.7375 8.2102 11.5402 9.0132 11.5402 10.0005C11.5402 10.9878 10.7375 11.7908 9.75049 11.7908C8.76348 11.7908 7.96076 10.9878 7.96076 10.0005C7.96076 9.0132 8.76348 8.2102 9.75049 8.2102Z" fill="white"/>
                  <path d="M12.9007 7.5815C13.3287 7.5815 13.6774 7.2332 13.6774 6.8044C13.6774 6.3756 13.3294 6.0273 12.9007 6.0273C12.472 6.0273 12.1237 6.3756 12.1237 6.8044C12.1237 7.2332 12.472 7.5815 12.9007 7.5815Z" fill="white"/>
                </svg>
              </div>
              <div className="text-sm font-medium leading-[21px] text-[#0F1717] text-center">
                Instagram
              </div>
            </div>

            {/* Facebook */}
            <div className="flex h-[89px] py-[10px] flex-col items-center gap-2 flex-1 rounded-lg border border-[#D9E8E3] bg-white">
              <div className="flex p-[10px] flex-col items-center rounded-[20px] bg-[#F0F5F2]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="10" fill="#383D38"/>
                  <path d="M11.8912 8.0301V10.2086H14.5853L14.1587 13.1431H11.8912V19.9041C11.4366 19.9672 10.9714 20.0001 10.4993 20.0001C9.9543 20.0001 9.41909 19.9567 8.89796 19.8726V13.1431H6.41327V10.2086H8.89796V7.5431C8.89796 5.8895 10.238 4.5483 11.8919 4.5483V4.5497C11.8968 4.5497 11.901 4.5483 11.9059 4.5483H14.586V7.0863H12.8347C12.3143 7.0863 11.8919 7.5088 11.8919 8.0294L11.8912 8.0301Z" fill="white"/>
                </svg>
              </div>
              <div className="text-sm font-medium leading-[21px] text-[#0F1717] text-center">
                Facebook
              </div>
            </div>

            {/* LinkedIn */}
            <div className="flex h-[89px] py-[10px] flex-col items-center gap-2 flex-1 rounded-lg border border-[#D9E8E3] bg-white">
              <div className="flex p-[10px] flex-col items-center rounded-[20px] bg-[#F0F5F2]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="10" fill="#383D38"/>
                  <path d="M5.02123 6.6476C4.75785 6.4031 4.62685 6.1004 4.62685 5.7402C4.62685 5.3801 4.75852 5.0641 5.02123 4.8188C5.28461 4.5743 5.62361 4.4517 6.03896 4.4517C6.45431 4.4517 6.78014 4.5743 7.04285 4.8188C7.30623 5.0634 7.43723 5.371 7.43723 5.7402C7.43723 6.1095 7.30556 6.4031 7.04285 6.6476C6.77947 6.8922 6.44514 7.0148 6.03896 7.0148C5.63278 7.0148 5.28461 6.8922 5.02123 6.6476ZM7.21581 8.0504V15.5479H4.84752V8.0504H7.21581Z" fill="#FEFFFC"/>
                  <path d="M15.0997 8.791C15.616 9.3516 15.8738 10.121 15.8738 11.1005V15.4154H13.6245V11.4046C13.6245 10.9106 13.4963 10.5267 13.2406 10.2534C12.9849 9.9801 12.6403 9.8428 12.2088 9.8428C11.7773 9.8428 11.4326 9.9794 11.177 10.2534C10.9213 10.5267 10.7931 10.9106 10.7931 11.4046V15.4154H8.53052V8.0294H10.7931V9.0089C11.0221 8.6824 11.3311 8.4246 11.7192 8.2347C12.1072 8.0448 12.5436 7.9502 13.0291 7.9502C13.8935 7.9502 14.5841 8.2305 15.0997 8.7903V8.791Z" fill="#FEFFFC"/>
                </svg>
              </div>
              <div className="text-sm font-medium leading-[21px] text-[#0F1717] text-center">
                LinkedIn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
