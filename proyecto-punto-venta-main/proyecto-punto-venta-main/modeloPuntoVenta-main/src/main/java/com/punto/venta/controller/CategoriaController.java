package com.punto.venta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.punto.venta.dto.CategoriaDTO;
import com.punto.venta.service.CategoriaService;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaDTO> getAllCategorias() {
        return categoriaService.findAll();
    }

    @GetMapping("/activos")
    public List<CategoriaDTO> mostrarActivos() {
        return categoriaService.mostrarActivos();
    }

    @GetMapping("/activos/buscar")
    public List<CategoriaDTO> mostrarActivosFiltro(@RequestParam String filtro) {
        return categoriaService.mostrarActivosFiltro(filtro);
    }

    @GetMapping("/activos/top")
    public List<CategoriaDTO> mostrarActivosFiltroTop(
            @RequestParam String filtro, 
            @RequestParam(defaultValue = "5") int limite) {
        return categoriaService.mostrarActivosFiltroTop(filtro, limite);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaDTO createCategoria(@RequestBody CategoriaDTO categoriaDTO) {
        return categoriaService.save(categoriaDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategoria(@PathVariable Integer id) {
        categoriaService.eliminarCantegoria(id);
    }

    @PutMapping("/anular/{id}")
    public CategoriaDTO anularCategoria(@PathVariable Integer id) {
        return categoriaService.anularCategoria(id);
    }

    @PutMapping({"/{id}", "/modificar/{id}"}) 
    public CategoriaDTO modificarCategoria(@PathVariable Integer id, @RequestBody CategoriaDTO categoriaDTO) {
        return categoriaService.modificarCategoria(id, categoriaDTO);
    }
}