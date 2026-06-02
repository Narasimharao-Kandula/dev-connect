import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

async function seed() {
  await prisma.groupMessage.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.collaborationRequest.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  const password = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "rahul@example.com",
        password,
        name: "Rahul Sharma",
        country: "India",
        timezone: "Asia/Kolkata",
        availability: "Available",
        emailVerified: true,
        onboardingCompleted: true,
        role: "Admin",
        collaborationScore: 0.92,
        projectSuccessCount: 5,
        responseRate: 0.95,
        profile: {
          create: {
            bio: "Flutter & Firebase developer. Looking to build AI-powered apps.",
            experience: 3,
            remoteOnly: false,
            openToCollab: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "john@example.com",
        password,
        name: "John Doe",
        country: "USA",
        timezone: "America/New_York",
        availability: "LookingForTeam",
        emailVerified: true,
        onboardingCompleted: true,
        collaborationScore: 0.78,
        projectSuccessCount: 8,
        responseRate: 0.82,
        profile: {
          create: {
            bio: "Backend developer specializing in Node.js and Python.",
            experience: 5,
            githubUrl: "https://github.com/johndoe",
            remoteOnly: true,
            openToCollab: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "priya@example.com",
        password,
        name: "Priya Patel",
        country: "India",
        timezone: "Asia/Kolkata",
        availability: "Available",
        emailVerified: true,
        onboardingCompleted: true,
        collaborationScore: 0.89,
        projectSuccessCount: 6,
        responseRate: 0.91,
        profile: {
          create: {
            bio: "AI/ML Engineer. NLP, Computer Vision, LLMs.",
            experience: 4,
            portfolio: "https://priyapatel.dev",
            remoteOnly: true,
            openToCollab: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "alex@example.com",
        password,
        name: "Alex Chen",
        country: "Canada",
        timezone: "America/Toronto",
        availability: "Available",
        emailVerified: true,
        onboardingCompleted: true,
        collaborationScore: 0.85,
        projectSuccessCount: 10,
        responseRate: 0.88,
        profile: {
          create: {
            bio: "Full-stack developer. React, Node, PostgreSQL.",
            experience: 6,
            githubUrl: "https://github.com/alexchen",
            remoteOnly: false,
            openToCollab: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah@example.com",
        password,
        name: "Sarah Johnson",
        country: "UK",
        timezone: "Europe/London",
        availability: "Busy",
        emailVerified: true,
        onboardingCompleted: true,
        collaborationScore: 0.95,
        projectSuccessCount: 12,
        responseRate: 0.97,
        profile: {
          create: {
            bio: "DevOps engineer. Docker, K8s, CI/CD pipelines.",
            experience: 7,
            remoteOnly: true,
            openToCollab: false,
          },
        },
      },
    }),
  ]);

  const skillNames = [
    "flutter", "firebase", "node.js", "python", "react",
    "postgresql", "docker", "kubernetes", "machine learning",
    "nlp", "computer vision", "typescript", "go", "rust",
    "graphql", "aws", "gcp", "redis", "mongodb", "next.js",
  ];

  const skills = await Promise.all(
    skillNames.map((name) =>
      prisma.skill.upsert({
        where: { name },
        create: { name },
        update: {},
      })
    )
  );

  const skillMap = new Map(skills.map((s) => [s.name, s.id]));

  await prisma.userSkill.createMany({
    data: [
      { userId: users[0].id, skillId: skillMap.get("flutter")! },
      { userId: users[0].id, skillId: skillMap.get("firebase")! },
      { userId: users[1].id, skillId: skillMap.get("node.js")! },
      { userId: users[1].id, skillId: skillMap.get("python")! },
      { userId: users[1].id, skillId: skillMap.get("postgresql")! },
      { userId: users[2].id, skillId: skillMap.get("machine learning")! },
      { userId: users[2].id, skillId: skillMap.get("nlp")! },
      { userId: users[2].id, skillId: skillMap.get("python")! },
      { userId: users[3].id, skillId: skillMap.get("react")! },
      { userId: users[3].id, skillId: skillMap.get("node.js")! },
      { userId: users[3].id, skillId: skillMap.get("typescript")! },
      { userId: users[3].id, skillId: skillMap.get("postgresql")! },
      { userId: users[4].id, skillId: skillMap.get("docker")! },
      { userId: users[4].id, skillId: skillMap.get("kubernetes")! },
      { userId: users[4].id, skillId: skillMap.get("aws")! },
    ],
  });

  const project = await prisma.project.create({
    data: {
      name: "AI Resume Builder",
      description: "An AI-powered resume builder that analyzes job descriptions and generates tailored resumes using NLP.",
      ownerId: users[0].id,
      skills: {
        create: [
          { skillId: skillMap.get("flutter")! },
          { skillId: skillMap.get("node.js")! },
          { skillId: skillMap.get("machine learning")! },
          { skillId: skillMap.get("nlp")! },
        ],
      },
    },
  });

  await prisma.collaborationRequest.create({
    data: {
      senderId: users[0].id,
      receiverId: users[2].id,
      message: "Hey Priya! I saw your AI/ML profile. Would love to collaborate on my AI Resume Builder project. Interested?",
    },
  });

  console.log("Seed data created successfully");
  console.log("Login credentials for all users: email / password123");
  console.log("Users:", users.map((u) => `${u.name} (${u.email})`).join(", "));
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
