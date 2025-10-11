import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';


export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface ResponseDTO<T> {
  statusCode: number;
  message: string;
  description: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://192.168.1.207:8081/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<ResponseDTO<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ResponseDTO<string>>(
      `${this.apiUrl}/login`,
      credentials,  
      { headers }
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion(): void {
    //este metodo esta incompleto espera la implementacion del poid de back end 
    localStorage.removeItem('token');
  }
  // ya en tu AuthService actual
  /**
   * Decodifica la parte payload del JWT (base64url -> JSON).
   * NO verifica la firma, solo devuelve los claims.
   */
  private decodeJwtPayload(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      // base64url -> base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        // pad with '='
        + '='.repeat((4 - (payload.length % 4)) % 4);
      const json = atob(base64);
      console.log('JWT Payload JSON:', json);
      return JSON.parse(json);
    } catch (e) {
      console.error('Error decoding JWT payload', e);
      return null;
    }
  }

  /**
   * Intenta extraer el rol del token. Retorna null si no existe.
   * Busca en "rol", "role", "roles", "authorities".
   */
  getRoleFromToken(): string | null {
  const token = this.obtenerToken();
  console.log(token)
  console.log('Token obtenido:', token);

  if (!token) return null;

  const payload = this.decodeJwtPayload(token);
  if (!payload) return null;

  console.log('Payload decodificado:', payload);

  // 👇 Ajusta esta parte dependiendo de cómo venga tu campo de rol
  if (payload.rol) {
    // Si 'rol' es un objeto, extrae el nombre o tipo
    if (typeof payload.rol === 'object') {
      // Ejemplo: { nombre: "OPERADOR" }
      return payload.rol.nombre || payload.rol.tipo || JSON.stringify(payload.rol);
    }
    // Si es un arreglo (por ejemplo ["OPERADOR"])
    if (Array.isArray(payload.rol)) {
      return payload.rol[0];
    }
    // Si ya es string
    return payload.rol;
  }

  // Algunos backends usan "role" o "authorities"
  if (payload.role) return payload.role;

  return null;
}
}


