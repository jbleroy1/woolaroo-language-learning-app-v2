import {
	EventEmitter,
	Inject,
	Injectable,
	InjectionToken,
	OnInit,
} from "@angular/core";
import { getLogger } from "../util/logging";
import { HttpClient } from "@angular/common/http";

const logger = getLogger("EndangeredLanguageService");

export interface EndangeredLanguage {
	code: string;
	name: string;
	default: boolean;
	apiURL: string;
	organizationName: string;
	organizationURL: string;
	sampleWordImageURL: string;
	sampleWordTranslation: string;
	nativeSpeakers: string;
	region: string;
}

interface EndangeredLanguageConfig {
	languages: EndangeredLanguage[];
	endangeredLanguageEndpoint: string;
}

export const ENDANGERED_LANGUAGE_CONFIG =
	new InjectionToken<EndangeredLanguageConfig>("Endangered language config");

@Injectable()
export class EndangeredLanguageService {
	private _contextLanguages: EndangeredLanguage[] = [];

	private _currentLanguage: EndangeredLanguage = {} as EndangeredLanguage;
	public get currentLanguage(): EndangeredLanguage {
		return this._currentLanguage;
	}

	public readonly currentLanguageChanged: EventEmitter<string> =
		new EventEmitter();

	public get languages(): EndangeredLanguage[] {
		return this._contextLanguages;
	}

	constructor(
		@Inject(ENDANGERED_LANGUAGE_CONFIG)
		private config: EndangeredLanguageConfig,
		private http: HttpClient
	) {
		this._getFilteredLanguages().then(() => {
			const storedLanguageCode = localStorage.getItem('currentLanguage');
			if (storedLanguageCode) {
				const storedLanguage = this._contextLanguages.find(
					lang => lang.code === storedLanguageCode);
				if (storedLanguage) {
					this._currentLanguage = storedLanguage;
				}
			}
		});
	}

	private async _getFilteredLanguages(region: string = "all") {
		const _formData = new FormData();
		_formData.append("region", region);
		const resp = await this.http
			.post<EndangeredLanguage[]>(
				this.config.endangeredLanguageEndpoint,
				_formData
			)
			.toPromise();
		this._contextLanguages = resp;
		const defaultLanguage = resp.find((lang) => lang.default);

		this._currentLanguage = defaultLanguage || resp[0];
	}

	public setLanguage(code: string) {
		if (
			code === this._currentLanguage.code ||
			this._contextLanguages.length === 0
		) {
			return;
		}

		const newLanguage = this._contextLanguages.find(
			(lang) => lang.code === code
		);
		if (!newLanguage) {
			throw new Error("Language not found: " + code);
		}
		logger.log("Endangered language changed: " + code);
		this._currentLanguage = newLanguage;
		this.currentLanguageChanged.emit(this._currentLanguage.code);
		localStorage.setItem('currentLanguage', code);
	}

	public setLanguages(languages: EndangeredLanguage[]) {
		this._contextLanguages = languages;
		this._currentLanguage = languages[0];
	}
}
