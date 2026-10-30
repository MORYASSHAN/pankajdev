// External links open in a new tab; mailto links stay in place.
export const ext = (href) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {});
