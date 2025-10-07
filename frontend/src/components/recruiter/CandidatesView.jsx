// components/recruiter/CandidatesView.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Mail as MailIcon,
} from '@mui/icons-material';
import { candidateAPI } from '../../services/api'; // Assuming API service similar to jobAPI

const CandidatesView = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);

  const getExperienceLabel = (level) => {
    const map = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior Level' };
    return map[level] || level;
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await candidateAPI.getAll(); // Adjust API call as needed
        setCandidates(response.data || []);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError(`Failed to fetch candidates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  useEffect(() => {
    const filtered = candidates.filter(
      (candidate) =>
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.skills && (
          Array.isArray(candidate.skills)
            ? candidate.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
            : candidate.skills.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );
    setFilteredCandidates(filtered);
  }, [searchTerm, candidates]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              Candidate Database
            </Typography>
          </Box>
          <TextField
            variant="outlined"
            placeholder="Search candidates by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', md: 300 } }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Experience Level</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                        {candidate.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MailIcon sx={{ mr: 1, color: 'action.active', fontSize: 16 }} />
                        {candidate.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {candidate.experience_level && (
                        <Chip 
                          label={getExperienceLabel(candidate.experience_level)} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={0.5}>
                        {candidate.skills && Array.isArray(candidate.skills) ? (
                          candidate.skills.map((skill, index) => (
                            <Grid item key={index}>
                              <Chip label={skill} size="small" variant="outlined" />
                            </Grid>
                          ))
                        ) : null}
                      </Grid>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ mr: 1, color: 'action.active', fontSize: 16 }} />
                        {candidate.location || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" color="primary">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'No candidates match your search.' : 'No candidates found. Encourage more uploads!'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CandidatesView;