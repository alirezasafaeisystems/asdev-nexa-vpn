import { db } from './src/lib/db';
import { hashPassword } from './src/lib/auth';

async function main() {
  console.log('🌱 Seeding NexaVPN database...');

  // ========================================
  // Create VPN Plans
  // ========================================
  const plans = await Promise.all([
    // Trial Plan
    db.plan.upsert({
      where: { id: 'plan_trial' },
      update: {},
      create: {
        id: 'plan_trial',
        name: 'Trial',
        nameFa: 'رایگان آزمایشی',
        description: 'Try NexaVPN for free',
        descriptionFa: 'نکساوی‌پی‌ان را رایگان امتحان کنید',
        priceUsd: 0,
        priceToman: 0,
        durationDays: 3,
        durationLabel: '۳ روز',
        trafficGB: 5,
        maxDevices: 1,
        features: JSON.stringify(['۵ گیگ ترافیک', '۱ دستگاه', 'پشتیبانی تلگرام']),
        featuresFa: JSON.stringify(['۵ گیگ ترافیک', '۱ دستگاه', 'پشتیبانی تلگرام']),
        isActive: true,
        isTrial: true,
        sortOrder: 0,
      },
    }),

    // Basic Plan
    db.plan.upsert({
      where: { id: 'plan_basic' },
      update: {},
      create: {
        id: 'plan_basic',
        name: 'Basic',
        nameFa: 'پایه',
        description: 'Perfect for personal use',
        descriptionFa: 'مناسب برای استفاده شخصی',
        priceUsd: 4.99,
        priceToman: 250000,
        durationDays: 30,
        durationLabel: '۱ ماهه',
        trafficGB: 30,
        maxDevices: 2,
        features: JSON.stringify([
          '۳۰ گیگ ترافیک',
          '۲ دستگاه همزمان',
          'سرورهای اروپا',
          'پشتیبانی تلگرام',
          'ترافیک نامحدود شبانه',
        ]),
        featuresFa: JSON.stringify([
          '۳۰ گیگ ترافیک',
          '۲ دستگاه همزمان',
          'سرورهای اروپا',
          'پشتیبانی تلگرام',
          'ترافیک نامحدود شبانه',
        ]),
        isActive: true,
        isTrial: false,
        sortOrder: 1,
      },
    }),

    // Pro Plan
    db.plan.upsert({
      where: { id: 'plan_pro' },
      update: {},
      create: {
        id: 'plan_pro',
        name: 'Pro',
        nameFa: 'حرفه‌ای',
        description: 'For power users',
        descriptionFa: 'برای کاربران حرفه‌ای',
        priceUsd: 9.99,
        priceToman: 500000,
        durationDays: 30,
        durationLabel: '۱ ماهه',
        trafficGB: 100,
        maxDevices: 5,
        features: JSON.stringify([
          '۱۰۰ گیگ ترافیک',
          '۵ دستگاه همزمان',
          'همه سرورها',
          'پشتیبانی اولویت‌دار',
          'ترافیک نامحدود شبانه',
          'IP اختصاصی',
        ]),
        featuresFa: JSON.stringify([
          '۱۰۰ گیگ ترافیک',
          '۵ دستگاه همزمان',
          'همه سرورها',
          'پشتیبانی اولویت‌دار',
          'ترافیک نامحدود شبانه',
          'IP اختصاصی',
        ]),
        isActive: true,
        isTrial: false,
        sortOrder: 2,
      },
    }),

    // Premium Plan
    db.plan.upsert({
      where: { id: 'plan_premium' },
      update: {},
      create: {
        id: 'plan_premium',
        name: 'Premium',
        nameFa: 'ویژه',
        description: 'Unlimited everything',
        descriptionFa: 'بدون محدودیت',
        priceUsd: 19.99,
        priceToman: 1000000,
        durationDays: 30,
        durationLabel: '۱ ماهه',
        trafficGB: null, // Unlimited
        maxDevices: 10,
        features: JSON.stringify([
          'ترافیک نامحدود',
          '۱۰ دستگاه همزمان',
          'همه سرورها',
          'پشتیبانی VIP',
          'IP اختصاصی',
          'پورت اختصاصی',
          'اتصال پایدار',
        ]),
        featuresFa: JSON.stringify([
          'ترافیک نامحدود',
          '۱۰ دستگاه همزمان',
          'همه سرورها',
          'پشتیبانی VIP',
          'IP اختصاصی',
          'پورت اختصاصی',
          'اتصال پایدار',
        ]),
        isActive: true,
        isTrial: false,
        sortOrder: 3,
      },
    }),
  ]);

  console.log(`✅ Created ${plans.length} plans`);

  // ========================================
  // Create VPN Servers (placeholder)
  // ========================================
  const servers = await Promise.all([
    db.vPNServer.upsert({
      where: { id: 'server_de_1' },
      update: {},
      create: {
        id: 'server_de_1',
        name: 'Germany-1',
        location: 'آلمان',
        countryCode: 'DE',
        domain: 'de1.nexavpn.com',
        port: 443,
        status: 'ONLINE',
        isActive: true,
        maxUsers: 500,
        currentUsers: 0,
        loadPercent: 15,
      },
    }),
    db.vPNServer.upsert({
      where: { id: 'server_nl_1' },
      update: {},
      create: {
        id: 'server_nl_1',
        name: 'Netherlands-1',
        location: 'هلند',
        countryCode: 'NL',
        domain: 'nl1.nexavpn.com',
        port: 443,
        status: 'ONLINE',
        isActive: true,
        maxUsers: 500,
        currentUsers: 0,
        loadPercent: 20,
      },
    }),
    db.vPNServer.upsert({
      where: { id: 'server_fi_1' },
      update: {},
      create: {
        id: 'server_fi_1',
        name: 'Finland-1',
        location: 'فنلاند',
        countryCode: 'FI',
        domain: 'fi1.nexavpn.com',
        port: 443,
        status: 'ONLINE',
        isActive: true,
        maxUsers: 300,
        currentUsers: 0,
        loadPercent: 10,
      },
    }),
  ]);

  console.log(`✅ Created ${servers.length} VPN servers`);

  // ========================================
  // Create Admin User
  // ========================================
  const adminPassword = await hashPassword('admin123');
  const admin = await db.user.upsert({
    where: { email: 'admin@nexavpn.com' },
    update: {},
    create: {
      email: 'admin@nexavpn.com',
      passwordHash: adminPassword,
      displayName: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Created admin: ${admin.email}`);

  // ========================================
  // Create Test User
  // ========================================
  const userPassword = await hashPassword('user123');
  const user = await db.user.upsert({
    where: { email: 'user@nexavpn.com' },
    update: {},
    create: {
      email: 'user@nexavpn.com',
      passwordHash: userPassword,
      displayName: 'Test User',
      role: 'USER',
    },
  });

  console.log(`✅ Created test user: ${user.email}`);

  // ========================================
  // Create System Settings
  // ========================================
  await db.setting.upsert({
    where: { key: 'site_name' },
    update: { value: 'NexaVPN' },
    create: { key: 'site_name', value: 'NexaVPN' },
  });

  await db.setting.upsert({
    where: { key: 'site_tagline' },
    update: { value: 'نسل بعدی امنیت دیجیتال' },
    create: { key: 'site_tagline', value: 'نسل بعدی امنیت دیجیتال' },
  });

  console.log('✅ Created system settings');
  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin: admin@nexavpn.com / admin123');
  console.log('   User:  user@nexavpn.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
