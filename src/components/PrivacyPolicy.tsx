import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose }) => {
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
            Privacy Policy
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

        {/* Privacy Policy Content */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Introduction */}
          <div className="flex flex-col gap-3">
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              At Unpuzzle Club, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you interact with us.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              Information We Collect
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              We may collect the following types of information when you enroll, contact us, or participate in our programs:
              <br />Personal Details: Name, age, gender, address, phone number, and email.
              <br />Enrollment Information: Selected courses, schedules, and preferred learning locations.
              <br />Attendance Records: Class participation and performance updates.
              <br />Payment Information: Transaction details (processed securely through trusted payment providers).
              <br />Media Content: Photos or videos taken during classes, practice sessions, or tournaments (with consent).
            </p>
          </div>

          {/* How We Use Your Information */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              How We Use Your Information
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              We use your information to:
              <br />Process enrollments and manage your course packages.
              <br />Provide monthly feedback and track attendance.
              <br />Communicate important updates, schedules, and changes.
              <br />Organize practice sessions, tournaments, and events.
              <br />Improve our services and training programs.
              <br />Share promotional content (only with prior consent).
            </p>
          </div>

          {/* Sharing Your Information */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              Sharing Your Information
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              We do not sell, rent, or trade your personal information. We may share your details only with:
              <br />Partner academies or instructors for class arrangements.
              <br />Payment processors for secure fee transactions.
              <br />Authorities if required by law.
            </p>
          </div>

          {/* Data Security */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              Data Security
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or disclosure.
            </p>
          </div>

          {/* Your Rights */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              Your Rights
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              You have the right to:
              <br />Request access to your personal data.
              <br />Correct or update your information.
              <br />Withdraw consent for promotional use of your photos/videos.
              <br />Request deletion of your personal data (subject to legal or operational requirements).
            </p>
          </div>

          {/* Cookies & Online Tracking */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              Cookies & Online Tracking
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              If you use our website, we may use cookies to enhance your browsing experience and track usage patterns. You can manage or disable cookies through your browser settings.
            </p>
          </div>

          {/* Policy Updates */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              Policy Updates
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              We may update this Privacy Policy from time to time. Changes will be posted on our website with the updated date.
            </p>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              Contact Us
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              If you have any questions or concerns about this Privacy Policy, please contact us at:
              <br /><br />
              Unpuzzle Club
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex gap-6 mb-6">
          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-lg bg-[#F0F5F2]">
              <svg className="w-6 h-6 fill-[#0F1717]" width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M19 0.5H1C0.585786 0.5 0.25 0.835786 0.25 1.25V14C0.25 14.8284 0.921573 15.5 1.75 15.5H18.25C19.0784 15.5 19.75 14.8284 19.75 14V1.25C19.75 0.835786 19.4142 0.5 19 0.5ZM10 8.48281L2.92844 2H17.0716L10 8.48281ZM7.25406 8L1.75 13.0447V2.95531L7.25406 8ZM8.36406 9.01719L9.48906 10.0531C9.77592 10.3165 10.2166 10.3165 10.5034 10.0531L11.6284 9.01719L17.0659 14H2.92844L8.36406 9.01719ZM12.7459 8L18.25 2.95437V13.0456L12.7459 8Z" fill="#0F1717"/>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-normal leading-6 text-[#0F1717]">Email</div>
              <div className="text-sm font-normal leading-[21px] text-[#5E8C7D]">support@unpuzzle.club</div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-lg bg-[#F0F5F2]">
              <svg className="w-6 h-6 fill-[#0F1717]" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M15.5856 11.5787L12.5856 10.0787C12.3453 9.95897 12.0592 9.97685 11.8356 10.1256L10.4584 11.0444C9.82624 10.6968 9.30598 10.1766 8.95844 9.54438L9.87719 8.16719C10.026 7.94361 10.0438 7.65755 9.92406 7.41719L8.42406 4.41719C8.29723 4.16104 8.03583 3.99926 7.75 4C5.67893 4 4 5.67893 4 7.75C4.00517 12.3042 7.69579 15.9948 12.25 16C14.3211 16 16 14.3211 16 12.25C16.0002 11.9658 15.8398 11.7059 15.5856 11.5787ZM12.25 14.5C8.52379 14.4959 5.50413 11.4762 5.5 7.75C5.4997 6.67735 6.25664 5.75363 7.30844 5.54313L8.38469 7.69938L7.46875 9.0625C7.32974 9.27102 7.30407 9.53518 7.40031 9.76656C7.93692 11.0419 8.95152 12.0565 10.2269 12.5931C10.459 12.6937 10.7262 12.6704 10.9375 12.5312L12.3072 11.6181L14.4634 12.6944C14.2513 13.7475 13.3243 14.5037 12.25 14.5ZM10 0.25C6.57597 0.249253 3.40249 2.04466 1.63954 4.97997C-0.123413 7.91527 -0.217421 11.5602 1.39188 14.5825L0.327812 17.7747C0.148045 18.3137 0.288308 18.9081 0.69011 19.3099C1.09191 19.7117 1.68626 19.852 2.22531 19.6722L5.4175 18.6081C8.99938 20.5133 13.3867 20.0013 16.4336 17.3225C19.4806 14.6438 20.5503 10.3582 19.1197 6.56183C17.689 2.76543 14.057 0.251664 10 0.25ZM10 18.25C8.54967 18.251 7.12478 17.8691 5.86938 17.1428C5.68344 17.035 5.46018 17.0121 5.25625 17.08L1.75 18.25L2.91906 14.7437C2.98723 14.5399 2.9647 14.3167 2.85719 14.1306C0.987404 10.8979 1.52233 6.8124 4.16133 4.17005C6.80034 1.52772 10.8852 0.98763 14.1202 2.85333C17.3553 4.71903 18.9336 8.52517 17.9682 12.1327C17.0028 15.7402 13.7345 18.2494 10 18.25Z" fill="#0F1717"/>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-base font-normal leading-6 text-[#0F1717]">WhatsApp</div>
              <div className="text-sm font-normal leading-[21px] text-[#5E8C7D]">+91 8660-4966-05</div>
            </div>
          </div>
        </div>

        {/* Effective Date */}
        <div className="text-sm font-normal leading-[21px] text-[#5E8C7D]">
          Effective Date: July 1, 2024
        </div>
      </div>
    </div>
  );
};
