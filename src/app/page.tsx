import { Navbar } from "@/components/navbar";
import { ShowsGrid } from "@/components/shows-grid";
import { AudioPlayer } from "@/components/audio-player";

export default function Home() {
  return (
    <div className="min-h-screen pb-24">
      <Navbar />
      <main>
        <ShowsGrid />
      </main>
      <AudioPlayer />
    </div>
  );
}
