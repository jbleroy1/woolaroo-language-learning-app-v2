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
export class EndangeredLanguageService implements OnInit {
	private _contextLanguages: EndangeredLanguage[] = [];

	private _currentLanguage: EndangeredLanguage;
	public get currentLanguage(): EndangeredLanguage {
		return this._currentLanguage;
	}

	public readonly currentLanguageChanged: EventEmitter<string> =
		new EventEmitter();

	public get languages(): EndangeredLanguage[] {
		return this.config.languages;
	}

	constructor(
		@Inject(ENDANGERED_LANGUAGE_CONFIG)
		private config: EndangeredLanguageConfig,
		private http: HttpClient
	) {
		this._getFilteredLanguages("africa");
		const defaultLanguage = this.config.languages.find(
			(lang) => lang.default
		);
		this._currentLanguage = defaultLanguage || this.config.languages[0];
	}

	ngOnInit(): void {
		console.log(
			"EndangeredLanguageService initialized",
			this._contextLanguages
		);
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
	}

	public setLanguage(code: string) {
		if (code === this._currentLanguage.code) {
			return;
		}
		const newLanguage = this.config.languages.find(
			(lang) => lang.code === code
		);
		if (!newLanguage) {
			throw new Error("Language not found: " + code);
		}
		logger.log("Endangered language changed: " + code);
		this._currentLanguage = newLanguage;
		this.currentLanguageChanged.emit(this._currentLanguage.code);
	}

	public setLanguages(languages: EndangeredLanguage[]) {
		this.config.languages = languages;
		this._currentLanguage = languages[0];
	}
}
