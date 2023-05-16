import { Component, ViewChild } from '@angular/core';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor() {}


  @ViewChild(EditarPerfilComponent) EditarPerfilComponent!: EditarPerfilComponent;
  hndNuevoPais(): void {
    // Acceder a la propiedad o método en el componente hijo
    this.EditarPerfilComponent.nuevoPais();
  }

  hndUsaLenguaje(lenguaje: string): void {
    this.EditarPerfilComponent.estableceIdioma(lenguaje);
    console.log(lenguaje)
  }
}


