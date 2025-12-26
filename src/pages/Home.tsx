import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AboutUs } from '../components/AboutUs'
import { ContactUs } from '../components/ContactUs'
import { TermsOfService } from '../components/TermsOfService'
import { PrivacyPolicy } from '../components/PrivacyPolicy'

const Home = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [isSignInLoading, setIsSignInLoading] = useState(false)
  const [showAboutUs, setShowAboutUs] = useState(false)
  const [showContactUs, setShowContactUs] = useState(false)
  const [showTermsOfService, setShowTermsOfService] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)
  const { user, loading, smartLoginWithGoogle, signUpWithGoogle } = useAuth()

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

  const activities = ['Music', 'Chess', 'Karate', 'Judo', 'Design']
  
  const courses = [
    {
      id: 1,
      title: 'Chess Strategies',
      description: 'Chess tactics and strategies',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/ebe220995921bbba1e54b898e4fe7c038a5c8f85?width=480'
    },
    {
      id: 2,
      title: 'Karate Techniques',
      description: 'Karate for self-defense',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/d2fecf20374fedd37b28150269b0efbadb239748?width=480'
    },
    {
      id: 3,
      title: 'Creativity of Paint - Art',
      description: 'Beginner to advanced Painting',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/84b405ee05f99cbdf7c861d5fe9163abd8deb4dc?width=480'
    },
    {
      id: 4,
      title: 'Master Music Theory',
      description: 'Music theory for all levels',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/82a0864f111c5c43b8ae85b86f1d126e9009c4dd?width=480'
    }
  ]

  const successStories = [
    {
      id: 1,
      title: 'From Beginner to Pro',
      description: 'I started with no coding experience and now I\'m a software engineer.',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/5866e70039c815297d4968d56e75d8d8fb07e4a8?width=603'
    },
    {
      id: 2,
      title: 'Career Transformation',
      description: 'SkillShare Connect helped me switch careers and pursue my passion.',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/dcba7327ff0c155ef5c52f5c7ddd3f1a8170d53c?width=603'
    },
    {
      id: 3,
      title: 'Passion to Profession',
      description: 'I turned my hobby into a successful business thanks to SkillShare Connect.',
      image: 'https://api.builder.io/api/v1/image/assets/TEMP/207f51bd1a6f8bf6f3bd8ebe26326e7448c482a0?width=603'
    }
  ]

  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M25.46 6.26875L14.46 0.25C13.8626 -0.0801078 13.1374 -0.0801078 12.54 0.25L1.54 6.27125C0.900184 6.62132 0.501656 7.29193 0.5 8.02125V19.9762C0.501656 20.7056 0.900184 21.3762 1.54 21.7262L12.54 27.7475C13.1374 28.0776 13.8626 28.0776 14.46 27.7475L25.46 21.7262C26.0998 21.3762 26.4983 20.7056 26.5 19.9762V8.0225C26.4997 7.29183 26.101 6.61947 25.46 6.26875ZM13.5 2L23.5425 7.5L19.8213 9.5375L9.7775 4.0375L13.5 2ZM13.5 13L3.4575 7.5L7.695 5.18L17.7375 10.68L13.5 13ZM2.5 9.25L12.5 14.7225V25.4463L2.5 19.9775V9.25ZM24.5 19.9725L14.5 25.4463V14.7275L18.5 12.5387V17C18.5 17.5523 18.9477 18 19.5 18C20.0523 18 20.5 17.5523 20.5 17V11.4438L24.5 9.25V19.9713V19.9725Z" fill="#121714"/>
        </svg>
      ),
      title: 'Customizable Course Packages',
      description: 'Tailor your learning journey with packages designed to fit your goals and pace.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 23 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M11.5 6C8.73858 6 6.5 8.23858 6.5 11C6.5 13.7614 8.73858 16 11.5 16C14.2614 16 16.5 13.7614 16.5 11C16.5 8.23858 14.2614 6 11.5 6ZM11.5 14C9.84315 14 8.5 12.6569 8.5 11C8.5 9.34315 9.84315 8 11.5 8C13.1569 8 14.5 9.34315 14.5 11C14.5 12.6569 13.1569 14 11.5 14ZM11.5 0C5.42772 0.00688863 0.506889 4.92772 0.5 11C0.5 14.925 2.31375 19.085 5.75 23.0312C7.29403 24.8145 9.03182 26.4202 10.9313 27.8188C11.2757 28.06 11.7343 28.06 12.0788 27.8188C13.9747 26.4196 15.7091 24.8139 17.25 23.0312C20.6813 19.085 22.5 14.925 22.5 11C22.4931 4.92772 17.5723 0.00688863 11.5 0ZM11.5 25.75C9.43375 24.125 2.5 18.1562 2.5 11C2.5 6.02944 6.52944 2 11.5 2C16.4706 2 20.5 6.02944 20.5 11C20.5 18.1538 13.5662 24.125 11.5 25.75Z" fill="#121714"/>
        </svg>
      ),
      title: 'Flexible Learning Locations',
      description: 'Learn from anywhere with our flexible location options, adapting to your lifestyle.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 33 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M15.1562 13.74C17.9081 11.908 19.1359 8.49023 18.1789 5.32588C17.2219 2.16153 14.3059 -0.0030427 11 -0.0030427C7.69411 -0.0030427 4.77809 2.16153 3.82111 5.32588C2.86413 8.49023 4.09191 11.908 6.84375 13.74C4.41937 14.6335 2.34888 16.287 0.94125 18.4538C0.739909 18.753 0.715312 19.1375 0.87688 19.4599C1.03845 19.7824 1.36114 19.9929 1.72137 20.0108C2.08161 20.0286 2.42355 19.8511 2.61625 19.5462C4.46102 16.7089 7.61569 14.9972 11 14.9972C14.3843 14.9972 17.539 16.7089 19.3838 19.5462C19.6889 19.9998 20.3018 20.1243 20.7597 19.8256C21.2177 19.5269 21.3508 18.9159 21.0588 18.4538C19.6511 16.287 17.5806 14.6335 15.1562 13.74ZM5.5 7.5C5.5 4.46243 7.96243 2 11 2C14.0376 2 16.5 4.46243 16.5 7.5C16.5 10.5376 14.0376 13 11 13C7.96386 12.9966 5.50344 10.5361 5.5 7.5ZM31.7675 19.8375C31.305 20.1391 30.6855 20.0087 30.3838 19.5462C28.5411 16.707 25.3848 14.9955 22 15C21.4477 15 21 14.5523 21 14C21 13.4477 21.4477 13 22 13C24.2151 12.9979 26.2127 11.6672 27.0682 9.62397C27.9236 7.58073 27.4698 5.22373 25.9169 3.64415C24.3639 2.06458 22.015 1.57074 19.9575 2.39125C19.6235 2.53562 19.2375 2.48721 18.9495 2.26486C18.6616 2.0425 18.5171 1.68129 18.5723 1.32167C18.6275 0.962047 18.8736 0.660775 19.215 0.535C22.7812 -0.887244 26.8456 0.613342 28.632 4.01177C30.4184 7.4102 29.3499 11.6089 26.1562 13.74C28.5806 14.6335 30.6511 16.287 32.0588 18.4538C32.3604 18.9163 32.23 19.5358 31.7675 19.8375Z" fill="#121714"/>
        </svg>
      ),
      title: 'One-on-One Classes',
      description: 'Get personalized attention and accelerate your progress with dedicated one-on-one sessions.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M24.5 3H14.5V1C14.5 0.447715 14.0523 0 13.5 0C12.9477 0 12.5 0.447715 12.5 1V3H2.5C1.39543 3 0.5 3.89543 0.5 5V20C0.5 21.1046 1.39543 22 2.5 22H7.42L4.71875 25.375C4.37357 25.8065 4.44353 26.4361 4.875 26.7812C5.30647 27.1264 5.93607 27.0565 6.28125 26.625L9.98 22H17.02L20.7188 26.625C21.0639 27.0565 21.6935 27.1264 22.125 26.7812C22.5565 26.4361 22.6264 25.8065 22.2812 25.375L19.58 22H24.5C25.6046 22 26.5 21.1046 26.5 20V5C26.5 3.89543 25.6046 3 24.5 3ZM24.5 20H2.5V5H24.5V20ZM10.5 13V16C10.5 16.5523 10.0523 17 9.5 17C8.94772 17 8.5 16.5523 8.5 16V13C8.5 12.4477 8.94772 12 9.5 12C10.0523 12 10.5 12.4477 10.5 13ZM14.5 11V16C14.5 16.5523 14.0523 17 13.5 17C12.9477 17 12.5 16.5523 12.5 16V11C12.5 10.4477 12.9477 10 13.5 10C14.0523 10 14.5 10.4477 14.5 11ZM18.5 9V16C18.5 16.5523 18.0523 17 17.5 17C16.9477 17 16.5 16.5523 16.5 16V9C16.5 8.44772 16.9477 8 17.5 8C18.0523 8 18.5 8.44772 18.5 9Z" fill="#121714"/>
        </svg>
      ),
      title: 'Monthly Progress Feedback',
      description: 'Receive detailed feedback each month to track your development and identify areas for improvement.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M13.5 0C6.3203 0 0.5 5.8203 0.5 13C0.5 20.1797 6.3203 26 13.5 26C20.6797 26 26.5 20.1797 26.5 13C26.4924 5.82344 20.6766 0.00757861 13.5 0ZM13.5 24C7.42487 24 2.5 19.0751 2.5 13C2.5 6.92487 7.42487 2 13.5 2C19.5751 2 24.5 6.92487 24.5 13C24.4931 19.0723 19.5723 23.9931 13.5 24ZM21.5 13C21.5 13.5523 21.0523 14 20.5 14H13.5C12.9477 14 12.5 13.5523 12.5 13V6C12.5 5.44772 12.9477 5 13.5 5C14.0523 5 14.5 5.44772 14.5 6V12H20.5C21.0523 12 21.5 12.4477 21.5 13Z" fill="#121714"/>
        </svg>
      ),
      title: 'Attendance Tracking',
      description: 'Stay on top of your learning schedule with our easy-to-use attendance tracking system.'
    },
    {
      icon: (
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
      ),
      title: 'Practice Sessions & Tournaments',
      description: 'Sharpen your skills and compete with peers in regular practice sessions and tournaments.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F7FCFA]">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 md:px-10 py-3 border-b border-[#E5E8EB]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 relative">
                <svg width="16" height="16" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M2.6087 1.3088C3.57343 1.53913 4.74147 1.6739 6 1.6739C7.25853 1.6739 8.42657 1.53913 9.3913 1.3088C10.3048 1.09073 11.3322 0.5777 11.7854 0.2216L6.28287 9.04637C6.15237 9.25567 5.84763 9.25567 5.71713 9.04637L0.21458 0.2216C0.66777 0.5777 1.6952 1.09073 2.6087 1.3088Z" fill="#0D1C17"/>
                </svg>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.3327 3.57867C12.3315 3.58457 12.3292 3.59483 12.3249 3.6098C12.3145 3.64663 12.2983 3.69137 12.2782 3.73917C12.2723 3.75323 12.2663 3.7669 12.2604 3.77993C11.8368 4.07043 10.9929 4.47977 10.2365 4.66037C9.32917 4.877 8.21377 5.00723 7 5.00723C5.78623 5.00723 4.67083 4.877 3.7635 4.66037C3.0004 4.4782 2.14835 4.06323 1.72846 3.77227C1.72461 3.76417 1.72072 3.75567 1.71684 3.74693C1.69973 3.7083 1.68574 3.67047 1.67659 3.637C1.66785 3.60507 1.6668 3.5889 1.66668 3.58707C1.66667 3.5869 1.66668 3.587 1.66668 3.58707C1.66668 3.57863 1.67013 3.47443 1.89495 3.28953C2.11515 3.10847 2.47407 2.91563 2.97637 2.74092C3.97473 2.39366 5.3973 2.16667 7 2.16667C8.6027 2.16667 10.0253 2.39366 11.0236 2.74092C11.5259 2.91563 11.8848 3.10847 12.105 3.28953C12.3002 3.45003 12.3286 3.54963 12.3327 3.57867ZM0.650593 4.57707L6.15143 13.3991C6.54293 14.027 7.45707 14.027 7.84857 13.3991L13.3511 4.57433C13.357 4.56493 13.3626 4.5554 13.368 4.5457L12.7854 4.2216C13.368 4.5457 13.3679 4.5458 13.368 4.5457L13.3684 4.545L13.3688 4.54417L13.37 4.54203L13.3733 4.53607C13.3759 4.53133 13.3792 4.52513 13.3832 4.51757C13.3913 4.5025 13.4021 4.48183 13.4147 4.4567C13.4397 4.40693 13.4732 4.337 13.5072 4.2561C13.5634 4.12263 13.6667 3.8563 13.6667 3.58697C13.6667 3.0191 13.3343 2.57418 12.9519 2.2597C12.5649 1.94142 12.0451 1.68454 11.4617 1.48159C10.2885 1.07352 8.711 0.833333 7 0.833333C5.289 0.833333 3.71153 1.07352 2.53833 1.48159C1.95488 1.68454 1.4351 1.94143 1.04806 2.2597C0.66565 2.57418 0.33333 3.0191 0.33333 3.58697C0.33333 3.87583 0.43088 4.13593 0.497737 4.2869C0.534583 4.37007 0.57116 4.43987 0.598957 4.48963C0.612993 4.5148 0.625157 4.5355 0.6345 4.55097C0.63918 4.55873 0.64318 4.56523 0.646387 4.57037L0.648873 4.57433L0.650593 4.57707ZM10.9956 5.832L7 12.24L3.00437 5.832C3.15537 5.8797 3.30597 5.92193 3.4539 5.95727C4.47603 6.2013 5.6967 6.34057 7 6.34057C8.3033 6.34057 9.52397 6.2013 10.5461 5.95727C10.694 5.92193 10.8446 5.8797 10.9956 5.832Z" fill="#0D1C17"/>
                </svg>
              </div>
            </div>
            <h1 className="text-lg font-bold text-[#0D1C17] font-[Lexend]">Unpuzzle Club</h1>
          </div>
          
          <nav style={{ display: 'none' }} className="flex items-center gap-9">
            <span className="text-sm text-[#0D1C17] font-[Lexend]">Activity</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#0D1C17] font-[Lexend]">Leaderboard</span>
              <svg width="20" height="20" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.8333 8L9.99996 13L4.16663 8" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </nav>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button style={{ display: 'none' }} className="px-4 py-3 bg-[#E5F5F0] text-[#0D1C17] font-bold text-sm rounded-xl font-[Lexend] min-w-[120px] h-[49px]">
            Fee Payments
          </button>
          <Link 
            to="/admin/signin"
            className="px-3 sm:px-4 py-2 sm:py-3 bg-[#E5F5F0] text-[#0D1C17] font-bold text-xs sm:text-sm rounded-xl font-[Lexend] min-w-[80px] sm:min-w-[100px] h-[44px] sm:h-[49px] flex items-center justify-center"
          >
            Admin
          </Link>
          <button
            onClick={handleSignUp}
            disabled={isSignUpLoading || isSignInLoading}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-[#F0F5F2] text-[#0D1C17] font-bold text-xs sm:text-sm rounded-xl font-[Lexend] min-w-[80px] sm:min-w-[100px] h-[44px] sm:h-[49px] flex items-center justify-center hover:bg-[#E5F5F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSignUpLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
          <button
            onClick={handleSmartLogin}
            disabled={isSignUpLoading || isSignInLoading}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-[#009963] text-[#F7FCFA] font-bold text-xs sm:text-sm rounded-xl font-[Lexend] min-w-[80px] sm:min-w-[100px] h-[44px] sm:h-[49px] flex items-center justify-center hover:bg-[#007a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSignInLoading ? 'Signing In...' : 'Log In'}
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-8 md:px-16 lg:px-32 py-4 sm:py-5">
        <div className="max-w-[960px] mx-auto">
          {/* Hero Section */}
          <section className="relative mb-12">
            <div 
              className="h-[300px] sm:h-[400px] md:h-[512px] rounded-xl flex items-center justify-center text-center text-white relative"
              style={{
                background: `linear-gradient(90deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.40) 100%), url('https://api.builder.io/api/v1/image/assets/TEMP/bfea38818cfa85e9f7731bacb5edc374b80870b6?width=1856') lightgray 50% / cover no-repeat`
              }}
            >
              <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 max-w-[896px] px-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight sm:leading-[50px] md:leading-[60px] tracking-[-1px] sm:tracking-[-2px] font-[Lexend]">
                    Unlock Your Potential with<br />Unpuzzle Club
                  </h2>
                  <p className="text-sm sm:text-base font-normal leading-5 sm:leading-6 font-[Lexend]">
                    Learn from the best, teach what you know, and connect with a global community of learners and instructors.
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="w-full sm:w-[400px] md:w-[480px] h-14 sm:h-16 flex rounded-xl overflow-hidden">
                  <div className="flex items-center pl-4 bg-[#F7FCFA] border border-[#CCE8DE]">
                    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M16.9422 16.0578L13.0305 12.1469C15.3858 9.3192 15.1004 5.13911 12.3826 2.65779C9.66485 0.176469 5.47612 0.271665 2.87389 2.87389C0.271665 5.47612 0.176469 9.66485 2.65779 12.3826C5.13911 15.1004 9.3192 15.3858 12.1469 13.0305L16.0578 16.9422C16.302 17.1864 16.698 17.1864 16.9422 16.9422C17.1864 16.698 17.1864 16.302 16.9422 16.0578ZM2.125 7.75C2.125 4.6434 4.6434 2.125 7.75 2.125C10.8566 2.125 13.375 4.6434 13.375 7.75C13.375 10.8566 10.8566 13.375 7.75 13.375C4.64483 13.3716 2.12844 10.8552 2.125 7.75Z" fill="#45A180"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for courses"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-2 py-2 text-[#45A180] font-[Lexend] bg-[#F7FCFA] border-t border-b border-[#CCE8DE] outline-none"
                  />
                  <div className="flex items-center pr-2 bg-[#F7FCFA] border border-[#CCE8DE]">
                    <button className="px-3 sm:px-5 py-2 sm:py-3 bg-[#009963] text-[#F7FCFA] font-bold text-xs sm:text-sm rounded-xl font-[Lexend] whitespace-nowrap">
                      Find Your Class
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center mt-2 gap-2">
              <div className="w-3 h-3 rounded-full bg-[#413E3E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#413E3E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#413E3E]"></div>
            </div>
          </section>

          {/* Activities Section */}
          <section className="mb-8 sm:mb-12">
            <h3 className="text-lg sm:text-xl md:text-[22px] font-bold text-[#0D1C17] mb-3 px-2 sm:px-4 font-[Lexend]">Activities</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 px-2 sm:px-3">
              {activities.map((activity, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#E5F5F0] text-[#0D1C17] text-sm rounded-xl font-[Lexend]"
                >
                  {activity}
                </span>
              ))}
            </div>
          </section>

          {/* Course Cards */}
          <section className="mb-8 sm:mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-4">
              {courses.map((course) => (
                <div key={course.id} className="flex flex-col gap-3 sm:gap-4">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-[180px] sm:h-[135px] rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-[#0D1C17] font-[Lexend]">{course.title}</h4>
                    <p className="text-xs sm:text-sm text-[#45A180] font-[Lexend]">{course.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Location Covered */}
          <section className="mb-8 sm:mb-12">
            <h3 className="text-lg sm:text-xl md:text-[22px] font-bold text-[#0D1C17] mb-4 px-2 sm:px-4 font-[Lexend]">Location Covered</h3>
            <div className="px-2 sm:px-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 rounded-xl">
                <div className="w-full md:w-[608px] flex flex-col gap-8 md:gap-16">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs sm:text-sm text-[#888] font-[Lexend] leading-5 sm:leading-[21px]">
                      Sarjapura road, Bangalore<br />
                      KR Puram, Whitefiled, Bangalore<br />
                      Ashok Nagar, Cyber Road, Banglore
                    </p>
                  </div>
                  <button className="w-fit px-4 py-2 bg-[#E5F5F0] text-[#0D1C17] font-medium text-xs sm:text-sm rounded-xl font-[Lexend]">
                    View All
                  </button>
                </div>
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/c59d2130c583aaf00b8a773b07e8a9e8279ee4c8?width=640"
                  alt="Location map"
                  className="w-full md:flex-1 h-[200px] md:h-[171px] rounded-xl object-cover"
                />
              </div>
            </div>
          </section>

          {/* Student Success Stories */}
          <section className="mb-8 sm:mb-12">
            <h3 className="text-lg sm:text-xl md:text-[22px] font-bold text-[#0D1C17] mb-4 px-2 sm:px-4 font-[Lexend]">Student Success Stories</h3>
            <div className="px-2 sm:px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {successStories.map((story) => (
                  <div key={story.id} className="flex flex-col gap-3 sm:gap-4">
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="h-[250px] sm:h-[280px] md:h-[301px] w-full rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm sm:text-base font-medium text-[#0D1C17] font-[Lexend]">{story.title}</h4>
                      <p className="text-xs sm:text-sm text-[#45A180] font-[Lexend]">{story.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-8 sm:py-12 md:py-16">
            <h3 className="text-2xl sm:text-3xl md:text-[36px] font-black text-[#0D1C17] text-center mb-6 sm:mb-8 tracking-[-1px] font-[Lexend] px-4">
              Why Choose Us?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="w-full sm:w-auto mx-auto sm:mx-0 sm:max-w-[231px] min-h-[200px] sm:h-[234px] p-4 sm:p-6 flex flex-col items-center gap-4 sm:gap-6 rounded-xl border border-[#DBE5E0] bg-white"
                >
                  <div className="h-8 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-1 text-center">
                    <h4 className="text-sm sm:text-base font-bold text-[#121714] font-[Lexend] leading-5">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#618A73] font-[Lexend] leading-5 sm:leading-[21px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-8 sm:py-11 px-4 sm:px-6 md:px-10">
            <div className="flex flex-col items-center gap-6 sm:gap-8">
              <h3 className="text-2xl sm:text-3xl md:text-[36px] font-black text-[#0D1C17] text-center tracking-[-1px] font-[Lexend]">
                Ready to Get Started?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 py-3 bg-[#009963] text-[#F7FCFA] font-bold text-sm sm:text-base rounded-xl font-[Lexend] min-h-[44px]">
                  Book a free trail class
                </button>
                <button className="w-full sm:w-auto px-5 py-3 bg-[#F0F5F2] text-black font-bold text-sm sm:text-base rounded-xl font-[Lexend] min-h-[44px]">
                  Become a Instructor
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[960px] mx-auto">
        <div className="px-4 sm:px-5 py-8 sm:py-10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start flex-wrap gap-4 sm:gap-6">
            <div className="w-full sm:w-40 text-center">
              <button 
                onClick={() => setShowAboutUs(true)}
                className="text-sm sm:text-base text-[#45A180] font-[Lexend] hover:text-[#009963] transition-colors cursor-pointer"
              >
                About Us
              </button>
            </div>
            <div className="w-full sm:w-40 text-center">
              <button 
                onClick={() => setShowContactUs(true)}
                className="text-sm sm:text-base text-[#45A180] font-[Lexend] hover:text-[#009963] transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </div>
            <div className="w-full sm:w-40 text-center">
              <button 
                onClick={() => setShowTermsOfService(true)}
                className="text-sm sm:text-base text-[#45A180] font-[Lexend] hover:text-[#009963] transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
            <div className="w-full sm:w-40 text-center">
              <button 
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-sm sm:text-base text-[#45A180] font-[Lexend] hover:text-[#009963] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 1H3C1.9 1 1 1.9 1 3V17C1 18.101 1.9 19 3 19H10V12H8V9.525H10V7.475C10 5.311 11.212 3.791 13.766 3.791L15.569 3.793V6.398H14.372C13.378 6.398 13 7.144 13 7.836V9.526H15.568L15 12H13V19H17C18.1 19 19 18.101 19 17V3C19 1.9 18.1 1 17 1Z" fill="#009963"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.0583 1.66662H2.94167C2.78299 1.66442 2.62543 1.69349 2.47798 1.75219C2.33053 1.81089 2.19609 1.89805 2.08234 2.00871C1.96858 2.11937 1.87774 2.25136 1.815 2.39713C1.75226 2.5429 1.71885 2.6996 1.71667 2.85829V17.1416C1.71885 17.3003 1.75226 17.457 1.815 17.6028C1.87774 17.7486 1.96858 17.8805 2.08234 17.9912C2.19609 18.1019 2.33053 18.189 2.47798 18.2477C2.62543 18.3064 2.78299 18.3355 2.94167 18.3333H17.0583C17.217 18.3355 17.3746 18.3064 17.522 18.2477C17.6695 18.189 17.8039 18.1019 17.9177 17.9912C18.0314 17.8805 18.1223 17.7486 18.185 17.6028C18.2478 17.457 18.2812 17.3003 18.2833 17.1416V2.85829C18.2812 2.6996 18.2478 2.5429 18.185 2.39713C18.1223 2.25136 18.0314 2.11937 17.9177 2.00871C17.8039 1.89805 17.6695 1.81089 17.522 1.75219C17.3746 1.69349 17.217 1.66442 17.0583 1.66662ZM6.74167 15.6166H4.24167V8.11662H6.74167V15.6166ZM5.49167 7.06662C5.14689 7.06662 4.81623 6.92966 4.57244 6.68586C4.32864 6.44206 4.19167 6.1114 4.19167 5.76662C4.19167 5.42184 4.32864 5.09118 4.57244 4.84738C4.81623 4.60358 5.14689 4.46662 5.49167 4.46662C5.67475 4.44586 5.86016 4.464 6.03574 4.51986C6.21132 4.57571 6.37312 4.66803 6.51056 4.79076C6.64799 4.91348 6.75795 5.06385 6.83323 5.23202C6.90852 5.40019 6.94744 5.58237 6.94744 5.76662C6.94744 5.95087 6.90852 6.13305 6.83323 6.30122C6.75795 6.46939 6.64799 6.61976 6.51056 6.74249C6.37312 6.86521 6.21132 6.95753 6.03574 7.01338C5.86016 7.06924 5.67475 7.08738 5.49167 7.06662ZM15.7583 15.6166H13.2583V11.5916C13.2583 10.5833 12.9 9.92495 11.9917 9.92495C11.7106 9.92701 11.4368 10.0152 11.2074 10.1776C10.9779 10.34 10.8037 10.5688 10.7083 10.8333C10.6431 11.0292 10.6149 11.2354 10.625 11.4416V15.6083H8.12501V8.10829H10.625V9.16662C10.8521 8.77254 11.1824 8.44789 11.5804 8.22762C11.9783 8.00736 12.4288 7.89983 12.8833 7.91662C14.55 7.91662 15.7583 8.99162 15.7583 11.3V15.6166Z" fill="#009963"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.8428 1.12427C3.85645 1.12427 2.91046 1.516 2.21287 2.21333C1.51528 2.91065 1.12318 3.85648 1.1228 4.84284V14.7628C1.1228 15.7494 1.51473 16.6956 2.21237 17.3933C2.91 18.0909 3.8562 18.4828 4.8428 18.4828H14.7628C15.7492 18.4825 16.695 18.0904 17.3923 17.3928C18.0896 16.6952 18.4814 15.7492 18.4814 14.7628V4.84284C18.481 3.85673 18.0891 2.91112 17.3918 2.21383C16.6945 1.51654 15.7489 1.12465 14.7628 1.12427H4.8428ZM15.8328 4.84855C15.8328 5.13271 15.7199 5.40524 15.519 5.60617C15.3181 5.8071 15.0455 5.91998 14.7614 5.91998C14.4772 5.91998 14.2047 5.8071 14.0038 5.60617C13.8028 5.40524 13.6899 5.13271 13.6899 4.84855C13.6899 4.56439 13.8028 4.29187 14.0038 4.09094C14.2047 3.89001 14.4772 3.77712 14.7614 3.77712C15.0455 3.77712 15.3181 3.89001 15.519 4.09094C15.7199 4.29187 15.8328 4.56439 15.8328 4.84855ZM9.80423 6.83141C9.01616 6.83141 8.26037 7.14447 7.70311 7.70172C7.14586 8.25897 6.8328 9.01477 6.8328 9.80284C6.8328 10.5909 7.14586 11.3467 7.70311 11.904C8.26037 12.4612 9.01616 12.7743 9.80423 12.7743C10.5923 12.7743 11.3481 12.4612 11.9053 11.904C12.4626 11.3467 12.7757 10.5909 12.7757 9.80284C12.7757 9.01477 12.4626 8.25897 11.9053 7.70172C11.3481 7.14447 10.5923 6.83141 9.80423 6.83141ZM5.4028 9.80284C5.4028 8.63589 5.86637 7.51673 6.69153 6.69157C7.51669 5.86641 8.63585 5.40284 9.8028 5.40284C10.9698 5.40284 12.0889 5.86641 12.9141 6.69157C13.7392 7.51673 14.2028 8.63589 14.2028 9.80284C14.2028 10.9698 13.7392 12.089 12.9141 12.9141C12.0889 13.7393 10.9698 14.2028 9.8028 14.2028C8.63585 14.2028 7.51669 13.7393 6.69153 12.9141C5.86637 12.089 5.4028 10.9698 5.4028 9.80284Z" fill="#009963"/>
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 15L15.19 12L10 9V15ZM21.56 7.17C21.69 7.64 21.78 8.27 21.84 9.07C21.91 9.87 21.94 10.56 21.94 11.16L22 12C22 14.19 21.84 15.8 21.56 16.83C21.31 17.73 20.73 18.31 19.83 18.56C19.36 18.69 18.5 18.78 17.18 18.84C15.88 18.91 14.69 18.94 13.59 18.94L12 19C7.81 19 5.2 18.84 4.17 18.56C3.27 18.31 2.69 17.73 2.44 16.83C2.31 16.36 2.22 15.73 2.16 14.93C2.09 14.13 2.06 13.44 2.06 12.84L2 12C2 9.81 2.16 8.2 2.44 7.17C2.69 6.27 3.27 5.69 4.17 5.44C4.64 5.31 5.5 5.22 6.82 5.16C8.12 5.09 9.31 5.06 10.41 5.06L12 5C16.19 5 18.8 5.16 19.83 5.44C20.73 5.69 21.31 6.27 21.56 7.17Z" fill="#009963"/>
            </svg>
          </div>
          
          <div className="text-center">
            <p className="text-xs sm:text-sm md:text-base text-[#45A180] font-[Lexend]">
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
    </div>
  )
}

export default Home
