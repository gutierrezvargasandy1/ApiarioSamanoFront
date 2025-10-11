import { Component } from '@angular/core';

@Component({
  selector: 'app-proveedores',
  standalone: false,
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css'
})

export class Proveedores {
  proveedores = [
    { foto: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png', nombre_empresa: 'Apícola del Valle', telefono: '555-123-4567', material: 'Cera de abeja' },
    { foto: 'https://cdn-icons-png.flaticon.com/512/616/616408.png', nombre_empresa: 'Envapack', telefono: '555-987-6543', material: 'Envases de vidrio' },
    { foto: 'https://cdn-icons-png.flaticon.com/512/1999/1999625.png', nombre_empresa: 'MetalMiel', telefono: '555-321-7789', material: 'Tapas metálicas' }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  proveedorSeleccionado: any = {};

  filtrarProveedores() {
    return this.proveedores.filter(p =>
      p.nombre_empresa.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
      p.telefono.includes(this.terminoBusqueda)
    );
  }

  abrirFormulario(proveedor?: any) {
    this.mostrarFormulario = true;
    if (proveedor) {
      this.editando = true;
      this.proveedorSeleccionado = { ...proveedor };
    } else {
      this.editando = false;
      this.proveedorSeleccionado = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarProveedor() {
    if (this.editando) {
      const index = this.proveedores.findIndex(p => p.nombre_empresa === this.proveedorSeleccionado.nombre_empresa);
      this.proveedores[index] = this.proveedorSeleccionado;
    } else {
      this.proveedores.push({ ...this.proveedorSeleccionado });
    }
    this.cerrarFormulario();
  }

  editarProveedor(proveedor: any) {
    this.abrirFormulario(proveedor);
  }

  eliminarProveedor(proveedor: any) {
    this.proveedores = this.proveedores.filter(p => p !== proveedor);
  }
}
