import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Last updated: May 14, 2025
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Introduction
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to Formula 1 Chatter. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Data We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          When you use our service, we may collect the following types of information:
          <Box component="ul">
            <Box component="li">Basic account information: name, email, profile picture</Box>
            <Box component="li">Social login information: information provided by Facebook when you use their login service</Box>
            <Box component="li">Usage data: predictions, scores, and participation in games</Box>
          </Box>
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. How We Use Your Data
        </Typography>
        <Typography variant="body1" paragraph>
          We use your data to:
          <Box component="ul">
            <Box component="li">Provide and maintain our service</Box>
            <Box component="li">Track your participation and scores in prediction games</Box>
            <Box component="li">Improve our service</Box>
            <Box component="li">Communicate with you</Box>
          </Box>
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Data Sharing
        </Typography>
        <Typography variant="body1" paragraph>
          We don't sell your data to third parties. We may share basic profile information and game scores with other users in leaderboards and results pages.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          Depending on your location, you may have rights regarding your personal data, including:
          <Box component="ul">
            <Box component="li">Access to your data</Box>
            <Box component="li">Correction of your data</Box>
            <Box component="li">Deletion of your data</Box>
            <Box component="li">Restriction of processing</Box>
            <Box component="li">Data portability</Box>
          </Box>
        </Typography>
        
        <Typography variant="h6" gutterBottom id="data-deletion">
          6. Data Deletion Process
        </Typography>
        <Typography variant="body1" paragraph>
          You have the right to request deletion of your personal data. To request deletion of your account and associated data:
          <Box component="ol">
            <Box component="li">Send an email to <strong>datadeletion@f1chatter.com</strong> with the subject line "Data Deletion Request"</Box>
            <Box component="li">Include your full name and email address associated with your account</Box>
            <Box component="li">We will process your request within 30 days and send a confirmation email when completed</Box>
          </Box>
          For Facebook users: You can also revoke access to our application through your Facebook settings at any time.
        </Typography>
        <Typography variant="body1" paragraph>
          When you delete your account, we will:
          <Box component="ul">
            <Box component="li">Remove your personal information from our active databases</Box>
            <Box component="li">Anonymize your prediction history for statistical purposes only</Box>
            <Box component="li">Delete your profile picture and other identifiable information</Box>
          </Box>
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Contact
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy or need to exercise your rights regarding your data, please contact us at: support@f1chatter.com
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy; 