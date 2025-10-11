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
        {/* Varied curvy horizontal waves with different amplitudes */}
        <path 
          d="M -50 60 Q 75 10, 150 60 Q 225 110, 300 60 Q 375 10, 450 60 Q 525 110, 600 60" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="50"
          strokeLinecap="round"
        />
        <path 
          d="M -50 150 Q 50 110, 125 150 Q 200 190, 275 150 Q 350 110, 425 150 Q 500 190, 600 150" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="50"
          strokeLinecap="round"
        />
        <path 
          d="M -50 240 Q 100 170, 175 240 Q 250 310, 325 240 Q 400 170, 475 240 Q 550 310, 600 240" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="50"
          strokeLinecap="round"
        />
        <path 
          d="M -50 320 Q 60 280, 140 320 Q 220 360, 300 320 Q 380 280, 460 320 Q 540 360, 600 320" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="50"
          strokeLinecap="round"
        />
        <path 
          d="M -50 410 Q 90 340, 160 410 Q 230 480, 310 410 Q 390 340, 470 410 Q 550 480, 600 410" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="50"
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
