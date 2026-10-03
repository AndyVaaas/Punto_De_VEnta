package com.punto.venta.controller;

import com.punto.venta.entity.PedidoDetalle;
import com.punto.venta.service.PedidoDetalleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pedido-detalles")
public class PedidoDetalleController {
    @Autowired
    private PedidoDetalleService pedidoDetalleService;

    @GetMapping
    public List<PedidoDetalle> listar() {
        return pedidoDetalleService.findAll();
    }

    @PostMapping
    public PedidoDetalle guardar(@RequestBody PedidoDetalle pedidoDetalle) {
        return pedidoDetalleService.save(pedidoDetalle);
    }
}