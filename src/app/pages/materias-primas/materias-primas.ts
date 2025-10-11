import { Component } from '@angular/core';

@Component({
  selector: 'app-materias-primas',
  standalone: false,
  templateUrl: './materias-primas.html',
  styleUrl: './materias-primas.css'
})



export class MateriasPrimas {
  materias = [
    { nombre: 'Cera de abeja', cantidad: 50, almacen: 'A1', proveedor: 'Apicultores del Sur', foto: 'https://cdn-icons-png.flaticon.com/512/3253/3253119.png' },
    { nombre: 'Envases de vidrio', cantidad: 200, almacen: 'B3', proveedor: 'Envapack', foto: 'https://cdn-icons-png.flaticon.com/512/2025/2025242.png' },
    { nombre: 'Tapas metálicas', cantidad: 180, almacen: 'B1', proveedor: 'Suministros MX', foto: 'https://cdn-icons-png.flaticon.com/512/7430/7430323.png' }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  materiaSeleccionada: any = {};

  filtrarMaterias() {
    return this.materias.filter(m =>
      m.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  abrirFormulario(materia?: any) {
    this.mostrarFormulario = true;
    if (materia) {
      this.editando = true;
      this.materiaSeleccionada = { ...materia };
    } else {
      this.editando = false;
      this.materiaSeleccionada = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarMateria() {
    if (this.editando) {
      const index = this.materias.findIndex(m => m.nombre === this.materiaSeleccionada.nombre);
      this.materias[index] = this.materiaSeleccionada;
    } else {
      this.materias.push({ ...this.materiaSeleccionada });
    }
    this.cerrarFormulario();
  }

  editarMateria(materia: any) {
    this.abrirFormulario(materia);
  }

  eliminarMateria(materia: any) {
    this.materias = this.materias.filter(m => m !== materia);
  }
}
