import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
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
import { useTheme } from './theme-provider';

type Theme = 'light' | 'dark' | 'system';

interface ThemeIconProps {
  theme: string;
  size?: number;
}

const ThemeIcon = ({ theme, size = 16 }: ThemeIconProps): JSX.Element => {
  const iconProps = { size };

  switch (theme) {
    case 'light':
      return <Sun {...iconProps} />;
    case 'dark':
      return <Moon {...iconProps} />;
    case 'system':
      return <Monitor {...iconProps} />;
    default:
      return <Sun {...iconProps} />;
  }
};

type ThemeSelectorVariant = 'dropdown' | 'radio' | 'select';

interface ThemeSelectorProps {
  variant?: ThemeSelectorVariant;
}

export const ThemeSelector = ({ variant = 'dropdown' }: ThemeSelectorProps): JSX.Element => {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: Theme; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ];

  // Clean dropdown for navbar - icon only button with dropdown
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
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
      <div className="grid grid-cols-3 gap-4">
        {themes.map((themeOption) => (
          <Button
            key={themeOption.value}
            variant={theme === themeOption.value ? 'default' : 'outline'}
            size="lg"
            onClick={() => setTheme(themeOption.value)}
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
    <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
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