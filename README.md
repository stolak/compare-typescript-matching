# Record Matching API

API for matching bank records using semantic similarity. Returns three scenarios: matched records, unmatched records from record1, and unmatched records from record2.

## Project Structure

```
project-root/
├── src/
│   ├── app.ts                # Main app bootstrap
│   ├── server.ts             # Start server
│   ├── config/
│   │   └── index.ts          # Environment variables, config logic
│   ├── routes/
│   │   ├── index.ts          # Combine all routes
│   │   └── matching.routes.ts
│   ├── controllers/
│   │   └── matching.controller.ts
│   ├── services/
│   │   ├── matching.service.ts
│   │   └── embeddings.service.ts
│   ├── utils/
│   │   ├── ApiError.ts       # Custom errors
│   │   ├── ApiResponse.ts    # Standard response
│   │   ├── extractNarration.ts
│   │   └── logger.ts         # Logger
│   ├── middleware/
│   │   ├── validate.ts       # Request validator
│   │   └── errorHandler.ts   # Global error handler
│   ├── docs/
│   │   └── swagger.ts        # Swagger configuration
│   └── types/
│       └── index.ts           # TypeScript types/interfaces
├── tsconfig.json
└── package.json
```

## Getting Started

### Installation

```bash
npm install
```

### Running the Server

```bash
npm run server
```

The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

### Available Endpoints

- **Health Check**: `GET http://localhost:30005/health`
- **Match Records**: `POST http://localhost:3005/api/match`
- **Swagger UI**: `http://localhost:3005/api-docs`

### Example Request

```bash
POST http://localhost:3005/api/match
Content-Type: application/json

{
  "record1": [
    {
      "itemid": "ae628341-e022-4d18-9d7b-a46d140a55e5",
      "details": "TRF FRM RCCG HOUSE OF OBEDEDOM PARISH II TO AKINBOBOLA STEPHEN OLAWOLE AT GTB - GTBank Plc Ref/Cheque No.: PSM00068676151167501249 Debits: 106,000.00",
      "amount": 106000
    }
  ],
  "record2": [
    {
      "itemid": "26cb0a06-6588-4c07-a8bb-79b6ae7f2654",
      "details": "Impress payable TO AKINBOBOLA STEPHEN OLAWOLE Debits: 106,000.00",
      "amount": 106000
    }
  ]
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "report": {
      "matched": [...],
      "unmatchedInRecord1": [...],
      "unmatchedInRecord2": [...]
    },
    "summary": {
      "totalRecord1": 1,
      "totalRecord2": 1,
      "matched": 1,
      "unmatchedInRecord1": 0,
      "unmatchedInRecord2": 0
    }
  },
  "message": "Matching completed successfully"
}
```

## Development

### Scripts

- `npm run server` - Start the development server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start the server (alias for `npm run server`)

### Environment Variables

- `PORT` - Server port (default: 3005)
- `NODE_ENV` - Environment mode (development/production)

## API Documentation

Swagger documentation is available at `/api-docs` when the server is running.
