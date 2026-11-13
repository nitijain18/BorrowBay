package com.borrowbay.service.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file, String folder) {

        try {
            // Upload file to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),           // file content as bytes
                    ObjectUtils.asMap(
                            "folder", folder,  // organize in folders
                            // e.g. "borrowbay/items", "borrowbay/profiles"
                            "resource_type", "auto"
                            // "auto" = handles images AND videos automatically
                    )
            );

            // Cloudinary returns a Map with many fields
            // "secure_url" = the HTTPS URL of the uploaded file
            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new BorrowBayException("Image upload failed: " + e.getMessage());
        }
    }

    @Override
    public void deleteImage(String imageUrl) {
        try {
            // Extract public_id from URL
            // URL looks like: https://res.cloudinary.com/dxxxxx/image/upload/v123/borrowbay/items/abc123.jpg
            // public_id = "borrowbay/items/abc123" (no extension)
            String publicId = extractPublicId(imageUrl);

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

        } catch (IOException e) {
            throw new BorrowBayException("Image delete failed: " + e.getMessage());
        }
    }

    private String extractPublicId(String imageUrl) {
        // Split by "/" and get last part
        String[] parts = imageUrl.split("/");
        String fileWithExtension = parts[parts.length - 1];
        // Remove extension: "abc123.jpg" → "abc123"
        String fileName = fileWithExtension.substring(0,
                fileWithExtension.lastIndexOf("."));
        // Get folder path: "borrowbay/items"
        String folder = parts[parts.length - 2];
        return folder + "/" + fileName;
    }
}