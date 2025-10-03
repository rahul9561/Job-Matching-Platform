/** @format */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";
import { resumeAPI } from "../../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const api = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"; // Django

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        return;
      }
      setFile(selectedFile);
      setMessage({ type: "", text: "" });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file" });
      return;
    }

    setUploading(true);
    setMessage({ type: "info", text: "Uploading resume..." });

    try {
      // Upload to Django backend (handles ML parsing in background)
      const formDataDjango = new FormData();
      formDataDjango.append("file", file);
      formDataDjango.append("original_filename", file.name);

      const resumeResponse = await resumeAPI.upload(formDataDjango);
      console.log("Upload API response:", resumeResponse);

      const resumeId = resumeResponse.data.id; // ✅ correct
      console.log("Uploaded resume ID:", resumeId);
      if (!resumeId) {
        throw new Error("Resume ID not found in response");
      }

      setMessage({
        type: "success",
        text: "Resume uploaded successfully! Parsing will happen shortly.",
      });

      // ✅ Call Django's custom action for matches
      const matchesRes = await fetch(
        `${api}/resumes/${resumeId}/find_matches/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json", // ✅ needed
          },
          body: JSON.stringify({ top_k: 10 }),
        }
      );

      // const matchesData = await matchesRes.json();
      // console.log("Found matches:", matchesData);

      let matchesData;
      try {
        matchesData = await matchesRes.json();
      } catch {
        const text = await matchesRes.text();
        console.error("Non-JSON response:", text);
        setMessage({ type: "error", text: "Server returned invalid response" });
        return;
      }

      navigate("/candidate/matches", { state: { matches: matchesData } });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Resume
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box
          sx={{
            border: "2px dashed #ccc",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            mb: 3,
          }}>
          <input
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            id="resume-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="resume-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              disabled={uploading}>
              Choose File
            </Button>
          </label>
          <Typography sx={{ mt: 2 }} color="textSecondary">
            Supported formats: PDF, DOC, DOCX (Max 5MB)
          </Typography>
        </Box>

        {file && (
          <List>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => setFile(null)}>
                  <Delete />
                </IconButton>
              }>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024).toFixed(2)} KB`}
              />
            </ListItem>
          </List>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || uploading}
            fullWidth>
            {uploading ? (
              <CircularProgress size={24} />
            ) : (
              "Upload & Find Matches"
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/candidate/dashboard")}
            disabled={uploading}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ResumeUpload;
