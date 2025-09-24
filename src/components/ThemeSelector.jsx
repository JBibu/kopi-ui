import React from 'react';
import PropTypes from 'prop-types';
import { Palette, Sun, Moon, Waves, Heart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';

const ThemeIcon = ({ theme, size = 16 }) => {
  const iconProps = { size };

  switch (theme) {
    case 'light':
      return <Sun {...iconProps} />;
    case 'dark':
      return <Moon {...iconProps} />;
    case 'ocean':
      return <Waves {...iconProps} />;
    case 'pastel':
      return <Heart {...iconProps} />;
    default:
      return <Palette {...iconProps} />;
  }
};

ThemeIcon.propTypes = {
  theme: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export const ThemeSelector = ({ variant = 'select' }) => {
  const { theme, themes, changeTheme } = useTheme();

  if (variant === 'buttons') {
    return (
      <div className="flex gap-2">
        {themes.map((themeOption) => (
          <Button
            key={themeOption.value}
            variant={theme === themeOption.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeTheme(themeOption.value)}
            className="flex items-center gap-2"
          >
            <ThemeIcon theme={themeOption.value} />
            {themeOption.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4" />
      <Select value={theme} onValueChange={changeTheme}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <ThemeIcon theme={theme} />
              {themes.find(t => t.value === theme)?.label}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {themes.map((themeOption) => (
            <SelectItem key={themeOption.value} value={themeOption.value}>
              <div className="flex items-center gap-2">
                <ThemeIcon theme={themeOption.value} />
                <div>
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-xs text-muted-foreground">{themeOption.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

ThemeSelector.propTypes = {
  variant: PropTypes.oneOf(['select', 'buttons']),
};