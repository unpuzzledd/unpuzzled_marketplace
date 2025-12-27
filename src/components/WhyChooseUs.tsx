import { useEffect, useRef } from 'react'

interface Feature {
  icon: JSX.Element
  title: string
  description: string
}

const WhyChooseUs = () => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const features: Feature[] = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M25.46 6.26875L14.46 0.25C13.8626 -0.0801079 13.1374 -0.0801079 12.54 0.25L1.54 6.27125C0.900184 6.62132 0.501656 7.29193 0.5 8.02125V19.9763C0.501656 20.7056 0.900184 21.3762 1.54 21.7263L12.54 27.7475C13.1374 28.0776 13.8626 28.0776 14.46 27.7475L25.46 21.7263C26.0998 21.3762 26.4983 20.7056 26.5 19.9763V8.0225C26.4997 7.29183 26.101 6.61947 25.46 6.26875ZM13.5 2L23.5425 7.5L19.8213 9.5375L9.7775 4.0375L13.5 2ZM13.5 13L3.4575 7.5L7.695 5.18L17.7375 10.68L13.5 13ZM2.5 9.25L12.5 14.7225V25.4463L2.5 19.9775V9.25ZM24.5 19.9725L14.5 25.4463V14.7275L18.5 12.5388V17C18.5 17.5523 18.9477 18 19.5 18C20.0523 18 20.5 17.5523 20.5 17V11.4438L24.5 9.25V19.9713V19.9725Z" fill="#121714"/>
        </svg>
      ),
      title: 'Customizable Course Packages',
      description: 'Tailor your learning journey with packages designed to fit your goals and pace.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 23 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M11.5 6C8.73858 6 6.5 8.23858 6.5 11C6.5 13.7614 8.73858 16 11.5 16C14.2614 16 16.5 13.7614 16.5 11C16.5 8.23858 14.2614 6 11.5 6V6ZM11.5 14C9.84315 14 8.5 12.6569 8.5 11C8.5 9.34315 9.84315 8 11.5 8C13.1569 8 14.5 9.34315 14.5 11C14.5 12.6569 13.1569 14 11.5 14V14ZM11.5 5.96046e-08C5.42772 0.00688864 0.506889 4.92772 0.5 11C0.5 14.925 2.31375 19.085 5.75 23.0313C7.29403 24.8145 9.03182 26.4202 10.9313 27.8188C11.2757 28.06 11.7343 28.06 12.0788 27.8188C13.9747 26.4196 15.7091 24.8139 17.25 23.0313C20.6813 19.085 22.5 14.925 22.5 11C22.4931 4.92772 17.5723 0.00688864 11.5 5.96046e-08V5.96046e-08ZM11.5 25.75C9.43375 24.125 2.5 18.1563 2.5 11C2.5 6.02944 6.52944 2 11.5 2C16.4706 2 20.5 6.02944 20.5 11C20.5 18.1538 13.5663 24.125 11.5 25.75V25.75Z" fill="#121714"/>
        </svg>
      ),
      title: 'Flexible Learning Locations',
      description: 'Learn from anywhere with our flexible location options, adapting to your lifestyle.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M22.5 2H19.5V1C19.5 0.447715 19.0523 5.96046e-08 18.5 5.96046e-08C17.9477 5.96046e-08 17.5 0.447715 17.5 1V2H7.5V1C7.5 0.447715 7.05229 5.96046e-08 6.5 5.96046e-08C5.94772 5.96046e-08 5.5 0.447715 5.5 1V2H2.5C1.39543 2 0.5 2.89543 0.5 4V24C0.5 25.1046 1.39543 26 2.5 26H22.5C23.6046 26 24.5 25.1046 24.5 24V4C24.5 2.89543 23.6046 2 22.5 2V2ZM5.5 4V5C5.5 5.55228 5.94772 6 6.5 6C7.05229 6 7.5 5.55228 7.5 5V4H17.5V5C17.5 5.55228 17.9477 6 18.5 6C19.0523 6 19.5 5.55228 19.5 5V4H22.5V8H2.5V4H5.5ZM22.5 24H2.5V10H22.5V24V24ZM10.5 13V21C10.5 21.5523 10.0523 22 9.5 22C8.94772 22 8.5 21.5523 8.5 21V14.6175L7.9475 14.895C7.45321 15.1421 6.85215 14.9418 6.605 14.4475C6.35785 13.9532 6.55821 13.3521 7.0525 13.105L9.0525 12.105C9.3626 11.9498 9.73096 11.9664 10.0259 12.1487C10.3208 12.3311 10.5002 12.6532 10.5 13V13ZM17.895 16.8063L15.5 20H17.5C18.0523 20 18.5 20.4477 18.5 21C18.5 21.5523 18.0523 22 17.5 22H13.5C13.1212 22 12.775 21.786 12.6056 21.4472C12.4362 21.1084 12.4727 20.703 12.7 20.4L16.2975 15.6038C16.5205 15.3069 16.5606 14.911 16.4019 14.5755C16.2431 14.2399 15.9115 14.0199 15.5406 14.0041C15.1697 13.9882 14.8205 14.1792 14.6338 14.5C14.4603 14.8195 14.1271 15.0196 13.7635 15.0228C13.4 15.0259 13.0634 14.8315 12.8845 14.515C12.7055 14.1985 12.7124 13.8099 12.9025 13.5C13.5817 12.3247 14.9654 11.7519 16.2765 12.1032C17.5877 12.4546 18.4995 13.6426 18.5 15C18.5021 15.6522 18.2895 16.2869 17.895 16.8063V16.8063Z" fill="#121714"/>
        </svg>
      ),
      title: 'Free Trial Class',
      description: 'Experience our teaching style firsthand with a complimentary trial class.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 33 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M15.1563 13.74C17.9081 11.908 19.1359 8.49023 18.1789 5.32588C17.2219 2.16153 14.3059 -0.00304268 11 -0.00304268C7.69411 -0.00304268 4.77809 2.16153 3.82111 5.32588C2.86413 8.49023 4.09191 11.908 6.84375 13.74C4.41937 14.6335 2.34888 16.287 0.94125 18.4538C0.739909 18.753 0.715312 19.1375 0.87688 19.4599C1.03845 19.7824 1.36114 19.9929 1.72137 20.0108C2.08161 20.0286 2.42355 19.8511 2.61625 19.5463C4.46102 16.7089 7.61569 14.9972 11 14.9972C14.3843 14.9972 17.539 16.7089 19.3838 19.5463C19.6889 19.9998 20.3018 20.1243 20.7597 19.8256C21.2177 19.5269 21.3508 18.9159 21.0588 18.4538C19.6511 16.287 17.5806 14.6335 15.1563 13.74V13.74ZM5.5 7.5C5.5 4.46243 7.96243 2 11 2C14.0376 2 16.5 4.46243 16.5 7.5C16.5 10.5376 14.0376 13 11 13C7.96386 12.9966 5.50344 10.5361 5.5 7.5V7.5ZM31.7675 19.8375C31.305 20.1391 30.6855 20.0087 30.3838 19.5463C28.5411 16.707 25.3848 14.9955 22 15C21.4477 15 21 14.5523 21 14C21 13.4477 21.4477 13 22 13C24.2151 12.9979 26.2127 11.6672 27.0682 9.62397C27.9236 7.58073 27.4698 5.22373 25.9169 3.64415C24.3639 2.06458 22.015 1.57074 19.9575 2.39125C19.6235 2.53562 19.2375 2.48721 18.9495 2.26486C18.6616 2.0425 18.5171 1.68129 18.5723 1.32167C18.6275 0.962047 18.8736 0.660775 19.215 0.535C22.7812 -0.887244 26.8456 0.613342 28.632 4.01177C30.4184 7.4102 29.3499 11.6089 26.1563 13.74C28.5806 14.6335 30.6511 16.287 32.0587 18.4538C32.3604 18.9163 32.23 19.5358 31.7675 19.8375V19.8375Z" fill="#121714"/>
        </svg>
      ),
      title: 'One-on-One Classes',
      description: 'Get personalized attention and accelerate your progress with dedicated one-on-one sessions.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M24.5 3H14.5V1C14.5 0.447715 14.0523 5.96046e-08 13.5 5.96046e-08C12.9477 5.96046e-08 12.5 0.447715 12.5 1V3H2.5C1.39543 3 0.5 3.89543 0.5 5V20C0.5 21.1046 1.39543 22 2.5 22H7.42L4.71875 25.375C4.37357 25.8065 4.44353 26.4361 4.875 26.7813C5.30647 27.1264 5.93607 27.0565 6.28125 26.625L9.98 22H17.02L20.7188 26.625C21.0639 27.0565 21.6935 27.1264 22.125 26.7813C22.5565 26.4361 22.6264 25.8065 22.2813 25.375L19.58 22H24.5C25.6046 22 26.5 21.1046 26.5 20V5C26.5 3.89543 25.6046 3 24.5 3V3ZM24.5 20H2.5V5H24.5V20V20ZM10.5 13V16C10.5 16.5523 10.0523 17 9.5 17C8.94772 17 8.5 16.5523 8.5 16V13C8.5 12.4477 8.94772 12 9.5 12C10.0523 12 10.5 12.4477 10.5 13V13ZM14.5 11V16C14.5 16.5523 14.0523 17 13.5 17C12.9477 17 12.5 16.5523 12.5 16V11C12.5 10.4477 12.9477 10 13.5 10C14.0523 10 14.5 10.4477 14.5 11V11ZM18.5 9V16C18.5 16.5523 18.0523 17 17.5 17C16.9477 17 16.5 16.5523 16.5 16V9C16.5 8.44772 16.9477 8 17.5 8C18.0523 8 18.5 8.44772 18.5 9V9Z" fill="#121714"/>
        </svg>
      ),
      title: 'Monthly Progress Feedback',
      description: 'Receive detailed feedback each month to track your development and identify areas for improvement.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M13.5 8.9407e-08C6.3203 8.9407e-08 0.5 5.8203 0.5 13C0.5 20.1797 6.3203 26 13.5 26C20.6797 26 26.5 20.1797 26.5 13C26.4924 5.82344 20.6766 0.00757866 13.5 8.9407e-08V8.9407e-08ZM13.5 24C7.42487 24 2.5 19.0751 2.5 13C2.5 6.92487 7.42487 2 13.5 2C19.5751 2 24.5 6.92487 24.5 13C24.4931 19.0723 19.5723 23.9931 13.5 24V24ZM21.5 13C21.5 13.5523 21.0523 14 20.5 14H13.5C12.9477 14 12.5 13.5523 12.5 13V6C12.5 5.44772 12.9477 5 13.5 5C14.0523 5 14.5 5.44772 14.5 6V12H20.5C21.0523 12 21.5 12.4477 21.5 13V13Z" fill="#121714"/>
        </svg>
      ),
      title: 'Attendance Tracking',
      description: 'Stay on top of your learning schedule with our easy-to-use attendance tracking system.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 31 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M28.5 3H25.5V2C25.5 0.895431 24.6046 1.49012e-07 23.5 1.49012e-07H7.5C6.39543 1.49012e-07 5.5 0.895431 5.5 2V3H2.5C1.39543 3 0.5 3.89543 0.5 5V7C0.5 9.76142 2.73858 12 5.5 12H5.95625C7.16023 15.8155 10.5194 18.5485 14.5 18.9513V22H11.5C10.9477 22 10.5 22.4477 10.5 23C10.5 23.5523 10.9477 24 11.5 24H19.5C20.0523 24 20.5 23.5523 20.5 23C20.5 22.4477 20.0523 22 19.5 22H16.5V18.9475C20.4925 18.5438 23.805 15.7425 25.01 12H25.5C28.2614 12 30.5 9.76142 30.5 7V5C30.5 3.89543 29.6046 3 28.5 3V3ZM5.5 10C3.84315 10 2.5 8.65685 2.5 7V5H5.5V9C5.5 9.33333 5.51625 9.66667 5.54875 10H5.5ZM23.5 8.8875C23.5 13.3275 19.9388 16.9675 15.5613 17H15.5C11.0817 17 7.5 13.4183 7.5 9V2H23.5V8.8875ZM28.5 7C28.5 8.65685 27.1569 10 25.5 10H25.4375C25.4785 9.63058 25.4994 9.25919 25.5 8.8875V5H28.5V7Z" fill="#121714"/>
        </svg>
      ),
      title: 'Practice Sessions & Tournaments',
      description: 'Sharpen your skills and compete with peers in regular practice sessions and tournaments.'
    }
  ]

  // Create duplicated features for seamless infinite scroll
  const duplicatedFeatures = [...features, ...features]

  // Continuous smooth movement using requestAnimationFrame
  useEffect(() => {
    const animate = () => {
      if (carouselRef.current) {
        const elapsed = Date.now() - startTimeRef.current
        const speed = 0.005 // Adjust speed (lower = slower, higher = faster) - Reduced by 75% total
        const translateX = -(elapsed * speed) % (features.length * 20) // 20% per item
        
        carouselRef.current.style.transform = `translateX(${translateX}%)`
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    // Start the continuous animation
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [features.length])

  return (
    <section className="py-16 bg-[#F7FCFA]">
      <div className="flex flex-col justify-center items-center gap-8">
        <h3 className="text-[36px] font-black text-[#0D1C17] text-center tracking-[-1px] font-lexend leading-[45px]">
          Why Choose Us?
        </h3>
        
        <div className="relative w-full max-w-7xl mx-auto overflow-hidden">
          {/* Truly Continuous Moving Carousel */}
          <div 
            className="flex" 
            ref={carouselRef}
            style={{ 
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          >
            {duplicatedFeatures.map((feature, index) => (
              <div
                key={`${feature.title}-${index}`}
                className="w-1/5 flex-shrink-0 px-3"
                style={{ 
                  minWidth: '280px',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden'
                }}
              >
                <div className="w-full h-[234px] p-6 flex flex-col items-center gap-6 rounded-xl border border-[#DBE5E0] bg-white hover:shadow-lg transition-shadow duration-300">
                  <div className="h-8 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-1 text-center">
                    <h4 className="text-base font-bold text-[#121714] font-lexend leading-5">
                      {feature.title}
                    </h4>
                    <p className="text-[13px] text-[#618A73] font-lexend leading-[21px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs

