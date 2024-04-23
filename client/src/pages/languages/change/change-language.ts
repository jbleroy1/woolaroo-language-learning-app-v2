import { AfterViewInit, Component, Inject, ViewChild } from "@angular/core";
import { CameraPreviewComponent } from "../../../components/camera-preview/camera-preview";
import { I18nService, Language } from "../../../i18n/i18n.service";
import {
	EndangeredLanguage,
	EndangeredLanguageService,
} from "../../../services/endangered-language";
import { Router } from "@angular/router";
import { loadCapturePageURL } from "../../../util/camera";
import { AppRoutes } from "../../../app/routes";
import { IProfileService, PROFILE_SERVICE } from "../../../services/profile";
import { getLogger } from "../../../util/logging";

const logger = getLogger("ChangeLanguagePageComponent");

@Component({
	selector: "app-change-language",
	templateUrl: "./change-language.html",
	styleUrls: ["./change-language.scss"],
})
export class ChangeLanguagePageComponent implements AfterViewInit {
	showResults = false;
	endangeredLanguages: EndangeredLanguage[] =
		this.endangeredLanguageService.languages;

	@ViewChild(CameraPreviewComponent)
	private cameraPreview: CameraPreviewComponent | null = null;

	public get uiLanguages(): Language[] {
		return this.i18nService.languages;
	}

	private _currentUILanguageIndex = 0;
	public get currentUILanguageIndex(): number {
		return this._currentUILanguageIndex;
	}

	private _currentEndangeredLanguageIndex = 0;
	public get currentEndangeredLanguageIndex(): number {
		return this._currentEndangeredLanguageIndex;
	}

	public get currentEndangeredLanguageDescriptionKey(): string {
		console.log(this.endangeredLanguages);
		console.log(this._currentEndangeredLanguageIndex);

		const code =
			this.endangeredLanguages[this._currentEndangeredLanguageIndex].code;
		return `shortDescription_${code}`;
	}

	constructor(
		private router: Router,
		private i18nService: I18nService,
		@Inject(PROFILE_SERVICE) private profileService: IProfileService,
		private endangeredLanguageService: EndangeredLanguageService
	) {
		this._currentUILanguageIndex = this.i18nService.languages.indexOf(
			this.i18nService.currentLanguage
		);

		this._currentEndangeredLanguageIndex =
			this.endangeredLanguageService.languages.indexOf(
				this.endangeredLanguageService.currentLanguage
			);
	}

	ngAfterViewInit() {
		if (!this.cameraPreview) {
			logger.error("Camera preview not found");
		} else {
			this.cameraPreview.start().then(
				() => logger.log("Camera started"),
				(err) => logger.warn("Error starting camera", err)
			);
		}
	}

	onUILanguageChanged(index: number) {
		this._currentUILanguageIndex = index;
		this.i18nService.setLanguage(this.i18nService.languages[index].code);
	}

	onEndangeredLanguageChanged(index: number) {
		let _index = index;

		console.log("on andangered language changed");

		console.log(this.endangeredLanguageService.languages, index);

		if (index > this.endangeredLanguages.length) {
			_index = 0;
		}

		this._currentEndangeredLanguageIndex = _index;
		this.endangeredLanguageService.setLanguage(
			this.endangeredLanguageService.languages[_index]?.code
		);
	}

	onCloseClick() {
		loadCapturePageURL().then(
			(url) => this.router.navigateByUrl(url),
			() => this.router.navigateByUrl(AppRoutes.CaptureImage)
		);
	}

	onNextClick() {
		this.saveSelectedLanguages().finally(() => {
			loadCapturePageURL().then(
				(url) => this.router.navigateByUrl(url),
				() => this.router.navigateByUrl(AppRoutes.CaptureImage)
			);
		});
	}

	async saveSelectedLanguages() {
		// save the language preferences, in case use did not change language
		const profile = await this.profileService.loadProfile();
		profile.language =
			this.i18nService.languages[this.currentUILanguageIndex].code;
		profile.endangeredLanguage =
			this.endangeredLanguageService.languages[
				this.currentEndangeredLanguageIndex
			].code;
		await this.profileService.saveProfile(profile);
	}

	onSearchLanguage(e: any) {
		console.log("on search", e);

		if (e.region !== "none") {
			this.endangeredLanguages =
				this.endangeredLanguageService.languages.filter((lan) =>
					lan.code.includes(e.region)
				);
		}

		if (e.language !== "none") {
			let _endangeredLanguages =
				this.endangeredLanguageService.languages.filter((lan) =>
					lan.name.includes(e.language)
				);

			if (_endangeredLanguages.length === 0) {
				this.endangeredLanguages =
					this.endangeredLanguageService.languages;
			} else {
				this.endangeredLanguages = _endangeredLanguages;
			}
		}

		this.showResults = !this.showResults;
	}
}
