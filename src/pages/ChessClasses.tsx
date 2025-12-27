import { useState } from 'react'
import { Link } from 'react-router-dom'

const ChessClasses = () => {
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
                src="https://api.builder.io/api/v1/image/assets/TEMP/23eca56508683f49227da4dcb147c323c66a9a18?width=1532" 
                alt="Chess board with pieces" 
                className="flex-1 h-[250px] md:h-[306px] min-h-[218px] rounded-xl object-cover"
              />
              <div className="flex flex-row md:flex-col w-full md:w-[146px] gap-4">
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/f00762ed8161ec9c3c4ba35c9f6a5208ce54f94e?width=292" 
                  alt="Chess pieces" 
                  className="flex-1 h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/161b0131316a9a25c239ec9ab4e75558cc4c9432?width=292" 
                  alt="Chess game" 
                  className="flex-1 h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/8ed3916fa5bb7a6afaaed49e72909214b4d82143?width=292" 
                  alt="Chess tournament" 
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
                Chess Classes for Kids – Learn, Think, Success
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
                Chess is one of the oldest and most respected mind games in the world. Played on a 64-square board, it's a game of strategy, focus, and creativity.
                <br />
                At Unpuzzle Club, We offer engaging Chess classes for kids that make learning fun while developing powerful life skills. Whether your child is a complete beginner or already knows the basics, our expert coaches will help them grow in confidence, skill, and thinking ability.
                {isExpanded && (
                  <>
                    <br />
                    🌟 Why Chess is the Best Gift for Your Child's Future ?
                    <br />
                    📚 Boosts Academic Performance.
                    <br />
                    Children who play chess regularly show improved memory, concentration, and problem-solving skills, which help them excel in Math, Science, and other Subjects.
                    <br /><br />
                    🧠 Improves Decision-Making
                    <br />
                    Chess teaches kids to think ahead, Evaluate options, and choose the best move – skills they can apply to everyday life.
                    <br /><br />
                    ⏳ Builds Patience & Focus.
                    <br />
                    Our chess coaching encourages kids to Stay calm, Concentrate deeply, and think before they act – traits that lead to Success.
                    <br /><br />
                    🎨 Encourages Creativity.
                    <br />
                    From bold sacrifices to clever traps, Chess inspires kids to think outside the box and approach challenges creatively.
                    <br /><br />
                    💪 Develops Emotional Strength.
                    <br />
                    Winning builds confidence, while losing teaches resilience. Chess helps children handle both success and setbacks with maturity.
                    <br /><br />
                    🌍 A Skill for Life
                    <br />
                    Chess is a global game. No matter where they go, your child will always find a chessboard – and a chance to make new friends.
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
              <h3 className="text-base font-bold text-[#121714] font-lexend mb-4">Why Choose Unpuzzle Club for Chess Training?</h3>
              <div className="bg-white rounded-xl p-4">
                <div className="text-sm font-semibold text-[#638778] font-lexend leading-[21px]">
                  <span className="font-bold">✔ Expert Chess Coaches – Skilled trainers with years of experience</span>
                  <br />
                  <span className="font-bold">✔ Interactive, Fun Learning – Keeping children engaged and motivated</span>
                  <br />
                  <span className="font-bold">✔ Personalized Coaching Plans – Tailored to each child's learning pace</span>
                  <br />
                  <span className="font-bold">✔ Online / Offline Classes – Flexible learning from anywhere</span>
                  <br />
                  <span className="font-bold">✔ Focus on Life Skills – Not just chess moves, but thinking skills for life</span>
                  <br /><br />
                  <span className="font-bold">🚀 Enroll Your Child Today!</span>
                  <br />
                  <span className="font-bold">💡 Give your child a Head start in life with the Power of Chess.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChessClasses

