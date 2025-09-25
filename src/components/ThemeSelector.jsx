import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
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
    default:
      return <Sun {...iconProps} />;
  }
};

ThemeIcon.propTypes = {
  theme: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export const ThemeSelector = ({ variant = 'dropdown' }) => {
  const { theme, themes, changeTheme } = useTheme();

  // Clean dropdown for navbar - icon only button with dropdown
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ThemeIcon theme={theme} size={18} />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => changeTheme(themeOption.value)}
              className="cursor-pointer"
            >
              <ThemeIcon theme={themeOption.value} />
              <span className="ml-2">{themeOption.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Radio button group for preferences page
  if (variant === 'radio') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {themes.map((themeOption) => (
          <Button
            key={themeOption.value}
            variant={theme === themeOption.value ? 'default' : 'outline'}
            size="lg"
            onClick={() => changeTheme(themeOption.value)}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <ThemeIcon theme={themeOption.value} size={24} />
            <span className="text-sm font-medium">{themeOption.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  // Select for preferences page (fallback)
  return (
    <Select value={theme} onValueChange={changeTheme}>
      <SelectTrigger className="w-full">
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
              <span>{themeOption.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

ThemeSelector.propTypes = {
  variant: PropTypes.oneOf(['dropdown', 'radio', 'select']),
};