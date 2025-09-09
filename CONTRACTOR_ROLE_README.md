# Contractor Role Implementation

This document describes the implementation of the contractor role system in the Mech Craft Hub application.

## Overview

The system now supports two main user roles:
1. **Customer** - Users who order services
2. **Contractor** - Users who provide services and bid on orders

## Features Implemented

### 1. Role-Based Authentication
- Updated user model to support roles
- Role-based routing and access control
- Automatic role assignment for new users

### 2. Contractor Dashboard
The contractor dashboard includes the following sections:

#### Account Section
- Welcome message with user name
- Link to profile editing
- Rating display (0-5 stars) with link to reviews

#### Performance Section
- Total proposals count
- Accepted proposals count
- Active projects count

#### Main Tabs
1. **Orders Tab** - Shows orders available for bidding
2. **My Proposals Tab** - Shows contractor's submitted proposals with status
3. **Active Projects Tab** - Shows projects where contractor's proposal was accepted
4. **Workshops Tab** - Workshop management (for manufacturing contractors)
5. **Notifications Tab** - System notifications

### 3. Proposal System
- Contractors can view available orders
- Submit proposals with pricing and delivery time
- Track proposal status (pending, accepted, rejected)
- Real-time notifications for proposal updates

### 4. Active Projects Management
- View active projects with deadlines
- Calculate remaining days until deadline
- Communication links with customers
- Project status tracking

### 5. Workshop Management
- Register and manage workshops
- Workshop information (name, address, description)
- Status tracking

## API Endpoints

### Contractor-Specific Endpoints
- `GET /api/v1/contractor/orders/` - Get orders available for bidding
- `GET /api/v1/contractor/proposals/` - Get contractor's proposals
- `GET /api/v1/contractor/active-projects/` - Get active projects
- `GET /api/v1/contractor/stats/` - Get contractor statistics
- `POST /api/v1/contractor/proposals/create/` - Create new proposal
- `GET /api/v1/contractor/workshops/` - Get contractor's workshops
- `POST /api/v1/contractor/workshops/create/` - Create new workshop

## Database Models

### Role System
- `Role` - Defines available roles
- `UserRole` - Many-to-many relationship between users and roles
- `ContractorService` - Links contractors to services they provide
- `Workshop` - Workshop information for contractors

### Proposal System
- `Quote` - Contractor proposals for order items
- `OrderItem` - Individual items in orders that can be assigned to contractors

## Setup Instructions

1. Run database migrations:
   ```bash
   cd backend
   python manage.py migrate
   ```

2. Set up roles:
   ```bash
   python setup_roles.py
   ```

3. Assign contractor role to users:
   ```bash
   python manage.py shell
   >>> from api.models import User, Role, UserRole
   >>> user = User.objects.get(username='contractor_username')
   >>> contractor_role = Role.objects.get(name='contractor')
   >>> UserRole.objects.create(user=user, role=contractor_role, is_active=True)
   ```

## Usage

### For Contractors
1. Login with contractor account
2. Access contractor dashboard at `/contractor-dashboard`
3. View available orders and submit proposals
4. Manage active projects and workshops
5. Track performance and ratings

### For Customers
1. Login with customer account
2. Access regular dashboard at `/dashboard`
3. Place orders and receive proposals
4. Accept/reject contractor proposals
5. Communicate with contractors for active projects

## Future Enhancements

- KYC (Know Your Customer) verification for contractors
- Advanced workshop management with equipment tracking
- Real-time messaging system between customers and contractors
- Advanced analytics and reporting for contractors
- Mobile app support
- Payment integration for contractor payments

## Technical Notes

- Role-based access control is implemented using React Router and custom hooks
- API endpoints include proper authentication and authorization
- Real-time data updates using React Query
- Responsive design with Tailwind CSS
- Persian (RTL) language support throughout the interface
