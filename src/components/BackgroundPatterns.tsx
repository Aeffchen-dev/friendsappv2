// Background pattern components for quiz cards

interface PatternProps {
  textColor: string;
}

export function CrossPattern({ textColor }: PatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <svg 
        className="absolute" 
        style={{ 
          width: '200%', 
          height: '200%',
          left: '-20%',
          top: '-20%'
        }}
      >
        <line 
          x1="20%" 
          y1="0%" 
          x2="20%" 
          y2="100%" 
          className={textColor}
          strokeWidth="80"
          stroke="currentColor"
        />
        <line 
          x1="0%" 
          y1="30%" 
          x2="100%" 
          y2="30%" 
          className={textColor}
          strokeWidth="80"
          stroke="currentColor"
        />
        <line 
          x1="70%" 
          y1="0%" 
          x2="70%" 
          y2="100%" 
          className={textColor}
          strokeWidth="80"
          stroke="currentColor"
        />
        <line 
          x1="0%" 
          y1="80%" 
          x2="100%" 
          y2="80%" 
          className={textColor}
          strokeWidth="80"
          stroke="currentColor"
        />
      </svg>
    </div>
  );
}

export function CurvyLinesPattern({ textColor }: PatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      <svg 
        className="absolute" 
        style={{ 
          width: '250%', 
          height: '250%',
          left: '-50%',
          top: '-50%'
        }}
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        <path 
          d="M -50 100 Q 50 50, 150 100 T 350 100 T 550 100" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="45"
          strokeLinecap="round"
        />
        <path 
          d="M -50 250 Q 50 200, 150 250 T 350 250 T 550 250" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="45"
          strokeLinecap="round"
        />
        <path 
          d="M 100 -50 Q 50 50, 100 150 T 100 350 T 100 550" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="45"
          strokeLinecap="round"
        />
        <path 
          d="M 300 -50 Q 250 50, 300 150 T 300 350 T 300 550" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="45"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function HalfMoonPattern({ textColor }: PatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-35">
      <svg 
        className="absolute" 
        style={{ 
          width: '300%', 
          height: '300%',
          left: '-80%',
          top: '-80%'
        }}
      >
        {/* Top left cluster */}
        <circle cx="15%" cy="15%" r="120" className={textColor} fill="currentColor" />
        <circle cx="25%" cy="15%" r="120" className={textColor} fill="currentColor" />
        <circle cx="15%" cy="25%" r="120" className={textColor} fill="currentColor" />
        <circle cx="25%" cy="25%" r="120" className={textColor} fill="currentColor" />
        
        {/* Top right cluster */}
        <circle cx="75%" cy="15%" r="120" className={textColor} fill="currentColor" />
        <circle cx="85%" cy="15%" r="120" className={textColor} fill="currentColor" />
        <circle cx="75%" cy="25%" r="120" className={textColor} fill="currentColor" />
        <circle cx="85%" cy="25%" r="120" className={textColor} fill="currentColor" />
        
        {/* Bottom left cluster */}
        <circle cx="15%" cy="75%" r="120" className={textColor} fill="currentColor" />
        <circle cx="25%" cy="75%" r="120" className={textColor} fill="currentColor" />
        <circle cx="15%" cy="85%" r="120" className={textColor} fill="currentColor" />
        <circle cx="25%" cy="85%" r="120" className={textColor} fill="currentColor" />
        
        {/* Bottom right cluster */}
        <circle cx="75%" cy="75%" r="120" className={textColor} fill="currentColor" />
        <circle cx="85%" cy="75%" r="120" className={textColor} fill="currentColor" />
        <circle cx="75%" cy="85%" r="120" className={textColor} fill="currentColor" />
        <circle cx="85%" cy="85%" r="120" className={textColor} fill="currentColor" />
      </svg>
    </div>
  );
}

interface HugeEyesPatternProps extends PatternProps {
  mousePosition: { x: number; y: number };
  pupilDirection: 'left' | 'right' | null;
  isBlinking: boolean;
}

export function HugeEyesPattern({ textColor, mousePosition, pupilDirection, isBlinking }: HugeEyesPatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
      <div className="absolute" style={{ left: '-30%', top: '20%', transform: 'scale(3.5)' }}>
        <HugeEye textColor={textColor} mousePosition={mousePosition} pupilDirection={pupilDirection} isBlinking={isBlinking} />
      </div>
      <div className="absolute" style={{ right: '-30%', top: '20%', transform: 'scale(3.5)' }}>
        <HugeEye textColor={textColor} mousePosition={mousePosition} pupilDirection={pupilDirection} isBlinking={isBlinking} />
      </div>
    </div>
  );
}

interface HugeEyeProps {
  textColor: string;
  mousePosition: { x: number; y: number };
  pupilDirection: 'left' | 'right' | null;
  isBlinking: boolean;
}

function HugeEye({ textColor, mousePosition, pupilDirection, isBlinking }: HugeEyeProps) {
  const getPupilPosition = () => {
    if (pupilDirection === 'left') {
      return { x: -12, y: 0 };
    }
    if (pupilDirection === 'right') {
      return { x: 12, y: 0 };
    }

    const angle = Math.atan2(mousePosition.y - 300, mousePosition.x - 300);
    const distanceX = 18;
    const distanceY = 8;

    return {
      x: Math.cos(angle) * distanceX,
      y: Math.sin(angle) * distanceY
    };
  };

  const pupilPos = getPupilPosition();

  return (
    <div 
      className="relative bg-white rounded-full transition-transform duration-150"
      style={{
        width: '50px',
        height: '140px',
        borderRadius: '50%',
        transform: isBlinking ? 'scaleY(0.1)' : 'scaleY(1)',
      }}
    >
      <div
        className="absolute bg-black rounded-full transition-all duration-75"
        style={{
          width: '22px',
          height: '22px',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${pupilPos.x}px), calc(-50% + ${pupilPos.y}px))`,
          opacity: isBlinking ? 0 : 1
        }}
      />
    </div>
  );
}
