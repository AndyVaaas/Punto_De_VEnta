package com.punto.venta.repository;

import com.punto.venta.entity.Categoria;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    List<Categoria> findByEstadoTrueOrderByIdCategoriaDesc();

    // Métodos requeridos por CategoriaService:
    List<Categoria> findByEstadoTrue();

    List<Categoria> findByEstadoTrueAndNombreContainingIgnoreCase(String nombre);

    List<Categoria> findByEstadoTrueAndNombreContainingIgnoreCase(String nombre, Pageable pageable);
}