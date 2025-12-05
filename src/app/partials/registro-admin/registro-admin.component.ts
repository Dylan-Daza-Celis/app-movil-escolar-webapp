import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-registro-admin',
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public admin:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private administradoresService: AdministradoresService,
    private facadeService: FacadeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    //El primer if valida si existe un parámetro en la URL
    if(this.activatedRoute.snapshot.params['id'] != undefined && this.activatedRoute.snapshot.params['id'] != -1){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];

      //Al iniciar la vista asignamos los datos del user
      this.admin = this.datos_user;
    }else{
      this.admin = this.administradoresService.esquemaAdmin();
      this.admin.rol = this.rol;
      this.token = this.facadeService.getSessionToken();
    }
    //Imprimir datos en consola

  }

  public regresar(){
    this.location.back();
  }

  //Funciones para password
  public showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public registrar(){
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    // Validar si las contraseñas coinciden

    if(this.admin.password != this.admin.confirmar_password){
      alert('Las contraseñas no coinciden');
      return false;
    }

    // Consumir servicio para registrar administradores
    this.administradoresService.registrarAdmin(this.admin).subscribe({
      next: (response:any) => {
        //Aquí va la ejecución del servicio si todo es correcto
        alert('Administrador registrado con éxito');

        //Validar si se registro que entonces navegue a la lista de administradores
        if(this.token  && this.token !== ""){
          this.router.navigate(["administradores"]);
        }else{
          this.router.navigate(['/']);
        }
      },
      error: (error:any) => {
        if(error.status === 422){
          this.errors = error.error.errors;
        } else {
          alert('Error al registrar el administrador');
        }
      }
    });
  }

  public actualizar(){
    // Validación de los datos
    this.errors = {};
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    // Ejecutamos el servicio de actualización
    this.administradoresService.actualizarAdmin(this.admin).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Administrador actualizado exitosamente");

        this.router.navigate(["administrador"]);
      },
      (error) => {
        // Manejar errores de la API
        alert("Error al actualizar administrador");
        console.error("Error al actualizar administrador: ", error);
      }
    );
  }

  public validarSoloLetras(campo: string, event: any) {
    const regexLetras = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g;
    const input = event.target;
    const valorOriginal = input.value;
    const valorLimpio = valorOriginal.replace(regexLetras, '');

    if (valorOriginal !== valorLimpio) {
      this.admin[campo] = valorLimpio;
      input.value = valorLimpio;
    }
  }

  public validarSoloNumeros(campo: string, event: any) {
      const regexNumeros = /[^0-9]/g;
      const input = event.target;
      const valorOriginal = input.value;

      const valorLimpio = valorOriginal.replace(regexNumeros, '');

      if (valorOriginal !== valorLimpio) {
          this.admin[campo] = valorLimpio;
          input.value = valorLimpio;
      }
  }

  public validarLetrasYNumeros(campo: string, event: any) {
      const regexLetrasNumeros = /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g;
      const input = event.target;
      const valorOriginal = input.value;

      const valorLimpio = valorOriginal.replace(regexLetrasNumeros, '');

      if (valorOriginal !== valorLimpio) {
          this.admin[campo] = valorLimpio;
          input.value = valorLimpio;
      }
  }


}
