import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventoService } from 'src/app/services/evento.service';


@Component({
  selector: 'app-eliminar-editar-evento',
  templateUrl: './eliminar-editar-evento.component.html',
  styleUrls: ['./eliminar-editar-evento.component.scss']
})
export class EliminarEditarEventoComponent implements OnInit {

  public opcion: string = "";

  constructor(
    private eventoService: EventoService,
    private dialogRef: MatDialogRef<EliminarEditarEventoComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.opcion = this.data.opcion;
  }

  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }

  public eliminarEvento(){
    // Remover el foco del botón activo
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Entonces elimina un evento
    this.eventoService.eliminarEvento(this.data.id).subscribe(
      (response)=>{
        this.dialogRef.close({isDelete:true});
      }, (error)=>{
        this.dialogRef.close({isDelete:false});
      }
    );
  }

  public editarEvento(){
    // Ejecutamos el servicio de actualización
    this.eventoService.actualizarEvento(this.data.evento).subscribe(
      (response) => {
        this.dialogRef.close({isDelete:true});
      },
      (error) => {
        this.dialogRef.close({isDelete:false});
      }
    );

  }

}
