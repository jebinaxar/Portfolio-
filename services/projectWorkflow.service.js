export const PROJECT_STATUS = {
  DRAFT: "DRAFT",
  REVIEW: "REVIEW",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
};

export const canTransitionProjectStatus = (fromStatus, toStatus) => {
  if (fromStatus === PROJECT_STATUS.DRAFT && toStatus === PROJECT_STATUS.REVIEW) {
    return true;
  }
  if (fromStatus === PROJECT_STATUS.REVIEW && toStatus === PROJECT_STATUS.PUBLISHED) {
    return true;
  }
  if (fromStatus === PROJECT_STATUS.PUBLISHED && toStatus === PROJECT_STATUS.ARCHIVED) {
    return true;
  }
  if (fromStatus === PROJECT_STATUS.ARCHIVED && toStatus === PROJECT_STATUS.DRAFT) {
    return true;
  }
  return false;
};
