import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AboutUsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ isOpen, onClose }) => {
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
      <div className="relative w-full max-w-[960px] max-h-[90vh] overflow-y-auto bg-[#F7FCFA] rounded-[24px] p-16 font-[Lexend]">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-[64px] font-bold leading-normal text-[#0F1717]">
            About Us
          </h1>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-2 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-[#00241E] stroke-[2]" />
          </button>
        </div>

        {/* Separator line */}
        <div className="h-px bg-black opacity-20 mb-10"></div>

        {/* Our Story Section */}
        <div className="flex flex-col gap-4 mb-7">
          <h2 className="text-[22px] font-bold leading-[28px] text-[#0F1717]">
            Our Story
          </h2>
          <p className="text-base font-normal leading-6 text-[#0F1717]">
            Welcome to Unpuzzle Club Academy – where learning meets passion, and every student gets the chance to unlock their full potential. For the past three years, we've been dedicated to providing top-quality training through a unique blend of flexibility, personalization, and community spirit.
          </p>
        </div>

        {/* How We Operate Section */}
        <div className="flex flex-col gap-7 mb-10">
          <h2 className="text-[22px] font-bold leading-[28px] text-[#0F1717]">
            How We Operate
          </h2>
          
          <div className="flex gap-3">
            {/* Flexibility Card */}
            <div className="flex-1 bg-white border border-[#D9E8E3] rounded-xl p-4 flex flex-col gap-3">
              <div className="w-8 h-8">
                <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M22 2H19V1C19 0.447715 18.5523 0 18 0C17.4477 0 17 0.447715 17 1V2H7V1C7 0.447715 6.55229 0 6 0C5.44772 0 5 0.447715 5 1V2H2C0.895431 2 0 2.89543 0 4V24C0 25.1046 0.895431 26 2 26H22C23.1046 26 24 25.1046 24 24V4C24 2.89543 23.1046 2 22 2ZM5 4V5C5 5.55229 5.44772 6 6 6C6.55229 6 7 5.55229 7 5V4H17V5C17 5.55229 17.4477 6 18 6C18.5523 6 19 5.55229 19 5V4H22V8H2V4H5ZM22 24H2V10H22V24ZM10 13V21C10 21.5523 9.55229 22 9 22C8.44772 22 8 21.5523 8 21V14.6175L7.4475 14.895C6.95321 15.1421 6.35215 14.9418 6.105 14.4475C5.85785 13.9532 6.05821 13.3521 6.5525 13.105L8.5525 12.105C8.8626 11.9498 9.23096 11.9664 9.5259 12.1487C9.82084 12.3311 10.0002 12.6532 10 13ZM17.395 16.8063L15 20H17C17.5523 20 18 20.4477 18 21C18 21.5523 17.5523 22 17 22H13C12.6212 22 12.275 21.786 12.1056 21.4472C11.9362 21.1084 11.9727 20.703 12.2 20.4L15.7975 15.6038C16.0205 15.3069 16.0606 14.911 15.9019 14.5755C15.7431 14.2399 15.4115 14.0199 15.0406 14.0041C14.6697 13.9882 14.3205 14.1792 14.1338 14.5C13.9603 14.8195 13.6271 15.0196 13.2635 15.0228C12.9 15.0259 12.5634 14.8315 12.3845 14.515C12.2055 14.1985 12.2124 13.8099 12.4025 13.5C13.0817 12.3247 14.4654 11.7519 15.7765 12.1032C17.0877 12.4546 17.9995 13.6426 18 15C18.0021 15.6522 17.7895 16.2869 17.395 16.8063Z" fill="#0F1717"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold leading-5 text-[#0F1717]">
                  Flexibility
                </h3>
                <p className="text-sm font-normal leading-[21px] text-[#5E8C7D]">
                  Learn at your own pace with flexible scheduling options.
                </p>
              </div>
            </div>

            {/* Personalization Card */}
            <div className="flex-1 bg-white border border-[#D9E8E3] rounded-xl p-4 flex flex-col gap-3">
              <div className="w-8 h-8">
                <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M26.1983 23.5C24.2945 20.2088 21.3608 17.8488 17.937 16.73C21.418 14.6577 23.0855 10.5152 22.0108 6.6092C20.9362 2.70322 17.3844 -0.0034008 13.3333 -0.0034008C9.28214 -0.0034008 5.7303 2.70322 4.65568 6.6092C3.58105 10.5152 5.24852 14.6577 8.7295 16.73C5.30575 17.8475 2.372 20.2075 0.468252 23.5C0.27819 23.8099 0.271288 24.1985 0.450227 24.515C0.629165 24.8315 0.965752 25.0259 1.32928 25.0228C1.69282 25.0196 2.02602 24.8195 2.1995 24.5C4.5545 20.43 8.717 18 13.3333 18C17.9495 18 22.112 20.43 24.467 24.5C24.6405 24.8195 24.9737 25.0196 25.3372 25.0228C25.7008 25.0259 26.0373 24.8315 26.2163 24.515C26.3952 24.1985 26.3883 23.8099 26.1983 23.5ZM6.33325 9C6.33325 5.13401 9.46726 2 13.3333 2C17.1992 2 20.3333 5.13401 20.3333 9C20.3333 12.866 17.1992 16 13.3333 16C9.46897 15.9959 6.33739 12.8643 6.33325 9Z" fill="#0F1717"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold leading-5 text-[#0F1717]">
                  Personalization
                </h3>
                <p className="text-sm font-normal leading-[21px] text-[#5E8C7D]">
                  Tailored learning paths to meet individual student needs.
                </p>
              </div>
            </div>

            {/* Community Spirit Card */}
            <div className="flex-1 bg-white border border-[#D9E8E3] rounded-xl p-4 flex flex-col gap-3">
              <div className="w-8 h-8">
                <svg width="31" height="23" viewBox="0 0 31 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M30.2666 12.8C29.8248 13.1314 29.198 13.0418 28.8666 12.6C27.6443 10.957 25.7144 9.99206 23.6666 10C23.2646 9.99996 22.9017 9.75916 22.7454 9.38875C22.6405 9.14019 22.6405 8.85981 22.7454 8.61125C22.9017 8.24084 23.2646 8.00004 23.6666 8C25.2256 7.99986 26.5247 6.80567 26.6557 5.25221C26.7868 3.69874 25.7062 2.30378 24.1693 2.04245C22.6323 1.78112 21.1514 2.74052 20.7616 4.25C20.6236 4.78503 20.0779 5.10682 19.5429 4.96875C19.0079 4.83068 18.6861 4.28503 18.8241 3.75C19.3582 1.68354 21.1451 0.183918 23.2729 0.0164881C25.4006 -0.150942 27.4001 1.05074 28.2508 3.00824C29.1015 4.96574 28.6158 7.2474 27.0416 8.68875C28.4014 9.2775 29.5834 10.2118 30.4704 11.3988C30.6295 11.6115 30.6974 11.8788 30.6592 12.1416C30.621 12.4045 30.4797 12.6414 30.2666 12.8ZM23.5316 20.5C23.7287 20.81 23.7399 21.2031 23.5609 21.5238C23.3819 21.8446 23.0415 22.0414 22.6742 22.0364C22.3069 22.0314 21.9719 21.8255 21.8016 21.5C20.5199 19.3298 18.1871 17.9982 15.6666 17.9982C13.1462 17.9982 10.8133 19.3298 9.53163 21.5C9.36136 21.8255 9.02637 22.0314 8.65908 22.0364C8.29179 22.0414 7.95134 21.8446 7.77233 21.5238C7.59332 21.2031 7.60457 20.81 7.80163 20.5C8.77112 18.8342 10.2494 17.5233 12.0191 16.76C9.97726 15.1967 9.1587 12.506 9.98402 10.0704C10.8093 7.6348 13.095 5.99599 15.6666 5.99599C18.2382 5.99599 20.5239 7.6348 21.3492 10.0704C22.1746 12.506 21.356 15.1967 19.3141 16.76C21.0839 17.5233 22.5621 18.8342 23.5316 20.5ZM15.6666 16C17.8758 16 19.6666 14.2091 19.6666 12C19.6666 9.79086 17.8758 8 15.6666 8C13.4575 8 11.6666 9.79086 11.6666 12C11.6666 14.2091 13.4575 16 15.6666 16ZM8.66663 9C8.66663 8.44772 8.21891 8 7.66663 8C6.10764 7.99986 4.80857 6.80567 4.67751 5.25221C4.54645 3.69874 5.62708 2.30378 7.164 2.04245C8.70092 1.78112 10.1819 2.74052 10.5716 4.25C10.7097 4.78503 11.2554 5.10682 11.7904 4.96875C12.3254 4.83068 12.6472 4.28503 12.5091 3.75C11.9751 1.68354 10.1882 0.183918 8.0604 0.0164881C5.93263 -0.150942 3.93317 1.05074 3.08248 3.00824C2.2318 4.96574 2.71747 7.2474 4.29163 8.68875C2.93323 9.27805 1.75252 10.2123 0.866626 11.3988C0.53491 11.8406 0.624173 12.4677 1.066 12.7994C1.50783 13.1311 2.13491 13.0418 2.46663 12.6C3.68894 10.957 5.61884 9.99206 7.66663 10C8.21891 10 8.66663 9.55229 8.66663 9Z" fill="#0F1717"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold leading-5 text-[#0F1717]">
                  Community Spirit
                </h3>
                <p className="text-sm font-normal leading-[21px] text-[#5E8C7D]">
                  Join a vibrant community of learners and instructors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Beyond Classes Section */}
        <div className="flex flex-col gap-4 mb-10">
          <h2 className="text-[22px] font-bold leading-[28px] text-[#0F1717]">
            Beyond Classes
          </h2>
          <p className="text-base font-normal leading-6 text-[#0F1717]">
            Whether you prefer to learn at one of our partner academies or in the comfort of your own space, we bring the right coach and the right environment to you.Our programs are designed to fit your lifestyle – offering customizable course packages, free trial classes, and one-on-one sessions on request. We track progress through monthly feedback and attendance monitoring, ensuring every learner stays motivated and on track.
          </p>
        </div>

        {/* Image Section */}
        <div className="mb-10">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/1c21e83abf95d7a06efb38322cf78748ba4421da?width=1664"
            alt="Academy landscape illustration"
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Our Promise Section */}
        <div className="flex flex-col gap-4 mb-10">
          <h2 className="text-[22px] font-bold leading-[28px] text-[#0F1717]">
            Our Promise
          </h2>
          <p className="text-base font-normal leading-6 text-[#0F1717]">
            But we're not just about classes – we're about building confidence and real-world skills. That's why we host regular practice sessions and tournaments, giving our members the chance to challenge themselves and grow in a supportive, competitive setting.
            <br /><br />
            At Unpuzzle Club Academy, we believe learning should be as engaging as it is effective – and we're here to make that happen.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-base font-normal leading-6 text-[#5E8C7D]">
            @2024 Unpuzzle Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
