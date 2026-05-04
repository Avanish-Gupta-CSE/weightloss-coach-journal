export default function ProgressBar({ value, max = 100, color = 'accent-blue', size = 'md', showLabel = true }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  const colorClasses = {
    'accent-blue': 'bg-accent-blue',
    'accent-green': 'bg-accent-green',
    'accent-yellow': 'bg-accent-yellow',
    'accent-red': 'bg-accent-red',
    'accent-purple': 'bg-accent-purple',
    'accent-orange': 'bg-accent-orange',
  };
  
  return (
    <div className="w-full">
      <div className={`w-full bg-bg-tertiary rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} rounded-full transition-all duration-500 ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-text-muted text-xs">{value} / {max}</span>
          <span className="text-text-muted text-xs">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
