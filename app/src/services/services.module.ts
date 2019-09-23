import { NgModule } from '@angular/core';
import { ImageTranslationService } from "./image-translation";
import { IMAGE_RECOGNITION_SERVICE, IMAGE_RECOGNITION_CONFIG } from "./image-recognition";
import { TRANSLATION_SERVICE, TRANSLATION_CONFIG } from "./translation";
import { ANALYTICS_SERVICE, ANALYTICS_CONFIG} from "./analytics";
import { environment } from "environments/environment";

@NgModule({
  declarations: [
  ],
  providers: [
    ImageTranslationService,
    { provide: IMAGE_RECOGNITION_SERVICE, useClass: environment.services.imageRecognition.type },
    { provide: IMAGE_RECOGNITION_CONFIG, useValue: environment.services.imageRecognition.config },
    { provide: TRANSLATION_SERVICE, useClass: environment.services.translation.type },
    { provide: TRANSLATION_CONFIG, useValue: environment.services.translation.config },
    { provide: ANALYTICS_SERVICE, useClass: environment.services.analytics.type },
    { provide: ANALYTICS_CONFIG, useValue: environment.services.analytics.config },
  ]
})
export class ServicesModule {}
