import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { first } from 'rxjs/internal/operators/first';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Pais } from 'src/app/modelos/pais';
import { Observable, Subject, Subscription, map, takeUntil } from 'rxjs';
import { IRegistroUsuario, IDocumento } from 'src/app/modelos/administracion-usuario'
import { HttpClient } from '@angular/common/http';
import { TipoDocumentoValores } from '../modelos/TipoDocumento';
import { ListaDocumentosPerfilComponent } from '../lista-documentos-perfil/lista-documentos-perfil.component';

@Component({
  selector: 'editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss'],
  animations: [trigger('fade', [transition('void => *', [style({ opacity: 0 }), animate(600, style({ opacity: 1 }))])])]
})
export class EditarPerfilComponent implements OnInit{
  registroUsuario!: FormGroup;
  paisesTraducidos: Pais | undefined;
  paises!: Pais[];  
  idioma!: string;
  nombrePerfil: string | undefined;
  loadSpinner: boolean = false;
  datosUsuarioRAW: any = null;
  documentosCumplenCondiciones: boolean = true;
  private validatorsObject: any = {
    Nombre: [Validators.maxLength(60)],
    Apellidos: [Validators.maxLength(60)],
    Telefono: [Validators.pattern('[0-9]{4,13}')],
    Email: [Validators.maxLength(60)],
    Direccion: [Validators.maxLength(50)],
    Ciudad: [Validators.maxLength(50)],
    CodigoPostal: [Validators.pattern('^[0][1-9][0-9]{3}$|^[1-4][0-9]{4}$|^[5][0-2][0-9]{3}$')],
    Provincia: [Validators.maxLength(50)]
  };
  prefijosInternacionales: any[] = [];
  bandera: any;
  test: any;
  paisesSubscription$!: Subscription;
  usuariosAntiguos$!: Subscription;
  private destroy$: Subject<void> = new Subject();
  listadoCodigosResidentes: any[] = [];
  formatoPrefijo = (pais: { name: any; prefix: any; }) => `${pais.name} +${pais.prefix}`;

  constructor(
    private _translate: TranslateService, 
    private _usuarioService: UsuarioService, 
    private fb: FormBuilder, 
    private _http: HttpClient
  ) { }

  @ViewChild(ListaDocumentosPerfilComponent) listaDocumentos!: ListaDocumentosPerfilComponent;
  nuevoPais() {
    // Acceder a la propiedad o método en el componente hijo
    this.listaDocumentos.paisDefault = { value: 'MP', viewValue: 'MarioPlanet' };
    this.listaDocumentos.nuevoPaisColor();
  }

  ngOnInit(): void {
    this.setFormGroup();
    if (this._translate.getBrowserLang() === 'es') {
      this._translate.use('es');
      this.estableceIdioma('es');
    } else if (this._translate.getBrowserLang() == 'ca') {
      this._translate.use('ca');
      this.estableceIdioma('ca');
    } else {
      this.estableceIdioma('en');
    }
    this.getPaises();
    this.getListadoCodigosResidente();
  }

  estableceIdioma(idioma: string) {
    this.idioma = idioma;
  }

  ngAfterViewInit(): void {
    console.log('Soy AfterViewInit');
    this.usuariosAntiguos$ = this._usuarioService.recuperarJSON()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (user: IRegistroUsuario) => {
      if (user.Documentos) {
        user.Documentos = this.ordenarListadoDocumentosPorTipo(user.Documentos);
      }
      this.datosUsuarioRAW = user;
      console.log('datos user', user);
      const nombrePartido = user.Nombre.split(',');
      this.registroUsuario.patchValue({
        ...user,
        Nombre: nombrePartido[0].trim(),
        Apellidos: nombrePartido[1].trim(),
        FechaNacimiento: user.FechaNacimiento ? new Date(user.FechaNacimiento) : null
      });
      this.setValidators();
      this.loadSpinner = false;
    },
    () => {
      this.datosUsuarioRAW = null;
    }
  );
  }

  setFormGroup() {
    this.registroUsuario = new FormGroup(
      {
        Id: new FormControl(''),
        Nombre: new FormControl('', this.validatorsObject.Nombre),
        Apellidos: new FormControl(''),
        Telefono: new FormControl('', this.validatorsObject.Telefono),
        PrefijoInternacional: new FormControl('', Validators.required),
        Email: new FormControl('', this.validatorsObject.Email),
        Direccion: new FormControl('', this.validatorsObject.Direccion),
        Ciudad: new FormControl('', this.validatorsObject.Ciudad),
        CodigoPostal: new FormControl('', this.validatorsObject.CodigoPostal),
        Pais: new FormControl('', Validators.required),
        Provincia: new FormControl('', this.validatorsObject.Provincia),
        Sexo: new FormControl('', Validators.required),
        FechaNacimiento: new FormControl('')
      },
      {
        validators: [this.sonDocumentosCorrectosValidator()]
      }
    );
  }

  hndDocumentosValidados(documentosCumplenCondiciones: boolean) {
    this.documentosCumplenCondiciones = documentosCumplenCondiciones;
    this.registroUsuario.updateValueAndValidity();
  }

  sonDocumentosCorrectosValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      return this.documentosCumplenCondiciones ? null : { documentosValidados: true };
    };
  }

  setPrefijos() {
    this.prefijosInternacionales = this.paises.map((pais) => {
      if (pais.prefix === this.registroUsuario.get('PrefijoInternacional')?.value) {
        this.bandera = pais.alpha2;
      }
      return {
        value: pais.prefix,
        viewValue: this.formatoPrefijo(pais),
        codigo: pais.alpha2
      };
    });
  }

  getPaises() {
    this.paisesSubscription$ = this.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Pais[]) => {
        this.paises = data;
        this.setPrefijos();
      })
  }

  getCountries() {
    const directorioPaises = this.idioma !== 'ca' ? this.idioma : this.idioma = 'es';
    return this._http.get(`assets/paises/${directorioPaises}/countries.json`).pipe(
      map((data: any) => {
        return data.sort((a: { alpha2: string; }) => a.alpha2 === this.idioma ? -1 : 1);
      })
    )
  }


  cambiarBandera(event: any) {
    this.bandera = this.paises
      .filter((pais: Pais) => this.formatoPrefijo(pais) === event.source.triggerValue)[0].alpha2
  }

  registrar() {
    if (this.registroUsuario.valid && this.documentosCumplenCondiciones) {
      console.log('docs a registrar', this.registroUsuario.value);
      const datosUsuario = this.getDatosPerfilFormateados();
      console.log('docs a registrar formateados', datosUsuario);
      if (!this.comprobarErrores(datosUsuario)) {
        this._modificarDatosUsuario(datosUsuario);
      }
    }
  }

  comprobarErrores(datosUsuario: IRegistroUsuario) {
    return (
      this.comprobarErrorFechaNacimiento(datosUsuario.FechaNacimiento) 
    );
  }


  private comprobarErrorFechaNacimiento(fechaNacimiento: Date) {
    const existeError: boolean = fechaNacimiento ? this.getAge(fechaNacimiento) < 18 : false;
    if (existeError) this.mostrarModalError(this._translate.instant('perfil.error.fecha-nacimiento-18'));
    return existeError;
  }

  public getAge(date: Date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }


  private mostrarModalError(texto: any) {
    Swal.fire({
      customClass: {
        container: 'swal-z-index-9999'
      },
      icon: 'error',
      title: `${this._translate.instant('auto-reserva.componentes-comunes.un-momento')}...`,
      html: texto,
      confirmButtonText: this._translate.instant('auto-reserva.vuelos.comun.vale'),
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  }

  _modificarDatosUsuario(datosUsuario: any) {
    const response = this._usuarioService.modificarDatosUsuario(datosUsuario)
    if (response) {
      Swal.fire({
        icon: 'success',
        title: this._translate.instant('perfil.datos-actualizados'),
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      Swal.fire({
        customClass: {
          container: 'swal-z-index-9999'
        },
        icon: 'error',
        title: 'Error',
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  private getDatosPerfilFormateados() {
    let datosUsuario = { ...this.registroUsuario.getRawValue() };
    datosUsuario.Nombre = `${this.registroUsuario.get('Nombre')?.value}, ${this.registroUsuario.get('Apellidos')?.value}`;
    delete datosUsuario.Apellidos;
    datosUsuario.Documentos = this.datosUsuarioRAW.Documentos;

    return datosUsuario;
  }

  getListadoCodigosResidente() {
    return this._http.get(`assets/listadoCodigoResidente.json`)
      .pipe(first())
      .subscribe((res: any) => {
        this.listadoCodigosResidentes = res;
      });
  }

  setValidators() {
    Object.keys(this.registroUsuario.controls).forEach((key) => {
      if (key === 'Direccion' || key === 'Ciudad' || key === 'CodigoPostal' || key === 'Provincia') return; 
      if (this.registroUsuario.get(key)?.value !== null) {
        this.registroUsuario
          .get(key)!
          .setValidators(
            this.validatorsObject[key] ? this.validatorsObject[key].concat(Validators.required) : [Validators.required]
          );
      }
    });
  }

  public getRequired(nombreCampo: string) {
    const campo = this.registroUsuario.get(nombreCampo);
    if (!campo?.validator) {
      return false;
    }

    const validator = campo.validator({} as AbstractControl);
    return validator && validator['required'];
  }

  public get nombreUsuario(): string {
    return this.registroUsuario.get('Nombre')?.value;
  }

  public get apellidosUsuario(): string {
    return this.registroUsuario.get('Apellidos')?.value;
  }

  

  getFormatedName(name: string) {
    let res = name.replace(',', '');
    let firstName = res
      .split(' ')
      .slice(0, 1)
      .join(' ');
    let lastName = res
      .split(' ')
      .slice(-2)
      .join(' ');
    return `${lastName}, ${firstName}`;
  }

  
  // @HostListener('window:beforeunload', ['$event'])
  // ngOnDestroy($event: any) {
  //   const usuario = this.registroUsuario.getRawValue()
  //   if (usuario.nombre !== '') {
  //     this._usuarioService.anyadirUsuario(usuario);
  //     const subscripcion$ = this._usuarioService.guardarJSON()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe();
  //   }
  //   this.destroy$.next();
  //   $event.preventDefault();
  //   $event.returnValue = 'Quiere cerrar la pagina?';
  // } 
  
  ordenarListadoDocumentosPorTipo(documentosViajero: any[]): IDocumento[] {
    let documentosOrdenados: IDocumento[] = [];
    const identificaciones = this.filtrarDocumentosIdentidad(documentosViajero);
    const pasaportes = this.filtrarDocumentosPasaportes(documentosViajero);
    const restoDocumentos = this.filtrarDocumentosBonificaciones(documentosViajero);

    if (identificaciones.length > 0) documentosOrdenados = documentosOrdenados.concat(identificaciones);
    if (pasaportes.length > 0) documentosOrdenados = documentosOrdenados.concat(pasaportes);
    if (restoDocumentos.length > 0) documentosOrdenados = documentosOrdenados.concat(restoDocumentos);

    return documentosOrdenados;
  }

  filtrarDocumentosBonificaciones(documentos:IDocumento[]): IDocumento[] {
    return documentos.filter((documento)=>{
      return documento.Tipo == TipoDocumentoValores.Residente || documento.Tipo == TipoDocumentoValores.FamiliaNumerosa;
    });
  }

  filtrarDocumentosIdentidad(documentos:IDocumento[]): IDocumento[] {
    return documentos.filter((documento)=>{
      return documento.Tipo == TipoDocumentoValores.Identificacion;
    });
  }

  filtrarDocumentosPasaportes(documentos:IDocumento[]): IDocumento[] {
    return documentos.filter((documento)=>{
      return documento.Tipo == TipoDocumentoValores.Pasaporte;
    });
  }

}
