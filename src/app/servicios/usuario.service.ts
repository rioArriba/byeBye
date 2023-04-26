import { Injectable } from '@angular/core';
import { IDocumento, IRegistroUsuario } from '../modelos/administracion-usuario';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import * as dayjs from 'dayjs';
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  usuarios: IRegistroUsuario | undefined;

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  constructor(private http: HttpClient) { }

  getUsuarios() {
    return this.usuarios;
  }

  borrarUsuarios() {
    this.usuarios = undefined;
  }

  anyadirUsuario(usuario: IRegistroUsuario) {
    this.usuarios = usuario;
  }
  modificarDatosUsuario(user: any) :boolean{
    user.FechaNacimiento = this.getDate(user.FechaNacimiento);
    user.Documentos = user.Documentos.map((documento: IDocumento) => ({
      ...documento,
      FechaCaducidad: this.getDate(documento.FechaCaducidad),
      FechaEmision: this.getDate(documento.FechaEmision)
    }));
    return true;
  }

  getDate(fecha: string | Date) {
    return fecha ? dayjs(fecha).format('YYYY-MM-DD') : null;
  }

  getUltimoUsuario() {
    return this.usuarios;
  }

  guardarJSON() {    
      return this.http.post("assets/usuarios.json",
        JSON.stringify(this.usuarios),
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' })}).pipe(
          catchError(this.handleError));
  }

  recuperarJSON() {
    return this.http.get<IRegistroUsuario>("assets/usuarios.json").pipe(
      catchError(this.handleError));
  }
}
