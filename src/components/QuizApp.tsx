
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

  const handleBgColorChange = (newBgClass: string) => {
    setPrevBgColor(bgColor);
    setBgColor(newBgClass);
    
    // Extract color class for header text
    const colorMatch = newBgClass.match(/bg-quiz-(\w+(-\w+)*)-bg-dark/);
    if (colorMatch) {
      const category = colorMatch[1];
      setHeaderTextColor(`text-${category}-900`);
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
        transition: 'background 700ms ease-out'
      }}
    >
      {/* Overlay that fades in with new color */}
      <div 
        className="absolute inset-0"
        style={{
          background: getColorFromBgClass(bgColor),
          opacity: bgColor === prevBgColor ? 0 : 1,
          transition: 'opacity 700ms ease-out'
        }}
      />
      {/* App Header - Always visible */}
      <div className="app-header flex-shrink-0 relative z-10" style={{position: 'sticky', top: 0, zIndex: 50}}>
        <div className="flex justify-between items-baseline px-4 py-4">
          <img 
            src="/assets/logo.png" 
            alt="Logo" 
            className={`h-8 w-auto logo-clickable align-baseline ${logoStretch ? 'logo-stretch' : ''} ${logoSqueezeLeft ? 'logo-squeeze-left' : ''} ${logoSqueezeRight ? 'logo-squeeze-right' : ''} transition-all duration-500`}
            onClick={handleLogoClick}
            style={{
              filter: headerTextColor.includes('900') ? 'brightness(0) saturate(100%)' : 'none'
            }}
          />
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
          <div className="relative w-full h-full flex justify-center items-center">
            {/* Render 5 category columns: 2 previous, current, 2 next */}
            {[-2, -1, 0, 1, 2].map((catPosition) => {
              const catIndex = (currentCategoryIndex + catPosition + categories.length) % categories.length;
              const category = categories[catIndex];
              const categoryQuestions = questionsByCategory[category] || [];
              const isCategoryActive = catPosition === 0;
              
              
              // Calculate horizontal transform - next card adjacent to active card with 16px gap
              const cardSpacing = 80; // 80vw spacing (cards are 80vw wide, so they're adjacent)
              const gapOffsetH = catPosition * 16; // 16px gap between cards
              const baseTranslateX = catPosition * cardSpacing;
              const dragTranslateX = isDragging && dragDirection === 'horizontal' ? (dragOffsetX / window.innerWidth) * cardSpacing : 0;
              const dragGapOffsetH = isDragging && dragDirection === 'horizontal' ? (dragOffsetX / window.innerWidth) * 16 : 0;
              
              // Horizontal scale - only during animation/drag
              let scaleH = 1;
              if ((isDragging && dragDirection === 'horizontal') || (isAnimating && dragDirection === 'horizontal')) {
                if (isCategoryActive) {
                  scaleH = 0.98; // Active card scales down during transition
                } else if (catPosition === 1 || catPosition === 2) {
                  scaleH = 0.98; // Next and 2nd next cards also scale
                }
              }
              
              // Horizontal rotation - 2D Y-axis rotation (max ±5deg)
              let rotateY = 0;
              if (!isCategoryActive) {
                rotateY = catPosition * 5; // Left: -5deg, Right: +5deg
              } else if (isDragging && dragDirection === 'horizontal') {
                // Active card rotates in opposite direction as it moves out (max ±5deg)
                rotateY = Math.max(-5, Math.min(5, (dragOffsetX / window.innerWidth) * 5));
              }
              
              return (
                <div 
                  key={`cat-${catIndex}`}
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    transform: `translateX(calc(${baseTranslateX + dragTranslateX}vw + ${gapOffsetH + dragGapOffsetH}px)) scale(${scaleH}) rotateY(${rotateY}deg)`,
                    transition: isAnimating && dragDirection === 'horizontal' ? 'transform 350ms ease-in-out' : 'none',
                    animation: isAnimating && dragDirection === 'horizontal' ? 'scaleTransition 350ms ease-in-out' : 'none',
                    pointerEvents: isCategoryActive ? 'auto' : 'none',
                    willChange: isAnimating && dragDirection === 'horizontal' ? 'transform' : 'auto'
                  }}
                >
                  {/* Render 5 question cards vertically: 2 previous, current, 2 next */}
                  {[-2, -1, 0, 1, 2].map((qPosition) => {
                    const qIndex = (currentQuestionIndex + qPosition + categoryQuestions.length) % categoryQuestions.length;
                    const question = categoryQuestions[qIndex];
                    const isActive = isCategoryActive && qPosition === 0;
                    
                    // Calculate vertical transform - 10% of next card visible + 8px gap
                    const cardHeight = 80; // 80vh card
                    const gapOffsetV = qPosition * 8; // 8px gap between cards
                    // Move previous slide further up to be completely out of viewport
                    const baseTranslateY = qPosition === -1 ? -120 : qPosition * cardHeight;
                    const dragTranslateY = isDragging && dragDirection === 'vertical' && isCategoryActive ? (dragOffsetY / window.innerHeight) * cardHeight : 0;
                    const dragGapOffsetV = isDragging && dragDirection === 'vertical' && isCategoryActive ? (dragOffsetY / window.innerHeight) * 8 : 0;
                    
                    // Vertical scale - only during animation/drag
                    let scale = 1;
                    if ((isDragging && dragDirection === 'vertical' && isCategoryActive) || (isAnimating && dragDirection === 'vertical' && isCategoryActive)) {
                      if (isActive) {
                        scale = 0.98; // Active card scales down during transition
                      } else if (qPosition === 1 || qPosition === 2) {
                        scale = 0.98; // Next and 2nd next cards also scale
                      }
                    }
                    
                    return (
                      <div
                        key={`cat-${catIndex}-q-${qIndex}`}
                        className="absolute flex items-center justify-center"
                        style={{
                          position: 'absolute',
                          top: '10vh',
                          left: '16px',
                          width: '80vw',
                          height: '80vh',
                          transform: `translateY(calc(${baseTranslateY + dragTranslateY}vh + ${gapOffsetV + dragGapOffsetV}px)) scale(${scale})`,
                          transition: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'transform 350ms ease-in-out' : 'none',
                          animation: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'scaleTransition 350ms ease-in-out' : 'none',
                          pointerEvents: isActive ? 'auto' : 'none',
                          willChange: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'transform' : 'auto'
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
        
      {/* Bottom Link - Always visible */}
      <div className="app-footer flex-shrink-0 h-5 relative z-10">
        <div className="flex justify-center items-center px-4 h-full">
          <a 
            href="mailto:hello@relationshipbydesign.de?subject=Friends%20App%20Frage" 
            className={`${headerTextColor} font-normal text-xs transition-colors duration-500`}
            style={{fontSize: '14px', lineHeight: '20px'}}
          >
            Frage einreichen
          </a>
        </div>
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
