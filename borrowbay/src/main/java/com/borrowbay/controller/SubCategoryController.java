package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.SubCategory;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.SubCategoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/subcategories")
@RequiredArgsConstructor
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    @PostMapping
    public ResponseEntity<SubCategory> createSubCategory(@RequestBody SubCategory req) {
        return ResponseEntity.ok(subCategoryService.createSubCategory(req));
    }

    @GetMapping
    public ResponseEntity<List<SubCategory>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategory> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subCategoryService.findById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<SubCategory>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(subCategoryService.findByCategoryId(categoryId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubCategory> updateSubCategory(@PathVariable Long id, @RequestBody SubCategory req) {
        return ResponseEntity.ok(subCategoryService.updateSubCategory(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteSubCategory(@PathVariable Long id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.ok(new ApiResponse("SubCategory deleted successfully", true));
    }
}