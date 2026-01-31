// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      companyName: 'Job Aggregator Inc.',
      website: 'https://example.com',
      tenantId: 'admin-tenant-001',
    },
  })
  console.log(`✅ Created admin user: ${admin.email}`)

  // 2. Create social platforms
  const platforms = [
    { type: 'TWITTER', name: 'Twitter/X', isActive: true },
    { type: 'FACEBOOK', name: 'Facebook', isActive: true },
    { type: 'TELEGRAM', name: 'Telegram', isActive: true },
    { type: 'WHATSAPP', name: 'WhatsApp', isActive: true },
    { type: 'TIKTOK', name: 'TikTok', isActive: true },
  ]

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { type: platform.type },
      update: platform,
      create: platform,
    })
  }
  console.log('✅ Created social platforms')

  // 3. Create default branding for admin
  await prisma.branding.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      watermarkPosition: 'bottom-right',
      watermarkOpacity: 0.7,
      imageStyle: 'modern',
      includeLogo: true,
      includeDomain: true,
    },
  })
  console.log('✅ Created default branding')

  // 4. Create subscription for admin
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      maxJobSources: 50,
      maxDailyPosts: 100,
      maxMonthlyScrapes: 10000,
      hasAIFeatures: true,
      hasBranding: true,
    },
  })
  console.log('✅ Created subscription')

  // 5. Create sample job source (Indeed)
  const indeedSource = await prisma.jobSource.upsert({
    where: { baseUrl: 'https://indeed.com' },
    update: {},
    create: {
      name: 'Indeed',
      baseUrl: 'https://indeed.com',
      isActive: true,
      scrapeConfig: {
        create: {
          jobListSelector: '.jobsearch-ResultsList',
          jobItemSelector: '.result',
          titleSelector: 'h2.jobTitle',
          companySelector: '.companyName',
          locationSelector: '.companyLocation',
          descriptionSelector: '.job-snippet',
          linkSelector: 'a.jcs-JobTitle',
          hasPagination: true,
          nextPageSelector: 'a[aria-label="Next"]',
          crawlDelay: 2000,
          maxPages: 10,
          respectRobotsTxt: true,
        },
      },
    },
  })
  console.log(`✅ Created job source: ${indeedSource.name}`)

  // 6. Create sample job for testing
  const sampleJob = await prisma.job.create({
    data: {
      slug: 'senior-software-engineer-123',
      originalTitle: 'Senior Software Engineer',
      originalDescription: 'We are looking for a senior software engineer...',
      originalCompany: 'Tech Corp Inc',
      originalLocation: 'Remote',
      originalUrl: 'https://indeed.com/job/senior-software-engineer-123',
      title: 'Senior Software Engineer',
      description: 'Join our team as a Senior Software Engineer...',
      company: 'Tech Corp Inc',
      location: 'Remote',
      salaryMin: 120000,
      salaryMax: 160000,
      salaryCurrency: 'USD',
      employmentType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      status: 'APPROVED',
      isRemote: true,
      tags: ['engineering', 'remote', 'senior'],
      jobSourceId: indeedSource.id,
      userId: admin.id,
    },
  })
  console.log(`✅ Created sample job: ${sampleJob.title}`)

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })