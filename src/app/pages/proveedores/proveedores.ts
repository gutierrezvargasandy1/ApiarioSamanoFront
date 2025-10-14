import { Component, OnInit } from '@angular/core';
import { ProveedoresService, Proveedor, ProveedorRequest } from '../../services/proveedoresService/proveedores-service';

@Component({
  selector: 'app-proveedores',
  standalone: false,  
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.css']
})
export class Proveedores implements OnInit {

  proveedores: Proveedor[] = [];
  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  proveedorSeleccionado: ProveedorRequest = {
    nombreEmpresa: '',
    numTelefono: '',
    materialProvee: ''
  };
  archivoSeleccionado: File | null = null;

  constructor(private proveedoresService: ProveedoresService) {}

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.proveedoresService.listarProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: (err) => console.error('Error al cargar proveedores', err)
    });
  }

  filtrarProveedores(): Proveedor[] {
    if (!Array.isArray(this.proveedores)) return [];
    return this.proveedores.filter(p =>
      p.nombreEmpresa?.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      p.numTelefono?.includes(this.terminoBusqueda)
    );
  }

  abrirFormulario(proveedor?: Proveedor) {
    this.mostrarFormulario = true;
    this.archivoSeleccionado = null;
    
    if (proveedor) {
      this.editando = true;
      this.proveedorSeleccionado = { 
        id: proveedor.id,
        nombreEmpresa: proveedor.nombreEmpresa || '',
        numTelefono: proveedor.numTelefono || '',
        materialProvee: proveedor.materialProvee || '',
        fotografia: proveedor.fotografia // Base64 para preview
      };
    } else {
      this.editando = false;
      this.proveedorSeleccionado = {
        nombreEmpresa: '',
        numTelefono: '',
        materialProvee: ''
      };
    }
  }

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

  guardarProveedor() {
    // Preparar el objeto para enviar
    const proveedorParaEnviar: ProveedorRequest = {
      nombreEmpresa: this.proveedorSeleccionado.nombreEmpresa,
      numTelefono: this.proveedorSeleccionado.numTelefono,
      materialProvee: this.proveedorSeleccionado.materialProvee
    };

    // Si hay un archivo seleccionado, agregarlo
    if (this.archivoSeleccionado) {
      proveedorParaEnviar.fotografia = this.archivoSeleccionado;
    }

    if (this.editando && this.proveedorSeleccionado.id) {
      this.proveedoresService.actualizarProveedor(this.proveedorSeleccionado.id, proveedorParaEnviar)
        .subscribe({
          next: () => {
            this.cargarProveedores();
            this.cerrarFormulario();
          },
          error: (err) => console.error('Error al actualizar proveedor', err)
        });
    } else {
      this.proveedoresService.crearProveedor(proveedorParaEnviar)
        .subscribe({
          next: () => {
            this.cargarProveedores();
            this.cerrarFormulario();
          },
          error: (err) => console.error('Error al crear proveedor', err)
        });
    }
  }

  editarProveedor(proveedor: Proveedor) {
    this.abrirFormulario(proveedor);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.proveedorSeleccionado.fotografia = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarFoto() {
    this.archivoSeleccionado = null;
    this.proveedorSeleccionado.fotografia = undefined;
  }

  eliminarProveedor(proveedor: Proveedor) {
    if (!proveedor.id) return;
    
    if (confirm(`¿Estás seguro de eliminar a ${proveedor.nombreEmpresa}?`)) {
      this.proveedoresService.eliminarProveedor(proveedor.id).subscribe({
        next: () => this.cargarProveedores(),
        error: (err) => console.error('Error al eliminar proveedor', err)
      });
    }
  }

  // Método para mostrar imagen en el template
  getFotoUrl(fotografia: string | undefined): string {
    if (fotografia && fotografia.startsWith('data:')) {
      return fotografia;
    } else if (fotografia) {
      return 'data:image/jpeg;base64,' + fotografia;
    }
    return ''; // o una imagen por defecto
  }
}