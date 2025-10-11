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
        return { bg: 'hsl(240 100% 50%)', text: 'hsl(240 100% 20%)' };
      case 'fuck':
        return { bg: 'hsl(0 100% 50%)', text: 'hsl(0 100% 20%)' };
      case 'identity':
        return { bg: 'hsl(266 100% 51%)', text: 'hsl(266 100% 20%)' };
      case 'party':
        return { bg: 'hsl(60 100% 71%)', text: 'hsl(60 100% 20%)' };
      case 'wer aus der runde':
        return { bg: 'hsl(180 100% 50%)', text: 'hsl(180 100% 20%)' };
      case 'friends':
        return { bg: 'hsl(120 100% 50%)', text: 'hsl(120 100% 20%)' };
      case 'self reflection':
        return { bg: 'hsl(195 100% 50%)', text: 'hsl(195 100% 20%)' };
      case 'family':
        return { bg: 'hsl(30 100% 70%)', text: 'hsl(30 100% 20%)' };
      case 'career':
        return { bg: 'hsl(35 100% 62%)', text: 'hsl(35 100% 20%)' };
      case 'travel':
        return { bg: 'hsl(92 100% 83%)', text: 'hsl(92 100% 20%)' };
      case 'health':
        return { bg: 'hsl(330 84% 67%)', text: 'hsl(330 84% 20%)' };
      case 'money':
        return { bg: 'hsl(45 95% 55%)', text: 'hsl(45 95% 20%)' };
      case 'love':
        return { bg: 'hsl(350 85% 60%)', text: 'hsl(350 85% 20%)' };
      case 'hobby':
        return { bg: 'hsl(25 60% 45%)', text: 'hsl(25 60% 15%)' };
      case 'dreams':
        return { bg: 'hsl(270 75% 65%)', text: 'hsl(270 75% 20%)' };
      case 'fear':
        return { bg: 'hsl(210 10% 40%)', text: 'hsl(210 10% 15%)' };
      case 'wisdom':
        return { bg: 'hsl(239 84% 67%)', text: 'hsl(239 84% 20%)' };
      case 'future':
        return { bg: 'hsl(199 89% 48%)', text: 'hsl(199 89% 20%)' };
      default:
        return { bg: 'hsl(290 100% 85%)', text: 'hsl(290 100% 20%)' };
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
          <div className="absolute top-4 left-4 right-4 z-10 flex items-baseline justify-between">
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
          <div className="flex-1 p-4 pt-20 space-y-3 overflow-y-auto max-w-[500px] mx-auto w-full">
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