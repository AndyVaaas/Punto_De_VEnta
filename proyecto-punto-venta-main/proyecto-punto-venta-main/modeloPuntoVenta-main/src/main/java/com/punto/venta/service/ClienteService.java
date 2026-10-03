package com.punto.venta.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.punto.venta.dto.ClienteDTO;
import com.punto.venta.entity.Cliente;
import com.punto.venta.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<ClienteDTO> listarTodos() {
        return clienteRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ClienteDTO crear(ClienteDTO dto) {
        boolean duplicado = clienteRepository
                .existsByNombreIgnoreCaseAndApellidoIgnoreCase(dto.getNombre(), dto.getApellido());
        if (duplicado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El cliente ya existe");
        }
        return convertToDTO(clienteRepository.save(convertToEntity(dto)));
    }

    public ClienteDTO actualizar(Integer idCliente, ClienteDTO dto) {
        Cliente clienteExistente = clienteRepository.findById(idCliente)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        clienteExistente.setNombre(dto.getNombre());
        clienteExistente.setApellido(dto.getApellido());
        clienteExistente.setEstado(dto.getEstado());
        clienteExistente.setTelefono(dto.getTelefono());
        clienteExistente.setEmail(dto.getEmail());
        if (dto.getFechaRegistro() != null) {
            clienteExistente.setFechaRegistro(dto.getFechaRegistro());
        }

        Cliente clienteGuardado = clienteRepository.save(clienteExistente);
        return convertToDTO(clienteGuardado);
    }

    private ClienteDTO convertToDTO(Cliente c) {
        ClienteDTO dto = new ClienteDTO();
        dto.setIdCliente(c.getIdCliente());
        dto.setNombre(c.getNombre());
        dto.setApellido(c.getApellido());
        dto.setEstado(c.getEstado());
        dto.setEmail(c.getEmail());
        dto.setTelefono(c.getTelefono());
        dto.setFechaRegistro(c.getFechaRegistro());
        return dto;
    }

    private Cliente convertToEntity(ClienteDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setEstado(dto.getEstado());
        cliente.setTelefono(dto.getTelefono());
        cliente.setEmail(dto.getEmail());
        cliente.setFechaRegistro(dto.getFechaRegistro());
        return cliente;
    }
}