export interface LoadingShimmerProps {
  lines?: number;
  className?: string;
}

export function LoadingShimmer({ lines = 3, className = '' }: LoadingShimmerProps) {
  return (
    <div className={`loading-shimmer ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className="loading-shimmer__line"
          style={{ 
            width: index === lines - 1 ? '60%' : '100%',
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}