import axios from "axios";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as ExcelJS from "exceljs";

import {
  listarClientesActivos,
  crearCliente,
  actualizarCliente,
  anularCliente
} from "../services/clienteServices";
import type { Cliente } from "../types/cliente";

const formInicial: Cliente = {
  idCliente: null,
  nombre: "",
  telefono: "",
  direccion: ""
};

const obtenerMensajeError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.mensaje ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrió un error inesperado";
};

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Cliente>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = async () => {
    try {
      const resClientes = await listarClientesActivos();
      const listaClientes = Array.isArray(resClientes.data)
        ? resClientes.data
        : (resClientes.data as any)?.content ?? [];

      setClientes(listaClientes);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && form.idCliente !== null) {
        await actualizarCliente(form.idCliente, form);
        setMensaje("Cliente actualizado correctamente");
      } else {
        await crearCliente(form);
        setMensaje("Cliente creado correctamente");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar cliente", error);
      setMensaje(obtenerMensajeError(error));
    }
  };

  const handleModificar = (cliente: Cliente) => {
    setForm({
      ...cliente,
      nombre: cliente.nombre ?? "",
      telefono: cliente.telefono ?? "",
      direccion: cliente.direccion ?? ""
    });
    setModoEdicion(true);
  };

  const handleAnular = async (idCliente: number) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar/anular este cliente?");
    if (!confirmar) return;
    try {
      await anularCliente(idCliente);
      setMensaje("Cliente eliminado correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al anular el cliente", error);
      setMensaje(obtenerMensajeError(error));
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Listado de Clientes", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    const columnas = ["ID", "Nombre", "Teléfono", "Dirección"];
    const filas = clientes.map((cliente) => [
      cliente.idCliente ?? "-",
      cliente.nombre ?? "",
      cliente.telefono ?? "",
      cliente.direccion ?? ""
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 27,
      theme: "striped",
      headStyles: { fillColor: [216, 88, 32], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: "center" });
    }

    return doc;
  };

  const exportarPDF = () => {
    const doc = generarPDF();
    doc.save("clientes.pdf");
  };

  const verPDF = () => {
    const doc = generarPDF();
    const url = doc.output("bloburl");
    window.open(url, "_blank");
  };

  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Clientes");

    hoja.addRow(["Listado de Clientes"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    const encabezado = hoja.addRow(["ID", "Nombre", "Teléfono", "Dirección"]);
    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD85820" } };
      celda.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    clientes.forEach((cliente, indice) => {
      const fila = hoja.addRow([
        cliente.idCliente ?? "-",
        cliente.nombre ?? "",
        cliente.telefono ?? "",
        cliente.direccion ?? ""
      ]);

      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
        if (indice % 2 === 1) {
          celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2E7D3" } };
        }
      });
    });

    hoja.getColumn(1).width = 10;
    hoja.getColumn(2).width = 30;
    hoja.getColumn(3).width = 20;
    hoja.getColumn(4).width = 40;

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "clientes.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Ingresar/Modificar Clientes</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre ?? ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={form.telefono ?? ""}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="direccion">Dirección:</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={form.direccion ?? ""}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{modoEdicion ? "Actualizar" : "Guardar"}</button>
      </form>

      <h2>Listado de Clientes</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button type="button" onClick={verPDF} className="btn-edit">
          Ver PDF
        </button>
        <button type="button" onClick={exportarPDF} className="btn-edit">
          Descargar PDF
        </button>
        <button
          type="button"
          onClick={exportarExcel}
          style={{
            backgroundColor: "#2e7d32",
            color: "white",
            padding: "6px 14px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Descargar Excel
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente, index) => (
            <tr key={cliente.idCliente ?? index}>
              <td>{cliente.nombre}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.direccion}</td>
              <td>
                <button type="button" onClick={() => handleModificar(cliente)}>
                  Modificar
                </button>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() =>
                    cliente.idCliente !== null && handleAnular(cliente.idCliente)
                  }
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;