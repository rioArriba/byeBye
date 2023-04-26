import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, map, takeUntil } from 'rxjs';
import { Pais } from 'src/app/modelos/pais';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from './servicios/usuario.service';
import { TipoDocumentoValores } from './modelos/TipoDocumento';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  name: string = "Mario";
  registroUsuario!: FormGroup;
  paises: any;
  prefijosInternacionales: any[] = [];
  bandera: any;
  idioma!: string;
  paisesSubscription$!: Subscription;
  usuariosAntiguos$!: Subscription;
  tiposDocumentos = TipoDocumentoValores;
  lenguajeSeleccionado: string = 'en';
  formatoPrefijo = (pais: Pais) => `${pais.name} +${pais.prefix}`;
  private destroy$: Subject<void> = new Subject();

  constructor(private translate: TranslateService, private _usuarioService: UsuarioService, private fb: FormBuilder, private _http: HttpClient) {
    this.translate.setDefaultLang(this.lenguajeSeleccionado);
  }


  @ViewChild(EditarPerfilComponent) EditarPerfilComponent!: EditarPerfilComponent;
  nuevoPais() {
    // Acceder a la propiedad o método en el componente hijo
    this.EditarPerfilComponent.nuevoPais();
  }

  ngAfterViewInit(): void {
    console.log('Soy AfterViewInit');
    this.usuariosAntiguos$ = this._usuarioService.recuperarJSON()
      .pipe(takeUntil(this.destroy$))
      .subscribe(respuesta => this.registroUsuario.patchValue({ ...respuesta }));
    //this.setValidators();

  }


  ngOnInit(): void {
    console.log('Soy OnInit');
    // this._usuarioService.borrarUsuarios();
    this.loadRegisterForm();
    if (this.translate.getBrowserLang() === 'es') {
      this.translate.use('es');
      this.estableceIdioma('es');
    } else if (this.translate.getBrowserLang() == 'ca') {
      this.translate.use('ca');
      this.estableceIdioma('ca');
    } else {
      this.estableceIdioma('en');
    }
    this.getPaises();
  }



  estableceIdioma(idioma: string) {
    this.idioma = idioma;

  }
  hndUsaLenguaje(lenguaje: string): void {
    console.log(lenguaje)
    this.estableceIdioma(lenguaje);
    this.translate.use(lenguaje);
    this.getPaises()
  }

  get documentos(): FormArray {
    return this.registroUsuario.get("documentos") as FormArray
  }

  nuevoDocumento(id?: any, tipoDocumento?: any): FormGroup {
    return this.fb.group({
      tipo: tipoDocumento ? tipoDocumento : ['', Validators.required],
      identificacion: id || ['', Validators.required],
      fechaEmision: ['', Validators.required],
      fechaCaducidad: ['', Validators.required],
      paisEmision: ['', Validators.required],
    })
  }

  anaydirDocumento(id?: any, tipoDocumento?: any) {
    this.documentos.push(this.nuevoDocumento(null, tipoDocumento));
  }



  getPaises() {
    this.paisesSubscription$ = this.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Pais[]) => {
        this.paises = data;
        this.setPrefijos();
      })
  }


  setPrefijos() {
    this.prefijosInternacionales = this.paises.map((pais: Pais) => {
      if (pais.prefix === this.registroUsuario.get('prefijo')?.value) {
        this.bandera = pais.alpha2
      }
      return {
        value: pais.prefix,
        viewValue: this.formatoPrefijo(pais),
        codigo: pais.alpha2
      };
    });
  }


  cambiarBandera(event: any) {
    this.bandera = this.paises
      .filter((pais: Pais) => this.formatoPrefijo(pais) === event.source.triggerValue)[0].alpha2
  }

  getCountries() {
    const directorioPaises = this.idioma !== 'ca' ? this.idioma : this.idioma = 'es';
    return this._http.get(`assets/paises/${directorioPaises}/countries.json`).pipe(
      map((data: any) => {
        return data.sort((a: { alpha2: any; }, b: any) => a.alpha2 === this.idioma ? -1 : 1);
      })
    )
  }


  borrarDocumento(i: number) {
    i != 0 ? this.documentos.removeAt(i) : false;
  }


  loadRegisterForm(): void {
    this.registroUsuario = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.pattern('^[a-zA-ZÀ-ú ]*$')]),
      apellidos: new FormControl('', [Validators.required, Validators.maxLength(30), Validators.pattern('^[a-zA-ZÀ-ú ]*$')]),
      prefijo: new FormControl('', [Validators.required]),
      telefono: new FormControl('', [Validators.required, Validators.pattern('[0-9]{4,13}')]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(60)]),
      fechaNacimiento: new FormControl('', [Validators.required]),
      sexo: new FormControl('', Validators.required),
      direccion: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      ciudad: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      codigoPostal: new FormControl('', [Validators.required, Validators.pattern('^[0][1-9][0-9]{3}$|^[1-4][0-9]{4}$|^[5][0-2][0-9]{3}$')]),
      provincia: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      pais: new FormControl(''),
      documentos: new FormArray([]),
    })
  }

  hndRegistrarUsuario() {
    console.log(this.registroUsuario.getRawValue());
    if (this.registroUsuario.valid) {
      this.registroUsuario.getRawValue();
      /* const datosUsuario = this.getDatosPerfilFormateados();
       if (!this.comprobarErrores(datosUsuario)) {
         this._modificarDatosUsuario(datosUsuario);
       }   */
    }
  }


  validarNIE(numeroID: string): boolean { // SOLAMENTE FORMATO
    return /^[xyzXYZ][0-9]{7}[a-zA-Z]$/.test(numeroID);

  }

  // canDeactivate() {}
/*
  @HostListener('window:beforeunload', ['$event'])
  ngOnDestroy($event: any) {
    const usuario = this.registroUsuario.getRawValue()
    if (usuario.nombre !== '') {
      this._usuarioService.anyadirUsuario(usuario);
      const subscripcion$ = this._usuarioService.guardarJSON()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    }
    this.destroy$.next();
    $event.preventDefault();
    $event.returnValue = 'Quiere cerrar la pagina?';
  } */
}


