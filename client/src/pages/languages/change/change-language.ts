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
interface PersistHistory {
	image: Blob;
	imageURL: string;
	words: string[];
	selectedWordIndex: number;
}

const logger = getLogger("ChangeLanguagePageComponent");

@Component({
	selector: "app-change-language",
	templateUrl: "./change-language.html",
	styleUrls: ["./change-language.scss"],
})
export class ChangeLanguagePageComponent implements AfterViewInit {
	showResults = true;
	private allLanguages: EndangeredLanguage[] = [];
	private _persistedHistory: PersistHistory = {} as PersistHistory;
	allRegions = [
		{ name: "Asia", code: "Asia" },
		{ name: "Africa", code: "Africa" },
		{ name: "Europe", code: "Europe" },
		{ name: "North America", code: "North America" },
		{ name: "South America", code: "South America" },
		{ name: "Oceania", code: "Oceania" },
	];

	public get endangeredLanguages(): EndangeredLanguage[] {
		return this.endangeredLanguageService.languages;
	}

	@ViewChild(CameraPreviewComponent)
	private cameraPreview: CameraPreviewComponent | null = null;

	public get uiLanguages(): Language[] {
		return this.i18nService.languages;
	}

	public get imageUrl(): string | null {
		return this._persistedHistory.imageURL || null;
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

		this.allLanguages = this._sortLanguages(
			this.endangeredLanguageService.languages
		);
	}

	ngOnInit() {
		this._persistedHistory = history.state;
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

		if (index > this.endangeredLanguages.length - 1) {
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
				() => {
					this.router.navigateByUrl(AppRoutes.Translate, {
						state: history.state,
					});
				},
				(url) => {
					this.router.navigateByUrl(url);
				}
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

	private _sortLanguages(
		languages: EndangeredLanguage[]
	): EndangeredLanguage[] {
		return languages.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			} else if (a.name > b.name) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	onSearchLanguage(e: any) {
		let _endangeredLanguages = this.allLanguages;

		if (e.region === "all" && e.language === null) {
			_endangeredLanguages = this.allLanguages;
		} else if (
			e.region !== "none" &&
			e.region !== "" &&
			e.region !== null
		) {
			_endangeredLanguages = this.allLanguages.filter(
				(lan) => lan.region.toLowerCase() === e.region.toLowerCase()
			);
		} else if (
			e.language !== "none" &&
			e.language !== "" &&
			e.language !== null
		) {
			_endangeredLanguages = this.allLanguages.filter((lan) =>
				lan.name.includes(e.language)
			);
		}

		if (_endangeredLanguages.length === 0) {
			_endangeredLanguages = this.allLanguages;
		}

		this.endangeredLanguageService.setLanguages(_endangeredLanguages);
		this.i18nService.initI8n();

		this.showResults = !this.showResults;
	}
}
