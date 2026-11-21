// Only the two owner-approved Amazon event hubs, with the existing website tag.
// Product/card/end links still require an exact matching ASIN URL.
export function isApprovedAmazonEventLink(raw) {
  return raw === 'https://www.amazon.com/blackfriday?tag=gamebeatonlin-20' ||
    raw === 'https://www.amazon.com/holidayshop?tag=gamebeatonlin-20';
}
