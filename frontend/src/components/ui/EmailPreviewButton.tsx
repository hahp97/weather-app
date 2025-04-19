"use client";

import { Button } from "@/components/ui/button";
import { getApolloClient } from "@/libs/apollo/client";
import { gql } from "@apollo/client";
import { useEffect, useState } from "react";

interface EmailPreview {
  previewUrl: string;
  subject: string;
  timestamp: number;
}

interface EmailPreviewButtonProps {
  email: string;
  className?: string;
}

const GET_LATEST_EMAIL_PREVIEW = gql`
  query GetLatestEmailPreview($email: String!) {
    getLatestEmailPreview(email: $email) {
      previewUrl
      subject
      timestamp
    }
  }
`;

function EmailPreviewButton({ email, className }: EmailPreviewButtonProps) {
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Function to fetch the latest preview
  const fetchLatestPreview = async () => {
    if (!email) return;

    try {
      setLoading(true);
      const client = getApolloClient();
      const { data } = await client.query({
        query: GET_LATEST_EMAIL_PREVIEW,
        variables: { email },
        fetchPolicy: "network-only",
      });

      if (data?.getLatestEmailPreview) {
        setPreview(data.getLatestEmailPreview);
      }
    } catch (error) {
      console.error("Error fetching email preview:", error);
    } finally {
      setLoading(false);
    }
  };

  // Start polling when email changes
  useEffect(() => {
    if (!email) return;

    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Initial fetch
    fetchLatestPreview();

    // Set up polling every 3 seconds
    const interval = setInterval(fetchLatestPreview, 3000);
    setPollingInterval(interval);

    // Cleanup on unmount or when email changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [email]);

  // Open preview in new tab
  const openPreview = () => {
    if (preview?.previewUrl) {
      window.open(preview.previewUrl, "_blank");
    }
  };

  // If in production or no preview available, don't render anything
  if (process.env.NODE_ENV === "production" || !preview) {
    return null;
  }

  // Format relative time
  const getRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <Button
      onClick={openPreview}
      className={`bg-blue-500 hover:bg-blue-600 text-white ${className}`}
      disabled={loading}
    >
      {loading
        ? "Loading..."
        : `View Email: ${preview.subject} (${getRelativeTime(
            preview.timestamp
          )})`}
    </Button>
  );
}

export default EmailPreviewButton;
