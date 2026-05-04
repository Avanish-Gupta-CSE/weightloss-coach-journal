import { motion } from 'framer-motion';

export default function Card({ children, className = '', title, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-bg-secondary rounded-xl border border-bg-tertiary/50 p-5 ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="w-5 h-5 text-accent-blue" />}
          {title && <h3 className="text-text-primary font-semibold text-base">{title}</h3>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
