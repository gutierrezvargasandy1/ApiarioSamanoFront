import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface CodigoResponse<T> {
  codigo: number;
  descripcion: string;
  data: T;
}

export interface SaludOllama {
  ollamaDisponible: boolean;
  mensaje: string;
}

export interface DiagnosticoCompleto {
  diagnostico: any;
  timestamp: string;
  testConexion?: string;
  estado: string;
  testExitoso?: boolean;
  errorDetalle?: string;
  solucion?: string;
}

export interface TestGeneracion {
  ollamaDisponible: boolean;
  mensaje?: string;
  respuestaIA?: string;
  longitudRespuesta?: number;
  tiempoProcesamiento?: string;
  estado?: string;
  error?: string;
  tipoError?: string;
  stackTrace?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IaService {

  private apiUrl = 'http://localhost:8081/api/ia-analisis';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken(); 
    console.log("este es el token que se manda", token);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  
    });
  }

  // 📊 Obtener análisis estadístico de apiarios
  obtenerAnalisisEstadistico(): Observable<CodigoResponse<any>> {
    return this.http.get<CodigoResponse<any>>(
      `${this.apiUrl}/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  // 🔮 Obtener predicciones de salud
  obtenerPrediccionesSalud(): Observable<CodigoResponse<any>> {
    return this.http.get<CodigoResponse<any>>(
      `${this.apiUrl}/predicciones`,
      { headers: this.getHeaders() }
    );
  }

  // 💡 Obtener recomendaciones personalizadas para un apiario
  obtenerRecomendacionesPersonalizadas(idApiario: number): Observable<CodigoResponse<any>> {
    return this.http.get<CodigoResponse<any>>(
      `${this.apiUrl}/recomendaciones/${idApiario}`,
      { headers: this.getHeaders() }
    );
  }

  // 🩺 Verificar salud de Ollama
  verificarSaludOllama(): Observable<CodigoResponse<SaludOllama>> {
    return this.http.get<CodigoResponse<SaludOllama>>(
      `${this.apiUrl}/salud`,
      { headers: this.getHeaders() }
    );
  }

  // 🔍 Diagnóstico completo del sistema IA
  diagnosticoCompleto(): Observable<CodigoResponse<DiagnosticoCompleto>> {
    return this.http.get<CodigoResponse<DiagnosticoCompleto>>(
      `${this.apiUrl}/diagnostico`,
      { headers: this.getHeaders() }
    );
  }

  // 📋 Diagnóstico extendido del sistema IA
  diagnosticoExtendido(): Observable<CodigoResponse<any>> {
    return this.http.get<CodigoResponse<any>>(
      `${this.apiUrl}/diagnostico-extendido`,
      { headers: this.getHeaders() }
    );
  }

  // 🧪 Test simple de generación
  testGeneracionSimple(): Observable<CodigoResponse<TestGeneracion>> {
    return this.http.get<CodigoResponse<TestGeneracion>>(
      `${this.apiUrl}/test-simple`,
      { headers: this.getHeaders() }
    );
  }
}