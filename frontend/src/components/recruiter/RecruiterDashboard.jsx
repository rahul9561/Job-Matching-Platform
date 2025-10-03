import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jobAPI, matchAPI } from '../../services/api';
import { Work, People, TrendingUp } from '@mui/icons-material';

function RecruiterDashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    candidates: 0,
    avgMatchScore: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [jobsRes, matchesRes] = await Promise.all([
        jobAPI.list(),
        matchAPI.list(),
      ]);

      const jobs = jobsRes.data.results || jobsRes.data;
      const matches = matchesRes.data.results || matchesRes.data;

      const uniqueCandidates = new Set(matches.map(m => m.candidate));
      const avgScore = matches.length > 0
        ? matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length
        : 0;

      setStats({
        jobs: jobs.length,
        candidates: uniqueCandidates.size,
        avgMatchScore: avgScore.toFixed(1),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recruiter Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Work sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3">{stats.jobs}</Typography>
            <Typography color="textSecondary">Active Jobs</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <People sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h3">{stats.candidates}</Typography>
            <Typography color="textSecondary">Matched Candidates</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TrendingUp sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h3">{stats.avgMatchScore}%</Typography>
            <Typography color="textSecondary">Avg Match Score</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/recruiter/post-job')}
              >
                Post New Job
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/recruiter/candidates')}
              >
                View Candidates
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default RecruiterDashboard;