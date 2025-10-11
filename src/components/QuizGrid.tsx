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
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Organize questions by category
  const allCards = selectedCategories.flatMap(category => 
    allQuestions
      .filter(q => q.category === category)
      .map(q => ({ ...q, category }))
  );

  const totalCards = allCards.length;

  const onPointerDown = (e: React.PointerEvent) => {
    setDragStart(e.clientX);
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart === null) return;
    const dx = e.clientX - dragStart;
    setDragOffset(dx);
    e.preventDefault();
  };

  const onPointerUp = () => {
    if (dragStart !== null) {
      const threshold = window.innerWidth * 0.15;
      const absOffset = Math.abs(dragOffset);
      
      if (absOffset > threshold) {
        if (dragOffset < 0 && currentIndex < totalCards - 1) {
          setCurrentIndex(i => i + 1);
        } else if (dragOffset > 0 && currentIndex > 0) {
          setCurrentIndex(i => i - 1);
        }
      }
    }
    setDragStart(null);
    setDragOffset(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(i => i - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < totalCards - 1) {
        setCurrentIndex(i => i + 1);
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

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const dragFactor = dragStart !== null ? dragOffset / window.innerWidth : 0;
    
    let x = 0;
    let scale = 1;
    let zIndex = 1;
    let pointerEvents: 'auto' | 'none' = 'none';
    
    if (diff === 0) {
      // Current card
      x = dragFactor * 100;
      scale = 1;
      zIndex = 3;
      pointerEvents = 'auto';
    } else if (diff === 1) {
      // Next card (right)
      x = 100 + 16 / window.innerWidth * 100 + dragFactor * 100;
      scale = 0.8;
      zIndex = 1;
    } else if (diff === -1) {
      // Previous card (left)
      x = -100 - 16 / window.innerWidth * 100 + dragFactor * 100;
      scale = 0.8;
      zIndex = 1;
    } else if (diff > 1) {
      // Cards further right
      x = 100 + 16 / window.innerWidth * 100;
      scale = 0.8;
      zIndex = 0;
    } else {
      // Cards further left
      x = -100 - 16 / window.innerWidth * 100;
      scale = 0.8;
      zIndex = 0;
    }

    return {
      transform: `translateX(${x}%) scale(${scale})`,
      zIndex,
      pointerEvents,
      transition: dragStart !== null ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex items-stretch justify-center min-h-0 relative"
      style={{ overflow: 'visible' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="relative w-full h-full flex items-center justify-center" style={{ touchAction: 'pan-y' }}>
        {allCards.map((question, index) => (
          <div
            key={`${question.category}-${index}`}
            className="absolute inset-0 w-full h-full"
            style={getCardStyle(index)}
          >
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
  );
}
