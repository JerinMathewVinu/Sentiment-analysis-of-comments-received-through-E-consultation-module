const API_BASE = "http://localhost:8080/api";

/* ---------------- HELPERS ---------------- */
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

function isAdminUser(email, password) {
  return email === "admin" && password === "admin123";
}

/* ---------------- REGISTER ---------------- */
async function registerUser(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

  if (!fullName || !email || !password || !confirmPassword) {
    alert("Please fill all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        email,
        password
      })
    });

    const result = await response.text();
    alert(result);

    if (response.ok || result.toLowerCase().includes("success")) {
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Register error:", error);
    alert("Registration failed. Check if backend is running.");
  }
}

/* ---------------- LOGIN ---------------- */
async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  // Admin hardcoded login
  if (isAdminUser(email, password)) {
    const adminUser = {
      userId: 0,
      fullName: "Administrator",
      email: "admin",
      role: "ADMIN"
    };

    localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
    window.location.href = "admin.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      alert("Invalid email or password.");
      return;
    }

    const user = await response.json();

    if (user && user.userId) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid login response from server.");
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Check if backend is running.");
  }
}

/* ---------------- USER ACCESS ---------------- */
function checkUserAccess() {
  const user = getLoggedInUser();

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (user.role === "ADMIN") {
    window.location.href = "admin.html";
  }
}

/* ---------------- ADMIN ACCESS ---------------- */
function checkAdminAccess() {
  const user = getLoggedInUser();

  if (!user || user.role !== "ADMIN") {
    alert("Access denied! Admin only.");
    window.location.href = "login.html";
  }
}

/* ---------------- DASHBOARD ---------------- */
async function loadDashboard() {
  const user = getLoggedInUser();

  if (!user) return;

  const welcomeUser = document.getElementById("welcomeUser");
  if (welcomeUser) {
    welcomeUser.innerText = `Welcome, ${user.fullName}`;
  }

  try {
    const response = await fetch(`${API_BASE}/admin/dashboard`);
    if (!response.ok) return;

    const data = await response.json();
    const reviews = data.reviews || [];
    const results = data.results || [];

    const userReviews = reviews.filter(r => r.userId === user.userId);
    const userResults = results.filter(r => {
      const relatedReview = reviews.find(rv => rv.reviewId === r.reviewId);
      return relatedReview && relatedReview.userId === user.userId;
    });

    const positiveCount = userResults.filter(r => (r.sentiment || "").toUpperCase() === "POSITIVE").length;
    const suspiciousCount = userResults.filter(r => Number(r.misleadingScore || 0) >= 50).length;

    const reviewCountEl = document.getElementById("reviewCount");
    const positiveCountEl = document.getElementById("positiveCount");
    const suspiciousCountEl = document.getElementById("suspiciousCount");

    if (reviewCountEl) reviewCountEl.innerText = userReviews.length;
    if (positiveCountEl) positiveCountEl.innerText = positiveCount;
    if (suspiciousCountEl) suspiciousCountEl.innerText = suspiciousCount;

  } catch (error) {
    console.error("Dashboard load error:", error);
  }
}

/* ---------------- ANALYZE REVIEW ---------------- */
async function analyzeReview() {
  const reviewText = document.getElementById("reviewText")?.value.trim();

  if (!reviewText) {
    alert("Please enter a review first.");
    return;
  }

  const user = getLoggedInUser();

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/reviews/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reviewText: reviewText,
        userId: user.userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Analyze failed:", errorText);
      alert("Review analysis failed.");
      return;
    }

    const result = await response.json();

    // Save result for result page
    localStorage.setItem("analysisResult", JSON.stringify(result));
    localStorage.setItem("reviewText", reviewText);

    // Redirect
    window.location.href = "result.html";

  } catch (error) {
    console.error("Analyze error:", error);
    alert("Review analysis failed. Check if Python ML and Spring Boot backend are running.");
  }
}

/* ---------------- RESULT PAGE ---------------- */
function loadResultPage() {
  const reviewText = localStorage.getItem("reviewText");
  const resultData = JSON.parse(localStorage.getItem("analysisResult"));

  const reviewDisplay = document.getElementById("reviewDisplay");
  const sentiment = document.getElementById("sentiment");
  const confidence = document.getElementById("confidence");
  const fakePrediction = document.getElementById("fakePrediction");
  const misleading = document.getElementById("misleading");
  const trust = document.getElementById("trust");
  const explanation = document.getElementById("explanation");

  if (!reviewText || !resultData) {
    if (reviewDisplay) reviewDisplay.innerText = "No review found.";
    if (sentiment) sentiment.innerText = "N/A";
    if (confidence) confidence.innerText = "N/A";
    if (fakePrediction) fakePrediction.innerText = "N/A";
    if (misleading) misleading.innerText = "N/A";
    if (trust) trust.innerText = "N/A";
    if (explanation) explanation.innerText = "No explanation available.";
    return;
  }

  if (reviewDisplay) reviewDisplay.innerText = reviewText;
  if (sentiment) sentiment.innerText = resultData.sentiment || "N/A";
  if (confidence) confidence.innerText = `${((resultData.sentimentConfidence || 0) * 100).toFixed(2)}%`;
  if (fakePrediction) fakePrediction.innerText = resultData.fakePrediction || "N/A";
  if (misleading) misleading.innerText = `${resultData.misleadingScore ?? 0}%`;
  if (trust) trust.innerText = `${resultData.trustScore ?? 0}%`;
  if (explanation) explanation.innerText = resultData.explanation || "No explanation available.";
}

/* ---------------- ADMIN DASHBOARD ---------------- */
async function loadAdminDashboard() {
  try {
    const response = await fetch(`${API_BASE}/admin/dashboard`);
    if (!response.ok) {
      alert("Failed to load admin dashboard.");
      return;
    }

    const data = await response.json();

    const users = data.users || [];
    const reviews = data.reviews || [];
    const results = data.results || [];

    const totalUsers = document.getElementById("totalUsers");
    const totalReviews = document.getElementById("totalReviews");
    const totalResults = document.getElementById("totalResults");

    if (totalUsers) totalUsers.innerText = users.length;
    if (totalReviews) totalReviews.innerText = reviews.length;
    if (totalResults) totalResults.innerText = results.length;

    // USERS TABLE
    const usersTable = document.getElementById("usersTable");
    if (usersTable) {
      usersTable.innerHTML = "";
      users.forEach(user => {
        usersTable.innerHTML += `
          <tr>
            <td>${user.userId}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
          </tr>
        `;
      });
    }

    // REVIEWS TABLE
    const reviewsTable = document.getElementById("reviewsTable");
    if (reviewsTable) {
      reviewsTable.innerHTML = "";
      reviews.forEach(review => {
        reviewsTable.innerHTML += `
          <tr>
            <td>${review.reviewId}</td>
            <td>${review.userId}</td>
            <td>${review.reviewText}</td>
          </tr>
        `;
      });
    }

    // RESULTS TABLE
    const resultsTable = document.getElementById("resultsTable");
    if (resultsTable) {
      resultsTable.innerHTML = "";
      results.forEach(result => {
        resultsTable.innerHTML += `
          <tr>
            <td>${result.resultId || "-"}</td>
            <td>${result.reviewId || "-"}</td>
            <td>${result.sentiment || "-"}</td>
            <td>${result.sentimentConfidence ? (result.sentimentConfidence * 100).toFixed(2) + "%" : "-"}</td>
            <td>${result.fakePrediction || "-"}</td>
            <td>${result.misleadingScore ?? 0}%</td>
            <td>${result.trustScore ?? 0}%</td>
            <td>${result.explanation || "-"}</td>
          </tr>
        `;
      });
    }

  } catch (error) {
    console.error("Admin dashboard error:", error);
    alert("Failed to load admin dashboard.");
  }
}

/* ---------------- LOGOUT ---------------- */
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("analysisResult");
  localStorage.removeItem("reviewText");
  alert("Logged out successfully.");
}



async function analyzeFakeNews() {
  const newsText = document.getElementById("fakeNewsText")?.value.trim();

  if (!newsText) {
    alert("Please enter news text first.");
    return;
  }

  const user = getLoggedInUser();

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/fakenews/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        newsText: newsText,
        userId: user.userId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fake news analyze failed:", errorText);
      alert("Fake news detection failed.");
      return;
    }

    const result = await response.json();

    localStorage.setItem("fakeNewsResult", JSON.stringify(result));
    localStorage.setItem("fakeNewsText", newsText);

    window.location.href = "fake-news-result.html";

  } catch (error) {
    console.error("Fake news error:", error);
    alert("Fake news detection failed. Check backend and ML engine.");
  }
}

function loadFakeNewsResultPage() {
  const newsText = localStorage.getItem("fakeNewsText");
  const resultData = JSON.parse(localStorage.getItem("fakeNewsResult"));

  const fakeNewsDisplay = document.getElementById("fakeNewsDisplay");
  const fakePredictionResult = document.getElementById("fakePredictionResult");
  const fakeConfidence = document.getElementById("fakeConfidence");
  const fakeMisleading = document.getElementById("fakeMisleading");
  const fakeTrust = document.getElementById("fakeTrust");
  const fakeExplanation = document.getElementById("fakeExplanation");

  if (!newsText || !resultData) {
    if (fakeNewsDisplay) fakeNewsDisplay.innerText = "No news found.";
    if (fakePredictionResult) fakePredictionResult.innerText = "N/A";
    if (fakeConfidence) fakeConfidence.innerText = "0%";
    if (fakeMisleading) fakeMisleading.innerText = "0%";
    if (fakeTrust) fakeTrust.innerText = "0%";
    if (fakeExplanation) fakeExplanation.innerText = "No explanation available.";
    return;
  }

  if (fakeNewsDisplay) fakeNewsDisplay.innerText = newsText;
  if (fakePredictionResult) fakePredictionResult.innerText = resultData.prediction || "N/A";
  if (fakeConfidence) fakeConfidence.innerText = `${((resultData.confidence || 0) * 100).toFixed(2)}%`;
  if (fakeMisleading) fakeMisleading.innerText = `${resultData.misleadingScore ?? 0}%`;
  if (fakeTrust) fakeTrust.innerText = `${resultData.trustScore ?? 0}%`;
  if (fakeExplanation) fakeExplanation.innerText = resultData.explanation || "No explanation available.";
}

// =========================
// ADMIN ACCESS CHECK
// =========================
function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "ADMIN") {
    alert("Access denied!");
    window.location.href = "login.html";
  }
}

// =========================
// LOAD ADMIN DATA
// =========================
async function loadAdminData() {
  loadUsers();
  loadSentimentData();
  loadFakeNewsData();
}

// =========================
// LOAD USERS
// =========================
async function loadUsers() {
  const table = document.getElementById("usersTable");

  try {
    const res = await fetch(`${API_BASE}/auth/users`);
    const users = await res.json();

    users.forEach(u => {
      const row = `
        <tr>
          <td>${u.userId}</td>
          <td>${u.fullName}</td>
          <td>${u.email}</td>
        </tr>`;
      table.innerHTML += row;
    });

  } catch (err) {
    console.error("Users load error:", err);
  }
}

// =========================
// LOAD SENTIMENT DATA
// =========================
async function loadSentimentData() {
  const table = document.getElementById("sentimentTable");

  try {
    const res = await fetch(`${API_BASE}/reviews`);
    const data = await res.json();

    data.forEach(r => {
      const row = `
        <tr>
          <td>${r.reviewText}</td>
          <td>${r.sentiment}</td>
          <td>${r.trustScore}%</td>
          <td>${r.misleadingScore}%</td>
        </tr>`;
      table.innerHTML += row;
    });

  } catch (err) {
    console.error("Sentiment load error:", err);
  }
}

// =========================
// LOAD FAKE NEWS DATA
// =========================
async function loadFakeNewsData() {
  const table = document.getElementById("fakeNewsTable");

  try {
    const res = await fetch(`${API_BASE}/fakenews`);
    const data = await res.json();

    data.forEach(r => {
      const row = `
        <tr>
          <td>${r.newsText}</td>
          <td>${r.prediction}</td>
          <td>${r.trustScore}%</td>
          <td>${r.misleadingScore}%</td>
        </tr>`;
      table.innerHTML += row;
    });

  } catch (err) {
    console.error("Fake news load error:", err);
  }
}