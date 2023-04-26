import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditarPerfilComponent } from './editar-perfil.component';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ListaDocumentosPerfilModule } from '../lista-documentos-perfil/lista-documentos-perfil.module';
import { NgxFlagIconCssModule } from 'ngx-flag-icon-css';
import { MayusculasPipe } from '../pipe/mayusculas.pipe';
import { NumericOnlyDirective } from '../directive/numeric-only.directive';
@NgModule({
  declarations: [EditarPerfilComponent, MayusculasPipe, NumericOnlyDirective],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    ListaDocumentosPerfilModule,
    NgxFlagIconCssModule,
  ],
  exports: [EditarPerfilComponent]
})
export class EditarPerfilModule {}
