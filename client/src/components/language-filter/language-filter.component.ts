import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
	selector: "app-language-filter",
	templateUrl: "./language-filter.component.html",
	styleUrls: ["./language-filter.component.scss"],
})
export class LanguageFilterComponent implements OnInit {
	selectedRegion = "none";
	languageToSearch = "";
	@Output("onSearchLanguage") onSearchLanguage: EventEmitter<any> =
		new EventEmitter();

	constructor() {}

	ngOnInit(): void {}

	searchLanguage(): void {
		// this.onSearchLanguage.emit({
		// 	region: this.selectedRegion,
		// 	language: this.languageToSearch,
		// });
		this.onSearchLanguage.emit();
	}
}
