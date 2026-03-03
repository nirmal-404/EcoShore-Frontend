const Spinner = ({ size = 40, color = 'border-blue-500', className = '' }) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent ${color} ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default Spinner;
