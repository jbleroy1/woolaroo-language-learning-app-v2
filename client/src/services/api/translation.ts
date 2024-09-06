import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { WordTranslation } from '../entities/translation';
import { ITranslationService, SENTENCE_CONFIG, TRANSLATION_CONFIG } from '../translation';

interface APITranslationConfig {
  endpointURL: string;
}

interface APISentenceConfig {
  endpointURL: string;
}

interface Translations {
  english_word: string;
  primary_word: string;
  transliteration: string;
  sound_link: string;
  translation: string;
}

interface TranslationResponse {
  english_word: string;
  translations: Translations[];
}

interface TranslateRequest {
  words: string[];
  primaryLanguage: string;
  targetLanguage: string;
}

interface SentenceRequest {
  word: string;
  primaryLanguage: string;
  replaced_word: string;
}

interface SentenceResponse {
  word: string;
  primaryLanguage: string;
  targetLanguage: string;
  model: string;
  sentence: string;
  replaced_word: string
}


@Injectable()
export class APITranslationService implements ITranslationService {
  private lastRequest: TranslateRequest|null = null;
  private lastResponse: WordTranslation[]|null = null;

  public constructor(private http: HttpClient, @Inject(TRANSLATION_CONFIG) private config: APITranslationConfig, @Inject(SENTENCE_CONFIG) private sentenceConfig: APISentenceConfig) {
  }

  private static requestsAreEqual(request1: TranslateRequest, request2: TranslateRequest): boolean {
    if (request1.primaryLanguage !== request2.primaryLanguage || request1.targetLanguage !== request2.targetLanguage) {
      return false;
    }
    if (request1.words.length !== request2.words.length) {
      return false;
    }
    return request1.words.every(w => request2.words.indexOf(w) >= 0);
  }

  private static formatSoundURL(url: string|null): string|null {
    if (!url) {
      return url;
    }
    if (url.indexOf('?') >= 0) {
      return `${url}&ngsw-bypass`;
    } else {
      return `${url}?ngsw-bypass`;
    }
  }

  public  async getSentence(word: string, primaryLanguage: string, replaced_word: string): Promise<SentenceResponse> {
  return this.http.post<SentenceResponse>(this.sentenceConfig.endpointURL, { word, primaryLanguage, replaced_word }).toPromise()
  }

  public async translate(englishWords: string[], primaryLanguage: string, targetLanguage: string,
    maxTranslations: number = 0): Promise<WordTranslation[]> {
    const lowercaseWords = englishWords.map((w) => w.toLowerCase());
    const newRequest: TranslateRequest = { words: lowercaseWords, primaryLanguage, targetLanguage };
    if (this.lastRequest && this.lastResponse && APITranslationService.requestsAreEqual(this.lastRequest, newRequest)) {
      // use cached results
      return Promise.resolve(this.lastResponse);
    }
    const response = await this.http.post<TranslationResponse[]>(this.config.endpointURL, {
      english_words: lowercaseWords,
      primary_language: primaryLanguage,
      target_language: targetLanguage
    }).toPromise();
  
    console.log("before caling le asyn");
    let translations = await Promise.all(response.map(async (tr) => {
      console.log(tr)
      const s = await this.getSentence(tr.translations[0].primary_word, primaryLanguage, tr.translations[0].translation);
      console.log(s);
      return {
        english: tr.english_word,
        original: tr.translations[0].primary_word,
        translation: tr.translations[0].translation,
        transliteration: tr.translations[0].transliteration,
        sentence: s.sentence,
        translated_word: tr.translations[0].translation,
        soundURL: APITranslationService.formatSoundURL(tr.translations[0].sound_link)
      };
    }));
 
   
    // add any missing translations
    lowercaseWords.forEach((w) => {
      if (!translations.find((tr) => tr.english === w)) {
        translations.push({ original: '', english: w, translation: '', transliteration: '', sentence: '',translated_word: '', soundURL: '' });
      }
    });
    // filter out empty translations
    translations = translations.filter(tr => tr.english);
    // cache results
    this.lastRequest = newRequest;
    this.lastResponse = translations;
    return translations;
  }
}
