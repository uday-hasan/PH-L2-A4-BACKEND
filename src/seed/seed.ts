import { STATUS, USERTYPE } from "../generated/prisma/enums";
import { prisma } from "../utils/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Start seeding based on UI...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create a Seller (needed to own the medicines)
  const seller = await prisma.user.upsert({
    where: { email: "seller@medicare.com" },
    update: {},
    create: {
      email: "seller@medicare.com",
      password: hashedPassword,
      name: "MediCare Pharmacy",
      userType: USERTYPE.SELLER,
      address: {
        create: { address: "Main Pharmacy Plaza, Dhaka" },
      },
    },
  });

  // 2. Create Categories from UI
  const categoriesData = [
    {
      name: "Pain Relief",
      description: "Browse our wide range of pain relief products",
    },
    { name: "Vitamins", description: "Health supplements and multivitamins" },
    { name: "Antibiotics", description: "Medicines for bacterial infections" },
    {
      name: "Cold & Flu",
      description: "Remedies for common cold and flu symptoms",
    },
    {
      name: "Baby Care",
      description: "Healthcare products for infants and toddlers",
    },
    { name: "Eye Care", description: "Drops and treatments for eye health" },
    {
      name: "Herbal",
      description: "Natural and plant-based medicinal products",
    },
    {
      name: "Medical Devices",
      description: "Thermometers, BP monitors, and more",
    },
    {
      name: "Digestive Health",
      description: "Relief for stomach and digestion issues",
    },
    { name: "Allergy", description: "Anti-histamines and allergy relief" },
  ];

  const categories: any = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        status: STATUS.ACTIVE,
      },
    });
    categories[cat.name] = createdCat;
  }

  // 3. Create Medicines from UI
  const medicinesData = [
    {
      name: "Paracetamol 500mg",
      description: "Effective pain relief and fever reducer",
      category: "Pain Relief",
      selling_price: 5.99,
      purchase_price: 3.0,
      available_quantity: 150,
    },
    {
      name: "Vitamin C 1000mg",
      description: "Boost your immune system naturally",
      category: "Vitamins",
      selling_price: 12.99,
      purchase_price: 7.5,
      available_quantity: 200,
    },
    {
      name: "Amoxicillin 250mg",
      description: "Antibiotic for bacterial infections",
      category: "Antibiotics",
      selling_price: 8.99,
      purchase_price: 5.0,
      available_quantity: 80,
    },
    {
      name: "Omeprazole 20mg",
      description: "Relief from acid reflux and heartburn",
      category: "Digestive Health",
      selling_price: 15.99,
      purchase_price: 10.0,
      available_quantity: 120,
    },
    {
      name: "Ibuprofen 400mg",
      description: "Anti-inflammatory and pain reliever",
      category: "Pain Relief",
      selling_price: 7.49,
      purchase_price: 4.0,
      available_quantity: 180,
    },
    {
      name: "Cetirizine 10mg",
      description: "Allergy relief medication",
      category: "Allergy",
      selling_price: 6.99,
      purchase_price: 3.5,
      available_quantity: 160,
    },
  ];

  for (const med of medicinesData) {
    await prisma.medicine.upsert({
      where: { name: med.name },
      update: {},
      create: {
        name: med.name,
        description: med.description,
        selling_price: med.selling_price,
        purchase_price: med.purchase_price,
        available_quantity: med.available_quantity,
        status: STATUS.ACTIVE,
        seller_id: seller.id,
        category_id: categories[med.category].id,
      },
    });
  }

  console.log("Seeding complete! Categories and Medicines match the UI.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
