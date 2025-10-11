import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  question: string;
  category: string;
}

interface QuizCardProps {
  question: Question;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  animationClass?: string;
  onBgColorChange?: (bgClass: string) => void;
}

export function QuizCard({ question, onSwipeLeft, onSwipeRight, animationClass = '', onBgColorChange }: QuizCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processedText, setProcessedText] = useState<JSX.Element[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pupilDirection, setPupilDirection] = useState<'left' | 'right' | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  
  const textRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  // Mouse tracking for pupils
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 15000 + Math.random() * 15000); // Blink every 15-30 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Process text to handle long words individually
  useEffect(() => {
    const processText = () => {
      if (!containerRef.current) return;

      const words = question.question.split(' ');
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      
      // Create temporary element to measure word width with exact same styles
      const tempElement = document.createElement('span');
      tempElement.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: nowrap;
        font-size: 3rem;
        font-family: inherit;
        font-weight: normal;
        padding: 0;
        margin: 0;
        border: 0;
      `;
      
      // Add to same container to inherit styles
      containerRef.current.appendChild(tempElement);

      const processedWords = words.map((word, index) => {
        tempElement.textContent = word;
        const wordWidth = tempElement.getBoundingClientRect().width;
        
        // Only apply hyphenation if word is actually wider than available space
        // Use full container width minus some padding buffer
        const needsHyphenation = wordWidth > (containerWidth - 20);
        
        return (
          <span 
            key={index}
            style={{
              hyphens: needsHyphenation ? 'auto' : 'none',
              overflowWrap: needsHyphenation ? 'break-word' : 'normal',
              wordBreak: 'normal'
            }}
            lang="de"
          >
            {word}
            {index < words.length - 1 && ' '}
          </span>
        );
      });

      containerRef.current.removeChild(tempElement);
      setProcessedText(processedWords);
    };

    const timeoutId = setTimeout(processText, 50);
    window.addEventListener('resize', processText);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', processText);
    };
  }, [question.question]);

  // Get category-specific colors
  const getCategoryColors = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    switch (categoryLower) {
      case 'connection':
        return {
          bg: 'bg-quiz-connection-bg',
          text: 'text-connection-900',
          stripeBg: 'bg-connection-500',
          stripeText: 'text-connection-900',
          bgDark: 'bg-quiz-connection-bg-dark'
        };
      case 'fuck':
        return {
          bg: 'bg-quiz-fuck-bg',
          text: 'text-fuck-900',
          stripeBg: 'bg-fuck-500',
          stripeText: 'text-fuck-900',
          bgDark: 'bg-quiz-fuck-bg-dark'
        };
      case 'identity':
        return {
          bg: 'bg-quiz-identity-bg',
          text: 'text-identity-900',
          stripeBg: 'bg-identity-500',
          stripeText: 'text-identity-900',
          bgDark: 'bg-quiz-identity-bg-dark'
        };
      case 'party':
        return {
          bg: 'bg-quiz-party-bg',
          text: 'text-party-900',
          stripeBg: 'bg-party-500',
          stripeText: 'text-party-900',
          bgDark: 'bg-quiz-party-bg-dark'
        };
      case 'wer aus der runde':
        return {
          bg: 'bg-quiz-wer-aus-der-runde-bg',
          text: 'text-wer-aus-der-runde-900',
          stripeBg: 'bg-wer-aus-der-runde-500',
          stripeText: 'text-wer-aus-der-runde-900',
          bgDark: 'bg-quiz-wer-aus-der-runde-bg-dark'
        };
      case 'friends':
        return {
          bg: 'bg-quiz-friends-bg',
          text: 'text-friends-900',
          stripeBg: 'bg-friends-500',
          stripeText: 'text-friends-900',
          bgDark: 'bg-quiz-friends-bg-dark'
        };
      case 'self reflection':
        return {
          bg: 'bg-quiz-self-reflection-bg',
          text: 'text-self-reflection-900',
          stripeBg: 'bg-self-reflection-500',
          stripeText: 'text-self-reflection-900',
          bgDark: 'bg-quiz-self-reflection-bg-dark'
        };
      case 'family':
        return {
          bg: 'bg-quiz-family-bg',
          text: 'text-family-900',
          stripeBg: 'bg-family-500',
          stripeText: 'text-family-900',
          bgDark: 'bg-quiz-family-bg-dark'
        };
      case 'career':
        return {
          bg: 'bg-quiz-career-bg',
          text: 'text-career-900',
          stripeBg: 'bg-career-500',
          stripeText: 'text-career-900',
          bgDark: 'bg-quiz-career-bg-dark'
        };
      case 'travel':
        return {
          bg: 'bg-quiz-travel-bg',
          text: 'text-travel-900',
          stripeBg: 'bg-travel-500',
          stripeText: 'text-travel-900',
          bgDark: 'bg-quiz-travel-bg-dark'
        };
      case 'health':
        return {
          bg: 'bg-quiz-health-bg',
          text: 'text-health-900',
          stripeBg: 'bg-health-500',
          stripeText: 'text-health-900',
          bgDark: 'bg-quiz-health-bg-dark'
        };
      case 'money':
        return {
          bg: 'bg-quiz-money-bg',
          text: 'text-money-900',
          stripeBg: 'bg-money-500',
          stripeText: 'text-money-900',
          bgDark: 'bg-quiz-money-bg-dark'
        };
      case 'love':
        return {
          bg: 'bg-quiz-love-bg',
          text: 'text-love-900',
          stripeBg: 'bg-love-500',
          stripeText: 'text-love-900',
          bgDark: 'bg-quiz-love-bg-dark'
        };
      case 'hobby':
        return {
          bg: 'bg-quiz-hobby-bg',
          text: 'text-hobby-900',
          stripeBg: 'bg-hobby-500',
          stripeText: 'text-hobby-900',
          bgDark: 'bg-quiz-hobby-bg-dark'
        };
      case 'dreams':
        return {
          bg: 'bg-quiz-dreams-bg',
          text: 'text-dreams-900',
          stripeBg: 'bg-dreams-500',
          stripeText: 'text-dreams-900',
          bgDark: 'bg-quiz-dreams-bg-dark'
        };
      case 'fear':
        return {
          bg: 'bg-quiz-fear-bg',
          text: 'text-fear-900',
          stripeBg: 'bg-fear-500',
          stripeText: 'text-fear-900',
          bgDark: 'bg-quiz-fear-bg-dark'
        };
      case 'wisdom':
        return {
          bg: 'bg-quiz-wisdom-bg',
          text: 'text-wisdom-900',
          stripeBg: 'bg-wisdom-500',
          stripeText: 'text-wisdom-900',
          bgDark: 'bg-quiz-wisdom-bg-dark'
        };
      case 'future':
        return {
          bg: 'bg-quiz-future-bg',
          text: 'text-future-900',
          stripeBg: 'bg-future-500',
          stripeText: 'text-future-900',
          bgDark: 'bg-quiz-future-bg-dark'
        };
      default:
        return {
          bg: 'bg-quiz-category-bg',
          text: 'text-quiz-category-text',
          stripeBg: 'bg-quiz-category-bg',
          stripeText: 'text-quiz-category-text',
          bgDark: 'bg-quiz-category-bg-dark'
        };
    }
  };

  // Haptic feedback function
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // 50ms vibration
    }
  };

  const categoryColors = getCategoryColors(question.category);

  // Notify parent about background color change
  useEffect(() => {
    if (onBgColorChange) {
      onBgColorChange(categoryColors.bgDark);
    }
  }, [categoryColors.bgDark, onBgColorChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setPupilDirection('left');
      setTimeout(() => setPupilDirection(null), 300);
      onSwipeLeft();
    } else if (isRightSwipe) {
      setPupilDirection('right');
      setTimeout(() => setPupilDirection(null), 300);
      onSwipeRight();
    }
  };

  // Mouse drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = () => {
    if (!isDragging || !mouseStart || !mouseEnd) {
      setIsDragging(false);
      return;
    }
    
    const distance = mouseStart - mouseEnd;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;

    if (isLeftDrag) {
      setPupilDirection('left');
      setTimeout(() => setPupilDirection(null), 300);
      onSwipeLeft();
    } else if (isRightDrag) {
      setPupilDirection('right');
      setTimeout(() => setPupilDirection(null), 300);
      onSwipeRight();
    }
    
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`relative h-full w-full max-w-[500px] mx-auto ${categoryColors.bg} rounded-2xl overflow-hidden select-none border border-black ${animationClass}`}
      style={{
        boxShadow: '0 0 12px 4px rgba(30, 30, 30, 0.1)',
        height: 'calc(100svh - 64px - 20px - 16px - 32px)',
        maxHeight: '100%',
        transition: 'height 0.2s ease-out'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Left Click Area - Previous */}
      <div 
        className="absolute left-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={() => {
          triggerHaptic();
          onSwipeRight();
        }}
      />

      {/* Right Click Area - Next */}
      <div 
        className="absolute right-0 top-0 w-20 h-full z-10 cursor-pointer"
        onClick={() => {
          triggerHaptic();
          onSwipeLeft();
        }}
      />

      {/* Category Strip */}
      <div className={`absolute left-0 top-0 h-full w-8 ${categoryColors.stripeBg} flex items-center justify-center`}>
        <div className="transform -rotate-90 whitespace-nowrap">
          {Array(20).fill(question.category).map((cat, index) => (
            <span 
              key={`${cat}-${index}`} 
              className={`${categoryColors.stripeText} font-bold text-sm tracking-wide uppercase`} 
              style={{ 
                marginRight: index < 19 ? '8px' : '0'
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10">

        <div ref={containerRef} className="flex-1 flex items-start justify-start text-left w-full pt-16">
          <h1 
            ref={textRef}
            className={`text-3xl md:text-4xl lg:text-4xl font-bricolage ${categoryColors.text} leading-[1.241] w-full max-w-full`}
          >
            {processedText.length > 0 ? processedText : question.question}
          </h1>
        </div>

        {/* Eyes in bottom 1/4 of card */}
        <div ref={eyesRef} className="h-1/4 flex items-center justify-center gap-8 pb-8">
          <Eye mousePosition={mousePosition} pupilDirection={pupilDirection} isBlinking={isBlinking} />
          <Eye mousePosition={mousePosition} pupilDirection={pupilDirection} isBlinking={isBlinking} />
        </div>

      </div>

    </div>
  );
}

// Eye component
interface EyeProps {
  mousePosition: { x: number; y: number };
  pupilDirection: 'left' | 'right' | null;
  isBlinking: boolean;
}

function Eye({ mousePosition, pupilDirection, isBlinking }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);

  const getPupilPosition = () => {
    if (pupilDirection === 'left') {
      return { x: -8, y: 0 };
    }
    if (pupilDirection === 'right') {
      return { x: 8, y: 0 };
    }

    if (!eyeRef.current) return { x: 0, y: 0 };

    const eyeRect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const angle = Math.atan2(mousePosition.y - eyeCenterY, mousePosition.x - eyeCenterX);
    const distanceX = 12; // Max horizontal pupil movement
    const distanceY = 6; // Max vertical pupil movement (reduced)

    return {
      x: Math.cos(angle) * distanceX,
      y: Math.sin(angle) * distanceY
    };
  };

  const pupilPos = getPupilPosition();

  return (
    <div 
      ref={eyeRef}
      className="relative bg-white rounded-full transition-transform duration-150"
      style={{
        width: '35px',
        height: '100px',
        borderRadius: '50%',
        transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)',
      }}
    >
      <div
        className="absolute bg-black rounded-full transition-all duration-75"
        style={{
          width: '16px',
          height: '16px',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${pupilPos.x}px), calc(-50% + ${pupilPos.y}px))`,
          opacity: isBlinking ? 0 : 1
        }}
      />
    </div>
  );
}