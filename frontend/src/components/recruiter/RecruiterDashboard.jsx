import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  WorkOutline as WorkOutlineIcon,
  PeopleOutline as PeopleOutlineIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { jobAPI, matchAPI } from '../../services/api';

function RecruiterDashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    candidates: 0,
    avgMatchScore: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchStats();
    fetchRecentJobs();
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

  const fetchRecentJobs = async () => {
    try {
      const res = await jobAPI.list({ limit: 5 });
      const jobs = res.data.results || res.data;
      setRecentJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
    }
  };

  const handleEditJob = (jobId) => {
    navigate(`/recruiter/edit-job/${jobId}`);
  };

  const statCards = [
    {
      icon: WorkOutlineIcon,
      title: 'Active Jobs',
      value: stats.jobs,
      color: theme.palette.primary.main,
    },
    {
      icon: PeopleOutlineIcon,
      title: 'Matched Candidates',
      value: stats.candidates,
      color: theme.palette.success.main,
    },
    {
      icon: TrendingUpIcon,
      title: 'Avg Match Score',
      value: `${stats.avgMatchScore}%`,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Welcome Back, Recruiter
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Overview of your recruitment activities
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <stat.icon sx={{ fontSize: 32, color: stat.color }} />
                </Box>
                <Typography variant="h2" component="div" color="text.primary" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" fontWeight="bold">
                    Recent Job Postings
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/recruiter/post-job')}
                >
                  Post New Job
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <Box key={job.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #eee' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip label={job.job_type.replace('-', ' ')} size="small" variant="outlined" />
                        <Chip label={job.location} size="small" variant="outlined" color="primary" />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/recruiter/job/${job.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditJob(job.id)}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography>No recent jobs posted yet.</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/recruiter/post-job')}
                    sx={{ mt: 2 }}
                  >
                    Post Your First Job
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate('/recruiter/candidates')}
                >
                  View All Candidates
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/recruiter/matches')}
                >
                  View Matches
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/recruiter/jobs')}
                >
                  Manage Jobs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default RecruiterDashboard;