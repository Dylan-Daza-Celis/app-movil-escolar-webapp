import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Input,  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EventoService } from 'src/app/services/evento.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EliminarEditarEventoComponent } from '../../modals/eliminar-editar-evento/eliminar-editar-evento.component';


@Component({
  selector: 'app-registro-evento-screen',
  templateUrl: './registro-evento-screen.component.html',
  styleUrls: ['./registro-evento-screen.component.scss']
})
export class RegistroEventoScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public responsables: any[] = [];
  public evento:any= {};
  public errors:any={};
  public editar:boolean = false;
  public idEvento: number = 0;
  public programaVisible: boolean = false;
  public ano = new Date().getFullYear() ;
  public mes = new Date().getMonth() ;
  public dia = new Date().getDate() ;
  public minDate: Date = new Date(this.ano,this.mes, this.dia);
  public fechaPicker:Date = new Date();

  public tipos: any[] = [
    {value: '1', viewValue: 'Conferencia'},
    {value: '2', viewValue: 'Taller'},
    {value: '3', viewValue: 'Seminario'},
    {value: '4', viewValue: 'Concurso'},
  ];

  public participantes: any[] = [
    {value: '1', nombre: 'Estudiantes'},
    {value: '2', nombre: 'Profesores'},
    {value: '3', nombre: 'Publico general'},
  ];

  public programas: any[] = [
    {value: '1', viewValue: 'Ingeniería en Ciencias de la Computación'},
    {value: '2', viewValue: 'Licenciatura en Ciencias de la Computación'},
    {value: '3', viewValue: 'Ingeniería en Tecnologías de la Información'},
  ];

  constructor(
    public facadeService: FacadeService,
    private router: Router,
    public dialog: MatDialog,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    public maestrosService: MaestrosService,
    private eventoService: EventoService

  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

     if(this.activatedRoute.snapshot.params['id'] != undefined){
        this.editar = true;
        this.idEvento = this.activatedRoute.snapshot.params['id'];
        this.obtenerEventoPorID();
        console.log( this.evento);

     } else {
        this.evento = this.eventoService.esquemaEvento();
        this.token = this.facadeService.getSessionToken();

        // Asegurar que publico_objetivo esté inicializado como array
        this.evento.publico_objetivo = [];
     }
    this.obtenerResponsables();

  }

  //Obtener lista de usuarios
  public obtenerResponsables() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        console.log(response);
        this.responsables = response;
      },
      () => alert("No se pudo obtener la lista de administradores")
    );

    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        console.log(response);
        this.responsables = [...this.responsables,...response];
      },
      () => alert("No se pudo obtener la lista de maestros")
    );
  }


  public regresar(){
    this.location.back();
  }

  public registrar(){
    this.errors = {};
    // Asignar los participantes seleccionados al objeto evento antes de validar
    this.evento.publico_objetivo = [...this.evento.publico_objetivo];
    this.errors = this.eventoService.validarEvento(this.evento, this.editar);
    console.log(this.errors);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    // Consumir servicio para registrar maestros
    this.eventoService.registrarEvento(this.evento).subscribe({
      next: (response: any) => {
        alert('Evento registrado con éxito');
        if(this.token && this.token !== ""){
          this.router.navigate(["/eventos-academicos"]);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => {
        if(error.status === 422){
          this.errors = error.error.errors;
        } else {
          alert('Error al registrar el evento');
        }
      }
    });

  }

  public actualizar(){
    this.errors = {};

    // Asignar las materias seleccionadas al objeto maestro antes de validar
    this.evento.publico_objetivo = [...this.evento.publico_objetivo];

    this.errors = this.eventoService.validarEvento(this.evento, this.editar);

    if(Object.keys(this.errors).length > 0){
      return false;
    }
    const dialogRef = this.dialog.open(EliminarEditarEventoComponent,{
      data: {id: -1, opcion: 'editar', evento: this.evento}, //Se pasan valores a través del componente
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        ("Evento actualizado");
        alert("Evento actualizado correctamente.");
        //Recargar página
        this.router.navigate(["/eventos-academicos"]);
      }else{
        alert("Evento  no se ha podido actualizar.");
      }
    });
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event: any) {
     this.evento.fecha = event.value.toISOString().split("T")[0];
    this.fechaPicker = event.value;
  }

  public validarSoloLetras(campo: string, event: any) {
    const regexLetras = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g;
    const input = event.target;
    const valorOriginal = input.value;
    const valorLimpio = valorOriginal.replace(regexLetras, '');

    if (valorOriginal !== valorLimpio) {
      this.evento[campo] = valorLimpio;
      input.value = valorLimpio;
    }
  }

  public validarSoloNumeros(campo: string, event: any) {
    const regexNumeros = /[^0-9]/g;
    const input = event.target;
    const valorOriginal = input.value;
    const valorLimpio = valorOriginal.replace(regexNumeros, '');

    if (valorOriginal !== valorLimpio) {
        this.evento[campo] = valorLimpio;
        input.value = valorLimpio;
    }
  }

  public validarLetrasYNumeros(campo: string, event: any) {
    const regexLetrasNumeros = /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g;
    const input = event.target;
    const valorOriginal = input.value;
    const valorLimpio = valorOriginal.replace(regexLetrasNumeros, '');

    if (valorOriginal !== valorLimpio) {
      this.evento[campo] = valorLimpio;
      input.value = valorLimpio;
    }
  }

  public validarPuntuacion(campo: string, event: any) {
    const regexPuntuacion = /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\(\)\.,:;]/g;
    const input = event.target;
    const valorOriginal = input.value;
    const valorLimpio = valorOriginal.replace(regexPuntuacion, '');

    if (valorOriginal !== valorLimpio) {
      this.evento[campo] = valorLimpio;
      input.value = valorLimpio;
    }
}

  public checkboxChange(event: any){
    const valor = event.source.value;
    console.log("Revisando selección para: " + valor);
    // Asegurar que publico_objetivo está inicializado
    if(!this.evento.publico_objetivo){
      this.evento.publico_objetivo = [];
    }

    if(event.checked){
      // Agregar si no existe
      if(!this.evento.publico_objetivo.includes(valor)){
        this.evento.publico_objetivo.push(valor);
      }
      if(event.source.value === 'Estudiantes'){
        this.programaVisible = true;
      }
    } else {
      // Remover
      const index = this.evento.publico_objetivo.indexOf(valor);
      if(index > -1){
        this.evento.publico_objetivo.splice(index, 1);
      }
      if(event.source.value === 'Estudiantes'){
        this.programaVisible = false;
        this.evento.programa_educativo = null;
      }
    }
  }

   public revisarSeleccion(nombre: string): boolean{

    if(this.evento.publico_objetivo && Array.isArray(this.evento.publico_objetivo)){
      return this.evento.publico_objetivo.includes(nombre);
    }
    return false;
  }

    public obtenerEventoPorID() {
    //Lógica para obtener el usuario según su ID y rol
    //Aquí se haría la llamada al servicio correspondiente según el rol
      this.eventoService.obtenerEventoPorID(this.idEvento).subscribe(
        (response) => {
          console.log(response);
          this.evento = response;
          try {
            // Si el backend lo envía como string JSON, conviértelo a array
            if (typeof this.evento.publico_objetivo === 'string') {
              this.evento.publico_objetivo = JSON.parse(this.evento.publico_objetivo);
              //verificar si incluye Estudiantes para mostrar el programa educativo
              if(this.evento.publico_objetivo.includes('Estudiantes')){
                this.programaVisible = true;
              }
            }

            // Si no es array (por seguridad), inicializarlo vacío
            if (!Array.isArray(this.evento.publico_objetivo)) {
              this.evento.publico_objetivo = [];
            }
           } catch (error) {
            console.warn('Error parseando publico_objetivo:', error);
            this.evento.publico_objetivo = [];
          }
        }, (error) => {
          alert("No se pudo obtener el evento seleccionado");
        }
      );
    }
}
