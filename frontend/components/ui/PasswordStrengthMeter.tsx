import React from "react";

export function PasswordStrengthMeter({ password }: { password: string }) {
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    // Max score is 5 from checks, but the requested scale is 0-4.
    // Length >=8, Uppercase, Lowercase, Number, Special character
    // We cap it at 4 to match the 0-4 scale request: Weak, Fair, Good, Strong, Very Strong
    return Math.min(score > 0 ? score - 1 : 0, 4);
  };

  const strengthScore = calculateStrength(password);

  const getStrengthLabel = (score: number) => {
    if (password.length === 0) return "";
    switch (score) {
      case 0: return "Weak";
      case 1: return "Fair";
      case 2: return "Good";
      case 3: return "Strong";
      case 4: return "Very Strong";
      default: return "";
    }
  };

  const getColor = (score: number) => {
    if (password.length === 0) return "bg-slate-200";
    switch (score) {
      case 0: return "bg-red-500";
      case 1: return "bg-orange-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      default: return "bg-slate-200";
    }
  };

  return (
    <div className="w-full mt-2">
      <div className="flex gap-1 mb-1 h-1.5">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-full w-full rounded-full transition-colors duration-300 ${
              password.length > 0 && index <= strengthScore ? getColor(strengthScore) : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-xs font-medium text-right mt-1 ${
          strengthScore <= 1 ? "text-red-500" : 
          strengthScore === 2 ? "text-yellow-600" : 
          "text-green-600"
        }`}>
          {getStrengthLabel(strengthScore)}
        </p>
      )}
    </div>
  );
}
