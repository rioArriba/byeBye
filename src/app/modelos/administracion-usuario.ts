export interface IRegistroUsuario {
  Id: number;
  Nombre: string;
  PrefijoInternacional: number;
  Telefono: string;
  Email: string;
  FechaNacimiento: Date;
  Sexo: string;
  Direccion: string;
  Ciudad: string;
  CodigoPostal: string;
  Provincia: string;
  Pais: string;
  Documentos: IDocumento[];
}

export interface IDocumento {
  Id: number;
  Tipo: string;
  Numero: string;
  FechaEmision: Date;
  FechaCaducidad: Date;
  PaisEmision: string;
  PaisNacionalidad?: string;
}
