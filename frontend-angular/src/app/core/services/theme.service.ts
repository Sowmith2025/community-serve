import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private storageKey = 'prefers-dark-theme';

	constructor() {
		const saved = localStorage.getItem(this.storageKey);
		if (saved === 'true') {
			this.applyDark(true);
		}
	}

	isDark(): boolean {
		return document.body.classList.contains('dark-theme');
	}

	toggle(): void {
		this.applyDark(!this.isDark());
	}

	setDark(enable: boolean): void {
		this.applyDark(enable);
	}

	private applyDark(enable: boolean): void {
		if (enable) {
			document.body.classList.add('dark-theme');
			localStorage.setItem(this.storageKey, 'true');
		} else {
			document.body.classList.remove('dark-theme');
			localStorage.setItem(this.storageKey, 'false');
		}
	}
}


