import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import sub-modulos
import { AppComponent } from './app.component';
import { EditarPerfilModule } from './editar-perfil/editar-perfil.module';
import { ListaDocumentosPerfilModule } from './lista-documentos-perfil/lista-documentos-perfil.module';
// import ngx-translate y http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {HttpClient, HttpClientModule} from '@angular/common/http';
// import angular material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
// import formBuilder y reactiveForms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import iconos de banderas
import { NgxFlagIconCssModule } from 'ngx-flag-icon-css';
//import dialogos
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
//import primeng
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    BrowserAnimationsModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    SweetAlert2Module,
    NgxFlagIconCssModule,
    TooltipModule,
    MatNativeDateModule,
    EditarPerfilModule,
    ListaDocumentosPerfilModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/lenguajes/', '.json');
}