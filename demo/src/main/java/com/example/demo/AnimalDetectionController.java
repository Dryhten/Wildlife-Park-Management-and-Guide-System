package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/animal")
public class AnimalDetectionController {
    
    @Autowired
    private PythonService pythonService;

    @PostMapping("/detect")
    public ResponseEntity<?> detectAnimal(@RequestParam("image") MultipartFile image) {
        try {
            Map<String, Object> result = pythonService.detectAnimal(image);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Detection failed: " + e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }
} 