document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
   // Code animation in hero section
const codeEditor = document.getElementById('code-editor');
const codeAnimationContainer = document.getElementById('code-animation-container');

// Service code samples
const codeSamples = [
  {
    language: 'swift',
    title: '// Mobile Applications - iOS Swift Example',
    code: `import UIKit

class ProductViewController: UIViewController {
    
    private let productService = ProductService()
    private var products = [Product]()
    
    private lazy var collectionView: UICollectionView = {
        let layout = UICollectionViewFlowLayout()
        layout.scrollDirection = .vertical
        layout.minimumLineSpacing = 16
        let cv = UICollectionView(frame: .zero, collectionViewLayout: layout)
        cv.delegate = self
        cv.dataSource = self
        cv.register(ProductCell.self, forCellWithReuseIdentifier: "ProductCell")
        return cv
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        fetchProducts()
    }
    
    private func fetchProducts() {
        productService.fetchProducts { [weak self] result in
            switch result {
            case .success(let products):
                self?.products = products
                self?.collectionView.reloadData()
            case .failure(let error):
                self?.showError(error)
            }
        }
    }
}`
  },
  {
    language: 'javascript',
    title: '// Web Development - React Component',
    code: `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import './Dashboard.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Product Dashboard</h1>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;`
  },
  {
    language: 'java',
    title: '// Custom Software - Java Spring Boot API',
    code: `package com.sider.api.controller;

import com.sider.api.model.Product;
import com.sider.api.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.save(product);
        return ResponseEntity.ok(savedProduct);
    }
}`
  },
  {
    language: 'python',
    title: '// AI & Data Engineering - Machine Learning Model',
    code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load and prepare data
def prepare_data(filepath):
    df = pd.read_csv(filepath)
    # Feature engineering
    df['purchase_frequency'] = df['total_purchases'] / df['days_since_first_purchase']
    df['avg_order_value'] = df['total_spent'] / df['total_purchases']
    
    # Handle missing values
    df = df.fillna(df.median())
    
    return df

# Train customer churn prediction model
def train_churn_model(data):
    # Define features and target
    X = data.drop(['customer_id', 'churned'], axis=1)
    y = data['churned']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model Accuracy: {accuracy:.4f}")
    
    return model`
  }
];

// Animation variables
let currentSampleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 30; // milliseconds per character
let pauseBetweenSamples = 3000; // pause between code samples in milliseconds

// Create typing effect
function typeCode() {
  const currentSample = codeSamples[currentSampleIndex];
  const fullText = currentSample.title + '\n' + currentSample.code;
  
  // Add language class for syntax highlighting
  codeEditor.className = 'code-editor language-' + currentSample.language;
  
  if (!isDeleting && charIndex < fullText.length) {
    // Typing
    codeEditor.textContent = fullText.substring(0, charIndex + 1);
    charIndex++;
    setTimeout(typeCode, typingSpeed);
  } else if (isDeleting && charIndex > 0) {
    // Deleting
    codeEditor.textContent = fullText.substring(0, charIndex - 1);
    charIndex--;
    setTimeout(typeCode, typingSpeed / 2);
  } else if (charIndex === fullText.length && !isDeleting) {
    // End of typing, pause before deleting
    isDeleting = true;
    setTimeout(typeCode, pauseBetweenSamples);
  } else if (charIndex === 0 && isDeleting) {
    // End of deleting, move to next sample
    isDeleting = false;
    currentSampleIndex = (currentSampleIndex + 1) % codeSamples.length;
    setTimeout(typeCode, typingSpeed * 10);
  }
  
  // Scroll code editor to bottom to show latest typed code
  codeEditor.scrollTop = codeEditor.scrollHeight;
}

// Start typing animation
typeCode();

    // Service cards data
    const services = [
        {
            title: 'Mobile Applications',
            description: 'Native and cross-platform mobile apps that deliver exceptional user experiences across devices.',
            icon: 'fa-solid fa-mobile-screen'
        },
        {
            title: 'Web Development',
            description: 'Responsive, high-performance websites and web applications optimized for all devices.',
            icon: 'fa-solid fa-code'
        },
        {
            title: 'Custom Software',
            description: 'Bespoke software solutions tailored to your specific business requirements and challenges.',
            icon: 'fa-solid fa-laptop-code'
        },
        {
            title: 'Cloud Architecture',
            description: 'Scalable, secure cloud infrastructure designed for performance and reliability.',
            icon: 'fa-solid fa-cloud'
        },
        {
            title: 'AI & Data Engineering',
            description: 'Advanced data analytics and machine learning solutions to drive intelligent decision-making.',
            icon: 'fa-solid fa-robot'
        },
        {
            title: 'E-Commerce',
            description: 'End-to-end digital commerce platforms with seamless payment integration and user experience.',
            icon: 'fa-solid fa-shopping-cart'
        },
        {
            title: 'FinTech Solutions',
            description: 'Secure, compliant financial technology applications built for the digital economy.',
            icon: 'fa-solid fa-chart-line'
        },
        {
            title: 'Cybersecurity',
            description: 'Comprehensive security solutions to protect your digital assets and customer data.',
            icon: 'fa-solid fa-shield-halved'
        },
        {
            title: 'Blockchain',
            description: 'Secure, transparent blockchain solutions including smart contracts and decentralized applications for enhanced trust and immutability.',
            icon: 'fa-solid fa-shield-halved'
        }
    ];
    
    // Populate service cards
    const servicesGrid = document.querySelector('.services-grid');
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.classList.add('service-card');
        serviceCard.innerHTML = `
            <div class="icon"><i class="${service.icon}"></i></div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        `;
        servicesGrid.appendChild(serviceCard);
        
        // Add hover effect
        serviceCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        });
        
        serviceCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
        });
    });
    
    // Scroll animation for sections
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px"
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add animation classes and observe sections
    document.querySelectorAll('.section-header, .service-card, .feature-card, .contact-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Add CSS for scroll animations
    const scrollStyle = document.createElement('style');
    scrollStyle.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in.in-view {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(scrollStyle);
    
    // Form submission
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Here you would typically send the data to your server
        // For demonstration, we'll just show an alert
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
});
