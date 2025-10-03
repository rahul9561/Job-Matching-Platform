/** @format */

import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Box,
  Button,
} from "@mui/material";
import { matchAPI } from "../../services/api";

function JobMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await matchAPI.list();
      setMatches(response.data.results || response.data);
      // console.log("this is data",response.data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Job Matches
      </Typography>

      {matches.length === 0 ? (
        <Typography>
          No matches found. Upload a resume to find matches!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item xs={12} md={6} key={match.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {match.job_details?.title || "Job Title"}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h3"
                      color={`${getScoreColor(match.match_score)}.main`}>
                      {match.match_score}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Match Score
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={match.match_score}
                    color={getScoreColor(match.match_score)}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />

                  <Typography variant="body2" gutterBottom>
                    <strong>Company:</strong>{" "}
                    {match.job_details?.recruiter_profile?.company_name ||
                      "N/A"}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    <strong>Location:</strong>{" "}
                    {match.job_details?.location || "N/A"}
                  </Typography>

                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Matching Skills:</strong>
                    </Typography>
                    {match.matching_skills?.split(",").map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill.trim()}
                        size="small"
                        color="success"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  {match.skill_gaps && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Skills to Improve:</strong>
                      </Typography>
                      {match.skill_gaps.split(",").map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill.trim()}
                          size="small"
                          color="warning"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}>
                    {match.recommendation}
                  </Typography>

                  <Chip
                    label={match.status?.toUpperCase()}
                    color={
                      match.status === "shortlisted" ? "success" : "default"
                    }
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default JobMatches;
