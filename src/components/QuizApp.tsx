
import { useState, useEffect } from 'react';
import { QuizCard } from './QuizCard';
import { CategorySelector } from './CategorySelector';

interface Question {
  question: string;
  category: string;
}

export function QuizApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [lastDragX, setLastDragX] = useState(0);
  const [lastDragTime, setLastDragTime] = useState(0);

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
    setDragOffset(0);
    setDragStartTime(Date.now());
    setLastDragX(e.clientX);
    setLastDragTime(Date.now());
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const offset = e.clientX - dragStartX;
    setDragOffset(offset);
    setLastDragX(e.clientX);
    setLastDragTime(Date.now());
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 80; // 80px drag threshold
    const now = Date.now();
    const timeDelta = now - lastDragTime;
    const distance = lastDragX - dragStartX;
    
    // Calculate velocity (pixels per millisecond)
    const velocity = timeDelta > 0 ? Math.abs(distance / timeDelta) : 0;
    const velocityThreshold = 0.5; // px/ms - adjust for sensitivity
    
    // Check if it's a quick flick
    const isFlick = velocity > velocityThreshold;
    
    // Determine if we should navigate
    const shouldGoNext = (dragOffset < -threshold || (isFlick && dragOffset < 0)) && currentIndex < questions.length - 1;
    const shouldGoPrev = (dragOffset > threshold || (isFlick && dragOffset > 0)) && currentIndex > 0;
    
    if (shouldGoNext) {
      // Swiped left - next question
      nextQuestion();
      setIsDragging(false);
      setDragOffset(0);
    } else if (shouldGoPrev) {
      // Swiped right - previous question
      prevQuestion();
      setIsDragging(false);
      setDragOffset(0);
    } else {
      // Snap back with momentum
      setIsDragging(false);
      setIsAnimating(true);
      
      // Apply momentum to snap back
      const momentumOffset = velocity * 100; // Scale velocity for visual effect
      const finalOffset = dragOffset + (dragOffset < 0 ? -momentumOffset : momentumOffset);
      
      // Animate back to center
      setDragOffset(finalOffset);
      setTimeout(() => {
        setDragOffset(0);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 16);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setLogoSqueezeLeft(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => {
        setLogoSqueezeLeft(false);
      }, 300);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setLogoSqueezeRight(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => {
        setLogoSqueezeRight(false);
      }, 300);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevQuestion();
    } else if (e.key === 'ArrowRight') {
      nextQuestion();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  // Filter questions based on selected categories
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setQuestions([]);
    } else {
      const filteredQuestions = allQuestions.filter(q => 
        selectedCategories.includes(q.category)
      );
      setQuestions(filteredQuestions);
      setCurrentIndex(0); // Reset to first question when filtering
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
        transition: 'background 2000ms cubic-bezier(0.33, 1, 0.68, 1)'
      }}
    >
      {/* Overlay that fades in with new color */}
      <div 
        className="absolute inset-0"
        style={{
          background: getColorFromBgClass(bgColor),
          opacity: bgColor === prevBgColor ? 0 : 1,
          transition: 'opacity 2000ms cubic-bezier(0.33, 1, 0.68, 1)'
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
        style={{ width: '100vw', height: '100vh' }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            {/* Loading text removed - handled by static HTML */}
          </div>
        ) : questions.length > 0 ? (
          <div className="relative w-full h-full flex justify-center items-center">
            {/* Render previous, current, and next cards */}
            {[currentIndex - 1, currentIndex, currentIndex + 1].map((index) => {
              if (index < 0 || index >= questions.length) return null;
              
              const position = index - currentIndex; // -1, 0, or 1
              const isActive = position === 0;
              
              // Calculate dynamic transform based on drag
              const baseTranslate = position * 100;
              const baseGap = position * 16;
              const dragTranslate = isDragging ? (dragOffset / window.innerWidth) * 100 : 0;
              
              // Dynamic scale based on drag progress
              const dragProgress = Math.abs(dragOffset) / window.innerWidth;
              let scale = isActive ? 1 : 0.8;
              if (isDragging) {
                if (isActive) {
                  scale = Math.max(0.8, 1 - dragProgress * 0.2);
                } else if ((position === 1 && dragOffset < 0) || (position === -1 && dragOffset > 0)) {
                  // Next card scales up when dragging towards it
                  scale = Math.min(1, 0.8 + dragProgress * 0.2);
                }
              }
              
              return (
                <div
                  key={`card-${index}`}
                  className="absolute"
                  style={{
                    transform: `translateX(calc(${baseTranslate + dragTranslate}% + ${baseGap}px)) scale(${scale})`,
                    transition: isAnimating ? 'transform 300ms cubic-bezier(0.33, 1, 0.68, 1)' : 'none',
                    zIndex: isActive ? 10 : 5,
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                >
                  <QuizCard
                    question={questions[index]}
                    onSwipeLeft={nextQuestion}
                    onSwipeRight={prevQuestion}
                    animationClass=""
                    onBgColorChange={isActive ? handleBgColorChange : undefined}
                  />
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
