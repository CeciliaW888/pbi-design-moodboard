import { motion } from 'framer-motion';

export default function PathCard({
  icon: Icon,
  iconGradient,
  title,
  description,
  buttonText,
  buttonVariant = 'primary',
  onClick,
  delay = 0,
}) {
  const isPrimary = buttonVariant === 'primary';

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className="group flex flex-col items-center text-center p-8 bg-surface-light border border-surface-lighter rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center mb-5`}>
        <Icon size={28} className="text-white" />
      </div>

      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-muted mb-6 leading-relaxed">{description}</p>

      <span
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isPrimary
            ? 'bg-primary text-white group-hover:bg-primary-dark'
            : 'border border-surface-lighter text-text group-hover:border-primary/40 group-hover:text-primary'
        }`}
      >
        {buttonText}
      </span>
    </motion.button>
  );
}
