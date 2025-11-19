import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { EliminarUserModalComponent } from '../../modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];
  public orden: boolean = true; //Variable para el ordenamiento

  //Para la tabla
  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'curp', 'edad','ocupacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
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
    //Obtener alumnos
    this.obteneralumnos();

    this.dataSource.filterPredicate = (dato, filtro) => {
      const texto = filtro.toLowerCase();

      // Puedes ajustar los campos que quieres que entren en la búsqueda
      return (
        (dato.first_name).toLowerCase().includes(texto) ||
        (dato.last_name).toLowerCase().includes(texto)
      );
    };
  }

  public filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  // Consumimos el servicio para obtener los alumnos
  //Obtener alumnos
  public obteneralumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });


        this.dataSource.data = this.lista_alumnos;


        this.dataSource.paginator = this.paginator;
        }
      }, (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  public goEditar(idUser: number) {
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'alumnos' && userId === idUser)) {
      this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
    }else{
      alert("No tienes permisos para actualizar este alumno.");
    }

  }

 public ordenar(tipo: string) {
   if (tipo === 'nombre') {

     this.lista_alumnos.sort((a, b) => {
       const nombreA = `${a.first_name} ${a.last_name}`.toLowerCase();
       const nombreB = `${b.first_name} ${b.last_name}`.toLowerCase();

       if (this.orden) {
         return nombreB.localeCompare(nombreA);

        } else {
          return nombreA.localeCompare(nombreB);
        }

      });
    } else if (tipo === 'id') {
      this.lista_alumnos.sort((a, b) => {
        if (this.orden) {
          return a.clave_alumno - b.clave_alumno;
        } else {
          return b.clave_alumno - a.clave_alumno;
        }
      });
    }
      this.orden = !this.orden;
      
      this.dataSource.data = [...this.lista_alumnos];
      this.dataSource.paginator = this.paginator;
  }

  public delete(idUser: number) {
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    const userId = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'alumnos' && userId === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'alumnos'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result.isDelete){
        ("Alumno eliminado");
        alert("Alumno eliminado correctamente.");
        //Recargar página
        window.location.reload();
      }else{
        alert("Alumno no se ha podido eliminar.");
        ("No se eliminó el alumno");
      }
    });
    }else{
      alert("No tienes permisos para eliminar este alumno.");
    }
  }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number,
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  curp: string,
  edad: number,
  ocupacion: string,
}

