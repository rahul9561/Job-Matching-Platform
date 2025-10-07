// components/recruiter/EditJob.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Button,
  Grid,
  Alert,
  Chip,
  Slider,
  InputAdornment,
  FormHelperText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  BusinessCenter as BusinessCenterIcon,
  Description as DescriptionIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Code as CodeIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  MonetizationOnOutlined as MonetizationOnOutlinedIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { jobAPI } from '../../services/api';

function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills_required: '',
    experience_level: 'entry',
    job_type: 'full-time',
    location: '',
    salary_min: '',
    salary_max: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setJobLoading(true);
      const response = await jobAPI.get(jobId);
      const job = response.data;
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skills_required: job.skills_required,
        experience_level: job.experience_level,
        job_type: job.job_type,
        location: job.location,
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
      });
    } catch (err) {
      setError('Failed to load job details',err);
    } finally {
      setJobLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await jobAPI.update(jobId, formData);
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCharCount = (field, max) => `${formData[field].length}/${max}`;

  const salaryValue = formData.salary_min && formData.salary_max 
    ? [parseFloat(formData.salary_min), parseFloat(formData.salary_max)] 
    : [0, 0];

  const handleSalaryChange = (event, newValue) => {
    setFormData({ 
      ...formData, 
      salary_min: newValue[0] === 0 ? '' : newValue[0], 
      salary_max: newValue[1] === 0 ? '' : newValue[1] 
    });
  };

  if (jobLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <BusinessCenterIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Edit Job Posting
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update the details to refine your job listing
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Basic Info Section */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="medium">
                    Basic Information
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                  inputProps={{ maxLength: 200 }}
                  helperText={getCharCount('title', 200)}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Experience Level</InputLabel>
                  <Select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    label="Experience Level"
                  >
                    <MenuItem value="entry">Entry Level</MenuItem>
                    <MenuItem value="mid">Mid Level</MenuItem>
                    <MenuItem value="senior">Senior Level</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    label="Job Type"
                  >
                    <MenuItem value="full-time">Full Time</MenuItem>
                    <MenuItem value="part-time">Part Time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="internship">Internship</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Description Section */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="medium">
                    Description
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Job Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Skills Section */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="medium">
                    Skills Required
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Skills (comma-separated)"
                  name="skills_required"
                  value={formData.skills_required}
                  onChange={handleChange}
                  placeholder="e.g., Python, JavaScript, SQL"
                  required
                  sx={{ mb: 2 }}
                />
                <FormHelperText>Separate skills with commas for better organization</FormHelperText>
                {formData.skills_required && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.skills_required.split(',').map((skill, index) => (
                      <Chip key={index} label={skill.trim()} variant="outlined" color="primary" size="small" />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Location & Salary Section */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOnOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Location
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      label="Job Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      inputProps={{ maxLength: 100 }}
                      helperText={getCharCount('location', 100)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MonetizationOnOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Salary Range
                      </Typography>
                    </Box>
                    <Box sx={{ px: 2 }}>
                      <Slider
                        value={salaryValue}
                        onChange={handleSalaryChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={1000000}
                        step={1000}
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <TextField
                          label="Min Salary"
                          name="salary_min"
                          value={formData.salary_min}
                          onChange={handleChange}
                          type="number"
                          size="small"
                          sx={{ width: '45%' }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ArrowForwardIcon sx={{ mx: 1, color: 'text.secondary' }} />
                        </Box>
                        <TextField
                          label="Max Salary"
                          name="salary_max"
                          value={formData.salary_max}
                          onChange={handleChange}
                          type="number"
                          size="small"
                          sx={{ width: '45%' }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Box>
                      <FormHelperText>Optional - Annual salary in USD</FormHelperText>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/recruiter/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<SaveIcon />}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default EditJob;