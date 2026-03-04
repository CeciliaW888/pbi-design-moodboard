import { motion } from 'framer-motion';

const BLOB_PATH = 'M45 8C62 8 78 16 82 30C86 44 80 58 68 66C56 74 34 74 22 66C10 58 4 44 8 30C12 16 28 8 45 8Z';

const blinkVariants = {
  animate: {
    scaleY: [1, 1, 0.05, 1, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.4, 0.5, 0.6, 1],
      repeat: Infinity,
      repeatDelay: 3.5,
    },
  },
};

const breatheVariants = {
  animate: {
    scaleY: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const wiggleVariants = {
  hover: {
    rotate: [-3, 3, -2, 2, 0],
    transition: { duration: 0.5 },
  },
};

const squishVariants = {
  hover: {
    scaleX: 1.08,
    scaleY: 0.94,
    transition: { type: 'spring', stiffness: 300, damping: 10 },
  },
};

function ThinkingDots() {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={36 + i * 9}
          cy={6}
          r={2.2}
          fill="currentColor"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: [0, 1, 0], y: [4, 0, 4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </g>
  );
}

function WaveArm() {
  return (
    <motion.path
      d="M72 42C76 38 82 34 84 30"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, -15, 15, -10, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
      style={{ originX: '72px', originY: '42px' }}
    />
  );
}

const SMILE_PATHS = {
  idle: 'M38 48C40 51 50 51 52 48',
  happy: 'M35 47C38 53 52 53 55 47',
  thinking: 'M39 49L51 49',
  wave: 'M36 47C39 52 51 52 54 47',
};

export default function DittoMascot({
  expression = 'idle',
  size = 80,
  animate = true,
  className = '',
}) {
  const smilePath = SMILE_PATHS[expression] || SMILE_PATHS.idle;
  const eyeRadius = expression === 'happy' ? { rx: 2.8, ry: 3 } : { rx: 2.5, ry: 2.8 };

  return (
    <motion.svg
      viewBox="0 0 90 80"
      width={size}
      height={size * (80 / 90)}
      className={`text-text ${className}`}
      whileHover="hover"
      role="img"
      aria-label="Ditto mascot"
    >
      {/* Body group — breathe + wiggle */}
      <motion.g
        variants={wiggleVariants}
        animate={animate ? 'animate' : undefined}
        style={{ originX: '45px', originY: '40px' }}
      >
        <motion.g
          variants={animate ? breatheVariants : undefined}
          animate={animate ? 'animate' : undefined}
          style={{ originX: '45px', originY: '70px' }}
        >
          {/* Blob body */}
          <motion.path
            d={BLOB_PATH}
            fill="rgba(0, 120, 212, 0.08)"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={squishVariants}
            style={{ originX: '45px', originY: '40px' }}
          />
        </motion.g>

        {/* Face group */}
        <g>
          {/* Left eye */}
          <motion.ellipse
            cx={37}
            cy={38}
            {...eyeRadius}
            fill="currentColor"
            variants={animate ? blinkVariants : undefined}
            animate={animate ? 'animate' : undefined}
            style={{ originX: '37px', originY: '38px' }}
          />
          {/* Right eye */}
          <motion.ellipse
            cx={53}
            cy={38}
            {...eyeRadius}
            fill="currentColor"
            variants={animate ? blinkVariants : undefined}
            animate={animate ? 'animate' : undefined}
            style={{ originX: '53px', originY: '38px' }}
          />
          {/* Mouth */}
          <motion.path
            d={smilePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </g>

        {/* Expression extras */}
        {expression === 'thinking' && <ThinkingDots />}
        {expression === 'wave' && <WaveArm />}
      </motion.g>
    </motion.svg>
  );
}
