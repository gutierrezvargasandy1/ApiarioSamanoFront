import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service'; 

export interface ResponseDTO<T> {
  statusCode: number;
  message: string;
  description: string;
  data: T;
}

export interface AlmacenRequest {
  ubicacion: string;
  capacidad: number;
}

export interface Almacen {
  id: number;
  numeroSeguimiento: string;
  ubicacion: string;
  capacidad: number;
  herramientas: Herramientas[]| null;
  materiasPrimas: MateriasPrimas[]| null;
  medicamentos: Medicamentos[] | null;
}

export interface Herramientas {
id: number;
nombre:string;
foto: string| null;
almacen:Almacen | null;
proveedor:Proveedor|null;
}


export interface MateriasPrimas{
id:number;
nombre:string;
foto:string|null;
cantidad: number;
almacen : Almacen|null;
proveedor: Proveedor|null;
}

export interface Medicamentos {
id:number;
nombre:string;
descripcion:string;
almacen:Almacen| null;
proveedor:Proveedor|null;

}

export interface Proveedor {
  id:number;
  fotografia:string|null;
  nombreEmpresa:string;
  nombreReprecentate:string;
  numTelefono:string;
  materialProvee:string;
}


@Injectable({
  providedIn: 'root'
})
export class AlmacenService {

  private apiUrl = 'http://localhost:8081/api/almacenes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken(); 
    console.log("este es el token que se manda",token)
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  
    });
  }

  crearAlmacen(request: AlmacenRequest): Observable<ResponseDTO<Almacen>> {
    return this.http.post<ResponseDTO<Almacen>>(
      `${this.apiUrl}/crear`,
      request,
      { headers: this.getHeaders() }
    );
  }

  obtenerAlmacenes(): Observable<ResponseDTO<Almacen[]>> {
    console.log("obteniendo almacenes");
    return this.http.get<ResponseDTO<Almacen[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  obtenerAlmacenPorId(id: number): Observable<ResponseDTO<Almacen>> {
    return this.http.get<ResponseDTO<Almacen>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  eliminarAlmacen(id: number): Observable<ResponseDTO<void>> {
    return this.http.delete<ResponseDTO<void>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
