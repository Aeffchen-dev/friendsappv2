import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface CategorySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function CategorySelector({ 
  open, 
  onOpenChange, 
  categories, 
  selectedCategories, 
  onCategoriesChange 
}: CategorySelectorProps) {
  const [tempSelection, setTempSelection] = useState<string[]>(selectedCategories);
  const [strokeAnimations, setStrokeAnimations] = useState<{[key: string]: boolean}>({});
  const [animatingItems, setAnimatingItems] = useState<{[key: string]: boolean}>({});
  const [isInitialOpen, setIsInitialOpen] = useState(false);

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  // Handle modal open animation
  useEffect(() => {
    if (open) {
      setIsInitialOpen(true);
      // Trigger bounce for all selected categories
      const selected = categories.filter(cat => selectedCategories.includes(cat));
      const animState: {[key: string]: boolean} = {};
      selected.forEach(cat => {
        animState[cat] = true;
      });
      setAnimatingItems(animState);
      
      setTimeout(() => {
        setAnimatingItems({});
        setIsInitialOpen(false);
      }, 350);
    }
  }, [open, categories, selectedCategories]);

  const getCategoryColors = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    switch (categoryLower) {
      case 'connection':
        return { 
          stripeBg: 'hsl(var(--connection-500))', 
          cardBg: 'hsl(var(--quiz-connection-bg))',
          text: '#3d0e0a'
        };
      case 'fuck':
        return { 
          stripeBg: 'hsl(var(--fuck-500))', 
          cardBg: 'hsl(var(--quiz-fuck-bg))',
          text: '#611610'
        };
      case 'identity':
        return { 
          stripeBg: 'hsl(var(--identity-500))', 
          cardBg: 'hsl(var(--quiz-identity-bg))',
          text: '#FFECEB'
        };
      case 'party':
        return { 
          stripeBg: 'hsl(var(--party-500))', 
          cardBg: 'hsl(var(--quiz-party-bg))',
          text: '#282C3D'
        };
      case 'wer aus der runde':
        return { 
          stripeBg: 'hsl(var(--wer-aus-der-runde-500))', 
          cardBg: 'hsl(var(--quiz-wer-aus-der-runde-bg))',
          text: '#053053'
        };
      case 'friends':
        return { 
          stripeBg: 'hsl(var(--friends-500))', 
          cardBg: 'hsl(var(--quiz-friends-bg))',
          text: 'hsl(var(--friends-900))'
        };
      case 'self reflection':
        return { 
          stripeBg: 'hsl(var(--self-reflection-500))', 
          cardBg: 'hsl(var(--quiz-self-reflection-bg))',
          text: 'hsl(var(--self-reflection-900))'
        };
      case 'family':
        return { 
          stripeBg: 'hsl(var(--family-500))', 
          cardBg: 'hsl(var(--quiz-family-bg))',
          text: 'hsl(var(--family-900))'
        };
      case 'career':
        return { 
          stripeBg: 'hsl(var(--career-500))', 
          cardBg: 'hsl(var(--quiz-career-bg))',
          text: 'hsl(var(--career-900))'
        };
      case 'travel':
        return { 
          stripeBg: 'hsl(var(--travel-500))', 
          cardBg: 'hsl(var(--quiz-travel-bg))',
          text: 'hsl(var(--travel-900))'
        };
      case 'health':
        return { 
          stripeBg: 'hsl(var(--health-500))', 
          cardBg: 'hsl(var(--quiz-health-bg))',
          text: 'hsl(var(--health-900))'
        };
      case 'money':
        return { 
          stripeBg: 'hsl(var(--money-500))', 
          cardBg: 'hsl(var(--quiz-money-bg))',
          text: 'hsl(var(--money-900))'
        };
      case 'love':
        return { 
          stripeBg: 'hsl(var(--love-500))', 
          cardBg: 'hsl(var(--quiz-love-bg))',
          text: 'hsl(var(--love-900))'
        };
      case 'hobby':
        return { 
          stripeBg: 'hsl(var(--hobby-500))', 
          cardBg: 'hsl(var(--quiz-hobby-bg))',
          text: 'hsl(var(--hobby-900))'
        };
      case 'dreams':
        return { 
          stripeBg: 'hsl(var(--dreams-500))', 
          cardBg: 'hsl(var(--quiz-dreams-bg))',
          text: 'hsl(var(--dreams-900))'
        };
      case 'fear':
        return { 
          stripeBg: 'hsl(var(--fear-500))', 
          cardBg: 'hsl(var(--quiz-fear-bg))',
          text: 'hsl(var(--fear-900))'
        };
      case 'wisdom':
        return { 
          stripeBg: 'hsl(var(--wisdom-500))', 
          cardBg: 'hsl(var(--quiz-wisdom-bg))',
          text: 'hsl(var(--wisdom-900))'
        };
      case 'future':
        return { 
          stripeBg: 'hsl(var(--future-500))', 
          cardBg: 'hsl(var(--quiz-future-bg))',
          text: 'hsl(var(--future-900))'
        };
      default:
        return { 
          stripeBg: 'hsl(var(--quiz-category-bg))', 
          cardBg: 'hsl(var(--quiz-category-bg))',
          text: 'hsl(var(--quiz-category-text))' 
        };
    }
  };


  const handleCategoryToggle = (category: string) => {
    const isCurrentlySelected = tempSelection.includes(category);
    
    setTempSelection(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );

    // Trigger animation only when checking (not unchecking) and not during initial open
    if (!isCurrentlySelected && !isInitialOpen) {
      setAnimatingItems(prev => ({ ...prev, [category]: true }));
      setTimeout(() => {
        setAnimatingItems(prev => ({ ...prev, [category]: false }));
      }, 350);
    }
  };

  const handleApply = () => {
    onCategoriesChange(tempSelection);
    onOpenChange(false);
  };

  const handleClose = () => {
    onCategoriesChange(tempSelection); // Apply changes when closing
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-none mx-0 bg-black border-0 rounded-none p-0 overflow-hidden [&>button]:hidden h-screen w-screen data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out">
        <DialogDescription className="sr-only">
          Wählen Sie die Kategorien aus, die Sie sehen möchten
        </DialogDescription>
        <div className="flex flex-col h-full relative w-full">
          {/* Header with close button */}
          <div className="absolute top-4 left-8 right-8 z-10 flex items-center justify-between">
            <h2 className="text-white text-xl font-normal">
              Kategorien wählen
            </h2>
            
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Categories List */}
          {tempSelection.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-8">
              <p className="text-white text-center" style={{ fontSize: '14px', maxWidth: '80%' }}>
                Aktuell hast du alle Kategorien abgewählt. Aktiviere mindestens eine Kategorie, um die Fragen anzuzeigen
              </p>
            </div>
          ) : (
          <div className="flex-1 pr-8 pt-24 pb-8 space-y-3 overflow-y-auto w-full lg:max-w-[80%]">
            {categories.map((category) => {
              const isSelected = tempSelection.includes(category);
              const isAnimating = animatingItems[category];
              const colors = getCategoryColors(category);
              
              return (
                <div 
                  key={category}
                  className="flex items-center justify-between py-3 pr-3 pl-8 cursor-pointer relative overflow-hidden"
                  style={{ 
                    borderRadius: '4px 999px 999px 4px',
                    backgroundColor: 'hsl(0 0% 10%)',
                    transformOrigin: 'left',
                    animation: isAnimating ? 'item-bounce 350ms cubic-bezier(0.34, 1.8, 0.64, 1)' : undefined
                  }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {/* Color strip - 8px when unselected, full width when selected */}
                  <div 
                    className={`absolute inset-y-0 left-0 ${isSelected ? 'w-full' : 'w-2'}`}
                    style={{ 
                      backgroundColor: colors.cardBg,
                      borderTopLeftRadius: '4px',
                      borderBottomLeftRadius: '4px',
                      borderTopRightRadius: isSelected ? '999px' : '4px',
                      borderBottomRightRadius: isSelected ? '999px' : '4px',
                      transformOrigin: 'left',
                      willChange: 'width',
                      animation: isAnimating ? 'strip-expand-bounce 350ms cubic-bezier(0.34, 1.8, 0.64, 1)' : undefined,
                      transition: !isAnimating && !isSelected ? 'width 250ms ease-out, border-radius 250ms ease-out' : undefined
                    }} 
                  />
                  
                  <span className="font-bold text-sm uppercase tracking-wide relative z-10 transition-colors duration-300" 
                    style={{ color: isSelected ? colors.text : 'white' }}>
                    {category}
                  </span>
                  <div>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => {
                         const newCategories = isSelected 
                           ? tempSelection.filter(c => c !== category)
                           : [...tempSelection, category];
                         setTempSelection(newCategories);
                       }}
                    >
                       <div
                        className={`w-8 h-8 border border-white flex items-center justify-center transition-all ease-out ${isSelected ? 'bg-white duration-100 delay-100' : 'bg-transparent duration-100 hover:bg-white/10'}`}
                         style={{ 
                           width: '32px', 
                           height: '32px', 
                           borderRadius: '32px',
                           outline: '1px solid white',
                           outlineOffset: '0px'
                         }}
                      >
                          {isSelected && (
                            <svg 
                              width="20" 
                              height="20" 
                              viewBox="0 0 16 16" 
                              fill="none"
                            >
                              <path 
                                d="M3 8l3 3 7-7" 
                                stroke="black" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                fill="none"
                              />
                            </svg>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Footer */}
          <div className="app-footer flex-shrink-0 h-5 pb-8 relative z-50">
            <div className="flex justify-center items-center px-4 h-full">
              <a 
                href="mailto:hello@relationshipbydesign.de?subject=Friends%20App%20Frage" 
                className="text-white font-normal text-xs transition-colors duration-500 relative z-50 cursor-pointer"
                style={{fontSize: '14px', lineHeight: '20px', pointerEvents: 'auto'}}
              >
                Frage einreichen
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}