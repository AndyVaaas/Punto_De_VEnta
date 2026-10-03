import axios from "axios";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as ExcelJS from "exceljs";

import {
  listarCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  anularCategoria
} from "../services/categoriaServices";
import type { Categoria } from "../types/categoria";

const formInicial: Categoria = {
  idCategoria: null,
  nombre: "",
  descripcion: ""
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

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Categoria>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas();
      const listaCategorias = Array.isArray(respuesta.data)
        ? respuesta.data
        : (respuesta.data as any)?.content ?? [];

      setCategorias(listaCategorias);
    } catch (error) {
      console.error("Error al listar categorías", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && form.idCategoria !== null) {
        await actualizarCategoria(form.idCategoria, form);
        setMensaje("Categoría actualizada correctamente");
      } else {
        await crearCategoria(form);
        setMensaje("Categoría creada correctamente");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarCategorias();
    } catch (error) {
      console.error("Error al guardar categoría", error);
      setMensaje(obtenerMensajeError(error));
    }
  };

  const handleModificar = (categoria: Categoria) => {
    setForm({
      ...categoria,
      nombre: categoria.nombre ?? "",
      descripcion: categoria.descripcion ?? ""
    });
    setModoEdicion(true);
  };

  const handleAnular = async (idCategoria: number) => {
    const confirmar = window.confirm("¿Seguro que deseas anular esta categoría?");
    if (!confirmar) return;
    try {
      await anularCategoria(idCategoria);
      setMensaje("Categoría anulada correctamente");
      cargarCategorias();
    } catch (error) {
      console.error("Error al anular la categoría", error);
      setMensaje(obtenerMensajeError(error));
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Listado de Categorías", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    const columnas = ["ID", "Nombre", "Descripción"];
    const filas = categorias.map((categoria) => [
      categoria.idCategoria ?? "-",
      categoria.nombre ?? "",
      categoria.descripcion ?? ""
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 27,
      theme: "striped",
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 244, 248] }
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
    doc.save("categorias.pdf");
  };

  const verPDF = () => {
    const doc = generarPDF();
    const url = doc.output("bloburl");
    window.open(url, "_blank");
  };

  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Categorias");

    hoja.addRow(["Listado de Categorías"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    const encabezado = hoja.addRow(["ID", "Nombre", "Descripción"]);
    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };
      celda.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    categorias.forEach((categoria, indice) => {
      const fila = hoja.addRow([
        categoria.idCategoria ?? "-",
        categoria.nombre ?? "",
        categoria.descripcion ?? ""
      ]);

      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
        if (indice % 2 === 1) {
          celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4F8" } };
        }
      });
    });

    hoja.getColumn(1).width = 10;
    hoja.getColumn(2).width = 30;
    hoja.getColumn(3).width = 50;

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "categorias.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Ingresar/Modificar Categorías</h2>
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
          <label htmlFor="descripcion">Descripción:</label>
          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={form.descripcion ?? ""}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{modoEdicion ? "Actualizar" : "Guardar"}</button>
      </form>

      <h2>Listado de Categorías</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button type="button" onClick={verPDF}>
          Ver PDF
        </button>
        <button type="button" onClick={exportarPDF}>
          Descargar PDF
        </button>
        <button type="button" onClick={exportarExcel}>
          Descargar Excel
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria, index) => (
            <tr key={categoria.idCategoria ?? index}>
              <td>{categoria.nombre}</td>
              <td>{categoria.descripcion}</td>
              <td>
                <button type="button" onClick={() => handleModificar(categoria)}>
                  Modificar
                </button>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() =>
                    categoria.idCategoria !== null && handleAnular(categoria.idCategoria)
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

export default Categorias;