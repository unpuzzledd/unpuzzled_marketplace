import { useState } from 'react'
import { Link } from 'react-router-dom'

const KarateClasses = () => {
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
                src="https://api.builder.io/api/v1/image/assets/TEMP/dc2d48186401251d0f9e6e1939c780391e4b6fc6?width=1532" 
                alt="Kids practicing karate" 
                className="flex-1 h-[200px] sm:h-[250px] md:h-[306px] min-h-[180px] sm:min-h-[218px] rounded-xl object-cover w-full"
              />
              <div className="flex flex-row md:flex-col w-full md:w-[146px] gap-2 sm:gap-3 md:gap-4">
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/67401e0d67ce7a815c802f95a9e268af4bb3ebfe?width=292" 
                  alt="Karate class training" 
                  className="flex-1 h-[100px] sm:h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/1bcac11c0dc117fc255678e0c105bb9e9b6d6f1f?width=292" 
                  alt="Karate belts and ranking" 
                  className="flex-1 h-[100px] sm:h-[120px] md:h-auto rounded-xl object-cover"
                />
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/2f7d80eaa77888a0bc912c818d769803ad329cc2?width=292" 
                  alt="Karate discipline training" 
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
                Karate Classes for Kids – Strength, Discipline, Confidence
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
                Karate is a traditional martial art from Japan that focuses on self-defense, discipline, and respect. It's not just about learning to punch or kick – it's about building strength of the body and mind.
                <br /><br />
                At Unpuzzle Club, we offer karate classes for kids that teach self-defense skills in a safe, structured, and fun environment, while also developing focus, confidence, and respect for others.
                {isExpanded && (
                  <>
                    <br /><br />
                    🌟 <strong>Benefits of Karate for Kids – Beyond Self-Defense</strong>
                    <br /><br />
                    💪 <strong>Builds Physical Fitness</strong>
                    <br />
                    Karate improves strength, flexibility, stamina, and coordination – helping kids stay healthy and active.
                    <br /><br />
                    🧠 <strong>Improves Focus & Discipline</strong>
                    <br />
                    Our karate training teaches kids to follow instructions, concentrate on tasks, and work hard to achieve their goals.
                    <br /><br />
                    😌 <strong>Boosts Confidence & Self-Esteem</strong>
                    <br />
                    With every belt earned, children gain a sense of achievement and belief in their abilities.
                    <br /><br />
                    🛡 <strong>Teaches Self-Defense Skills</strong>
                    <br />
                    Kids learn effective, age-appropriate self-defense techniques that improve their safety and awareness.
                    <br /><br />
                    💬 <strong>Promotes Respect & Teamwork</strong>
                    <br />
                    Karate instills values like respect for teachers, fellow students, and oneself – essential traits for personal growth.
                    <br /><br />
                    🌍 <strong>Encourages a Healthy Lifestyle</strong>
                    <br />
                    Karate motivates children to stay active, avoid unhealthy habits, and maintain a balanced lifestyle.
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
                <div className="text-xs sm:text-sm font-bold text-[#638778] font-lexend leading-5 sm:leading-4 break-words">
                  ✔ Certified Karate Instructors – Experienced trainers who ensure safe and correct techniques.
                  <br />
                  ✔ Structured Belt System – Step-by-step progress to keep kids motivated.
                  <br />
                  ✔ Fun & Engaging Classes – A perfect mix of learning and enjoyment.
                  <br />
                  ✔ Safe Training Environment – Focused on discipline, respect, and safety.
                  <br />
                  ✔ Life Skills Beyond the Dojo – Confidence, perseverance, and leadership.
                  <br /><br />
                  🚀 Enroll Your Child in Karate Classes Today!
                  <br />
                  💡 Give your child the gift of fitness, discipline, and self-defense.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default KarateClasses

