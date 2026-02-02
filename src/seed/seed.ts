import bcrypt from "bcryptjs";
import { ORDER_STATUS, STATUS, USERTYPE } from "../generated/prisma/enums";
import { Category, Medicine, Prisma, User } from "../generated/prisma/client";
import { prisma } from "../utils/db";

async function main() {
  console.log("🚀 Cleaning up database...");
  // await prisma.review.deleteMany();
  // await prisma.orderItem.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.cartItem.deleteMany();
  // await prisma.cart.deleteMany();
  // await prisma.medicine.deleteMany();
  // await prisma.category.deleteMany();
  // await prisma.user.deleteMany();

  console.log("🚀 Initializing deep seed...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Admin
  await prisma.user.upsert({
    where: { email: "admin@medicare.com" },
    update: {},
    create: {
      email: "admin@medicare.com",
      password: hashedPassword,
      name: "System Administrator",
      userType: USERTYPE.ADMIN,
    },
  });

  // 2. Create 10 Categories
  const categoryNames = [
    "Neurology",
    "Cardiology",
    "Dermatology",
    "Gastroenterology",
    "Pediatrics",
    "Respiratory",
    "Orthopedics",
    "Oncology",
    "General Medicine",
    "Vitamins & Supplements",
  ];

  const categories: Category[] = [];
  for (const name of categoryNames) {
    const cat = await prisma.category.create({
      data: {
        name,
        description: `Specialized medicine and equipment for ${name}`,
        status: STATUS.ACTIVE,
      },
    });
    categories.push(cat);
  }

  // 3. Create 5 Sellers
  const sellers: User[] = [];
  for (let i = 1; i <= 5; i++) {
    const seller = await prisma.user.create({
      data: {
        email: `seller${i}@pharmacy.com`,
        password: hashedPassword,
        name: `HealthPort Pharmacy ${i}`,
        userType: USERTYPE.SELLER,
      },
    });
    sellers.push(seller);
  }

  // 4. Create Medicines per Seller
  const medicineNames = [
    "Lipitor",
    "Nexium",
    "Plavix",
    "Advair",
    "Abilify",
    "Seroquel",
    "Singulair",
    "Crestor",
    "Actos",
    "Epogen",
    "Amoxicillin",
    "Ciprofloxacin",
    "Metformin",
    "Atorvastatin",
    "Lisinopril",
    "Levothyroxine",
    "Gabapentin",
    "Amlodipine",
    "Omeprazole",
    "Losartan",
    "Albuterol",
    "Metoprolol",
    "Pantoprazole",
    "Sertraline",
    "Valacyclovir",
  ];

  const allMedicines: Medicine[] = [];
  for (const seller of sellers) {
    const medicineCount = Math.floor(Math.random() * 6) + 10;
    for (let i = 0; i < medicineCount; i++) {
      const baseName =
        medicineNames[Math.floor(Math.random() * medicineNames.length)];
      // FIX: Added ! to ensure categories access is not undefined
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)]!;

      const med = await prisma.medicine.create({
        data: {
          name: `${baseName} ${Math.floor(Math.random() * 500) + 50}mg - ${seller.id.slice(0, 4)}`,
          description: `High quality generic formulation of ${baseName}. FDA approved laboratory tested.`,
          selling_price: Number((Math.random() * 50 + 5).toFixed(2)),
          purchase_price: Number((Math.random() * 5 + 2).toFixed(2)),
          available_quantity: Math.floor(Math.random() * 200) + 10,
          status: STATUS.ACTIVE,
          seller_id: seller.id,
          category_id: randomCategory.id,
        },
      });
      allMedicines.push(med);
    }
  }

  // 5. Create 10 Customers
  const customers: User[] = [];
  for (let i = 1; i <= 10; i++) {
    const customer = await prisma.user.create({
      data: {
        email: `customer${i}@gmail.com`,
        password: hashedPassword,
        name: `Customer Name ${i}`,
        userType: USERTYPE.CUSTOMER,
      },
    });
    customers.push(customer);
  }

  // 6. Create Carts and Orders
  const orderStatuses: ORDER_STATUS[] = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ];

  for (const customer of customers) {
    // Create Cart
    await prisma.cart.create({
      data: {
        customerId: customer.id,
        items: {
          create: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(
            () => ({
              // FIX: Added ! assertion
              medicineId:
                allMedicines[Math.floor(Math.random() * allMedicines.length)]!
                  .id,
              quantity: Math.floor(Math.random() * 5) + 1,
            }),
          ),
        },
      },
    });

    // Create 2-6 Orders
    const orderCount = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < orderCount; j++) {
      // Create specific OrderItem type
      const itemsToCreate: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] =
        Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map(() => {
          const med =
            allMedicines[Math.floor(Math.random() * allMedicines.length)]!;
          return {
            medicineId: med.id,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: med.selling_price,
            // FIX: Added ! assertion
            status:
              orderStatuses[Math.floor(Math.random() * orderStatuses.length)]!,
          };
        });

      const totalAmount = itemsToCreate.reduce(
        (acc, curr) => acc + curr.price * curr.quantity,
        0,
      );

      // FIX: Extract status to a variable with ! assertion to satisfy exactOptionalPropertyTypes
      const finalOrderStatus =
        orderStatuses[Math.floor(Math.random() * orderStatuses.length)]!;

      await prisma.order.create({
        data: {
          customerId: customer.id,
          totalAmount,
          shippingAddress: `${Math.floor(Math.random() * 999)} Medicine Street, Healthcare City`,
          status: finalOrderStatus,
          items: {
            create: itemsToCreate,
          },
        },
      });
    }
  }

  // 7. Reviews
  const reviewComments = [
    "Very effective medicine, felt better in 2 days.",
    "Fast delivery and genuine product.",
    "Good price compared to local pharmacies.",
    "Will order again, very reliable seller.",
  ];

  for (const medicine of allMedicines) {
    const reviewCount = Math.floor(Math.random() * 4) + 1;
    for (let k = 0; k < reviewCount; k++) {
      // FIX: Added ! assertion
      const randomCustomer =
        customers[Math.floor(Math.random() * customers.length)]!;

      await prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 2) + 4,
          comment:
            reviewComments[Math.floor(Math.random() * reviewComments.length)]!,
          userId: randomCustomer.id,
          medicineId: medicine.id,
          status: STATUS.ACTIVE,
        },
      });
    }
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
