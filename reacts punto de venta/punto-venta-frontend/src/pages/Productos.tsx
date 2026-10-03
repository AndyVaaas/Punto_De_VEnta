import axios from "axios";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as ExcelJS from "exceljs";

import {
  listarProductosActivos,
  crearProducto,
  actualizarProducto,
  anularProducto
} from "../services/productoServices";
import { listarCategoriasActivas } from "../services/categoriaServices";
import type { Producto } from "../types/producto";
import type { Categoria } from "../types/categoria";

const formInicial: Producto = {
  idProducto: null,
  nombre: "",
  precio: 0,
  stock: 0,
  categoria: {
    idCategoria: null,
    nombre: "",
    descripcion: ""
  }
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

function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Producto>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = async () => {
    try {
      const [resProductos, resCategorias] = await Promise.all([
        listarProductosActivos(),
        listarCategoriasActivas()
      ]);

      const listaProductos = Array.isArray(resProductos.data)
        ? resProductos.data
        : (resProductos.data as any)?.content ?? [];

      const listaCategorias = Array.isArray(resCategorias.data)
        ? resCategorias.data
        : (resCategorias.data as any)?.content ?? [];

      setProductos(listaProductos);
      setCategorias(listaCategorias);
    } catch (error) {
      console.error("Error al cargar productos o categorías", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "idCategoria") {
      const categoriaSeleccionada = categorias.find(
        (c) => c.idCategoria === Number(value)
      );
      setForm((prev) => ({
        ...prev,
        categoria: categoriaSeleccionada ?? {
          idCategoria: Number(value),
          nombre: "",
          descripcion: ""
        }
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "precio" || name === "stock" ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && form.idProducto !== null) {
        await actualizarProducto(form.idProducto, form);
        setMensaje("Producto actualizado correctamente");
      } else {
        await crearProducto(form);
        setMensaje("Producto creado correctamente");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar producto", error);
      setMensaje(obtenerMensajeError(error));
    }
  };

  const handleModificar = (producto: Producto) => {
    setForm({
      ...producto,
      nombre: producto.nombre ?? "",
      precio: producto.precio ?? 0,
      stock: producto.stock ?? 0,
      categoria: producto.categoria ?? {
        idCategoria: null,
        nombre: "",
        descripcion: ""
      }
    });
    setModoEdicion(true);
  };

  const handleAnular = async (idProducto: number) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;
    try {
      await anularProducto(idProducto);
      setMensaje("Producto eliminado correctamente");
      cargarDatos();
    } catch (error) {
      console.error("Error al anular el producto", error);
      setMensaje(obtenerMensajeError(error));
    }
  };

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Listado de Productos", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    const columnas = ["ID", "Nombre", "Precio", "Stock", "Categoría"];
    const filas = productos.map((producto) => [
      producto.idProducto ?? "-",
      producto.nombre ?? "",
      `$${Number(producto.precio ?? 0).toFixed(2)}`,
      producto.stock ?? 0,
      producto.categoria?.nombre ?? "-"
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
    doc.save("productos.pdf");
  };

  const verPDF = () => {
    const doc = generarPDF();
    const url = doc.output("bloburl");
    window.open(url, "_blank");
  };

  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Productos");

    hoja.addRow(["Listado de Productos"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    const encabezado = hoja.addRow(["ID", "Nombre", "Precio", "Stock", "Categoría"]);
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

    productos.forEach((producto, indice) => {
      const fila = hoja.addRow([
        producto.idProducto ?? "-",
        producto.nombre ?? "",
        Number(producto.precio ?? 0),
        producto.stock ?? 0,
        producto.categoria?.nombre ?? "-"
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
    hoja.getColumn(3).width = 15;
    hoja.getColumn(4).width = 15;
    hoja.getColumn(5).width = 25;

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "productos.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Ingresar/Modificar Productos</h2>
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
          <label htmlFor="precio">Precio:</label>
          <input
            type="number"
            id="precio"
            name="precio"
            step="0.01"
            value={form.precio ?? 0}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="stock">Stock:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={form.stock ?? 0}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="idCategoria">Categoría:</label>
          <select
            id="idCategoria"
            name="idCategoria"
            value={form.categoria?.idCategoria ?? ""}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.idCategoria} value={cat.idCategoria ?? ""}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">{modoEdicion ? "Actualizar" : "Guardar"}</button>
      </form>

      <h2>Listado de Productos</h2>

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
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, index) => (
            <tr key={producto.idProducto ?? index}>
              <td>{producto.nombre}</td>
              <td>${Number(producto.precio ?? 0).toFixed(2)}</td>
              <td>{producto.stock}</td>
              <td>{producto.categoria?.nombre}</td>
              <td>
                <button type="button" onClick={() => handleModificar(producto)}>
                  Modificar
                </button>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() =>
                    producto.idProducto !== null && handleAnular(producto.idProducto)
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

export default Productos;


