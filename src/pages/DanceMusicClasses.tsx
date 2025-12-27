import { useState } from 'react'
import { Link } from 'react-router-dom'

const DanceMusicClasses = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [logoError, setLogoError] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7FCFA]">
      {/* Header */}
      <header className="flex justify-center items-center px-4 md:px-10 py-3 border-b border-[#E5E8EB]">
        <div className="flex items-center gap-4">
          <Link to="/">
            {!logoError ? (
              <img 
                src="/assets/unpuzzle-logo.png" 
                alt="UNPUZZLE.CLUB Logo" 
                className="h-20 w-auto"
                onError={() => setLogoError(true)}
              />
            ) : (
              <h1 className="text-lg font-bold text-[#121714] font-lexend">
                Unpuzzle Club
              </h1>
            )}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-5 px-4 md:px-8 lg:px-40">
        <div className="max-w-[960px] mx-auto">
          {/* Back Button */}
          <Link to="/" className="flex items-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-base text-black font-normal">Back</span>
          </Link>

          {/* Image Section */}
          <div className="flex flex-col md:flex-row h-auto md:h-[342px] mb-0">
            <div className="flex flex-col md:flex-row p-2 sm:p-3 gap-3 sm:gap-4 flex-1">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/746578b411df1930eda96f23b56d1a2fb891b106?width=1532" 
                alt="Dance and music class with children" 
                className="flex-1 h-[200px] sm:h-[250px] md:h-[306px] min-h-[180px] sm:min-h-[218px] rounded-xl object-cover w-full"
              />
              <div className="flex flex-row md:flex-col w-full md:w-[146px] gap-2 sm:gap-3 md:gap-4">
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/01519985933a7eb0bef73fb5290e61ee264244ec?width=292" 
                  alt="Kids dancing" 
                  className="flex-1 h-[100px] sm:h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/3b8b09d1aef8a77439c003be33c72fe25c471bb7?width=292" 
                  alt="Music class" 
                  className="flex-1 h-[100px] sm:h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/80bc868d06a445809f9ba43f01918fd998e4c13f?width=292" 
                  alt="Performance time" 
                  className="flex-1 h-[100px] sm:h-[120px] md:h-auto rounded-xl object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white p-2 sm:p-3">
            {/* Title */}
            <div className="flex justify-between items-start gap-2 sm:gap-3 mb-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#121714] font-lexend leading-[120%] flex-1 min-w-0 pr-2">
                Dance & Music Classes for Kids – Creativity, Rhythm, and Confidence
              </h1>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-7 h-6 bg-[#D9D9D9] rounded flex items-center justify-center flex-shrink-0"
              >
                <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.68434 0.741381C7.07487 0.350857 7.70803 0.350856 8.09856 0.74138L13.9887 6.63151C14.3792 7.02204 14.3792 7.6552 13.9887 8.04573L13.6986 8.33586C13.308 8.72639 12.6749 8.72639 12.2843 8.33586L8.09856 4.15008C7.70803 3.75955 7.07487 3.75955 6.68435 4.15008L2.49856 8.33586C2.10803 8.72639 1.47487 8.72639 1.08434 8.33586L0.794211 8.04573C0.403687 7.6552 0.403687 7.02204 0.794211 6.63151L6.68434 0.741381Z" fill="#1C1B1F"/>
                </svg>
              </button>
            </div>

            {/* Description */}
            <div className="mb-2">
              <p className="text-sm sm:text-base text-[#121714] font-normal font-lexend leading-5 sm:leading-6 break-words">
                Dance and music are two of the most powerful forms of expression.
                <br />
                Music brings melody and emotion, while dance adds movement, energy, and joy. Together, they inspire creativity, boost confidence, and create lasting memories.
                <br /><br />
                At Unpuzzle Club, we offer dance and music classes for kids that are fun, interactive, and tailored to your child's age and skill level. Whether it's singing, playing an instrument, or learning dance moves, our classes help children discover their talents while building important life skills.
                {isExpanded && (
                  <>
                    <br /><br />
                    🌟 Benefits of Dance & Music for Kids
                    <br /><br />
                    🧠 Enhances Brain Development
                    <br />
                    Music sharpens memory and listening skills, while dance improves coordination, timing, and spatial awareness.
                    <br /><br />
                    💬 Improves Self-Expression
                    <br />
                    Both dance and music help kids express emotions and ideas in creative ways.
                    <br /><br />
                    💪 Builds Physical Fitness & Discipline
                    <br />
                    Dance strengthens the body, while regular music practice develops patience and focus.
                    <br /><br />
                    😌 Reduces Stress & Improves Mood
                    <br />
                    Singing, playing music, or dancing releases positive energy and helps children relax.
                    <br /><br />
                    🎯 Boosts Confidence & Stage Presence
                    <br />
                    Performing in front of others builds courage, presence, and self-assurance.
                    <br /><br />
                    🌍 Connects with Culture & Community
                    <br />
                    Children are exposed to different styles and traditions from around the world.
                  </>
                )}{' '}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#45A180] font-normal font-lexend"
                >
                  {isExpanded ? 'See Less' : 'See More'}
                </button>
              </p>
            </div>
          </div>

          {/* Contact Us Button */}
          <div className="flex p-2 sm:p-3 justify-center mb-4">
            <a 
              href="https://wa.me/918660496605" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-11 sm:h-12 min-w-[84px] max-w-[480px] w-full sm:w-auto px-4 sm:px-5 justify-center items-center bg-[#45A180] rounded-xl hover:bg-[#3d8b6f] transition-colors"
            >
              <span className="text-sm sm:text-base font-bold text-white font-lexend">Contact Us</span>
            </a>
          </div>

          {/* Contact Section */}
          <div className="px-2 sm:px-4 mb-4">
            <div className="bg-white border border-[#D9E8E3] rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-[#121714] font-lexend mb-3 sm:mb-4">Contact</h3>
              <div className="text-xs sm:text-sm font-normal text-[#638778] font-lexend leading-6 sm:leading-[31px] break-words">
                <span className="font-bold">Call Us:</span> +91-8660496605
                <br />
                <span className="font-bold">Email:</span> contact@unpuzzle.club
                <br />
                <span className="font-bold">Skill Level:</span> Beginner to Intermediate
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="px-2 sm:px-4">
            <div className="bg-white border border-[#D9E8E3] rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-[#121714] font-lexend mb-3 sm:mb-4">Why Choose Unpuzzle Club?</h3>
              <div className="bg-white rounded-xl p-2 sm:p-4">
                <div className="text-xs sm:text-sm font-bold text-[#638778] font-lexend leading-5 sm:leading-[25px] break-words">
                  ✔ Experienced Instructors – Skilled teachers in multiple dance and music styles.
                  <br />
                  ✔ Wide Variety of Styles – Classical, contemporary, Bollywood, folk, vocals, and basic instruments.
                  <br />
                  ✔ Fun & Engaging Lessons – Learning through movement, rhythm, and creativity.
                  <br />
                  ✔ Small Batch Sizes – Personal attention for each child.
                  <br />
                  ✔ Performance Opportunities – Annual shows, competitions, and recitals.
                  <br /><br />
                  🚀 Enroll Your Child in Dance & Music Classes Today!
                  <br />
                  💡 Help your child discover the joy of melody, movement, and creativity.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DanceMusicClasses

