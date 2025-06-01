interface AvatarTextProps {
  name: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

const sizeClasses = {
  small: "h-8 w-8 text-xs",
  medium: "h-10 w-10 text-sm",
  large: "h-12 w-12 text-base",
};

const AvatarText: React.FC<AvatarTextProps> = ({ 
  name, 
  className = "", 
  size = "medium" 
}) => {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent pastel color based on the name
  const getColorClass = (name: string) => {
    const colors = [
      "bg-brand-100 text-brand-600",
      "bg-pink-100 text-pink-600",
      "bg-cyan-100 text-cyan-600",
      "bg-orange-100 text-orange-600",
      "bg-green-100 text-green-600",
      "bg-purple-100 text-purple-600",
      "bg-yellow-100 text-yellow-600",
      "bg-error-100 text-error-600",
    ];

    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full flex-shrink-0 ${sizeClasses[size]} ${getColorClass(name)} ${className}`}
    >
      <span className="font-medium">{initials}</span>
    </div>
  );
};

export default AvatarText;
