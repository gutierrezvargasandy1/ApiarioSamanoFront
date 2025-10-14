import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Proveedor {
  id?: number;
  nombreEmpresa: string;
  numTelefono: string;
  materialProvee: string;
  fotografia?: string; // Base64 string
}

export interface ProveedorRequest {
  id?: number;
  nombreEmpresa: string;
  numTelefono: string;
  materialProvee: string;
  fotografia?: string; // Base64 string
}

interface ApiResponse<T> {
  codigo: number;
  descripcion: string;
  data: T;
  mensaje: string | null;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  private baseUrl = 'http://localhost:8086/api/proveedores';

  constructor(private http: HttpClient) { }

  private obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): HttpHeaders {
    const token = this.obtenerToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Listar todos los proveedores
  listarProveedores(): Observable<Proveedor[]> {
    return this.http.get<ApiResponse<Proveedor[]>>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(map(res => res.data || []));
  }

  // Obtener un proveedor por ID
  obtenerProveedorPorId(id: number): Observable<Proveedor> {
    return this.http.get<ApiResponse<Proveedor>>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  // Crear un proveedor
  crearProveedor(proveedor: ProveedorRequest): Observable<Proveedor> {
    return this.http.post<ApiResponse<Proveedor>>(this.baseUrl, proveedor, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  // Actualizar un proveedor
  actualizarProveedor(id: number, proveedor: ProveedorRequest): Observable<Proveedor> {
    return this.http.put<ApiResponse<Proveedor>>(`${this.baseUrl}/${id}`, proveedor, { headers: this.getHeaders() })
      .pipe(map(res => res.data));
  }

  // Eliminar un proveedor
  eliminarProveedor(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(map(() => undefined));
  }
}
