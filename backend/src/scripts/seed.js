import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import { UserModel } from "../models/User.js";
import { CharityModel } from "../models/Charity.js";
import { ProductModel } from "../models/Product.js";

const charities = [
  {
    name: "World Golf Foundation",
    description: "Advancing golf participation and making golf more accessible to underserved communities worldwide.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    website: "https://worldgolffoundation.org",
    email: "info@worldgolffoundation.org",
    isFeatured: true,
    upcomingEvents: [
      { name: "Annual Golf Tournament", date: new Date("2026-05-15"), description: "Charity golf tournament" }
    ]
  },
  {
    name: "Drive, Chip & Putt Championship",
    description: "Golf development program supporting junior golfers and growing the game's future talent.",
    imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop",
    website: "https://pgatour.com/drivechipandputt",
    email: "support@dcp.org",
    isFeatured: true,
    upcomingEvents: [
      { name: "Regional Championships", date: new Date("2026-06-20"), description: "Junior golf championships" }
    ]
  },
  {
    name: "PGA Tour Charities",
    description: "Supporting numerous charitable causes through professional golf tournaments and player initiatives.",
    imageUrl: "https://images.unsplash.com/photo-1587174486073-ae5e5cff3cb0?w=400&h=300&fit=crop",
    website: "https://pgatour.com/charities",
    email: "charities@pgatour.com",
    isFeatured: true,
    upcomingEvents: []
  },
  {
    name: "Golf Channel Foundation",
    description: "Promoting youth development and bringing golf opportunities to underrepresented communities.",
    imageUrl: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=300&fit=crop",
    website: "https://golfchannel.com/foundation",
    email: "foundation@golfchannel.com",
    isFeatured: false,
    upcomingEvents: []
  },
  {
    name: "American Junior Golf Association",
    description: "Developing leaders through golf by providing opportunities for junior golfers worldwide.",
    imageUrl: "https://images.unsplash.com/photo-1596857212624-df2be98c5d02?w=400&h=300&fit=crop",
    website: "https://ajga.org",
    email: "info@ajga.org",
    isFeatured: false,
    upcomingEvents: []
  }
];

const products = [
  {
    name: "Full Stack Career Pack",
    slug: "full-stack-career-pack",
    description: "Structured path with roadmap, project templates, and interview drills.",
    priceCents: 2900,
    currency: "usd",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4"
  },
  {
    name: "React Mastery Bundle",
    slug: "react-mastery-bundle",
    description: "Production-grade React patterns, performance playbook, and reusable architecture.",
    priceCents: 4900,
    currency: "usd",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee"
  },
  {
    name: "System Design Sprint",
    slug: "system-design-sprint",
    description: "Hands-on system design scenarios with review templates and scoring rubrics.",
    priceCents: 5900,
    currency: "usd",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40"
  }
];

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await connectDatabase(process.env.MONGODB_URI);

  // Create Admin User
  const adminEmail = "admin@example.com";
  const adminPassword = "Admin@12345";

  const existingAdmin = await UserModel.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await UserModel.create({
      email: adminEmail,
      fullName: "Platform Admin",
      passwordHash,
      role: "ADMIN"
    });
    console.log("✓ Admin user created");
  }

  // Create Test User
  const userEmail = "user@example.com";
  const userPassword = "User@12345";

  const existingUser = await UserModel.findOne({ email: userEmail });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(userPassword, 12);
    await UserModel.create({
      email: userEmail,
      fullName: "John Golfer",
      passwordHash,
      role: "USER"
    });
    console.log("✓ Test user created");
  }

  // Seed Charities
  for (const charity of charities) {
    await CharityModel.findOneAndUpdate({ name: charity.name }, charity, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  console.log("✓ Charities seeded");

  // Seed Products (for backward compatibility)
  for (const product of products) {
    await ProductModel.findOneAndUpdate({ slug: product.slug }, product, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
  console.log("✓ Products seeded");

  console.log("\n✅ Seed complete!");
  console.log("\nTest Credentials:");
  console.log("Admin: admin@example.com / Admin@12345");
  console.log("User: user@example.com / User@12345");
  
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
