export const PROJECT_STATUS = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
};

export const canTransitionProjectStatus = (fromStatus, toStatus) => {
  if (!fromStatus || !toStatus || fromStatus === toStatus) {
    return false;
  }

  const validStatuses = Object.values(PROJECT_STATUS);
  return validStatuses.includes(fromStatus) && validStatuses.includes(toStatus);
};
