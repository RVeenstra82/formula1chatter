import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="card p-6 my-8">
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          Privacy Policy
        </h1>
        <p className="text-slate-300 mb-6">
          Last updated: May 14, 2025
        </p>

        <h2 className="text-xl font-bold text-white mb-3">
          1. Introduction
        </h2>
        <p className="text-slate-300 mb-6">
          Welcome to Formula 1 Chatter. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
        </p>

        <h2 className="text-xl font-bold text-white mb-3">
          2. Data We Collect
        </h2>
        <p className="text-slate-300 mb-2">
          When you use our service, we may collect the following types of information:
        </p>
        <ul className="list-disc pl-6 mb-6 text-slate-300 space-y-1">
          <li>Basic account information: name, email, profile picture</li>
          <li>Social login information: information provided by Facebook when you use their login service</li>
          <li>Usage data: predictions, scores, and participation in games</li>
        </ul>

        <h2 className="text-xl font-bold text-white mb-3">
          3. How We Use Your Data
        </h2>
        <p className="text-slate-300 mb-2">
          We use your data to:
        </p>
        <ul className="list-disc pl-6 mb-6 text-slate-300 space-y-1">
          <li>Provide and maintain our service</li>
          <li>Track your participation and scores in prediction games</li>
          <li>Improve our service</li>
          <li>Communicate with you</li>
        </ul>

        <h2 className="text-xl font-bold text-white mb-3">
          4. Data Sharing
        </h2>
        <p className="text-slate-300 mb-6">
          We don't sell your data to third parties. We may share basic profile information and game scores with other users in leaderboards and results pages.
        </p>

        <h2 className="text-xl font-bold text-white mb-3">
          5. Your Rights
        </h2>
        <p className="text-slate-300 mb-2">
          Depending on your location, you may have rights regarding your personal data, including:
        </p>
        <ul className="list-disc pl-6 mb-6 text-slate-300 space-y-1">
          <li>Access to your data</li>
          <li>Correction of your data</li>
          <li>Deletion of your data</li>
          <li>Restriction of processing</li>
          <li>Data portability</li>
        </ul>

        <h2 className="text-xl font-bold text-white mb-3" id="data-deletion">
          6. Data Deletion Process
        </h2>
        <p className="text-slate-300 mb-2">
          You have the right to request deletion of your personal data. To request deletion of your account and associated data:
        </p>
        <ol className="list-decimal pl-6 mb-4 text-slate-300 space-y-1">
          <li>Send an email to <strong>datadeletion@f1chatter.com</strong> with the subject line "Data Deletion Request"</li>
          <li>Include your full name and email address associated with your account</li>
          <li>We will process your request within 30 days and send a confirmation email when completed</li>
        </ol>
        <p className="text-slate-300 mb-4">
          For Facebook users: You can also revoke access to our application through your Facebook settings at any time.
        </p>
        <p className="text-slate-300 mb-2">
          When you delete your account, we will:
        </p>
        <ul className="list-disc pl-6 mb-6 text-slate-300 space-y-1">
          <li>Remove your personal information from our active databases</li>
          <li>Anonymize your prediction history for statistical purposes only</li>
          <li>Delete your profile picture and other identifiable information</li>
        </ul>

        <h2 className="text-xl font-bold text-white mb-3">
          7. Contact
        </h2>
        <p className="text-slate-300 mb-6">
          If you have any questions about this Privacy Policy or need to exercise your rights regarding your data, please contact us at: support@f1chatter.com
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
