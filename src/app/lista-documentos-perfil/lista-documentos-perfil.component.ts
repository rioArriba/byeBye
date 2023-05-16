import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Pais } from 'src/app/modelos/pais';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';
import { TipoDocumentoValores } from 'src/app/modelos/TipoDocumento';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'lista-documentos-perfil',
  templateUrl: './lista-documentos-perfil.component.html',
  styleUrls: ['./lista-documentos-perfil.component.scss']
})
export class ListaDocumentosPerfilComponent implements OnInit {
  @Input() items!: any[];
  @Input() codigosResidente: any[] = [];
  @Input() paises!: Pais[];
  @Output() itemsChange: EventEmitter<any> = new EventEmitter();
  @Output() documentosCumplenCondicionesChange: EventEmitter<boolean> = new EventEmitter();
  user: Object = {};
  comboPaises: any[] = [];
  paisDefault: any = { value: null, viewValue: '' };
  tiposDocumentos = TipoDocumentoValores;
  editarDocumento!: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
  tiposDocumentosVista: any[] = [
    { value: 'I', viewValue: 'perfil.num-identificacion' },
    { value: 'P', viewValue: 'perfil.pasaporte' },
    { value: 'R', viewValue: 'perfil.residente' },
    { value: 'F', viewValue: 'perfil.familia-numerosa' },
  ];
  constructor(
    private formBuilder: FormBuilder,
    private _translate: TranslateService,
  ) { 
    // console.log('Soy Constructor: ', this.items); 
  }

  ngOnInit(): void {
    this.setComboPaises();
    this.cargarFormulario();
    this.autocompletarDocumentosForm();
    this.Documentos.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.editarDocumento.updateValueAndValidity();
      if (this.Documentos.valid) {
        this.items = value;
        this.itemsChange.emit(this.items);
        this.documentosCumplenCondicionesChange.emit(true);
      } else this.documentosCumplenCondicionesChange.emit(false);
    });
    // console.log('Soy Init: ', this.items);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log('Soy Changes: ',this.items, changes);
  // }

  // ngDoCheck() {
  //   console.log('Soy Check: ');
  // }

  // ngAfterViewInit() {
  //   console.log('Soy ViewInit: ');
  // }
  // ngAfterViewChecked() {
  //   console.log('Soy ViewChecked: ');
  // }

  // ngAfterContentInit() {
  //   console.log('Soy ContentInit: ');
  // }
  // ngAfterContentChecked() {
  //   console.log('Soy ContentChecked: ');
  // }

  // ngOnDestroy() {
  //   this.destroy$.unsubscribe();
  //   console.log('Soy Destroy: ');
  // }

  @ViewChild('miPais', { static: true }) miPais!: ElementRef;
  nuevoPaisColor() {
    console.log('Soy listaDocumentosComponent.')
  }


  get Documentos(): FormArray {
    return this.editarDocumento.get('Documentos') as FormArray;
  }

  cargarFormulario() {
    this.editarDocumento = new FormGroup({ Documentos: new FormArray([]) });
  }

  autocompletarDocumentosForm() {
    this.items.forEach((documento) =>
      this.Documentos.push(
        this.formBuilder.group(
          {
            Id: documento.Id,
            Tipo: [documento.Tipo, Validators.required],
            Numero: [documento.Numero, Validators.required],
            FechaEmision: [documento.FechaEmision, Validators.required],
            FechaCaducidad: [documento.FechaCaducidad, Validators.required],
            PaisEmision: [documento.PaisEmision, Validators.required],
            PaisNacionalidad: documento.PaisNacionalidad ? [documento.PaisNacionalidad, Validators.required] : null
          },
          {
            validators: [this.sonCamposCompletos(), this.esNumeroResidenteExtranjeroAlfanumerico(), this.sonDuplicados()]
          }
        )
      )
    );
  }

  setComboPaises() {
    this.paises.forEach((pais) => {
      this.comboPaises.push({
        value: pais.alpha2.toUpperCase(),
        viewValue: pais.name
      });
    });
  }

  formatearFecha(fecha: any) {
    if (fecha) {
      fecha = fecha.toISOString();
    }
  }


  borrarDocumento(i: number) {
    Swal.fire({
      customClass: {
        container: 'swal-z-index-9999'
      },
      title: this._translate.instant('perfil.atencion'),
      text: this._translate.instant('perfil.borrar'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this._translate.instant('perfil.borrar'),
      cancelButtonText: this._translate.instant('perfil.cancelar')
    }).then((result) => {
      if (result.isConfirmed) {
        i != 0
          ? this.Documentos.removeAt(i)
          : this.mostrarModalError('El primer documento no se puede eliminar pero sí modificar.');
      }
    });
  }

  anyadirNuevoDocumento() {
    this.Documentos.push(
      this.formBuilder.group(
        {
          Id: null,
          Tipo: ['', Validators.required],
          Numero: ['', Validators.required],
          FechaEmision: ['', Validators.required],
          FechaCaducidad: ['', Validators.required],
          PaisEmision: ['', Validators.required],
          PaisNacionalidad: null
        },
        {
          validators: [this.sonCamposCompletos(), this.esNumeroResidenteExtranjeroAlfanumerico(), this.sonDuplicados()]
        }
      )
    );
  }


  validarNIE(numeroID: string): boolean { // SOLAMENTE FORMATO
    return /^[xyzXYZ][0-9]{7}[a-zA-Z]$/.test(numeroID);

  }
  hndOnSelectionNacionalidadChange(value: string, index: number): void {
    if (value === 'ES') {
      const titulo = this._translate.instant('mis-presupuestos.comun-productos.alerts.titulo.aviso');
      const textoAviso = `${this._translate.instant('perfil.error.nie-nacionalidad')}.`;
      this.mostrarAviso(titulo, textoAviso, 'warning').then(() => {
        const documento = (this.editarDocumento.get('Documentos') as FormArray).controls[index];
        documento.get('PaisNacionalidad')?.setValue(null);
      });
    }
  }

  hndOnSelectionPaisEmisionChange(value: string, index: number): void {
    const documentoSeleccionado = this.Documentos.at(index).value;
    if (value !== 'ES') {
      //la nacionalidad solamente se va a exigir si es NIE emitido en España
      // this.items[index].PaisNacionalidad = null;

      documentoSeleccionado.PaisNacionalidad = null;
    }
    if (value == 'ES' && documentoSeleccionado.Tipo == TipoDocumentoValores.Residente) {
      // al cambiar a emitido en ES, debe limpiarse cualquier dato previo introducido en el número de residente, antes de que el user seleccione código
      // items[index].Numero = null;
      documentoSeleccionado.Numero = null;
    }
  }

  mostrarAviso(titulo: string, mensaje: string, icono: SweetAlertIcon): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title: titulo,
      text: mensaje,
      icon: icono,
      showConfirmButton: true,
      confirmButtonText: 'Ok',
      confirmButtonColor: '#6a88b1',
      allowOutsideClick: false
    });
  }

  sonCamposCompletos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      const Tipo: string = form.get('Tipo')?.value;
      const Numero: string = form.get('Numero')?.value;
      const FechaEmision: Date = form.get('FechaEmision')?.value;
      const FechaCaducidad: Date = form.get('FechaCaducidad')?.value;
      const PaisEmision: string = form.get('PaisEmision')?.value;
      const PaisNacionalidad: string = form.get('PaisNacionalidad')?.value;
      let sonCompletos = false;
      if (Tipo == 'I' && this.validarNIE(Numero) && PaisEmision == 'ES') {
        sonCompletos =
          Tipo && Numero && FechaEmision && FechaCaducidad && PaisEmision && PaisNacionalidad ? true : false;
      } else {
        sonCompletos = Tipo && Numero && FechaEmision && FechaCaducidad && PaisEmision ? true : false;
      }
      return sonCompletos ? null : { camposCompletos: true };
    };
  }

  sonDuplicados(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      const PaisesResidente: string[] = [];
      const PaisesFamilia: string[] = [];
      const PaisesIdentidad: string[] = [];
      let DuplicadoResidente = false;
      let DuplicadoFamilia = false;
      let DuplicadoIdentidad = false;
      this.Documentos.controls.forEach((item) => {
        if (item.value.Tipo == TipoDocumentoValores.Identificacion) PaisesIdentidad.push(item.value.PaisEmision);
        if (item.value.Tipo == TipoDocumentoValores.FamiliaNumerosa) PaisesFamilia.push(item.value.PaisEmision);
        if (item.value.Tipo == TipoDocumentoValores.Residente) PaisesResidente.push(item.value.PaisEmision);
      });
      if (new Set(PaisesResidente).size < PaisesResidente.length) DuplicadoResidente = true;
      if (new Set(PaisesFamilia).size < PaisesFamilia.length) DuplicadoFamilia = true;
      if (new Set(PaisesIdentidad).size < PaisesIdentidad.length) DuplicadoIdentidad = true;
      const sonValidos = DuplicadoFamilia || DuplicadoResidente || DuplicadoIdentidad ? false : true;
      if (!sonValidos) this.mostrarModalError('Un documento de Identificacion, Residente y Familia Num. por pais.');
      return sonValidos
        ? null
        : {
          DocumentosDuplicados: {
            Familia: DuplicadoFamilia,
            Residente: DuplicadoResidente,
            Identidad: DuplicadoIdentidad
          }
        };
    };
  }

  esNumeroResidenteExtranjeroAlfanumerico(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      const Tipo: string = form.get('Tipo')?.value;
      const Numero: string = form.get('Numero')?.value;
      const PaisEmision: string = form.get('PaisEmision')?.value;
      let esNoAlfanumerico = false;
      if (Tipo == TipoDocumentoValores.Residente && PaisEmision != 'ES') {
        const regex = /[^a-zA-Z0-9]/g;
        esNoAlfanumerico = regex.test(Numero);
        if (esNoAlfanumerico)
          this.mostrarModalError(this._translate.instant('perfil.error.caracteres-prohibidos-residente'));
      }
      return esNoAlfanumerico ? { esNumeroResidenteExtranjeroAlfanumerico: true } : null;
    };
  }

  private mostrarModalError(texto: string) {
    Swal.fire({
      customClass: {
        container: 'swal-z-index-9999'
      },
      icon: 'error',
      title: `${this._translate.instant('perfil.un-momento')}...`,
      html: texto,
      confirmButtonText: this._translate.instant('perfil.vale'),
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  }
}
