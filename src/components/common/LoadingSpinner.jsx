const Spinner = ({
  size = 40,
  color = 'border-primary',
  className = '',
  fullPage = false,
}) => {
  const spinnerContent = (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Glow / Ring */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin opacity-20 ${color}`}
        style={{ borderStyle: 'solid' }}
      />
      {/* Inner Active Ring */}
      <div
        className={`absolute inset-0 rounded-full border-4 border-transparent border-t-current animate-spin ${color}`}
        style={{ animationDuration: '0.8s' }}
      />
      {/* Small Center Dot */}
      <div
        className={`w-1 h-1 rounded-full ${color.replace('border-', 'bg-')} animate-pulse`}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full h-full min-h-[70vh] animate-in fade-in duration-500">
        <div className="relative p-10 rounded-3xl bg-background/40 backdrop-blur-md border border-border/50 shadow-2xl flex flex-col items-center justify-center">
          {spinnerContent}
          <p className="mt-6 text-sm font-semibold tracking-wider text-muted-foreground uppercase animate-pulse">
            Loading Content
          </p>
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default Spinner;
