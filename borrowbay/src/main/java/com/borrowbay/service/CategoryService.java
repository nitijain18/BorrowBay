package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.Category;

public interface CategoryService {
    Category createCategory(Category req);
    Category findById(Long id);
    List<Category> findAll();
    Category updateCategory(Long id, Category req);
    void deleteCategory(Long id);
}