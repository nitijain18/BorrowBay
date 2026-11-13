package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.Category;
import com.borrowbay.model.SubCategory;
import com.borrowbay.repository.CategoryRepository;
import com.borrowbay.repository.SubCategoryRepository;
import com.borrowbay.service.SubCategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubCategoryServiceImpl implements SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public SubCategory createSubCategory(SubCategory req) {
        if (req.getCategory() == null || req.getCategory().getId() == null) {
            throw new BorrowBayException("Category id is required");
        }
        Category category = categoryRepository.findById(req.getCategory().getId())
                .orElseThrow(() -> new BorrowBayException("Category not found"));

        SubCategory subCategory = new SubCategory();
        subCategory.setName(req.getName());
        subCategory.setImageUrl(req.getImageUrl());
        subCategory.setCategory(category);
        return subCategoryRepository.save(subCategory);
    }

    @Override
    public SubCategory findById(Long id) {
        return subCategoryRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("SubCategory not found with id " + id));
    }

    @Override
    public List<SubCategory> findAll() {
        return subCategoryRepository.findAll();
    }

    @Override
    public List<SubCategory> findByCategoryId(Long categoryId) {
        return subCategoryRepository.findByCategoryId(categoryId);
    }

    @Override
    public SubCategory updateSubCategory(Long id, SubCategory req) {
        SubCategory subCategory = findById(id);
        subCategory.setName(req.getName());
        subCategory.setImageUrl(req.getImageUrl());
        if (req.getCategory() != null && req.getCategory().getId() != null) {
            Category category = categoryRepository.findById(req.getCategory().getId())
                    .orElseThrow(() -> new BorrowBayException("Category not found"));
            subCategory.setCategory(category);
        }
        return subCategoryRepository.save(subCategory);
    }

    @Override
    public void deleteSubCategory(Long id) {
        subCategoryRepository.delete(findById(id));
    }
}