import React, { useState } from 'react';
import { AboutUs } from '../components/AboutUs';

export const AboutUsExample: React.FC = () => {
  const [showAboutUs, setShowAboutUs] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FCFA] p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-[#0F1717] mb-6 font-[Lexend]">
          About Us Component Example
        </h1>
        
        <p className="text-[#5E8C7D] mb-6">
          Click the button below to open the About Us modal component.
        </p>
        
        <button
          onClick={() => setShowAboutUs(true)}
          className="w-full px-6 py-3 bg-[#009963] text-white font-semibold rounded-lg hover:bg-[#007a4d] transition-colors"
        >
          Open About Us
        </button>
        
        <div className="mt-8 p-4 bg-white border border-[#DBE5E0] rounded-lg">
          <h2 className="text-lg font-semibold text-[#0F1717] mb-2">
            Usage Instructions:
          </h2>
          <ul className="text-sm text-[#5E8C7D] space-y-1">
            <li>• Import the AboutUs component</li>
            <li>• Use state to control the modal visibility</li>
            <li>• Pass isOpen and onClose props</li>
            <li>• The modal supports backdrop click to close</li>
            <li>• Responsive design with scroll for smaller screens</li>
          </ul>
        </div>
      </div>

      <AboutUs 
        isOpen={showAboutUs} 
        onClose={() => setShowAboutUs(false)} 
      />
    </div>
  );
};
