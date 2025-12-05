import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventoService } from 'src/app/services/evento.service';
import { EliminarEditarEventoComponent } from '../../modals/eliminar-editar-evento/eliminar-editar-evento.component';

@Component({
  selector: 'app-evento-academico',
  templateUrl: './evento-academico.component.html',
  styleUrls: ['./evento-academico.component.scss']
})
export class EventoAcademicoComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];
  public orden: boolean = true; //Variable para el ordenamiento

  //Para la tabla
   // NUEVO: Definir todas las columnas disponibles
  private allColumns: string[] = [
    'nombre',
    'numero_participantes',
    'tipo',
    'fecha',
    'hora_inicio',
    'hora_fin',
    'lugar',
    'nombre_responsable',
    'editar',
    'eliminar'
  ];

  // Columnas base (sin editar/eliminar)
  private columnasBase: string[] = [
    'nombre',
    'numero_participantes',
    'tipo',
    'fecha',
    'hora_inicio',
    'hora_fin',
    'lugar',
    'nombre_responsable'
  ];

  // Columnas de administración
  private columnasAdmin: string[] = ['editar', 'eliminar'];

  // displayedColumns ahora se configura dinámicamente
  displayedColumns: string[] = [];

  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_eventos as DatosUsuario[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public facadeService: FacadeService,
    public eventoService: EventoService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.configurarColumnas();
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener eventos
    this.obtenerEventos();

    this.dataSource.filterPredicate = (dato, filtro) => {
      const texto = filtro.toLowerCase();
      return (
        (dato.nombre).toLowerCase().includes(texto) ||
        (dato.nombre_responsable).toLowerCase().includes(texto)
      );
    };
  }

  private configurarColumnas(): void {
    // Siempre mostrar las columnas base
    this.displayedColumns = [...this.columnasBase];

    // Agregar columnas de administración solo si es admin o maestro
    if (this.canSeeAdminItems()) {
      this.displayedColumns.push(...this.columnasAdmin);
    }

    console.log('Columnas visibles para rol', this.rol, ':', this.displayedColumns);
  }

  public filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  // Consumimos el servicio para obtener los alumnos
  //Obtener alumnos
  public obtenerEventos() {
    this.eventoService.obtenerListaEventos().subscribe(
      (response) => {
        console.log("Respuesta al obtener la lista de eventos: ", response);
        if(this.canSeeTeacherItems()){
          this.lista_eventos = response.filter(evento => evento.publico_objetivo.includes("Profesores") || evento.publico_objetivo.includes("Publico general"));
          console.log("Eventos filtrados para maestro:", this.lista_eventos);
        }
        if(this.canSeeStudentItems()){
          this.lista_eventos = [...this.lista_eventos, ...response.filter(evento => evento.publico_objetivo.includes("Estudiantes") || evento.publico_objetivo.includes("Publico general") )];
          console.log("Eventos filtrados para estudiante:", this.lista_eventos);
        }

        this.lista_eventos = Array.from(
          new Map(this.lista_eventos.map(e => [e.id, e])).values()
        );

        if (this.lista_eventos.length > 0) {
          this.dataSource.data = this.lista_eventos;
          this.dataSource.paginator = this.paginator;
        }
      }, (error) => {
        console.error("Error al obtener la lista de eventos: ", error);
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  public goEditar(idUser: number) {
    const userId = Number(this.facadeService.getUserId());
        console.log("Navegando a editar administrador con ID:", idUser, "UserIsd:", userId);

    if (this.rol === 'administrador' || this.rol === 'maestros' ) {
      this.router.navigate(["registro-evento/" + idUser]);
    }else{
      alert("No tienes permisos para actualizar este evento.");
    }

  }

 public ordenar(tipo: string) {


    this.lista_eventos.sort((a, b) => {
      const nombreA = `${a.nombre}`.toLowerCase();
      const nombreB = `${b.nombre}`.toLowerCase();
      if (this.orden) {
        return nombreB.localeCompare(nombreA);
       } else {
         return nombreA.localeCompare(nombreB);
       }
    });


    this.orden = !this.orden;
    this.dataSource.data = [...this.lista_eventos];
    this.dataSource.paginator = this.paginator;
  }

  public delete(idEvento: number) {
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || this.rol === 'maestros') {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarEditarEventoComponent,{
        data: {id: idEvento, opcion: 'eliminar', evento: null}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          ("Evento eliminado");
          alert("Evento eliminado correctamente.");
          //Recargar página
          window.location.reload();
        }else{
          alert("Evento  no se ha podido eliminar.");
          ("No se eliminó el evento");
        }
      });
    }else{
      alert("No tienes permisos para eliminar este alumno.");
    }
  }

  // Role helpers
  isAdmin(): boolean {
    return this.rol === 'administrador';
  }
  isTeacher(): boolean {
    return this.rol === 'maestros';
  }
  isStudent(): boolean {
    return this.rol === 'alumnos';
  }
  canSeeAdminItems(): boolean {
    return this.isAdmin();
  }
  canSeeTeacherItems(): boolean {
    return this.isAdmin() || this.isTeacher();
  }
  canSeeStudentItems(): boolean {
    return this.isAdmin() || this.isStudent();
  }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  nombre: string;
  numero_participantes: number;
  tipo: string;
  fecha: string,
  hora_inicio: string,
  hora_fin: string,
  lugar: string,
  nombre_responsable: string,

}

