import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AlmacenService, Almacen, AlmacenRequest, ResponseDTO, ReporteEspaciosResponse } from '../../services/almaceneService/almacen-service';
import { MateriasPrimasService, MateriasPrimasRequest, MateriasPrimasResponse } from '../../services/almaceneService/materiasPrimasService/materias-primas-service';
import { HerramientasService, HerramientasRequest, HerramientasResponse } from '../../services/almaceneService/herramientasService/herramientas-service';
import { MedicamentosService, MedicamentosRequest, MedicamentosResponse } from '../../services/almaceneService/MedicamentosService/medicamentos-service';
import { LotesService, Lote, LoteRequest, LoteConAlmacenResponse } from '../../services/produccionService/lotesService/lotes-service';
import { ToastService } from '../../services/toastService/toast-service';

type TabType = 'materiasPrimas' | 'herramientas' | 'medicamentos' | 'lotes';

@Component({
  selector: 'app-almacenes',
  standalone: false,
  templateUrl: './almacenes.html',
  styleUrl: './almacenes.css'
})
export class Almacenes implements OnInit {
  // Estado de la aplicación
  almacenes: Almacen[] = [];
  almacenSeleccionado: Almacen | null = null;
  tabActiva: TabType = 'materiasPrimas';
  lotesAlmacen: Lote[] = [];
  
  // Nuevas propiedades para el manejo de espacios
  reporteEspacios: ReporteEspaciosResponse | null = null;
  actualizandoEspacios: boolean = false;
  
  // Modales
  mostrarModalAlmacen: boolean = false;
  mostrarModalItem: boolean = false;
  mostrarModalLote: boolean = false;
  
  // Edición
  almacenEditando: Almacen | null = null;
  itemEditando: any = null;
  loteEditando: Lote | null = null;
  
  // Formularios
  formAlmacen: Partial<Almacen> = {
    numeroSeguimiento: '',
    ubicacion: '',
    capacidad: 0
  };
  
  formItem: any = {
    nombre: '',
    cantidad: 0,
    descripcion: '',
    idProveedor: 0,
    foto: ''
  };

  formLote: LoteRequest = {
    idAlmacen: 0,
    tipoProducto: ''
  };
  
  // Estado de carga
  cargando: boolean = false;
  cargandoItems: boolean = false;

  // Modales específicos
  mostrarModalMedicamento: boolean = false;
  mostrarModalHerramienta: boolean = false;
  mostrarModalMateriaPrima: boolean = false;

  // Edición específica
  medicamentoEditando: any = null;
  herramientaEditando: any = null;
  materiaPrimaEditando: any = null;

  // Formularios específicos
  formMedicamento: any = {
    nombre: '',
    descripcion: '',
    cantidad: 0,
    idProveedor: 0,
    foto: ''
  };

  formHerramienta: any = {
    nombre: '',
    idProveedor: 0,
    foto: ''
  };

  formMateriaPrima: any = {
    nombre: '',
    cantidad: 0,
    idProveedor: 0,
    foto: ''
  };

  constructor(
    private almacenService: AlmacenService,
    private materiasPrimasService: MateriasPrimasService,
    private herramientasService: HerramientasService,
    private medicamentosService: MedicamentosService,
    private lotesService: LotesService,
    private toastService: ToastService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.cargarAlmacenes();
    });
  }

  // ==================== ALMACENES ====================
  
  cargarAlmacenes(): void {
    this.cargando = true;
    console.log('🔄 Iniciando carga de almacenes...');
    
    this.almacenService.obtenerAlmacenes().subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta del servicio:', response);
        
        if (response.codigo === 200 && response.data) {
          this.almacenes = response.data;
          console.log('✅ Almacenes cargados:', this.almacenes.length, 'almacenes');
          
          // Si hay un almacén seleccionado, actualizar su información de espacios
          if (this.almacenSeleccionado) {
            this.actualizarInformacionEspaciosAlmacenSeleccionado();
          }
        } else {
          console.log('❌ Error en respuesta:', response);
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al cargar almacenes');
          });
        }
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar almacenes:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudieron cargar los almacenes');
        });
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  seleccionarAlmacen(almacen: Almacen): void {
    this.almacenSeleccionado = almacen;
    this.tabActiva = 'materiasPrimas';
    
    // Cargar lotes y obtener reporte de espacios
    this.cargarLotesDelAlmacen();
    this.obtenerReporteEspacios();
    
    console.log('📦 Almacén seleccionado:', almacen);
  }

  // ==================== NUEVOS MÉTODOS PARA ESPACIOS OCUPADOS ====================

  private actualizarInformacionEspaciosAlmacenSeleccionado(): void {
    if (!this.almacenSeleccionado) return;
    
    // Buscar el almacén actualizado en la lista
    const almacenActualizado = this.almacenes.find(a => a.id === this.almacenSeleccionado!.id);
    if (almacenActualizado) {
      this.almacenSeleccionado = almacenActualizado;
    }
    
    // Obtener el reporte actualizado
    this.obtenerReporteEspacios();
  }

  obtenerReporteEspacios(): void {
    if (!this.almacenSeleccionado) return;

    this.almacenService.obtenerReporteEspacios(this.almacenSeleccionado.id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200 && response.data) {
          this.reporteEspacios = response.data;
          console.log('📊 Reporte de espacios obtenido:', this.reporteEspacios);
        } else {
          console.log('⚠️ No se pudo obtener el reporte de espacios:', response);
        }
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al obtener reporte de espacios:', err);
      }
    });
  }

  actualizarEspaciosOcupados(): void {
    if (!this.almacenSeleccionado) return;

    this.actualizandoEspacios = true;
    
    this.almacenService.actualizarEspaciosOcupados(this.almacenSeleccionado.id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Espacios ocupados actualizados correctamente');
          });
          
          // Recargar la información del almacén
          this.cargarAlmacenes();
          this.obtenerReporteEspacios();
          
          console.log('✅ Espacios actualizados:', response.data);
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al actualizar espacios');
          });
        }
        this.actualizandoEspacios = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar espacios:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudieron actualizar los espacios');
        });
        this.actualizandoEspacios = false;
        this.cdRef.detectChanges();
      }
    });
  }

  // ==================== LOTES ====================

  cargarLotesDelAlmacen(): void {
    if (!this.almacenSeleccionado) return;

    this.cargandoItems = true;
    
    this.lotesService.listarLotes().subscribe({
      next: (lotes: Lote[]) => {
        // Filtrar lotes por el almacén seleccionado
        this.lotesAlmacen = lotes.filter(lote => lote.idAlmacen === this.almacenSeleccionado!.id);
        console.log('📋 Lotes del almacén:', this.lotesAlmacen);
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar lotes:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudieron cargar los lotes');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

  abrirModalLote(lote?: Lote): void {
    if (lote) {
      this.loteEditando = lote;
      this.formLote = {
        idAlmacen: lote.idAlmacen,
        tipoProducto: lote.tipoProducto
      };
    } else {
      this.loteEditando = null;
      this.formLote = {
        idAlmacen: this.almacenSeleccionado?.id || 0,
        tipoProducto: ''
      };
    }
    this.mostrarModalLote = true;
  }

  cerrarModalLote(): void {
    this.mostrarModalLote = false;
    this.loteEditando = null;
    this.formLote = {
      idAlmacen: 0,
      tipoProducto: ''
    };
  }

guardarLote(): void {
    if (!this.formLote.tipoProducto || !this.formLote.idAlmacen) {
      setTimeout(() => {
        this.toastService.warning('Atención', 'Por favor complete todos los campos obligatorios');
      });
      return;
    }

    // Verificar si hay espacios disponibles antes de proceder
    if (!this.almacenSeleccionado) {
      setTimeout(() => {
        this.toastService.error('Error', 'No se ha seleccionado un almacén');
      });
      return;
    }

    const espaciosOcupados = this.calcularEspaciosOcupados(this.almacenSeleccionado);
    if (espaciosOcupados >= this.almacenSeleccionado.capacidad) {
      setTimeout(() => {
        this.toastService.warning('Almacén lleno', 'No hay espacios disponibles en este almacén');
      });
      return;
    }

    this.cargandoItems = true;

    const request: LoteRequest = {
      idAlmacen: this.formLote.idAlmacen,
      tipoProducto: this.formLote.tipoProducto
    };

    if (this.loteEditando) {
      // Editar lote (si tu backend soporta edición)
      setTimeout(() => {
        this.toastService.warning('Información', 'La función de editar lotes requiere implementar el endpoint PUT en el backend');
      });
      this.cargandoItems = false;
      this.cdRef.detectChanges();
    } else {
      // Crear nuevo lote
      this.lotesService.guardarLote(request).subscribe({
        next: (response: Lote) => {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Lote creado correctamente');
          });
          this.cargarLotesDelAlmacen();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
          this.cerrarModalLote();
          this.cargandoItems = false;
          this.cdRef.detectChanges();
        },
        error: (err: any) => {
          console.error('❌ Error al crear lote:', err);
          setTimeout(() => {
            this.toastService.error('Error', 'No se pudo crear el lote');
          });
          this.cargandoItems = false;
          this.cdRef.detectChanges();
        }
      });
    }
  }

  eliminarLote(lote: Lote, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar el lote ${lote.numeroSeguimiento}?`)) {
      return;
    }

    this.cargandoItems = true;

    this.lotesService.eliminarLote(lote.id!).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Lote eliminado correctamente');
          });
          this.cargarLotesDelAlmacen();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al eliminar lote');
          });
        }
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al eliminar lote:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo eliminar el lote');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

  // ==================== TABS ====================
  
  cambiarTab(tab: TabType): void {
    this.tabActiva = tab;
    
    // Si cambia a la pestaña de lotes y hay un almacén seleccionado, cargar los lotes
    if (tab === 'lotes' && this.almacenSeleccionado) {
      this.cargarLotesDelAlmacen();
    }
  }

  obtenerNombreTab(): string {
    switch (this.tabActiva) {
      case 'materiasPrimas':
        return 'Materia Prima';
      case 'herramientas':
        return 'Herramienta';
      case 'medicamentos':
        return 'Medicamento';
      case 'lotes':
        return 'Lote';
      default:
        return 'Item';
    }
  }

  obtenerItemsActuales(): any[] {
    if (!this.almacenSeleccionado) return [];
    
    switch (this.tabActiva) {
      case 'materiasPrimas':
        return this.almacenSeleccionado.materiasPrimas || [];
      case 'herramientas':
        return this.almacenSeleccionado.herramientas || [];
      case 'medicamentos':
        return this.almacenSeleccionado.medicamentos || [];
      case 'lotes':
        return this.lotesAlmacen || [];
      default:
        return [];
    }
  }

  // ==================== ITEMS (MATERIAS PRIMAS, HERRAMIENTAS, MEDICAMENTOS) ====================
  
  cerrarModalItem(): void {
    this.mostrarModalItem = false;
    this.itemEditando = null;
    this.formItem = {
      nombre: '',
      cantidad: 0,
      descripcion: '',
      idProveedor: 0,
      foto: ''
    };
  }

  guardarItem(): void {
    if (!this.formItem.nombre || this.formItem.cantidad <= 0 || !this.formItem.idProveedor) {
      setTimeout(() => {
        this.toastService.warning('Atención', 'Por favor complete todos los campos obligatorios');
      });
      return;
    }

    if (!this.almacenSeleccionado) {
      setTimeout(() => {
        this.toastService.error('Error', 'Debe seleccionar un almacén primero');
      });
      return;
    }

    this.cargandoItems = true;

    switch (this.tabActiva) {
      case 'materiasPrimas':
        this.guardarMateriaPrima();
        break;
      case 'herramientas':
        this.guardarHerramienta();
        break;
      case 'medicamentos':
        this.guardarMedicamento();
        break;
    }
  }

  guardarMateriaPrima(): void {
    const request: MateriasPrimasRequest = {
      nombre: this.formItem.nombre,
      foto: this.formItem.foto,
      cantidad: this.formItem.cantidad,
      idAlmacen: this.almacenSeleccionado!.id,
      idProvedor: this.formItem.idProveedor
    };

    this.materiasPrimasService.guardar(request).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Materia prima guardada correctamente');
          });
          this.cargarAlmacenes();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
          this.cerrarModalItem();
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al guardar');
          });
        }
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al guardar materia prima:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo guardar la materia prima');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

   guardarHerramienta(): void {
    const request: HerramientasRequest = {
      nombre: this.formItem.nombre,
      foto: this.formItem.foto,
      idAlmacen: this.almacenSeleccionado!.id,
      idProveedor: this.formItem.idProveedor
    };

    this.herramientasService.guardar(request).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Herramienta guardada correctamente');
          });
          this.cargarAlmacenes();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
          this.cerrarModalItem();
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al guardar');
          });
        }
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al guardar herramienta:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo guardar la herramienta');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

  guardarMedicamento(): void {
    const request: MedicamentosRequest = {
      nombre: this.formItem.nombre,
      descripcion: this.formItem.descripcion,
      idAlmacen: this.almacenSeleccionado!.id,
      cantidad: this.formItem.cantidad.toString(),
      idProveedor: this.formItem.idProveedor,
      foto: this.formItem.foto
    };

    this.medicamentosService.crear(request).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Medicamento guardado correctamente');
          });
          this.cargarAlmacenes();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
          this.cerrarModalItem();
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al guardar');
          });
        }
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al guardar medicamento:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo guardar el medicamento');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

  eliminarItem(item: any, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar ${item.nombre}?`)) {
      return;
    }

    this.cargandoItems = true;

    switch (this.tabActiva) {
      case 'materiasPrimas':
        this.eliminarMateriaPrima(item.id);
        break;
      case 'herramientas':
        this.eliminarHerramienta(item.id);
        break;
      case 'medicamentos':
        this.eliminarMedicamento(item.id);
        break;
    }
  }

  private eliminarMateriaPrima(id: number): void {
    this.materiasPrimasService.eliminarPorId(id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Materia prima eliminada');
          });
          this.cargarAlmacenes();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al eliminar');
          });
        }
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al eliminar materia prima:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo eliminar');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

  private eliminarHerramienta(id: number): void {
    this.herramientasService.eliminar(id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Herramienta eliminada');
          });
          this.cargarAlmacenes();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al eliminar');
          });
        }
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al eliminar herramienta:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo eliminar');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

  private eliminarMedicamento(id: number): void {
    this.medicamentosService.eliminar(id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          setTimeout(() => {
            this.toastService.success('Éxito', 'Medicamento eliminado');
          });
          this.cargarAlmacenes();
          this.actualizarEspaciosOcupados(); // 🔄 ACTUALIZAR ESPACIOS
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al eliminar');
          });
        }
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al eliminar medicamento:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo eliminar');
        });
        this.cargandoItems = false;
        this.cdRef.detectChanges();
      }
    });
  }

  // ==================== UTILIDADES ====================
  
  calcularEspaciosOcupados(almacen: Almacen): number {
    // Si tenemos reporte de espacios, usar esos datos
    if (this.reporteEspacios && this.almacenSeleccionado?.id === almacen.id) {
      return this.reporteEspacios.totalEspaciosOcupados;
    }
    
    // Si no, calcular basado en items internos (método antiguo)
    let ocupados = 0;
    
    if (almacen.materiasPrimas) {
      ocupados += almacen.materiasPrimas.length;
    }
    if (almacen.herramientas) {
      ocupados += almacen.herramientas.length;
    }
    if (almacen.medicamentos) {
      ocupados += almacen.medicamentos.length;
    }
    
    return ocupados;
  }

  calcularPorcentajeOcupacion(almacen: Almacen): number {
    // Si tenemos reporte de espacios, usar esos datos
    if (this.reporteEspacios && this.almacenSeleccionado?.id === almacen.id) {
      return this.reporteEspacios.porcentajeOcupacion;
    }
    
    // Si no, calcular basado en items internos
    const ocupados = this.calcularEspaciosOcupados(almacen);
    return Math.round((ocupados / almacen.capacidad) * 100);
  }

  obtenerClasePorcentaje(porcentaje: number): string {
    if (porcentaje >= 80) return 'alto';
    if (porcentaje >= 50) return 'medio';
    return 'bajo';
  }

  tieneItems(almacen: Almacen): boolean {
    return this.calcularEspaciosOcupados(almacen) > 0;
  }

  // ==================== MÉTODOS DE ALMACÉN ====================

  abrirModalAlmacen(almacen?: Almacen): void {
    if (almacen) {
      this.almacenEditando = almacen;
      this.formAlmacen = {
        numeroSeguimiento: almacen.numeroSeguimiento,
        ubicacion: almacen.ubicacion,
        capacidad: almacen.capacidad
      };
    } else {
      this.almacenEditando = null;
      this.formAlmacen = {
        numeroSeguimiento: '',
        ubicacion: '',
        capacidad: 0
      };
    }
    this.mostrarModalAlmacen = true;
  }

  eliminarAlmacen(almacen: Almacen, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar el almacén ${almacen.numeroSeguimiento}?`)) {
      return;
    }

    this.cargando = true;
  
    this.almacenService.eliminarAlmacen(almacen.id).subscribe({
      next: (response: any) => {
        if (response.codigo === 200) {
          this.almacenes = this.almacenes.filter(a => a.id !== almacen.id);
          
          if (this.almacenSeleccionado?.id === almacen.id) {
            this.almacenSeleccionado = null;
            this.reporteEspacios = null;
          }
          
          setTimeout(() => {
            this.toastService.success('Éxito', 'Almacén eliminado correctamente');
          });
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al eliminar almacén');
          });
        }
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al eliminar almacén:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudo eliminar el almacén');
        });
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  cerrarModalAlmacen(): void {
    this.mostrarModalAlmacen = false;
    this.almacenEditando = null;
    this.formAlmacen = {
      numeroSeguimiento: '',
      ubicacion: '',
      capacidad: 0
    };
  }

  guardarAlmacen(): void {
    if (!this.formAlmacen.ubicacion || !this.formAlmacen.capacidad) {
      setTimeout(() => {
        this.toastService.warning('Atención', 'Por favor complete todos los campos');
      });
      return;
    }

    const request: AlmacenRequest = {
      ubicacion: this.formAlmacen.ubicacion,
      capacidad: this.formAlmacen.capacidad
    };

    this.cargando = true;

    if (this.almacenEditando) {
      setTimeout(() => {
        this.toastService.warning('Información', 'La función de editar requiere implementar el endpoint PUT en el backend');
      });
      this.cargando = false;
      this.cdRef.detectChanges();
    } else {
      this.almacenService.crearAlmacen(request).subscribe({
        next: (response: any) => {
          if (response.codigo === 200) {
            this.almacenes.push(response.data);
            setTimeout(() => {
              this.toastService.success('Éxito', 'Almacén creado correctamente');
            });
            this.cerrarModalAlmacen();
          } else {
            setTimeout(() => {
              this.toastService.error('Error', response.descripcion || 'Error al crear almacén');
            });
          }
          this.cargando = false;
          this.cdRef.detectChanges();
        },
        error: (err: any) => {
          console.error('❌ Error al crear almacén:', err);
          setTimeout(() => {
            this.toastService.error('Error', 'No se pudo crear el almacén');
          });
          this.cargando = false;
          this.cdRef.detectChanges();
        }
      });
    }
  }

  // ==================== MÉTODOS PARA MEDICAMENTOS ====================

  abrirModalMedicamento(medicamento?: any): void {
    if (medicamento) {
      this.medicamentoEditando = medicamento;
      this.formMedicamento = {
        nombre: medicamento.nombre,
        descripcion: medicamento.descripcion || '',
        cantidad: medicamento.cantidad,
        idProveedor: medicamento.idProveedor || medicamento.proveedor?.id || 0,
        foto: medicamento.foto || ''
      };
    } else {
      this.medicamentoEditando = null;
      this.formMedicamento = {
        nombre: '',
        descripcion: '',
        cantidad: 0,
        idProveedor: 0,
        foto: ''
      };
    }
    this.mostrarModalMedicamento = true;
  }

  cerrarModalMedicamento(): void {
    this.mostrarModalMedicamento = false;
    this.medicamentoEditando = null;
    this.formMedicamento = {
      nombre: '',
      descripcion: '',
      cantidad: 0,
      idProveedor: 0,
      foto: ''
    };
  }

  // ==================== MÉTODOS PARA HERRAMIENTAS ====================

  abrirModalHerramienta(herramienta?: any): void {
    if (herramienta) {
      this.herramientaEditando = herramienta;
      this.formHerramienta = {
        nombre: herramienta.nombre,
        idProveedor: herramienta.idProveedor || herramienta.proveedor?.id || 0,
        foto: herramienta.foto || ''
      };
    } else {
      this.herramientaEditando = null;
      this.formHerramienta = {
        nombre: '',
        idProveedor: 0,
        foto: ''
      };
    }
    this.mostrarModalHerramienta = true;
  }

  cerrarModalHerramienta(): void {
    this.mostrarModalHerramienta = false;
    this.herramientaEditando = null;
    this.formHerramienta = {
      nombre: '',
      idProveedor: 0,
      foto: ''
    };
  }

  // ==================== MÉTODOS PARA MATERIAS PRIMAS ====================

  abrirModalMateriaPrima(materiaPrima?: any): void {
    if (materiaPrima) {
      this.materiaPrimaEditando = materiaPrima;
      this.formMateriaPrima = {
        nombre: materiaPrima.nombre,
        cantidad: materiaPrima.cantidad,
        idProveedor: materiaPrima.idProveedor || materiaPrima.proveedor?.id || 0,
        foto: materiaPrima.foto || ''
      };
    } else {
      this.materiaPrimaEditando = null;
      this.formMateriaPrima = {
        nombre: '',
        cantidad: 0,
        idProveedor: 0,
        foto: ''
      };
    }
    this.mostrarModalMateriaPrima = true;
  }

  cerrarModalMateriaPrima(): void {
    this.mostrarModalMateriaPrima = false;
    this.materiaPrimaEditando = null;
    this.formMateriaPrima = {
      nombre: '',
      cantidad: 0,
      idProveedor: 0,
      foto: ''
    };
  }

  // ==================== ACTUALIZAR MÉTODO abrirModalItem ====================

  abrirModalItem(item?: any): void {
    switch (this.tabActiva) {
      case 'medicamentos':
        this.abrirModalMedicamento(item);
        break;
      case 'herramientas':
        this.abrirModalHerramienta(item);
        break;
      case 'materiasPrimas':
        this.abrirModalMateriaPrima(item);
        break;
      case 'lotes':
        this.abrirModalLote(item);
        break;
    }
  }
}