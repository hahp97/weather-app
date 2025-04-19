"use client";

import { Button } from "@/components/ui/button";
import GetLatestEmailPreviewGql from "@/graphql/query/email/get-latest-email-preview.gql";
import { getApolloClient } from "@/libs/apollo/client";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

function EmailPreviewButton({ email, className }: EmailPreviewButtonProps) {
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchLatestPreview = async () => {
    if (!email) return;

    try {
      setLoading(true);
      const client = getApolloClient();
      const { data } = await client.query({
        query: GetLatestEmailPreviewGql,
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

  useEffect(() => {
    if (!email) return;

    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    fetchLatestPreview();

    const interval = setInterval(fetchLatestPreview, 3000);
    setPollingInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [email]);

  const openPreview = () => {
    if (preview?.previewUrl) {
      window.open(preview.previewUrl, "_blank");
    }
  };

  if (process.env.NODE_ENV === "production" || !preview) {
    return null;
  }

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
      {loading ? (
        <LoadingSpinner />
      ) : (
        `View Email: ${preview.subject} (${getRelativeTime(preview.timestamp)})`
      )}
    </Button>
  );
}

export default EmailPreviewButton;
