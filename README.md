# KitSync: Peer-to-Peer Audiovisual Equipment Rental Platform

KitSync is a robust and scalable platform designed to connect owners of audiovisual equipment with individuals and businesses seeking to rent that equipment. Built with a modern technology stack (Node.js, Fastify, Prisma, PostgreSQL), KitSync provides a seamless and secure marketplace for renting cameras, lenses, lighting, audio gear, and other production equipment.

**Key Features:**

- **User Authentication and Authorization:** Secure user accounts with role-based access control (Admin, Owner, Renter) using JWT (JSON Web Tokens).
- **Comprehensive Equipment Management:** Easily list equipment with detailed descriptions, specifications, multiple photos, availability calendars, and flexible pricing options.
- **Powerful Search and Filtering:** Quickly find the perfect equipment based on keywords, categories, location, availability, price range, and other criteria.
- **Streamlined Rental Requests and Management:** Send and manage rental requests with transparent communication channels between renters and owners.
- **Secure Payments:** Integrated payment gateway (e.g., Stripe) for secure transactions and escrow functionality to protect both parties.
- **Trusted Reviews and Ratings:** Build trust and accountability through a transparent review and rating system.
- **Real-time Notifications:** Stay informed with instant notifications for rental requests, approvals, messages, and other important events.
- **Future Development:** Mobile app support, advanced search filters, community features, and AI-powered recommendations are planned.

**Technology Stack:**

- **Backend:** Node.js, Fastify, Prisma ORM, PostgreSQL
- **Authentication:** JWT (@fastify/jwt)
- **API Documentation:** Swagger (OpenAPI)

**Getting Started:**

1. Clone the repository: `git clone https://github.com/your-username/kitsync.git`
2. Install dependencies: `npm install`
3. Configure environment variables (see `.env.example`).
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

**License:**

This project is licensed under the [MIT License](LICENSE).
