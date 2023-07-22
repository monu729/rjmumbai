"use client"
import { useState, useEffect } from 'react';
import { animateScroll as scroll } from 'react-scroll';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    scroll.scrollToTop({
      duration: 300,
      smooth: 'easeInOutQuint',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
  
    <button
  onClick={scrollToTop}
  className="fixed bottom-32 right-6 p-4 bg-gray-800 text-white rounded-full shadow"
  style={{ width: '56px', height: '56px'  }}
>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
</svg>
</button>

  );
};

export default ScrollToTopButton;
