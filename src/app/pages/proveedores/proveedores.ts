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
  proveedorSeleccionado: ProveedorRequest = {} as ProveedorRequest;

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
    if (proveedor) {
      this.editando = true;
      this.proveedorSeleccionado = { ...proveedor }; // clonamos
    } else {
      this.editando = false;
      this.proveedorSeleccionado = {} as ProveedorRequest;
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.proveedorSeleccionado = {} as ProveedorRequest;
    this.editando = false;
  }

  guardarProveedor() {
    // Convertir Uint8Array a Base64 si hay imagen
    if (this.proveedorSeleccionado.fotografia && !(typeof this.proveedorSeleccionado.fotografia === 'string')) {
  const bytes = this.proveedorSeleccionado.fotografia as Uint8Array;
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  this.proveedorSeleccionado.fotografia = btoa(binary);
}
    if (this.editando && this.proveedorSeleccionado.id) {
      this.proveedoresService.actualizarProveedor(this.proveedorSeleccionado.id, this.proveedorSeleccionado)
        .subscribe({
          next: () => {
            this.cargarProveedores();
            this.cerrarFormulario();
          },
          error: (err) => console.error('Error al actualizar proveedor', err)
        });
    } else {
      this.proveedoresService.crearProveedor(this.proveedorSeleccionado)
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
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // extraemos Base64
        this.proveedorSeleccionado.fotografia = base64; // directamente Base64 string
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarProveedor(proveedor: Proveedor) {
    if (!proveedor.id) return;
    this.proveedoresService.eliminarProveedor(proveedor.id).subscribe({
      next: () => this.cargarProveedores(),
      error: (err) => console.error('Error al eliminar proveedor', err)
    });
  }
}
