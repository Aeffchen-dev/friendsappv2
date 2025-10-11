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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [currentDragX, setCurrentDragX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten all questions from selected categories
  const allCards = selectedCategories.flatMap(category => 
    allQuestions
      .filter(q => q.category === category)
      .map(q => ({ ...q, category }))
  );

  const totalCards = allCards.length;

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStartX(e.clientX);
    setCurrentDragX(0);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX === null) return;
    const deltaX = e.clientX - dragStartX;
    setCurrentDragX(deltaX);
  };

  const handlePointerUp = () => {
    if (dragStartX !== null) {
      const swipeThreshold = 50;
      
      if (currentDragX < -swipeThreshold && currentIndex < totalCards - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (currentDragX > swipeThreshold && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
    
    setDragStartX(null);
    setCurrentDragX(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < totalCards - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalCards]);

  if (totalCards === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white text-sm">Keine Fragen verfügbar</div>
      </div>
    );
  }

  const getCardTransform = (cardIndex: number) => {
    const position = cardIndex - currentIndex;
    const isDragging = dragStartX !== null;
    
    let translateX = 0;
    let scale = 1;
    let zIndex = 1;
    let pointerEvents: 'auto' | 'none' = 'none';

    if (position === 0) {
      // Active card
      translateX = isDragging ? currentDragX : 0;
      scale = 1;
      zIndex = 3;
      pointerEvents = 'auto';
    } else if (position === 1) {
      // Next card (right)
      translateX = isDragging ? currentDragX : 0;
      scale = 0.8;
      zIndex = 1;
    } else if (position === -1) {
      // Previous card (left)
      translateX = isDragging ? currentDragX : 0;
      scale = 0.8;
      zIndex = 1;
    } else if (position > 1) {
      // Cards further to the right
      translateX = 0;
      scale = 0.8;
      zIndex = 0;
    } else {
      // Cards further to the left
      translateX = 0;
      scale = 0.8;
      zIndex = 0;
    }

    // Calculate the base offset for positioning
    let baseOffset = 'calc(100% + 16px)';
    if (position === 0) {
      baseOffset = '0px';
    } else if (position === 1) {
      baseOffset = 'calc(100% + 16px)';
    } else if (position === -1) {
      baseOffset = 'calc(-100% - 16px)';
    } else if (position > 1) {
      baseOffset = 'calc(100% + 16px)';
    } else {
      baseOffset = 'calc(-100% - 16px)';
    }

    return {
      transform: `translateX(${baseOffset}) translateX(${translateX}px) scale(${scale})`,
      zIndex,
      pointerEvents,
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  return (
    <div 
      className="flex-1 flex items-stretch justify-center min-h-0 relative"
      style={{ overflow: 'visible' }}
    >
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        {allCards.map((question, index) => {
          const cardStyle = getCardTransform(index);
          
          return (
            <div
              key={`${question.category}-${index}`}
              className="absolute inset-0 w-full h-full"
              style={cardStyle}
            >
              <QuizCard
                question={question}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                animationClass=""
                onBgColorChange={onBgColorChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
