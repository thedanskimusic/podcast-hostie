"use client";

import { Show } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ShowCardProps {
  show: Show;
}

export function ShowCard({ show }: ShowCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/shows/${show.id}`);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {show.cover_image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={show.cover_image}
            alt={show.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">{show.title}</CardTitle>
        {show.author && (
          <CardDescription>by {show.author}</CardDescription>
        )}
      </CardHeader>
      {show.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {show.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
