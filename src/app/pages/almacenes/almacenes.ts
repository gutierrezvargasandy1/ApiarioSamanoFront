import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AlmacenService, Almacen, AlmacenRequest, ResponseDTO } from '../../services/almaceneService/almacen-service';
import { MateriasPrimasService, MateriasPrimasRequest, MateriasPrimasResponse } from '../../services/almaceneService/materiasPrimasService/materias-primas-service';
import { HerramientasService, HerramientasRequest, HerramientasResponse } from '../../services/almaceneService/herramientasService/herramientas-service';
import { MedicamentosService, MedicamentosRequest, MedicamentosResponse } from '../../services/almaceneService/MedicamentosService/medicamentos-service';
import { ToastService } from '../../services/toastService/toast-service';

type TabType = 'materiasPrimas' | 'herramientas' | 'medicamentos';

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
  
  // Modales
  mostrarModalAlmacen: boolean = false;
  mostrarModalItem: boolean = false;
  
  // Edición
  almacenEditando: Almacen | null = null;
  itemEditando: any = null;
  
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
  
  // Estado de carga
  cargando: boolean = false;
  cargandoItems: boolean = false;

  constructor(
    private almacenService: AlmacenService,
    private materiasPrimasService: MateriasPrimasService,
    private herramientasService: HerramientasService,
    private medicamentosService: MedicamentosService,
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
      next: (response: any) => { // 🔥 Cambiar a 'any' temporalmente para debug
        console.log('📦 Respuesta del servicio:', response);
        
        // 🔥 CORRECCIÓN: Usar response.codigo en lugar de response.statusCode
        if (response.codigo === 200 && response.data) {
          this.almacenes = response.data;
          console.log('✅ Almacenes cargados:', this.almacenes.length, 'almacenes');
        } else {
          console.log('❌ Error en respuesta:', response);
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al cargar almacenes');
          });
        }
        this.cargando = false;
        this.cdRef.detectChanges();
        console.log('🏁 Estado final - cargando:', this.cargando, 'almacenes:', this.almacenes.length);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar almacenes:', err);
        setTimeout(() => {
          this.toastService.error('Error', 'No se pudieron cargar los almacenes');
        });
        this.cargando = false;
        this.cdRef.detectChanges();
        console.log('💥 Error - cargando:', this.cargando);
      }
    });
  }

  seleccionarAlmacen(almacen: Almacen): void {
    this.almacenSeleccionado = almacen;
    this.tabActiva = 'materiasPrimas';
    console.log('📦 Almacén seleccionado:', almacen);
  }

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
        next: (response: any) => { // 🔥 Cambiar a 'any' temporalmente
          if (response.codigo === 200) { // 🔥 Usar response.codigo
            this.almacenes.push(response.data);
            setTimeout(() => {
              this.toastService.success('Éxito', 'Almacén creado correctamente');
            });
            this.cerrarModalAlmacen();
          } else {
            setTimeout(() => {
              this.toastService.error('Error', response.descripcion || 'Error al crear almacén'); // 🔥 Usar descripcion
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

  eliminarAlmacen(almacen: Almacen, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar el almacén ${almacen.numeroSeguimiento}?`)) {
      return;
    }

    this.cargando = true;
    
    this.almacenService.eliminarAlmacen(almacen.id).subscribe({
      next: (response: any) => { // 🔥 Cambiar a 'any' temporalmente
        if (response.codigo === 200) { // 🔥 Usar response.codigo
          this.almacenes = this.almacenes.filter(a => a.id !== almacen.id);
          
          if (this.almacenSeleccionado?.id === almacen.id) {
            this.almacenSeleccionado = null;
          }
          
          setTimeout(() => {
            this.toastService.success('Éxito', 'Almacén eliminado correctamente');
          });
        } else {
          setTimeout(() => {
            this.toastService.error('Error', response.descripcion || 'Error al eliminar almacén'); // 🔥 Usar descripcion
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

  // ==================== TABS ====================
  
  cambiarTab(tab: TabType): void {
    this.tabActiva = tab;
  }

  obtenerNombreTab(): string {
    switch (this.tabActiva) {
      case 'materiasPrimas':
        return 'Materia Prima';
      case 'herramientas':
        return 'Herramienta';
      case 'medicamentos':
        return 'Medicamento';
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
      default:
        return [];
    }
  }

  // ==================== ITEMS (MATERIAS PRIMAS, HERRAMIENTAS, MEDICAMENTOS) ====================
  
  abrirModalItem(item?: any): void {
    if (item) {
      this.itemEditando = item;
      this.formItem = { 
        nombre: item.nombre,
        cantidad: item.cantidad,
        descripcion: item.descripcion || '',
        idProveedor: item.idProveedor || item.proveedor?.id || 0,
        foto: item.foto || ''
      };
    } else {
      this.itemEditando = null;
      this.formItem = {
        nombre: '',
        cantidad: 0,
        descripcion: '',
        idProveedor: 0,
        foto: ''
      };
    }
    this.mostrarModalItem = true;
  }

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

  private guardarMateriaPrima(): void {
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

  private guardarHerramienta(): void {
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

  private guardarMedicamento(): void {
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
}