package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.Item;

public interface ItemService {
    Item createItem(Item req);
    Item findById(Long id);
    List<Item> findAllAvailable();
    List<Item> findAll();
    List<Item> findBySellerId(Long sellerId);
    List<Item> findBySubCategoryId(Long subCategoryId);
    List<Item> findByCategoryId(Long categoryId);
    List<Item> searchByTitle(String query);
    Item updateItem(Long id, Item req);
    Item toggleAvailability(Long id, Boolean isAvailable);
    void deleteItem(Long id);
}