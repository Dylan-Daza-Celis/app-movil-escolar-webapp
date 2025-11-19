import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  ano = new Date().getFullYear() - 25;

  minDate: Date = new Date(this.ano-84, 0, 1);
  maxDate: Date = new Date(this.ano, 11, 31);

  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias: any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService,
  ) { }

  ngOnInit(): void {
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      this.maestro = this.datos_user;

      try {
        // Si el backend lo envía como string JSON, conviértelo a array
        if (typeof this.maestro.materias_json === 'string') {
          this.maestro.materias_json = JSON.parse(this.maestro.materias_json);
        }

        // Si no es array (por seguridad), inicializarlo vacío
        if (!Array.isArray(this.maestro.materias_json)) {
          this.maestro.materias_json = [];
        }
      } catch (error) {
        console.warn('Error parseando materias_json:', error);
        this.maestro.materias_json = [];
      }
    } else {
      this.maestro = this.maestrosService.esquemaMaestro();
      this.maestro.rol = this.rol;
      this.token = this.facadeService.getSessionToken();

      // Asegurar que materias_json esté inicializado como array
      this.maestro.materias_json = [];
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    this.errors = {};

    // Asignar las materias seleccionadas al objeto maestro antes de validar
    this.maestro.materias_json = [...this.maestro.materias_json];

    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);

    if(Object.keys(this.errors).length > 0){
      return false;
    }

    if(this.maestro.password != this.maestro.confirmar_password){
      alert('Las contraseñas no coinciden');
      this.maestro.password = '';
      this.maestro.confirmar_password = '';
      return false;
    }

    // Consumir servicio para registrar maestros
    this.maestrosService.registrarMaestro(this.maestro).subscribe({
      next: (response: any) => {
        alert('Maestro registrado con éxito');


        if(this.token && this.token !== ""){
          this.router.navigate(["maestros"]);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        if(error.status === 422){
          this.errors = error.error.errors;
        } else {
          alert('Error al registrar el maestro');
        }
      }
    });
  }

  public actualizar(){
    this.errors = {};

    // Asignar las materias seleccionadas al objeto maestro antes de validar
    this.maestro.materias_json = [...this.maestro.materias_json];

    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);

    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Ejecutamos el servicio de actualización
    this.maestrosService.actualizarMaestro(this.maestro).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Maestro actualizado exitosamente");
        this.router.navigate(["maestros"]);
      },
      (error) => {
        // Manejar errores de la API
        alert("Error al actualizar maestro");
        console.error("Error al actualizar maestro: ", error);
      }
    );
  }

  showPassword(){
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    } else {
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar(){
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    } else {
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public changeFecha(event: any){

    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
  }

  // Función corregida para manejar los checkboxes
  public checkboxChange(event: any){
    const valor = event.source.value;

    // Asegurar que materias_json está inicializado
    if(!this.maestro.materias_json){
      this.maestro.materias_json = [];
    }

    if(event.checked){
      // Agregar si no existe
      if(!this.maestro.materias_json.includes(valor)){
        this.maestro.materias_json.push(valor);
      }
    } else {
      // Remover
      const index = this.maestro.materias_json.indexOf(valor);
      if(index > -1){
        this.maestro.materias_json.splice(index, 1);
      }
    }
  }

  public revisarSeleccion(nombre: string): boolean{
    if(this.maestro.materias_json && Array.isArray(this.maestro.materias_json)){
      return this.maestro.materias_json.includes(nombre);
    }
    return false;
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32
    ) {
      event.preventDefault();
    }
  }

  // Función para los campos solo de datos alfabeticos
  public soloLetrasNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      !(charCode >= 48 && charCode <= 57) && // Números
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}
