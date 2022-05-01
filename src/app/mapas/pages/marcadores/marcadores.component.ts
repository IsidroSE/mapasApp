import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface Marcador {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number]
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [`
  div.mapa-container {
    width: 100%;
    height: 100%;
  }

  .list-group {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 99;
  }

  li {
    cursor: pointer;
  }
  `]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [-0.277761, 39.069170];

  // Arreglo de marcadores
  marcadores: Marcador[] = []

  constructor() { }

  ngAfterViewInit(): void {

    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });

    this.leerLocalStorage();

    // const markerHtml: HTMLElement = document.createElement('div');
    // markerHtml.innerHTML = 'Hola Mundo';

    // const marker = new mapboxgl.Marker()
    // .setLngLat( this.center )
    // .addTo( this.mapa );

  }

  agregarMarcador(): void {

    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color
    })
    .setLngLat( this.center )
    .addTo( this.mapa );

    this.marcadores.push( {
      color,
      marker: nuevoMarcador
    } );

    this.guardarMarcadoresLocalStorage();

    nuevoMarcador.on('dragged', () => {
      this.guardarMarcadoresLocalStorage();
    });
    
  }

  goToMarcador(marcador: Marcador): void {
    this.mapa.flyTo({
      center: marcador.marker?.getLngLat()
    });
  }

  guardarMarcadoresLocalStorage(): void {

    const lngLatArr: Marcador[] = [];

    this.marcadores.forEach( m => {
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({
        color,
        centro: [ lng, lat ]
      })

      localStorage.setItem('marcadores', JSON.stringify(lngLatArr));

    })

  }

  leerLocalStorage(): void {

    if ( !localStorage.getItem('marcadores') ) {
      return;
    }

    const lngLatArr: Marcador[] = JSON.parse( localStorage.getItem('marcadores')! );

    lngLatArr.forEach( m => {
      
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      })
      .setLngLat( m.centro! )
      .addTo( this.mapa );

      this.marcadores.push({
        marker: newMarker,
        color: m.color
      });

      newMarker.on('dragged', () => {
        this.guardarMarcadoresLocalStorage();
      });

    })

  }

  borrarMarcador(index: number): void {
    this.marcadores[index].marker?.remove();
    this.marcadores.splice(index, 1);
    this.guardarMarcadoresLocalStorage();
  }

}
