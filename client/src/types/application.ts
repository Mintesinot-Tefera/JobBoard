export type ApplicationStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    companyName: string;
    companyLogo: string | null;
    location: string;
    employmentType: string;
    deadline: string;
  };
}
