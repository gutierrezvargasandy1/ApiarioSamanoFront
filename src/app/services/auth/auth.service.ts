import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; // ✅ IMPORTAR

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

  private apiUrl = 'http://localhost:8085/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object // ✅ INYECTAR PLATFORM_ID
  ) {}

  login(credentials: LoginRequest): Observable<ResponseDTO<any>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ResponseDTO<any>>(`${this.apiUrl}/login`, credentials, { headers });
  }

  iniciarRecuperacion(email: string): Observable<ResponseDTO<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email };
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/recuperar`, body, { headers });
  }

  verificarOtpYCambiarContrasena(
    email: string,
    otp: string,
  ): Observable<ResponseDTO<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, otp };
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/recuperar/verificar`, body, { headers });
  }

  cambiarContrasena(email: string, nuevaContrasena: string, otp: string): Observable<ResponseDTO<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, nuevaContrasena, otp };
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/recuperar/cambiar`, body, { headers });
  }

  // ✅ MÉTODOS CORREGIDOS PARA SSR
  guardarToken(token: string | { token: string }): void {
    // ✅ VERIFICAR SI ESTAMOS EN EL NAVEGADOR
    if (isPlatformBrowser(this.platformId)) {
      const tokenString = typeof token === 'string' ? token : token.token;
      console.log(tokenString);
      localStorage.setItem('token', tokenString);
    }
  }

  obtenerToken(): string | null {
    // ✅ VERIFICAR SI ESTAMOS EN EL NAVEGADOR
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  cerrarSesion(): void {
    // ✅ VERIFICAR SI ESTAMOS EN EL NAVEGADOR
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        + '='.repeat((4 - (payload.length % 4)) % 4);

      const json = atob(base64);
      const decoded = JSON.parse(json);

      return decoded;
    } catch (e) {
      console.error(' Error al decodificar el JWT:', e);
      return null;
    }
  }

  getRoleFromToken(): string | null {
    // ✅ VERIFICAR SI ESTAMOS EN EL NAVEGADOR
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const token = this.obtenerToken();
    if (!token) {
      console.warn('⚠️ No se encontró token.');
      return null;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      console.warn('⚠️ No se pudo decodificar el token.');
      return null;
    }

    let role = payload.rol || payload.role || payload.roles || payload.authorities || null;

    if (!role) return null;

    if (typeof role === 'object') {
      if (Array.isArray(role)) role = role[0];
      else role = role.nombre || role.tipo || JSON.stringify(role);
    }

    return String(role).trim();
  }

  getEstadoFromToken(): boolean | null {
    // ✅ VERIFICAR SI ESTAMOS EN EL NAVEGADOR
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const token = this.obtenerToken();
    if (!token) {
      console.warn('⚠️ No se encontró token.');
      return null;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      console.warn('⚠️ No se pudo decodificar el token.');
      return null;
    }

    let estado = payload.estado;

    if (estado === undefined || estado === null) return null;

    // Convertir a boolean si es necesario
    if (typeof estado === 'string') {
      estado = estado.toLowerCase() === 'true';
    } else {
      estado = Boolean(estado);
    }

    return estado;
  }

  cambiarContrasenaTemporal(
    email: string,
    contrasenaTemporal: string,
    nuevaContrasena: string
  ): Observable<ResponseDTO<string>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, contrasenaTemporal, nuevaContrasena };

    return this.http.post<ResponseDTO<string>>(
      `${this.apiUrl}/recuperar/cambiar-temporal`,
      body,
      { headers }
    );
  }
}