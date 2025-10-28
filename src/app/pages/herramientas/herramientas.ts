import { Component, OnInit } from '@angular/core';
import { HerramientasService, HerramientasConProveedorResponse, HerramientasRequest } from '../../services/almaceneService/herramientasService/herramientas-service';
import { AlmacenService, Almacen } from '../../services/almaceneService/almacen-service';
import { ProveedoresService, Proveedor } from '../../services/proveedoresService/proveedores-service';

@Component({
  selector: 'app-herramientas',
  standalone: false,
  templateUrl: './herramientas.html',
  styleUrl: './herramientas.css'
})
export class Herramientas implements OnInit {

  // Listas
  herramientas: HerramientasConProveedorResponse[] = [];
  almacenes: Almacen[] = [];
  proveedores: Proveedor[] = [];

  // Búsqueda y selección
  terminoBusqueda: string = '';
  herramientaSeleccionada: HerramientasConProveedorResponse | null = null;

  // Control de modal
  mostrarFormulario: boolean = false;
  editando: boolean = false;

  // Formulario
  formHerramienta: HerramientasRequest = {
    nombre: '',
    foto: '',
    idAlmacen: 0,
    idProveedor: 0
  };

  // Manejo de imagen
  archivoSeleccionado: File | null = null;
  fotoPreview: string | null = null;

  // Estados de carga
  cargando: boolean = false;
  cargandoAlmacenes: boolean = false;
  cargandoProveedores: boolean = false;
  guardando: boolean = false;

  constructor(
    private herramientasService: HerramientasService,
    private almacenesService: AlmacenService,
    private proveedoresService: ProveedoresService
  ) {}

  ngOnInit() {
    this.cargarHerramientas();
    this.cargarAlmacenes();
    this.cargarProveedores();
  }

  /**
   * Carga todas las herramientas con información de proveedor
   */
  cargarHerramientas() {
    this.cargando = true;
    this.herramientasService.obtenerTodasConProveedor().subscribe({
      next: (response) => {
        this.herramientas = response.data || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar herramientas:', err);
        this.cargando = false;
        alert('Error al cargar las herramientas');
      }
    });
  }

  /**
   * Carga todos los almacenes
   */
  cargarAlmacenes() {
    this.cargandoAlmacenes = true;
    this.almacenesService.obtenerAlmacenes().subscribe({
      next: (response) => {
        this.almacenes = response.data || [];
        this.cargandoAlmacenes = false;
      },
      error: (err) => {
        console.error('Error al cargar almacenes:', err);
        this.cargandoAlmacenes = false;
      }
    });
  }

  /**
   * Carga todos los proveedores
   */
  cargarProveedores() {
    this.cargandoProveedores = true;
    this.proveedoresService.listarProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores || [];
        this.cargandoProveedores = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.cargandoProveedores = false;
      }
    });
  }

  /**
   * Filtra herramientas según el término de búsqueda
   */
  filtrarHerramientas(): HerramientasConProveedorResponse[] {
    if (!this.terminoBusqueda.trim()) {
      return this.herramientas;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    return this.herramientas.filter(h =>
      h.nombre?.toLowerCase().includes(termino) ||
      h.proveedor?.nombreEmpresa?.toLowerCase().includes(termino) ||
      h.id?.toString().includes(termino)
    );
  }

  /**
   * Selecciona una herramienta para ver detalles
   */
  seleccionarHerramienta(herramienta: HerramientasConProveedorResponse) {
    this.herramientaSeleccionada = herramienta;
  }

  /**
   * Abre el formulario para crear o editar
   */
  abrirFormulario(herramienta?: HerramientasConProveedorResponse) {
    this.mostrarFormulario = true;
    this.archivoSeleccionado = null;
    this.fotoPreview = null;

    if (herramienta) {
      // Modo edición
      this.editando = true;
      this.formHerramienta = {
        nombre: herramienta.nombre || '',
        foto: herramienta.foto || '',
        idAlmacen: 0, // Se debe obtener del backend si lo tiene
        idProveedor: herramienta.proveedor?.id || 0
      };

      // Mostrar preview de foto existente
      if (herramienta.foto) {
        this.fotoPreview = this.getFotoUrl(herramienta.foto);
      }
    } else {
      // Modo creación
      this.editando = false;
      this.formHerramienta = {
        nombre: '',
        foto: '',
        idAlmacen: 0,
        idProveedor: 0
      };
    }
  }

  /**
   * Cierra el formulario
   */
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.editando = false;
    this.formHerramienta = {
      nombre: '',
      foto: '',
      idAlmacen: 0,
      idProveedor: 0
    };
    this.archivoSeleccionado = null;
    this.fotoPreview = null;
  }

  /**
   * Guarda o actualiza una herramienta
   */
  guardarHerramienta() {
    // Validaciones
    if (!this.formHerramienta.nombre?.trim()) {
      alert('El nombre de la herramienta es obligatorio');
      return;
    }

    if (!this.formHerramienta.idAlmacen) {
      alert('Debe seleccionar un almacén');
      return;
    }

    if (!this.formHerramienta.idProveedor) {
      alert('Debe seleccionar un proveedor');
      return;
    }

    this.guardando = true;

    // Preparar datos
    const herramientaData: HerramientasRequest = {
      nombre: this.formHerramienta.nombre.trim(),
      foto: this.formHerramienta.foto || '',
      idAlmacen: this.formHerramienta.idAlmacen,
      idProveedor: this.formHerramienta.idProveedor
    };

    // Si hay archivo seleccionado, convertir a base64
    if (this.archivoSeleccionado) {
      this.convertirArchivoABase64(this.archivoSeleccionado).then(base64 => {
        herramientaData.foto = base64;
        this.enviarHerramienta(herramientaData);
      }).catch(err => {
        console.error('Error al convertir imagen:', err);
        this.guardando = false;
        alert('Error al procesar la imagen');
      });
    } else {
      this.enviarHerramienta(herramientaData);
    }
  }

  /**
   * Envía la herramienta al backend
   */
  private enviarHerramienta(herramientaData: HerramientasRequest) {
    if (this.editando) {
      // TODO: Implementar actualización cuando el servicio lo tenga
      alert('La funcionalidad de edición aún no está implementada en el servicio');
      this.guardando = false;
    } else {
      // Crear nueva herramienta
      this.herramientasService.guardar(herramientaData).subscribe({
        next: (response) => {
          this.guardando = false;
          this.cargarHerramientas();
          this.cerrarFormulario();
          alert('Herramienta guardada exitosamente');
        },
        error: (err) => {
          console.error('Error al guardar herramienta:', err);
          this.guardando = false;
          alert('Error al guardar la herramienta');
        }
      });
    }
  }

  /**
   * Edita una herramienta
   */
  editarHerramienta(herramienta: HerramientasConProveedorResponse) {
    this.abrirFormulario(herramienta);
  }

  /**
   * Elimina una herramienta
   */
  eliminarHerramienta(herramienta: HerramientasConProveedorResponse, event: Event) {
    event.stopPropagation();

    if (!herramienta.id) return;

    if (confirm(`¿Estás seguro de eliminar "${herramienta.nombre}"?`)) {
      this.herramientasService.eliminar(herramienta.id).subscribe({
        next: () => {
          this.cargarHerramientas();
          if (this.herramientaSeleccionada?.id === herramienta.id) {
            this.herramientaSeleccionada = null;
          }
          alert('Herramienta eliminada exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar herramienta:', err);
          alert('Error al eliminar la herramienta');
        }
      });
    }
  }

  /**
   * Maneja la selección de archivo
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      this.archivoSeleccionado = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Elimina la foto seleccionada
   */
  eliminarFoto() {
    this.archivoSeleccionado = null;
    this.fotoPreview = null;
    this.formHerramienta.foto = '';

    // Resetear input file
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Obtiene la URL de la foto para mostrar
   */
  getFotoUrl(foto: string | undefined): string {
    if (!foto) {
      return '';
    }

    // Si ya es una URL base64 completa
    if (foto.startsWith('data:')) {
      return foto;
    }

    // Si es solo el string base64, agregar el prefijo
    return `data:image/jpeg;base64,${foto}`;
  }

  /**
   * Convierte un archivo a Base64
   */
  private convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extraer solo la parte base64 (sin el prefijo data:image/...)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}