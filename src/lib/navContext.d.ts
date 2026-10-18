export const LANGUAGES: string[];
export function useNav(): {
  page: string;
  setPage: (page: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
};
export const NavProvider: React.FC<{ children: React.ReactNode }>;
