import { Component } from '@angular/core';

@Component({
  selector: 'app-herramientas',
  standalone: false,
  templateUrl: './herramientas.html',
  styleUrl: './herramientas.css'
})

export class Herramientas {
  herramientas = [
    { nombre: 'Extractor de miel', estado: 'Disponible', cantidad: 3, imagen: 'https://cdn-icons-png.flaticon.com/512/618/618175.png' },
    { nombre: 'Ahumador', estado: 'En uso', cantidad: 2, imagen: 'https://cdn-icons-png.flaticon.com/512/3076/3076355.png' },
    { nombre: 'Traje protector', estado: 'Disponible', cantidad: 5, imagen: 'https://cdn-icons-png.flaticon.com/512/1946/1946545.png' },
    { nombre: 'Cuchillo desoperculador', estado: 'En reparación', cantidad: 1, imagen: 'https://cdn-icons-png.flaticon.com/512/447/447031.png' }
  ];

  terminoBusqueda: string = '';
  mostrarFormulario: boolean = false;
  editando: boolean = false;
  herramientaSeleccionada: any = {};

  filtrarHerramientas() {
    return this.herramientas.filter(h =>
      h.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  abrirFormulario(herramienta?: any) {
    this.mostrarFormulario = true;
    if (herramienta) {
      this.editando = true;
      this.herramientaSeleccionada = { ...herramienta };
    } else {
      this.editando = false;
      this.herramientaSeleccionada = {};
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  guardarHerramienta() {
    if (this.editando) {
      const index = this.herramientas.findIndex(h => h.nombre === this.herramientaSeleccionada.nombre);
      this.herramientas[index] = this.herramientaSeleccionada;
    } else {
      this.herramientas.push({ ...this.herramientaSeleccionada });
    }
    this.cerrarFormulario();
  }

  editarHerramienta(herramienta: any) {
    this.abrirFormulario(herramienta);
  }

  eliminarHerramienta(herramienta: any) {
    this.herramientas = this.herramientas.filter(h => h !== herramienta);
  }
}
