package com.punto.venta.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.punto.venta.dto.ClienteDTO;
import com.punto.venta.dto.MessageResponse;
import com.punto.venta.repository.ClienteRepository;
import com.punto.venta.service.ClienteService;

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "http://localhost:5173")
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService,
                             ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<ClienteDTO> listarTodos() {
        return clienteService.listarTodos();
    }

    @GetMapping("/activos")
    public List<ClienteDTO> listarActivos() {
        return clienteService.listarTodos(); // Cambiar por tu método de activos si tienes uno en el Service
    }

    @PostMapping
    public ResponseEntity<MessageResponse> crearCliente(@RequestBody ClienteDTO clienteDTO) {
        try {
            clienteService.crear(clienteDTO);
            return ResponseEntity.ok(new MessageResponse("Cliente creado con éxito"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error: el cliente ya existe"));
        }
    }

    @PutMapping("/modificar/{idCliente}")
    public ResponseEntity<MessageResponse> actualizarCliente(
            @PathVariable Integer idCliente, 
            @RequestBody ClienteDTO clienteDTO) {
        try {
            clienteService.actualizar(idCliente, clienteDTO);
            return ResponseEntity.ok(new MessageResponse("Cliente actualizado con éxito"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error al actualizar el cliente: " + e.getMessage()));
        }
    }

    @PutMapping("/anular/{idCliente}")
    public ResponseEntity<MessageResponse> anularCliente(@PathVariable Integer idCliente) {
        try {
            // Llama a tu método de servicio para anular o eliminar el cliente
            return ResponseEntity.ok(new MessageResponse("Cliente anulado con éxito"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Error al anular el cliente: " + e.getMessage()));
        }
    }
}