package com.trustlens.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AnalysisResultRepository analysisResultRepository;

    @PostMapping("/analyze")
    public AnalysisResult analyzeReview(@RequestBody Review review) {
        reviewRepository.save(review);

        String text = review.getReviewText().toLowerCase();

        AnalysisResult result = new AnalysisResult();
        result.setReviewId(review.getReviewId());

        if (text.contains("good") || text.contains("excellent") || text.contains("amazing") || text.contains("best")) {
            result.setSentiment("Positive");
            result.setMisleadingScore("15%");
            result.setTrustScore("85%");
            result.setExplanation("This review appears mostly genuine and positive.");
        } else if (text.contains("bad") || text.contains("worst") || text.contains("terrible")) {
            result.setSentiment("Negative");
            result.setMisleadingScore("30%");
            result.setTrustScore("70%");
            result.setExplanation("This review expresses negative sentiment and may need verification.");
        } else if (text.contains("earth is square") || text.contains("moon is fake") || text.contains("aliens made this")) {
            result.setSentiment("Suspicious / Misleading");
            result.setMisleadingScore("95%");
            result.setTrustScore("10%");
            result.setExplanation("This review contains suspicious or misleading statements and appears unreliable.");
        } else {
            result.setSentiment("Neutral");
            result.setMisleadingScore("40%");
            result.setTrustScore("60%");
            result.setExplanation("This review seems somewhat balanced but may contain unclear intent.");
        }

        analysisResultRepository.save(result);
        return result;
    }
}