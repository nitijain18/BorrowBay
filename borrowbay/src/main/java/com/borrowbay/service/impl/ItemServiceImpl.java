package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.Item;
import com.borrowbay.model.SubCategory;
import com.borrowbay.model.User;
import com.borrowbay.model.Wishlist;
import com.borrowbay.repository.ItemAvailabilityBlockRepository;
import com.borrowbay.repository.CartItemRepository;
import com.borrowbay.repository.ItemAvailabilityBlockRepository;
import com.borrowbay.repository.ItemRepository;
import com.borrowbay.repository.RentalHistoryRepository;
import com.borrowbay.repository.SubCategoryRepository;
import com.borrowbay.repository.UserRepository;
import com.borrowbay.repository.WishlistRepository;
import com.borrowbay.service.ItemService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final WishlistRepository wishlistRepository;
    private final CartItemRepository cartItemRepository;
    private final ItemAvailabilityBlockRepository itemAvailabilityBlockRepository; 
    private final RentalHistoryRepository rentalHistoryRepository;
    

    @Override
    public Item createItem(Item req) {
        if (req.getSeller() == null || req.getSeller().getId() == null)
            throw new BorrowBayException("Seller id is required");
        if (req.getSubCategory() == null || req.getSubCategory().getId() == null)
            throw new BorrowBayException("SubCategory id is required");

        User seller = userRepository.findById(req.getSeller().getId())
                .orElseThrow(() -> new BorrowBayException("Seller not found"));
        SubCategory subCategory = subCategoryRepository.findById(req.getSubCategory().getId())
                .orElseThrow(() -> new BorrowBayException("SubCategory not found"));

        Item item = new Item();
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setImages(req.getImages());
        item.setRentPricePerDay(req.getRentPricePerDay());
        item.setSecurityDeposit(req.getSecurityDeposit());
        item.setCondition(req.getCondition());
        item.setIsAvailable(true);
        item.setSeller(seller);
        item.setSubCategory(subCategory);
        item.setCreatedAt(LocalDateTime.now());
        return itemRepository.save(item);
    }

    @Override
    public Item findById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Item not found with id " + id));
    }

    @Override
    public List<Item> findAllAvailable() {
        return itemRepository.findByIsAvailableTrue();
    }

    @Override
    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    @Override
    public List<Item> findBySellerId(Long sellerId) {
        return itemRepository.findBySellerId(sellerId);
    }

    @Override
    public List<Item> findBySubCategoryId(Long subCategoryId) {
        return itemRepository.findBySubCategoryIdAndIsAvailableTrue(subCategoryId);
    }

    @Override
    public List<Item> findByCategoryId(Long categoryId) {
        return itemRepository.findBySubCategoryCategoryId(categoryId);
    }

    @Override
    public List<Item> searchByTitle(String query) {
        return itemRepository.findByTitleContainingIgnoreCaseAndIsAvailableTrue(query);
    }

    @Override
    public Item updateItem(Long id, Item req) {
        Item item = findById(id);
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setImages(req.getImages());
        item.setRentPricePerDay(req.getRentPricePerDay());
        item.setSecurityDeposit(req.getSecurityDeposit());
        item.setCondition(req.getCondition());
        if (req.getSubCategory() != null && req.getSubCategory().getId() != null) {
            SubCategory sub = subCategoryRepository.findById(req.getSubCategory().getId())
                    .orElseThrow(() -> new BorrowBayException("SubCategory not found"));
            item.setSubCategory(sub);
        }
        return itemRepository.save(item);
    }

    @Override
    public Item toggleAvailability(Long id, Boolean isAvailable) {
        Item item = findById(id);
        item.setIsAvailable(isAvailable);
        return itemRepository.save(item);
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        Item item = findById(id);

        // Remove from all wishlists first
        List<Wishlist> wishlists = wishlistRepository.findAll();
        for (Wishlist wishlist : wishlists) {
            wishlist.getItems().remove(item);
            wishlistRepository.save(wishlist);
        }

        // Remove from all carts
        cartItemRepository.deleteByItemId(id);

        // Delete availability blocks
        itemAvailabilityBlockRepository.deleteByItemId(id); 

        // Delete rental history
        rentalHistoryRepository.deleteByItemId(id);

        // Now delete the item (cascades to item_images)
        itemRepository.delete(item);
        
    }
}