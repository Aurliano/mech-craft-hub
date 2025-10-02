import React from 'react';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '@/lib/passwordValidation';

interface PasswordStrengthProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password, 
  showDetails = true 
}) => {
  if (!password) return null;

  const validation = validatePassword(password);
  const strengthColor = getPasswordStrengthColor(validation.strength);
  const strengthText = getPasswordStrengthText(validation.strength);

  return (
    <div className="space-y-2">
      {/* Strength indicator */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              validation.strength === 'weak' ? 'bg-red-500' :
              validation.strength === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${strengthColor}`}>
          {strengthText}
        </span>
        <span className="text-xs text-gray-500">
          {validation.score}/100
        </span>
      </div>

      {/* Detailed feedback */}
      {showDetails && (
        <div className="space-y-1">
          {validation.errors.length > 0 ? (
            <div className="text-sm">
              <p className="text-red-600 font-medium mb-1">نیاز به بهبود:</p>
              <ul className="list-disc list-inside space-y-1 text-red-500">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-xs">{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-green-600 text-sm font-medium">
              ✓ رمز عبور قوی و امن است
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
