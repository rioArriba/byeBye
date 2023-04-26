import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaDocumentosPerfilComponent } from './lista-documentos-perfil.component';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'primeng/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ListaDocumentosPerfilComponent],
  imports: [
    CommonModule,
    TableModule,
    TranslateModule,
    TooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [ListaDocumentosPerfilComponent]
})
export class ListaDocumentosPerfilModule {}
