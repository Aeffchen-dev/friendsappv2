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
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
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
        {/* Organic blob-like curvy shapes */}
        <path 
          d="M -50 100 Q 50 30, 120 90 Q 190 150, 120 210 Q 50 270, -50 200 Q -100 130, -50 100" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="55"
          strokeLinecap="round"
        />
        <path 
          d="M 350 50 Q 420 20, 480 80 Q 540 140, 480 200 Q 420 260, 350 230 Q 300 170, 350 50" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="55"
          strokeLinecap="round"
        />
        <path 
          d="M 150 350 Q 220 320, 280 380 Q 340 440, 280 500 Q 220 560, 150 530 Q 100 470, 150 350" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="55"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function CurvyLinesPattern2({ textColor }: PatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      <svg 
        className="absolute" 
        style={{ 
          width: '220%', 
          height: '220%',
          left: '-40%',
          top: '-40%'
        }}
        viewBox="0 0 500 500"
        preserveAspectRatio="none"
      >
        {/* Wavy horizontal blobs */}
        <path 
          d="M -50 150 Q 100 80, 200 150 Q 300 220, 400 150 Q 500 80, 600 150" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="60"
          strokeLinecap="round"
        />
        <path 
          d="M -50 350 Q 80 270, 180 350 Q 280 430, 380 350 Q 480 270, 600 350" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="60"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function CurvyLinesPattern3({ textColor }: PatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      <svg 
        className="absolute" 
        style={{ 
          width: '200%', 
          height: '200%',
          left: '-35%',
          top: '-35%'
        }}
        viewBox="0 0 500 500"
        preserveAspectRatio="none"
      >
        {/* S-curve blobs */}
        <path 
          d="M 100 -50 Q 50 100, 100 200 Q 150 300, 100 400 Q 50 500, 100 600" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="58"
          strokeLinecap="round"
        />
        <path 
          d="M 350 -50 Q 300 100, 350 200 Q 400 300, 350 400 Q 300 500, 350 600" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="58"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function CurvyLinesPattern4({ textColor }: PatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      <svg 
        className="absolute" 
        style={{ 
          width: '210%', 
          height: '210%',
          left: '-30%',
          top: '-30%'
        }}
        viewBox="0 0 500 500"
        preserveAspectRatio="none"
      >
        {/* Circular organic blobs */}
        <path 
          d="M 250 50 Q 350 100, 350 200 Q 350 300, 250 350 Q 150 300, 150 200 Q 150 100, 250 50" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="62"
          strokeLinecap="round"
        />
        <path 
          d="M 80 80 Q 20 150, 80 220 Q 140 290, 80 360" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="62"
          strokeLinecap="round"
        />
        <path 
          d="M 420 80 Q 480 150, 420 220 Q 360 290, 420 360" 
          fill="none"
          className={textColor}
          stroke="currentColor"
          strokeWidth="62"
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
