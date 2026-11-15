export const getTabHref = (id: string): string =>
  id.startsWith("/") ? id : `/${id}`;

export const isTabActive = (pathname: string, id: string): boolean => {
  const href = id === "Other" ? "/settings" : getTabHref(id);
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
};
