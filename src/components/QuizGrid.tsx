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
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [axis, setAxis] = useState<'x' | 'y' | null>(null);
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

  // Card dimensions with peek - cards are smaller than viewport to show neighbors
  const cardWidth = 80; // vw - shows 10% peek on each side
  const cardHeight = 80; // vh - shows 10% peek top/bottom
  const cardGapH = 2.5; // horizontal gap between cards (vw)
  const cardGapV = 2.5; // vertical gap between cards (vh)

  const minSwipeDistance = 50;

  const onPointerDown = (e: React.PointerEvent) => {
    const point = { x: e.clientX, y: e.clientY };
    setDragStart(point);
    setDragX(0);
    setDragY(0);
    setAxis(null);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (!axis) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        setAxis(Math.abs(dx) > Math.abs(dy) ? 'x' : 'y');
      } else {
        return;
      }
    }

    if (axis === 'x') {
      setDragX(dx);
      setDragY(0);
    } else if (axis === 'y') {
      setDragY(dy);
      setDragX(0);
    }
    e.preventDefault();
  };

  const onPointerUp = () => {
    if (dragStart) {
      const dx = dragX;
      const dy = dragY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const thresholdPx = Math.min(window.innerWidth, window.innerHeight) * 0.12; // 12% viewport

      if (axis === 'x' && absX > thresholdPx) {
        if (dx < 0 && currentCategoryIndex < selectedCategories.length - 1) {
          setCurrentCategoryIndex((i) => i + 1);
        } else if (dx > 0 && currentCategoryIndex > 0) {
          setCurrentCategoryIndex((i) => i - 1);
        }
      } else if (axis === 'y' && absY > thresholdPx) {
        const currentQIndex = currentQuestionIndices[currentCategory] || 0;
        const maxIndex = (questionsByCategory[currentCategory]?.length || 1) - 1;

        if (dy < 0 && currentQIndex < maxIndex) {
          setCurrentQuestionIndices((prev) => ({
            ...prev,
            [currentCategory]: currentQIndex + 1
          }));
        } else if (dy > 0 && currentQIndex > 0) {
          setCurrentQuestionIndices((prev) => ({
            ...prev,
            [currentCategory]: currentQIndex - 1
          }));
        }
      }
    }
    setDragStart(null);
    setDragX(0);
    setDragY(0);
    setAxis(null);
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

  // Calculate offset to center current card
  const currentQuestionIndexForCategory = currentQuestionIndices[currentCategory] || 0;
  const horizontalOffset = currentCategoryIndex * (cardWidth + cardGapH);
  const verticalOffset = currentQuestionIndexForCategory * (cardHeight + cardGapV);

  return (
    <div 
      ref={containerRef}
      className="w-screen h-screen overflow-hidden"
      style={{ width: '100vw', height: '100vh', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Grid container that slides to show active card centered */}
      <div 
        className="absolute"
        style={{
          transform: `translate(calc(50vw - ${cardWidth / 2}vw - ${horizontalOffset}vw + ${(dragX / window.innerWidth) * 100}vw), calc(50vh - ${cardHeight / 2}vh - ${verticalOffset}vh + ${(dragY / window.innerHeight) * 100}vh))`,
          left: 0,
          top: 0,
          transition: dragStart ? 'none' : 'transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* Horizontal layout of categories */}
        {selectedCategories.map((category, catIndex) => (
          <div
            key={category}
            className="absolute"
            style={{
              left: `${catIndex * (cardWidth + cardGapH)}vw`,
              top: 0
            }}
          >
            {/* Vertical layout of questions within category */}
            {questionsByCategory[category]?.map((question, qIndex) => (
              <div
                key={`${category}-${qIndex}`}
                className="absolute"
                style={{
                  width: `${cardWidth}vw`,
                  height: `${cardHeight}vh`,
                  top: `${qIndex * (cardHeight + cardGapV)}vh`,
                  left: 0
                }}
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
        ))}
      </div>
    </div>
  );
}
