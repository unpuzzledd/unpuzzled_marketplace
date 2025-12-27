import { useState } from 'react'
import { Link } from 'react-router-dom'

const ArtsClasses = () => {
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
            <div className="flex flex-col md:flex-row p-3 gap-4 flex-1">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/4d5a163ebb4b1aaf19d3a2ef9b28ff6d4af207e0?width=1532" 
                alt="Kids doing arts and crafts" 
                className="flex-1 h-[250px] md:h-[306px] min-h-[218px] rounded-xl object-cover"
              />
              <div className="flex flex-row md:flex-col w-full md:w-[146px] gap-4">
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/419eb0ecd81845f3434666675c17321bde1ad0fa?width=292" 
                  alt="Art supplies and materials" 
                  className="flex-1 h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/de15dbe6969b4881658e23258f0534126e4b3507?width=292" 
                  alt="Children painting" 
                  className="flex-1 h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/db63623cd0a8eb4f79f5785a5923c8ef7a53f168?width=292" 
                  alt="Art class in session" 
                  className="flex-1 h-[120px] md:h-auto rounded-xl object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white p-3">
            {/* Title */}
            <div className="flex justify-between items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#121714] font-lexend leading-[120%] w-[863px]">
                Arts Classes for Kids – Create, Imagine, Inspire
              </h1>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-7 h-6 bg-[#D9D9D9] rounded flex items-center justify-center"
              >
                <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.68434 0.741381C7.07487 0.350857 7.70803 0.350856 8.09856 0.74138L13.9887 6.63151C14.3792 7.02204 14.3792 7.6552 13.9887 8.04573L13.6986 8.33586C13.308 8.72639 12.6749 8.72639 12.2843 8.33586L8.09856 4.15008C7.70803 3.75955 7.07487 3.75955 6.68435 4.15008L2.49856 8.33586C2.10803 8.72639 1.47487 8.72639 1.08434 8.33586L0.794211 8.04573C0.403687 7.6552 0.403687 7.02204 0.794211 6.63151L6.68434 0.741381Z" fill="#1C1B1F"/>
                </svg>
              </button>
            </div>

            {/* Description */}
            <div className="mb-2">
              <p className="text-base text-[#121714] font-normal font-lexend leading-6">
                Art is the language of creativity – a way for children to express their thoughts, feelings, and ideas through colours, shapes, and imagination.
                <br /><br />
                At Unpuzzle Club, we provide engaging arts classes for kids that go beyond simple drawing and colouring. We help children explore painting, sketching, craftwork, and creative design – developing skills that enrich their personality and boost their confidence.
                {isExpanded && (
                  <>
                    <br /><br />
                    🌟 <strong>Why Art is Important for Your Child's Growth</strong>
                    <br /><br />
                    🧠 <strong>Enhances Creativity & Imagination</strong>
                    <br />
                    Art encourages children to think in new ways, explore unique ideas, and develop original solutions to challenges.
                    <br /><br />
                    ✋ <strong>Improves Motor Skills</strong>
                    <br />
                    Activities like drawing, colouring, and crafting improve hand-eye coordination and fine motor skills.
                    <br /><br />
                    💬 <strong>Boosts Self-Expression</strong>
                    <br />
                    Art gives children a voice without words. They learn to express their feelings, stories, and dreams through their creations.
                    <br /><br />
                    😌 <strong>Reduces Stress & Improves Focus</strong>
                    <br />
                    Art is calming and therapeutic. It helps children relax, stay focused, and enjoy the process of creating.
                    <br /><br />
                    💡 <strong>Builds Problem-Solving Skills</strong>
                    <br />
                    Whether choosing the right colours or deciding how to complete a project, art teaches kids to make decisions and think critically.
                    <br /><br />
                    🎯 <strong>Encourages Confidence & Independence</strong>
                    <br />
                    Every completed artwork is a confidence booster, inspiring kids to trust their abilities and explore new challenges.
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
          <div className="flex p-3 justify-center mb-4">
            <a 
              href="https://wa.me/918660496605" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-12 min-w-[84px] max-w-[480px] px-5 justify-center items-center bg-[#45A180] rounded-xl hover:bg-[#3d8b6f] transition-colors"
            >
              <span className="text-base font-bold text-white font-lexend">Contact Us</span>
            </a>
          </div>

          {/* Contact Section */}
          <div className="px-4 mb-4">
            <div className="bg-white border border-[#D9E8E3] rounded-xl p-4">
              <h3 className="text-base font-bold text-[#121714] font-lexend mb-4">Contact</h3>
              <div className="text-sm font-normal text-[#638778] font-lexend leading-[31px]">
                <span className="font-bold">Call Us:</span> +91-8660496605
                <br />
                <span className="font-bold">Email:</span> contact@unpuzzle.club
                <br />
                <span className="font-bold">Skill Level:</span> Beginner to Intermediate
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="px-4">
            <div className="bg-white border border-[#D9E8E3] rounded-xl p-4">
              <h3 className="text-base font-bold text-[#121714] font-lexend mb-4">Why Choose Unpuzzle Club?</h3>
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm font-semibold text-[#638778] font-lexend leading-[25px]">
                  <span className="font-bold">✔ Experienced Art Instructors – Passionate mentors who guide children step-by-step.</span>
                  <br />
                  <span className="font-bold">✔ Variety of Art Forms – Drawing, painting, crafts, creative design, and more.</span>
                  <br />
                  <span className="font-bold">✔ Fun, Interactive Learning – Engaging sessions that keep kids excited.</span>
                  <br />
                  <span className="font-bold">✔ Small Batch Sizes – More personal attention for each child.</span>
                  <br />
                  <span className="font-bold">✔ Focus on Creativity & Personality Growth – Art that shapes both skill and character.</span>
                  <br /><br />
                  <span className="font-bold">🚀 Enroll Your Child in Arts Classes Today!</span>
                  <br />
                  <span className="font-bold">💡 Help your child unlock their imagination and build a lifetime love for creativity.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ArtsClasses

