package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.Item;
import com.borrowbay.model.ItemAvailabilityBlock;
import com.borrowbay.repository.ItemAvailabilityBlockRepository;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.ItemService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final ItemAvailabilityBlockRepository itemAvailabilityBlockRepository;

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item req) {
        return ResponseEntity.ok(itemService.createItem(req));
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllAvailableItems() {
        return ResponseEntity.ok(itemService.findAllAvailable());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.findById(id));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Item>> getItemsBySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(itemService.findBySellerId(sellerId));
    }

    @GetMapping("/subcategory/{subCategoryId}")
    public ResponseEntity<List<Item>> getItemsBySubCategory(@PathVariable Long subCategoryId) {
        return ResponseEntity.ok(itemService.findBySubCategoryId(subCategoryId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Item>> getItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(itemService.findByCategoryId(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Item>> searchItems(@RequestParam String query) {
        return ResponseEntity.ok(itemService.searchByTitle(query));
    }

    @GetMapping("/{id}/availability-blocks")
public ResponseEntity<List<ItemAvailabilityBlock>> getAvailabilityBlocks(
        @PathVariable Long id) {
    return ResponseEntity.ok(
        itemAvailabilityBlockRepository.findByItemId(id));
}

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item req) {
        return ResponseEntity.ok(itemService.updateItem(id, req));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<Item> toggleAvailability(@PathVariable Long id,
                                                    @RequestParam Boolean isAvailable) {
        return ResponseEntity.ok(itemService.toggleAvailability(id, isAvailable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.ok(new ApiResponse("Item deleted successfully", true));
    }
}