
import { useState, useEffect, useMemo } from 'react';
import { QuizCard } from './QuizCard';
import { CategorySelector } from './CategorySelector';

interface Question {
  question: string;
  category: string;
}

export function QuizApp() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadStartTime] = useState(Date.now());
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [logoStretch, setLogoStretch] = useState(false);
  const [logoSqueezeLeft, setLogoSqueezeLeft] = useState(false);
  const [logoSqueezeRight, setLogoSqueezeRight] = useState(false);
  const [bgColor, setBgColor] = useState('bg-background');
  const [prevBgColor, setPrevBgColor] = useState('bg-background');
  const [headerTextColor, setHeaderTextColor] = useState('text-white');
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragDirection, setDragDirection] = useState<'horizontal' | 'vertical' | null>(null);

  // Group questions by category
  const questionsByCategory = useMemo(() => {
    const grouped: { [key: string]: Question[] } = {};
    questions.forEach(q => {
      if (!grouped[q.category]) grouped[q.category] = [];
      grouped[q.category].push(q);
    });
    return grouped;
  }, [questions]);

  const categories = useMemo(() => Object.keys(questionsByCategory), [questionsByCategory]);

  useEffect(() => {
    // Start logo animation and data loading together
    setLogoStretch(true);
    fetchQuestions();

    // Reset logo animation after it completes
    const logoTimer = setTimeout(() => {
      setLogoStretch(false);
    }, 2500);

    return () => clearTimeout(logoTimer);
  }, []);

  const fetchQuestions = async () => {
    try {
      // Google Sheets CSV export URL
      const sheetId = '1-5NpzNwUiAsl_BPruHygyUbpO3LHkWr8E08fqkypOcU';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }
      
      const csvText = await response.text();
      
      // Parse CSV data
      const lines = csvText.split('\n');
      const parsedQuestions: Question[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        
        // Simple CSV parsing - handles quotes and commas
        const columns = parseCSVLine(line);
        
        if (columns.length >= 2 && columns[0] && columns[1]) {
          parsedQuestions.push({
            question: columns[0].trim(),
            category: columns[1].trim()
          });
        }
      }
      
      if (parsedQuestions.length > 0) {
        // Shuffle questions randomly
        const shuffledQuestions = [...parsedQuestions].sort(() => Math.random() - 0.5);
        setAllQuestions(shuffledQuestions);
        setQuestions(shuffledQuestions);
        
        // Extract unique categories
        const categories = Array.from(new Set(parsedQuestions.map(q => q.category)));
        setAvailableCategories(categories);
        setSelectedCategories(categories); // Start with all categories selected
      }
    } catch (error) {
      console.error('Error fetching questions from Google Sheets:', error);
    } finally {
      // Ensure animation plays for minimum 2.5s from start
      const elapsed = Date.now() - loadStartTime;
      const remainingTime = Math.max(0, 2500 - elapsed);
      
      setTimeout(() => {
        setLoading(false);
        setLogoStretch(false);
      }, remainingTime);
    }
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Handle escaped quotes
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const handleDragStart = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsAnimating(false);
    setDragStartX(e.clientX);
    setDragStartY(e.clientY);
    setDragOffsetX(0);
    setDragOffsetY(0);
    setDragDirection(null);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    // Deadzone before determining intent (30px)
    const deadzone = 30;
    const totalDrag = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (!dragDirection && totalDrag > deadzone) {
      // Determine primary direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDragDirection('horizontal');
      } else {
        setDragDirection('vertical');
      }
    }
    
    if (dragDirection === 'horizontal') {
      e.preventDefault();
      const maxOffset = window.innerWidth;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
      setDragOffsetX(clampedOffset);
    } else if (dragDirection === 'vertical') {
      e.preventDefault();
      const maxOffset = window.innerHeight;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaY));
      setDragOffsetY(clampedOffset);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 80;
    
    setIsDragging(false);
    setIsAnimating(true);
    
    if (dragDirection === 'horizontal') {
      // Change category with wrapping
      if (dragOffsetX < -threshold) {
        console.log('Swipe left - current index:', currentCategoryIndex, 'total categories:', categories.length);
        setLogoSqueezeLeft(true);
        setCurrentCategoryIndex(prev => {
          const next = (prev + 1) % categories.length;
          console.log('Moving from category', prev, 'to', next);
          return next;
        });
        setCurrentQuestionIndex(0);
        setTimeout(() => setLogoSqueezeLeft(false), 300);
      } else if (dragOffsetX > threshold) {
        console.log('Swipe right - current index:', currentCategoryIndex, 'total categories:', categories.length);
        setLogoSqueezeRight(true);
        setCurrentCategoryIndex(prev => {
          const next = (prev - 1 + categories.length) % categories.length;
          console.log('Moving from category', prev, 'to', next);
          return next;
        });
        setCurrentQuestionIndex(0);
        setTimeout(() => setLogoSqueezeRight(false), 300);
      }
      setDragOffsetX(0);
    } else if (dragDirection === 'vertical') {
      // Change question within category with wrapping
      const currentCategoryQuestions = questionsByCategory[categories[currentCategoryIndex]] || [];
      if (dragOffsetY < -threshold) {
        setCurrentQuestionIndex(prev => (prev + 1) % currentCategoryQuestions.length);
      } else if (dragOffsetY > threshold) {
        setCurrentQuestionIndex(prev => (prev - 1 + currentCategoryQuestions.length) % currentCategoryQuestions.length);
      }
      setDragOffsetY(0);
    } else {
      // Snap back
      setDragOffsetX(0);
      setDragOffsetY(0);
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setDragDirection(null);
    }, 350);
  };

  const nextCategory = () => {
    setLogoSqueezeLeft(true);
    setCurrentCategoryIndex(prev => (prev + 1) % categories.length);
    setCurrentQuestionIndex(0);
    setTimeout(() => setLogoSqueezeLeft(false), 350);
  };

  const prevCategory = () => {
    setLogoSqueezeRight(true);
    setCurrentCategoryIndex(prev => (prev - 1 + categories.length) % categories.length);
    setCurrentQuestionIndex(0);
    setTimeout(() => setLogoSqueezeRight(false), 350);
  };

  const nextQuestion = () => {
    const currentCategoryQuestions = questionsByCategory[categories[currentCategoryIndex]] || [];
    setCurrentQuestionIndex(prev => (prev + 1) % currentCategoryQuestions.length);
  };

  const prevQuestion = () => {
    const currentCategoryQuestions = questionsByCategory[categories[currentCategoryIndex]] || [];
    setCurrentQuestionIndex(prev => (prev - 1 + currentCategoryQuestions.length) % currentCategoryQuestions.length);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevCategory();
    } else if (e.key === 'ArrowRight') {
      nextCategory();
    } else if (e.key === 'ArrowUp') {
      prevQuestion();
    } else if (e.key === 'ArrowDown') {
      nextQuestion();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCategoryIndex, currentQuestionIndex, categories]);

  // Reset indices when questions change
  useEffect(() => {
    if (categories.length > 0) {
      setCurrentCategoryIndex(0);
      setCurrentQuestionIndex(0);
    }
  }, [selectedCategories, allQuestions]);

  const triggerLogoStretch = () => {
    setLogoStretch(true);
    setTimeout(() => setLogoStretch(false), 2500);
  };

  const handleLogoClick = () => {
    triggerLogoStretch();
  };

  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const handleModalClose = () => {
    setCategorySelectorOpen(false);
  };

  // Get header color for each category
  const getHeaderColorForCategory = (category: string): string => {
    const categoryLower = category.toLowerCase().replace(/-/g, ' ');
    switch (categoryLower) {
      case 'connection':
        return 'text-connection-900';  // #611610
      case 'fuck':
        return 'text-[#DBCFBE]';  // #DBCFBE
      case 'identity':
        return 'text-[#003C31]';  // #003C31
      case 'party':
        return 'text-[#D3D9EF]';  // #D3D9EF
      case 'wer aus der runde':
        return 'text-[#053053]';  // #053053
      default:
        return 'text-white';
    }
  };

  const handleBgColorChange = (newBgClass: string) => {
    setPrevBgColor(bgColor);
    setBgColor(newBgClass);
    
    // Extract category from background class
    const colorMatch = newBgClass.match(/bg-quiz-(\w+(-\w+)*)-bg-dark/);
    if (colorMatch) {
      const category = colorMatch[1];
      setHeaderTextColor(getHeaderColorForCategory(category));
    }
  };

  // Get HSL color value from background class
  const getColorFromBgClass = (bgClass: string): string => {
    const match = bgClass.match(/bg-(.+)/);
    if (!match) return 'hsl(0 0% 0%)';
    const varName = match[1];
    return `hsl(var(--${varName}))`;
  };

  return (
    <div 
      className="h-[100svh] overflow-hidden flex flex-col relative"
      style={{
        background: getColorFromBgClass(prevBgColor),
        transition: 'background 350ms ease-out'
      }}
    >
      {/* Overlay that fades in with new color */}
      <div 
        key={bgColor}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: getColorFromBgClass(bgColor),
          opacity: bgColor === prevBgColor ? 0 : 1,
          transition: 'opacity 350ms ease-out'
        }}
      />
      {/* App Header - Always visible */}
      <div className="app-header flex-shrink-0 relative z-10" style={{position: 'sticky', top: 0, zIndex: 50}}>
        <div className="flex justify-between items-center px-4 py-4">
          <svg 
            width="67" 
            height="32" 
            viewBox="0 0 67 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`h-8 w-auto logo-clickable align-baseline ${logoStretch ? 'logo-stretch' : ''} ${logoSqueezeLeft ? 'logo-squeeze-left' : ''} ${logoSqueezeRight ? 'logo-squeeze-right' : ''} transition-all duration-500`}
            onClick={handleLogoClick}
          >
            <path d="M24.1808 3.79373C17.2269 3.79372 15.558 5.76916 13.3328 14.7997C11.1076 23.8302 9.80953 27.9692 9.43866 28.9099" className={headerTextColor} stroke="currentColor" strokeWidth="5.84043" strokeLinecap="round"/>
            <path d="M38.6502 3.79373C31.6964 3.79372 30.0274 5.76916 27.8022 14.7997C25.577 23.8302 24.279 27.9692 23.9081 28.9099" className={headerTextColor} stroke="currentColor" strokeWidth="5.84043" strokeLinecap="round"/>
            <path d="M53.1193 3.79373C46.1655 3.79372 44.4966 5.76916 42.2713 14.7997C40.0461 23.8302 38.7481 27.9692 38.3772 28.9099" className={headerTextColor} stroke="currentColor" strokeWidth="5.84043" strokeLinecap="round"/>
            <path d="M3 20.0332C4.22067 19.6156 5.12769 19.3985 6.5249 19.1832C16.8259 17.5961 27.318 16.7384 37.7276 16.3157C45.2899 16.0086 52.8539 16.7693 60.4071 16.361C61.8418 16.2835 62.5665 15.8384 64 16.157" className={headerTextColor} stroke="currentColor" strokeWidth="5.84043" strokeLinecap="round"/>
          </svg>
          <button 
            onClick={() => setCategorySelectorOpen(true)}
            className={`${headerTextColor} font-normal text-xs align-baseline transition-colors duration-500`}
            style={{fontSize: '14px'}}
          >
            Kategorien wählen
          </button>
        </div>
      </div>

      {/* Main Quiz Container */}
      <div 
        className="flex-1 flex justify-center items-center overflow-hidden relative z-10" 
        style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            {/* Loading text removed - handled by static HTML */}
          </div>
        ) : categories.length > 0 ? (
          <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
            {/* Render 5 category columns: 2 previous, current, 2 next */}
            {[-2, -1, 0, 1, 2].map((catPosition) => {
              const catIndex = (currentCategoryIndex + catPosition + categories.length) % categories.length;
              const category = categories[catIndex];
              const categoryQuestions = questionsByCategory[category] || [];
              const isCategoryActive = catPosition === 0;
              
              // Calculate horizontal transform - equal spacing between all cards (32px)
              const hCardSpacingPx = 32; // 32px spacing
              const maxCardWidthPx = 600; // Max width for desktop
              const vwCardWidth = window.innerWidth * 0.8; // 80vw
              const hCardWidth = Math.min(vwCardWidth, maxCardWidthPx); // Card width (80vw or 600px max)
              const totalCardWidth = hCardWidth + hCardSpacingPx; // Total width including spacing
              const cardSpacingVw = (totalCardWidth / window.innerWidth) * 100; // Convert to vw
              const baseTranslateX = catPosition * cardSpacingVw;
              const dragTranslateX = isDragging && dragDirection === 'horizontal' ? (dragOffsetX / window.innerWidth) * 100 : 0;
              
              // Horizontal scale - all cards at scale 1
              const scaleH = 1;
              
              // Horizontal rotation - rotate towards outside during transition
              let rotateZ = 0;
              if ((isDragging && dragDirection === 'horizontal') || (isAnimating && dragDirection === 'horizontal')) {
                if (isCategoryActive) {
                  // Active card rotates in direction of swipe
                  const dragProgress = isDragging ? dragOffsetX / window.innerWidth : 0;
                  rotateZ = dragProgress * 3; // Max ±3deg based on drag
                } else if (catPosition === -1) {
                  // Prev card rotates counter-clockwise
                  rotateZ = -3;
                } else if (catPosition === 1) {
                  // Next card rotates clockwise
                  rotateZ = 3;
                }
              }
              
              // Hide cards at extreme positions during animation to prevent visible wraparound
              const shouldHide = Math.abs(catPosition) === 2 && (isDragging || isAnimating) && dragDirection === 'horizontal';
              
              return (
                <div 
                  key={`cat-${catIndex}`}
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    transform: `translateX(${baseTranslateX + dragTranslateX}vw) scale(${scaleH}) rotateZ(${rotateZ}deg)`,
                    transition: isAnimating && dragDirection === 'horizontal' ? (isCategoryActive ? 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1) 100ms' : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)') : 'none',
                    animation: isAnimating && dragDirection === 'horizontal' ? 'scaleTransition 350ms ease-in-out' : 'none',
                    pointerEvents: isCategoryActive ? 'auto' : 'none',
                    willChange: isAnimating && dragDirection === 'horizontal' ? 'transform' : 'auto',
                    opacity: shouldHide ? 0 : 1,
                    visibility: shouldHide ? 'hidden' : 'visible'
                  }}
                >
                  {/* Render 5 question cards vertically: 2 previous, current, 2 next */}
                  {[-2, -1, 0, 1, 2].map((qPosition) => {
                    const qIndex = (currentQuestionIndex + qPosition + categoryQuestions.length) % categoryQuestions.length;
                    const question = categoryQuestions[qIndex];
                    const isActive = isCategoryActive && qPosition === 0;
                    
                    // Calculate vertical transform - fixed spacing between cards (32px)
                    const vCardSpacingPx = 32; // 32px gap between cards
                    const cardHeight = window.innerHeight * 0.8; // Card height (80vh)
                    const totalCardHeight = cardHeight + vCardSpacingPx; // Total height including spacing
                    const cardSpacingVh = (totalCardHeight / window.innerHeight) * 100; // Convert to vh
                    
                    // Calculate position - show next card with 32px margin
                    let baseTranslateY;
                    
                    if (qPosition === -1) {
                      // Move previous card completely out of viewport to the top
                      baseTranslateY = -110; // Moves card fully above viewport
                    } else if (qPosition === 1) {
                      // Next card positioned with exactly 32px gap after active card
                      // Active card height (80vh) + 32px gap
                      const gapVh = (32 / window.innerHeight) * 100;
                      baseTranslateY = 80 + gapVh;
                    } else {
                      baseTranslateY = qPosition * cardSpacingVh;
                    }
                    
                    // Only apply vertical drag to the active category
                    const dragTranslateY = (isCategoryActive && isDragging && dragDirection === 'vertical') ? (dragOffsetY / window.innerHeight) * cardSpacingVh : 0;

                    // Vertical scale - all cards at scale 1
                    const scale = 1;
                    
                    return (
                      <div
                        key={`cat-${catIndex}-q-${qIndex}`}
                        className="absolute flex items-center justify-center"
                        style={{
                          position: 'absolute',
                          top: '64px',
                          left: '16px',
                          width: window.innerWidth >= 768 ? `${Math.min(window.innerWidth * 0.8, 600)}px` : 'calc(80vw + 16px)',
                          height: '80vh',
                          transform: `translateY(${baseTranslateY + dragTranslateY}vh) scale(${scale})`,
                          transition: isAnimating && dragDirection === 'vertical' && isCategoryActive ? (isActive ? 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1) 100ms' : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)') : 'none',
                          animation: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'scaleTransition 350ms ease-in-out' : 'none',
                          pointerEvents: isActive ? 'auto' : 'none',
                          willChange: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'transform' : 'auto',
                          zIndex: qPosition <= 0 ? 10 - qPosition : 10 - qPosition // Previous and current cards on top, next cards below
                        }}
                      >
                        <QuizCard
                          question={question}
                          onSwipeLeft={nextCategory}
                          onSwipeRight={prevCategory}
                          animationClass=""
                          onBgColorChange={isActive ? handleBgColorChange : undefined}
                          disableSwipe={true}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-white text-sm">Keine Fragen verfügbar</div>
          </div>
        )}
      </div>
      
      <CategorySelector
        open={categorySelectorOpen}
        onOpenChange={handleModalClose}
        categories={availableCategories}
        selectedCategories={selectedCategories}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
}
