import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import { CosechasService, Cosecha, CosechaRequest } from '../../../services/produccionService/cosechasService/cosechas-service';
import { ApiarioService, Apiarios } from '../../../services/apiariosService/apiario-service';
import { LotesService, Lote } from '../../../services/produccionService/lotesService/lotes-service';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-produccion',
  standalone: false,
  templateUrl: './produccion.html',
  styleUrl: './produccion.css'
})
export class Produccion implements OnInit, AfterViewInit {
  
  private chart: Chart | null = null;
  private chartIndividual: Chart | null = null;
  
  // Propiedades para la funcionalidad de cosechas
  cosechas: Cosecha[] = [];
  cosechasFiltradas: Cosecha[] = [];
  terminoBusqueda: string = '';
  mostrarModalCosecha: boolean = false;
  mostrarModalRendimiento: boolean = false;
  cargando: boolean = false;
  cosechaSeleccionada: Cosecha | null = null;

  // Listas para selects
  apiarios: Apiarios[] = [];
  lotes: Lote[] = [];

  // Formulario para nueva cosecha
  formCosecha: CosechaRequest = {
    idLote: 0,
    calidad: '',
    tipoCosecha: '',
    cantidad: 0,
    idApiario: 0
  };

  // Sugerencias individuales
  sugerenciasIndividuales: any[] = [
    {
      titulo: '🌸 Optimización de Flora',
      texto: 'Considera diversificar las fuentes de néctar para mejorar la calidad del producto.'
    },
    {
      titulo: '🔍 Frecuencia de Revisión',
      texto: 'Aumenta la frecuencia de revisiones durante la temporada de alta producción.'
    }
  ];

  constructor(
    private cosechasService: CosechasService,
    private apiarioService: ApiarioService,
    private lotesService: LotesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.cargarCosechas();
  }

  ngAfterViewInit(): void {
    this.inicializarGrafica();
  }

  // 🔹 Cargar todas las cosechas
  cargarCosechas(): void {
    this.cargando = true;
    this.cosechasService.listarCosechas().subscribe({
      next: (data) => {
        this.cosechas = data;
        this.cosechasFiltradas = data;
        this.cargando = false;
        console.log('Cosechas cargadas:', data);
      },
      error: (error) => {
        console.error('Error al cargar cosechas:', error);
        this.cargando = false;
      }
    });
  }

  // 🔹 Cargar apiarios para el select
  cargarApiarios(): void {
    this.apiarioService.obtenerTodos().subscribe({
      next: (response) => {
        if (response.data) {
          this.apiarios = response.data;
          console.log('Apiarios cargados:', this.apiarios);
        }
      },
      error: (error) => {
        console.error('Error al cargar apiarios:', error);
        this.apiarios = [];
      }
    });
  }

  // 🔹 Cargar lotes para el select
  cargarLotes(): void {
    this.lotesService.listarLotes().subscribe({
      next: (data) => {
        this.lotes = data;
        console.log('Lotes cargados:', this.lotes);
      },
      error: (error) => {
        console.error('Error al cargar lotes:', error);
        this.lotes = [];
      }
    });
  }

  // 🔹 Método de búsqueda
  filtrarCosechas(): void {
    if (!this.terminoBusqueda.trim()) {
      this.cosechasFiltradas = this.cosechas;
      return;
    }
    
    const termino = this.terminoBusqueda.toLowerCase();
    this.cosechasFiltradas = this.cosechas.filter(cosecha =>
      cosecha.tipoCosecha.toLowerCase().includes(termino) ||
      cosecha.calidad.toLowerCase().includes(termino) ||
      cosecha.id?.toString().includes(termino) ||
      cosecha.idApiario.toString().includes(termino) ||
      (cosecha.lote && cosecha.lote.numeroSeguimiento?.toLowerCase().includes(termino))
    );
  }

  // 🔹 Abrir modal para crear nueva cosecha
  abrirModalCosecha(): void {
    this.formCosecha = {
      idLote: 0,
      calidad: '',
      tipoCosecha: '',
      cantidad: 0,
      idApiario: 0
    };
    this.mostrarModalCosecha = true;
    // Cargar datos para los selects
    this.cargarApiarios();
    this.cargarLotes();
  }

  // 🔹 Cerrar modal de cosecha
  cerrarModalCosecha(): void {
    this.mostrarModalCosecha = false;
  }

  // 🔹 Abrir modal de rendimiento individual
  abrirModalRendimiento(cosecha: Cosecha): void {
    this.cosechaSeleccionada = cosecha;
    this.mostrarModalRendimiento = true;
    
    // Inicializar gráfica individual después de que el modal esté visible
    setTimeout(() => {
      this.inicializarGraficaIndividual();
    }, 100);
  }

  // 🔹 Cerrar modal de rendimiento
  cerrarModalRendimiento(): void {
    this.mostrarModalRendimiento = false;
    this.cosechaSeleccionada = null;
    // Destruir gráfica individual al cerrar el modal
    if (this.chartIndividual) {
      this.chartIndividual.destroy();
      this.chartIndividual = null;
    }
  }

  // 🔹 Guardar cosecha (crear)
  guardarCosecha(): void {
    if (!this.validarFormularioCosecha()) {
      return;
    }

    this.cargando = true;
    this.cosechasService.crearCosecha(this.formCosecha).subscribe({
      next: (data) => {
        console.log('Cosecha guardada:', data);
        this.cargarCosechas();
        this.cerrarModalCosecha();
        // Actualizar gráfica después de agregar nueva cosecha
        setTimeout(() => this.actualizarGrafica(), 500);
      },
      error: (error) => {
        console.error('Error al guardar cosecha:', error);
        alert('Error al guardar la cosecha');
        this.cargando = false;
      }
    });
  }

  // 🔹 Validar formulario de cosecha
  private validarFormularioCosecha(): boolean {
    if (!this.formCosecha.idLote || this.formCosecha.idLote <= 0) {
      alert('Por favor selecciona un lote válido');
      return false;
    }
    if (!this.formCosecha.tipoCosecha.trim()) {
      alert('Por favor ingresa el tipo de cosecha');
      return false;
    }
    if (!this.formCosecha.calidad.trim()) {
      alert('Por favor ingresa la calidad');
      return false;
    }
    if (!this.formCosecha.cantidad || this.formCosecha.cantidad <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return false;
    }
    if (!this.formCosecha.idApiario || this.formCosecha.idApiario <= 0) {
      alert('Por favor selecciona un apiario válido');
      return false;
    }
    return true;
  }

  // 🔹 Eliminar cosecha
  eliminarCosecha(cosecha: Cosecha, event: Event): void {
    event.stopPropagation();
    
    if (!cosecha.id) return;
    
    if (confirm(`¿Estás seguro de eliminar la cosecha del ${this.formatearFecha(cosecha.fechaCosecha)}?`)) {
      this.cargando = true;
      this.cosechasService.eliminarCosecha(cosecha.id).subscribe({
        next: () => {
          console.log('Cosecha eliminada');
          this.cargarCosechas();
          // Actualizar gráfica después de eliminar cosecha
          setTimeout(() => this.actualizarGrafica(), 500);
        },
        error: (error) => {
          console.error('Error al eliminar cosecha:', error);
          alert('Error al eliminar la cosecha');
          this.cargando = false;
        }
      });
    }
  }

  // 🔹 Editar cosecha
  editarCosecha(id: number): void {
    alert(`Editando cosecha #${id}`);
    // Aquí puedes implementar la lógica para editar
  }

  // 🔹 Formatear fecha (CORREGIDO)
  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // 🔹 Formatear cantidad (CORREGIDO)
  formatearCantidad(cantidad: number | undefined): string {
    if (!cantidad) return '0.00';
    return cantidad.toFixed(2);
  }

  // 🔹 Calcular porcentaje de rendimiento (CORREGIDO)
  calcularPorcentajeRendimiento(): number {
    if (!this.cosechaSeleccionada?.cantidad || this.cosechas.length === 0) return 0;
    
    const promedio = this.cosechas.reduce((sum, c) => sum + c.cantidad, 0) / this.cosechas.length;
    return promedio > 0 ? Math.round((this.cosechaSeleccionada.cantidad / promedio) * 100) : 0;
  }

  // 🔹 Obtener nombre del apiario por ID
  obtenerNombreApiario(idApiario: number): string {
    const apiario = this.apiarios.find(a => a.id === idApiario);
    return apiario ? `Apiario #${apiario.numeroApiario} - ${apiario.ubicacion}` : 'N/A';
  }

  // 🔹 Obtener número de seguimiento del lote por ID
  obtenerNumeroLote(idLote: number): string {
    const lote = this.lotes.find(l => l.id === idLote);
    return lote ? lote.numeroSeguimiento : 'N/A';
  }

  private inicializarGrafica(): void {
    const ctx = document.getElementById('rendimientoChart') as HTMLCanvasElement;
    
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Julio', 'Agosto', 'Septiembre', 'Octubre'],
          datasets: [{
            label: 'Rendimiento (kg/colmena)',
            data: [4.8, 3.8, 4.33, 3.75],
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Producción Total (kg)',
            data: [48, 38, 52, 45],
            borderColor: '#92400e',
            backgroundColor: 'rgba(146, 64, 14, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#78350f',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12,
                  weight: 'bold'
                },
                color: '#78350f'
              }
            },
            tooltip: {
              backgroundColor: '#fff',
              titleColor: '#92400e',
              bodyColor: '#78350f',
              borderColor: '#fbbf24',
              borderWidth: 2,
              padding: 12,
              displayColors: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#fef3c7'
              },
              ticks: {
                color: '#78350f',
                font: {
                  weight: 'bold'
                }
              }
            },
            x: {
              grid: {
                color: '#fef3c7'
              },
              ticks: {
                color: '#78350f',
                font: {
                  weight: 'bold'
                }
              }
            }
          }
        }
      });
    }
  }

  // 🔹 Inicializar gráfica individual (CORREGIDO)
  private inicializarGraficaIndividual(): void {
    const ctx = document.getElementById('rendimientoIndividualChart') as HTMLCanvasElement;
    
    if (ctx && this.cosechaSeleccionada && this.cosechaSeleccionada.cantidad) {
      // Destruir gráfica anterior si existe
      if (this.chartIndividual) {
        this.chartIndividual.destroy();
      }

      this.chartIndividual = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Cantidad (kg)', 'Rendimiento Esperado', 'Rendimiento Real'],
          datasets: [{
            label: 'Métrica',
            data: [
              this.cosechaSeleccionada.cantidad,
              this.cosechaSeleccionada.cantidad * 1.2, // 20% más como esperado
              this.cosechaSeleccionada.cantidad * 0.95 // 5% menos como real
            ],
            backgroundColor: [
              '#fbbf24',
              '#92400e',
              '#78350f'
            ],
            borderColor: [
              '#f59e0b',
              '#78350f',
              '#92400e'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            title: {
              display: true,
              text: 'Análisis Comparativo de Rendimiento',
              font: {
                size: 16,
                weight: 'bold'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Kilogramos (kg)'
              }
            }
          }
        }
      });
    }
  }

  // 🔹 Actualizar gráfica con datos reales de cosechas
  private actualizarGrafica(): void {
    if (this.chart && this.cosechas.length > 0) {
      // Aquí puedes actualizar la gráfica con datos reales de las cosechas
      console.log('Actualizando gráfica con datos de cosechas');
    }
  }

  ngOnDestroy(): void {
    // Destruir las gráficas al destruir el componente
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.chartIndividual) {
      this.chartIndividual.destroy();
    }
  }
}