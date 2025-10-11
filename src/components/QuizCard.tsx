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
  disableSwipe?: boolean;
}

export function QuizCard({ question, onSwipeLeft, onSwipeRight, animationClass = '', onBgColorChange, disableSwipe = false }: QuizCardProps) {
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
      const availableWidth = (textRef.current?.getBoundingClientRect().width ?? containerRef.current.getBoundingClientRect().width);
      
      // Create temporary element to measure word width with exact same computed styles
      const tempElement = document.createElement('span');
      const computed = textRef.current ? window.getComputedStyle(textRef.current) : null;
      tempElement.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: nowrap;
        font-size: ${computed?.fontSize ?? 'inherit'};
        font-family: ${computed?.fontFamily ?? 'inherit'};
        font-weight: ${computed?.fontWeight ?? 'inherit'};
        letter-spacing: ${computed?.letterSpacing ?? 'normal'};
        text-transform: ${computed?.textTransform ?? 'none'};
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
        const needsHyphenation = wordWidth > (availableWidth - 20);
        
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

  // Notify parent about background color change and update iOS Safari theme color
  useEffect(() => {
    if (onBgColorChange) {
      onBgColorChange(categoryColors.bgDark);
      
      // Update theme-color meta tag for iOS Safari status bar
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        const bgColorVar = categoryColors.bgDark.replace('bg-', '');
        metaThemeColor.setAttribute('content', `hsl(var(--${bgColorVar}))`);
      }
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
      className={`relative h-full ${categoryColors.bg} rounded-2xl overflow-hidden select-none border border-black ${animationClass}`}
      style={{
        width: 'calc(100vw - 32px)',
        boxShadow: '0 0 12px 4px rgba(30, 30, 30, 0.1)',
        height: 'calc(100svh - 64px - 20px - 16px - 32px)',
        maxHeight: '100%',
        transition: 'height 0.2s ease-out'
      }}
      onTouchStart={disableSwipe ? undefined : onTouchStart}
      onTouchMove={disableSwipe ? undefined : onTouchMove}
      onTouchEnd={disableSwipe ? undefined : onTouchEnd}
      onMouseDown={disableSwipe ? undefined : onMouseDown}
      onMouseMove={disableSwipe ? undefined : onMouseMove}
      onMouseUp={disableSwipe ? undefined : onMouseUp}
      onMouseLeave={disableSwipe ? undefined : onMouseLeave}
    >
      {/* Left/Right Click Areas - only when swipe enabled */}
      {!disableSwipe && (
        <>
          <div 
            className="absolute left-0 top-0 w-20 h-full z-10 cursor-pointer"
            onClick={() => {
              triggerHaptic();
              onSwipeRight();
            }}
          />
          <div 
            className="absolute right-0 top-0 w-20 h-full z-10 cursor-pointer"
            onClick={() => {
              triggerHaptic();
              onSwipeLeft();
            }}
          />
        </>
      )}

      {/* Category Strip */}
      <div className={`absolute left-0 top-0 h-full w-8 ${categoryColors.stripeBg} flex items-center justify-center border-r border-black`}>
        <div className="transform -rotate-90 whitespace-nowrap">
          {Array(20).fill(question.category).map((cat, index) => (
            <span 
              key={`${cat}-${index}`} 
              className={`${categoryColors.stripeText} font-medium text-sm tracking-wide uppercase`} 
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
            className={`text-3xl md:text-4xl lg:text-[2.625rem] font-bricolage font-bold ${categoryColors.text} leading-[1.2] lg:leading-[1.1] w-full max-w-full`}
            style={{ hyphens: 'manual', overflowWrap: 'normal', wordBreak: 'normal' }}
          >
            {processedText.length > 0 ? processedText : question.question}
          </h1>
        </div>

        {/* Eyes - only for "fuck" category with randomized position */}
        {question.category.toLowerCase() === 'fuck' && (() => {
          // Generate consistent random position based on question text
          const getRandomPos = (seed: string, min: number, max: number) => {
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
              hash = ((hash << 5) - hash) + seed.charCodeAt(i);
              hash = hash & hash;
            }
            const normalized = Math.abs(hash % 1000) / 1000;
            return min + normalized * (max - min);
          };
          
          const posX = getRandomPos(question.question + 'posX', 15, 60); // 15% to 60% from left
          const posY = getRandomPos(question.question + 'posY', 45, 75); // 45% to 75% from top
          
          return (
            <div 
              ref={eyesRef} 
              className="absolute flex items-center justify-center gap-12"
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Eye 
                mousePosition={mousePosition} 
                pupilDirection={pupilDirection} 
                isBlinking={isBlinking} 
                questionText={question.question}
                eyeIndex={0}
              />
              <Eye 
                mousePosition={mousePosition} 
                pupilDirection={pupilDirection} 
                isBlinking={isBlinking} 
                questionText={question.question}
                eyeIndex={1}
              />
            </div>
          );
        })()}

      </div>

    </div>
  );
}

// Eye component with randomized shape and position
interface EyeProps {
  mousePosition: { x: number; y: number };
  pupilDirection: 'left' | 'right' | null;
  isBlinking: boolean;
  questionText: string;
  eyeIndex: number;
}

function Eye({ mousePosition, pupilDirection, isBlinking, questionText, eyeIndex }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  
  // Generate consistent random values based on question text and eye index
  const getRandomValue = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };
  
  const seed = questionText + eyeIndex;
  
  // Determine if this should be a circle or ellipse
  const shapeType = getRandomValue(seed + 'shape', 0, 1);
  
  // Randomize eye shape - can be circle or various ellipses
  let eyeWidth, eyeHeight;
  if (shapeType < 0.3) {
    // Circle (30% chance)
    const circleSize = getRandomValue(seed + 'circle', 60, 100);
    eyeWidth = circleSize;
    eyeHeight = circleSize;
  } else if (shapeType < 0.65) {
    // Vertical ellipse (35% chance)
    eyeWidth = getRandomValue(seed + 'w', 50, 80);
    eyeHeight = getRandomValue(seed + 'h', 120, 180);
  } else {
    // Horizontal ellipse (35% chance)
    eyeWidth = getRandomValue(seed + 'w', 100, 140);
    eyeHeight = getRandomValue(seed + 'h', 60, 100);
  }
  
  // Randomize position offset
  const offsetX = getRandomValue(seed + 'x', -20, 20);
  const offsetY = getRandomValue(seed + 'y', -30, 30);
  
  // Randomize rotation (40% chance of rotation)
  const shouldRotate = getRandomValue(seed + 'rot', 0, 1);
  const rotation = shouldRotate < 0.4 ? getRandomValue(seed + 'angle', -25, 25) : 0;
  
  // Randomize pupil size relative to eye size
  const pupilSize = Math.min(eyeWidth, eyeHeight) * getRandomValue(seed + 'p', 0.25, 0.4);

  const getPupilPosition = () => {
    if (pupilDirection === 'left') {
      return { x: -12, y: 0 };
    }
    if (pupilDirection === 'right') {
      return { x: 12, y: 0 };
    }

    if (!eyeRef.current) return { x: 0, y: 0 };

    const eyeRect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const angle = Math.atan2(mousePosition.y - eyeCenterY, mousePosition.x - eyeCenterX);
    const distanceX = eyeWidth * 0.25; // Max horizontal pupil movement
    const distanceY = eyeHeight * 0.15; // Max vertical pupil movement

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
        width: `${eyeWidth}px`,
        height: `${eyeHeight}px`,
        borderRadius: '50%',
        transform: `scaleY(${isBlinking ? 0.1 : 1}) rotate(${rotation}deg)`,
        marginLeft: `${offsetX}px`,
        marginTop: `${offsetY}px`,
      }}
    >
      <div
        className="absolute bg-black rounded-full transition-all duration-75"
        style={{
          width: `${pupilSize}px`,
          height: `${pupilSize}px`,
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${pupilPos.x}px), calc(-50% + ${pupilPos.y}px))`,
          opacity: isBlinking ? 0 : 1
        }}
      />
    </div>
  );
}