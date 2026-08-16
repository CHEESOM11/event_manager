export const generateSocialShareLinks = (
  eventId: string,
  eventTitle: string,
  eventUrl: string,
) => {
  const encodedTitle = encodeURIComponent(eventTitle);
  const encodedUrl = encodeURIComponent(eventUrl);

  return {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,

    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,

    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,

    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,

    copyLink: eventUrl,
  };
};
