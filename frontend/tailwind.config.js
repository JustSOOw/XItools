/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主题颜色 - 使用CSS变量
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          50: '#EBEAFD',
          100: '#D7D5FB',
          200: '#AFAAF7',
          300: '#867FF3',
          400: '#5E54EF',
          500: 'rgb(var(--color-primary))',
          600: '#3F37BC',
          700: '#2F2893',
          800: '#201B6A',
          900: '#100D41',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary))',
          50: '#E7F9F4',
          100: '#CFF3E9',
          200: '#9FE7D3',
          300: '#6FDCBE',
          400: '#3FD0A8',
          500: 'rgb(var(--color-secondary))',
          600: '#0E9C6D',
          700: '#0B7F59',
          800: '#086245',
          900: '#054531',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent))',
          50: '#FEF5E7',
          100: '#FEEBD0',
          200: '#FCD7A1',
          300: '#FAC272',
          400: '#F7AE43',
          500: 'rgb(var(--color-accent))',
          600: '#C57D09',
          700: '#955D07',
          800: '#643E04',
          900: '#321F02',
        },
        // 使用CSS变量的主题颜色
        success: 'rgb(var(--color-success))',
        warning: 'rgb(var(--color-warning))',
        error: 'rgb(var(--color-error))',
        background: 'rgb(var(--color-background))',
        surface: 'rgb(var(--color-surface))',
        'text-primary': 'rgb(var(--color-text-primary))',
        'text-secondary': 'rgb(var(--color-text-secondary))',

        // 深色主题 (Dark Theme)
        dark: {
          primary: '#6366F1',
          secondary: '#34D399',
          accent: '#FBBF24',
          background: '#1F2937',
          surface: '#374151',
          'text-primary': '#F9FAFB',
          'text-secondary': '#D1D5DB',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
        },

        // 柔和主题 (Soft Theme)
        soft: {
          primary: '#F6D365',
          secondary: '#FDA085',
          accent: '#A1C4FD',
          background: '#FFFFFF',
          surface: '#FFF5E1',
          'text-primary': '#333333',
          'text-secondary': '#555555',
          success: '#A3E635',
          warning: '#FACC15',
          error: '#F47272',
        },

        // 艺术主题 (Artistic Theme)
        artistic: {
          primary: '#8E44AD',
          secondary: '#3498DB',
          accent: '#E74C3C',
          background: '#FCF3CF',
          surface: '#FDFEFE',
          'text-primary': '#2C3E50',
          'text-secondary': '#7F8C8D',
          success: '#27AE60',
          warning: '#F1C40F',
          error: '#C0392B',
        },
        
        // 通用 UI 元素颜色
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // 卡片背景色 - 使用CSS变量
        'card-bg': {
          default: 'rgb(var(--card-bg-default))',
          gray: 'rgb(var(--card-bg-gray))',
          blue: 'rgb(var(--card-bg-blue))',
          green: 'rgb(var(--card-bg-green))',
          purple: 'rgb(var(--card-bg-purple))',
          yellow: 'rgb(var(--card-bg-yellow))',
          red: 'rgb(var(--card-bg-red))',
          orange: 'rgb(var(--card-bg-orange))',
          cyan: 'rgb(var(--card-bg-cyan))',
          pink: 'rgb(var(--card-bg-pink))',
          sky: 'rgb(var(--card-bg-sky))',
          grass: 'rgb(var(--card-bg-grass))',
          lavender: 'rgb(var(--card-bg-lavender))',
          lemon: 'rgb(var(--card-bg-lemon))',
          coral: 'rgb(var(--card-bg-coral))',
          apricot: 'rgb(var(--card-bg-apricot))',
          aqua: 'rgb(var(--card-bg-aqua))',
          rose: 'rgb(var(--card-bg-rose))',
        },

        // 看板背景色
        'board-bg': 'var(--board-background-color)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // 添加毛玻璃效果相关配置
      backdropBlur: {
        'card': 'var(--card-blur)',
      },
      backgroundColor: {
        'card-light': 'rgba(255, 255, 255, var(--card-bg-opacity-light))',
        'card-dark': 'rgba(31, 41, 55, var(--card-bg-opacity-dark))',
      },
    },
  },
  plugins: [],
}

 