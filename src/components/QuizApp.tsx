
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
      // Change category
      if (dragOffsetX < -threshold && currentCategoryIndex < categories.length - 1) {
        setLogoSqueezeLeft(true);
        setCurrentCategoryIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
        setTimeout(() => setLogoSqueezeLeft(false), 300);
      } else if (dragOffsetX > threshold && currentCategoryIndex > 0) {
        setLogoSqueezeRight(true);
        setCurrentCategoryIndex(prev => prev - 1);
        setCurrentQuestionIndex(0);
        setTimeout(() => setLogoSqueezeRight(false), 300);
      }
      setDragOffsetX(0);
    } else if (dragDirection === 'vertical') {
      // Change question within category
      const currentCategoryQuestions = questionsByCategory[categories[currentCategoryIndex]] || [];
      if (dragOffsetY < -threshold && currentQuestionIndex < currentCategoryQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else if (dragOffsetY > threshold && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
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
    }, 800);
  };

  const nextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setLogoSqueezeLeft(true);
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setTimeout(() => setLogoSqueezeLeft(false), 300);
    }
  };

  const prevCategory = () => {
    if (currentCategoryIndex > 0) {
      setLogoSqueezeRight(true);
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentQuestionIndex(0);
      setTimeout(() => setLogoSqueezeRight(false), 300);
    }
  };

  const nextQuestion = () => {
    const currentCategoryQuestions = questionsByCategory[categories[currentCategoryIndex]] || [];
    if (currentQuestionIndex < currentCategoryQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
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
        style={{ width: '100vw', touchAction: 'none' }}
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
          <div 
            className="flex"
            style={{
              transform: `translateX(calc(-${currentCategoryIndex * 100}vw + ${dragOffsetX}px))`,
              transition: isAnimating && dragDirection === 'horizontal' ? 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            }}
          >
            {categories.map((category, catIndex) => {
              const categoryQuestions = questionsByCategory[category] || [];
              const isCategoryActive = catIndex === currentCategoryIndex;
              
              return (
                <div 
                  key={category}
                  className="flex flex-col flex-shrink-0"
                  style={{
                    width: '100vw',
                    transform: isCategoryActive ? `translateY(calc(-${currentQuestionIndex * 100}vh + ${dragOffsetY}px))` : 'none',
                    transition: isAnimating && dragDirection === 'vertical' && isCategoryActive ? 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                  }}
                >
                  {categoryQuestions.map((question, qIndex) => {
                    const isActive = isCategoryActive && qIndex === currentQuestionIndex;
                    
                    return (
                      <div
                        key={`${question.question}-${qIndex}`}
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{
                          height: '100vh',
                          pointerEvents: isActive ? 'auto' : 'none'
                        }}
                      >
                        <QuizCard
                          question={question}
                          onSwipeLeft={nextCategory}
                          onSwipeRight={prevCategory}
                          animationClass=""
                          onBgColorChange={isActive ? handleBgColorChange : undefined}
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
