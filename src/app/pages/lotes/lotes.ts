import { Component, OnInit } from '@angular/core';
import { LotesService, LoteRequest, Lote, LoteConAlmacenResponse } from '../../services/produccionService/lotesService/lotes-service';
import { AlmacenService, Almacen } from '../../services/almaceneService/almacen-service'; // Importar el servicio de almacenes

@Component({
  selector: 'app-lotes',
  standalone: false,
  templateUrl: './lotes.html',
  styleUrl: './lotes.css'
})
export class Lotes implements OnInit {
  lotes: Lote[] = [];
  loteSeleccionado: LoteConAlmacenResponse | null = null;
  terminoBusqueda: string = '';
  mostrarModalLote: boolean = false;
  loteEditando: Lote | null = null;
  cargando: boolean = false;
  almacenes: Almacen[] = []; // Array para almacenar los almacenes
  
  formLote: LoteRequest = {
    idAlmacen: 0,
    tipoProducto: ''
  };

  constructor(
    private lotesService: LotesService,
    private almacenService: AlmacenService // Inyectar el servicio de almacenes
  ) {}

  ngOnInit(): void {
    this.cargarLotes();
  }

  // Cargar todos los lotes
  cargarLotes(): void {
    this.cargando = true;
    this.lotesService.listarLotes().subscribe({
      next: (data) => {
        this.lotes = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar lotes:', error);
        this.cargando = false;
      }
    });
  }

  // Método para cargar almacenes - IMPLEMENTADO
  cargarAlmacenes(): void {
    this.cargando = true;
    this.almacenService.obtenerAlmacenes().subscribe({
      next: (response) => {
        if (response.data) {
          this.almacenes = response.data;
          console.log('Almacenes cargados:', this.almacenes);
        } else {
          console.warn('No se encontraron almacenes');
          this.almacenes = [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar almacenes:', error);
        alert('Error al cargar la lista de almacenes');
        this.cargando = false;
        this.almacenes = [];
      }
    });
  }

  // Seleccionar un lote para ver detalles
  seleccionarLote(lote: Lote): void {
    if (lote.id) {
      this.cargando = true;
      this.lotesService.obtenerLoteConAlmacen(lote.id).subscribe({
        next: (data) => {
          this.loteSeleccionado = data;
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar detalles del lote:', error);
          this.cargando = false;
        }
      });
    }
  }

  // Filtrar lotes por búsqueda
  filtrarLotes(): Lote[] {
    if (!this.terminoBusqueda.trim()) {
      return this.lotes;
    }
    
    const termino = this.terminoBusqueda.toLowerCase();
    return this.lotes.filter(lote =>
      lote.numeroSeguimiento.toLowerCase().includes(termino) ||
      lote.tipoProducto.toLowerCase().includes(termino) ||
      lote.id?.toString().includes(termino)
    );
  }

  // Abrir modal para crear nuevo lote
  abrirModalLote(): void {
    this.loteEditando = null;
    this.formLote = {
      idAlmacen: 0,
      tipoProducto: ''
    };
    this.mostrarModalLote = true;
    this.cargarAlmacenes(); // Cargar almacenes cuando se abre el modal
  }

  // Cerrar modal de lote
  cerrarModalLote(): void {
    this.mostrarModalLote = false;
    this.loteEditando = null;
  }

  // Guardar lote (crear)
  guardarLote(): void {
    if (!this.formLote.idAlmacen || !this.formLote.tipoProducto.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.cargando = true;
    this.lotesService.guardarLote(this.formLote).subscribe({
      next: (data) => {
        console.log('Lote guardado:', data);
        this.cargarLotes();
        this.cerrarModalLote();
        
        // Seleccionar automáticamente el lote recién creado
        if (data.id) {
          setTimeout(() => {
            const loteCreado = this.lotes.find(l => l.id === data.id);
            if (loteCreado) {
              this.seleccionarLote(loteCreado);
            }
          }, 500);
        }
      },
      error: (error) => {
        console.error('Error al guardar lote:', error);
        alert('Error al guardar el lote');
        this.cargando = false;
      }
    });
  }

  // Eliminar lote
  eliminarLote(lote: Lote, event: Event): void {
    event.stopPropagation();
    
    if (!lote.id) return;
    
    if (confirm(`¿Estás seguro de eliminar el lote #${lote.numeroSeguimiento}?`)) {
      this.cargando = true;
      this.lotesService.eliminarLote(lote.id).subscribe({
        next: () => {
          console.log('Lote eliminado');
          
          // Si el lote eliminado era el seleccionado, limpiar selección
          if (this.loteSeleccionado?.id === lote.id) {
            this.loteSeleccionado = null;
          }
          
          this.cargarLotes();
        },
        error: (error) => {
          console.error('Error al eliminar lote:', error);
          alert('Error al eliminar el lote');
          this.cargando = false;
        }
      });
    }
  }

  // Obtener clase de badge según tipo de producto
  obtenerClaseBadge(tipoProducto: string): string {
    const tipo = tipoProducto.toLowerCase();
    if (tipo.includes('miel')) return 'badge-buena';
    if (tipo.includes('polen')) return 'badge-regular';
    if (tipo.includes('propóleo') || tipo.includes('propoleo')) return 'badge-critica';
    return 'badge-regular';
  }

  // Formatear fecha
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Contar recursos del almacén
  contarRecursosAlmacen(lote: LoteConAlmacenResponse): number {
    if (!lote.almacen) return 0;
    
    const materiasPrimas = lote.almacen.materiasPrimas?.length || 0;
    const herramientas = lote.almacen.herramientas?.length || 0;
    const medicamentos = lote.almacen.medicamentos?.length || 0;
    
    return materiasPrimas + herramientas + medicamentos;
  }

  // Verificar si hay imagen
  tieneImagen(foto: any): boolean {
    return foto !== null && foto !== undefined && foto !== '';
  }

  // Convertir byte array a base64 para mostrar imágenes
  convertirABase64(foto: any): string {
    if (typeof foto === 'string') {
      return `data:image/jpeg;base64,${foto}`;
    }
    return '';
  }

  // Método auxiliar para contar recursos de un almacén (para mostrar en el select)
  contarRecursos(almacen: Almacen): number {
    const herramientas = almacen.herramientas?.length || 0;
    const materiasPrimas = almacen.materiasPrimas?.length || 0;
    const medicamentos = almacen.medicamentos?.length || 0;
    return herramientas + materiasPrimas + medicamentos;
  }
}