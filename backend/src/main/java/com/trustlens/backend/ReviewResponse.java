package com.trustlens.backend;

public class ReviewResponse {
    private String sentiment;
    private String fakeStatus;
    private String trustScore;
    private String reason;

    public ReviewResponse(String sentiment, String fakeStatus, String trustScore, String reason) {
        this.sentiment = sentiment;
        this.fakeStatus = fakeStatus;
        this.trustScore = trustScore;
        this.reason = reason;
    }

    public String getSentiment() {
        return sentiment;
    }

    public String getFakeStatus() {
        return fakeStatus;
    }

    public String getTrustScore() {
        return trustScore;
    }

    public String getReason() {
        return reason;
    }
}