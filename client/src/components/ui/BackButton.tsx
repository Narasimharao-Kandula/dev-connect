import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Button from './Button';

interface BackButtonProps {
  className?: string;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ className, label = 'Back' }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1 text-text-secondary hover:text-primary ${className}`}
      onClick={() => navigate(-1)}
      aria-label="Go back"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};
