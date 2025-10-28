import { Component, OnInit } from '@angular/core';
import { ProveedoresService, Proveedor, ProveedorRequest } from '../../services/proveedoresService/proveedores-service';

@Component({
  selector: 'app-proveedores',
  standalone: false,  
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.css']
})
export class Proveedores implements OnInit {

  // Lista de proveedores
  proveedores: Proveedor[] = [];
  
  // Término de búsqueda
  terminoBusqueda: string = '';
  
  // Control del modal
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  
  // Proveedor seleccionado para editar/crear
  proveedorSeleccionado: ProveedorRequest = {
    nombreEmpresa: '',
    numTelefono: '',
    materialProvee: ''
  };
  
  // Archivo de imagen seleccionado
  archivoSeleccionado: File | null = null;

  // Estados de carga
  cargando: boolean = false;
  guardando: boolean = false;

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  /**
   * Carga todos los proveedores desde el backend
   */
  cargarProveedores() {
    this.cargando = true;
    this.proveedoresService.listarProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        this.cargando = false;
        // Aquí podrías agregar una notificación al usuario
        alert('Error al cargar los proveedores. Por favor, intenta de nuevo.');
      }
    });
  }

  /**
   * Filtra proveedores según el término de búsqueda
   */
  filtrarProveedores(): Proveedor[] {
    if (!Array.isArray(this.proveedores)) return [];
    
    if (!this.terminoBusqueda.trim()) {
      return this.proveedores;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    
    return this.proveedores.filter(p =>
      p.nombreEmpresa?.toLowerCase().includes(termino) ||
      p.numTelefono?.includes(termino) ||
      p.materialProvee?.toLowerCase().includes(termino)
    );
  }

  /**
   * Abre el modal para crear o editar un proveedor
   */
  abrirFormulario(proveedor?: Proveedor) {
    this.mostrarFormulario = true;
    this.archivoSeleccionado = null;
    
    if (proveedor) {
      // Modo edición
      this.editando = true;
      this.proveedorSeleccionado = { 
        id: proveedor.id,
        nombreEmpresa: proveedor.nombreEmpresa || '',
        numTelefono: proveedor.numTelefono || '',
        materialProvee: proveedor.materialProvee || '',
        fotografia: proveedor.fotografia // Base64 para preview
      };
    } else {
      // Modo creación
      this.editando = false;
      this.proveedorSeleccionado = {
        nombreEmpresa: '',
        numTelefono: '',
        materialProvee: ''
      };
    }
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.proveedorSeleccionado = {
      nombreEmpresa: '',
      numTelefono: '',
      materialProvee: ''
    };
    this.archivoSeleccionado = null;
    this.editando = false;
  }

  /**
   * Guarda o actualiza un proveedor
   */
  guardarProveedor() {
    // Validación básica
    if (!this.proveedorSeleccionado.nombreEmpresa?.trim()) {
      alert('El nombre de la empresa es obligatorio');
      return;
    }

    if (!this.proveedorSeleccionado.numTelefono?.trim()) {
      alert('El número de teléfono es obligatorio');
      return;
    }

    if (!this.proveedorSeleccionado.materialProvee?.trim()) {
      alert('El material que provee es obligatorio');
      return;
    }

    this.guardando = true;

    // Preparar el objeto para enviar
    const proveedorParaEnviar: ProveedorRequest = {
      nombreEmpresa: this.proveedorSeleccionado.nombreEmpresa.trim(),
      numTelefono: this.proveedorSeleccionado.numTelefono.trim(),
      materialProvee: this.proveedorSeleccionado.materialProvee.trim()
    };

    // Si hay un archivo seleccionado, agregarlo
    if (this.archivoSeleccionado) {
      proveedorParaEnviar.fotografia = this.archivoSeleccionado;
    } 
    // Si estamos editando y no hay nuevo archivo, mantener la foto existente
    else if (this.editando && this.proveedorSeleccionado.fotografia) {
      proveedorParaEnviar.fotografia = this.proveedorSeleccionado.fotografia;
    }

    if (this.editando && this.proveedorSeleccionado.id) {
      // Actualizar proveedor existente
      this.proveedoresService.actualizarProveedor(
        this.proveedorSeleccionado.id, 
        proveedorParaEnviar
      ).subscribe({
        next: () => {
          this.guardando = false;
          this.cargarProveedores();
          this.cerrarFormulario();
          alert('Proveedor actualizado exitosamente');
        },
        error: (err) => {
          console.error('Error al actualizar proveedor:', err);
          this.guardando = false;
          alert('Error al actualizar el proveedor. Por favor, intenta de nuevo.');
        }
      });
    } else {
      // Crear nuevo proveedor
      this.proveedoresService.crearProveedor(proveedorParaEnviar).subscribe({
        next: () => {
          this.guardando = false;
          this.cargarProveedores();
          this.cerrarFormulario();
          alert('Proveedor creado exitosamente');
        },
        error: (err) => {
          console.error('Error al crear proveedor:', err);
          this.guardando = false;
          alert('Error al crear el proveedor. Por favor, intenta de nuevo.');
        }
      });
    }
  }

  /**
   * Abre el formulario en modo edición
   */
  editarProveedor(proveedor: Proveedor) {
    this.abrirFormulario(proveedor);
  }

  /**
   * Maneja la selección de un archivo de imagen
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
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
        this.proveedorSeleccionado.fotografia = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Elimina la foto seleccionada
   */
  eliminarFoto() {
    this.archivoSeleccionado = null;
    this.proveedorSeleccionado.fotografia = undefined;
    
    // Resetear el input file
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Elimina un proveedor
   */
  eliminarProveedor(proveedor: Proveedor) {
    if (!proveedor.id) return;
    
    if (confirm(`¿Estás seguro de eliminar a ${proveedor.nombreEmpresa}?`)) {
      this.proveedoresService.eliminarProveedor(proveedor.id).subscribe({
        next: () => {
          this.cargarProveedores();
          alert('Proveedor eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar proveedor:', err);
          alert('Error al eliminar el proveedor. Por favor, intenta de nuevo.');
        }
      });
    }
  }

  /**
   * Obtiene la URL de la foto para mostrar en el template
   */
  getFotoUrl(fotografia: string | undefined): string {
    if (!fotografia) {
      return '';
    }

    // Si ya es una URL base64 completa
    if (fotografia.startsWith('data:')) {
      return fotografia;
    }
    
    // Si es solo el string base64, agregar el prefijo
    return `data:image/jpeg;base64,${fotografia}`;
  }

  /**
   * Obtiene el placeholder de imagen según el tipo de material
   */
  getPlaceholderIcon(materialProvee: string): string {
    const material = materialProvee?.toLowerCase() || '';
    
    if (material.includes('madera')) return '🪵';
    if (material.includes('cemento') || material.includes('concreto')) return '🏗️';
    if (material.includes('herramienta')) return '🔧';
    if (material.includes('pintura')) return '🎨';
    if (material.includes('electricidad') || material.includes('eléctrico')) return '⚡';
    
    return '🏢'; // Icono por defecto
  }
}