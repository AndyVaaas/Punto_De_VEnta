package com.punto.venta.service;

import com.punto.venta.entity.PedidoDetalle;
import com.punto.venta.repository.PedidoDetalleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PedidoDetalleService {
    @Autowired
    private PedidoDetalleRepository pedidoDetalleRepository;

    public List<PedidoDetalle> findAll() {
        return pedidoDetalleRepository.findAll();
    }

    public PedidoDetalle save(PedidoDetalle pedidoDetalle) {
        return pedidoDetalleRepository.save(pedidoDetalle);
    }
}