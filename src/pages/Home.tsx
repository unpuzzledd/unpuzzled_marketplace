import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AboutUs } from '../components/AboutUs'
import { ContactUs } from '../components/ContactUs'
import { TermsOfService } from '../components/TermsOfService'
import { PrivacyPolicy } from '../components/PrivacyPolicy'
import WhyChooseUs from '../components/WhyChooseUs'

const Home = () => {
  const navigate = useNavigate()
  const [showAboutUs, setShowAboutUs] = useState(false)
  const [showContactUs, setShowContactUs] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const [showTrialForm, setShowTrialForm] = useState(false)
  const [showInstructorForm, setShowInstructorForm] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [logoError, setLogoError] = useState(false)
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [isSignInLoading, setIsSignInLoading] = useState(false)
  const { user, loading, smartLoginWithGoogle, signUpWithGoogle, signOut } = useAuth()

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user) {
      
      // Check if user is admin - only redirect if they have admin session
      if (user.role === 'admin' || user.role === 'super_admin') {
        // Check if user has admin session before redirecting to admin dashboard
        const adminSession = localStorage.getItem('admin_session')
        if (adminSession) {
          navigate('/admin')
        } else {
          // User has admin role but no admin session - don't redirect, let them stay on home
          // They can manually navigate to /admin/signin if needed
          return
        }
      } else if (user.role === 'student') {
        navigate('/student')
      } else if (user.role === 'teacher') {
        navigate('/teacher')
      } else if (user.role === 'academy_owner') {
        navigate('/academy')
      } else if (user.role) {
        navigate('/dashboard')
      } else {
        // User without role - go to role selection
        navigate('/role-selection')
      }
    }
  }, [user, loading, navigate])

  const heroImages = [
    'https://api.builder.io/api/v1/image/assets/TEMP/bfea38818cfa85e9f7731bacb5edc374b80870b6?width=1856',
    'https://api.builder.io/api/v1/image/assets/TEMP/d8f2abe7ff68c5238037e6d5ef0143c18df05111?width=1856',
    'https://api.builder.io/api/v1/image/assets/TEMP/c07e83efe5046620ca4dd0cf12b93f60672e65a5?width=1856'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000) // Auto-advance every 5 seconds

    return () => clearInterval(interval)
  }, [heroImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleSmartLogin = async () => {
    setIsSignInLoading(true)
    try {
      await smartLoginWithGoogle()
    } finally {
      setIsSignInLoading(false)
    }
  }

  const handleSignUp = async () => {
    setIsSignUpLoading(true)
    try {
      await signUpWithGoogle()
    } finally {
      setIsSignUpLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const activities = ['Chess', 'Karate', 'Art', 'Music/Dance']
  
  const courses = [
    {
      id: 1,
      title: 'Chess Classes for Kids',
      description: 'Basic to Pro',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ebe220995921bbba1e54b898e4fe7c038a5c8f85?width=480'
    },
    {
      id: 2,
      title: 'Karate Classes for Kids',
      description: 'Karate for self-defense',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/d2fecf20374fedd37b28150269b0efbadb239748?width=480'
    },
    {
      id: 3,
      title: 'Arts Classes for Kids',
      description: 'Beginner to advanced Painting',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/84b405ee05f99cbdf7c861d5fe9163abd8deb4dc?width=480'
    },
    {
      id: 4,
      title: 'Dance & Music Classes',
      description: 'Music theory for all levels',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/82a0864f111c5c43b8ae85b86f1d126e9009c4dd?width=480'
    }
  ]

  const testimonials = [
    {
      id: 1,
      name: 'Manish Gupta',
      reviews: 1,
      rating: 5,
      timeAgo: 'a month ago',
      text: 'Divyansh as a coach.Helping my children in chess improvement.He is very Humble and good at teaching...❤️'
    },
    {
      id: 2,
      name: 'Shivi Sahu',
      reviews: 1,
      rating: 5,
      timeAgo: 'a month ago',
      text: 'Best academy for beginners and someone who is looking to pursue his career in chess. Coach Divyanshu has helped me to clear my concepts and I am doing better each day.'
    },
    {
      id: 3,
      name: 'rajeev singh',
      reviews: 25,
      isLocalGuide: true,
      rating: 5,
      timeAgo: '7 months ago',
      text: 'My daughter, Anaya, has had an amazing learning experience at Vishal Chess Academy. Under the guidance of Coach Mahesh, she has improved significantly in her gameplay, strategy, and confidence. The structured training, personalized attention, and focus on competitive preparation have helped her achieve a silver medal in a recent tournament! The academy provides a great learning environment for young chess enthusiasts. Highly recommend it to anyone looking for quality chess coaching!'
    },
    {
      id: 4,
      name: 'humera nazneen shaik',
      reviews: 3,
      rating: 5,
      timeAgo: '3 months ago',
      text: 'Academy is well-suited for those new to chess or looking to improve their skills.My friend\'s child is learning here in this academy.Explaining concepts in a simple and understandable manner. Coaches are well experienced and expertise.'
    },
    {
      id: 5,
      name: 'Rahul U S',
      reviews: 7,
      rating: 5,
      timeAgo: '2 months ago',
      text: 'My son had a very good experience at Vishal Chess Academy. They have very friendly and encouraging coaches. Recommended.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F7FCFA]">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-10 py-6 border-b border-[#E5E8EB]">
        <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              {!logoError ? (
                <img 
                  src="/assets/unpuzzle-logo.png" 
                  alt="UNPUZZLE.CLUB Logo" 
                  className="h-24 w-auto"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <h1 className="text-xl font-bold text-[#0D1C17] font-lexend">
                  Unpuzzle Club
                </h1>
              )}
            </Link>
        </div>
        
        {/* Authentication Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#009963]"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-sm md:text-base text-[#0D1C17] font-lexend hover:text-[#009963] transition-colors"
              >
                {user.full_name || user.email}
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-[#009963] text-[#F7FCFA] font-bold text-xs sm:text-sm rounded-xl font-lexend min-w-[80px] sm:min-w-[100px] h-[44px] sm:h-[49px] flex items-center justify-center hover:bg-[#007a4d] transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/admin/signin"
                className="px-3 sm:px-4 py-2 sm:py-3 bg-[#E5F5F0] text-[#0D1C17] font-bold text-xs sm:text-sm rounded-xl font-lexend min-w-[80px] sm:min-w-[100px] h-[44px] sm:h-[49px] flex items-center justify-center hover:bg-[#D9E8E3] transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={handleSignUp}
                disabled={isSignUpLoading || isSignInLoading}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-[#F0F5F2] text-[#0D1C17] font-bold text-xs sm:text-sm rounded-xl font-lexend min-w-[80px] sm:min-w-[100px] h-[44px] sm:h-[49px] flex items-center justify-center hover:bg-[#E5F5F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignUpLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
              <button
                onClick={handleSmartLogin}
                disabled={isSignUpLoading || isSignInLoading}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-[#009963] text-[#F7FCFA] font-bold text-xs sm:text-sm rounded-xl font-lexend min-w-[80px] sm:min-w-[100px] h-[44px] sm:h-[49px] flex items-center justify-center hover:bg-[#007a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSignInLoading ? 'Signing In...' : 'Log In'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-5 md:px-8">
        <div className="w-full mx-auto md:w-4/5">
          {/* Hero Section */}
          <section className="relative mb-12">
            <div 
              className="h-[300px] md:h-[400px] lg:h-[512px] rounded-xl flex items-center justify-center text-center text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(90deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.40) 100%), url('${heroImages[currentSlide]}') lightgray 50% / cover no-repeat`
              }}
            >
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="flex flex-col items-center gap-4 md:gap-8 w-full max-w-4xl z-10 px-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight md:leading-[60px] tracking-[-1px] md:tracking-[-2px] font-lexend">
                    Unlock Your Potential with<br />Unpuzzle Club
                  </h2>
                  <p className="text-sm md:text-base font-normal leading-5 md:leading-6 font-lexend">
                    Learn from the best, teach what you know, and connect with a global community of learners and instructors.
                  </p>
                </div>
                
              </div>
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-[#009963]' : 'bg-[#949494]'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Activities Section */}
          <section className="mb-12">
            <h3 className="text-[22px] font-bold text-[#0D1C17] mb-3 px-4 font-lexend">Activities</h3>
            <div className="flex flex-wrap gap-3 px-3">
              {activities.map((activity, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#E5F5F0] text-[#0D1C17] text-sm rounded-xl font-lexend"
                >
                  {activity}
                </span>
              ))}
            </div>
          </section>

          {/* Course Cards */}
          <section className="mb-8 md:mb-12">
            <div className="flex items-start align-self-stretch">
              <div className="flex flex-col md:flex-row px-2 md:px-4 items-start gap-4 md:gap-3 w-full">
                {courses.map((course) => (
                  <div key={course.id} className="w-full md:min-w-[240px] flex flex-col items-start gap-3 md:gap-4 border-radius-[8px]">
                    {course.id === 1 ? (
                      <Link to="/chess-classes">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-[120px] md:h-[135px] align-self-stretch rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity w-full"
                        />
                      </Link>
                    ) : course.id === 2 ? (
                      <Link to="/karate-classes">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-[120px] md:h-[135px] align-self-stretch rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity w-full"
                        />
                      </Link>
                    ) : course.id === 3 ? (
                      <Link to="/arts-classes">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-[120px] md:h-[135px] align-self-stretch rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity w-full"
                        />
                      </Link>
                    ) : course.id === 4 ? (
                      <Link to="/dance-music-classes">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-[120px] md:h-[135px] align-self-stretch rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity w-full"
                        />
                      </Link>
                    ) : (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-[135px] align-self-stretch rounded-xl object-cover"
                    />
                    )}
                    <div className="flex flex-col items-start align-self-stretch">
                      <div className="flex flex-col items-start align-self-stretch">
                        {course.id === 1 ? (
                          <Link to="/chess-classes">
                            <h4 className="align-self-stretch text-sm md:text-base font-medium text-[#0D1C17] font-lexend leading-5 md:leading-6 cursor-pointer hover:text-[#009963] transition-colors">{course.title}</h4>
                          </Link>
                        ) : course.id === 2 ? (
                          <Link to="/karate-classes">
                            <h4 className="align-self-stretch text-sm md:text-base font-medium text-[#0D1C17] font-lexend leading-5 md:leading-6 cursor-pointer hover:text-[#009963] transition-colors">{course.title}</h4>
                          </Link>
                        ) : course.id === 3 ? (
                          <Link to="/arts-classes">
                            <h4 className="align-self-stretch text-sm md:text-base font-medium text-[#0D1C17] font-lexend leading-5 md:leading-6 cursor-pointer hover:text-[#009963] transition-colors">{course.title}</h4>
                          </Link>
                        ) : course.id === 4 ? (
                          <Link to="/dance-music-classes">
                            <h4 className="align-self-stretch text-sm md:text-base font-medium text-[#0D1C17] font-lexend leading-5 md:leading-6 cursor-pointer hover:text-[#009963] transition-colors">{course.title}</h4>
                          </Link>
                        ) : (
                          <h4 className="align-self-stretch text-base font-medium text-[#0D1C17] font-lexend leading-6">{course.title}</h4>
                        )}
                      </div>
                      <div className="flex flex-col items-start gap-[9px] align-self-stretch">
                        <p className="align-self-stretch text-sm text-[#45A180] font-lexend leading-[21px]">{course.description}</p>
                        {course.id === 1 ? (
                          <Link
                            to="/chess-classes"
                            className="flex px-3 md:px-4 py-2 justify-center items-center align-self-stretch rounded-[10px] bg-[#009963] hover:bg-[#007a4d] transition-colors cursor-pointer min-h-[44px]"
                          >
                            <span className="text-[#F7FCFA] font-lexend text-sm font-normal leading-[21px]">Get More Info</span>
                          </Link>
                        ) : course.id === 2 ? (
                          <Link
                            to="/karate-classes"
                            className="flex px-3 md:px-4 py-2 justify-center items-center align-self-stretch rounded-[10px] bg-[#009963] hover:bg-[#007a4d] transition-colors cursor-pointer min-h-[44px]"
                          >
                            <span className="text-[#F7FCFA] font-lexend text-sm font-normal leading-[21px]">Get More Info</span>
                          </Link>
                        ) : course.id === 3 ? (
                          <Link
                            to="/arts-classes"
                            className="flex px-3 md:px-4 py-2 justify-center items-center align-self-stretch rounded-[10px] bg-[#009963] hover:bg-[#007a4d] transition-colors cursor-pointer min-h-[44px]"
                          >
                            <span className="text-[#F7FCFA] font-lexend text-sm font-normal leading-[21px]">Get More Info</span>
                          </Link>
                        ) : course.id === 4 ? (
                          <Link
                            to="/dance-music-classes"
                            className="flex px-3 md:px-4 py-2 justify-center items-center align-self-stretch rounded-[10px] bg-[#009963] hover:bg-[#007a4d] transition-colors cursor-pointer min-h-[44px]"
                          >
                            <span className="text-[#F7FCFA] font-lexend text-sm font-normal leading-[21px]">Get More Info</span>
                          </Link>
                        ) : (
                          <a
                            href="https://wa.me/918660496605"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex px-3 md:px-4 py-2 justify-center items-center align-self-stretch rounded-[10px] bg-[#009963] hover:bg-[#007a4d] transition-colors cursor-pointer min-h-[44px]"
                          >
                            <span className="text-[#F7FCFA] font-lexend text-sm font-normal leading-[21px]">Book a Call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-8 md:mb-12">
            <h3 className="text-lg md:text-[22px] font-bold text-[#0D1C17] mb-4 px-2 md:px-4 font-lexend">Testimonials</h3>
            <div className="px-2 md:px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-3">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random&color=fff&size=32&rounded=true`}
                        alt={testimonial.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-[#0D1C17] font-lexend">{testimonial.name}</h4>
                          {testimonial.isLocalGuide && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              Local Guide
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{testimonial.reviews} review{testimonial.reviews !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{testimonial.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-700 font-lexend leading-relaxed">
                      {testimonial.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <WhyChooseUs />

          {/* CTA Section */}
          <section className="py-6 md:py-11 px-4 md:px-10">
            <div className="flex flex-col items-center gap-4 md:gap-8">
              <h3 className="text-xl md:text-[36px] font-black text-[#0D1C17] text-center tracking-[-1px] font-lexend">
                Ready to Get Started?
              </h3>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowTrialForm(true)}
                  className="w-full md:w-auto px-4 md:px-5 py-3 bg-[#009963] text-[#F7FCFA] font-bold rounded-xl font-lexend hover:bg-[#007a4d] transition-colors min-h-[44px]"
                >
                  Book a free trial class
                </button>
                <button 
                  onClick={() => setShowInstructorForm(true)}
                  className="w-full md:w-auto px-4 md:px-5 py-3 bg-[#F0F5F2] text-black font-bold rounded-xl font-lexend hover:bg-[#E5F5F0] transition-colors min-h-[44px]"
                >
                  Become a Instructor
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full md:w-4/5 mx-auto">
        <div className="px-4 md:px-5 py-6 md:py-10 flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center flex-wrap gap-4 md:gap-6">
            <div className="w-full md:w-40 min-w-[160px] text-center">
              <button 
                onClick={() => setShowAboutUs(true)}
                className="text-sm md:text-base text-[#45A180] font-lexend hover:text-[#009963] transition-colors cursor-pointer"
              >
                About Us
              </button>
            </div>
            <div className="w-full md:w-40 min-w-[160px] text-center">
              <button 
                onClick={() => setShowContactUs(true)}
                className="text-sm md:text-base text-[#45A180] font-lexend hover:text-[#009963] transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </div>
            <div className="w-full md:w-40 min-w-[160px] text-center">
              <button 
                onClick={() => setShowTermsOfService(true)}
                className="text-sm md:text-base text-[#45A180] font-lexend hover:text-[#009963] transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
            <div className="w-full md:w-40 min-w-[160px] text-center">
              <button 
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-sm md:text-base text-[#45A180] font-lexend hover:text-[#009963] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
            </div>
          </div>
          
          <div className="flex justify-center gap-3 md:gap-4">
            {/* Facebook */}
            <a 
              href="https://www.facebook.com/profile.php?id=61578826966343&rdid=Ff2qPytjOZruJsyc&share_url=https://www.facebook.com/share/18qDXjr3ki/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1H3C1.9 1 1 1.9 1 3V17C1 18.101 1.9 19 3 19H10V12H8V9.525H10V7.475C10 5.311 11.212 3.791 13.766 3.791L15.569 3.793V6.398H14.372C13.378 6.398 13 7.144 13 7.836V9.526H15.568L15 12H13V19H17C18.1 19 19 18.101 19 17V3C19 1.9 18.1 1 17 1Z" fill="#009963" />
            </svg>
            </a>
            
            {/* LinkedIn */}
            <a 
              href="https://www.linkedin.com/company/108070460/admin/dashboard/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.0583 1.66662H2.94167C2.78299 1.66442 2.62543 1.69349 2.47798 1.75219C2.33053 1.81089 2.19609 1.89805 2.08234 2.00871C1.96858 2.11937 1.87774 2.25136 1.815 2.39713C1.75226 2.5429 1.71885 2.6996 1.71667 2.85829V17.1416C1.71885 17.3003 1.75226 17.457 1.815 17.6028C1.87774 17.7486 1.96858 17.8805 2.08234 17.9912C2.19609 18.1019 2.33053 18.189 2.47798 18.2477C2.62543 18.3064 2.78299 18.3355 2.94167 18.3333H17.0583C17.217 18.3355 17.3746 18.3064 17.522 18.2477C17.6695 18.189 17.8039 18.1019 17.9177 17.9912C18.0314 17.8805 18.1223 17.7486 18.185 17.6028C18.2478 17.457 18.2812 17.3003 18.2833 17.1416V2.85829C18.2812 2.6996 18.2478 2.5429 18.185 2.39713C18.1223 2.25136 18.0314 2.11937 17.9177 2.00871C17.8039 1.89805 17.6695 1.81089 17.522 1.75219C17.3746 1.69349 17.217 1.66442 17.0583 1.66662ZM6.74167 15.6166H4.24167V8.11662H6.74167V15.6166ZM5.49167 7.06662C5.14689 7.06662 4.81623 6.92966 4.57244 6.68586C4.32864 6.44206 4.19167 6.1114 4.19167 5.76662C4.19167 5.42184 4.32864 5.09118 4.57244 4.84738C4.81623 4.60358 5.14689 4.46662 5.49167 4.46662C5.67475 4.44586 5.86016 4.464 6.03574 4.51986C6.21132 4.57571 6.37312 4.66803 6.51056 4.79076C6.64799 4.91348 6.75795 5.06385 6.83323 5.23202C6.90852 5.40019 6.94744 5.58237 6.94744 5.76662C6.94744 5.95087 6.90852 6.13305 6.83323 6.30122C6.75795 6.46939 6.64799 6.61976 6.51056 6.74249C6.37312 6.86521 6.21132 6.95753 6.03574 7.01338C5.86016 7.06924 5.67475 7.08738 5.49167 7.06662ZM15.7583 15.6166H13.2583V11.5916C13.2583 10.9106 13.4963 10.5267 13.2406 10.2534C12.9849 9.9801 12.6403 9.8428 12.2088 9.8428C11.7773 9.8428 11.4326 9.9794 11.177 10.2534C10.9213 10.5267 10.7931 10.9106 10.7931 11.4046V15.4154H8.53052V8.0294H10.7931V9.0089C11.0221 8.6824 11.3311 8.4246 11.7192 8.2347C12.1072 8.0448 12.5436 7.9502 13.0291 7.9502C13.8935 7.9502 14.5841 8.2305 15.0997 8.7903V8.791C15.616 9.3516 15.8738 10.121 15.8738 11.1005V15.4154H15.7583V15.6166Z" fill="#009963" />
            </svg>
            </a>
            
            {/* Instagram */}
            <a 
              href="https://www.instagram.com/unpuzzleclub/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.8428 1.12427C3.85645 1.12427 2.91046 1.516 2.21287 2.21333C1.51528 2.91065 1.12318 3.85648 1.1228 4.84284V14.7628C1.1228 15.7494 1.51473 16.6956 2.21237 17.3933C2.91 18.0909 3.8562 18.4828 4.8428 18.4828H14.7628C15.7492 18.4825 16.695 18.0904 17.3923 17.3928C18.0896 16.6952 18.4814 15.7492 18.4814 14.7628V4.84284C18.481 3.85673 18.0891 2.91112 17.3918 2.21383C16.6945 1.51654 15.7489 1.12465 14.7628 1.12427H4.8428ZM15.8328 4.84855C15.8328 5.13271 15.7199 5.40524 15.519 5.60617C15.3181 5.8071 15.0455 5.91998 14.7614 5.91998C14.4772 5.91998 14.2047 5.8071 14.0038 5.60617C13.8028 5.40524 13.6899 5.13271 13.6899 4.84855C13.6899 4.56439 13.8028 4.29187 14.0038 4.09094C14.2047 3.89001 14.4772 3.77712 14.7614 3.77712C15.0455 3.77712 15.3181 3.89001 15.519 4.09094C15.7199 4.29187 15.8328 4.56439 15.8328 4.84855ZM9.80423 6.83141C9.01616 6.83141 8.26037 7.14447 7.70311 7.70172C7.14586 8.25897 6.8328 9.01477 6.8328 9.80284C6.8328 10.5909 7.14586 11.3467 7.70311 11.904C8.26037 12.4612 9.01616 12.7743 9.80423 12.7743C10.5923 12.7743 11.3481 12.4612 11.9053 11.904C12.4626 11.3467 12.7757 10.5909 12.7757 9.80284C12.7757 9.01477 12.4626 8.25897 11.9053 7.70172C11.3481 7.14447 10.5923 6.83141 9.80423 6.83141ZM5.4028 9.80284C5.4028 8.63589 5.86637 7.51673 6.69153 6.69157C7.51669 5.86641 8.63585 5.40284 9.8028 5.40284C10.9698 5.40284 12.0889 5.86641 12.9141 6.69157C13.7392 7.51673 14.2028 8.63589 14.2028 9.80284C14.2028 10.9698 13.7392 12.089 12.9141 12.9141C12.0889 13.7393 10.9698 14.2028 9.8028 14.2028C8.63585 14.2028 7.51669 13.7393 6.69153 12.9141C5.86637 12.089 5.4028 10.9698 5.4028 9.80284Z" fill="#009963" />
            </svg>
            </a>
            
            {/* YouTube */}
            <a 
              href="https://www.youtube.com/@UnpuzzleClub1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 15L15.19 12L10 9V15ZM21.56 7.17C21.69 7.64 21.78 8.27 21.84 9.07C21.91 9.87 21.94 10.56 21.94 11.16L22 12C22 14.19 21.84 15.8 21.56 16.83C21.31 17.73 20.73 18.31 19.83 18.56C19.36 18.69 18.5 18.78 17.18 18.84C15.88 18.91 14.69 18.94 13.59 18.94L12 19C7.81 19 5.2 18.84 4.17 18.56C3.27 18.31 2.69 17.73 2.44 16.83C2.31 16.36 2.22 15.73 2.16 14.93C2.09 14.13 2.06 13.44 2.06 12.84L2 12C2 9.81 2.16 8.2 2.44 7.17C2.69 6.27 3.27 5.69 4.17 5.44C4.64 5.31 5.5 5.22 6.82 5.16C8.12 5.09 9.31 5.06 10.41 5.06L12 5C16.19 5 18.8 5.16 19.83 5.44C20.73 5.69 21.31 6.27 21.56 7.17Z" fill="#009963" />
            </svg>
            </a>
          </div>
          
          <div className="text-center">
            <p className="text-base text-[#45A180] font-lexend">
              © 2024 Unpuzzle Club Connect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* About Us Modal */}
      <AboutUs 
        isOpen={showAboutUs} 
        onClose={() => setShowAboutUs(false)} 
      />

      {/* Contact Us Modal */}
      <ContactUs 
        isOpen={showContactUs} 
        onClose={() => setShowContactUs(false)} 
      />

      {/* Terms of Service Modal */}
      <TermsOfService 
        isOpen={showTermsOfService} 
        onClose={() => setShowTermsOfService(false)} 
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicy 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />

      {/* Zoho Form Modal */}
      {showTrialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#0D1C17] font-lexend">
                Book Your Free Trial Class
              </h2>
              <button
                onClick={() => setShowTrialForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <iframe 
                aria-label='Website lead' 
                frameBorder="0" 
                allow="geolocation;" 
                style={{height:'500px', width:'100%', border:'none'}} 
                src='https://forms.zohopublic.in/maheshunpu1/form/Websitelead/formperma/L_OD-2jcJHdi4nBf9mBNKVESXnAuQlaL0TaGrNPFBfo'
                title="Book Free Trial Class Form"
              />
            </div>
          </div>
        </div>
      )}

      {/* Instructor Form Modal */}
      {showInstructorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#0D1C17] font-lexend">
                Become an Instructor
              </h2>
              <button
                onClick={() => setShowInstructorForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <iframe 
                aria-label='Coach Form' 
                frameBorder="0" 
                style={{height:'500px', width:'100%', border:'none'}} 
                src='https://forms.zohopublic.in/maheshunpu1/form/CoachForm/formperma/RkKxAAzsO80OWPXA5PUs2Lc97RjErnxeKjefipVgMVk'
                title="Become an Instructor Form"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
