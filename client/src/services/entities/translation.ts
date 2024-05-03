export interface Translation {
	english: string;
	original: string;
	translation: string;
	transliteration: string;
	soundURL: string | null;
}

export interface WordTranslation {
	english: string;
	translations: Translation[];
}
