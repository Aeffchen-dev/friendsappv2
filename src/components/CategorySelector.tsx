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

  // Update temp selection when selectedCategories prop changes
  useEffect(() => {
    setTempSelection(selectedCategories);
  }, [selectedCategories]);

  const getCategoryColors = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    switch (categoryLower) {
      case 'connection':
        return { bg: 'hsl(var(--connection-500))', text: 'hsl(var(--connection-900))' };
      case 'fuck':
        return { bg: 'hsl(var(--fuck-500))', text: 'hsl(var(--fuck-900))' };
      case 'identity':
        return { bg: 'hsl(var(--identity-500))', text: 'hsl(var(--identity-900))' };
      case 'party':
        return { bg: 'hsl(var(--party-500))', text: 'hsl(var(--party-900))' };
      case 'wer aus der runde':
        return { bg: 'hsl(var(--wer-aus-der-runde-500))', text: 'hsl(var(--wer-aus-der-runde-900))' };
      case 'friends':
        return { bg: 'hsl(var(--friends-500))', text: 'hsl(var(--friends-900))' };
      case 'self reflection':
        return { bg: 'hsl(var(--self-reflection-500))', text: 'hsl(var(--self-reflection-900))' };
      case 'family':
        return { bg: 'hsl(var(--family-500))', text: 'hsl(var(--family-900))' };
      case 'career':
        return { bg: 'hsl(var(--career-500))', text: 'hsl(var(--career-900))' };
      case 'travel':
        return { bg: 'hsl(var(--travel-500))', text: 'hsl(var(--travel-900))' };
      case 'health':
        return { bg: 'hsl(var(--health-500))', text: 'hsl(var(--health-900))' };
      case 'money':
        return { bg: 'hsl(var(--money-500))', text: 'hsl(var(--money-900))' };
      case 'love':
        return { bg: 'hsl(var(--love-500))', text: 'hsl(var(--love-900))' };
      case 'hobby':
        return { bg: 'hsl(var(--hobby-500))', text: 'hsl(var(--hobby-900))' };
      case 'dreams':
        return { bg: 'hsl(var(--dreams-500))', text: 'hsl(var(--dreams-900))' };
      case 'fear':
        return { bg: 'hsl(var(--fear-500))', text: 'hsl(var(--fear-900))' };
      case 'wisdom':
        return { bg: 'hsl(var(--wisdom-500))', text: 'hsl(var(--wisdom-900))' };
      case 'future':
        return { bg: 'hsl(var(--future-500))', text: 'hsl(var(--future-900))' };
      default:
        return { bg: 'hsl(var(--quiz-category-bg))', text: 'hsl(var(--quiz-category-text))' };
    }
  };


  const handleCategoryToggle = (category: string) => {
    setTempSelection(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
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
          <div className="absolute top-4 left-8 right-8 z-10 flex items-baseline justify-between">
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
          <div className="flex-1 pr-8 pt-32 pb-8 space-y-3 overflow-y-auto w-full lg:max-w-[80%]">
            {categories.map((category) => {
              const isSelected = tempSelection.includes(category);
              const colors = getCategoryColors(category);
              
              return (
                <div 
                  key={category}
                  className="flex items-center justify-between py-3 pr-3 pl-6 bg-[#161616] cursor-pointer relative overflow-hidden"
                  style={{ borderRadius: '4px 999px 999px 4px' }}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {/* Color strip - 8px when unselected, full width when selected */}
                  <div 
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${isSelected ? 'w-full' : 'w-2'}`}
                    style={{ 
                      backgroundColor: colors.bg,
                      borderTopLeftRadius: isSelected ? '4px' : '4px',
                      borderBottomLeftRadius: isSelected ? '4px' : '4px',
                      borderTopRightRadius: isSelected ? '999px' : '4px',
                      borderBottomRightRadius: isSelected ? '999px' : '4px'
                    }} 
                  />
                  
                  <span className="font-bold text-sm uppercase tracking-wide relative z-10 transition-colors duration-300" 
                    style={{ color: isSelected ? colors.text : 'white' }}>
                    {category}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
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
                        className={`w-8 h-8 border border-white flex items-center justify-center transition-all ease-out ${isSelected ? 'bg-white duration-300 delay-200' : 'bg-transparent duration-100 hover:bg-white/10'}`}
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
                             className="checkmark-animate"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}