export const USER_TYPES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
};

export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
};

export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
};

export const MATCH_STATUS = {
  PENDING: 'pending',
  SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed',
  REJECTED: 'rejected',
};

export const FILE_TYPES = {
  RESUME: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  IMAGE: ['image/jpeg', 'image/png', 'image/jpg'],
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB