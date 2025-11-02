import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TermsOfServiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ isOpen, onClose }) => {
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
            Terms of Service
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

        {/* Terms Content */}
        <div className="flex flex-col gap-[28px] mb-[28px]">
          {/* Section 1 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              1. Enrollment & Registration
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              Enrollment is confirmed only after full or partial payment and submission of required registration details.
              <br />
              Course packages are valid for the agreed duration and cannot be transferred to another person without written approval from the Academy.
              <br />
              Free trial classes are subject to availability and may be limited to one per student.
            </p>
          </div>

          {/* Section 2 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              2. Courses & Packages
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              Students may choose from multiple courses within a package, with the flexibility to attend any partner academy or arrange for sessions at their own location.
              <br />
              One-on-one classes are available on request and may have separate pricing.
              <br />
              The Academy reserves the right to modify schedules, course content, or instructors as needed.
            </p>
          </div>

          {/* Section 3 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              3. Attendance & Feedback
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              Attendance is monitored to ensure steady progress.
              <br />
              Regular monthly feedback is provided to help track development.
              <br />
              Missed classes without prior notice may not be rescheduled or refunded.
            </p>
          </div>

          {/* Section 4 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              4. Payments & Refunds
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              All fees must be paid according to the agreed payment schedule.
              <br />
              Fees for completed or ongoing sessions are non-refundable.
              <br />
              Refunds, if applicable, are at the sole discretion of the Academy and may be subject to administrative charges.
            </p>
          </div>

          {/* Section 5 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              5. Practice Sessions & Tournaments
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              Participation in practice sessions or tournaments may require prior registration.
              <br />
              The Academy is not responsible for any personal injuries or damages sustained during these activities; participants are advised to follow all safety guidelines.
            </p>
          </div>

          {/* Section 6 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              6. Code of Conduct
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              Respect instructors, fellow students, and staff at all times.
              <br />
              Disruptive or inappropriate behavior may result in suspension or termination of enrollment without refund.
            </p>
          </div>

          {/* Section 7 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              7. Liability & Safety
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              Students (or their guardians) agree that participation is at their own risk.
              <br />
              The Academy will take reasonable measures to ensure safety but is not liable for injuries, losses, or damages incurred during classes, events, or travel to and from venues.
            </p>
          </div>

          {/* Section 8 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              8. Privacy
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              Student information will be used solely for Academy operations and will not be shared with third parties without consent, except as required by law.
            </p>
          </div>

          {/* Section 9 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
              9. Changes to Terms
            </h2>
            <p className="text-base font-normal leading-6 text-[#0F1717]">
              The Academy may update these Terms of Service at any time. Changes will be posted on our website or communicated via email.
            </p>
          </div>

          {/* Final Agreement Statement */}
          <div className="text-[18px] font-bold leading-[23px] text-[#0F1717]">
            By registering with Unpuzzle Club Academy, you acknowledge that you have read, understood, and agreed to these Terms of Service.
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-base font-normal leading-6 text-[#5E8C7D]">
            © 2023 Unpuzzle Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
