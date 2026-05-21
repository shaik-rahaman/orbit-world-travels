# Orbit World - Frontend

Enterprise travel operations platform frontend built with Next.js, TypeScript, and Tailwind CSS.

## Architecture

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **UI Icons**: Lucide React
- **HTTP Client**: Axios

### Project Structure

```
frontend/
├── app/                           # Next.js app directory
│   ├── auth/
│   │   └── login/page.tsx        # Login page
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard
│   ├── modules/                  # Feature modules
│   │   ├── invoice/page.tsx
│   │   ├── visa/page.tsx
│   │   ├── flight/page.tsx
│   │   ├── hotel/page.tsx
│   │   ├── insurance/page.tsx
│   │   ├── crm/page.tsx
│   │   └── reports/page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect
│   ├── providers.tsx             # React Query & Zustand setup
│   └── globals.css               # Global styles
├── components/
│   ├── shared/                   # Reusable components
│   │   ├── Table.tsx
│   │   └── index.tsx            # Button, Badge, Modal, Card, Input, Select, StatCard
│   ├── modules/                  # Feature-specific components
│   └── layout/
│       ├── Navigation.tsx        # Sidebar & Topbar
│       ├── DashboardLayout.tsx   # Main layout wrapper
│       └── Chatbot.tsx           # AI chatbot panel
├── services/
│   └── apiClient.ts              # Axios instance & API methods
├── store/
│   └── index.ts                  # Zustand stores (Auth, UI)
├── hooks/
│   └── useApi.ts                 # React Query hooks for all APIs
├── utils/
│   └── helpers.ts                # Utility functions
├── types/
│   └── index.ts                  # TypeScript interfaces
├── constants/
│   └── index.ts                  # App constants & config
├── .env.local                    # Local environment variables
├── package.json
└── tsconfig.json
```

## Features

### Authentication
- Email/password login
- JWT token management
- Automatic token refresh
- Role-based access (Admin/Staff)

### Dashboard
- KPI cards (Sales, Profit, Clients, Tasks)
- Recent activity feed
- Module summary statistics
- Quick navigation

### Modules

#### Visa Management
- List all visa applications
- Create new visa
- Track application status (Pending, Approved, Rejected)
- View margin calculations

#### Flight Management
- Manage flight bookings
- PNR tracking
- Passenger information
- Cost and pricing tracking

#### Hotel Management
- Hotel booking management
- Room type selection
- Guest information
- Pricing tracking

#### Insurance Management
- Policy management
- Coverage amount tracking
- Policy type selection
- Vendor cost management

#### CRM (Clients)
- Client database
- Contact information
- View client booking summary
- Create new clients

#### Invoice Management
- Create invoices from bookings
- Add multiple line items
- Auto-calculate margins
- Invoice status tracking

#### Reports & Analytics
- Sales trends
- Profit analysis
- Module distribution
- Performance metrics

### AI Chatbot
- Floating chat panel
- Query natural language
- Integrated with backend AI service
- Message history

### Shared Components
- **Table**: Sortable, paginated data display
- **Pagination**: Navigate through pages
- **Modal**: Reusable modal dialogs
- **Form Controls**: Input, Select, TextArea
- **Status Badge**: Visual status indicators
- **Cards**: Content containers
- **Buttons**: Multiple variants (Primary, Secondary, Danger)
- **StatCard**: KPI display cards

## Getting Started

### Installation

```bash
cd frontend
npm install --legacy-peer-deps
```

### Development

```bash
npm run dev
```

Opens http://localhost:3000

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/orbit-world
```

## API Integration

All API calls go through the centralized `apiClient.ts`:

```typescript
import { apiClient } from '@/services/apiClient';

// Visa
apiClient.getVisas(page, limit);
apiClient.createVisa(data);
apiClient.updateVisa(id, data);
apiClient.deleteVisa(id);

// Auth
apiClient.login(email, password);
apiClient.getCurrentUser();
```

## State Management

### Auth Store

```typescript
import { useAuthStore } from '@/store';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### UI Store

```typescript
import { useUIStore } from '@/store';

const { sidebarOpen, toggleSidebar } = useUIStore();
```

## Data Fetching with React Query

```typescript
import { useVisas } from '@/hooks/useApi';

const { data, isLoading, error } = useVisas(page, limit);
const { mutate: createVisa, isLoading: isCreating } = useCreateVisa();
```

## Styling

Tailwind CSS is used throughout. Key utilities:

```
Colors: bg-blue-600, text-gray-900
Spacing: px-6 py-4, mb-8
Responsive: md:, lg:
```

## Performance Optimizations

- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Query caching with React Query
- Memoization of components
- Lazy loading of routes

## Error Handling

- Automatic 401 handling (logout redirect)
- Toast-like error messages
- Form validation with Zod
- Network error fallbacks

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
```

### CORS errors
Check backend API URL in `.env.local`

### Auth token not persisting
Check localStorage in browser DevTools

## Future Enhancements

- [ ] Dark mode
- [ ] Multi-language support (i18n)
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] Export to PDF/Excel
- [ ] Real-time notifications
- [ ] Mobile app (React Native)

## Contributing

1. Create a new branch
2. Make changes
3. Submit PR

## License

Proprietary - Orbit World
