package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findBySellerId(Long sellerId);
    List<Item> findBySubCategoryId(Long subCategoryId);
    List<Item> findByIsAvailableTrue();
    List<Item> findBySubCategoryIdAndIsAvailableTrue(Long subCategoryId);
    List<Item> findByTitleContainingIgnoreCaseAndIsAvailableTrue(String title);
    List<Item> findBySubCategoryCategoryId(Long categoryId);
}