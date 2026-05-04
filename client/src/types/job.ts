export type JobCategory =
  | 'ENGINEERING'
  | 'DESIGN'
  | 'MARKETING'
  | 'SALES'
  | 'FINANCE'
  | 'HR'
  | 'OPERATIONS'
  | 'PRODUCT'
  | 'DATA'
  | 'OTHER';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP';

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  companyName: string;
  companyLogo: string | null;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  employmentType: EmploymentType;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  postedBy: {
    id: string;
    name: string;
  };
}
