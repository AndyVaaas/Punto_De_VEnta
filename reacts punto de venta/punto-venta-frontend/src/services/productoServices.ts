import api from "../api/axios";
import type { Producto } from "../types/producto";

export const listarProductosActivos = () =>
  api.get<Producto[]>("/productos");

export const crearProducto = (data: Producto) => {
  const payload = {
    ...data,
    idCategoria: data.categoria?.idCategoria ?? data.idCategoria
  };
  return api.post<Producto>("/productos", payload);
};

export const actualizarProducto = (id: number, data: Producto) => {
  const payload = {
    ...data,
    idCategoria: data.categoria?.idCategoria ?? data.idCategoria
  };
  return api.put<Producto>(`/productos/modificar/${id}`, payload);
};

export const anularProducto = (id: number) =>
  api.put<Producto>(`/productos/anular/${id}`);

export const getProductos = listarProductosActivos;
export const eliminarProducto = anularProducto;