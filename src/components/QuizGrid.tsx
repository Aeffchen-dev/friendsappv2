import { useState, useEffect, useRef } from 'react';
import { QuizCard } from './QuizCard';

interface Question {
  question: string;
  category: string;
}

interface QuizGridProps {
  allQuestions: Question[];
  selectedCategories: string[];
  onBgColorChange: (bgClass: string) => void;
}

export function QuizGrid({ allQuestions, selectedCategories, onBgColorChange }: QuizGridProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndices, setCurrentQuestionIndices] = useState<{[key: string]: number}>({});
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Organize questions by category
  const questionsByCategory = selectedCategories.reduce((acc, category) => {
    acc[category] = allQuestions.filter(q => q.category === category);
    return acc;
  }, {} as {[key: string]: Question[]});

  // Initialize question indices for each category
  useEffect(() => {
    const indices: {[key: string]: number} = {};
    selectedCategories.forEach(cat => {
      indices[cat] = 0;
    });
    setCurrentQuestionIndices(indices);
  }, [selectedCategories]);

  const currentCategory = selectedCategories[currentCategoryIndex];
  const currentQuestions = questionsByCategory[currentCategory] || [];
  const currentQuestionIndex = currentQuestionIndices[currentCategory] || 0;

  // Card dimensions with peek
  const cardWidth = 90; // 90vw, shows 5% of next category on each side
  const cardHeight = 80; // 80vh, shows 10% of next question

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ 
      x: e.targetTouches[0].clientX, 
      y: e.targetTouches[0].clientY 
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ 
      x: e.targetTouches[0].clientX, 
      y: e.targetTouches[0].clientY 
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      // Horizontal swipe - change category
      if (distanceX > minSwipeDistance && currentCategoryIndex < selectedCategories.length - 1) {
        setCurrentCategoryIndex(prev => prev + 1);
      } else if (distanceX < -minSwipeDistance && currentCategoryIndex > 0) {
        setCurrentCategoryIndex(prev => prev - 1);
      }
    } else {
      // Vertical swipe - change question within category
      if (distanceY > minSwipeDistance && currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndices(prev => ({
          ...prev,
          [currentCategory]: (prev[currentCategory] || 0) + 1
        }));
      } else if (distanceY < -minSwipeDistance && currentQuestionIndex > 0) {
        setCurrentQuestionIndices(prev => ({
          ...prev,
          [currentCategory]: (prev[currentCategory] || 0) - 1
        }));
      }
    }
  };

  const handleEdgeTap = (direction: 'left' | 'right' | 'top' | 'bottom') => {
    if (direction === 'left' && currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    } else if (direction === 'right' && currentCategoryIndex < selectedCategories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else if (direction === 'top' && currentQuestionIndex > 0) {
      setCurrentQuestionIndices(prev => ({
        ...prev,
        [currentCategory]: (prev[currentCategory] || 0) - 1
      }));
    } else if (direction === 'bottom' && currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndices(prev => ({
        ...prev,
        [currentCategory]: (prev[currentCategory] || 0) + 1
      }));
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleEdgeTap('left');
      else if (e.key === 'ArrowRight') handleEdgeTap('right');
      else if (e.key === 'ArrowUp') handleEdgeTap('top');
      else if (e.key === 'ArrowDown') handleEdgeTap('bottom');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCategoryIndex, currentQuestionIndex, currentCategory, currentQuestions.length, selectedCategories.length]);

  if (selectedCategories.length === 0 || !currentCategory) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-sm">Keine Kategorien ausgewählt</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Render grid of all categories and questions */}
      <div 
        className="absolute inset-0 flex transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(calc(-${currentCategoryIndex} * ${cardWidth}vw + ${(100 - cardWidth) / 2}vw))`
        }}
      >
        {selectedCategories.map((category, catIndex) => (
          <div
            key={category}
            className="flex-shrink-0 relative"
            style={{ width: `${cardWidth}vw`, marginRight: `${(100 - cardWidth) / selectedCategories.length}vw` }}
          >
            <div 
              className="absolute inset-0 flex flex-col transition-transform duration-500 ease-out"
              style={{
                transform: `translateY(calc(-${currentQuestionIndices[category] || 0} * ${cardHeight}vh + ${(100 - cardHeight) / 2}vh))`
              }}
            >
              {questionsByCategory[category]?.map((question, qIndex) => (
                <div
                  key={`${category}-${qIndex}`}
                  className="flex-shrink-0 relative"
                  style={{ height: `${cardHeight}vh`, marginBottom: `${(100 - cardHeight) / 10}vh` }}
                >
                  {/* Edge tap zones */}
                  <div 
                    className="absolute left-0 top-0 w-16 h-full z-20 cursor-pointer"
                    onClick={() => handleEdgeTap('left')}
                  />
                  <div 
                    className="absolute right-0 top-0 w-16 h-full z-20 cursor-pointer"
                    onClick={() => handleEdgeTap('right')}
                  />
                  <div 
                    className="absolute top-0 left-0 right-0 h-16 z-20 cursor-pointer"
                    onClick={() => handleEdgeTap('top')}
                  />
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-16 z-20 cursor-pointer"
                    onClick={() => handleEdgeTap('bottom')}
                  />

                  <QuizCard
                    question={question}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                    animationClass=""
                    onBgColorChange={onBgColorChange}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
