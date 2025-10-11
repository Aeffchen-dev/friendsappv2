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
          width: '200%', 
          height: '200%',
          left: '-30%',
          top: '-30%'
        }}
        viewBox="0 0 500 500"
        preserveAspectRatio="none"
      >
        {/* More curvy horizontal waves */}
        <path 
          d="M -50 80 Q 75 20, 150 80 Q 225 140, 300 80 Q 375 20, 450 80 Q 525 140, 600 80" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="70"
          strokeLinecap="round"
        />
        <path 
          d="M -50 200 Q 75 140, 150 200 Q 225 260, 300 200 Q 375 140, 450 200 Q 525 260, 600 200" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="70"
          strokeLinecap="round"
        />
        <path 
          d="M -50 320 Q 75 260, 150 320 Q 225 380, 300 320 Q 375 260, 450 320 Q 525 380, 600 320" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="70"
          strokeLinecap="round"
        />
        <path 
          d="M -50 440 Q 75 380, 150 440 Q 225 500, 300 440 Q 375 380, 450 440 Q 525 500, 600 440" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="70"
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
