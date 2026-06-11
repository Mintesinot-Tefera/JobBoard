import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: {
      email: 'recruiter@example.com',
      name: 'Jane Recruiter',
      passwordHash,
      headline: 'Senior Technical Recruiter',
      location: 'San Francisco, CA',
    },
  });

  const jobs = [
    {
      title: 'Senior Frontend Engineer',
      description:
        'We are looking for an experienced frontend engineer to lead our React-based platform development. You will work closely with design and backend teams to deliver high-quality user experiences. Strong TypeScript skills required.',
      category: 'ENGINEERING' as const,
      companyName: 'TechCorp',
      companyLogo: 'https://ui-avatars.com/api/?name=TC&background=2563eb&color=fff&size=96',
      location: 'San Francisco, CA',
      salaryMin: 150000,
      salaryMax: 200000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-07-11'),
      postedById: user.id,
    },
    {
      title: 'UX Designer',
      description:
        'Join our design team to create intuitive and beautiful user experiences. You will conduct user research, create wireframes and prototypes, and collaborate with engineering teams to ship polished products.',
      category: 'DESIGN' as const,
      companyName: 'DesignHub',
      companyLogo: 'https://ui-avatars.com/api/?name=DH&background=7c3aed&color=fff&size=96',
      location: 'New York, NY',
      salaryMin: 120000,
      salaryMax: 160000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-07-15'),
      postedById: user.id,
    },
    {
      title: 'Marketing Manager',
      description:
        'Lead our marketing strategy across digital channels. You will manage campaigns, analyze performance metrics, and grow our brand presence. Experience with B2B SaaS marketing is a plus.',
      category: 'MARKETING' as const,
      companyName: 'GrowthLabs',
      companyLogo: 'https://ui-avatars.com/api/?name=GL&background=059669&color=fff&size=96',
      location: 'Austin, TX',
      salaryMin: 100000,
      salaryMax: 140000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-07-20'),
      postedById: user.id,
    },
    {
      title: 'Sales Development Representative',
      description:
        'Drive business growth by identifying and qualifying potential customers. Work with our sales team to build pipeline and close deals. Great opportunity for someone who thrives in a fast-paced environment.',
      category: 'SALES' as const,
      companyName: 'SalesForce Pro',
      companyLogo: 'https://ui-avatars.com/api/?name=SP&background=dc2626&color=fff&size=96',
      location: 'Chicago, IL',
      salaryMin: 60000,
      salaryMax: 90000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-07-30'),
      postedById: user.id,
    },
    {
      title: 'Financial Analyst',
      description:
        'Analyze financial data and prepare reports to support business decision-making. Strong Excel and financial modeling skills required. CFA certification is a plus.',
      category: 'FINANCE' as const,
      companyName: 'FinanceFirst',
      companyLogo: 'https://ui-avatars.com/api/?name=FF&background=0891b2&color=fff&size=96',
      location: 'Boston, MA',
      salaryMin: 85000,
      salaryMax: 120000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-07-10'),
      postedById: user.id,
    },
    {
      title: 'HR Coordinator',
      description:
        'Support our human resources team with recruitment, onboarding, and employee relations. Great opportunity for someone starting their HR career who is organized and people-oriented.',
      category: 'HR' as const,
      companyName: 'PeopleFirst',
      companyLogo: 'https://ui-avatars.com/api/?name=PF&background=ea580c&color=fff&size=96',
      location: 'Denver, CO',
      salaryMin: 55000,
      salaryMax: 75000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-07-25'),
      postedById: user.id,
    },
    {
      title: 'Operations Manager',
      description:
        'Oversee daily operations and optimize processes for efficiency. Lead a team of coordinators and work cross-functionally with all departments to ensure smooth business execution.',
      category: 'OPERATIONS' as const,
      companyName: 'LogiTech Solutions',
      companyLogo: 'https://ui-avatars.com/api/?name=LS&background=4f46e5&color=fff&size=96',
      location: 'Seattle, WA',
      salaryMin: 110000,
      salaryMax: 150000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-08-15'),
      postedById: user.id,
    },
    {
      title: 'Product Manager',
      description:
        'Define product vision and roadmap for our SaaS platform. Work with engineering and design to deliver features that delight customers. 3+ years of product management experience required.',
      category: 'PRODUCT' as const,
      companyName: 'ProductLab',
      companyLogo: 'https://ui-avatars.com/api/?name=PL&background=be185d&color=fff&size=96',
      location: 'Remote',
      salaryMin: 130000,
      salaryMax: 180000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-07-30'),
      postedById: user.id,
    },
    {
      title: 'Data Scientist',
      description:
        'Apply machine learning and statistical analysis to solve business problems. Build predictive models and work with large-scale datasets. Python, SQL, and experience with ML frameworks required.',
      category: 'DATA' as const,
      companyName: 'DataDriven',
      companyLogo: 'https://ui-avatars.com/api/?name=DD&background=7c2d12&color=fff&size=96',
      location: 'San Francisco, CA',
      salaryMin: 140000,
      salaryMax: 190000,
      employmentType: 'FULL_TIME' as const,
      deadline: new Date('2026-08-10'),
      postedById: user.id,
    },
    {
      title: 'Backend Engineering Intern',
      description:
        'Gain hands-on experience building APIs and working with databases. Mentorship provided by senior engineers. Ideal for CS students entering their junior or senior year.',
      category: 'ENGINEERING' as const,
      companyName: 'TechCorp',
      companyLogo: 'https://ui-avatars.com/api/?name=TC&background=2563eb&color=fff&size=96',
      location: 'San Francisco, CA',
      salaryMin: 30000,
      salaryMax: 45000,
      employmentType: 'INTERNSHIP' as const,
      deadline: new Date('2026-07-15'),
      postedById: user.id,
    },
    {
      title: 'Part-Time Content Writer',
      description:
        'Create engaging blog posts, social media content, and marketing copy. Flexible schedule with 20 hours per week. Strong writing skills and familiarity with SEO best practices preferred.',
      category: 'MARKETING' as const,
      companyName: 'ContentCo',
      companyLogo: 'https://ui-avatars.com/api/?name=CC&background=65a30d&color=fff&size=96',
      location: 'Remote',
      salaryMin: 35000,
      salaryMax: 50000,
      employmentType: 'PART_TIME' as const,
      deadline: new Date('2026-07-01'),
      postedById: user.id,
    },
    {
      title: 'DevOps Contract Engineer',
      description:
        'Help us set up CI/CD pipelines and improve our cloud infrastructure on AWS. 6-month contract with possibility of extension. Terraform and Kubernetes experience required.',
      category: 'ENGINEERING' as const,
      companyName: 'CloudScale',
      companyLogo: 'https://ui-avatars.com/api/?name=CS&background=0ea5e9&color=fff&size=96',
      location: 'Portland, OR',
      salaryMin: 70,
      salaryMax: 120,
      employmentType: 'CONTRACT' as const,
      deadline: new Date('2026-07-20'),
      postedById: user.id,
    },
  ];

  await prisma.application.deleteMany();
  await prisma.job.deleteMany();

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }

  console.log(`Seeded ${jobs.length} jobs for user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
