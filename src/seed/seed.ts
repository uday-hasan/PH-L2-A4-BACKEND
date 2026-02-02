import { STATUS, USERTYPE } from "../generated/prisma/enums";
import { prisma } from "../utils/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🚀 Start heavy seeding...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Admin
  await prisma.user.upsert({
    where: { email: "admin@medicare.com" },
    update: {},
    create: {
      email: "admin@medicare.com",
      password: hashedPassword,
      name: "System Admin",
      userType: USERTYPE.ADMIN,
    },
  });

  // 2. Create 3 Sellers
  const sellersData = [
    { email: "seller1@medicare.com", name: "MediCare Central Pharmacy" },
    { email: "seller2@medicare.com", name: "HealthPlus Solutions" },
    { email: "seller3@medicare.com", name: "Wellness Pharma" },
  ];

  const sellers = [];
  for (const s of sellersData) {
    const seller = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: hashedPassword,
        name: s.name,
        userType: USERTYPE.SELLER,
      },
    });
    sellers.push(seller);
  }

  // 3. Create 10 Customers
  const customerNames = [
    "Alice Johnson",
    "Bob Smith",
    "Charlie Brown",
    "Diana Prince",
    "Ethan Hunt",
    "Fiona Gallagher",
    "George Miller",
    "Hannah Abbott",
    "Ian Wright",
    "Julia Roberts",
  ];
  const customers = [];
  for (const name of customerNames) {
    const email = `${name.toLowerCase().replace(" ", ".")}@example.com`;
    const customer = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        name,
        userType: USERTYPE.CUSTOMER,
      },
    });
    customers.push(customer);
  }

  // 4. Create 20 Categories
  const categoriesData = [
    "Pain Relief",
    "Vitamins",
    "Antibiotics",
    "Digestive Health",
    "Allergy",
    "Cold & Flu",
    "Baby Care",
    "Eye Care",
    "Herbal",
    "Medical Devices",
    "Cardiac",
    "Diabetic Care",
    "Orthopedic",
    "Skin Care",
    "Oral Care",
    "First Aid",
    "Men's Health",
    "Women's Health",
    "Mental Health",
    "Respiratory",
  ];

  const categoryMap: any = {};
  for (const catName of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        description: `Quality products for ${catName}`,
        status: STATUS.ACTIVE,
      },
    });
    categoryMap[catName] = cat;
  }

  // 5. Create 20+ Medicines
  const medicines = [
    { name: "Paracetamol 500mg", cat: "Pain Relief", price: 5.5, qty: 100 },
    { name: "Amoxicillin 250mg", cat: "Antibiotics", price: 12.99, qty: 50 },
    { name: "Vitamin C 1000mg", cat: "Vitamins", price: 8.0, qty: 200 },
    { name: "Omeprazole 20mg", cat: "Digestive Health", price: 15.0, qty: 15 }, // Low Stock
    { name: "Cetirizine 10mg", cat: "Allergy", price: 7.25, qty: 80 },
    { name: "Napa Extend", cat: "Pain Relief", price: 3.5, qty: 0 }, // Out of Stock
    { name: "Metformin 500mg", cat: "Diabetic Care", price: 10.0, qty: 120 },
    { name: "Atorvastatin 10mg", cat: "Cardiac", price: 25.5, qty: 45 },
    { name: "Salbutamol Inhaler", cat: "Respiratory", price: 18.0, qty: 30 },
    { name: "Amlodipine 5mg", cat: "Cardiac", price: 14.2, qty: 60 },
    { name: "Insulin Pen", cat: "Diabetic Care", price: 45.0, qty: 10 }, // Low Stock
    { name: "Gaviscon Liquid", cat: "Digestive Health", price: 9.5, qty: 40 },
    { name: "Loratadine 10mg", cat: "Allergy", price: 6.8, qty: 100 },
    { name: "Baby Diaper Rash Cream", cat: "Baby Care", price: 11.0, qty: 25 },
    { name: "Eye Drops Lubricant", cat: "Eye Care", price: 13.5, qty: 55 },
    { name: "Ashwagandha Extract", cat: "Herbal", price: 22.0, qty: 35 },
    {
      name: "Digital Thermometer",
      cat: "Medical Devices",
      price: 19.99,
      qty: 100,
    },
    { name: "Knee Brace", cat: "Orthopedic", price: 35.0, qty: 20 },
    { name: "Sunscreen SPF 50", cat: "Skin Care", price: 28.0, qty: 40 },
    { name: "Antiseptic Dettol", cat: "First Aid", price: 4.5, qty: 150 },
    { name: "Multivitamin Gold", cat: "Vitamins", price: 30.0, qty: 90 },
    { name: "Calcium + D3", cat: "Vitamins", price: 16.0, qty: 75 },
  ];

  const reviewComments = [
    "Excellent product, helped me a lot!",
    "Great quality, fast delivery.",
    "Decent, but the packaging could be better.",
    "Life saver! Highly recommended.",
    "Value for money.",
    "Will buy again.",
    "Not very effective for me, but okay.",
  ];

  for (const m of medicines) {
    const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];

    const med = await prisma.medicine.upsert({
      where: { name: m.name },
      update: {},
      create: {
        name: m.name,
        description: `This is a high-quality ${m.name} for ${m.cat}. Trusted by professionals.`,
        selling_price: m.price,
        purchase_price: m.price * 0.7,
        available_quantity: m.qty,
        status: STATUS.ACTIVE,
        seller_id: randomSeller?.id!,
        category_id: categoryMap[m.cat].id,
      },
    });

    // 6. Create Random Reviews (3-6 reviews per medicine)
    const numReviews = Math.floor(Math.random() * 4) + 3;
    const shuffledCustomers = [...customers].sort(() => 0.5 - Math.random());

    for (let i = 0; i < numReviews; i++) {
      await prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 2) + 4, // Mostly 4 and 5 stars for positive UI
          comment:
            reviewComments[Math.floor(Math.random() * reviewComments.length)] ||
            "",
          userId: shuffledCustomers[i]?.id!, // Linked to the renamed 'user' relation
          medicineId: med.id,
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 10000000000),
          ),
        },
      });
    }
  }

  console.log("✅ Seeding complete! Check your UI for variety.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
