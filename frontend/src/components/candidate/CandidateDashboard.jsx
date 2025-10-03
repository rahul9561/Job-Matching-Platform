import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { resumeAPI, matchAPI } from '../../services/api';
import { Upload, Work, TrendingUp } from '@mui/icons-material';

function CandidateDashboard() {
  const [stats, setStats] = useState({
    resumes: 0,
    matches: 0,
    topMatch: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [resumesRes, matchesRes] = await Promise.all([
        resumeAPI.list(),
        matchAPI.list(),
      ]);

      const matches = matchesRes.data.results || matchesRes.data;
      const topMatch = matches.length > 0 ? matches[0] : null;

      setStats({
        resumes: resumesRes.data.length,
        matches: matches.length,
        topMatch,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Candidate Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3">{stats.resumes}</Typography>
            <Typography color="textSecondary">Resumes Uploaded</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Work sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h3">{stats.matches}</Typography>
            <Typography color="textSecondary">Job Matches</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TrendingUp sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h3">
              {stats.topMatch ? `${stats.topMatch.match_score || 0}%` : 'N/A'}
            </Typography>
            <Typography color="textSecondary">Top Match Score</Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/candidate/upload-resume')}
              >
                Upload Resume
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/candidate/matches')}
              >
                View Matches
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Top Match */}
        {stats.topMatch && stats.topMatch.job_details && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Top Match
              </Typography>
              <Typography variant="h5" color="primary">
                {stats.topMatch.job_details.title}
              </Typography>
              <Typography variant="h4" color="success.main" sx={{ mt: 1 }}>
                {stats.topMatch.match_score || 0}% Match
              </Typography>
              <Typography sx={{ mt: 2 }}>
                <strong>Matching Skills:</strong> {stats.topMatch.matching_skills || 'N/A'}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Recommendation:</strong> {stats.topMatch.recommendation || 'N/A'}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/candidate/matches')}
              >
                View All Matches
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default CandidateDashboard;
