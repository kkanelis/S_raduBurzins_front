import { useEffect, useState } from "react";
import api from "../services/api";

function PrivateVideo({ src, className = "" }) {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";

    if (!src) return () => controller.abort();

    api.get(src, { responseType: "blob", signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(data);
        setVideoUrl(objectUrl);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return videoUrl ? (
    <video src={videoUrl} controls className={className} />
  ) : (
    <div className={`flex min-h-28 items-center justify-center rounded-2xl bg-warm-beige/30 text-xs font-semibold text-muted ${className}`}>
      Ielādējas video...
    </div>
  );
}

export default PrivateVideo;
