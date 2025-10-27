import { Component, OnInit } from '@angular/core';
import { ApiarioService } from '../../services/apiariosService/apiario-service';
import { ToastService } from '../../services/toastService/toast-service';

// Interfaces actualizadas según el servicio
interface RecetaMedicamento {
  id: number;
  receta: Receta;
  idMedicamento: number;
  medicamentoInfo: any;
}

interface Receta {
  id: number;
  descripcion: string;
  fechaDeCreacion: string;
  medicamentos: RecetaMedicamento[];
}

interface HistorialMedico {
  id: number;
  fechaAplicacion: string;
  notas: string;
}

interface Apiario {
  id: number;
  numeroApiario: number;
  ubicacion: string;
  salud: string;
  receta: Receta | null;
  historialMedico: HistorialMedico | null;
}

interface ApiarioRequest {
  numeroApiario: number;
  ubicacion: string;
  salud: string;
}

interface RecetaRequest {
  descripcion: string;
  medicamentos: MedicamentoRequest[];
}

interface MedicamentoRequest {
  id: number;
}

@Component({
  selector: 'app-apiarios',
  standalone: false,
  templateUrl: './apiarios.html',
  styleUrl: './apiarios.css'
})
export class Apiarios implements OnInit {
  // Estado de la aplicación
  apiarios: Apiario[] = [];
  apiarioSeleccionado: Apiario | null = null;
  
  // Modales
  mostrarModalApiario: boolean = false;
  mostrarModalReceta: boolean = false;
  
  // Edición
  apiarioEditando: Apiario | null = null;
  
  // Formularios
  formApiario = {
    numeroApiario: 0,
    ubicacion: '',
    salud: ''
  };
  
  formReceta = {
    descripcion: '',
    medicamentos: [] as MedicamentoRequest[]
  };
  
  // Estado de carga
  cargando: boolean = false;

  constructor(
    private apiarioService: ApiarioService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarApiarios();
  }

  // ==================== CARGA DE DATOS ====================
  
  cargarApiarios(): void {
    this.cargando = true;
    
    this.apiarioService.obtenerTodos().subscribe({
      next: (response: any) => {
        if (response.codigo === 200 && response.data) {
          this.apiarios = response.data;
          console.log('✅ Apiarios cargados:', this.apiarios);
        } else {
          this.toastService.error('Error', response.descripcion || 'Error al cargar apiarios');
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar apiarios:', err);
        this.toastService.error('Error', 'No se pudieron cargar los apiarios');
        this.cargando = false;
      }
    });
  }

  // ==================== SELECCIÓN ====================
  
  seleccionarApiario(apiario: Apiario): void {
    this.apiarioSeleccionado = apiario;
    console.log('🐝 Apiario seleccionado:', apiario);
  }

  // ==================== MODAL APIARIO ====================
  
  abrirModalApiario(apiario?: Apiario): void {
    if (apiario) {
      this.apiarioEditando = apiario;
      this.formApiario = {
        numeroApiario: apiario.numeroApiario,
        ubicacion: apiario.ubicacion,
        salud: apiario.salud
      };
    } else {
      this.apiarioEditando = null;
      this.formApiario = {
        numeroApiario: 0,
        ubicacion: '',
        salud: ''
      };
    }
    this.mostrarModalApiario = true;
  }

  cerrarModalApiario(): void {
    this.mostrarModalApiario = false;
    this.apiarioEditando = null;
    this.formApiario = {
      numeroApiario: 0,
      ubicacion: '',
      salud: ''
    };
  }

  guardarApiario(): void {
    if (!this.formApiario.ubicacion || !this.formApiario.salud || !this.formApiario.numeroApiario) {
      this.toastService.warning('Atención', 'Por favor complete todos los campos');
      return;
    }

    const request: ApiarioRequest = {
      numeroApiario: this.formApiario.numeroApiario,
      ubicacion: this.formApiario.ubicacion,
      salud: this.formApiario.salud
    };

    this.cargando = true;

    if (this.apiarioEditando) {
      // Actualizar apiario existente
      this.apiarioService.modificarApiario(this.apiarioEditando.id, request).subscribe({
        next: (response: any) => {
          if (response.codigo === 200) {
            this.toastService.success('Éxito', 'Apiario actualizado correctamente');
            this.cargarApiarios();
            this.cerrarModalApiario();
          } else {
            this.toastService.error('Error', response.descripcion || 'Error al actualizar apiario');
          }
          this.cargando = false;
        },
        error: (err: any) => {
          console.error('❌ Error al actualizar apiario:', err);
          this.toastService.error('Error', 'No se pudo actualizar el apiario');
          this.cargando = false;
        }
      });
    } else {
      // Crear nuevo apiario
      this.apiarioService.crearApiario(request).subscribe({
        next: (response: any) => {
          if (response.codigo === 200) {
            this.toastService.success('Éxito', 'Apiario creado correctamente');
            this.cargarApiarios();
            this.cerrarModalApiario();
          } else {
            this.toastService.error('Error', response.descripcion || 'Error al crear apiario');
          }
          this.cargando = false;
        },
        error: (err: any) => {
          console.error('❌ Error al crear apiario:', err);
          this.toastService.error('Error', 'No se pudo crear el apiario');
          this.cargando = false;
        }
      });
    }
  }

  editarApiario(apiario: Apiario, event: Event): void {
    event.stopPropagation();
    this.abrirModalApiario(apiario);
  }

  eliminarApiario(apiario: Apiario, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar el apiario #${apiario.numeroApiario}?`)) {
      return;
    }

    this.cargando = true;
    
    this.apiarioService.eliminarApiario(apiario.id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          this.apiarios = this.apiarios.filter(a => a.id !== apiario.id);
          
          if (this.apiarioSeleccionado?.id === apiario.id) {
            this.apiarioSeleccionado = null;
          }
          
          this.toastService.success('Éxito', 'Apiario eliminado correctamente');
        } else {
          this.toastService.error('Error', response.descripcion || 'Error al eliminar apiario');
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al eliminar apiario:', err);
        this.toastService.error('Error', 'No se pudo eliminar el apiario');
        this.cargando = false;
      }
    });
  }

  // ==================== MODAL RECETA ====================
  
  abrirModalReceta(apiario: Apiario, event: Event): void {
    event.stopPropagation();
    this.apiarioSeleccionado = apiario;
    this.formReceta = {
      descripcion: '',
      medicamentos: []
    };
    this.mostrarModalReceta = true;
  }

  cerrarModalReceta(): void {
    this.mostrarModalReceta = false;
    this.formReceta = {
      descripcion: '',
      medicamentos: []
    };
  }

  // Método para agregar medicamento al formulario
  agregarMedicamento(): void {
    this.formReceta.medicamentos.push({ id: 0 });
  }

  // Método para remover medicamento del formulario
  removerMedicamento(index: number): void {
    this.formReceta.medicamentos.splice(index, 1);
  }
  

  guardarReceta(): void {
    if (!this.formReceta.descripcion || this.formReceta.medicamentos.length === 0) {
      this.toastService.warning('Atención', 'Por favor complete la descripción y agregue al menos un medicamento');
      return;
    }

    // Validar que todos los medicamentos tengan ID
    const medicamentosInvalidos = this.formReceta.medicamentos.some(med => !med.id || med.id === 0);
    if (medicamentosInvalidos) {
      this.toastService.warning('Atención', 'Todos los medicamentos deben tener un ID válido');
      return;
    }

    if (!this.apiarioSeleccionado) {
      this.toastService.error('Error', 'Debe seleccionar un apiario');
      return;
    }

    const request: RecetaRequest = {
      descripcion: this.formReceta.descripcion,
      medicamentos: this.formReceta.medicamentos
    };

    this.cargando = true;

    this.apiarioService.agregarReceta(this.apiarioSeleccionado.id, request).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          this.toastService.success('Éxito', 'Receta agregada correctamente');
          this.cargarApiarios();
          this.cerrarModalReceta();
          
          // Actualizar apiario seleccionado
          setTimeout(() => {
            const apiarioActualizado = this.apiarios.find(a => a.id === this.apiarioSeleccionado?.id);
            if (apiarioActualizado) {
              this.apiarioSeleccionado = apiarioActualizado;
            }
          }, 100);
        } else {
          this.toastService.error('Error', response.descripcion || 'Error al agregar receta');
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al agregar receta:', err);
        this.toastService.error('Error', 'No se pudo agregar la receta');
        this.cargando = false;
      }
    });
  }

  eliminarReceta(apiario: Apiario): void {
    if (!confirm('¿Marcar esta receta como cumplida?')) {
      return;
    }

    this.cargando = true;

    this.apiarioService.eliminarRecetaCumplida(apiario.id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          this.toastService.success('Éxito', 'Receta marcada como cumplida y agregada al historial');
          this.cargarApiarios();
          
          // Actualizar apiario seleccionado
          setTimeout(() => {
            const apiarioActualizado = this.apiarios.find(a => a.id === apiario.id);
            if (apiarioActualizado) {
              this.apiarioSeleccionado = apiarioActualizado;
            }
          }, 100);
        } else {
          this.toastService.error('Error', response.descripcion || 'Error al eliminar receta');
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al eliminar receta:', err);
        this.toastService.error('Error', 'No se pudo eliminar la receta');
        this.cargando = false;
      }
    });
  }

  // ==================== UTILIDADES ====================
  
  obtenerClaseBadge(salud: string): string {
    switch (salud.toLowerCase()) {
      case 'buena':
        return 'badge-buena';
      case 'regular':
        return 'badge-regular';
      case 'crítica':
      case 'critica':
        return 'badge-critica';
      default:
        return 'badge-regular';
    }
  }

  tieneRecetaActiva(apiario: Apiario): boolean {
    return !!apiario.receta;
  }

  contarMedicamentos(apiario: Apiario): number {
    return apiario.receta?.medicamentos?.length || 0;
  }

  obtenerDescripcionReceta(apiario: Apiario): string {
    return apiario.receta?.descripcion || 'Sin receta activa';
  }

  obtenerFechaReceta(apiario: Apiario): string {
    return apiario.receta?.fechaDeCreacion || '';
  }

  // Método para formatear fecha si es necesario
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}