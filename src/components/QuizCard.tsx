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
          text: 'text-[#FFECEB]',
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
        height: 'calc(100svh - 64px - 20px - 16px - 64px)',
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

      {/* Eyes in background - only for "fuck" category with randomized position */}
      {question.category.toLowerCase() === 'fuck' && (() => {
        const getRandomPos = (seed: string, min: number, max: number) => {
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
          }
          const normalized = Math.abs(hash % 1000) / 1000;
          return min + normalized * (max - min);
        };
        
        const posX = getRandomPos(question.question + 'posX', 15, 60);
        const posY = getRandomPos(question.question + 'posY', 45, 75);
        
        return (
          <div 
            ref={eyesRef} 
            className="absolute flex items-center justify-center gap-12 z-0"
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

      {/* Clouds in background - only for "wer aus der runde" category */}
      {question.category.toLowerCase() === 'wer aus der runde' && (() => {
        const getRandomPos = (seed: string, min: number, max: number) => {
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
          }
          const normalized = Math.abs(hash % 1000) / 1000;
          return min + normalized * (max - min);
        };
        
        // Define distinct position ranges for each cloud - more vertical stacking with horizontal offset
        const cloudPositions = [
          { xMin: 15, xMax: 45, yMin: 15, yMax: 30 },  // Top area - left side
          { xMin: 45, xMax: 75, yMin: 40, yMax: 55 },  // Middle area - right side
          { xMin: 20, xMax: 50, yMin: 65, yMax: 80 }   // Bottom area - left-center
        ];
        
        return (
          <>
            {[0, 1, 2].map((cloudIndex) => {
              const pos = cloudPositions[cloudIndex];
              const posX = getRandomPos(question.question + 'cloudX' + cloudIndex, pos.xMin, pos.xMax);
              const posY = getRandomPos(question.question + 'cloudY' + cloudIndex, pos.yMin, pos.yMax);
              
              return (
                <Cloud 
                  key={cloudIndex}
                  questionText={question.question}
                  cloudIndex={cloudIndex}
                  posX={posX}
                  posY={posY}
                />
              );
            })}
          </>
        );
      })()}

      {/* Smiley in background - only for "party" category */}
      {question.category.toLowerCase() === 'party' && (() => {
        const getRandomPos = (seed: string, min: number, max: number) => {
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
          }
          const normalized = Math.abs(hash % 1000) / 1000;
          return min + normalized * (max - min);
        };
        
        // Position smiley in lower area to stay below the text, small overlap OK
        const posX = getRandomPos(question.question + 'smileyX', 15, 85);
        const posY = getRandomPos(question.question + 'smileyY', 60, 85);
        
        return (
          <Smiley 
            questionText={question.question}
            posX={posX}
            posY={posY}
          />
        );
      })()}

      {/* X shape in background - only for "identity" category */}
      {question.category.toLowerCase() === 'identity' && (() => {
        const getRandomPos = (seed: string, min: number, max: number) => {
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
          }
          const normalized = Math.abs(hash % 1000) / 1000;
          return min + normalized * (max - min);
        };
        
        // Position X in lower area, allow cutoff
        const posX = getRandomPos(question.question + 'xPosX', 0, 90);
        const posY = getRandomPos(question.question + 'xPosY', 60, 95);
        
        return (
          <XShape 
            questionText={question.question}
            posX={posX}
            posY={posY}
          />
        );
      })()}

      {/* Wavy lines in background - only for "connection" category */}
      {question.category.toLowerCase() === 'connection' && (() => {
        const getRandomValue = (seed: string, min: number, max: number) => {
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
          }
          const normalized = Math.abs(hash % 1000) / 1000;
          return min + normalized * (max - min);
        };
        
        // Generate 4-6 organic wavy lines per card to cover ~30%
        const numLines = Math.floor(getRandomValue(question.question + 'numLines', 4, 7));
        
        return (
          <>
            {/* Organic wavy lines */}
            {Array.from({ length: numLines }).map((_, index) => (
              <WavyLine 
                key={`wavy-${index}`}
                questionText={question.question}
                lineIndex={index}
              />
            ))}
          </>
        );
      })()}

      {/* Category Strip */}
      <div className={`absolute left-0 top-0 h-full w-8 ${categoryColors.stripeBg} flex items-center justify-center border-r border-black z-10`}>
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
      <div className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10 relative z-10">

        <div ref={containerRef} className="flex-1 flex items-start justify-start text-left w-full pt-16">
          <h1 
            ref={textRef}
            className={`text-3xl md:text-4xl lg:text-[2.625rem] font-bricolage font-bold ${categoryColors.text} leading-[1.2] lg:leading-[1.1] w-full max-w-full`}
            style={{ hyphens: 'manual', overflowWrap: 'normal', wordBreak: 'normal' }}
          >
            {processedText.length > 0 ? processedText : question.question}
          </h1>
        </div>

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

// Cloud component with randomized shape and size
interface CloudProps {
  questionText: string;
  cloudIndex: number;
  posX: number;
  posY: number;
}

function Cloud({ questionText, cloudIndex, posX, posY }: CloudProps) {
  const getRandomValue = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };
  
  const rotation = getRandomValue(questionText + 'cloudRot' + cloudIndex, -10, 10);
  const scale = getRandomValue(questionText + 'cloudScale' + cloudIndex, 0.9, 1.1);
  // Each cloud gets a specific shape based on its index
  const shapeVariant = cloudIndex % 3;
  
  // Different cloud shapes using SVG paths
  const cloudShapes = [
    // Cloud shape 1
    "M25,35 Q15,35 10,25 Q10,15 20,15 Q25,5 35,10 Q45,10 50,20 Q60,25 55,35 Q50,40 40,38 Q35,45 25,35 Z",
    // Cloud shape 2
    "M30,40 Q20,40 15,30 Q12,20 22,18 Q28,10 38,12 Q48,12 52,22 Q58,28 54,38 Q48,42 38,40 Q32,45 30,40 Z",
    // Cloud shape 3
    "M28,38 Q18,38 14,28 Q12,18 24,16 Q30,8 40,10 Q50,10 54,20 Q60,26 56,36 Q50,40 40,38 Q34,44 28,38 Z"
  ];
  
  return (
    <div 
      className="absolute z-0"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale * 3})`
      }}
    >
      <svg width="80" height="50" viewBox="0 0 70 50">
        <path 
          d={cloudShapes[shapeVariant]}
          fill="#AFD2EE"
        />
      </svg>
    </div>
  );
}

// Smiley component with randomized size and rotation
interface SmileyProps {
  questionText: string;
  posX: number;
  posY: number;
}

function Smiley({ questionText, posX, posY }: SmileyProps) {
  const getRandomValue = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };
  
  const rotation = getRandomValue(questionText + 'smileyRot', -15, 15);
  const scale = getRandomValue(questionText + 'smileyScale', 0.5, 1.6);
  const eyeDistance = getRandomValue(questionText + 'eyeDistance', 12, 18);
  const eyeSize = getRandomValue(questionText + 'eyeSize', 2.5, 4);
  const eyeYPos = getRandomValue(questionText + 'eyeY', 38, 43);
  
  // Different happy mouth expressions - more variety
  const expressionType = Math.floor(getRandomValue(questionText + 'expression', 0, 6));
  
  // Randomize mouth parameters for each expression
  const mouthWidth = getRandomValue(questionText + 'mouthWidth' + expressionType, 22, 40);
  const mouthHeight = getRandomValue(questionText + 'mouthHeight' + expressionType, 12, 28);
  const mouthYStart = getRandomValue(questionText + 'mouthY' + expressionType, 52, 58);
  
  let mouthPath = '';
  if (expressionType === 0) {
    // Big wide smile
    mouthPath = `M ${50 - mouthWidth/2},${mouthYStart} Q 50,${mouthYStart + mouthHeight} ${50 + mouthWidth/2},${mouthYStart}`;
  } else if (expressionType === 1) {
    // Gentle curved smile
    mouthPath = `M ${50 - mouthWidth/2},${mouthYStart} Q 50,${mouthYStart + mouthHeight * 0.7} ${50 + mouthWidth/2},${mouthYStart}`;
  } else if (expressionType === 2) {
    // Super wide grin
    mouthPath = `M ${50 - mouthWidth/2},${mouthYStart - 2} Q 50,${mouthYStart + mouthHeight} ${50 + mouthWidth/2},${mouthYStart - 2}`;
  } else if (expressionType === 3) {
    // Cheerful arc
    mouthPath = `M ${50 - mouthWidth/2},${mouthYStart + 1} Q 50,${mouthYStart + mouthHeight * 0.85} ${50 + mouthWidth/2},${mouthYStart + 1}`;
  } else if (expressionType === 4) {
    // Beaming smile
    mouthPath = `M ${50 - mouthWidth/2},${mouthYStart - 1} Q 50,${mouthYStart + mouthHeight * 1.1} ${50 + mouthWidth/2},${mouthYStart - 1}`;
  } else {
    // Joyful grin
    mouthPath = `M ${50 - mouthWidth/2},${mouthYStart + 2} Q 50,${mouthYStart + mouthHeight * 0.9} ${50 + mouthWidth/2},${mouthYStart + 2}`;
  }
  
  return (
    <div 
      className="absolute z-0"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`
      }}
    >
      <svg width="200" height="200" viewBox="0 0 100 100">
        {/* Face circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="#EFFF5B"
        />
        {/* Left eye */}
        <circle 
          cx={50 - eyeDistance} 
          cy={eyeYPos}
          r={eyeSize}
          fill="#21245B"
        />
        {/* Right eye */}
        <circle 
          cx={50 + eyeDistance}
          cy={eyeYPos}
          r={eyeSize}
          fill="#21245B"
        />
        {/* Happy mouth */}
        <path 
          d={mouthPath}
          stroke="#21245B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// X Shape component with randomized size and rotation
interface XShapeProps {
  questionText: string;
  posX: number;
  posY: number;
}

function XShape({ questionText, posX, posY }: XShapeProps) {
  const getRandomValue = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };
  
  const rotation = getRandomValue(questionText + 'xRot', -30, 30);
  const scale = getRandomValue(questionText + 'xScale', 0.4, 1.0);
  
  return (
    <div 
      className="absolute z-0"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`
      }}
    >
      <svg width="400" height="400" viewBox="0 0 300 300">
        {/* X shape - two lines crossing */}
        <line 
          x1="50" 
          y1="50" 
          x2="250" 
          y2="250" 
          stroke="#9FDCE3"
          strokeWidth="100"
          strokeLinecap="round"
        />
        <line 
          x1="250" 
          y1="50" 
          x2="50" 
          y2="250" 
          stroke="#9FDCE3"
          strokeWidth="100"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Wavy Line component with thick organic flowing ribbon shapes
interface WavyLineProps {
  questionText: string;
  lineIndex: number;
}

function WavyLine({ questionText, lineIndex }: WavyLineProps) {
  const getRandomValue = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };
  
  // Random starting position
  const startX = getRandomValue(questionText + 'startX' + lineIndex, -30, 100);
  const startY = getRandomValue(questionText + 'startY' + lineIndex, -30, 100);
  
  // Base thickness with variation
  const baseThickness = getRandomValue(questionText + 'thickness' + lineIndex, 25, 50);
  
  // Number of curves (2-4 for nice S-curves)
  const numCurves = Math.floor(getRandomValue(questionText + 'curves' + lineIndex, 2, 5));
  
  // Generate center path points
  const centerPoints = [{ x: startX, y: startY }];
  let currentX = startX;
  let currentY = startY;
  
  for (let i = 0; i < numCurves; i++) {
    currentX += getRandomValue(questionText + 'dx' + lineIndex + i, 30, 60);
    currentY += getRandomValue(questionText + 'dy' + lineIndex + i, -40, 40);
    centerPoints.push({ x: currentX, y: currentY });
  }
  
  // Create wavy edges on both sides of the center path
  const topEdge: string[] = [];
  const bottomEdge: string[] = [];
  
  for (let i = 0; i < centerPoints.length; i++) {
    const point = centerPoints[i];
    const nextPoint = centerPoints[i + 1];
    
    if (!nextPoint) break;
    
    // Calculate perpendicular direction
    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Varying thickness along the curve
    const thicknessVariation = getRandomValue(questionText + 'thickVar' + lineIndex + i, 0.7, 1.3);
    const halfThick = (baseThickness * thicknessVariation) / 2;
    
    // Add wave to edges
    const waveAmount = getRandomValue(questionText + 'wave' + lineIndex + i, -8, 8);
    
    // Top edge point
    const topX = point.x + perpX * (halfThick + waveAmount);
    const topY = point.y + perpY * (halfThick + waveAmount);
    
    // Bottom edge point
    const bottomX = point.x - perpX * (halfThick - waveAmount);
    const bottomY = point.y - perpY * (halfThick - waveAmount);
    
    if (i === 0) {
      topEdge.push(`M ${topX},${topY}`);
      bottomEdge.push(`${bottomX},${bottomY}`);
    } else {
      // Create smooth curves between points
      const prevTop = topEdge[topEdge.length - 1];
      topEdge.push(`Q ${point.x + perpX * halfThick},${point.y + perpY * halfThick} ${topX},${topY}`);
      bottomEdge.push(`${bottomX},${bottomY}`);
    }
  }
  
  // Build complete path - top edge forward, bottom edge backward, close
  const pathData = topEdge.join(' ') + 
    ` L ${bottomEdge[bottomEdge.length - 1]} ` +
    bottomEdge.slice(0, -1).reverse().map((p, i) => {
      if (i === 0) return `L ${p}`;
      return `L ${p}`;
    }).join(' ') + 
    ' Z';
  
  return (
    <div className="absolute inset-0 z-0 overflow-visible pointer-events-none">
      <svg 
        className="absolute" 
        width="200%" 
        height="200%" 
        viewBox="-50 -50 200 200"
        preserveAspectRatio="none"
        style={{ overflow: 'visible', left: '-50%', top: '-50%' }}
      >
        <path 
          d={pathData}
          fill="#F1A8C6"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}