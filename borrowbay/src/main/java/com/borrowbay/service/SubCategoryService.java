package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.SubCategory;

public interface SubCategoryService {
    SubCategory createSubCategory(SubCategory req);
    SubCategory findById(Long id);
    List<SubCategory> findAll();
    List<SubCategory> findByCategoryId(Long categoryId);
    SubCategory updateSubCategory(Long id, SubCategory req);
    void deleteSubCategory(Long id);
}