package com.trustlens.backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer resultId;

    private Integer reviewId;
    private String sentiment;
    private String misleadingScore;
    private String trustScore;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private LocalDateTime analyzedAt = LocalDateTime.now();

    public Integer getResultId() {
        return resultId;
    }

    public Integer getReviewId() {
        return reviewId;
    }

    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public String getMisleadingScore() {
        return misleadingScore;
    }

    public void setMisleadingScore(String misleadingScore) {
        this.misleadingScore = misleadingScore;
    }

    public String getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(String trustScore) {
        this.trustScore = trustScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }
}