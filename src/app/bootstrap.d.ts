declare module 'bootstrap' {
	export class Modal {
	  constructor(element: Element, options?: any);
	  show(): void;
	  hide(): void;
	  toggle(): void;
	}

	export class Toast {
	  constructor(element: Element, options?: any);
	  show(): void;
	  hide(): void;
	  toggle(): void;
  }
}