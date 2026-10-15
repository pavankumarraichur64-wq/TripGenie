# TripGenie — REST API Specification

All routes are versioned under the `/api/v1` prefix. Interactive OpenAPI documentation is available live at `http://localhost:8000/docs`.

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new account and return JWT | No |
| `POST` | `/api/v1/auth/login` | Login with email & password, return JWT | No |
| `GET` | `/api/v1/auth/me` | Fetch current user profile | Bearer Token |

### AI Itinerary & Trips
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/trips/generate` | Generate day-wise plan with Groq LLaMA 3.1 & caching | Bearer Token |
| `GET` | `/api/v1/trips` | List all saved trips for current user | Bearer Token |
| `GET` | `/api/v1/trips/{id}` | Get full trip details with days & activities | Bearer Token |
| `DELETE` | `/api/v1/trips/{id}` | Delete a trip | Bearer Token |
| `POST` | `/api/v1/trips/{id}/regenerate-day/{n}` | Regenerate a specific day's activities with AI | Bearer Token |
| `GET` | `/api/v1/trips/{id}/export` | Download styled PDF itinerary (ReportLab) | Bearer Token |

### Destinations, Hotels & Flights
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/destinations` | List destinations for autocomplete/search | No |
| `GET` | `/api/v1/hotels` | Filter hotels by destination, price, stars | No |
| `GET` | `/api/v1/hotels/{id}` | Single hotel details | No |
| `GET` | `/api/v1/flights` | Filter flights by route, date, class, price | No |

### Bookings
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/bookings` | Create reservation (`TG-YYYYMMDD-XXXX`) | Bearer Token |
| `GET` | `/api/v1/bookings` | List user's booking history | Bearer Token |
| `GET` | `/api/v1/bookings/{id}` | Get single booking receipt | Bearer Token |

### AI Trip Assistant Chat
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/trips/{id}/chat` | Retrieve chat history for trip | Bearer Token |
| `POST` | `/api/v1/trips/{id}/chat` | Send question or adjustment request to AI assistant | Bearer Token |

### Admin
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/stats` | Platform metrics (users, trips, revenue) | Admin Token |
| `GET` | `/api/v1/admin/bookings` | View all system reservations | Admin Token |
