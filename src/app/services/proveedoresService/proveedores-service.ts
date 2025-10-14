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
  fotografia?: File | string; // File para enviar, string para Base64 existente
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
      'Authorization': `Bearer ${token}`
    });
  }

  private getJsonHeaders(): HttpHeaders {
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

  // Crear un proveedor con imagen
  crearProveedor(proveedor: ProveedorRequest): Observable<Proveedor> {
    const formData = this.createFormData(proveedor);
    return this.http.post<ApiResponse<Proveedor>>(this.baseUrl, formData, { 
      headers: this.getHeaders() // No Content-Type, se establece automáticamente
    }).pipe(map(res => res.data));
  }

  // Actualizar un proveedor con imagen
  actualizarProveedor(id: number, proveedor: ProveedorRequest): Observable<Proveedor> {
    const formData = this.createFormData(proveedor);
    return this.http.put<ApiResponse<Proveedor>>(`${this.baseUrl}/${id}`, formData, { 
      headers: this.getHeaders() // No Content-Type, se establece automáticamente
    }).pipe(map(res => res.data));
  }

  // Eliminar un proveedor
  eliminarProveedor(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(map(() => undefined));
  }

  // Método privado para crear FormData
  private createFormData(proveedor: ProveedorRequest): FormData {
    const formData = new FormData();
    
    // Agregar campos de texto
    formData.append('nombreEmpresa', proveedor.nombreEmpresa);
    formData.append('numTelefono', proveedor.numTelefono || '');
    formData.append('materialProvee', proveedor.materialProvee || '');

    // Agregar archivo si es un File
    if (proveedor.fotografia instanceof File) {
      formData.append('fotografia', proveedor.fotografia);
    }
    // Si es string Base64 (de una imagen existente o preview), convertirlo a File
    else if (typeof proveedor.fotografia === 'string' && proveedor.fotografia.startsWith('data:image')) {
      const file = this.base64ToFile(proveedor.fotografia, 'fotografia.jpg');
      formData.append('fotografia', file);
    }
    // Si es string pero no Base64 (probablemente vacío o undefined)
    else if (proveedor.fotografia === '' || proveedor.fotografia === undefined) {
      // No agregamos el campo fotografia, el backend lo manejará como null
    }

    return formData;
  }

  // Convertir Base64 a File
  private base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  // Método opcional para crear proveedor sin imagen (si necesitas)
  crearProveedorSinImagen(proveedor: Omit<ProveedorRequest, 'fotografia'>): Observable<Proveedor> {
    return this.http.post<ApiResponse<Proveedor>>(this.baseUrl, proveedor, { 
      headers: this.getJsonHeaders() 
    }).pipe(map(res => res.data));
  }
}