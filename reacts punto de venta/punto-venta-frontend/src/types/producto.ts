export interface Producto {
  idProducto: number | null;
  nombre: string;
  precio: number;
  stock: number;
  idCategoria: number | null;
}