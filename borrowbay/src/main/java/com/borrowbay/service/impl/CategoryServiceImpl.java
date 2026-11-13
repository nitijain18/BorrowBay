package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.Category;
import com.borrowbay.repository.CategoryRepository;
import com.borrowbay.service.CategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public Category createCategory(Category req) {
        Category category = new Category();
        category.setName(req.getName());
        category.setImageUrl(req.getImageUrl());
        return categoryRepository.save(category);
    }

    @Override
    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Category not found with id " + id));
    }

    @Override
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Override
    public Category updateCategory(Long id, Category req) {
        Category category = findById(id);
        category.setName(req.getName());
        category.setImageUrl(req.getImageUrl());
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.delete(findById(id));
    }
}