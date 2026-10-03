import api from "../api/axios";
import type { Cliente } from "../types/cliente";

export const listarClientesActivos = () =>
  api.get<Cliente[]>("/clientes");

export const crearCliente = (data: Cliente) =>
  api.post<Cliente>("/clientes", data);

export const actualizarCliente = (id: number, data: Cliente) =>
  api.put<Cliente>(`/clientes/modificar/${id}`, data);

export const anularCliente = (id: number) =>
  api.put<Cliente>(`/clientes/anular/${id}`);

export const getClientes = listarClientesActivos;
export const eliminarCliente = anularCliente;