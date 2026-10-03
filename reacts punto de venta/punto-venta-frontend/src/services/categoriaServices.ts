import api from "../api/axios";
import type { Categoria } from "../types/categoria";

export const listarCategoriasActivas = () =>
  api.get<Categoria[]>("/categorias/activos");

export const crearCategoria = (data: Omit<Categoria, "idCategoria">) =>
  api.post<Categoria>("/categorias", data);

export const actualizarCategoria = (
  id: number,
  data: Omit<Categoria, "idCategoria">
) => api.put<Categoria>(`/categorias/modificar/${id}`, data);

export const anularCategoria = (id: number) =>
  api.put<Categoria>(`/categorias/anular/${id}`);

// Alias para mantener compatibilidad
export const getCategorias = listarCategoriasActivas;
export const eliminarCategoria = anularCategoria;