import { NgModule } from "@angular/core";
import { LanguageFilterComponent } from "./language-filter.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";

@NgModule({
	declarations: [LanguageFilterComponent],
	exports: [LanguageFilterComponent],
	imports: [MatFormFieldModule, MatSelectModule, MatIconModule],
})
export class LanguageFilterModule {}
