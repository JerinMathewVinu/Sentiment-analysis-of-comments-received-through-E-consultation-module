package com.trustlens.backend;

import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    public ReviewResponse analyzeReview(String review) {
        String text = review.toLowerCase();

        String sentiment = "Neutral";
        String fakeStatus = "Likely Genuine";
        String trustScore = "75%";
        String reason = "No major suspicious pattern detected.";

        // -------------------------
        // SENTIMENT DETECTION
        // -------------------------
        if (containsAny(text, "amazing", "excellent", "good", "worth", "love", "great", "awesome", "satisfied")) {
            sentiment = "Positive";
            trustScore = "90%";
        } else if (containsAny(text, "bad", "worst", "terrible", "poor", "hate", "disappointed", "useless")) {
            sentiment = "Negative";
            trustScore = "50%";
        }

        // -------------------------
        // IMPOSSIBLE / FALSE FACTUAL CLAIMS
        // -------------------------
        if (containsAny(text,
                "earth is square",
                "earth is in square shape",
                "earth is a square",
                "sun rises in the west",
                "humans can fly naturally",
                "moon is made of cheese",
                "2+2=5",
                "2 + 2 = 5",
                "water burns naturally",
                "humans do not need oxygen")) {
            fakeStatus = "Highly Suspicious";
            trustScore = "15%";
            reason = "Impossible or false factual claim detected.";
        }

        // -------------------------
        // MEDICAL / MIRACLE CLAIMS
        // -------------------------
        if (containsAny(text,
                "cures all diseases",
                "cures cancer instantly",
                "works instantly forever",
                "zero side effects guaranteed",
                "this product can cure everything",
                "100% medical guarantee",
                "miracle medicine",
                "one tablet cures all")) {
            fakeStatus = "Highly Suspicious";
            trustScore = "10%";
            reason = "Medical miracle or scientifically doubtful claim detected.";
        }

        // -------------------------
        // EXAGGERATED PROMOTIONAL CLAIMS
        // -------------------------
        if (containsAny(text,
                "100% best ever",
                "must buy immediately",
                "unbelievable",
                "life changing",
                "perfect in every way",
                "best product in the world",
                "buy now",
                "no flaws at all",
                "everyone should buy this",
                "miracle product")) {
            fakeStatus = "Highly Suspicious";
            trustScore = "25%";
            reason = "Exaggerated promotional language detected.";
        }

        // -------------------------
        // SPAM-LIKE PATTERNS
        // -------------------------
        if (text.contains("!!!") || text.contains("buy buy buy") || text.contains("guaranteed guaranteed")) {
            fakeStatus = "Suspicious";
            trustScore = "35%";
            reason = "Spam-like or repetitive promotional pattern detected.";
        }

        // -------------------------
        // EXPLICIT FAKE / SCAM WORDS
        // -------------------------
        if (containsAny(text, "fake", "scam", "misleading", "not true", "fraud")) {
            fakeStatus = "Suspicious";
            trustScore = "30%";
            reason = "Fraud-related or misleading wording detected.";
        }

        return new ReviewResponse(sentiment, fakeStatus, trustScore, reason);
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}