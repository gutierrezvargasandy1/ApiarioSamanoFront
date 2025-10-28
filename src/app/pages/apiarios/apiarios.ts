import { Component, OnInit } from '@angular/core';
import { ApiarioService } from '../../services/apiariosService/apiario-service';
import { MedicamentosService, MedicamentosResponse } from '../../services/almaceneService/MedicamentosService/medicamentos-service';
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
  
  // Lista de medicamentos disponibles
  medicamentosDisponibles: MedicamentosResponse[] = [];
  cargandoMedicamentos: boolean = false;
  
  // Estado de carga
  cargando: boolean = false;

  // Modal IA
  mostrarModalSugerencias: boolean = false;
  nuevaPregunta: string = '';
  mensajesChat: any[] = [];

  sugerenciasAutomaticas = [
    {
        titulo: 'Optimización de Alimentación',
        descripcion: 'Basado en la ubicación y estado de salud, recomiendo ajustar el suplemento alimenticio.'
    },
    {
        titulo: 'Prevención de Enfermedades',
        descripcion: 'Considera implementar un programa de monitoreo para varroa durante los próximos 15 días.'
    },
    {
        titulo: 'Mejora de Productividad',
        descripcion: 'La ubicación actual es favorable, pero podrías aumentar la flora melífera en un 20%.'
    }
  ];

  constructor(
    private apiarioService: ApiarioService,
    private medicamentosService: MedicamentosService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarApiarios();
    this.cargarMedicamentosDisponibles();
  }

  // ==================== CARGA DE MEDICAMENTOS ====================
  
  cargarMedicamentosDisponibles(): void {
    this.cargandoMedicamentos = true;
    
    this.medicamentosService.obtenerTodos().subscribe({
      next: (response: any) => {
        if (response.codigo === 200 && response.data) {
          this.medicamentosDisponibles = response.data;
          console.log('💊 Medicamentos cargados:', this.medicamentosDisponibles);
        } else {
          this.toastService.error('Error', response.descripcion || 'Error al cargar medicamentos');
        }
        this.cargandoMedicamentos = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar medicamentos:', err);
        this.toastService.error('Error', 'No se pudieron cargar los medicamentos');
        this.cargandoMedicamentos = false;
      }
    });
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
    
    // Recargar medicamentos disponibles cada vez que se abre el modal
    this.cargarMedicamentosDisponibles();
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

  // Método para obtener nombre del medicamento por ID
  obtenerNombreMedicamento(id: number): string {
    const medicamento = this.medicamentosDisponibles.find(m => m.id === id);
    return medicamento ? medicamento.nombre : 'Medicamento no encontrado';
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

  // ==================== MODAL IA ====================

  abrirModalSugerencias() {
    this.mostrarModalSugerencias = true;
  }

  cerrarModalSugerencias() {
    this.mostrarModalSugerencias = false;
    this.nuevaPregunta = '';
    this.mensajesChat = [];
  }

  enviarPregunta(event?: any) {
    if (event) {
        event.preventDefault();
    }
    
    if (!this.nuevaPregunta.trim()) return;

    // Agregar mensaje del usuario
    this.mensajesChat.push({
        texto: this.nuevaPregunta,
        tiempo: 'Ahora',
        tipo: 'usuario'
    });

    // Simular respuesta de IA
    setTimeout(() => {
        this.mensajesChat.push({
            texto: 'He analizado tu consulta sobre el apiario. Basado en los datos, te recomiendo revisar el plan de alimentación y considerar una inspección más frecuente durante esta temporada.',
            tiempo: 'Ahora',
            tipo: 'ia'
        });
    }, 1000);

    this.nuevaPregunta = '';
  }

  // ==================== MÉTODOS AUXILIARES PARA EL TEMPLATE ====================

  // Verificar si un medicamento está duplicado
  esMedicamentoDuplicado(medicamentoId: number, indiceActual: number): boolean {
    if (!medicamentoId || medicamentoId === 0) return false;
    return this.formReceta.medicamentos.some((med, index) => 
      med.id === medicamentoId && index !== indiceActual
    );
  }

  // Obtener stock de un medicamento
  obtenerStockMedicamento(id: number): number | undefined {
    const medicamento = this.medicamentosDisponibles.find(m => m.id === id);
    return medicamento?.cantidad;
  }

  // Verificar si hay medicamentos duplicados en el índice actual
  tieneMedicamentoDuplicado(medicamentoId: number, indiceActual: number): boolean {
    if (!medicamentoId || medicamentoId === 0) return false;
    return this.formReceta.medicamentos.some((med, index) => 
      med.id === medicamentoId && index !== indiceActual
    );
  }

  // Verificar si hay medicamentos sin seleccionar
  tieneMedicamentosSinSeleccionar(): boolean {
    return this.formReceta.medicamentos.some(med => !med.id || med.id === 0);
  }

  // Verificar si hay medicamentos duplicados en toda la receta
  tieneMedicamentosDuplicados(): boolean {
    const ids = this.formReceta.medicamentos.map(med => med.id).filter(id => id > 0);
    return new Set(ids).size !== ids.length;
  }

  // Verificar si hay medicamentos inválidos
  tieneMedicamentosInvalidos(): boolean {
    return this.tieneMedicamentosSinSeleccionar() || this.tieneMedicamentosDuplicados();
  }

  // Contar medicamentos seleccionados
  contarMedicamentosSeleccionados(): number {
    return this.formReceta.medicamentos.filter(med => med.id > 0).length;
  }

  // Obtener lista de medicamentos seleccionados
  obtenerMedicamentosSeleccionados(): MedicamentoRequest[] {
    return this.formReceta.medicamentos.filter(med => med.id > 0);
  }
}