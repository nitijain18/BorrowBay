package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.SubCategory;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    List<SubCategory> findByCategoryId(Long categoryId);
    Optional<SubCategory> findByName(String name);
}