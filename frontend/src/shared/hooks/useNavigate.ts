import type { Page } from "../../core/types";

let navigateCallback: ((page: Page) => void) | null = null;

export function setNavigateCallback(callback: (page: Page) => void) {
  navigateCallback = callback;
}

export function useNavigate() {
  return (page: Page) => {
    if (navigateCallback) {
      navigateCallback(page);
    }
  };
}
