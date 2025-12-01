import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  constructor(private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService) { }

  public esquemaEvento() {
    return {
      'nombre': '',
      'numero_participantes': '',
      'tipo': '',
      'fecha': '',
      'lugar': '',
      'nombre_responsable': '',
      'descripcion': '',
      'publico_objetivo': [],
      'hora_inicio': '',
      'hora_fin': '',
      'programa_educativo': null,
    }
  }

  public validarEvento(data: any, editar: boolean) {

    let error: any = {};

    if (!this.validatorService.required(data["nombre"])) {
      error["nombre"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["numero_participantes"])) {
      error["numero_participantes"] = this.errorService.required;

    }
    if (!this.validatorService.required(data["tipo"])) {
      error["tipo"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["fecha"])) {
      error["fecha"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["lugar"])){
      error["lugar"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["nombre_responsable"])){
      error["nombre_responsable"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["descripcion"])) {
      error["descripcion"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["hora_fin"])){
      error["hora_fin"] = this.errorService.required;
    }

    if (!data["publico_objetivo"] || !Array.isArray(data["publico_objetivo"]) || data["publico_objetivo"].length === 0) {
      error["publico_objetivo"] = "Debes seleccionar al menos un público objetivo";

    }else if(data["publico_objetivo"].includes('Estudiantes')){

      if(!this.validatorService.required(data["programa_educativo"])){
        error["programa_educativo"] = this.errorService.required;
      }
    }


    return error;
  }

  public registrarEvento (data: any): Observable <any>{
    console.log('Registrando evento con data:', data);
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/evento/`, data, { headers });
  }

  // Petición para obtener un administrador por su ID
  public obtenerEventoPorID(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      ("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/evento/?id=${idEvento}`, { headers });
  }

  //Servicio para obtener la lista de maestros
  public obtenerListaEventos(): Observable<any>{
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers });
  }

  //Eliminar alumno
  public eliminarEvento(idEvento: number): Observable<any>{
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/evento/?id=${idEvento}`, { headers });
  }

   // Petición para actualizar un administrador
  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      ("No se encontró el token del usuario");
    }
    return this.http.put<any>(`${environment.url_api}/evento/`, data, { headers });
  }



}



