"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AudioUploadZone } from "@/components/audio-upload-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/providers/tenant-theme-provider";
import { Show } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function NewEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;
  const { tenant } = useTenant();

  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShowId, setSelectedShowId] = useState<string>("");
  const [episodeTitle, setEpisodeTitle] = useState<string>("");
  const [publishedDate, setPublishedDate] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShows() {
      try {
        const response = await fetch(`/api/shows?tenant_id=${tenant.id}`);
        if (response.ok) {
          const data = await response.json();
          setShows(data);
          if (data.length > 0) {
            // Check if showId is provided in URL query params
            const searchParams = new URLSearchParams(window.location.search);
            const showIdParam = searchParams.get("showId");
            if (showIdParam && data.some((s: Show) => s.id === showIdParam)) {
              setSelectedShowId(showIdParam);
            } else {
              setSelectedShowId(data[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching shows:", error);
        setError("Failed to load shows");
      } finally {
        setLoading(false);
      }
    }

    if (tenant.id) {
      fetchShows();
    }
  }, [tenant.id]);

  const handleUploadSuccess = (url: string, extractedDuration: number) => {
    setAudioUrl(url);
    setDuration(extractedDuration);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShowId || !episodeTitle || !audioUrl || !duration) {
      setError("Please fill in all required fields and upload an audio file");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/shows/${selectedShowId}/episodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: episodeTitle,
          audio_url: audioUrl,
          duration_seconds: duration,
          published_at: publishedDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create episode");
      }

      const episode = await response.json();
      
      // Redirect to show detail page
      router.push(`/tenant/${tenantId}/shows/${selectedShowId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create episode. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">No shows available. Please create a show first.</p>
          <Button
            variant="ghost"
            onClick={() => router.push(`/tenant/${tenantId}`)}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.push(`/tenant/${tenantId}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shows
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Episode</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="show">Show *</Label>
                <select
                  id="show"
                  value={selectedShowId}
                  onChange={(e) => setSelectedShowId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {shows.map((show) => (
                    <option key={show.id} value={show.id}>
                      {show.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Episode Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={episodeTitle}
                  onChange={(e) => setEpisodeTitle(e.target.value)}
                  placeholder="Enter episode title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedDate">Published Date (Optional)</Label>
                <Input
                  id="publishedDate"
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Audio File *</Label>
                <AudioUploadZone
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(err) => setError(err)}
                />
                {audioUrl && duration && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Audio uploaded successfully. Duration: {Math.floor(duration / 60)}:
                    {String(duration % 60).padStart(2, "0")}
                  </p>
                )}
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || !selectedShowId || !episodeTitle || !audioUrl || !duration}
                className="w-full"
              >
                {submitting ? "Creating Episode..." : "Create Episode"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
