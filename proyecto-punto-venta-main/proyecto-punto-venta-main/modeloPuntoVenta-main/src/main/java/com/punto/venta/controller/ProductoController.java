package com.punto.venta.controller;

import java.util.HashMap;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.punto.venta.dto.ProductoDTO;
import com.punto.venta.entity.Producto;
import com.punto.venta.repository.ProductoRepository;
import com.punto.venta.service.ProductoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    private final ProductoRepository productoRepository;
    private final ProductoService productoService;

    public ProductoController(ProductoService productoService, ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductoDTO> listarTodos() {
        return productoService.listarProductos();
    }
@PostMapping
    public ResponseEntity<Map<String, String>> guardar(@RequestBody ProductoDTO productoDTO) {
        productoService.guardarProducto(productoDTO);
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Producto Creado con éxito");
        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }
}
