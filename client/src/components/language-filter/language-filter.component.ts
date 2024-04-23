import { Component, EventEmitter, Output } from "@angular/core";

@Component({
	selector: "app-language-filter",
	templateUrl: "./language-filter.component.html",
	styleUrls: ["./language-filter.component.scss"],
})
export class LanguageFilterComponent {
	selectedRegion: string | null = "none";
	languageToSearch = "";
	@Output("onSearchLanguage") onSearchLanguage: EventEmitter<any> =
		new EventEmitter();

	constructor() {}

	searchLanguage(): void {
		this.onSearchLanguage.emit({
			region: this.selectedRegion,
			language: this.languageToSearch,
		});
	}
}
