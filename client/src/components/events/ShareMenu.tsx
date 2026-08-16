import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { getShareLinks } from "../../services/event.service";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import {
  CheckIcon,
  CopyIcon,
  ExternalIcon,
  InfoIcon,
  ShareIcon,
} from "../ui/icons";

const PLATFORMS = [
  { key: "whatsapp", label: "WhatsApp" },
  { key: "facebook", label: "Facebook" },
  { key: "twitter", label: "Twitter / X" },
  { key: "linkedin", label: "LinkedIn" },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

interface ShareMenuProps {
  eventId: string;
  eventTitle: string;
}

export function ShareMenu({ eventId, eventTitle }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instagramState, setInstagramState] = useState<
    "idle" | "copied" | "error"
  >("idle");
  const { data, loading, error, refetch } = useApi(
    () => getShareLinks(eventId),
    [eventId],
  );

  const fallbackUrl = `${window.location.origin}/events/${eventId}`;
  const apiCopyLink = data?.shareLinks.copyLink;
  const copyLink =
    !apiCopyLink || apiCopyLink.startsWith("undefined")
      ? fallbackUrl
      : apiCopyLink;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable on non-secure origins.
    }
  };

  const handleInstagram = async () => {
    try {
      await navigator.clipboard.writeText(copyLink);
      setInstagramState("copied");
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      setTimeout(() => setInstagramState("idle"), 4000);
    } catch {
      setInstagramState("error");
      setTimeout(() => setInstagramState("idle"), 4000);
    }
  };

  const openModal = () => {
    setOpen(true);
    if (!data && !loading) {
      refetch();
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={openModal}>
        <ShareIcon size={16} /> Share
      </Button>

      <Modal open={open} title="Share this event" onClose={() => setOpen(false)}>
        <p>{eventTitle}</p>

        {loading ? (
          <div className="loading-block">
            <span className="spinner" aria-hidden="true" />
          </div>
        ) : null}

        {error ? <Alert variant="error">{error}</Alert> : null}

        {data ? (
          <div className="share-links">
            {PLATFORMS.map((platform) => (
              <a
                key={platform.key}
                className="share-link"
                href={data.shareLinks[platform.key as PlatformKey]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalIcon size={16} /> {platform.label}
              </a>
            ))}
            <button
              className="share-link"
              type="button"
              onClick={handleCopy}
              aria-live="polite"
            >
              {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              {copied ? "Copied!" : "Copy link"}
            </button>

            <button
              className="share-link"
              type="button"
              onClick={handleInstagram}
            >
              <ExternalIcon size={16} />
              {instagramState === "copied"
                ? "Link copied - paste in Instagram"
                : "Instagram"}
            </button>
          </div>
        ) : null}

        <p className="share-note">
          <InfoIcon size={14} /> Instagram has no direct web share URL, so the
          event link is copied to your clipboard for pasting into a story or
          post.
        </p>
      </Modal>
    </>
  );
}
