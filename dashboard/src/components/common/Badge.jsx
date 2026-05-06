const variantStyles = {
  blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  yellow: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20',
  red: 'bg-accent-red/10 text-accent-red border-accent-red/20',
  purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
  gray: 'bg-bg-tertiary/50 text-text-secondary border-bg-tertiary',
};

export default function Badge({ children, variant = 'blue', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
