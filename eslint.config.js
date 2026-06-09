import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['dist', 'node_modules', 'coverage', 'test-results', 'playwright-report']
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly'
      }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        sessionStorage: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        HTMLFormElement: 'readonly',
        HTMLInputElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MouseEvent: 'readonly',
        IntersectionObserver: 'readonly',
        clearTimeout: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        setInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        console: 'readonly',
        module: 'readonly'
      }
    }
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    languageOptions: {
      globals: {
        expect: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    }
  }
);
