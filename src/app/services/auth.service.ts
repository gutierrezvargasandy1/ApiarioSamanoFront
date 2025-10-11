
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  email: string;
  contrasena: string;
}

interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

interface ResponseDTO<T> {
  mensaje: string;
  datos: T;
  exito: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://192.168.1.207:8081/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<ResponseDTO<AuthResponse>> {
    return this.http.post<ResponseDTO<AuthResponse>>(`${this.apiUrl}/login`, credentials);
  }

  // Puedes agregar funciones extra si las necesitas después:
  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion() {
    localStorage.removeItem('token');
  }
}
