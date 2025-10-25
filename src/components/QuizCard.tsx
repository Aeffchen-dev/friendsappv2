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
  useContainerSize?: boolean;
  onCategoryStripClick?: () => void;
  onTopClick?: () => void;
}

export function QuizCard({ question, onSwipeLeft, onSwipeRight, animationClass = '', onBgColorChange, disableSwipe = false, useContainerSize = false, onCategoryStripClick, onTopClick }: QuizCardProps) {
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
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isRollingEyes, setIsRollingEyes] = useState(false);
  
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

  // Synchronized pupil movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const randomX = (Math.random() - 0.5) * 50; // ±25px horizontal movement
      const randomY = (Math.random() - 0.5) * 16; // ±8px vertical movement
      setPupilOffset({ x: randomX, y: randomY });
    }, 6000 + Math.random() * 8000); // Move every 6-14 seconds

    return () => clearInterval(moveInterval);
  }, []);

  // Eye rolling animation
  useEffect(() => {
    const rollInterval = setInterval(() => {
      setIsRollingEyes(true);
      setTimeout(() => setIsRollingEyes(false), 2000); // Roll for 2 seconds
    }, 15000 + Math.random() * 20000); // Roll every 15-35 seconds

    return () => clearInterval(rollInterval);
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
        width: useContainerSize ? '100%' : (window.innerWidth >= 768 ? 'calc(100vw - 32px)' : 'calc(100vw - 16px)'),
        boxShadow: '0 0 12px 4px rgba(30, 30, 30, 0.1)',
        height: useContainerSize ? '100%' : (window.innerWidth >= 768 ? '80vh' : '70vh'),
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
        
        // Check if text is long and adjust eye position accordingly
        const isLongText = question.question.length > 80;
        const posX = getRandomPos(question.question + 'posX', 35, 50);
        const posY = isLongText 
          ? getRandomPos(question.question + 'posY', 70, 85)  // Bottom part for long text
          : getRandomPos(question.question + 'posY', 50, 65);  // Middle for short text
        
        return (
          <div 
            ref={eyesRef}
            className="absolute flex items-center justify-center gap-8 z-0"
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
              pupilOffset={pupilOffset}
              isRollingEyes={isRollingEyes}
            />
            <Eye 
              mousePosition={mousePosition} 
              pupilDirection={pupilDirection} 
              isBlinking={isBlinking} 
              questionText={question.question}
              eyeIndex={1}
              pupilOffset={pupilOffset}
              isRollingEyes={false}
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
        
        // Check if question text is long
        const isLongQuestion = question.question.length > 80;
        
        // Position smiley at bottom with cutoff if question is long, otherwise in lower area
        const posX = getRandomPos(question.question + 'smileyX', 15, 85);
        const posY = isLongQuestion 
          ? getRandomPos(question.question + 'smileyY', 92, 102) // Bottom with cutoff
          : getRandomPos(question.question + 'smileyY', 60, 85); // Normal lower area
        
        return (
          <Smiley 
            questionText={question.question}
            posX={posX}
            posY={posY}
            isLongQuestion={isLongQuestion}
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
        
        // Position X in bottom area, ensure min 80% visible
        const posX = getRandomPos(question.question + 'xPosX', 30, 70);
        const posY = getRandomPos(question.question + 'xPosY', 75, 88);
        
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
        
        // Generate 3 snake-like circular lines per card
        const numCircles = 3;
        
        return (
          <>
            {/* Snake-like circular lines */}
            {Array.from({ length: numCircles }).map((_, index) => (
              <WavyLine 
                key={`wave-${index}`}
                questionText={question.question}
                lineIndex={index}
              />
            ))}
          </>
        );
      })()}

      {/* Category Strip - clickable to go to prev horizontal slide */}
      <div 
        className={`absolute left-0 top-0 h-full w-8 ${categoryColors.stripeBg} flex items-center justify-center border-r border-black z-10 ${onCategoryStripClick ? 'cursor-pointer' : ''}`}
        data-clickable="true"
        onClick={(e) => {
          if (onCategoryStripClick) {
            e.preventDefault();
            e.stopPropagation();
            triggerHaptic();
            onCategoryStripClick();
          }
        }}
      >
        <div className="transform -rotate-90 whitespace-nowrap pointer-events-none">
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
      <div 
        className="ml-8 lg:ml-10 h-full flex flex-col justify-center px-8 lg:pr-10 relative z-10"
        data-clickable="true"
        onClick={(e) => {
          if (onTopClick) {
            const clickY = e.clientY;
            const cardTop = (e.currentTarget.closest('.relative') as HTMLElement)?.getBoundingClientRect().top || 0;
            const relativeY = clickY - cardTop;
            
            // Top 25% of card triggers vertical prev
            if (relativeY < (e.currentTarget.closest('.relative') as HTMLElement)?.getBoundingClientRect().height! * 0.25) {
              triggerHaptic();
              onTopClick();
            }
          }
        }}
      >

        <div ref={containerRef} className="flex-1 flex items-start justify-start text-left w-full pt-16">
          <h1 
            ref={textRef}
            className={`text-3xl md:text-4xl lg:text-[2.625rem] font-bricolage font-bold md:font-bold ${categoryColors.text} leading-[1.2] lg:leading-[1.1] tracking-tight w-full max-w-full`}
            style={{ hyphens: 'manual', overflowWrap: 'normal', wordBreak: 'normal', fontWeight: 'bold' }}
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
  pupilOffset: { x: number; y: number };
  isRollingEyes: boolean;
}

function Eye({ mousePosition, pupilDirection, isBlinking, questionText, eyeIndex, pupilOffset, isRollingEyes }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [rollAngle, setRollAngle] = useState(0);

  // Eye rolling animation
  useEffect(() => {
    if (isRollingEyes) {
      let angle = 0;
      const rollInterval = setInterval(() => {
        angle += 30; // Increment angle for circular motion
        setRollAngle(angle);
        if (angle >= 360) {
          clearInterval(rollInterval);
          setRollAngle(0);
        }
      }, 50); // Update every 50ms for smooth rotation

      return () => clearInterval(rollInterval);
    }
  }, [isRollingEyes]);
  
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
    // Calculate max allowed movement based on eye and pupil size
    const maxDistanceX = (eyeWidth / 2) - (pupilSize / 2) - 5; // 5px padding
    const maxDistanceY = (eyeHeight / 2) - (pupilSize / 2) - 5; // 5px padding

    if (isRollingEyes) {
      // Circular motion when rolling eyes - constrained
      const radius = Math.min(maxDistanceX * 0.7, maxDistanceY * 0.7);
      const angleInRadians = (rollAngle * Math.PI) / 180;
      return {
        x: Math.cos(angleInRadians) * radius,
        y: Math.sin(angleInRadians) * radius
      };
    }

    if (pupilDirection === 'left') {
      return { x: Math.max(-maxDistanceX, -12), y: 0 };
    }
    if (pupilDirection === 'right') {
      return { x: Math.min(maxDistanceX, 12), y: 0 };
    }

    // Apply synchronized offset but clamp to eye boundaries
    let x = pupilOffset.x;
    let y = pupilOffset.y;

    // Clamp to stay within eye boundaries
    x = Math.max(-maxDistanceX, Math.min(maxDistanceX, x));
    y = Math.max(-maxDistanceY, Math.min(maxDistanceY, y));

    return { x, y };
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
        className="absolute bg-black rounded-full transition-all duration-1000 ease-in-out"
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
  
  // Cloud shapes made of circles that morph by changing size and amount
  const cloudShapes = [
    // 3 large bubbles
    "M15,30 Q10,22 18,18 Q26,14 34,18 Q38,14 46,18 Q54,14 62,18 Q70,22 65,30 Q60,38 50,38 Q40,38 30,38 Q20,38 15,30 Z",
    // 4 medium bubbles
    "M18,32 Q14,26 20,22 Q26,18 32,22 Q36,18 42,22 Q46,18 52,22 Q56,18 62,22 Q68,26 64,32 Q60,38 52,38 Q44,38 36,38 Q28,38 20,38 Q14,38 18,32 Z",
    // 2 large + 2 small bubbles
    "M20,30 Q16,24 24,20 Q32,16 40,20 Q44,18 50,22 Q54,20 60,24 Q64,28 60,34 Q56,40 48,40 Q40,40 32,40 Q24,40 20,34 Q16,34 20,30 Z",
    // 3 varied size bubbles
    "M22,31 Q18,26 24,22 Q30,18 36,22 Q40,18 48,22 Q54,18 62,24 Q68,30 62,36 Q56,42 48,40 Q40,42 32,40 Q24,38 22,31 Z",
    // 5 small bubbles
    "M20,30 Q16,26 22,24 Q26,22 30,24 Q34,22 38,24 Q42,22 46,24 Q50,22 54,24 Q58,22 62,24 Q66,26 64,30 Q62,34 56,36 Q50,38 44,36 Q38,38 32,36 Q26,38 22,36 Q18,34 20,30 Z"
  ];

  // Animation speed similar to connection breathing - slow and smooth
  const morphDuration = getRandomValue(questionText + 'morphDur' + cloudIndex, 25, 40);
  const floatDuration = getRandomValue(questionText + 'floatDur' + cloudIndex, 80, 120);

  // Randomize horizontal movement range AND direction for each cloud
  const movementDirection = getRandomValue(questionText + 'cloudDir' + cloudIndex, 0, 1) > 0.5 ? 1 : -1;
  const horizontalMovement = getRandomValue(questionText + 'cloudMove' + cloudIndex, 5, 20) * movementDirection;
  
  // Different blur intensity for each cloud
  const maxBlur = getRandomValue(questionText + 'cloudBlur' + cloudIndex, 0.2, 1.2);
  
  // Random animation delay to desynchronize clouds - much larger range
  const animationDelay = getRandomValue(questionText + 'cloudDelay' + cloudIndex, 0, floatDuration);
  
  // Randomize blur timing for each cloud (different keyframe percentages)
  const blurPeak1 = getRandomValue(questionText + 'blurPeak1' + cloudIndex, 15, 40);
  const blurPeak2 = getRandomValue(questionText + 'blurPeak2' + cloudIndex, 50, 85);
  
  // Random movement pattern variation
  const moveMultiplier1 = getRandomValue(questionText + 'moveMult1' + cloudIndex, 0.3, 0.8);
  const moveMultiplier2 = getRandomValue(questionText + 'moveMult2' + cloudIndex, 0.9, 1.5);
  const moveMultiplier3 = getRandomValue(questionText + 'moveMult3' + cloudIndex, 0.2, 0.6);
  
  // Create seamless loop: add first shape at the end
  const morphValues = [...cloudShapes, cloudShapes[0]].join(';');
  
  // Random start shape for more variation
  const startShapeIndex = Math.floor(getRandomValue(questionText + 'startShape' + cloudIndex, 0, cloudShapes.length));
  
  return (
    <div 
      className="absolute z-0"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale * 3})`,
        animation: `cloudFloat-${cloudIndex} ${floatDuration}s ease-in-out infinite`,
        animationDelay: `-${animationDelay}s`,
      }}
    >
      <style>
        {`
          @keyframes cloudFloat-${cloudIndex} {
            0% { 
              transform: translate(-50%, -50%) rotate(${rotation}deg) scale(${scale * 3}) translateX(-100%);
              filter: blur(${maxBlur * 0.3}px);
            }
            50% { 
              transform: translate(-50%, -50%) rotate(${rotation}deg) scale(${scale * 3}) translateX(100%);
              filter: blur(0px);
            }
            100% { 
              transform: translate(-50%, -50%) rotate(${rotation}deg) scale(${scale * 3}) translateX(-100%);
              filter: blur(${maxBlur * 0.3}px);
            }
          }
        `}
      </style>
      <svg width="80" height="50" viewBox="0 0 70 50">
        <path 
          d={cloudShapes[startShapeIndex]}
          fill="#AFD2EE"
        >
          <animate
            attributeName="d"
            values={morphValues}
            dur={`${morphDuration}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            begin={`${getRandomValue(questionText + 'morphDelay' + cloudIndex, 0, morphDuration * 0.5)}s`}
          />
        </path>
      </svg>
    </div>
  );
}

// Smiley component with randomized size and rotation
interface SmileyProps {
  questionText: string;
  posX: number;
  posY: number;
  isLongQuestion?: boolean;
}

function Smiley({ questionText, posX, posY, isLongQuestion = false }: SmileyProps) {
  const [isWinking, setIsWinking] = useState(false);
  
  const getRandomValue = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };
  
  // Random winking effect
  useEffect(() => {
    const winkInterval = setInterval(() => {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 200);
    }, 8000 + Math.random() * 12000); // Wink every 8-20 seconds

    return () => clearInterval(winkInterval);
  }, []);
  
  const rotation = getRandomValue(questionText + 'smileyRot', -15, 15);
  // Make smiley much bigger if question is long
  const scale = isLongQuestion 
    ? getRandomValue(questionText + 'smileyScale', 1.4, 2.2) 
    : getRandomValue(questionText + 'smileyScale', 0.5, 1.6);
  const eyeDistance = getRandomValue(questionText + 'eyeDistance', 12, 18);
  
  // Check if this is the drugs question - make eyes HUGE
  const isDrugsQuestion = questionText.toLowerCase().includes('drogen genommen');
  const eyeSize = isDrugsQuestion ? getRandomValue(questionText + 'eyeSize', 8, 12) : getRandomValue(questionText + 'eyeSize', 2.5, 4);
  const eyeYPos = getRandomValue(questionText + 'eyeY', 38, 43);
  
  // Different happy mouth expressions - more variety
  const expressionType = Math.floor(getRandomValue(questionText + 'expression', 0, 6));
  
  // Randomize mouth parameters for each expression - less curved
  const mouthWidth = getRandomValue(questionText + 'mouthWidth' + expressionType, 22, 40);
  const mouthHeight = getRandomValue(questionText + 'mouthHeight' + expressionType, 6, 14);
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
        {/* Left eye - winking */}
        {isWinking ? (
          <line 
            x1={50 - eyeDistance - eyeSize} 
            y1={eyeYPos}
            x2={50 - eyeDistance + eyeSize}
            y2={eyeYPos}
            stroke="#21245B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ) : (
          <circle 
            cx={50 - eyeDistance} 
            cy={eyeYPos}
            r={eyeSize}
            fill="#21245B"
          />
        )}
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
  
  // Random movement animation - more visible
  const moveDuration = getRandomValue(questionText + 'xMoveDur', 12, 20);
  const moveX1 = getRandomValue(questionText + 'xMoveX1', -10, 10);
  const moveY1 = getRandomValue(questionText + 'xMoveY1', -10, 10);
  const moveX2 = getRandomValue(questionText + 'xMoveX2', -10, 10);
  const moveY2 = getRandomValue(questionText + 'xMoveY2', -10, 10);
  const moveX3 = getRandomValue(questionText + 'xMoveX3', -10, 10);
  const moveY3 = getRandomValue(questionText + 'xMoveY3', -10, 10);
  
  // More visible scale and rotation variations
  const scaleVar1 = scale * getRandomValue(questionText + 'xScaleV1', 0.88, 1.12);
  const scaleVar2 = scale * getRandomValue(questionText + 'xScaleV2', 0.85, 1.15);
  const scaleVar3 = scale * getRandomValue(questionText + 'xScaleV3', 0.90, 1.10);
  
  const rotVar1 = rotation + getRandomValue(questionText + 'xRotV1', -15, 15);
  const rotVar2 = rotation + getRandomValue(questionText + 'xRotV2', -20, 20);
  const rotVar3 = rotation + getRandomValue(questionText + 'xRotV3', -12, 12);
  
  return (
    <div 
      className="absolute z-0"
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        animation: `xShapeFloat-${questionText} ${moveDuration}s ease-in-out infinite`
      }}
    >
      <style>
        {`
          @keyframes xShapeFloat-${questionText} {
            0%, 100% { 
              transform: translate(-50%, -50%) rotate(${rotation}deg) scale(${scale}) translate(0%, 0%);
            }
            25% { 
              transform: translate(-50%, -50%) rotate(${rotVar1}deg) scale(${scaleVar1}) translate(${moveX1}%, ${moveY1}%);
            }
            50% { 
              transform: translate(-50%, -50%) rotate(${rotVar2}deg) scale(${scaleVar2}) translate(${moveX2}%, ${moveY2}%);
            }
            75% { 
              transform: translate(-50%, -50%) rotate(${rotVar3}deg) scale(${scaleVar3}) translate(${moveX3}%, ${moveY3}%);
            }
          }
        `}
      </style>
      <svg width="400" height="400" viewBox="0 0 300 300">
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

// Wavy Line component with random organic paths
interface WavyLineProps {
  questionText: string;
  lineIndex: number;
}

function WavyLine({ questionText, lineIndex }: WavyLineProps) {
  const [breathePhase, setBreathePhase] = useState(0);
  
  const getRandomValue = (seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return min + normalized * (max - min);
  };
  
  // Breathing animation for amplitude
  useEffect(() => {
    let phase = 0;
    const breatheInterval = setInterval(() => {
      phase += 0.02;
      setBreathePhase(phase);
    }, 50);
    
    return () => clearInterval(breatheInterval);
  }, []);
  
  // Position circles at edges so they're cut off and don't overlap
  const circleConfigs = [
    { 
      radiusMin: 20, 
      radiusMax: 32, 
      xMin: 75,   // Top right - moved more into card
      xMax: 88, 
      yMin: -15,  // Top area
      yMax: -5 
    },
    { 
      radiusMin: 31.5, 
      radiusMax: 49.3, 
      xMin: -5,   // Left - moved more into card
      xMax: 5, 
      yMin: 35,   // Middle
      yMax: 50 
    },
    { 
      radiusMin: 26, 
      radiusMax: 32, 
      xMin: 92,   // Bottom right - more outside
      xMax: 105, 
      yMin: 73,   // Bottom - moved more up
      yMax: 85 
    }
  ];
  
  const config = circleConfigs[lineIndex % 3];
  const radius = getRandomValue(questionText + 'radius' + lineIndex, config.radiusMin, config.radiusMax);
  const cx = getRandomValue(questionText + 'cx' + lineIndex, config.xMin, config.xMax);
  const cy = getRandomValue(questionText + 'cy' + lineIndex, config.yMin, config.yMax);
  
  // Create wavy sine wave path around the circle with breathing amplitude
  const numPoints = 100;
  const waveFrequency = 6;
  const baseAmplitude = lineIndex === 0 
    ? getRandomValue(questionText + 'waveAmp' + lineIndex, 3.0, 5.0)
    : getRandomValue(questionText + 'waveAmp' + lineIndex, 6.0, 9.0);
  
  // Breathing effect: oscillate amplitude between 70% and 130%
  const breatheMultiplier = 0.7 + 0.3 * (1 + Math.sin(breathePhase));
  const waveAmplitude = baseAmplitude * breatheMultiplier;
  
  let pathData = '';
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const waveOffset = Math.sin(angle * waveFrequency) * waveAmplitude;
    const r = radius + waveOffset;
    
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    
    if (i === 0) {
      pathData = `M ${x},${y}`;
    } else {
      pathData += ` L ${x},${y}`;
    }
  }
  
  pathData += ' Z';
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <svg 
        className="absolute w-full h-full" 
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path 
          d={pathData}
          fill="none"
          stroke="#F6B5D3"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'all 0.05s linear' }}
        />
      </svg>
    </div>
  );
}