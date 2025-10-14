
import { useState, useEffect, useMemo } from 'react';
import { QuizCard } from './QuizCard';
import { CategorySelector } from './CategorySelector';

interface Question {
  question: string;
  category: string;
}

export function QuizApp() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [questionIndicesByCategory, setQuestionIndicesByCategory] = useState<{[category: string]: number}>({});
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
  const [isShuffleMode, setIsShuffleMode] = useState(true);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragDirection, setDragDirection] = useState<'horizontal' | 'vertical' | null>(null);
  const [isHorizontalSliding, setIsHorizontalSliding] = useState(false);

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
  
  // Filter categories based on selection
  const displayCategories = useMemo(() => {
    if (selectedCategories.length < availableCategories.length) {
      return categories.filter(cat => selectedCategories.includes(cat));
    }
    return categories;
  }, [categories, selectedCategories, availableCategories]);

  // Create shuffled questions from selected categories with optimal category mixing
  useEffect(() => {
    if (isShuffleMode && questions.length > 0) {
      const filtered = questions.filter(q => selectedCategories.includes(q.category));
      
      // Group by category
      const byCategory: { [key: string]: Question[] } = {};
      filtered.forEach(q => {
        if (!byCategory[q.category]) byCategory[q.category] = [];
        byCategory[q.category].push(q);
      });
      
      // Shuffle each category's questions
      Object.keys(byCategory).forEach(cat => {
        byCategory[cat] = [...byCategory[cat]].sort(() => Math.random() - 0.5);
      });
      
      // Mix categories optimally to avoid consecutive same categories
      const shuffled: Question[] = [];
      const categoryKeys = Object.keys(byCategory);
      let lastCategory = '';
      
      while (Object.values(byCategory).some(arr => arr.length > 0)) {
        // Get available categories (excluding the last used one if possible)
        let availableCategories = categoryKeys.filter(cat => 
          byCategory[cat].length > 0 && cat !== lastCategory
        );
        
        // If no other categories available, use any remaining category
        if (availableCategories.length === 0) {
          availableCategories = categoryKeys.filter(cat => byCategory[cat].length > 0);
        }
        
        if (availableCategories.length === 0) break;
        
        // Pick a random category from available ones
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const question = byCategory[randomCategory].shift();
        
        if (question) {
          shuffled.push(question);
          lastCategory = randomCategory;
        }
      }
      
      setShuffledQuestions(shuffled);
      setCurrentShuffleIndex(0);
    }
  }, [isShuffleMode, questions, selectedCategories]);

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
    setHasInteracted(true);
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
      if (isShuffleMode) {
        // In shuffle mode, navigate through shuffled questions
        if (dragOffsetX < -threshold) {
          setLogoSqueezeLeft(true);
          setCurrentShuffleIndex(prev => (prev + 1) % shuffledQuestions.length);
          setTimeout(() => setLogoSqueezeLeft(false), 300);
        } else if (dragOffsetX > threshold) {
          setLogoSqueezeRight(true);
          setCurrentShuffleIndex(prev => (prev - 1 + shuffledQuestions.length) % shuffledQuestions.length);
          setTimeout(() => setLogoSqueezeRight(false), 300);
        }
      } else {
        // Normal category mode
        if (dragOffsetX < -threshold) {
          console.log('Swipe left - current index:', currentCategoryIndex, 'total categories:', displayCategories.length);
          setLogoSqueezeLeft(true);
          setIsHorizontalSliding(true);
          setCurrentCategoryIndex(prev => {
            const next = (prev + 1) % displayCategories.length;
            console.log('Moving from category', prev, 'to', next);
            return next;
          });
          setTimeout(() => setLogoSqueezeLeft(false), 300);
          setTimeout(() => setIsHorizontalSliding(false), 350);
        } else if (dragOffsetX > threshold) {
          console.log('Swipe right - current index:', currentCategoryIndex, 'total categories:', displayCategories.length);
          setLogoSqueezeRight(true);
          setIsHorizontalSliding(true);
          setCurrentCategoryIndex(prev => {
            const next = (prev - 1 + displayCategories.length) % displayCategories.length;
            console.log('Moving from category', prev, 'to', next);
            return next;
          });
          setTimeout(() => setLogoSqueezeRight(false), 300);
          setTimeout(() => setIsHorizontalSliding(false), 350);
        }
      }
      setDragOffsetX(0);
    } else if (dragDirection === 'vertical' && !isShuffleMode) {
      // Vertical swipe only in normal mode
      const currentCategory = displayCategories[currentCategoryIndex];
      const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
      if (dragOffsetY < -threshold) {
        setQuestionIndicesByCategory(prev => ({
          ...prev,
          [currentCategory]: ((prev[currentCategory] || 0) + 1) % currentCategoryQuestions.length
        }));
      } else if (dragOffsetY > threshold) {
        setQuestionIndicesByCategory(prev => ({
          ...prev,
          [currentCategory]: ((prev[currentCategory] || 0) - 1 + currentCategoryQuestions.length) % currentCategoryQuestions.length
        }));
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
    setCurrentCategoryIndex(prev => (prev + 1) % displayCategories.length);
    setTimeout(() => setLogoSqueezeLeft(false), 350);
  };

  const prevCategory = () => {
    setLogoSqueezeRight(true);
    setCurrentCategoryIndex(prev => (prev - 1 + displayCategories.length) % displayCategories.length);
    setTimeout(() => setLogoSqueezeRight(false), 350);
  };

  const nextQuestion = () => {
    const currentCategory = displayCategories[currentCategoryIndex];
    const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
    setQuestionIndicesByCategory(prev => ({
      ...prev,
      [currentCategory]: ((prev[currentCategory] || 0) + 1) % currentCategoryQuestions.length
    }));
  };

  const prevQuestion = () => {
    const currentCategory = displayCategories[currentCategoryIndex];
    const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
    setQuestionIndicesByCategory(prev => ({
      ...prev,
      [currentCategory]: ((prev[currentCategory] || 0) - 1 + currentCategoryQuestions.length) % currentCategoryQuestions.length
    }));
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
  }, [currentCategoryIndex, questionIndicesByCategory, displayCategories]);

  // Reset indices when questions change
  useEffect(() => {
    if (displayCategories.length > 0) {
      setCurrentCategoryIndex(0);
      // Initialize question indices for all categories to 0
      const initialIndices: {[category: string]: number} = {};
      displayCategories.forEach(cat => {
        initialIndices[cat] = 0;
      });
      setQuestionIndicesByCategory(initialIndices);
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
    // Adjust current category index to stay within bounds
    setCurrentCategoryIndex(prev => {
      const newDisplayCategories = Object.keys(questionsByCategory).filter(cat => 
        categories.length < availableCategories.length ? categories.includes(cat) : true
      );
      if (newDisplayCategories.length === 0) return 0;
      // If current index is out of bounds, reset to 0
      return prev >= newDisplayCategories.length ? 0 : prev;
    });
  };

  const handleToggleMode = () => {
    if (isShuffleMode) {
      // Switching from shuffle to category mode - reset filter to all categories
      setIsShuffleMode(false);
      setSelectedCategories(availableCategories);
    } else {
      // Switching to shuffle mode - just toggle
      setIsShuffleMode(true);
    }
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
        transition: loading ? 'none' : 'background 600ms ease-out'
      }}
    >
      {/* Overlay that fades in with new color */}
      <div 
        key={bgColor}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: getColorFromBgClass(bgColor),
          opacity: loading ? 0 : (bgColor === prevBgColor ? 0 : 1),
          transition: loading ? 'none' : 'opacity 600ms ease-out'
        }}
      />
      {/* App Header - Hidden during loading */}
      {!loading && (
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
            onClick={handleToggleMode}
            className={`${headerTextColor} font-normal text-xs align-baseline transition-colors duration-500 cursor-pointer opacity-100`}
            style={{fontSize: '14px'}}
          >
            {isShuffleMode ? 'Kategorien sortieren' : 'Kategorien mischen'}
          </button>
        </div>
      </div>
      )}

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
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 64 64" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin-ease"
            >
              <circle cx="32" cy="32" r="30" fill="#F8BAD3" />
              <circle cx="22" cy="26" r="3" fill="#000000" />
              <circle cx="42" cy="26" r="3" fill="#000000" />
              <path 
                d="M 22 40 Q 32 48 42 40" 
                stroke="#000000" 
                strokeWidth="2" 
                strokeLinecap="round" 
                fill="none"
              />
            </svg>
          </div>
        ) : isShuffleMode ? (
          // Shuffle mode: show all questions horizontally with full height cards
          <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
            {[-2, -1, 0, 1, 2].map((position) => {
              const qIndex = (currentShuffleIndex + position + shuffledQuestions.length) % shuffledQuestions.length;
              const question = shuffledQuestions[qIndex];
              if (!question) return null;
              
              const isActive = position === 0;
              const isMobile = window.innerWidth < 768;
              
              // Calculate horizontal transform with proper spacing
              const baseCardSpacingPx = isMobile ? 16 : 32;
              const cardWidthVw = window.innerWidth * 0.85; // 85vw in pixels
              const maxCardWidthPx = 600;
              const actualCardWidth = isMobile ? cardWidthVw : Math.min(cardWidthVw, maxCardWidthPx);
              
              // For desktop, position -1 (prev card) at activeCardWidth + 16px + 24px + 16px
              let translateXPx;
              if (!isMobile && position === -1) {
                translateXPx = -(actualCardWidth + 56); // 16px + 24px + 16px = 56px
              } else {
                const totalCardWidth = actualCardWidth + baseCardSpacingPx;
                translateXPx = position * totalCardWidth;
              }
              
              const dragTranslateXPx = isDragging && dragDirection === 'horizontal' ? dragOffsetX : 0;
              
              // Rotation - rotate towards outside during transition
              let rotateZ = 0;
              if ((isDragging && dragDirection === 'horizontal') || (isAnimating && dragDirection === 'horizontal')) {
                if (isActive) {
                  // Active card rotates in direction of swipe
                  const dragProgress = isDragging ? dragOffsetX / window.innerWidth : 0;
                  rotateZ = dragProgress * 3; // Max ±3deg based on drag
                } else if (position === -1 || position === -2) {
                  // Prev cards rotate counter-clockwise
                  rotateZ = -3;
                } else if (position === 1) {
                  // Next card rotates clockwise
                  rotateZ = 3;
                } else if (position === 2) {
                  // Card after next also rotates clockwise
                  rotateZ = 3;
                }
              }
              
              const shouldHide = Math.abs(position) === 2 && (isDragging || isAnimating) && dragDirection === 'horizontal';
              
              return (
                <div
                  key={`shuffle-${qIndex}`}
                  className="absolute flex flex-col items-center justify-center"
                  onClick={(e) => {
                    setHasInteracted(true);
                    const isDesktop = window.innerWidth >= 768;
                    
                    if (position === 1) {
                      // Click on next card - go next with animation
                      setIsAnimating(true);
                      setDragDirection('horizontal');
                      setLogoSqueezeLeft(true);
                      setCurrentShuffleIndex(prev => (prev + 1) % shuffledQuestions.length);
                      setTimeout(() => {
                        setLogoSqueezeLeft(false);
                        setIsAnimating(false);
                        setDragDirection(null);
                      }, 350);
                    } else if (position === -1) {
                      // Click on prev card - go prev with animation
                      setIsAnimating(true);
                      setDragDirection('horizontal');
                      setLogoSqueezeRight(true);
                      setCurrentShuffleIndex(prev => (prev - 1 + shuffledQuestions.length) % shuffledQuestions.length);
                      setTimeout(() => {
                        setLogoSqueezeRight(false);
                        setIsAnimating(false);
                        setDragDirection(null);
                      }, 350);
                    } else if (isActive && !isDesktop) {
                      // Mobile only: Click on active card - check if left side clicked
                      const clickX = e.clientX;
                      const windowWidth = window.innerWidth;
                      
                      if (clickX < windowWidth * 0.3) {
                        // Left 30% of screen - go to prev
                        setIsAnimating(true);
                        setDragDirection('horizontal');
                        setLogoSqueezeRight(true);
                        setCurrentShuffleIndex(prev => (prev - 1 + shuffledQuestions.length) % shuffledQuestions.length);
                        setTimeout(() => {
                          setLogoSqueezeRight(false);
                          setIsAnimating(false);
                          setDragDirection(null);
                        }, 350);
                      }
                    }
                  }}
                  style={{
                    width: '100vw',
                    height: '100vh',
                    transform: `translateX(${translateXPx + dragTranslateXPx}px) rotateZ(${rotateZ}deg)`,
                    transition: isAnimating && dragDirection === 'horizontal' ? (isActive ? 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1) 100ms' : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)') : 'none',
                    animation: isActive && !hasInteracted && currentShuffleIndex === 0 ? 'swipeHint 0.4s ease-in-out 1s 1' : 'none',
                    pointerEvents: !isActive && (position === 1 || position === -1) ? 'auto' : (isActive ? 'auto' : 'none'),
                    willChange: isAnimating && dragDirection === 'horizontal' ? 'transform' : 'auto',
                    opacity: shouldHide ? 0 : 1,
                    visibility: shouldHide ? 'hidden' : 'visible',
                    cursor: !isActive && (position === 1 || position === -1) ? 'pointer' : 'default'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobile ? 'calc(48px + ((100vh - 48px - 46px) / 2) + 8px)' : 'calc(50% + 8px)',
                      left: '16px',
                      width: '85vw',
                      maxWidth: '600px',
                      height: isMobile 
                        ? 'calc(100svh - 48px - 46px - 8px)' // header + footer + minimal spacing
                        : 'calc(100svh - 64px - 46px - 4px)', // header + footer - 4px
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <QuizCard
                      question={question}
                      onSwipeLeft={() => {}}
                      onSwipeRight={() => {}}
                      animationClass=""
                      onBgColorChange={isActive ? handleBgColorChange : undefined}
                      disableSwipe={true}
                      useContainerSize={true}
                      onCategoryStripClick={isActive ? () => {
                        // Click on category strip - go to prev horizontal slide in shuffle mode
                        setIsAnimating(true);
                        setDragDirection('horizontal');
                        setLogoSqueezeRight(true);
                        setCurrentShuffleIndex(prev => (prev - 1 + shuffledQuestions.length) % shuffledQuestions.length);
                        setTimeout(() => {
                          setLogoSqueezeRight(false);
                          setIsAnimating(false);
                          setDragDirection(null);
                        }, 350);
                      } : undefined}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : categories.length > 0 ? (
          <div className="relative w-full h-full flex justify-center items-center overflow-hidden">
            {/* Render 5 category columns: 2 previous, current, 2 next */}
            {[-2, -1, 0, 1, 2].map((catPosition) => {
              const catIndex = (currentCategoryIndex + catPosition + displayCategories.length) % displayCategories.length;
              const category = displayCategories[catIndex];
              
              const categoryQuestions = questionsByCategory[category] || [];
              
              // Skip if no questions in category
              if (categoryQuestions.length === 0) return null;
              
              const isCategoryActive = catPosition === 0;
              
              // Calculate horizontal transform - equal spacing between all cards (32px, 64px during slide)
              const baseCardSpacingPx = 32; // Base 32px spacing
              const hCardSpacingPx = isHorizontalSliding ? baseCardSpacingPx * 2 : baseCardSpacingPx; // Double during slide
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
                } else if (catPosition === 2) {
                  // Card after next also rotates clockwise
                  rotateZ = 3;
                }
              }
              
              // Hide cards at extreme positions during animation to prevent visible wraparound
              const shouldHide = Math.abs(catPosition) === 2 && (isDragging || isAnimating) && dragDirection === 'horizontal';
              
              return (
                <div 
                  key={`category-${category}`}
                  className="absolute flex flex-col items-center justify-center"
                  data-horizontal-card={isCategoryActive ? 'active' : (catPosition === 1 ? 'next' : catPosition === -1 ? 'prev' : '')}
                  onClick={(e) => {
                    const isDesktop = window.innerWidth >= 768;
                    
                    if (!isCategoryActive && catPosition === 1) {
                      // Mobile & Desktop: Click on next category card with animation
                      setIsAnimating(true);
                      setDragDirection('horizontal');
                      setLogoSqueezeLeft(true);
                      setIsHorizontalSliding(true);
                      setCurrentCategoryIndex(prev => (prev + 1) % displayCategories.length);
                      setTimeout(() => {
                        setLogoSqueezeLeft(false);
                      }, 300);
                      setTimeout(() => {
                        setIsAnimating(false);
                        setDragDirection(null);
                        setIsHorizontalSliding(false);
                      }, 350);
                    } else if (!isCategoryActive && catPosition === -1) {
                      // Mobile & Desktop: Click on prev category card with animation
                      setIsAnimating(true);
                      setDragDirection('horizontal');
                      setLogoSqueezeRight(true);
                      setIsHorizontalSliding(true);
                      setCurrentCategoryIndex(prev => (prev - 1 + displayCategories.length) % displayCategories.length);
                      setTimeout(() => {
                        setLogoSqueezeRight(false);
                      }, 300);
                      setTimeout(() => {
                        setIsAnimating(false);
                        setDragDirection(null);
                        setIsHorizontalSliding(false);
                      }, 350);
                    } else if (isCategoryActive && catPosition === 0 && !isDesktop) {
                      // Mobile only: Click on active category - check if left side clicked
                      const clickX = e.clientX;
                      const windowWidth = window.innerWidth;
                      
                      if (clickX < windowWidth * 0.3) {
                        // Left 30% of screen - go to prev category
                        setIsAnimating(true);
                        setDragDirection('horizontal');
                        setLogoSqueezeRight(true);
                        setIsHorizontalSliding(true);
                        setCurrentCategoryIndex(prev => (prev - 1 + displayCategories.length) % displayCategories.length);
                        setTimeout(() => {
                          setLogoSqueezeRight(false);
                        }, 300);
                        setTimeout(() => {
                          setIsAnimating(false);
                          setDragDirection(null);
                          setIsHorizontalSliding(false);
                        }, 350);
                      }
                    }
                  }}
                  style={{
                    width: '100vw',
                    height: '100vh',
                    transform: `translateX(${baseTranslateX + dragTranslateX}vw) scale(${scaleH}) rotateZ(${rotateZ}deg)`,
                    transition: (isAnimating || isHorizontalSliding) && dragDirection === 'horizontal' ? (isCategoryActive ? 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1) 100ms' : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)') : 'none',
                    animation: (isAnimating || isHorizontalSliding) && dragDirection === 'horizontal' && Math.abs(catPosition) <= 1 ? 'scaleTransition 350ms ease-in-out' : 'none',
                    pointerEvents: isCategoryActive || (!isCategoryActive && (catPosition === 1 || catPosition === -1)) ? 'auto' : 'none',
                    willChange: isAnimating && dragDirection === 'horizontal' ? 'transform' : 'auto',
                    opacity: shouldHide ? 0 : 1,
                    visibility: shouldHide ? 'hidden' : 'visible',
                    cursor: !isCategoryActive && (catPosition === 1 || catPosition === -1) ? 'pointer' : (isCategoryActive ? 'grab' : 'default')
                  }}
                >
                  {/* Render 5 question cards vertically: 2 previous, current, 2 next */}
                  {[-2, -1, 0, 1, 2].map((qPosition) => {
                    const currentQuestionIndex = questionIndicesByCategory[category] || 0;
                    const qIndex = (currentQuestionIndex + qPosition + categoryQuestions.length) % categoryQuestions.length;
                    const question = categoryQuestions[qIndex];
                    
                    // Safety check: skip if question doesn't exist
                    if (!question) return null;
                    
                    const isActive = isCategoryActive && qPosition === 0;
                    
                    // Hide previous vertical slide on desktop during horizontal slide
                    const isDesktop = window.innerWidth >= 768;
                    const shouldHideVerticalPrev = isDesktop && isHorizontalSliding && qPosition === -1;
                    
                    // Calculate vertical transform - fixed spacing between cards (32px)
                    const vCardSpacingPx = 32; // 32px gap between cards
                    const cardHeight = window.innerHeight * 0.8; // Card height (80vh)
                    const totalCardHeight = cardHeight + vCardSpacingPx; // Total height including spacing
                    const cardSpacingVh = (totalCardHeight / window.innerHeight) * 100; // Convert to vh
                    
                    // Calculate position - show next card with 32px margin
                    let baseTranslateY;
                    
                    if (qPosition === -1) {
                      // Move previous card up by 70vh + header offset + 48px mobile, 64px desktop
                      const isMobile = window.innerWidth < 768;
                      const offsetPx = isMobile ? 112 : 144; // 64+16+16+16 or 80+16+16+16+16
                      const offsetVh = (offsetPx / window.innerHeight) * 100;
                      baseTranslateY = -(70 + offsetVh);
                    } else if (qPosition === 1) {
                      // Next card positioned with gap after active card
                      // Mobile: 70vh + 16px, Desktop: 80vh + 32px
                      const isMobile = window.innerWidth < 768;
                      const activeCardHeight = isMobile ? 70 : 80;
                      const gapPx = isMobile ? 16 : 32;
                      const gapVh = (gapPx / window.innerHeight) * 100;
                      baseTranslateY = activeCardHeight + gapVh;
                    } else {
                      baseTranslateY = qPosition * cardSpacingVh;
                    }
                    
                    // Only apply vertical drag to the active category
                    const dragTranslateY = (isCategoryActive && isDragging && dragDirection === 'vertical') ? (dragOffsetY / window.innerHeight) * cardSpacingVh : 0;

                    // Vertical scale - all cards at scale 1
                    const scale = 1;
                    
                    return (
                      <div
                        key={`${category}-${question.question}`}
                        className="absolute flex items-center justify-center"
                        onClick={(e) => {
                          if (isCategoryActive && !isActive) {
                            const currentCategory = displayCategories[currentCategoryIndex];
                            const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
                            
                            if (qPosition === 1) {
                              // Click on next question with animation
                              setIsAnimating(true);
                              setDragDirection('vertical');
                              setQuestionIndicesByCategory(prev => ({
                                ...prev,
                                [currentCategory]: ((prev[currentCategory] || 0) + 1) % currentCategoryQuestions.length
                              }));
                              setTimeout(() => {
                                setIsAnimating(false);
                                setDragDirection(null);
                              }, 350);
                            } else if (qPosition === -1) {
                              // Click on prev question with animation
                              setIsAnimating(true);
                              setDragDirection('vertical');
                              setQuestionIndicesByCategory(prev => ({
                                ...prev,
                                [currentCategory]: ((prev[currentCategory] || 0) - 1 + currentCategoryQuestions.length) % currentCategoryQuestions.length
                              }));
                              setTimeout(() => {
                                setIsAnimating(false);
                                setDragDirection(null);
                              }, 350);
                            }
                          } else if (isActive) {
                            const clickY = e.clientY;
                            const headerHeight = window.innerWidth >= 768 ? 64 : 48;
                            
                            if (clickY < headerHeight + 100) {
                              // Top area - go to prev question
                              const currentCategory = displayCategories[currentCategoryIndex];
                              const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
                              setIsAnimating(true);
                              setDragDirection('vertical');
                              setQuestionIndicesByCategory(prev => ({
                                ...prev,
                                [currentCategory]: ((prev[currentCategory] || 0) - 1 + currentCategoryQuestions.length) % currentCategoryQuestions.length
                              }));
                              setTimeout(() => {
                                setIsAnimating(false);
                                setDragDirection(null);
                              }, 350);
                            }
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: window.innerWidth >= 768 ? '64px' : '48px',
                          left: window.innerWidth >= 768 ? '16px' : '16px',
                          width: window.innerWidth >= 768 ? `${Math.min(window.innerWidth * 0.8, 600)}px` : 'calc(80vw + 16px)',
                          height: '80vh',
                          transform: `translateY(${baseTranslateY + dragTranslateY}vh) scale(${scale})`,
                          transition: isAnimating && dragDirection === 'vertical' && isCategoryActive ? (isActive ? 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1) 100ms' : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)') : 'none',
                          animation: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'scaleTransition 350ms ease-in-out' : 'none',
                          pointerEvents: isActive ? 'auto' : (isCategoryActive && !isActive && (qPosition === 1 || qPosition === -1) ? 'auto' : 'none'),
                          willChange: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'transform' : 'auto',
                          zIndex: qPosition <= 0 ? 10 - qPosition : 10 - qPosition, // Previous and current cards on top, next cards below
                          cursor: isCategoryActive && !isActive && (qPosition === 1 || qPosition === -1) ? 'pointer' : 'default',
                          opacity: shouldHideVerticalPrev ? 0 : 1,
                          visibility: shouldHideVerticalPrev ? 'hidden' : 'visible'
                        }}
                      >
                        <QuizCard
                          question={question}
                          onSwipeLeft={nextCategory}
                          onSwipeRight={prevCategory}
                          animationClass=""
                          onBgColorChange={isActive ? handleBgColorChange : undefined}
                          disableSwipe={true}
                          onCategoryStripClick={isActive ? () => {
                            // Active card: Click on category strip - go to prev horizontal slide (category) with animation
                            setIsAnimating(true);
                            setDragDirection('horizontal');
                            setLogoSqueezeRight(true);
                            setIsHorizontalSliding(true);
                            setCurrentCategoryIndex(prev => (prev - 1 + displayCategories.length) % displayCategories.length);
                            setTimeout(() => {
                              setLogoSqueezeRight(false);
                            }, 300);
                            setTimeout(() => {
                              setIsAnimating(false);
                              setDragDirection(null);
                              setIsHorizontalSliding(false);
                            }, 350);
                          } : (isCategoryActive && catPosition === 0 && (qPosition === 1 || qPosition === -1)) ? () => {
                            // Mobile: Non-active vertical card's category strip in active horizontal category - trigger horizontal slide
                            const isMobile = window.innerWidth < 768;
                            if (!isMobile) return;
                            
                            setIsAnimating(true);
                            setDragDirection('horizontal');
                            setLogoSqueezeRight(true);
                            setIsHorizontalSliding(true);
                            setCurrentCategoryIndex(prev => (prev - 1 + displayCategories.length) % displayCategories.length);
                            setTimeout(() => {
                              setLogoSqueezeRight(false);
                            }, 300);
                            setTimeout(() => {
                              setIsAnimating(false);
                              setDragDirection(null);
                              setIsHorizontalSliding(false);
                            }, 350);
                          } : (!isCategoryActive && (catPosition === 1 || catPosition === -1)) ? () => {
                            // Mobile: Category strip on non-active horizontal slide - navigate to that category
                            const isMobile = window.innerWidth < 768;
                            if (!isMobile) return;
                            
                            setIsAnimating(true);
                            setDragDirection('horizontal');
                            setIsHorizontalSliding(true);
                            
                            if (catPosition === 1) {
                              // Next category
                              setLogoSqueezeLeft(true);
                              setCurrentCategoryIndex(prev => (prev + 1) % displayCategories.length);
                              setTimeout(() => {
                                setLogoSqueezeLeft(false);
                              }, 300);
                            } else {
                              // Prev category
                              setLogoSqueezeRight(true);
                              setCurrentCategoryIndex(prev => (prev - 1 + displayCategories.length) % displayCategories.length);
                              setTimeout(() => {
                                setLogoSqueezeRight(false);
                              }, 300);
                            }
                            
                            setTimeout(() => {
                              setIsAnimating(false);
                              setDragDirection(null);
                              setIsHorizontalSliding(false);
                            }, 350);
                          } : undefined}
                          onTopClick={isActive ? () => {
                            // Click on top area - go to prev vertical slide (question) - default mode only
                            const currentCategory = displayCategories[currentCategoryIndex];
                            const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
                            setIsAnimating(true);
                            setDragDirection('vertical');
                            setQuestionIndicesByCategory(prev => ({
                              ...prev,
                              [currentCategory]: ((prev[currentCategory] || 0) - 1 + currentCategoryQuestions.length) % currentCategoryQuestions.length
                            }));
                            setTimeout(() => {
                              setIsAnimating(false);
                              setDragDirection(null);
                            }, 350);
                          } : undefined}
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
      
      {/* Bottom Action Button - Only visible in shuffle mode */}
      {!loading && isShuffleMode && (
        <div className="app-footer flex-shrink-0 relative z-50" style={{paddingTop: '16px', paddingBottom: '16px', position: 'fixed', bottom: 0, left: 0, right: 0, pointerEvents: 'none'}}>
          <div className="flex justify-center items-center">
            <button 
              onClick={() => setCategorySelectorOpen(true)}
              className={`${headerTextColor} font-normal text-xs transition-colors duration-500 pointer-events-auto opacity-100`}
              style={{fontSize: '14px'}}
            >
              Kategorien wählen
            </button>
          </div>
        </div>
      )}
      
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
