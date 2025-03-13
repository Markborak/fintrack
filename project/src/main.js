// User data storage (in a real app, this would be a database)
let users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "$2a$10$XQxBZLpOFDmIjKw.cFMPT.Y.XQxBZLpOFDmIjKw.cFMPT.", // "admin123" hashed
    role: "admin",
  },
];

// Product data (in a real app, this would be a database)
let products = [
  {
    id: 1,
    name: "Pain Relief Medication",
    category: "Pain Relief",
    price: 12.99,
    stock: 45,
    image: "https://placehold.co/300x200?text=Pain+Relief",
  },
  {
    id: 2,
    name: "Multivitamins",
    category: "Vitamins",
    price: 24.99,
    stock: 32,
    image: "https://placehold.co/300x200?text=Vitamins",
  },
  {
    id: 3,
    name: "First Aid Kit",
    category: "First Aid",
    price: 34.99,
    stock: 18,
    image: "https://placehold.co/300x200?text=First+Aid",
  },
];

// Current user session
let currentUser = null;

// DOM Elements
const homeLink = document.getElementById("home-link");
const productsLink = document.getElementById("products-link");
const aboutLink = document.getElementById("about-link");
const contactLink = document.getElementById("contact-link");
const loginLink = document.getElementById("login-link");

const homePage = document.getElementById("home-page");
const loginPage = document.getElementById("login-page");
const adminPage = document.getElementById("admin-page");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

const userLoginForm = document.getElementById("user-login-form");
const userSignupForm = document.getElementById("user-signup-form");

const dashboardLink = document.getElementById("dashboard-link");
const productsAdminLink = document.getElementById("products-admin-link");
const ordersLink = document.getElementById("orders-link");
const usersLink = document.getElementById("users-link");
const logoutLink = document.getElementById("logout-link");

const dashboardContent = document.getElementById("dashboard-content");
const productsAdminContent = document.getElementById("products-admin-content");

// Navigation Functions
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  // Show the selected page
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  // Update navigation active state
  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach((link) => link.classList.remove("active"));

  if (pageId === "home-page") {
    homeLink.classList.add("active");
  } else if (pageId === "login-page") {
    loginLink.classList.add("active");
  }
}

// Authentication Functions
function hashPassword(password) {
  // In a real app, you would use bcrypt or similar
  // This is a simple simulation for demo purposes
  return "$2a$10$" + password.split("").reverse().join("") + password;
}

function validatePassword(password, hashedPassword) {
  // Simple simulation for demo purposes
  return hashedPassword.includes(password.split("").reverse().join(""));
}

function login(email, password) {
  const user = users.find((u) => u.email === email);

  if (user && validatePassword(password, user.password)) {
    currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Store in session
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Update UI based on user role
    updateUIForUser();

    return true;
  }

  return false;
}

function signup(name, email, password) {
  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return false;
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashPassword(password),
    role: "customer",
  };

  users.push(newUser);

  // Auto login after signup
  login(email, password);

  return true;
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem("currentUser");
  updateUIForUser();
  showPage("home-page");
}

function updateUIForUser() {
  if (currentUser) {
    loginLink.textContent = currentUser.name;

    if (currentUser.role === "admin") {
      loginLink.addEventListener("click", function (e) {
        e.preventDefault();
        showPage("admin-page");
      });
    } else {
      loginLink.addEventListener("click", function (e) {
        e.preventDefault();
        // Show user profile page (not implemented in this demo)
        alert("User profile would show here");
      });
    }
  } else {
    loginLink.textContent = "Login";
    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      showPage("login-page");
    });
  }
}

// Admin Functions
function showAdminSection(sectionId) {
  // Hide all admin sections
  const sections = document.querySelectorAll(".admin-section");
  sections.forEach((section) => section.classList.remove("active"));

  // Show the selected section
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  // Update sidebar active state
  const sidebarLinks = document.querySelectorAll(".sidebar ul li a");
  sidebarLinks.forEach((link) => link.classList.remove("active"));

  if (sectionId === "dashboard-content") {
    dashboardLink.classList.add("active");
  } else if (sectionId === "products-admin-content") {
    productsAdminLink.classList.add("active");
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Check for existing session
  const savedUser = sessionStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForUser();
  }

  // Navigation
  homeLink.addEventListener("click", function (e) {
    e.preventDefault();
    showPage("home-page");
  });

  loginLink.addEventListener("click", function (e) {
    e.preventDefault();
    showPage("login-page");
  });

  // Auth tabs
  loginTab.addEventListener("click", function () {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
  });

  signupTab.addEventListener("click", function () {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
  });

  // Login form
  userLoginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (login(email, password)) {
      if (currentUser.role === "admin") {
        showPage("admin-page");
      } else {
        showPage("home-page");
      }
    } else {
      alert("Invalid email or password");
    }
  });

  // Signup form
  userSignupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById(
      "signup-confirm-password"
    ).value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (signup(name, email, password)) {
      showPage("home-page");
    } else {
      alert("Email already in use");
    }
  });

  // Admin navigation
  dashboardLink.addEventListener("click", function (e) {
    e.preventDefault();
    showAdminSection("dashboard-content");
  });

  productsAdminLink.addEventListener("click", function (e) {
    e.preventDefault();
    showAdminSection("products-admin-content");
  });

  logoutLink.addEventListener("click", function (e) {
    e.preventDefault();
    logout();
  });

  // Shop now button
  const shopNowBtn = document.getElementById("shop-now-btn");
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", function () {
      // In a real app, this would navigate to the products page
      alert(
        "This would navigate to the products page in a complete implementation"
      );
    });
  }

  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // In a real app, this would add the product to the cart
      alert(
        "Product added to cart (this would be implemented in a complete e-commerce site)"
      );
    });
  });
});
