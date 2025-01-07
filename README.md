- Authentication:

POST /auth/register: Register a new user.(x)

POST /auth/login: User login (returns JWT). (x)

GET /auth/me: Get current user's profile (protected route). (x)

PUT /auth/me: Update current user's profile (protected route). (x)

- Users (Admin Only):

GET /users: Get all users (admin only). (x)

GET /users/{userId}: Get a specific user by ID (admin only).

DELETE /users/{userId}: Delete a user (admin only). Consider soft delete instead of hard delete. (x)

- Equipment (Owners and Admin):

POST /equipment: Create new equipment (owner, admin). (x)

GET /equipment: Get all equipment (public, with filtering options). (x)

GET /equipment/{equipmentId}: Get specific equipment by ID (public). (x)

PUT /equipment/{equipmentId}: Update equipment (owner, admin). (x)

DELETE /equipment/{equipmentId}: Delete equipment (owner, admin). Consider soft delete. (x)

POST /equipment/{equipmentId}/photos: Upload photos for equipment (owner, admin). (x)

DELETE /equipment/{equipmentId}/photos/{photoId}: Delete a photo from equipment (owner, admin). (x)

GET /equipment/me: Get equipments owned by the current user (owner). (x)

- Rentals (Renters, Owners, and Admin):

POST /rentals: Create a new rental request (renter). (x)

GET /rentals: Get all rentals (admin only, with filtering options). (x)

GET /rentals/{rentalId}: Get a specific rental by ID (renter, owner, admin). (x)

PUT /rentals/{rentalId}: Update rental status (owner, admin). Only allow status updates to valid transitions (e.g., PENDING -> ACCEPTED).

DELETE /rentals/{rentalId}: Delete/Cancel a rental request (renter, owner, admin – conditions apply depending on role and rental status). Consider soft delete. (x)

@ GET /rentals/me: Get rentals related to the current user (renter or owner). Filter by role.

- Reviews (Renters, Owners, and Admin):

POST /reviews: Create a new review (renter, owner – only after rental is complete).

GET /reviews/{equipmentId}: Get reviews for a specific equipment (public).

GET /reviews/me: Get reviews given or received by the current user (renter, owner).

DELETE /reviews/{reviewId}: Delete a review (admin only). Consider soft delete.

- Messages (Renters and Owners):

POST /messages: Send a new message (renter, owner).

GET /messages/{rentalId}: Get messages for a specific rental (renter, owner).

GET /messages/me: Get messages sent and received by the current user (renter, owner).

- Availability (Owners and Admin):

GET /availability/{equipmentId}: Get availability for a specific equipment.

POST /availability/{equipmentId}: Create new availability slots for equipment (owner, admin).

PUT /availability/{availabilityId}: Update availability slot (owner, admin).

DELETE /availability/{availabilityId}: Delete availability slot (owner, admin).

- Authorization Notes:

Protected Routes: Routes prefixed with /auth/me, /equipment/me, /rentals/me, and /reviews/me require authentication (valid JWT).

Admin Routes: Routes like /users and deleting reviews require admin privileges.

Owner Routes: Routes related to managing equipment and updating rental status (approving/rejecting) require owner privileges.

Renter Routes: Routes for creating rental requests require renter privileges.
