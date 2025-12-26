import { useState } from 'react';
import { BatchDetailsModal } from '../components/BatchDetailsModal';

interface Batch {
  id: string;
  name: string;
  teacher: string;
  students: number;
}

const BatchManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const batches: Batch[] = Array(8).fill(null).map((_, i) => ({
    id: `batch-${i}`,
    name: 'Batch A',
    teacher: 'Ms. Johnson',
    students: 20
  }));

  const handleViewBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedBatch(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex px-4 sm:px-6 md:px-10 py-3 justify-between items-center border-b border-[#E5E8EB]">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-[#0F1717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex flex-col items-start">
            <div className="w-4 flex-1 relative">
              <svg style={{ width: '16px', height: '16px', fill: '#0F1717' }} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.333333 0.333333H4.7778V4.7778H9.2222V9.2222H13.6667V13.6667H0.333333V0.333333V0.333333Z" fill="#0F1717"/>
              </svg>
            </div>
          </div>
          <h1 className="font-lexend text-base sm:text-lg font-bold leading-[23px] text-[#0F1717]">Unpuzzle Club</h1>
        </div>
        
        <div className="flex justify-end items-start gap-2 sm:gap-4 md:gap-8 flex-1">
          <div className="hidden md:flex h-10 items-center gap-6 lg:gap-9">
            <span className="font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Home</span>
          </div>
          <div className="hidden md:flex h-10 max-w-[480px] px-[10px] justify-center items-center gap-2 rounded-[20px] bg-[#F0F5F2]">
            <div className="flex flex-col items-center flex-1">
              <div className="flex-1 self-stretch">
                <svg style={{ width: '20px', height: '20px', fill: '#0F1717' }} width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.3281 12.7453C14.8945 11.9984 14.25 9.88516 14.25 7.125C14.25 3.67322 11.4518 0.875 8 0.875C4.54822 0.875 1.75 3.67322 1.75 7.125C1.75 9.88594 1.10469 11.9984 0.671094 12.7453C0.445722 13.1318 0.444082 13.6092 0.666796 13.9973C0.889509 14.3853 1.30261 14.6247 1.75 14.625H4.93828C5.23556 16.0796 6.51529 17.1243 8 17.1243C9.48471 17.1243 10.7644 16.0796 11.0617 14.625H14.25C14.6972 14.6244 15.1101 14.3849 15.3326 13.9969C15.5551 13.609 15.5534 13.1317 15.3281 12.7453V12.7453ZM8 15.875C7.20562 15.8748 6.49761 15.3739 6.23281 14.625H9.76719C9.50239 15.3739 8.79438 15.8748 8 15.875V15.875ZM1.75 13.375C2.35156 12.3406 3 9.94375 3 7.125C3 4.36358 5.23858 2.125 8 2.125C10.7614 2.125 13 4.36358 13 7.125C13 9.94141 13.6469 12.3383 14.25 13.375H1.75Z" fill="#0F1717"/>
                </svg>
              </div>
            </div>
          </div>
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/ec3fd35c54906d1a891fbea1c5010977b18a8366?width=80" 
            alt="Profile" 
            className="hidden sm:block w-8 h-8 md:w-10 md:h-10 rounded-[20px]"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[800px] flex-col items-start self-stretch bg-[#F7FCFA] relative">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className="flex flex-col items-start self-stretch">
          <div className="flex p-3 sm:p-4 md:p-6 justify-center items-start self-stretch">
            {/* Sidebar */}
            <div className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto flex w-[320px] h-[808px] flex-col items-start transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
              <div className="flex h-[808px] min-h-[700px] p-4 flex-col justify-between items-start shrink-0 self-stretch rounded-[20px] bg-white relative">
                {/* Close button for mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="md:hidden absolute top-4 right-4 p-2"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6 text-[#0F1717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex flex-col items-start gap-4 self-stretch">
                  {/* User Profile */}
                  <div className="flex items-start gap-3 self-stretch">
                    <img 
                      src="https://api.builder.io/api/v1/image/assets/TEMP/03fe4649b6b83549e66e7b59d2cd2df2753843b9?width=80" 
                      alt="User" 
                      className="w-10 h-10 rounded-[20px]"
                    />
                    <div className="flex h-10 flex-col items-start">
                      <span className="self-stretch font-lexend text-base font-normal leading-6 text-[#0F1717]">Unpuzzle Club</span>
                      <span className="self-stretch font-lexend text-sm font-normal leading-[21px] text-[#5E8C7D]">Teacher</span>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  <div className="flex flex-col items-start gap-2 self-stretch">
                    {/* Home */}
                    <div className="flex px-3 py-2 items-center gap-3 self-stretch">
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '18px', height: '19px', strokeWidth: '1.5px', stroke: '#000', position: 'relative', left: '3px', top: '2px' }} width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M19 9.83317V18.5004C19 19.3288 18.3284 20.0004 17.5 20.0004H13.75C12.9216 20.0004 12.25 19.3288 12.25 18.5004V14.7504C12.25 14.3361 11.9142 14.0004 11.5 14.0004H8.5C8.08579 14.0004 7.75 14.3361 7.75 14.7504V18.5004C7.75 19.3288 7.07843 20.0004 6.25 20.0004H2.5C1.67157 20.0004 1 19.3288 1 18.5004V9.83317C0.999936 9.41345 1.17573 9.0129 1.48469 8.7288L8.98469 1.65255L8.995 1.64223C9.56719 1.12186 10.4412 1.12186 11.0134 1.64223C11.0166 1.6459 11.0201 1.64935 11.0238 1.65255L18.5238 8.7288C18.8296 9.01438 19.0022 9.41473 19 9.83317V9.83317Z" stroke="black" strokeWidth="1.5"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="self-stretch font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Home</span>
                      </div>
                    </div>

                    {/* Courses */}
                    <div className="flex px-3 py-2 items-center gap-3 self-stretch">
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '24px', height: '24px', fill: '#0F1717' }} width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M20 0.5H14C12.8197 0.5 11.7082 1.05573 11 2C10.2918 1.05573 9.18034 0.5 8 0.5H2C1.17157 0.5 0.5 1.17157 0.5 2V14C0.5 14.8284 1.17157 15.5 2 15.5H8C9.24264 15.5 10.25 16.5074 10.25 17.75C10.25 18.1642 10.5858 18.5 11 18.5C11.4142 18.5 11.75 18.1642 11.75 17.75C11.75 16.5074 12.7574 15.5 14 15.5H20C20.8284 15.5 21.5 14.8284 21.5 14V2C21.5 1.17157 20.8284 0.5 20 0.5V0.5ZM8 14H2V2H8C9.24264 2 10.25 3.00736 10.25 4.25V14.75C9.6015 14.262 8.8116 13.9987 8 14V14ZM20 14H14C13.1884 13.9987 12.3985 14.262 11.75 14.75V4.25C11.75 3.00736 12.7574 2 14 2H20V14Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="self-stretch font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Courses</span>
                      </div>
                    </div>

                    {/* Students */}
                    <div className="flex px-3 py-2 items-center gap-3 self-stretch">
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '24px', height: '24px', fill: '#0F1717' }} width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.9922 10.805C13.0561 9.43099 13.9769 6.86767 13.2592 4.49441C12.5414 2.12114 10.3544 0.497718 7.875 0.497718C5.39558 0.497718 3.20857 2.12114 2.49084 4.49441C1.7731 6.86767 2.69393 9.43099 4.75781 10.805C2.93952 11.4752 1.38666 12.7153 0.330938 14.3403C0.179932 14.5647 0.161484 14.8531 0.28266 15.095C0.403836 15.3368 0.645857 15.4947 0.916031 15.5081C1.18621 15.5215 1.44266 15.3884 1.58719 15.1597C2.97076 13.0317 5.33677 11.7479 7.875 11.7479C10.4132 11.7479 12.7792 13.0317 14.1628 15.1597C14.3917 15.4999 14.8514 15.5932 15.1948 15.3692C15.5382 15.1452 15.6381 14.6869 15.4191 14.3403C14.3633 12.7153 12.8105 11.4752 10.9922 10.805V10.805ZM3.75 6.125C3.75 3.84683 5.59683 2 7.875 2C10.1532 2 12 3.84683 12 6.125C12 8.40317 10.1532 10.25 7.875 10.25C5.5979 10.2474 3.75258 8.4021 3.75 6.125V6.125ZM23.4506 15.3781C23.1037 15.6043 22.6391 15.5066 22.4128 15.1597C21.0308 13.0303 18.6636 11.7466 16.125 11.75C15.7108 11.75 15.375 11.4142 15.375 11C15.375 10.5858 15.7108 10.25 16.125 10.25C17.7863 10.2484 19.2846 9.25042 19.9261 7.71798C20.5677 6.18554 20.2273 4.4178 19.0626 3.23312C17.898 2.04844 16.1363 1.67805 14.5931 2.29344C14.3427 2.40171 14.0531 2.36541 13.8372 2.19864C13.6212 2.03188 13.5128 1.76096 13.5542 1.49125C13.5956 1.22154 13.7802 0.995581 14.0363 0.90125C16.7109 -0.165433 19.7592 0.960006 21.099 3.50883C22.4388 6.05765 21.6374 9.2067 19.2422 10.805C21.0605 11.4752 22.6133 12.7153 23.6691 14.3403C23.8953 14.6872 23.7975 15.1518 23.4506 15.3781V15.3781Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="self-stretch font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Students</span>
                      </div>
                    </div>

                    {/* Batches - Active */}
                    <div className="flex px-3 py-2 items-center gap-3 self-stretch rounded-[5000px] bg-[#F0F5F2]">
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '20px', height: '17px', fill: '#0F1717', position: 'relative', left: '2px', top: '4px' }} width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18.25 12.75H1.75V2.25H18.25V12.75ZM8.91625 3.87563L13.4163 6.87562C13.6252 7.01467 13.7507 7.24902 13.7507 7.5C13.7507 7.75098 13.6252 7.98533 13.4163 8.12438L8.91625 11.1244C8.68605 11.278 8.38998 11.2923 8.14601 11.1617C7.90204 11.0311 7.74982 10.7767 7.75 10.5V4.5C7.74982 4.22327 7.90204 3.96892 8.14601 3.83831C8.38998 3.70769 8.68605 3.72204 8.91625 3.87563Z" fill="#0F1717"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M1.75 0.75H18.25C19.0784 0.75 19.75 1.42157 19.75 2.25V12.75C19.75 13.5784 19.0784 14.25 18.25 14.25H1.75C0.921573 14.25 0.25 13.5784 0.25 12.75V2.25C0.25 1.42157 0.921573 0.75 1.75 0.75ZM1.75 12.75H18.25V2.25H1.75V12.75ZM19 17.25C19.4142 17.25 19.75 16.9142 19.75 16.5C19.75 16.0858 19.4142 15.75 19 15.75H1C0.585786 15.75 0.25 16.0858 0.25 16.5C0.25 16.9142 0.585786 17.25 1 17.25H19Z" fill="#0F1717"/>
                            <path d="M9.25 9.09844V5.90625L11.6481 7.5L9.25 9.09844Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="self-stretch font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Batches</span>
                      </div>
                    </div>

                    {/* Attendance */}
                    <div className="flex px-3 py-2 items-center gap-3 self-stretch">
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '24px', height: '24px', fill: '#0F1717' }} width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18.25 2.75H10.75V1.25C10.75 0.835786 10.4142 0.5 10 0.5C9.58579 0.5 9.25 0.835786 9.25 1.25V2.75H1.75C0.921573 2.75 0.25 3.42157 0.25 4.25V15.5C0.25 16.3284 0.921573 17 1.75 17H5.44L3.41406 19.5312C3.15518 19.8549 3.20765 20.3271 3.53125 20.5859C3.85485 20.8448 4.32705 20.7924 4.58594 20.4688L7.36 17H12.64L15.4141 20.4688C15.6729 20.7924 16.1451 20.8448 16.4688 20.5859C16.7924 20.3271 16.8448 19.8549 16.5859 19.5312L14.56 17H18.25C19.0784 17 19.75 16.3284 19.75 15.5V4.25C19.75 3.42157 19.0784 2.75 18.25 2.75V2.75ZM18.25 15.5H1.75V4.25H18.25V15.5V15.5ZM7.75 10.25V12.5C7.75 12.9142 7.41421 13.25 7 13.25C6.58579 13.25 6.25 12.9142 6.25 12.5V10.25C6.25 9.83579 6.58579 9.5 7 9.5C7.41421 9.5 7.75 9.83579 7.75 10.25V10.25ZM10.75 8.75V12.5C10.75 12.9142 10.4142 13.25 10 13.25C9.58579 13.25 9.25 12.9142 9.25 12.5V8.75C9.25 8.33579 9.58579 8 10 8C10.4142 8 10.75 8.33579 10.75 8.75V8.75ZM13.75 7.25V12.5C13.75 12.9142 13.4142 13.25 13 13.25C12.5858 13.25 12.25 12.9142 12.25 12.5V7.25C12.25 6.83579 12.5858 6.5 13 6.5C13.4142 6.5 13.75 6.83579 13.75 7.25V7.25Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="self-stretch font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Attendance</span>
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="flex px-3 py-2 items-center gap-3 self-stretch">
                      <div className="flex flex-col items-start">
                        <div className="w-6 flex-1">
                          <svg style={{ width: '24px', height: '24px', fill: '#0F1717' }} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10 5.5C7.51472 5.5 5.5 7.51472 5.5 10C5.5 12.4853 7.51472 14.5 10 14.5C12.4853 14.5 14.5 12.4853 14.5 10C14.4974 7.51579 12.4842 5.50258 10 5.5V5.5ZM10 13C8.34315 13 7 11.6569 7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10C13 11.6569 11.6569 13 10 13V13ZM18.25 10.2025C18.2537 10.0675 18.2537 9.9325 18.25 9.7975L19.6488 8.05C19.7975 7.86393 19.849 7.61827 19.7875 7.38813C19.5582 6.52619 19.2152 5.69861 18.7675 4.92719C18.6486 4.72249 18.4401 4.58592 18.205 4.55875L15.9813 4.31125C15.8888 4.21375 15.795 4.12 15.7 4.03L15.4375 1.80063C15.4101 1.56531 15.2732 1.35677 15.0681 1.23813C14.2964 0.791263 13.4689 0.448595 12.6072 0.219063C12.3769 0.157836 12.1312 0.209687 11.9453 0.35875L10.2025 1.75C10.0675 1.75 9.9325 1.75 9.7975 1.75L8.05 0.354063C7.86393 0.205326 7.61827 0.153827 7.38813 0.215312C6.52633 0.445025 5.6988 0.788016 4.92719 1.23531C4.72249 1.35417 4.58592 1.56268 4.55875 1.79781L4.31125 4.02531C4.21375 4.11844 4.12 4.21219 4.03 4.30656L1.80063 4.5625C1.56531 4.58988 1.35677 4.72682 1.23813 4.93188C0.791263 5.70359 0.448595 6.5311 0.219063 7.39281C0.157836 7.6231 0.209687 7.86878 0.35875 8.05469L1.75 9.7975C1.75 9.9325 1.75 10.0675 1.75 10.2025L0.354063 11.95C0.205326 12.1361 0.153827 12.3817 0.215312 12.6119C0.444615 13.4738 0.787627 14.3014 1.23531 15.0728C1.35417 15.2775 1.56268 15.4141 1.79781 15.4412L4.02156 15.6887C4.11469 15.7862 4.20844 15.88 4.30281 15.97L4.5625 18.1994C4.58988 18.4347 4.72682 18.6432 4.93188 18.7619C5.70359 19.2087 6.5311 19.5514 7.39281 19.7809C7.6231 19.8422 7.86878 19.7903 8.05469 19.6413L9.7975 18.25C9.9325 18.2537 10.0675 18.2537 10.2025 18.25L11.95 19.6488C12.1361 19.7975 12.3817 19.849 12.6119 19.7875C13.4738 19.5582 14.3014 19.2152 15.0728 18.7675C15.2775 18.6486 15.4141 18.4401 15.4412 18.205L15.6887 15.9813C15.7862 15.8888 15.88 15.795 15.97 15.7L18.1994 15.4375C18.4347 15.4101 18.6432 15.2732 18.7619 15.0681C19.2087 14.2964 19.5514 13.4689 19.7809 12.6072C19.8422 12.3769 19.7903 12.1312 19.6413 11.9453L18.25 10.2025ZM16.7406 9.59313C16.7566 9.86414 16.7566 10.1359 16.7406 10.4069C16.7295 10.5924 16.7876 10.7755 16.9037 10.9206L18.2341 12.5828C18.0814 13.0679 17.886 13.5385 17.65 13.9891L15.5312 14.2291C15.3467 14.2495 15.1764 14.3377 15.0531 14.4766C14.8727 14.6795 14.6805 14.8717 14.4775 15.0522C14.3387 15.1754 14.2505 15.3458 14.23 15.5303L13.9947 17.6472C13.5442 17.8833 13.0736 18.0787 12.5884 18.2313L10.9253 16.9009C10.7922 16.7946 10.6269 16.7367 10.4566 16.7369H10.4116C10.1405 16.7528 9.86883 16.7528 9.59781 16.7369C9.41226 16.7257 9.22918 16.7838 9.08406 16.9L7.41719 18.2313C6.93206 18.0786 6.46146 17.8831 6.01094 17.6472L5.77094 15.5312C5.75046 15.3467 5.66227 15.1764 5.52344 15.0531C5.32048 14.8727 5.12827 14.6805 4.94781 14.4775C4.82456 14.3387 4.6542 14.2505 4.46969 14.23L2.35281 13.9937C2.11674 13.5433 1.92128 13.0727 1.76875 12.5875L3.09906 10.9244C3.21522 10.7793 3.27336 10.5962 3.26219 10.4106C3.24625 10.1396 3.24625 9.86789 3.26219 9.59688C3.27336 9.41133 3.21522 9.22824 3.09906 9.08313L1.76875 7.41719C1.9214 6.93206 2.11685 6.46146 2.35281 6.01094L4.46875 5.77094C4.65326 5.75046 4.82362 5.66227 4.94688 5.52344C5.12733 5.32048 5.31954 5.12827 5.5225 4.94781C5.66188 4.82448 5.75043 4.65373 5.77094 4.46875L6.00625 2.35281C6.45672 2.11674 6.92733 1.92128 7.4125 1.76875L9.07563 3.09906C9.22074 3.21522 9.40383 3.27336 9.58937 3.26219C9.86039 3.24625 10.1321 3.24625 10.4031 3.26219C10.5887 3.27336 10.7718 3.21522 10.9169 3.09906L12.5828 1.76875C13.0679 1.9214 13.5385 2.11685 13.9891 2.35281L14.2291 4.46875C14.2495 4.65326 14.3377 4.82362 14.4766 4.94688C14.6795 5.12733 14.8717 5.31954 15.0522 5.5225C15.1754 5.66133 15.3458 5.74952 15.5303 5.77L17.6472 6.00531C17.8833 6.45578 18.0787 6.9264 18.2313 7.41156L16.9009 9.07469C16.7837 9.22103 16.7255 9.406 16.7378 9.59313H16.7406Z" fill="#0F1717"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="self-stretch font-lexend text-sm font-normal leading-[21px] text-[#0F1717]">Settings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex max-w-[960px] flex-col items-start flex-1 w-full">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row p-3 sm:p-4 justify-between items-start content-start gap-3 self-stretch">
                <div className="flex w-full sm:w-[288px] sm:min-w-[288px] flex-col items-start">
                  <h2 className="w-full sm:w-[410px] font-inter text-2xl sm:text-3xl md:text-[32px] font-bold leading-tight sm:leading-10 text-[#121714]">Batch Management</h2>
                </div>
                <div className="flex w-full sm:w-[430px] justify-start sm:justify-end items-center gap-4">
                  <div className="flex h-10 w-full sm:w-auto sm:min-w-[84px] sm:max-w-[480px] px-4 justify-center items-center rounded-lg bg-[#009963]">
                    <div className="flex justify-center items-start gap-1">
                      <span className="font-lexend text-sm font-normal leading-[21px] text-white overflow-hidden text-ellipsis line-clamp-1">Chess</span>
                      <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.3704 15.8351L18.8001 9.20467C19.2013 8.79094 18.9581 8 18.4297 8H5.5703C5.04189 8 4.79869 8.79094 5.1999 9.20467L11.6296 15.8351C11.8427 16.055 12.1573 16.0549 12.3704 15.8351Z" fill="white"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex px-3 py-3 sm:py-4 flex-col items-start self-stretch">
                <div className="flex h-12 min-w-[160px] flex-col items-start self-stretch w-full">
                  <div className="flex items-start flex-1 self-stretch rounded-lg">
                    <div className="flex pl-3 sm:pl-4 justify-center items-center self-stretch rounded-l-lg bg-[#F0F5F2]">
                      <div className="h-6 flex-1">
                        <svg style={{ width: '20px', height: '20px', fill: '#638778' }} className="sm:w-6 sm:h-6" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M19.5306 18.4694L14.8366 13.7762C17.6629 10.383 17.3204 5.36693 14.0591 2.38935C10.7978 -0.588237 5.77134 -0.474001 2.64867 2.64867C-0.474001 5.77134 -0.588237 10.7978 2.38935 14.0591C5.36693 17.3204 10.383 17.6629 13.7762 14.8366L18.4694 19.5306C18.7624 19.8237 19.2376 19.8237 19.5306 19.5306C19.8237 19.2376 19.8237 18.7624 19.5306 18.4694V18.4694ZM1.75 8.5C1.75 4.77208 4.77208 1.75 8.5 1.75C12.2279 1.75 15.25 4.77208 15.25 8.5C15.25 12.2279 12.2279 15.25 8.5 15.25C4.77379 15.2459 1.75413 12.2262 1.75 8.5V8.5Z" fill="#638778"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex px-3 sm:px-4 py-2 items-center flex-1 self-stretch rounded-r-lg bg-[#F0F5F2]">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search batches"
                        className="w-full bg-transparent font-inter text-sm sm:text-base font-normal leading-6 text-[#638778] placeholder:text-[#638778] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Batches Grid */}
              <div className="flex px-2 sm:px-4 flex-col items-start gap-3 self-stretch">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start gap-3 self-stretch w-full">
                  {batches.slice(0, 4).map((batch, index) => (
                    <div key={index} className="flex pt-4 sm:pt-6 pb-0 flex-col items-start gap-2 sm:gap-3 flex-1 self-stretch rounded-2xl bg-white">
                      <div className="flex px-3 sm:px-4 flex-col items-center self-stretch">
                        <img 
                          src="https://api.builder.io/api/v1/image/assets/TEMP/6eee8fb64b42d4d81fee7a7c350ea7e458b5ca2e?width=248" 
                          alt="Batch" 
                          className="w-[100px] h-[100px] sm:w-[124px] sm:h-[124px] rounded-[50px] sm:rounded-[72px]"
                        />
                      </div>
                      <div className="flex flex-col items-center self-stretch">
                        <div className="flex flex-col items-center self-stretch">
                          <span className="self-stretch font-inter text-sm sm:text-base font-normal leading-5 sm:leading-6 text-center text-[#121714]">{batch.name}</span>
                        </div>
                        <div className="flex flex-col items-center self-stretch">
                          <span className="self-stretch font-inter text-xs sm:text-sm font-normal leading-5 sm:leading-[21px] text-center text-[#638778]">
                            <span className="font-bold">Teacher:</span> {batch.teacher}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-2 sm:gap-3 self-stretch">
                          <span className="self-stretch font-inter text-xs sm:text-sm font-normal leading-5 sm:leading-[21px] text-center text-[#638778]">
                            <span className="font-bold">students:</span> {batch.students}
                          </span>
                          <div className="flex w-full sm:w-[175px] h-12 sm:h-14 px-3 sm:px-4 justify-center items-end gap-2 sm:gap-3 border-t border-[rgba(0,0,0,0.06)]">
                            <div className="flex w-[44px] sm:w-[54px] flex-col justify-center items-center gap-2 shrink-0">
                              <button className="flex p-2 sm:p-[10px] flex-col items-center rounded-[20px] bg-[#F5F0F0] min-h-[44px] sm:min-h-0">
                                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <mask id="mask0_2029_1063" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="2" y="2" width="17" height="16">
                                    <path d="M2.5 2H18.5V18H2.5V2Z" fill="white"/>
                                  </mask>
                                  <g mask="url(#mask0_2029_1063)">
                                    <path d="M17.875 8.875V5.75C17.875 4.02409 16.4759 2.625 14.75 2.625H6.25C4.52409 2.625 3.125 4.02409 3.125 5.75V14.25C3.125 15.9759 4.52409 17.375 6.25 17.375H9.5" stroke="black" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8.90625 5.4375H12.0938" stroke="black" strokeWidth="1.04" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M17.875 13.7812C17.875 15.766 16.266 17.375 14.2813 17.375C12.2965 17.375 10.6875 15.766 10.6875 13.7812C10.6875 11.7965 12.2965 10.1875 14.2813 10.1875C16.266 10.1875 17.875 11.7965 17.875 13.7812Z" stroke="black" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14.2812 14.9062V12.6562" stroke="black" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M15.4063 13.7812H13.1562" stroke="black" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                  </g>
                                </svg>
                              </button>
                            </div>
                            <div className="flex w-[44px] sm:w-[54px] flex-col justify-center items-center gap-2 shrink-0">
                              <button className="flex p-2 sm:p-[10px] flex-col items-center rounded-[20px] bg-[#EAEEFF] min-h-[44px] sm:min-h-0">
                                <svg style={{ width: '18px', height: '18px', fill: '#121714' }} className="sm:w-5 sm:h-5" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M15.2586 4.73203L11.768 1.24062C11.5335 1.00614 11.2156 0.874408 10.884 0.874408C10.5524 0.874408 10.2344 1.00614 10 1.24062L0.366406 10.875C0.130923 11.1086 -0.00105974 11.4269 0 11.7586V15.25C0 15.9404 0.559644 16.5 1.25 16.5H4.74141C5.07311 16.5011 5.39139 16.3691 5.625 16.1336L15.2586 6.5C15.4931 6.26557 15.6248 5.94759 15.6248 5.61602C15.6248 5.28445 15.4931 4.96646 15.2586 4.73203V4.73203ZM4.74141 15.25H1.25V11.7586L8.125 4.88359L11.6164 8.375L4.74141 15.25ZM12.5 7.49063L9.00859 4L10.8836 2.125L14.375 5.61562L12.5 7.49063Z" fill="#121714"/>
                                </svg>
                              </button>
                            </div>
                            <div className="flex w-[44px] sm:w-[54px] flex-col justify-center items-center gap-2 shrink-0">
                              <button 
                                onClick={() => handleViewBatch(batch)}
                                className="flex p-2 sm:p-[10px] flex-col items-center rounded-[20px] bg-[#F0F5F2] min-h-[44px] sm:min-h-0"
                              >
                                <svg style={{ width: '18px', height: '18px', fill: '#121714' }} className="sm:w-5 sm:h-5" width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M18.8211 6.74687C18.7938 6.68516 18.132 5.21719 16.6609 3.74609C14.7008 1.78594 12.225 0.75 9.5 0.75C6.775 0.75 4.29922 1.78594 2.33906 3.74609C0.867969 5.21719 0.203125 6.6875 0.178906 6.74687C0.107041 6.90852 0.107041 7.09304 0.178906 7.25469C0.20625 7.31641 0.867969 8.78359 2.33906 10.2547C4.29922 12.2141 6.775 13.25 9.5 13.25C12.225 13.25 14.7008 12.2141 16.6609 10.2547C18.132 8.78359 18.7938 7.31641 18.8211 7.25469C18.893 7.09304 18.893 6.90852 18.8211 6.74687V6.74687ZM9.5 12C7.09531 12 4.99453 11.1258 3.25547 9.40234C2.54191 8.69273 1.93483 7.88356 1.45312 7C1.9347 6.11636 2.54179 5.30717 3.25547 4.59766C4.99453 2.87422 7.09531 2 9.5 2C11.9047 2 14.0055 2.87422 15.7445 4.59766C16.4595 5.307 17.0679 6.11619 17.5508 7C16.9875 8.05156 14.5336 12 9.5 12V12ZM9.5 3.25C7.42893 3.25 5.75 4.92893 5.75 7C5.75 9.07107 7.42893 10.75 9.5 10.75C11.5711 10.75 13.25 9.07107 13.25 7C13.2478 4.92982 11.5702 3.25215 9.5 3.25V3.25ZM9.5 9.5C8.11929 9.5 7 8.38071 7 7C7 5.61929 8.11929 4.5 9.5 4.5C10.8807 4.5 12 5.61929 12 7C12 8.38071 10.8807 9.5 9.5 9.5V9.5Z" fill="#121714"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start gap-3 self-stretch w-full">
                  {batches.slice(4, 8).map((batch, index) => (
                    <div key={index + 4} className="flex pt-4 sm:pt-6 pb-0 flex-col items-start gap-2 sm:gap-3 flex-1 self-stretch rounded-2xl bg-white">
                      <div className="flex px-3 sm:px-4 flex-col items-center self-stretch">
                        <img 
                          src="https://api.builder.io/api/v1/image/assets/TEMP/6eee8fb64b42d4d81fee7a7c350ea7e458b5ca2e?width=248" 
                          alt="Batch" 
                          className="w-[100px] h-[100px] sm:w-[124px] sm:h-[124px] rounded-[50px] sm:rounded-[72px]"
                        />
                      </div>
                      <div className="flex flex-col items-center self-stretch">
                        <div className="flex flex-col items-center self-stretch">
                          <span className="self-stretch font-inter text-sm sm:text-base font-normal leading-5 sm:leading-6 text-center text-[#121714]">{batch.name}</span>
                        </div>
                        <div className="flex flex-col items-center self-stretch">
                          <span className="self-stretch font-inter text-xs sm:text-sm font-normal leading-5 sm:leading-[21px] text-center text-[#638778]">
                            <span className="font-bold">Teacher:</span> {batch.teacher}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-2 sm:gap-3 self-stretch">
                          <span className="self-stretch font-inter text-xs sm:text-sm font-normal leading-5 sm:leading-[21px] text-center text-[#638778]">
                            <span className="font-bold">students:</span> {batch.students}
                          </span>
                          <div className="flex w-full sm:w-[175px] h-12 sm:h-14 px-3 sm:px-4 justify-center items-end gap-2 sm:gap-[13px] border-t border-[rgba(0,0,0,0.06)]">
                            <div className="flex w-[44px] sm:w-[54px] flex-col justify-center items-center gap-2 shrink-0">
                              <button 
                                onClick={() => handleViewBatch(batch)}
                                className="flex p-2 sm:p-[10px] flex-col items-center rounded-[20px] bg-[#F0F5F2] min-h-[44px] sm:min-h-0"
                              >
                                <svg style={{ width: '18px', height: '18px', fill: '#121714' }} className="sm:w-5 sm:h-5" width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M18.8211 6.74687C18.7938 6.68516 18.132 5.21719 16.6609 3.74609C14.7008 1.78594 12.225 0.75 9.5 0.75C6.775 0.75 4.29922 1.78594 2.33906 3.74609C0.867969 5.21719 0.203125 6.6875 0.178906 6.74687C0.107041 6.90852 0.107041 7.09304 0.178906 7.25469C0.20625 7.31641 0.867969 8.78359 2.33906 10.2547C4.29922 12.2141 6.775 13.25 9.5 13.25C12.225 13.25 14.7008 12.2141 16.6609 10.2547C18.132 8.78359 18.7938 7.31641 18.8211 7.25469C18.893 7.09304 18.893 6.90852 18.8211 6.74687V6.74687ZM9.5 12C7.09531 12 4.99453 11.1258 3.25547 9.40234C2.54191 8.69273 1.93483 7.88356 1.45312 7C1.9347 6.11636 2.54179 5.30717 3.25547 4.59766C4.99453 2.87422 7.09531 2 9.5 2C11.9047 2 14.0055 2.87422 15.7445 4.59766C16.4595 5.307 17.0679 6.11619 17.5508 7C16.9875 8.05156 14.5336 12 9.5 12V12ZM9.5 3.25C7.42893 3.25 5.75 4.92893 5.75 7C5.75 9.07107 7.42893 10.75 9.5 10.75C11.5711 10.75 13.25 9.07107 13.25 7C13.2478 4.92982 11.5702 3.25215 9.5 3.25V3.25ZM9.5 9.5C8.11929 9.5 7 8.38071 7 7C7 5.61929 8.11929 4.5 9.5 4.5C10.8807 4.5 12 5.61929 12 7C12 8.38071 10.8807 9.5 9.5 9.5V9.5Z" fill="#121714"/>
                                </svg>
                              </button>
                            </div>
                            <div className="flex w-[44px] sm:w-[54px] flex-col justify-center items-center gap-2 shrink-0">
                              <button className="flex p-2 sm:p-[10px] flex-col items-center rounded-[20px] bg-[#F5F0F0] min-h-[44px] sm:min-h-0">
                                <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <mask id="mask0_2029_1115" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="2" y="2" width="17" height="16">
                                    <path d="M2.5 2H18.5V18H2.5V2Z" fill="white"/>
                                  </mask>
                                  <g mask="url(#mask0_2029_1115)">
                                    <path d="M17.875 8.875V5.75C17.875 4.02409 16.4759 2.625 14.75 2.625H6.25C4.52409 2.625 3.125 4.02409 3.125 5.75V14.25C3.125 15.9759 4.52409 17.375 6.25 17.375H9.5" stroke="black" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8.90625 5.4375H12.0938" stroke="black" strokeWidth="1.04" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M17.875 13.7812C17.875 15.766 16.266 17.375 14.2813 17.375C12.2965 17.375 10.6875 15.766 10.6875 13.7812C10.6875 11.7965 12.2965 10.1875 14.2813 10.1875C16.266 10.1875 17.875 11.7965 17.875 13.7812Z" stroke="black" strokeWidth="1.04" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14.2812 14.9062V12.6562" stroke="black" strokeWidth="1.04" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M15.4063 13.7812H13.1562" stroke="black" strokeWidth="1.04" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                                  </g>
                                </svg>
                              </button>
                            </div>
                            <div className="flex w-[44px] sm:w-[54px] flex-col justify-center items-center gap-2 shrink-0">
                              <button className="flex p-2 sm:p-[10px] flex-col items-center rounded-[20px] bg-[#EAEEFF] min-h-[44px] sm:min-h-0">
                                <svg style={{ width: '18px', height: '18px', fill: '#121714' }} className="sm:w-5 sm:h-5" width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M15.2586 4.73203L11.768 1.24062C11.5335 1.00614 11.2156 0.874408 10.884 0.874408C10.5524 0.874408 10.2344 1.00614 10 1.24062L0.366406 10.875C0.130923 11.1086 -0.00105974 11.4269 0 11.7586V15.25C0 15.9404 0.559644 16.5 1.25 16.5H4.74141C5.07311 16.5011 5.39139 16.3691 5.625 16.1336L15.2586 6.5C15.4931 6.26557 15.6248 5.94759 15.6248 5.61602C15.6248 5.28445 15.4931 4.96646 15.2586 4.73203V4.73203ZM4.74141 15.25H1.25V11.7586L8.125 4.88359L11.6164 8.375L4.74141 15.25ZM12.5 7.49063L9.00859 4L10.8836 2.125L14.375 5.61562L12.5 7.49063Z" fill="#121714"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Details Modal */}
      <BatchDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        batch={selectedBatch}
      />
    </div>
  );
};

export default BatchManagement;
